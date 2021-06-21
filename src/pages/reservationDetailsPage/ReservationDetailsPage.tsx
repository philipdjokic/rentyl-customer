import * as React from 'react';
import './ReservationDetailsPage.scss';
import { Box, Page } from '@bit/redsky.framework.rs.996';
import router from '../../utils/router';
import HeroImage from '../../components/heroImage/HeroImage';
import { useEffect, useState } from 'react';
import Paper from '../../components/paper/Paper';
import LabelLink from '../../components/labelLink/LabelLink';
import Label from '@bit/redsky.framework.rs.label/dist/Label';
import LabelButton from '../../components/labelButton/LabelButton';
import ReservationInfoCard from '../../components/reservationInfoCard/ReservationInfoCard';
import Footer from '../../components/footer/Footer';
import { FooterLinkTestData } from '../../components/footer/FooterLinks';
import ReservationSummaryCard from '../../components/reservationSummaryCard/ReservationSummaryCard';
import serviceFactory from '../../services/serviceFactory';
import ReservationsService from '../../services/reservations/reservations.service';
import LoadingPage from '../loadingPage/LoadingPage';
import { useRecoilValue } from 'recoil';
import globalState from '../../models/globalState';

interface ReservationDetailsPageProps {}

const ReservationDetailsPage: React.FC<ReservationDetailsPageProps> = (props) => {
	const reservationsService = serviceFactory.get<ReservationsService>('ReservationsService');
	const user = useRecoilValue<Api.User.Res.Detail | undefined>(globalState.user);
	const params = router.getPageUrlParams<{ reservationId: number }>([
		{ key: 'ri', default: 0, type: 'integer', alias: 'reservationId' }
	]);
	const [loaded, setLoaded] = useState<boolean>(false);
	const [reservation, setReservation] = useState<Api.Reservation.Res.Get>();
	const [cancelPolicy, setCancelPolicy] = useState<string>('');

	useEffect(() => {
		async function getReservationData(id: number) {
			try {
				let res = await reservationsService.get(id);
				const cancellationPolicy =
					res.destination.policies[res.destination.policies.findIndex((p) => p.type === 'Cancellation')]
						.value;
				setCancelPolicy(cancellationPolicy);
				setReservation(res);
				setLoaded(true);
			} catch (e) {}
		}
		getReservationData(params.reservationId).catch(console.error);
	}, []);

	return !reservation || !user || !loaded ? (
		<LoadingPage />
	) : (
		<Page className={'rsReservationDetailsPage'}>
			<div className={'rs-page-content-wrapper'}>
				<HeroImage
					image={require('../../images/destinationResultsPage/momDaughterHero.jpg')}
					height={'420px'}
					mobileHeight={'420px'}
				>
					<Paper padding={'50px'} width={'536px'} boxShadow>
						<LabelLink path={'/reservations'} label={'< Back to reservations'} variant={'caption'} />
						<Label m={'40px 0 10px 0'} variant={'h2'} display={'flex'}>
							Your reservation at{' '}
							{!reservation.destination.logoUrl ? (
								reservation.destination.name
							) : (
								<img src={reservation.destination.logoUrl} alt={'Destination Logo'} />
							)}
						</Label>
						<Label variant={'h1'} mb={20}>
							{reservation.accommodation.name}
						</Label>
						<Box display={'flex'} mb={20}>
							<Box mr={50}>
								<Label variant={'h4'} color={'#cc9e0d'}>
									Check-in
								</Label>
								<Label variant={'h2'}>{new Date(reservation.arrivalDate).toDateString()}</Label>
							</Box>
							<div>
								<Label variant={'h4'} color={'#cc9e0d'}>
									Check-out
								</Label>
								<Label variant={'h2'}>{new Date(reservation.departureDate).toDateString()}</Label>
							</div>
						</Box>
						<LabelButton
							look={'containedPrimary'}
							variant={'button'}
							label={'View Destination'}
							onClick={() => {
								if (!reservation) return;
								router
									.navigate('/destination/details?di=' + reservation.destination.id)
									.catch(console.error);
							}}
						/>
					</Paper>
					<div className={'tanBox'} />
				</HeroImage>
				<Box className={'mainSection'}>
					<Box className={'columnOne'}>
						<Label variant={'h1'} mb={30}>
							Reservation Details
						</Label>
						<ReservationInfoCard
							reservationDates={{
								startDate: reservation.arrivalDate,
								endDate: reservation.departureDate
							}}
							propertyType={'Hotel'}
							sleeps={reservation.accommodation.maxSleeps}
							amenities={reservation.accommodation.featureIcons}
							maxOccupancy={reservation.accommodation.maxOccupantCount}
							misc={[
								{ title: 'Reservation Number', data: reservation.externalReservationNumber },
								{ title: 'Confirmation Code', data: reservation.confirmationCode },
								{ title: 'Adults', data: reservation.adultCount },
								{ title: 'Children', data: reservation.childCount },
								{
									title: 'ADA Compliant',
									data: !!reservation.accommodation.adaCompliant ? 'Yes' : 'No'
								},
								{ title: 'Extra Bed', data: !!reservation.accommodation.extraBed ? 'Yes' : 'No' },
								{ title: 'Number of Floors', data: reservation.accommodation.floorCount }
							]}
							toggleConfirmation={() => {}}
							cancelPermitted={reservation.cancellationPermitted}
							cancelPolicy={cancelPolicy}
							confirmCancellation={() => reservationsService.cancel(params.reservationId)}
						/>
					</Box>
					<Box className={'columnTwo'}>
						<Label variant={'h1'} mb={30}>
							Reservation Cost Summary
						</Label>
						<ReservationSummaryCard
							paymentMethod={reservation.paymentMethod}
							fullName={`${user.firstName} ${user.lastName}`}
							billingAddress={reservation.billingAddress}
							priceDetails={reservation.priceDetail}
						/>
					</Box>
				</Box>
				<Footer links={FooterLinkTestData} />
			</div>
		</Page>
	);
};

export default ReservationDetailsPage;
