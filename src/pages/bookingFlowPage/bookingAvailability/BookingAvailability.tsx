import React, { useEffect, useState } from 'react';
import { Box, popupController } from '@bit/redsky.framework.rs.996';
import Label from '@bit/redsky.framework.rs.label';
import moment from 'moment';
import FilterBar from '../../../components/filterBar/FilterBar';
import IconLabel from '../../../components/iconLabel/IconLabel';
import RateCodeSelect from '../../../components/rateCodeSelect/RateCodeSelect';
import useWindowResizeChange from '../../../customHooks/useWindowResizeChange';
import serviceFactory from '../../../services/serviceFactory';
import DestinationService from '../../../services/destination/destination.service';
import { useRecoilValue } from 'recoil';
import globalState from '../../../models/globalState';
import rsToasts from '@bit/redsky.framework.toast';
import AccommodationSearchResultCard from '../../../components/accommodationSearchResultCard/AccommodationSearchResultCard';
import { formatFilterDateForServer } from '../../../utils/utils';

interface AccommodationFeatures {
	id: number;
	title: string;
	icon: string;
}

interface BookingAvailabilityProps {
	destinationId: number;
	startDate: moment.Moment;
	endDate: moment.Moment;
	adults: number;
	children: number;
	rateCode?: string;
	bookNow: (data: Api.Reservation.Req.Verification) => void;
}
const BookingAvailability: React.FC<BookingAvailabilityProps> = (props) => {
	const size = useWindowResizeChange();
	const user = useRecoilValue<Api.User.Res.Get | undefined>(globalState.user);
	let destinationService = serviceFactory.get<DestinationService>('DestinationService');
	const [waitToLoad, setWaitToLoad] = useState<boolean>(false);
	const [focusedInput, setFocusedInput] = useState<'startDate' | 'endDate' | null>(null);
	const [destinations, setDestinations] = useState<Api.Accommodation.Res.Availability[]>([]);
	const [searchQueryObj, setSearchQueryObj] = useState<Api.Accommodation.Req.Availability>({
		startDate: props.startDate.format('YYYY-MM-DD'),
		endDate: props.endDate.format('YYYY-MM-DD'),
		adults: props.adults,
		children: props.children,
		pagination: { page: 1, perPage: 5 },
		destinationId: props.destinationId,
		rate: props.rateCode
	});
	const [showRateCode, setShowRateCode] = useState<boolean>(false);
	const [rateCode, setRateCode] = useState<string>(props.rateCode ? props.rateCode : '');

	useEffect(() => {
		async function getReservations() {
			try {
				let res = await destinationService.searchAvailableAccommodationsByDestination(searchQueryObj);
				setDestinations(res);
			} catch (e) {
				rsToasts.error('An unexpected error has occurred on the server.');
			}
			setWaitToLoad(false);
		}
		getReservations().catch(console.error);
	}, [searchQueryObj]);

	function onDatesChange(startDate: moment.Moment | null, endDate: moment.Moment | null): void {
		updateSearchQueryObj('startDate', formatFilterDateForServer(startDate, 'start'));
		updateSearchQueryObj('endDate', formatFilterDateForServer(endDate, 'end'));
	}

	function updateSearchQueryObj(
		key:
			| 'startDate'
			| 'endDate'
			| 'adults'
			| 'children'
			| 'priceRangeMin'
			| 'priceRangeMax'
			| 'pagination'
			| 'rate',
		value: any
	) {
		if (key === 'adults' && value === 0) throw rsToasts.error('There must be at least one adult.');
		if (key === 'adults' && isNaN(value)) throw rsToasts.error('# of adults must be a number');
		if (key === 'children' && isNaN(value)) throw rsToasts.error('# of children must be a number');
		if (key === 'priceRangeMin' && isNaN(value)) throw rsToasts.error('Price min must be a number');
		if (key === 'priceRangeMax' && isNaN(value)) throw rsToasts.error('Price max must be a number');
		setSearchQueryObj((prev) => {
			let createSearchQueryObj: any = { ...prev };
			if (value === '') delete createSearchQueryObj[key];
			else createSearchQueryObj[key] = value;
			return createSearchQueryObj;
		});
	}

	function getImageUrls(destination: Api.Accommodation.Res.Availability): string[] {
		if (destination.media) {
			return destination.media.map((urlObj) => {
				return urlObj.urls.large?.toString() || '';
			});
		}
		return [];
	}

	function renderDestinationSearchResultCards() {
		if (!destinations) return;
		return destinations.map((destination, index) => {
			console.log(destination);
			let urls: string[] = getImageUrls(destination);
			return (
				<AccommodationSearchResultCard
					key={index}
					id={destination.id}
					name={destination.name}
					accommodationType={''}
					maxSleeps={destination.maxSleeps}
					squareFeet={2500}
					description={destination.longDescription}
					ratePerNightInCents={destination.costPerNightCents}
					pointsRatePerNight={destination.pointsPerNight}
					amenityIconNames={destination.featureIcons}
					pointsEarnable={destination.pointsEarned}
					roomStats={[
						{
							label: 'Sleeps',
							datum: destination.maxSleeps
						},
						{
							label: 'Max Occupancy',
							datum: destination.maxOccupantCount
						},
						{
							label: 'ADA Compliant',
							datum: destination.adaCompliant ? 'Yes' : 'No'
						},
						{
							label: 'Extra Bed',
							datum: destination.extraBeds ? 'Yes' : 'No'
						}
					]}
					onBookNowClick={() =>
						props.bookNow({
							accommodationId: destination.id,
							destinationId: props.destinationId,
							adults: searchQueryObj.adults,
							children: searchQueryObj.children,
							rateCode: searchQueryObj.rate,
							arrivalDate: searchQueryObj.startDate,
							departureDate: searchQueryObj.endDate,
							numberOfAccommodations: 1
						})
					}
					onCompareClick={() => {}}
					onViewDetailsClick={() => {}}
					carouselImagePaths={urls}
				/>
			);
		});
	}

	return (
		<Box>
			<Label variant={'h1'}>Filter by</Label>
			<Box
				className={'filterResultsWrapper'}
				bgcolor={'#ffffff'}
				width={size === 'small' ? '100%' : '1165px'}
				padding={size === 'small' ? '20px 30px' : '60px 140px'}
				boxSizing={'border-box'}
			>
				<Label className={'filterLabel'} variant={'h1'}>
					Filter by
				</Label>

				<FilterBar
					className={'filterBar'}
					startDate={moment(searchQueryObj.startDate)}
					endDate={moment(searchQueryObj.endDate)}
					onDatesChange={onDatesChange}
					focusedInput={focusedInput}
					onFocusChange={setFocusedInput}
					monthsToShow={2}
					onChangeAdults={(value) => {
						if (value === '') value = 0;
						updateSearchQueryObj('adults', parseInt(value));
					}}
					onChangeChildren={(value) => {
						if (value !== '') updateSearchQueryObj('children', parseInt(value));
					}}
					onChangePriceMin={(value) => {
						if (value !== '') {
							updateSearchQueryObj('priceRangeMin', value);
						}
					}}
					onChangePriceMax={(value) => {
						if (value !== '') {
							updateSearchQueryObj('priceRangeMax', value);
						}
					}}
					adultsInitialInput={searchQueryObj.adults.toString()}
					childrenInitialInput={searchQueryObj.children.toString()}
					initialPriceMax={!!searchQueryObj.priceRangeMax ? searchQueryObj.priceRangeMax.toString() : ''}
					initialPriceMin={!!searchQueryObj.priceRangeMin ? searchQueryObj.priceRangeMin.toString() : ''}
				/>
				<Box>
					<IconLabel
						labelName={'toggle rate code'}
						iconImg={!showRateCode ? 'icon-chevron-down' : 'icon-chevron-up'}
						iconPosition={'right'}
						iconSize={16}
						onClick={() => setShowRateCode(!showRateCode)}
					/>
					{showRateCode && (
						<RateCodeSelect
							apply={(value) => {
								setRateCode(value);
								updateSearchQueryObj('rate', value);
								setShowRateCode(false);
							}}
							code={rateCode}
							valid={false}
						/>
					)}
				</Box>
				{renderDestinationSearchResultCards()}
			</Box>
		</Box>
	);
};

export default BookingAvailability;
