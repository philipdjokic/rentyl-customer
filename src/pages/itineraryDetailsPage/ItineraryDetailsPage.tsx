import * as React from 'react';
import './ItineraryDetailsPage.scss';
import { Box, Page } from '@bit/redsky.framework.rs.996';
import router from '../../utils/router';
import { useEffect, useState } from 'react';
import rsToasts from '@bit/redsky.framework.toast';
import serviceFactory from '../../services/serviceFactory';
import ReservationsService from '../../services/reservations/reservations.service';
import HeroImage from '../../components/heroImage/HeroImage';
import Paper from '../../components/paper/Paper';
import Label from '@bit/redsky.framework.rs.label/dist/Label';
import LabelButton from '../../components/labelButton/LabelButton';
import Footer from '../../components/footer/Footer';
import { FooterLinkTestData } from '../../components/footer/FooterLinks';
import { ObjectUtils } from '../../utils/utils';
import LoadingPage from '../loadingPage/LoadingPage';
import AccordionTitleDescription from '../../components/accordionTitleDescription/AccordionTitleDescription';
import ItineraryInfoCard from '../../components/itineraryInfoCard/ItineraryInfoCard';
import ItineraryCostSummaryCard from '../../components/itineraryCostSummaryCard/ItineraryCostSummaryCard';
import Select, { SelectOptions } from '../../components/Select/Select';
import { useRecoilValue } from 'recoil';
import globalState from '../../models/globalState';
import LabelCheckbox from '../../components/labelCheckbox/LabelCheckbox';
import ReservationDetailsAccordion from '../../components/reservationDetailsAccordion/ReservationDetailsAccordion';

const ItineraryDetailsPage: React.FC = () => {
	const user = useRecoilValue<Api.User.Res.Get | undefined>(globalState.user);
	const reservationService = serviceFactory.get<ReservationsService>('ReservationsService');
	const params = router.getPageUrlParams<{ itineraryId: string }>([
		{ key: 'ii', default: '', type: 'string', alias: 'itineraryId' }
	]);
	const [itinerary, setItinerary] = useState<Api.Reservation.Res.Itinerary.Get>();
	const [editPaymentCard, setEditPaymentCard] = useState<boolean>(false);
	const [newPaymentMethod, setNewPaymentMethod] = useState<Api.Reservation.PaymentMethod | undefined>();

	useEffect(() => {
		async function getItineraryDetails() {
			if (!params.itineraryId) return;
			try {
				let res = await reservationService.getItinerary({ itineraryId: params.itineraryId });
				console.log(res);
				setItinerary(res);
			} catch (e) {
				rsToasts.error(e.message);
			}
		}
		getItineraryDetails().catch(console.error);
	}, []);

	function renderReservations() {
		if (!itinerary || !ObjectUtils.isArrayWithData(itinerary.stays)) return;

		return itinerary.stays.map((item) => {
			return (
				<ReservationDetailsAccordion
					reservationId={item.reservationId}
					accommodationName={item.accommodation.name}
					arrivalDate={item.arrivalDate}
					departureDate={item.departureDate}
					externalConfirmationId={item.externalConfirmationId}
					maxOccupantCount={item.accommodation.maxOccupantCount}
					maxSleeps={item.accommodation.maxSleeps}
					adultCount={item.adultCount}
					childCount={item.childCount}
					adaCompliant={item.accommodation.adaCompliant}
					extraBed={item.accommodation.extraBed}
					floorCount={item.accommodation.floorCount}
					featureIcons={item.accommodation.featureIcons}
					contactInfo={`${item.guest?.firstName} ${item.guest?.lastName}`}
					email={item.guest?.email}
					phone={item.guest?.phone}
					additionalDetails={item.additionalDetails}
					onDetailsClick={() => {
						router
							.navigate('/reservations/itinerary/reservation/details?ri=' + item.reservationId)
							.catch(console.error);
					}}
				/>
			);
		});
	}

	function renderItineraryCostSummary() {
		if (!itinerary || !ObjectUtils.isArrayWithData(itinerary.stays) || !itinerary.destination) return;
		return (
			<ItineraryCostSummaryCard
				destinationName={itinerary.destination.name}
				address={{
					address1: itinerary.destination.address1,
					address2: itinerary.destination.address2,
					state: itinerary.destination.state,
					zip: itinerary.destination.zip,
					city: itinerary.destination.city
				}}
				reservation={itinerary.stays.map((item) => {
					return {
						name: item.accommodation.name,
						nights: Object.keys(item.priceDetail.accommodationDailyCostsInCents).length,
						cost: item.priceDetail.accommodationTotalInCents,
						arrivalDate: item.arrivalDate,
						departureDate: item.departureDate,
						taxesAndFees: item.priceDetail.taxAndFeeTotalInCents
					};
				})}
			/>
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
				selected: !!newPaymentMethod ? newPaymentMethod.id === item.id : false,
				text: item.cardNumber,
				value: item.id
			};
		});
	}

	async function saveNewPaymentMethod() {
		console.log(newPaymentMethod);
	}

	return !itinerary || !user ? (
		<LoadingPage />
	) : (
		<Page className={'rsItineraryDetailsPage'}>
			<div className={'rs-page-content-wrapper'}>
				<HeroImage
					image={require('../../images/itineraryDetailsPage/heroImg.jpg')}
					height={'464px'}
					mobileHeight={'464px'}
				>
					<ItineraryInfoCard
						backButton={{
							link: '/reservations',
							label: '< Back to itineraries'
						}}
						logoImgUrl={itinerary.destination.logoUrl}
						name={itinerary.destination.name}
						description={itinerary.destination.description}
						callToActionButton={{
							link: `/destination/details?di=${itinerary.destination.id}`,
							label: 'View Destination'
						}}
					/>
				</HeroImage>
				<div className={'contentWrapper'}>
					<div className={'reservationsWrapper'}>
						<Label variant={'h1'} mb={40}>
							Itinerary Details
						</Label>
						{renderReservations()}
					</div>
					<div>
						<Label variant={'h1'} mb={40}>
							Itinerary Cost Summary
						</Label>
						<Box position={'sticky'} top={20}>
							{renderItineraryCostSummary()}
							<Label variant={'h1'} mb={40}>
								Payment Information
							</Label>
							{!!itinerary.paymentMethod && (
								<Paper className={'paymentInfoCard'} boxShadow padding={'24px 28px'}>
									<div className={'currentCardWrapper'}>
										<AccordionTitleDescription
											title={'Name on card'}
											description={itinerary.paymentMethod.nameOnCard}
										/>
										<AccordionTitleDescription
											title={'Card Number'}
											description={itinerary.paymentMethod.cardNumber}
										/>
										<AccordionTitleDescription
											title={'Expiration Date'}
											description={`${itinerary.paymentMethod.expirationMonth}/${itinerary.paymentMethod.expirationYear}`}
										/>
										<AccordionTitleDescription
											title={'Card Type'}
											description={itinerary.paymentMethod.type}
										/>
									</div>
									<hr />
									<div className={editPaymentCard ? 'newPaymentOptions show' : 'newPaymentOptions'}>
										<div>
											<Label variant={'h4'} marginBottom={9}>
												OTHER PAYMENT OPTIONS
											</Label>
											<Select
												options={renderSelectOptions()}
												placeHolder={'Please Select A Card'}
												showSelectedAsPlaceHolder
												onChange={(value) => {
													if (!user) return;
													if (typeof value === 'number') {
														return setNewPaymentMethod(
															user.paymentMethods.find((item) => item.id === value)
														);
													}
													setNewPaymentMethod(undefined);
												}}
											/>
										</div>
										<AccordionTitleDescription
											title={'Name on card'}
											description={newPaymentMethod?.nameOnCard || ''}
										/>
										<AccordionTitleDescription
											title={'Card Number'}
											description={newPaymentMethod?.cardNumber || ''}
										/>
										<AccordionTitleDescription
											title={'Expiration Date'}
											description={
												!!newPaymentMethod
													? `${
															newPaymentMethod.expirationMonth +
															'/' +
															newPaymentMethod.expirationYear
													  }`
													: ''
											}
										/>
										<LabelCheckbox
											value={'test'}
											text={'* I agree with the Privacy Terms and booking conditions'}
											onSelect={() => {
												console.log('Yes');
											}}
											onDeselect={() => {
												console.log('No');
											}}
										/>
									</div>
									<Box position={'relative'} display={'flex'} marginLeft={'auto'} width={210}>
										<LabelButton
											className={editPaymentCard ? 'showBtn' : 'hideBtn'}
											look={'containedPrimary'}
											variant={'button'}
											label={'Save'}
											onClick={() => {
												saveNewPaymentMethod();
											}}
										/>
										<LabelButton
											className={'editCancelBtn'}
											look={editPaymentCard ? 'containedSecondary' : 'containedPrimary'}
											variant={'button'}
											label={editPaymentCard ? 'Cancel' : 'Change'}
											onClick={() => {
												setEditPaymentCard(!editPaymentCard);
											}}
										/>
									</Box>
								</Paper>
							)}
						</Box>
					</div>
				</div>
				<Footer links={FooterLinkTestData} />
			</div>
		</Page>
	);
};

export default ItineraryDetailsPage;