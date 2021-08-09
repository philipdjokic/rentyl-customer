import * as React from 'react';
import './ReservationDetailsPage.scss';
import { Box, Page, popupController } from '@bit/redsky.framework.rs.996';
import router from '../../utils/router';
import HeroImage from '../../components/heroImage/HeroImage';
import { useEffect, useState } from 'react';
import Label from '@bit/redsky.framework.rs.label/dist/Label';
import Footer from '../../components/footer/Footer';
import { FooterLinkTestData } from '../../components/footer/FooterLinks';
import serviceFactory from '../../services/serviceFactory';
import ReservationsService from '../../services/reservations/reservations.service';
import LoadingPage from '../loadingPage/LoadingPage';
import { useRecoilValue } from 'recoil';
import globalState from '../../models/globalState';
import rsToasts from '@bit/redsky.framework.toast';
import ItineraryInfoCard from '../../components/itineraryInfoCard/ItineraryInfoCard';
import ReservationDetailsAccordion from '../../components/reservationDetailsAccordion/ReservationDetailsAccordion';
import ReservationDetailsCostSummaryCard from '../../components/reservationDetailsCostSummaryCard/ReservationDetailsCostSummaryCard';
import Paper from '../../components/paper/Paper';
import { convertTwentyFourHourTime } from '../../utils/utils';
import ConfirmRemovePopup, { ConfirmRemovePopupProps } from '../../popups/confirmRemovePopup/ConfirmRemovePopup';
import EditReservationDetailsPopup, {
	EditReservationDetailsPopupProps
} from '../../popups/editReservationDetailsPopup/EditReservationDetailsPopup';
import SpinningLoaderPopup from '../../popups/spinningLoaderPopup/SpinningLoaderPopup';

const ReservationDetailsPage: React.FC = () => {
	const reservationsService = serviceFactory.get<ReservationsService>('ReservationsService');
	const user = useRecoilValue<Api.User.Res.Detail | undefined>(globalState.user);
	const params = router.getPageUrlParams<{ reservationId: number }>([
		{ key: 'ri', default: 0, type: 'integer', alias: 'reservationId' }
	]);
	const [reservation, setReservation] = useState<Api.Reservation.Res.Get>();

	useEffect(() => {
		async function getReservationData(id: number) {
			try {
				let res = await reservationsService.get(id);
				setReservation(res);
			} catch (e) {
				rsToasts.error('Unable to get reservation information');
			}
		}
		getReservationData(params.reservationId).catch(console.error);
	}, []);

	function getPoliciesValue(option: 'CheckIn' | 'CheckOut' | 'Cancellation') {
		if (!reservation) return '';
		let time = reservation.destination.policies.find((item) => {
			return item.type === option;
		});
		if (time !== undefined) return time.value;
		else return '';
	}

	async function updateReservation(data: any) {
		if (!reservation) return;
		let newData: any = { ...data, id: reservation.id };

		try {
			popupController.open(SpinningLoaderPopup);
			let res = await reservationsService.update(newData);
			setReservation({ ...res });
			popupController.close(SpinningLoaderPopup);
			popupController.closeAll();
		} catch (e) {
			if (e.response.data.msg.ErrorCode === 'ModificationNotAllowed') {
				rsToasts.error('Cannot update a past reservation', 'Failed To update', 5000);
			} else {
				rsToasts.error(e.msg, 'Update Failure', 3000);
				console.error(e.message, e.msg);
			}
			popupController.closeAll();
		}
	}

	return !reservation || !user ? (
		<LoadingPage />
	) : (
		<Page className={'rsReservationDetailsPage'}>
			<div className={'rs-page-content-wrapper'}>
				<HeroImage
					image={require('../../images/itineraryDetailsPage/heroImg.jpg')}
					height={'464px'}
					mobileHeight={'464px'}
				>
					<ItineraryInfoCard
						backButton={{
							link: '/reservations/itinerary/details?ii=' + reservation.itineraryId,
							label: '< Back to itineraries'
						}}
						logoImgUrl={reservation.destination.logoUrl}
						name={reservation.accommodation.name}
						description={reservation.accommodation.longDescription}
						callToActionButton={{
							link: `/accommodation/details?ai=${reservation.accommodation.id}`,
							label: 'View Accommodation'
						}}
					/>
				</HeroImage>
				<div className={'contentWrapper'}>
					<div className={'reservationsWrapper'}>
						<Label variant={'h1'} mb={40}>
							Reservation Details
						</Label>
						<ReservationDetailsAccordion
							reservationId={reservation.id}
							accommodationName={reservation.accommodation.name}
							arrivalDate={reservation.arrivalDate}
							departureDate={reservation.departureDate}
							externalConfirmationId={reservation.externalConfirmationId}
							maxOccupantCount={reservation.accommodation.maxOccupantCount}
							maxSleeps={reservation.accommodation.maxSleeps}
							adultCount={reservation.adultCount}
							childCount={reservation.childCount}
							adaCompliant={reservation.accommodation.adaCompliant}
							extraBed={reservation.accommodation.extraBed}
							floorCount={reservation.accommodation.floorCount}
							featureIcons={reservation.accommodation.featureIcons}
							contactInfo={`${reservation.guest.firstName} ${reservation.guest.lastName}`}
							email={reservation.guest.email}
							phone={reservation.guest.phone}
							additionalDetails={reservation.additionalDetails}
							isCancelable={!!reservation.cancellationPermitted}
							onDetailsClick={() => {
								console.log('hello');
							}}
							onSave={(data) => {
								let guestNameSplit = data.contactInfo.split(' ').filter((item) => item.length > 0);
								let guest = {
									firstName: guestNameSplit[0],
									lastName: guestNameSplit[1],
									email: data.email,
									phone: data.phone
								};
								updateReservation({ guest, additionalDetails: data.additionalDetails }).catch(
									console.error
								);
							}}
							onRemove={() => {
								popupController.open<ConfirmRemovePopupProps>(ConfirmRemovePopup, {
									onRemove: async () => {
										popupController.open(SpinningLoaderPopup);
										try {
											let res = await reservationsService.cancel(reservation.id);
											if (res) {
												popupController.closeAll();
												router.navigate('/reservations').catch(console.error);
											}
										} catch (e) {
											console.error(e.message);
											popupController.close(SpinningLoaderPopup);
										}
									}
								});
							}}
							onEditDetails={() => {
								if (!reservation) return;
								popupController.open<EditReservationDetailsPopupProps>(EditReservationDetailsPopup, {
									accommodationId: reservation.accommodation.id,
									destinationId: reservation.destination.id,
									adultCount: reservation.adultCount,
									childCount: reservation.childCount,
									arrivalDate: reservation.arrivalDate,
									departureDate: reservation.departureDate,
									onApplyChanges: (data) => {
										let newData: any = { ...data };
										newData.rateCode = 'ITSTIME';
										newData.paymentMethodId = reservation.paymentMethod?.id;
										newData.guest = reservation.guest;
										newData.accommodationId = reservation.accommodation.id;
										newData.numberOfAccommodations = 1;
										updateReservation(newData).catch(console.error);
									}
								});
							}}
							onChangeRoom={() => {
								if (!reservation) return;
								router
									.navigate(
										`/reservations/edit-room?ri=${reservation.id}&di=${reservation.destination.id}`
									)
									.catch(console.error);
							}}
							isEdit
							isOpen
						/>
					</div>
					<div>
						<Label variant={'h1'} mb={40}>
							Reservation Cost Summary
						</Label>
						<Box position={'sticky'} top={20}>
							<ReservationDetailsCostSummaryCard
								accommodationName={reservation.accommodation.name}
								checkInTime={getPoliciesValue('CheckIn')}
								checkOutTime={getPoliciesValue('CheckOut')}
								arrivalDate={reservation.arrivalDate}
								departureDate={reservation.departureDate}
								adultCount={reservation.adultCount}
								childCount={reservation.childCount}
								taxAndFeeTotalsInCents={[
									...reservation.priceDetail.feeTotalsInCents,
									...reservation.priceDetail.taxTotalsInCents
								]}
								costPerNight={reservation.priceDetail.accommodationDailyCostsInCents}
								grandTotalCents={reservation.priceDetail.grandTotalCents}
							/>
							<Label variant={'h1'} mb={40}>
								Policies
							</Label>
							<Paper boxShadow padding={'24px 28px'}>
								<Box display={'flex'} mb={24}>
									<Box marginRight={56}>
										<Label variant={'h3'} mb={8}>
											CHECK-IN
										</Label>
										<Label variant={'body1'}>
											{convertTwentyFourHourTime(getPoliciesValue('CheckIn'))}
										</Label>
									</Box>
									<div>
										<Label variant={'h3'} mb={8}>
											CHECK-OUT
										</Label>
										<Label variant={'body1'}>
											{convertTwentyFourHourTime(getPoliciesValue('CheckOut'))}
										</Label>
									</div>
								</Box>
								<Label variant={'h3'} mb={24}>
									{reservation.destination.name}
								</Label>
								<div>
									<Label variant={'h3'} mb={8}>
										Cancellation
									</Label>
									<Label variant={'body1'}>{getPoliciesValue('Cancellation')}</Label>
								</div>
							</Paper>
						</Box>
					</div>
				</div>
				<Footer links={FooterLinkTestData} />
			</div>
		</Page>
	);
};

export default ReservationDetailsPage;
