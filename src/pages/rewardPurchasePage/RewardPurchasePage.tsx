import React, { useEffect, useState } from 'react';
import './RewardPurchasePage.scss';
import { Page } from '@bit/redsky.framework.rs.996';
import serviceFactory from '../../services/serviceFactory';
import RewardHeaderBar from '../../components/rewardHeaderBar/RewardHeaderBar';
import Label from '@bit/redsky.framework.rs.label/dist/Label';
import Paper from '../../components/paper/Paper';
import Box from '@bit/redsky.framework.rs.996/dist/box/Box';
import LabelButton from '../../components/labelButton/LabelButton';
import LabelLink from '../../components/labelLink/LabelLink';
import { FooterLinks } from '../../components/footer/FooterLinks';
import Footer from '../../components/footer/Footer';
import RewardService from '../../services/reward/reward.service';
import router from '../../utils/router';
import LoadingPage from '../loadingPage/LoadingPage';
import { WebUtils, StringUtils } from '../../utils/utils';
import { useRecoilValue } from 'recoil';
import { rsToastify } from '@bit/redsky.framework.rs.toastify';
import globalState from '../../state/globalState';
import Carousel from '../../components/carousel/Carousel';
import Img from '@bit/redsky.framework.rs.img';

const RewardPurchasePage: React.FC = () => {
	const rewardService = serviceFactory.get<RewardService>('RewardService');
	const user = useRecoilValue<Api.User.Res.Detail | undefined>(globalState.user);
	const [reward, setReward] = useState<Api.Reward.Res.Get>();
	const [termsAndConditionsIsChecked, setTermsAndConditionsIsChecked] = useState<boolean>(true);
	const params = router.getPageUrlParams<{ reward: number; voucherCode: string }>([
		{ key: 'ri', default: '', type: 'string', alias: 'reward' },
		{ key: 'vc', default: '', type: 'string', alias: 'voucherCode' }
	]);
	const [hasEnoughPoints, setHasEnoughPoints] = useState<boolean>(false);

	useEffect(() => {
		async function getRewardDetails() {
			if (!params.reward) {
				router.navigate('/reward').catch(console.error);
			}
			try {
				let res = await rewardService.getRewardById(Number(params.reward));
				setReward(res);
			} catch (e) {
				rsToastify.error(WebUtils.getRsErrorMessage(e, 'Reward item no longer exists.'), 'Server Error');
			}
		}
		getRewardDetails().catch(console.error);
	}, []);

	useEffect(() => {
		if (user && reward) {
			setHasEnoughPoints(user.availablePoints - reward.pointCost > 0);
		}
	}, [reward, user]);

	async function claimRewardVoucher() {
		if (!termsAndConditionsIsChecked) {
			rsToastify.error('You must agree to the terms and conditions.', 'Missing Information!');
			return;
		}
		try {
			await rewardService.claimRewardVoucher({ rewardId: Number(params.reward), code: params.voucherCode });
			rsToastify.success('You have claimed your voucher', 'Success!');
			router.navigate(`/reward/confirm?ri=${params.reward}&vc=${params.voucherCode}`).catch(console.error);
		} catch (e) {
			rsToastify.error(WebUtils.getRsErrorMessage(e, 'Unable to claim reward.'), 'Server Error');
		}
	}

	function renderPictures(): JSX.Element[] {
		if (!reward) return [];
		let media = reward.media;
		media.sort((img1, img2) => img2.isPrimary - img1.isPrimary);
		return media.map((newMedia: Api.Media) => {
			return (
				<Box className={'imageWrapper'}>
					<Img src={newMedia.urls.imageKit} alt={'reward item'} width={1060} height={900} />
				</Box>
			);
		});
	}

	return !reward ? (
		<LoadingPage />
	) : (
		<Page className={'rsRewardPurchasePage'}>
			<div className={'rs-page-content-wrapper'}>
				<div className={'headerBarPageContainer'}>
					<RewardHeaderBar className={'rewardPurchaseHeader'} title={'Order Summary'} titleVariant={'h2'} />
				</div>
				<div className={'mainContentContainer'}>
					<div className={'rewardDetailsContainer'}>
						<div className={'rewardDetailsTitle'}>
							<Label className={'imageColumn'} variant={'body1'}>
								Image
							</Label>
							<Label className={'RewardColumn'} variant={'body1'}>
								Reward
							</Label>
						</div>
						<div className={'reward'}>
							<div className={'carouselContainer'}>
								<Carousel children={renderPictures()} showControls={reward.media.length > 1} />
							</div>
							<div className={'rewardText'}>
								<div className={'rewardName'}>
									<Label className={'name'} variant={'h3'}>
										{reward.name}
									</Label>
									<Label className={'description'} variant={'body1'}>
										{reward.description}
									</Label>
									<Label className={'number'} variant={'body1'}>
										Item # {reward.upc}
									</Label>
								</div>
							</div>
						</div>
					</div>
					<div className={'purchaseDetails'}>
						<Paper className={'rewardPurchasePaper'} width={'278px'} backgroundColor={'#fcfbf8'} boxShadow>
							<div className={'totalPurchaseCost'}>
								<Label className={'totalCostLabel'} variant={'h4'}>
									Total Cost
								</Label>
								<div className={'pointNumberAndLabel'}>
									<Label className={'pointNumberLabel'} variant={'h1'}>
										{StringUtils.addCommasToNumber(reward.pointCost)}
									</Label>
									<Label className={'pointsLabel'} variant={'h2'}>
										points
									</Label>
								</div>
								<div className={'checkboxDiv'}>
									<label className={'checkboxContainer'}>
										<input
											className={'checkboxInput'}
											value={'termsAndConditions'}
											type={'checkbox'}
											onChange={() => {
												setTermsAndConditionsIsChecked(!termsAndConditionsIsChecked);
											}}
											checked={termsAndConditionsIsChecked}
										/>
										<span className={'checkbox'}>
											<Box />
										</span>
									</label>
									<Label className={'termsAndConditionLabel'} variant={'body1'}>
										I agree to the&nbsp;
										<a className={'termsLink'} href={'/'}>
											terms
										</a>
										&nbsp; and&nbsp;
										<a className={'conditionsLink'} href={'/'}>
											conditions
										</a>
									</Label>
								</div>
							</div>
							<div className={'pointsAfterPurchase'}>
								<Label className={'pointsAfterPurchaseLabel'} variant={'body1'}>
									Point total after purchase:{' '}
									{StringUtils.addCommasToNumber(
										(user ? user.availablePoints : 0) - reward.pointCost
									)}
								</Label>
							</div>
						</Paper>
						<div className={'placeOrderButtonContainer'}>
							<LabelButton
								className={'placeOrderButton'}
								look={hasEnoughPoints ? 'containedPrimary' : 'containedSecondary'}
								disabled={!hasEnoughPoints}
								variant={'button'}
								label={'Place Order'}
								onClick={claimRewardVoucher}
							/>
						</div>
						<Box className={'policyContainer'} display={'flex'} alignItems={'center'}>
							{/*TODO put back in when we have a place to link to*/}
							{/*<LabelLink*/}
							{/*	className={'returnPolicyLink'}*/}
							{/*	path={'/'}*/}
							{/*	label={'Return Policy'}*/}
							{/*	variant={'body2'}*/}
							{/*/>*/}
							<LabelLink
								className={'privacyPolicyLink'}
								path={'/legal/privacy'}
								label={'Privacy Policy'}
								variant={'body2'}
							/>
						</Box>
					</div>
				</div>
				<Footer links={FooterLinks} />
			</div>
		</Page>
	);
};

export default RewardPurchasePage;
