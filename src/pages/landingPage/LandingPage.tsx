import * as React from 'react';
import './LandingPage.scss';
import { Page } from '@bit/redsky.framework.rs.996';
import Box from '../../components/box/Box';
import Label from '@bit/redsky.framework.rs.label';
import LabelButton from '../../components/labelButton/LabelButton';
import InfoCard from '../../components/infoCard/InfoCard';
import FeaturedRewardCard from '../../components/featuredRewardCard/FeaturedRewardCard';
import Paper from '../../components/paper/Paper';

import { useEffect, useState } from 'react';
import CarouselButtons from '../../components/carouselButtons/CarouselButtons';
import FeaturedDestinationCard from '../../components/featuredDestinationCard/FeaturedDestinationCard';
import useWindowResizeChange from '../../customHooks/useWindowResizeChange';
import { replaceClassName } from '../../utils/utils';
import Carousel from '../../components/carousel/Carousel';
import Select from '@bit/redsky.framework.rs.select';

interface LandingPageProps {}

const LandingPage: React.FC<LandingPageProps> = (props) => {
	const [activeRewards, setActiveRewards] = useState<number>(0);
	const size = useWindowResizeChange();

	function getActiveRewardsStage() {
		if (activeRewards === 1) return 'stageOne';
		else if (activeRewards === 2) return 'stageTwo';
		else return '';
	}

	return (
		<Page className={'rsLandingPage'}>
			<div className={'rs-page-content-wrapper'}>
				<div className={'tanBox'} />
				<Box
					className={'heroImgAndText'}
					display={'flex'}
					alignItems={'center'}
					marginBottom={size === 'small' ? 366 : 135}
				>
					<Box>
						<div className={'heroText'}>
							Rewarding the way you
							<br />
							<span>live, work, and play</span>
						</div>
						<LabelButton look={'containedPrimary'} variant={'button'} label={'Get Started'} />
					</Box>
					<Box className={'infoCardWrapper'} display={'flex'}>
						<InfoCard
							width={'367px'}
							height={'120px'}
							title={'Earn points'}
							body={'Earn points for more than spending money - your loyalty is your gain'}
							bodyVariant={'body2'}
							icon={'icon-piggy-bank'}
							boxShadow
						/>
						<InfoCard
							width={'367px'}
							height={'120px'}
							title={'Boost your experience'}
							body={'Spire Loyalty members have the chance to earn more by leveling up in our program'}
							bodyVariant={'body2'}
							icon={'icon-boost'}
							boxShadow
						/>
						<InfoCard
							width={'367px'}
							height={'120px'}
							title={'Redeem points'}
							body={'Redemption with Spire means flexible ways to redeem with our partners'}
							bodyVariant={'body2'}
							icon={'icon-gift'}
							boxShadow
						/>
					</Box>
				</Box>

				<Box className={'sectionOne'} marginBottom={size === 'small' ? 80 : 220}>
					<Label variant={size === 'small' ? 'h2' : 'h1'}>
						<span>Feature</span> Rewards
					</Label>
					<Box className={'featureRewardCardsContainer'}>
						{size === 'small' ? (
							<Carousel
								children={[
									<FeaturedRewardCard
										mainImg={require('../../images/landingPage/Margaritaville-Villa-Stay.png')}
										logoImg={''}
										title={'Margaritaville Villa Stay'}
									/>,
									<FeaturedRewardCard
										mainImg={require('../../images/landingPage/Margaritaville-Spa -Service.png')}
										logoImg={''}
										title={'Margaritaville Spa Service'}
									/>,
									<FeaturedRewardCard
										mainImg={require('../../images/landingPage/Margaritaville-Drinks-for-Two.png')}
										logoImg={''}
										title={'Margaritaville Drinks for Two'}
									/>
								]}
							/>
						) : (
							<>
								<FeaturedRewardCard
									mainImg={require('../../images/landingPage/Margaritaville-Villa-Stay.png')}
									logoImg={''}
									title={'Margaritaville Villa Stay'}
								/>
								<FeaturedRewardCard
									mainImg={require('../../images/landingPage/Margaritaville-Spa -Service.png')}
									logoImg={''}
									title={'Margaritaville Spa Service'}
								/>
								<FeaturedRewardCard
									mainImg={require('../../images/landingPage/Margaritaville-Drinks-for-Two.png')}
									logoImg={''}
									title={'Margaritaville Drinks for Two'}
								/>
							</>
						)}
					</Box>
					<LabelButton look={'containedPrimary'} variant={'button'} label={'See all rewards'} />
				</Box>

				<Box className={'sectionTwo'} marginBottom={146}>
					<div className={'coupleImg'} />
					<div className={'tanBox2'} />
					<Paper width={'524px'} height={'369px'} padding={'40px 50px'} boxShadow backgroundColor={'#FCFBF8'}>
						<Label variant={'caption'}>Vacation Stays and real estate</Label>
						<Label variant={size === 'small' ? 'h2' : 'h1'}>
							Turn your vacation <br />
							<span data-aos="fade-up">into your next home</span>
						</Label>
						<Label variant={'body2'}>
							With Spire Loyalty, you can earn points for home purchases, and utilize your points towards
							future home purchases. Your rent can help you earn Spire points to be used throughout our
							network, or you can utilize points to help with your rent and services. The expansive Spire
							Loyalty network of vacation properties allows you to use your Spire points on the perfect
							vacation.
						</Label>
						<LabelButton look={'containedPrimary'} variant={'button'} label={'Get started'} />
					</Paper>
				</Box>

				<Box className={'sectionThree'} marginBottom={110}>
					<Box maxWidth={'610px'} margin={'0 auto 25px'} textAlign={'center'}>
						<Label variant={'caption'}>Traveling with spire loyalty</Label>
						<Label variant={'h1'}>
							Gives you access to a <span data-aos="fade-up">myriad of rewards</span>
						</Label>
						<Label variant={'body1'}>
							With Spire you earn points for dollars spent within our network of vacation partners. Those
							points can be applied to discounts on home purchases with our partner builders.
						</Label>
					</Box>

					{size === 'small' ? (
						<Box className={'mobileImageStepperWrapper'}>
							<Carousel imageIndex={activeRewards}>
								<img
									src={require(`../../images/landingPage/travel2x.png`)}
									className={`${activeRewards === 0 ? 'selected' : ''}`}
									alt={''}
								/>
								<img
									src={require(`../../images/landingPage/real-estate2x.png`)}
									className={`${activeRewards === 1 ? 'selected' : ''}`}
									alt={''}
								/>
								<img
									src={require(`../../images/landingPage/hospitality2x.png`)}
									className={`${activeRewards === 2 ? 'selected' : ''}`}
									alt={''}
								/>
							</Carousel>

							<Paper
								className={'mobileImageStepper'}
								width={'313px'}
								height={'129px'}
								padding={'10px 20px'}
								boxShadow
								backgroundColor={'#FCFBF8'}
								position={'absolute'}
							>
								<InfoCard
									className={activeRewards <= 0 ? 'selected' : ''}
									padding={'0'}
									height={'80px'}
									width={'273px'}
									icon={'icon-map'}
									title={'Travel'}
									body={'Room bookings, upgrades, and perfect getaways.'}
								/>
								<InfoCard
									className={activeRewards === 1 ? 'selected' : ''}
									padding={'0'}
									height={'80px'}
									width={'273px'}
									icon={'icon-hand-shake'}
									title={'Real Estate'}
									body={'Future home purchases, vacation properties'}
								/>
								<InfoCard
									className={activeRewards === 2 ? 'selected' : ''}
									padding={'0'}
									height={'80px'}
									width={'273px'}
									icon={'icon-wine'}
									title={'Hospitality'}
									body={'Free meals and beverages, and exciting excursions'}
								/>
								<CarouselButtons
									position={'absolute'}
									bottom={'-20px'}
									left={'50px'}
									onClickRight={() => setActiveRewards((activeRewards + 1) % 3)}
									onClickLeft={() => setActiveRewards(!activeRewards ? 2 : activeRewards - 1)}
								/>
							</Paper>
						</Box>
					) : (
						<>
							<Box
								display={'flex'}
								justifyContent={'flex-start'}
								alignItems={'flex-end'}
								className={`imageContainer ${getActiveRewardsStage()}`}
							>
								<img
									src={require(`../../images/landingPage/${
										activeRewards === 0 ? 'travel2x' : 'travel'
									}.png`)}
									className={`${activeRewards === 0 ? 'selected' : ''}`}
									alt={''}
								/>
								<img
									src={require(`../../images/landingPage/${
										activeRewards === 1 ? 'real-estate2x' : 'real-estate'
									}.png`)}
									className={`${activeRewards === 1 ? 'selected' : ''}`}
									alt={''}
								/>
								<img
									src={require(`../../images/landingPage/${
										activeRewards === 2 ? 'hospitality2x' : 'hospitality'
									}.png`)}
									className={`${activeRewards === 2 ? 'selected' : ''}`}
									alt={''}
								/>
							</Box>
							<Paper
								className={'imageStepper'}
								width={'444px'}
								height={'320px'}
								padding={'10px 50px'}
								boxShadow
								backgroundColor={'#FCFBF8'}
								position={'absolute'}
							>
								<InfoCard
									className={activeRewards <= 0 ? 'selected' : ''}
									padding={'0'}
									height={'80px'}
									width={'100%'}
									icon={'icon-map'}
									title={'Travel'}
									body={'Room bookings, upgrades, and perfect getaways.'}
								/>
								<InfoCard
									className={activeRewards === 1 ? 'selected' : ''}
									padding={'0'}
									height={'80px'}
									width={'100%'}
									icon={'icon-hand-shake'}
									title={'Real Estate'}
									body={'Future home purchases, vacation properties'}
								/>
								<InfoCard
									className={activeRewards === 2 ? 'selected' : ''}
									padding={'0'}
									height={'80px'}
									width={'100%'}
									icon={'icon-wine'}
									title={'Hospitality'}
									body={'Free meals and beverages, and exciting excursions'}
								/>

								<CarouselButtons
									position={'absolute'}
									bottom={'-20px'}
									left={'50px'}
									onClickRight={() => setActiveRewards((activeRewards + 1) % 3)}
									onClickLeft={() => setActiveRewards(!activeRewards ? 2 : activeRewards - 1)}
								/>
							</Paper>{' '}
						</>
					)}

					{size !== 'small' && (
						<LabelButton
							look={'containedPrimary'}
							variant={'button'}
							label={'How spire loyalty benefits you'}
						/>
					)}
				</Box>

				<Box className={'sectionFour'} margin={'0 78px 170px'} width={'100%'} display={'flex'}>
					<img src={require('../../images/landingPage/coffee.png')} alt={'coffee guy'} />
					<Box display={'flex'} flexDirection={'column'} justifyContent={'center'}>
						<Label variant={size === 'small' ? 'h2' : 'h1'}>
							Earning points <span>every day</span>
						</Label>
						<Box display={'flex'} flexWrap={'wrap'}>
							<InfoCard
								icon={'icon-tea-cup'}
								body={
									'Purchasing your morning coffee with our partners earns you points with every sip.'
								}
								height={'92px'}
								width={'310px'}
								padding={'0 25px'}
								boxShadow
							/>
							<InfoCard
								icon={'icon-spa'}
								body={'Earn points for a massage or space service.'}
								height={'92px'}
								width={'310px'}
								padding={'0 25px'}
								boxShadow
							/>
							<InfoCard
								icon={'icon-food-plate'}
								body={'Dine with us during your stay and earn.'}
								height={'92px'}
								width={'310px'}
								padding={'0 25px'}
								boxShadow
							/>
							<InfoCard
								icon={'icon-social'}
								body={'Refer friends to Spire and increase your points balance and Spire status.'}
								height={'92px'}
								width={'310px'}
								padding={'0 25px'}
								boxShadow
							/>
						</Box>
						{size === 'small' && (
							<LabelButton
								look={'containedPrimary'}
								variant={'button'}
								label={'How spire loyalty benefits you'}
							/>
						)}
					</Box>
				</Box>
				<Box className={'sectionFive'}>
					<Label variant={size === 'small' ? 'h2' : 'h1'}>
						Create an <span>unforgettable experience</span>
					</Label>
					<Box
						bgcolor={'#f7f1db'}
						height={size === 'small' ? '347px' : '440px'}
						display={'flex'}
						justifyContent={'center'}
					>
						{size === 'small' ? (
							<Carousel>
								<FeaturedDestinationCard
									image={require('../../images/landingPage/Margaritaville-Villa-Stay2x.png')}
									name={'Orlando Disney Experience'}
									resortId={1}
								/>
								<FeaturedDestinationCard
									image={require('../../images/landingPage/Margaritaville-Villa-Stay2x.png')}
									name={'Island H20 Live! Water Park'}
									resortId={2}
								/>
							</Carousel>
						) : (
							<>
								<FeaturedDestinationCard
									image={require('../../images/landingPage/Margaritaville-Villa-Stay2x.png')}
									name={'Orlando Disney Experience'}
									resortId={1}
								/>
								<FeaturedDestinationCard
									image={require('../../images/landingPage/Margaritaville-Villa-Stay2x.png')}
									name={'Island H20 Live! Water Park'}
									resortId={2}
								/>{' '}
							</>
						)}
					</Box>
				</Box>
			</div>
		</Page>
	);
};

export default LandingPage;