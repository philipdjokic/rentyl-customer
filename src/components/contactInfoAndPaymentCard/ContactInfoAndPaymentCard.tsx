import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import './ContactInfoAndPaymentCard.scss';
import Label from '@bit/redsky.framework.rs.label';
import { Box, Link } from '@bit/redsky.framework.rs.996';
import LabelInput from '../labelInput/LabelInput';
import Paper from '../paper/Paper';
import { RsFormControl, RsFormGroup, RsValidator, RsValidatorEnum } from '@bit/redsky.framework.rs.form';
import { useRecoilValue } from 'recoil';
import globalState from '../../state/globalState';
import serviceFactory from '../../services/serviceFactory';
import PaymentService from '../../services/payment/payment.service';
import LabelCheckbox from '../labelCheckbox/LabelCheckbox';
import Select, { SelectOptions } from '../Select/Select';
import debounce from 'lodash.debounce';
import popupController from '@bit/redsky.framework.rs.996/dist/popupController';
import { rsToastify } from '@bit/redsky.framework.rs.toastify';

type CreditCardForm = { full_name: string; expDate: string };
interface ContactInfoForm extends Api.Reservation.Guest {
	details?: string;
}

interface ContactInfo extends ContactInfoForm {
	phone: string;
}
interface ContactInfoAndPaymentCardProps {
	onContactChange: (value: ContactInfo) => void;
	onCreditCardChange: (value: CreditCardForm) => void;
	onExistingCardSelect?: (value: number) => void;
	isValidForm: (isValid: boolean) => void;
	isAuthorized: (isAuthorized: boolean) => void;
	existingCardId?: number;
	contactInfo?: Api.Reservation.Guest;
	usePoints: boolean;
	setUsePoints: (value: boolean) => void;
}

let phoneNumber = '';

const ContactInfoAndPaymentCard: React.FC<ContactInfoAndPaymentCardProps> = (props) => {
	const numberRef = useRef<HTMLElement>(null);
	const cvvRef = useRef<HTMLElement>(null);
	const user = useRecoilValue<Api.User.Res.Get | undefined>(globalState.user);
	const company = useRecoilValue<Api.Company.Res.GetCompanyAndClientVariables>(globalState.company);
	const paymentService = serviceFactory.get<PaymentService>('PaymentService');
	const [isValidCard, setIsValidCard] = useState<boolean>(false);
	const [isValidCvv, setIsValidCvv] = useState<boolean>(false);
	const [isValid, setIsValid] = useState<boolean>(false);
	const [existingCardId, setExistingCardId] = useState<number>(props.existingCardId || 0);
	const [useExistingCreditCard, setUseExistingCreditCard] = useState<boolean>(
		props.existingCardId ? props.existingCardId > 0 : false
	);
	const [creditCardObj, setCreditCardObj] = useState<RsFormGroup>(
		new RsFormGroup([
			new RsFormControl('full_name', '', [new RsValidator(RsValidatorEnum.REQ, 'Full name is required')]),
			new RsFormControl('expDate', '', [
				new RsValidator(RsValidatorEnum.REQ, 'Expiration required'),
				new RsValidator(RsValidatorEnum.MIN, 'Expiration too short', 7),
				new RsValidator(RsValidatorEnum.MAX, 'Expiration too long', 7),
				new RsValidator(RsValidatorEnum.CUSTOM, 'Invalid Expiration Date', (control) => {
					let month = parseInt(control.value.toString().slice(0, 2));
					let year = parseInt(control.value.toString().slice(3, 7));
					let currentYear = new Date().getFullYear();
					let currentMonth = new Date().getMonth() + 1;
					if (month > 12) return false;
					if (year === currentYear) return month >= currentMonth;
					else return year > currentYear;
				})
			])
		])
	);
	const [contactInfoForm, setContactInfoForm] = useState<RsFormGroup>(
		new RsFormGroup([
			new RsFormControl('firstName', props.contactInfo?.firstName || user?.firstName || '', [
				new RsValidator(RsValidatorEnum.REQ, 'First name is required')
			]),
			new RsFormControl('lastName', props.contactInfo?.lastName || user?.lastName || '', [
				new RsValidator(RsValidatorEnum.REQ, 'Last name is required')
			]),
			new RsFormControl('email', props.contactInfo?.email || user?.primaryEmail || '', [
				new RsValidator(RsValidatorEnum.EMAIL, 'Enter a valid Email')
			]),
			new RsFormControl('details', '', [
				new RsValidator(RsValidatorEnum.MAX, 'Must be less than 500 characters', 500)
			])
		])
	);

	useEffect(() => {
		if (!user) return;
		phoneNumber = props.contactInfo?.phone || user.phone;
	}, [user]);

	useEffect(() => {
		props.isValidForm(isValid || !!existingCardId);
	}, [isValid, existingCardId]);

	useEffect(() => {
		if (props.usePoints) return;
		async function init() {
			const gatewayDetails: Api.Payment.Res.PublicData = await paymentService.getGateway();
			window.Spreedly.init(gatewayDetails.publicData.token, {
				numberEl: 'spreedly-number',
				cvvEl: 'spreedly-cvv'
			});
		}
		init().catch(console.error);
	}, [props.usePoints]);

	useEffect(() => {
		let readyId = paymentService.subscribeToSpreedlyReady(() => {
			window.Spreedly.setStyle(
				'number',
				'width:200px;font-size: 16px;height: 40px;padding: 0 10px;box-sizing: border-box;border-radius: 0;border: 1px solid #dedede; color: #001933; background-color: #ffffff; transition: border-color 300ms; '
			);
			window.Spreedly.setStyle(
				'cvv',
				'width:200px;font-size: 16px;height: 40px;padding: 0 10px;box-sizing: border-box;border-radius: 0;border: 1px solid #dedede; color: #001933; background-color: #ffffff; text-align: center; transition: border-color 300ms; '
			);
			window.Spreedly.setFieldType('number', 'text');
			window.Spreedly.setNumberFormat('prettyFormat');
		});

		let fieldEventId = paymentService.subscribeToSpreedlyFieldEvent(
			(
				name: 'number' | 'cvv',
				type: 'focus' | 'blur' | 'mouseover' | 'mouseout' | 'input' | 'enter' | 'escape' | 'tab' | 'shiftTab',
				activeEl: 'number' | 'cvv',
				inputProperties: {
					cardType?: string;
					validNumber?: boolean;
					validCvv?: boolean;
					numberLength?: number;
					cvvLength?: number;
				}
			) => {
				if (name === 'number') {
					if (type === 'focus') {
						window.Spreedly.setStyle('number', 'border: 1px solid #004b98;');
					}
					if (type === 'blur') {
						window.Spreedly.setStyle('number', 'border: 1px solid #dedede;');
					}
					if (type === 'mouseover') {
						window.Spreedly.setStyle('number', 'border: 1px solid #004b98;');
					}
					if (type === 'mouseout') {
						window.Spreedly.setStyle('number', 'border: 1px solid #dedede;');
					}

					if (type === 'input' && !inputProperties.validNumber) {
						setIsValidCard(false);
						debounceCvvCardError('Number');
					} else if (type === 'input' && inputProperties.validNumber) {
						setIsValidCard(true);
						debounceCvvCardSuccess('Number');
					}
				}
				if (name === 'cvv') {
					if (type === 'focus') {
						window.Spreedly.setStyle('cvv', 'border: 1px solid #004b98;');
					}
					if (type === 'blur') {
						window.Spreedly.setStyle('cvv', 'border: 1px solid #dedede;');
					}
					if (type === 'mouseover') {
						window.Spreedly.setStyle('cvv', 'border: 1px solid #004b98;');
					}
					if (type === 'mouseout') {
						window.Spreedly.setStyle('cvv', 'border: 1px solid #dedede;');
					}
					if (type === 'input' && !inputProperties.validCvv) {
						setIsValidCvv(false);
						debounceCvvCardError('Cvv');
					} else if (type === 'input' && inputProperties.validCvv) {
						setIsValidCvv(true);
						debounceCvvCardSuccess('Cvv');
					}
				}
			}
		);

		// Error response codes
		// https://docs.spreedly.com/reference/api/v1/#response-codes
		let errorId = paymentService.subscribeToSpreedlyError((errorMsg) => {
			let errorMessages = errorMsg.map((item) => {
				return item.message;
			});
			popupController.closeAll();
			return rsToastify.error(errorMessages.join(' '), "Can't Contact Payment Provider");
		});

		return () => {
			paymentService.unsubscribeToSpreedlyError(errorId);
			paymentService.unsubscribeToSpreedlyReady(readyId);
			paymentService.unsubscribeToSpreedlyFieldEvent(fieldEventId);
		};
	}, []);

	let debounceCvvCardError = debounce(async (element: 'Number' | 'Cvv') => {
		let htmlBlock: HTMLElement | null = document.querySelector(`#${element}`);
		if (!!htmlBlock) htmlBlock.style.color = 'red';
	}, 1000);
	let debounceCvvCardSuccess = debounce(async (element: 'Number' | 'Cvv') => {
		let htmlBlock: HTMLElement | null = document.querySelector(`#${element}`);
		if (!!htmlBlock) htmlBlock.style.color = '#001933';
	}, 1000);

	async function updateCreditCardObj(control: RsFormControl) {
		if (
			control.key === 'expDate' &&
			!control.value.toString().includes('/') &&
			control.value.toString().length === 4
		) {
			control.value = control.value.toString().slice(0, 2) + '/' + control.value.toString().slice(2, 4);
		}
		creditCardObj.update(control);
		let isFormValid = await creditCardObj.isValid();
		props.onCreditCardChange(creditCardObj.toModel());
		setIsValid(isFormFilledOut() && isFormValid);
		setCreditCardObj(creditCardObj.clone());
	}

	async function updateContactInfoForm(control: RsFormControl) {
		contactInfoForm.update(control);
		let isFormValid = await contactInfoForm.isValid();
		props.onContactChange({ ...contactInfoForm.toModel(), phone: phoneNumber });
		setIsValid(isFormFilledOut() && isFormValid);
		setContactInfoForm(contactInfoForm.clone());
	}

	function isFormFilledOut(): boolean {
		return (
			!!contactInfoForm.get('firstName').value.toString().length &&
			!!contactInfoForm.get('lastName').value.toString().length &&
			!!creditCardObj.get('full_name').value.toString().length &&
			!!creditCardObj.get('expDate').value.toString().length &&
			!!phoneNumber.length
		);
	}

	function renderSelectOptions(): SelectOptions[] {
		if (!user)
			return [
				{
					selected: false,
					text: 'No Saved Card',
					value: 0
				}
			];

		return user.paymentMethods.map((item) => {
			return {
				selected: item.id === existingCardId,
				text: `Exp: ${item.expirationMonth}/${item.expirationYear} | ${item.cardNumber}`,
				value: item.id
			};
		});
	}

	return (
		<Paper className={'rsContactInfoAndPaymentCard'} borderRadius={'4px'} boxShadow padding={'16px'}>
			<Label variant={'h2'} marginBottom={'10px'}>
				Contact Info
			</Label>
			<Box className={'contactInfo'} display={'grid'}>
				<LabelInput
					title={'First Name'}
					inputType={'text'}
					control={contactInfoForm.get('firstName')}
					updateControl={updateContactInfoForm}
				/>
				<LabelInput
					title={'Last Name'}
					inputType={'text'}
					control={contactInfoForm.get('lastName')}
					updateControl={updateContactInfoForm}
				/>
				<LabelInput
					title={'Email'}
					inputType={'text'}
					control={contactInfoForm.get('email')}
					updateControl={updateContactInfoForm}
				/>
				<LabelInput
					inputType={'tel'}
					title={'Phone'}
					isPhoneInput
					onChange={(value) => {
						phoneNumber = value;
						props.onContactChange({ ...contactInfoForm.toModel<ContactInfoForm>(), phone: phoneNumber });
					}}
					initialValue={user?.phone}
				/>
			</Box>
			<hr />
			<Label variant={'h2'} marginBottom={'10px'}>
				Additional Details and Preferences
			</Label>
			<LabelInput
				title={''}
				inputType={'textarea'}
				control={contactInfoForm.get('details')}
				updateControl={updateContactInfoForm}
			/>
			<hr />

			<form id={'payment-form'} action={'/card-payment'}>
				<Box display={'flex'}>
					<Label variant={'h2'} mb={'10px'}>
						Payment Information
					</Label>
					<LabelCheckbox
						className={'useExistingCreditCard'}
						value={1}
						text={'Use Credit Card on file'}
						onSelect={() => {
							setUseExistingCreditCard(true);
							props.setUsePoints(false);
						}}
						onDeselect={() => {
							setExistingCardId(0);
							setUseExistingCreditCard(false);
							if (props.onExistingCardSelect) props.onExistingCardSelect(0);
						}}
						isChecked={useExistingCreditCard}
					/>
					{!!company.allowPointBooking && (
						<LabelCheckbox
							value={props.usePoints ? 1 : 0}
							text={'Use Points'}
							onSelect={() => {
								props.setUsePoints(true);
								setUseExistingCreditCard(false);
								if (props.onExistingCardSelect) props.onExistingCardSelect(0);
							}}
							onDeselect={() => props.setUsePoints(false)}
							isChecked={props.usePoints}
						/>
					)}
				</Box>
				{company.allowCashBooking && !props.usePoints && (
					<>
						<Select
							className={!useExistingCreditCard ? 'hide' : ''}
							autoCalculateWidth
							options={renderSelectOptions()}
							placeHolder={'Please Select A Card'}
							showSelectedAsPlaceHolder
							onChange={(value) => {
								if (typeof value === 'number') {
									setExistingCardId(value);
									if (props.onExistingCardSelect) props.onExistingCardSelect(value);
								} else if (value === null) {
									setExistingCardId(0);
									if (props.onExistingCardSelect) props.onExistingCardSelect(0);
								}
							}}
						/>
						<Box className={'creditCardInfo'} display={useExistingCreditCard ? 'none' : 'grid'}>
							<LabelInput
								title={'Name on Card'}
								inputType={'text'}
								control={creditCardObj.get('full_name')}
								updateControl={updateCreditCardObj}
							/>
							<div ref={numberRef} id={'spreedly-number'}>
								<Label id={'Number'} variant={'caption'} mb={10}>
									Credit Card
								</Label>
							</div>
							<div ref={cvvRef} id={'spreedly-cvv'}>
								<Label id={'Cvv'} variant={'caption'} mb={10}>
									CVV
								</Label>
							</div>
							<LabelInput
								className={'creditCardExpInput'}
								maxLength={7}
								title={'Expiration Date'}
								inputType={'text'}
								control={creditCardObj.get('expDate')}
								updateControl={updateCreditCardObj}
								placeholder={'MM/YYYY'}
							/>
						</Box>
						<LabelCheckbox
							value={1}
							text={
								<>
									* By checking this box, you authorize your credit card network to monitor and share
									transaction data with Fidel (our service provider) to earn points for your offline
									purchases. You also acknowledge and agree that Fidel may share certain details of
									your qualifying transactions with Spire Loyalty in accordance with the{' '}
									<Link path={`/legal/terms-and-conditions`} external target={'blank'}>
										<span>Terms and Conditions</span>
									</Link>
									,{' '}
									<Link path={'/legal/privacy'} external target={'blank'}>
										<span>Privacy Policy</span>
									</Link>{' '}
									and{' '}
									<Link path={'https://fidel.uk/legal/privacy/'} external target={'blank'}>
										<span>Fidel Privacy Policy</span>
									</Link>{' '}
									You may opt-out of this optional service at any time by removing this card from your
									Spire Loyalty account.
								</>
							}
							isChecked={false}
							onSelect={() => {
								props.isAuthorized(true);
							}}
							onDeselect={() => {
								props.isAuthorized(false);
							}}
						/>
					</>
				)}
			</form>
		</Paper>
	);
};

export default ContactInfoAndPaymentCard;
