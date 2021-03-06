import * as React from 'react';
import { FormEvent, useState } from 'react';
import './SignupPopup.scss';
import { Box, Link, Popup, popupController } from '@bit/redsky.framework.rs.996';
import Label from '@bit/redsky.framework.rs.label/dist/Label';
import Paper from '../../components/paper/Paper';
import Icon from '@bit/redsky.framework.rs.icon';
import { RsFormControl, RsFormGroup, RsValidator, RsValidatorEnum } from '@bit/redsky.framework.rs.form';
import { PopupProps } from '@bit/redsky.framework.rs.996/dist/popup/Popup';
import LabelInput from '../../components/labelInput/LabelInput';
import LabelCheckbox from '../../components/labelCheckbox/LabelCheckbox';
import { WebUtils } from '../../utils/utils';
import serviceFactory from '../../services/serviceFactory';
import UserService from '../../services/user/user.service';
import SigninPopup, { SigninPopupProps } from '../signin/SigninPopup';
import { rsToastify } from '@bit/redsky.framework.rs.toastify';
import SpinningLoaderPopup, { SpinningLoaderPopupProps } from '../spinningLoaderPopup/SpinningLoaderPopup';
import useWindowResizeChange from '../../customHooks/useWindowResizeChange';
import LabelButton from '../../components/labelButton/LabelButton';

interface ISignUpForm extends Api.User.Req.Create {
	confirmPassword?: string;
}

export interface SignupPopupProps extends PopupProps {
	primaryEmail?: string;
	password?: string;
}

const SignupPopup: React.FC<SignupPopupProps> = (props) => {
	const userService = serviceFactory.get<UserService>('UserService');
	const size = useWindowResizeChange();
	const [hasAgreedToTerms, setHasAgreedToTerms] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [signUpForm, setSignUpForm] = useState<RsFormGroup>(
		new RsFormGroup([
			new RsFormControl('firstName', '', [new RsValidator(RsValidatorEnum.REQ, 'First name is required')]),
			new RsFormControl('lastName', '', [new RsValidator(RsValidatorEnum.REQ, 'Last name is required')]),
			new RsFormControl('primaryEmail', props.primaryEmail || '', [
				new RsValidator(RsValidatorEnum.REQ, 'Email Required'),
				new RsValidator(RsValidatorEnum.EMAIL, 'Invalid email')
			]),
			new RsFormControl('password', props.password || '', [
				new RsValidator(RsValidatorEnum.REQ, 'Please provide a password'),
				new RsValidator(
					RsValidatorEnum.CUSTOM,
					'Need 8 characters, 1 special character or number and a capital',
					(control) => {
						return /(?=(.*[0-9])+|(.*[ !\"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~])+)(?=(.*[a-z])+)(?=(.*[A-Z])+)[0-9a-zA-Z !\"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~]{8,}/g.test(
							control.value.toString()
						);
					}
				),
				new RsValidator(RsValidatorEnum.CUSTOM, 'Password must not be password', (control) => {
					return control.value.toString() !== 'password';
				})
			]),
			new RsFormControl('confirmPassword', '', [
				new RsValidator(RsValidatorEnum.REQ, 'Please retype your new password'),
				new RsValidator(RsValidatorEnum.CUSTOM, 'Password does not match', (control): boolean => {
					return control.value.toString() === signUpForm.get('password').value.toString();
				})
			])
		])
	);

	function updateForm(control: RsFormControl) {
		setSignUpForm(signUpForm.clone().update(control));
		if (errorMessage !== '') {
			setErrorMessage('');
		}
	}

	async function signUp(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!(await signUpForm.isValid())) {
			setSignUpForm(signUpForm.clone());
			setErrorMessage('Missing information');
			return;
		}
		let createUserModel: ISignUpForm = signUpForm.toModel();
		delete createUserModel.confirmPassword;
		try {
			popupController.open(SpinningLoaderPopup);
			await userService.createNewUser(createUserModel);
			rsToastify.success('Account created successfully', 'Success!');
			popupController.close(SignupPopup);
			popupController.close(SpinningLoaderPopup);
			popupController.open(SigninPopup);
		} catch (e) {
			popupController.close(SpinningLoaderPopup);
			setErrorMessage(WebUtils.getRsErrorMessage(e, 'Unexpected Server error'));
		}
	}

	return (
		<Popup opened={props.opened} preventCloseByBackgroundClick>
			<Paper className={'rsSignupPopup'} position={'relative'}>
				<form onSubmit={signUp}>
					<Icon
						iconImg={'icon-close'}
						onClick={() => {
							popupController.close(SignupPopup);
						}}
						size={14}
						cursorPointer
					/>
					<Label variant={'body1'}>Sign up</Label>
					<hr className={'linethrough'} />
					<Box
						display={'flex'}
						flexDirection={size === 'small' ? 'column' : 'row'}
						gap={size === 'small' ? 0 : 36}
						paddingTop={'30px'}
					>
						<LabelInput
							title={'First name'}
							inputType={'text'}
							control={signUpForm.get('firstName')}
							updateControl={updateForm}
						/>
						<LabelInput
							title={'Last name'}
							inputType={'text'}
							control={signUpForm.get('lastName')}
							updateControl={updateForm}
						/>
					</Box>
					<LabelInput
						title={'Email Address'}
						inputType={'email'}
						control={signUpForm.get('primaryEmail')}
						updateControl={updateForm}
					/>
					<Box
						display={'flex'}
						flexDirection={size === 'small' ? 'column' : 'row'}
						gap={size === 'small' ? 0 : 36}
					>
						<LabelInput
							title={'Create new password'}
							inputType={'password'}
							control={signUpForm.get('password')}
							updateControl={updateForm}
						/>
						<LabelInput
							title={'Confirm new password'}
							inputType={'password'}
							control={signUpForm.get('confirmPassword')}
							updateControl={updateForm}
						/>
					</Box>
					<LabelCheckbox
						value={1}
						text={
							<>
								I agree to the{' '}
								<Link path={`/legal/terms-and-conditions`} external target={'blank'}>
									<span>terms and conditions</span>.
								</Link>
							</>
						}
						onSelect={() => {
							setHasAgreedToTerms(true);
						}}
						onDeselect={() => {
							setHasAgreedToTerms(false);
						}}
						isChecked={hasAgreedToTerms}
					/>
					<LabelButton
						look={hasAgreedToTerms ? 'containedPrimary' : 'containedSecondary'}
						disabled={!hasAgreedToTerms}
						label={'Sign up'}
						variant={'button'}
						buttonType={'submit'}
					/>
				</form>
				<Label variant={'body2'} color={'red'}>
					{errorMessage}
				</Label>
				<hr />
				<Label variant={'body2'}>
					Already a member?{' '}
					<LabelButton
						className={'loginButton'}
						look={'none'}
						onClick={() => {
							popupController.close(SignupPopup);
							popupController.open<SigninPopupProps>(SigninPopup, {});
						}}
						label={'login'}
						variant={'button'}
					/>{' '}
					here
				</Label>
			</Paper>
		</Popup>
	);
};

export default SignupPopup;
