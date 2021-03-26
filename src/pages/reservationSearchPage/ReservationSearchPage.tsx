import React, { useEffect, useState } from 'react';
import './ReservationSearchPage.scss';
import { Page, popupController } from '@bit/redsky.framework.rs.996';
import HeroImage from '../../components/heroImage/HeroImage';
import FilterBar from '../../components/filterBar/FilterBar';
import Label from '@bit/redsky.framework.rs.label';
import rsToasts from '@bit/redsky.framework.toast';
import serviceFactory from '../../services/serviceFactory';
import moment from 'moment';
import { RsFormControl } from '@bit/redsky.framework.rs.form';
import Box from '../../components/box/Box';
import useWindowResizeChange from '../../customHooks/useWindowResizeChange';
import { addCommasToNumber } from '../../utils/utils';
import FilterReservationPopup, {
	FilterReservationPopupProps
} from '../../popups/filterReservationPopup/FilterReservationPopup';
import IconLabel from '../../components/iconLabel/IconLabel';
import DestinationSearchResultCard from '../../components/destinationSearchResultCard/DestinationSearchResultCard';
import DestinationService from '../../services/destination/destination.service';
import LoadingPage from '../loadingPage/LoadingPage';
import { DestinationSummaryTab } from '../../components/tabbedDestinationSummary/TabbedDestinationSummary';
import PaginationButtons from '../../components/paginationButtons/PaginationButtons';
import AccommodationFeatures = Model.AccommodationFeatures;

const ReservationSearchPage: React.FC = () => {
	const size = useWindowResizeChange();
	let destinationService = serviceFactory.get<DestinationService>('DestinationService');
	const [waitToLoad, setWaitToLoad] = useState<boolean>(true);
	const [page, setPage] = useState<number>(1);
	const [perPage] = useState<number>(5);
	const [availabilityTotal, setAvailability] = useState<number>(32);
	const [checkInDate, setCheckInDate] = useState<moment.Moment | null>(moment());
	const [checkOutDate, setCheckOutDate] = useState<moment.Moment | null>(moment().add(7, 'd'));
	const [focusedInput, setFocusedInput] = useState<'startDate' | 'endDate' | null>(null);
	const [accommodations, setAccommodations] = useState<Api.Destination.Res.Availability[]>();
	const [numberOfAdults, setNumberOfAdults] = useState<number>(2);
	const [numberOfAdultsControl] = useState<RsFormControl>(new RsFormControl('numberOfAdults', numberOfAdults));
	const updateNumberOfAdults = (input: RsFormControl) => {
		let newNumber = parseInt(input.value.toString());
		if (isNaN(newNumber) || newNumber < 1) newNumber = 1;
		setNumberOfAdults(newNumber);
		(document.querySelector('.numberOfGuests > input') as HTMLInputElement).value = newNumber.toString();
	};
	const [numberOfChildren, setNumberOfChildren] = useState<number>(0);
	const [numberOfChildrenControl] = useState<RsFormControl>(new RsFormControl('numberOfChildren', numberOfChildren));
	const updateNumberOfChildren = (input: RsFormControl) => {
		let newNumber = parseInt(input.value.toString());
		if (isNaN(newNumber) || newNumber < 1) newNumber = 1;
		setNumberOfChildren(newNumber);
		(document.querySelector('.numberOfGuests > input') as HTMLInputElement).value = newNumber.toString();
	};
	const [priceMin, setPriceMin] = useState<string>('');
	const [priceMinControl] = useState<RsFormControl>(new RsFormControl('priceMin', priceMin));
	const updatePriceMin = (input: RsFormControl) => {
		setPriceMin(input.value.toString());
		let formattedNum = addCommasToNumber(('' + input.value).replace(/\D/g, ''));
		if (size === 'small') {
			(document.querySelector(
				'.rsFilterReservationPopup .priceMin > input'
			) as HTMLInputElement).value = formattedNum;
		}
		(document.querySelector('.priceMin > input') as HTMLInputElement).value = formattedNum;
	};
	const [priceMax, setPriceMax] = useState<string>('');
	const [priceMaxControl] = useState<RsFormControl>(new RsFormControl('priceMax', priceMax));
	const updatePriceMax = (input: RsFormControl) => {
		setPriceMax(input.value.toString());
		let formattedNum = addCommasToNumber(('' + input.value).replace(/\D/g, ''));
		if (size === 'small') {
			(document.querySelector(
				'.rsFilterReservationPopup .priceMax > input'
			) as HTMLInputElement).value = formattedNum;
		}
		(document.querySelector('.priceMax > input') as HTMLInputElement).value = formattedNum;
	};

	useEffect(() => {
		async function getReservations() {
			let data: Api.Destination.Req.Availability = getDataForSearchQuery();
			try {
				let res = await destinationService.searchAvailableReservations(data);
				setAccommodations(res.data.data);
			} catch (e) {
				rsToasts.error('An unexpected error has occurred on the server.');
			}
			setWaitToLoad(false);
		}
		getReservations().catch(console.error);
	}, []);

	function getDataForSearchQuery() {
		let startDate: string = '';
		let endDate: string = '';
		if (checkInDate) {
			startDate = checkInDate.format('YYYY-MM-DD');
		}
		if (checkOutDate) {
			endDate = checkOutDate.format('YYYY-MM-DD');
		}
		return {
			startDate: startDate,
			endDate: endDate,
			adults: numberOfAdults,
			children: numberOfChildren,
			pagination: {
				page: page,
				perPage: perPage
			}
		};
	}
	function onDatesChange(startDate: moment.Moment | null, endDate: moment.Moment | null): void {
		setCheckInDate(startDate);
		setCheckOutDate(endDate);
	}

	function renderDestinationSearchResultCards() {
		if (!accommodations) return;
		return accommodations.map((accommodation, index) => {
			let urls: string[] = getImageUrls(accommodation);
			let summaryTabs = getSummaryTabs(accommodation);
			return (
				<DestinationSearchResultCard
					key={index}
					destinationName={accommodation.name}
					address={`${accommodation.city}, ${accommodation.state}`}
					logoImagePath={accommodation.logoUrl}
					picturePaths={urls}
					starRating={4.5}
					reviewPath={''}
					destinationDetailsPath={`/destination?di=${accommodation.id}`}
					summaryTabs={summaryTabs}
					onAddCompareClick={() => {}}
				/>
			);
		});
	}

	function getSummaryTabs(accommodation: Api.Destination.Res.Availability): DestinationSummaryTab[] {
		let accommodationsList = getAccommodationList(accommodation);
		return [
			{ label: 'Overview', content: { text: accommodation.description } },
			{
				label: 'Available Suites',
				content: {
					accommodationType: 'Suites',
					accommodations: accommodationsList,
					onDetailsClick: (accommodationId) => {},
					onBookNowClick: (accommodationId) => {},
					onAddCompareClick: (accommodationId) => {}
				}
			}
		];
	}

	function getAccommodationList(accommodation: Api.Destination.Res.Availability) {
		return accommodation.accommodations.map((accommodationDetails) => {
			let amenityIconNames: string[] = getAmenityIconNames(accommodationDetails.features);
			return {
				id: accommodationDetails.id,
				name: accommodationDetails.name,
				amenityIconNames: amenityIconNames,
				bedrooms: accommodationDetails.roomCount,
				beds: accommodationDetails.bedDetails.length,
				ratePerNight: 0,
				pointsPerNight: 0
			};
		});
	}

	function getAmenityIconNames(features: AccommodationFeatures[]): string[] {
		return features.map((feature) => {
			return feature.icon;
		});
	}

	function getImageUrls(accommodation: Api.Destination.Res.Availability): string[] {
		if (accommodation.media) {
			return accommodation.media.map((urlObj) => {
				return urlObj.urls.small.toString();
			});
		}
		return [];
	}

	return waitToLoad ? (
		<LoadingPage />
	) : (
		<Page className={'rsReservationSearchPage'}>
			<div className={'rs-page-content-wrapper'}>
				<HeroImage
					className={'heroImage'}
					image={require('../../images/destinationResultsPage/momDaughterHero.jpg')}
					height={'200px'}
					mobileHeight={'100px'}
				/>
				<Box
					className={'filterResultsWrapper'}
					bgcolor={'#ffffff'}
					width={'1165px'}
					padding={size === 'small' ? '20px 30px' : '60px 140px'}
				>
					<Label className={'filterLabel'} variant={'h1'}>
						Filter by
					</Label>

					<FilterBar
						className={'filterBar'}
						startDate={checkInDate}
						endDate={checkOutDate}
						onDatesChange={onDatesChange}
						focusedInput={focusedInput}
						onFocusChange={setFocusedInput}
						monthsToShow={2}
						numberOfAdultsControl={numberOfAdultsControl}
						numberOfAdultsUpdateControl={(updateControl) => updateNumberOfAdults(updateControl)}
						numberOfChildrenControl={numberOfChildrenControl}
						numberOfChildrenUpdateControl={(updateControl) => updateNumberOfChildren(updateControl)}
						priceMinControl={priceMinControl}
						priceMinUpdateControl={(updateControl) => updatePriceMin(updateControl)}
						priceMaxControl={priceMaxControl}
						priceMaxUpdateControl={(updateControl) => updatePriceMax(updateControl)}
					/>
					<IconLabel
						className={'moreFiltersLink'}
						labelName={'More Filters'}
						iconImg={'icon-chevron-right'}
						iconPosition={'right'}
						iconSize={8}
						labelVariant={'caption'}
						onClick={() => {
							popupController.open<FilterReservationPopupProps>(FilterReservationPopup, {
								onClickApply: (startDate, endDate) => {
									setCheckInDate(startDate);
									setCheckOutDate(endDate);
									//getReservations().catch(console.error);
								},
								numberOfAdultsControl: numberOfAdultsControl,
								numberOfAdultsUpdateControl: (updateControl) => updateNumberOfAdults(updateControl),
								priceMinControl: priceMinControl,
								priceMinUpdateControl: (updateControl) => updatePriceMin(updateControl),
								priceMaxControl: priceMaxControl,
								priceMaxUpdateControl: (updateControl) => updatePriceMax(updateControl),
								className: 'filterPopup'
							});
						}}
					/>
					<div className={'bottomBorderDiv'} />
				</Box>
				<Box
					className={'searchResultsWrapper'}
					bgcolor={'#ffffff'}
					width={'1165px'}
					padding={size === 'small' ? '0 30px 20px' : '0 140px 60px'}
				>
					{renderDestinationSearchResultCards()}
				</Box>
				<div className={'paginationDiv'}>
					<PaginationButtons
						selectedRowsPerPage={perPage}
						currentPageNumber={page}
						setSelectedPage={(page) => setPage(page)}
						total={availabilityTotal}
					/>
				</div>
			</div>
		</Page>
	);
};

export default ReservationSearchPage;
