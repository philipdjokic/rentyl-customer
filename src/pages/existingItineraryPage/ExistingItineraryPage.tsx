import * as React from 'react';
import './ExistingItineraryPage.scss';
import { Box, Link, Page } from '@bit/redsky.framework.rs.996';
import ItineraryCard from '../../components/itineraryCard/ItineraryCard';
import { useRecoilValue } from 'recoil';
import globalState from '../../state/globalState';
import LoadingPage from '../loadingPage/LoadingPage';
import { useEffect, useState } from 'react';
import serviceFactory from '../../services/serviceFactory';
import ReservationsService from '../../services/reservations/reservations.service';
import { ObjectUtils } from '@bit/redsky.framework.rs.utils';
import { rsToastify } from '@bit/redsky.framework.rs.toastify';
import { DateUtils, StringUtils, WebUtils } from '../../utils/utils';
import Label from '@bit/redsky.framework.rs.label/dist/Label';
import useWindowResizeChange from '../../customHooks/useWindowResizeChange';

const ExistingItineraryPage: React.FC = () => {
	const user = useRecoilValue<Api.User.Res.Get | undefined>(globalState.user);
	const size = useWindowResizeChange();
	const reservationService = serviceFactory.get<ReservationsService>('ReservationsService');
	const [loading, setLoading] = useState<boolean>(true);
	const [itineraries, setItineraries] = useState<Api.Reservation.Res.Itinerary.Get[]>([]);
	const [upcomingItineraries, setUpcomingItineraries] = useState<Api.Reservation.Res.Itinerary.Get[]>([]);
	const [previousItineraries, setPreviousItineraries] = useState<Api.Reservation.Res.Itinerary.Get[]>([]);

	useEffect(() => {
		if (!user) return;

		async function getReservationsForUser() {
			let pageQuery: RedSky.PageQuery = {
				filter: {
					matchType: 'exact',
					searchTerm: [
						{
							column: 'userId',
							value: user!.id
						}
					]
				},
				pagination: {
					page: 1,
					perPage: 500
				},
				//TODO when in a stable environment probably want to switch to arrivalDate to show what is coming up most recently. Or give a way to filter themselves.
				sort: {
					field: 'reservation.createdOn',
					order: 'ASC'
				}
			};
			try {
				let res = await reservationService.getByPage(pageQuery);
				setItineraries(res.data);
				setLoading(false);
			} catch (e) {
				console.error(e);
			}
		}
		getReservationsForUser().catch(console.error);
	}, []);

	useEffect(() => {
		try {
			if (!ObjectUtils.isArrayWithData(itineraries)) return;
			let prevItineraries = itineraries.filter((itinerary) => {
				let sortedStays = itinerary.stays;
				if (sortedStays === null) return;
				sortedStays.sort(
					(stay1, stay2) => new Date(stay2.departureDate).getTime() - new Date(stay1.departureDate).getTime()
				);
				let date = DateUtils.serverToClientDate(sortedStays[0].departureDate as string);
				return date.getTime() < Date.now();
			});

			let currentItineraries = itineraries.filter((itinerary) => {
				let sortedStays = itinerary.stays;
				if (sortedStays === null) return;
				sortedStays.sort(
					(stay1, stay2) => new Date(stay2.departureDate).getTime() - new Date(stay1.departureDate).getTime()
				);
				let date = DateUtils.serverToClientDate(sortedStays[0].departureDate as string);
				return date.getTime() >= Date.now();
			});

			setUpcomingItineraries(currentItineraries);
			setPreviousItineraries(prevItineraries);
			setLoading(false);
		} catch (e) {
			rsToastify.error(
				WebUtils.getRsErrorMessage(e, 'There was a problem getting your reservations'),
				"Can't Get Reservations"
			);
		}
	}, [itineraries]);

	function handleDestinationImages(itinerary: Api.Reservation.Res.Itinerary.Get) {
		if (itinerary.destination.media) {
			let images = itinerary.destination.media;
			images.sort((a, b) => {
				return b.isPrimary - a.isPrimary;
			});
			return images.map((urlObj) => {
				return urlObj.urls.imageKit?.toString() || urlObj.urls.large;
			});
		} else {
			return [];
		}
	}

	function renderUpcomingReservations() {
		if (!ObjectUtils.isArrayWithData(upcomingItineraries)) return;

		return upcomingItineraries.map((itinerary) => {
			let pointTotal = itinerary.stays.reduce((total, reservation) => {
				return total + reservation.priceDetail.grandTotalPoints;
			}, 0);
			let cashTotal = itinerary.stays.reduce((total, reservation) => {
				return total + reservation.priceDetail.grandTotalCents;
			}, 0);
			const destinationImages = handleDestinationImages(itinerary);
			return (
				<ItineraryCard
					key={itinerary.stays[0].reservationId}
					destinationExperiences={itinerary.destination.experiences}
					imgPaths={destinationImages}
					itineraryId={itinerary.itineraryId}
					logo={itinerary.destination.logoUrl}
					title={itinerary.destination.name}
					address={StringUtils.buildAddressString(itinerary.destination) || ''}
					reservationDates={{
						startDate: itinerary.stays[0].arrivalDate,
						endDate: itinerary.stays[0].departureDate
					}}
					propertyType={'VIP Suite'}
					maxOccupancy={itinerary.stays[0].accommodation.maxOccupantCount}
					amenities={itinerary.stays[0].accommodation.featureIcons}
					totalPoints={pointTotal}
					linkPath={'/reservations/itinerary/reservation/details?ri=' + itinerary.stays[0].reservationId}
					cancelPermitted={itinerary.stays[0].cancellationPermitted}
					itineraryTotal={cashTotal}
					paidWithPoints={!itinerary.paymentMethod}
					city={itinerary.destination.city}
					state={itinerary.destination.state}
				/>
			);
		});
	}

	function renderPrevReservations() {
		if (!ObjectUtils.isArrayWithData(previousItineraries)) return;

		return previousItineraries.map((itinerary) => {
			let pointTotal = itinerary.stays.reduce((total, reservation) => {
				return total + reservation.priceDetail.grandTotalPoints;
			}, 0);
			let cashTotal = itinerary.stays.reduce((total, reservation) => {
				return total + reservation.priceDetail.grandTotalCents;
			}, 0);
			const destinationImages = handleDestinationImages(itinerary);
			return (
				<ItineraryCard
					key={itinerary.stays[0].reservationId}
					destinationExperiences={itinerary.destination.experiences}
					itineraryId={itinerary.itineraryId}
					imgPaths={destinationImages}
					logo={itinerary.destination.logoUrl}
					title={itinerary.destination.name}
					address={StringUtils.buildAddressString(itinerary.destination) || ''}
					reservationDates={{
						startDate: itinerary.stays[0].arrivalDate,
						endDate: itinerary.stays[0].departureDate
					}}
					propertyType={'VIP Suite'}
					maxOccupancy={itinerary.stays[0].accommodation.maxOccupantCount}
					amenities={itinerary.stays[0].accommodation.featureIcons}
					totalPoints={pointTotal}
					linkPath={'/reservations/itinerary/details?ii=' + itinerary.itineraryId}
					cancelPermitted={0}
					itineraryTotal={cashTotal}
					paidWithPoints={!itinerary.paymentMethod}
					city={itinerary.destination.city}
					state={itinerary.destination.state}
				/>
			);
		});
	}

	return loading ? (
		<LoadingPage />
	) : !ObjectUtils.isArrayWithData(itineraries) ? (
		<Page className={'rsExistingItineraryPage noAvailable'}>
			<Label variant={'h1'}>
				No Reservations Booked. <Link path={'/reservation/availability'}>Book Now</Link>
			</Label>
		</Page>
	) : (
		<Page className={'rsExistingItineraryPage'}>
			<Box className="staysCard">
				<Label
					variant={size === 'small' ? 'customFour' : 'customTwentyOne'}
					marginBottom={size === 'small' ? 20 : 40}
				>
					Your upcoming reservations
				</Label>
				<div className={'wrapper'}>{renderUpcomingReservations()?.reverse()}</div>
			</Box>
			<Box className="staysCard">
				<Label
					variant={size === 'small' ? 'customFour' : 'customTwentyOne'}
					marginBottom={size === 'small' ? 20 : 40}
					className={'pastStays'}
				>
					Past reservations
				</Label>
				<div className={'wrapper'}>{renderPrevReservations()}</div>
			</Box>
		</Page>
	);
};

export default ExistingItineraryPage;
