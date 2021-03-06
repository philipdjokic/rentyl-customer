import * as React from 'react';
import './DestinationDetailsPage.scss';
import { Page, popupController } from '@bit/redsky.framework.rs.996';
import { useEffect, useRef, useState } from 'react';
import serviceFactory from '../../services/serviceFactory';
import DestinationService from '../../services/destination/destination.service';
import LoadingPage from '../loadingPage/LoadingPage';
import Box from '@bit/redsky.framework.rs.996/dist/box/Box';
import Label from '@bit/redsky.framework.rs.label';
import { ObjectUtils } from '@bit/redsky.framework.rs.utils';
import useWindowResizeChange from '../../customHooks/useWindowResizeChange';
import { StringUtils, WebUtils } from '../../utils/utils';
import FilterBarLimited from '../../components/filterBar/FilterBarLimited';
import AccommodationService from '../../services/accommodation/accommodation.service';
import { useRecoilState } from 'recoil';
import globalState from '../../state/globalState';
import { rsToastify } from '@bit/redsky.framework.rs.toastify';
import SpinningLoaderPopup from '../../popups/spinningLoaderPopup/SpinningLoaderPopup';
import PaginationViewMore from '../../components/paginationViewMore/PaginationViewMore';
import SubNavMenu from '../../components/subNavMenu/SubNavMenu';
import DestinationImageGallery from '../../components/destinationImageGallery/DestinationImageGallery';
import LightBoxCarouselPopup, {
	TabbedCarouselPopupProps
} from '../../popups/lightBoxCarouselPopup/LightBoxCarouselPopup';
import CarouselV2 from '../../components/carouselV2/CarouselV2';
import ComparisonService from '../../services/comparison/comparison.service';
import MobileLightBox, { MobileLightBoxProps } from '../../popups/mobileLightBox/MobileLightBox';
import DestinationExperienceImageGallery from '../../components/destinationExperienceImageGallery/DestinationExperienceImageGallery';
import Icon from '@bit/redsky.framework.rs.icon';
import { Loader } from 'google-maps';
import AccommodationSearchCard from '../../components/accommodationSearchCardV2/AccommodationSearchCard';
import AccommodationOverviewPopup, {
	AccommodationOverviewPopupProps
} from '../../popups/accommodationOverviewPopup/AccommodationOverviewPopup';
import router from '../../utils/router';
import Button from '@bit/redsky.framework.rs.button';
import LabelButton from '../../components/labelButton/LabelButton';

interface DestinationDetailsPageProps {}

const DestinationDetailsPage: React.FC<DestinationDetailsPageProps> = () => {
	const galleryRef = useRef<HTMLElement>(null);
	const overviewRef = useRef<HTMLElement>(null);
	const experiencesRef = useRef<HTMLElement>(null);
	const availableStaysRef = useRef<HTMLElement>(null);
	const [reservationFilters, setReservationFilters] = useRecoilState<Misc.ReservationFilters>(
		globalState.reservationFilters
	);
	const size = useWindowResizeChange({ small: 1160 });
	const comparisonService = serviceFactory.get<ComparisonService>('ComparisonService');
	const destinationService = serviceFactory.get<DestinationService>('DestinationService');
	const accommodationService = serviceFactory.get<AccommodationService>('AccommodationService');
	const params = router.getPageUrlParams<{
		destinationId: number;
		startDate?: string;
		endDate?: string;
		guests: number;
	}>([
		{ key: 'di', default: 0, type: 'integer', alias: 'destinationId' },
		{
			key: 'startDate',
			default: reservationFilters.startDate.toString() || '',
			type: 'string',
			alias: 'startDate'
		},
		{ key: 'endDate', default: reservationFilters.endDate.toString() || '', type: 'string', alias: 'endDate' },
		{ key: 'guests', default: reservationFilters.adultCount || 1, type: 'integer', alias: 'guests' }
	]);
	const [destinationDetails, setDestinationDetails] = useState<Api.Destination.Res.Details>();
	const [availabilityStayList, setAvailabilityStayList] = useState<Api.Accommodation.Res.Availability[]>([]);
	const [destinationAvailability, setDestinationAvailability] = useState<Api.Destination.Res.Availability>();
	const [totalResults, setTotalResults] = useState<number>(0);
	const [loyaltyStatus, setLoyaltyStatus] = useState<Model.LoyaltyStatus>('PENDING');
	const [page, setPage] = useState<number>(1);
	const perPage = 10;

	useEffect(() => {
		setReservationFilters({
			...reservationFilters,
			destinationId: params.destinationId || reservationFilters.destinationId,
			startDate: params.startDate || reservationFilters.startDate,
			endDate: params.endDate || reservationFilters.endDate,
			adultCount: params.guests || reservationFilters.adultCount
		});
	}, []);

	useEffect(() => {
		(async () => {
			if (!destinationDetails) return;
			let address = `${destinationDetails.address1} ${destinationDetails.city} ${destinationDetails.state} ${destinationDetails.zip}`;

			const poiToHide: google.maps.MapTypeStyle[] = [
				{
					featureType: 'poi',
					stylers: [{ visibility: 'off' }]
				}
			];

			const loader = new Loader('AIzaSyAU3SZ6DiPSbxHck1AKgG8nRDarltdep7g');
			const google = await loader.load();
			const geocoder = new google.maps.Geocoder();
			let mapElement: HTMLElement | null = document.getElementById('GoogleMap');
			if (!mapElement) return;

			let destinationLocation = {
				lat: destinationDetails.latitude || 28.289728,
				lng: destinationDetails.longitude || -81.594499
			};

			//Render Map
			let googleMap = new google.maps.Map(mapElement, {
				center: destinationLocation,
				zoom: 16,
				disableDefaultUI: false
			});

			let infoWindowContent = renderInfoWindowContent();
			//Hide All POI
			googleMap.setOptions({ styles: poiToHide });

			//Get lat and lon based on the physical address.
			if (geocoder) {
				geocoder.geocode({ address: address }, function (results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						googleMap.setCenter(results[0].geometry.location);

						//Info Window
						const infoWindow: any = new google.maps.InfoWindow({
							content: infoWindowContent
						});

						//Place Marker;
						const marker = new google.maps.Marker({
							position: results[0].geometry.location,
							map: googleMap,
							title: destinationDetails.name
						});

						google.maps.event.addListener(marker, 'click', function () {
							infoWindow.open(googleMap, marker);
						});
					} else {
						rsToastify.error('Could not load google map location');
						console.error(status);
					}
				});
			}
		})();
	}, [destinationDetails]);

	useEffect(() => {
		async function getDestinationDetails(id: number) {
			try {
				const dest = await destinationService.getDestinationDetails(
					id,
					reservationFilters.startDate,
					reservationFilters.endDate
				);
				setDestinationDetails(dest);
				setLoyaltyStatus(dest.loyaltyStatus);
			} catch (e) {
				rsToastify.error(
					WebUtils.getRsErrorMessage(e, 'Cannot get details for this destination.'),
					'Server Error'
				);
			}
		}
		getDestinationDetails(reservationFilters.destinationId || params.destinationId).catch(console.error);
	}, [reservationFilters.destinationId]);

	useEffect(() => {
		async function getReservations() {
			try {
				popupController.open(SpinningLoaderPopup);
				const searchQueryObj: Misc.ReservationFilters = { ...reservationFilters };
				let key: keyof Misc.ReservationFilters;
				for (key in searchQueryObj) {
					if (searchQueryObj[key] === undefined) delete searchQueryObj[key];
				}
				searchQueryObj.pagination = { page, perPage };
				let res = await destinationService.searchAvailableReservations(searchQueryObj);
				setDestinationAvailability(
					res.data.find(
						(destination: Api.Destination.Res.Availability) =>
							destination.id === reservationFilters.destinationId
					)
				);
				popupController.close(SpinningLoaderPopup);
			} catch (e) {
				rsToastify.error(WebUtils.getRsErrorMessage(e, 'Cannot find available reservations.'), 'Server Error');
				popupController.close(SpinningLoaderPopup);
			}
		}

		getReservations().catch(console.error);
	}, [reservationFilters]);

	useEffect(() => {
		async function getAvailableStays() {
			if (!reservationFilters.destinationId) return;
			try {
				popupController.open(SpinningLoaderPopup);
				const searchQueryObj: Misc.ReservationFilters = { ...reservationFilters };
				let key: keyof Misc.ReservationFilters;
				for (key in searchQueryObj) {
					if (searchQueryObj[key] === undefined) delete searchQueryObj[key];
				}
				searchQueryObj.pagination = { page, perPage };
				if (searchQueryObj.priceRangeMin) searchQueryObj.priceRangeMin *= 100;
				if (searchQueryObj.priceRangeMax) searchQueryObj.priceRangeMax *= 100;
				let result = await accommodationService.availability(reservationFilters.destinationId, searchQueryObj);
				setTotalResults(result.total || 0);
				setAvailabilityStayList((prev) => {
					return [
						...prev.filter((accommodation) => {
							return !result.data
								.map((newList: Api.Accommodation.Res.Availability) => newList.id)
								.includes(accommodation.id);
						}),
						...result.data
					];
				});
				popupController.close(SpinningLoaderPopup);
			} catch (e) {
				popupController.close(SpinningLoaderPopup);
				rsToastify.error(
					WebUtils.getRsErrorMessage(e, 'Unable to get available accommodations.'),
					'Server Error'
				);
			}
		}
		getAvailableStays().catch(console.error);
	}, [reservationFilters, page]);

	async function handleOnInfoClick(accommodationId: number) {
		let accommodationDetails = await accommodationService.getAccommodationDetails(accommodationId);
		popupController.open<AccommodationOverviewPopupProps>(AccommodationOverviewPopup, {
			accommodationDetails: accommodationDetails,
			destinationName: destinationDetails?.name || ''
		});
	}

	function renderInfoWindowContent() {
		if (!destinationDetails) return;
		return `
				<h3 style="color: #333333; margin-bottom: 10px">${destinationDetails.name}</h3>
				<div>
				${destinationDetails.address1} ${destinationDetails.address2 || ''}
				<br />
				${destinationDetails.city}, ${destinationDetails.state} ${destinationDetails.zip}
				</div>
				<div class="view-link">
					<a style='color: #427fed; text-decoration: none'
					 href="${renderMapSource()}" target="_blank">View on Google Maps</a>
				</div>
				`;
	}

	function renderMapSource() {
		if (!destinationDetails) return;
		let address = `${destinationDetails.address1} ${destinationDetails.city} ${destinationDetails.state} ${destinationDetails.zip}`;
		address = address.replace(/ /g, '+');
		return encodeURI(`https://www.google.com/maps/dir/?api=1&destination=${address}`);
	}

	function renderAccommodations() {
		if (!ObjectUtils.isArrayWithData(availabilityStayList) && destinationAvailability) return;
		return availabilityStayList.map((accommodationAvailability, index) => {
			const destinationAccommodation: Api.Destination.Res.Accommodation | undefined =
				destinationAvailability?.accommodations.find(
					(accommodation) => accommodation.id === accommodationAvailability.id
				);
			if (reservationFilters.destinationId && destinationAccommodation) {
				return (
					<AccommodationSearchCard
						key={accommodationAvailability.id}
						openAccordion={index === 0}
						accommodation={destinationAccommodation}
						destinationId={reservationFilters.destinationId}
						pointsEarnable={accommodationAvailability.pointsEarned}
						onClickInfoIcon={handleOnInfoClick}
						showInfoIcon
					/>
				);
			}
		});
	}

	function renderExperiencesSection() {
		if (!destinationDetails?.experiences) return null;
		if (!ObjectUtils.isArrayWithData(destinationDetails.experiences) || destinationDetails.experiences.length < 6)
			return <></>;
		return <DestinationExperienceImageGallery experiences={destinationDetails.experiences} />;
	}

	function getImageUrls(destination: Api.Destination.Res.Details): string[] {
		if (destination.media) {
			let images = destination.media;
			images.sort((a, b) => {
				return b.isPrimary - a.isPrimary;
			});
			return images.map((urlObj) => {
				return urlObj.urls.imageKit?.toString() || urlObj.urls.thumb;
			});
		}
		return [];
	}

	function renderMinMaxLabels(min: number, max: number) {
		if (min === max) return min;
		if (min === 0) return `1-${max}`;
		return `${min}-${max}`;
	}

	function getMinMaxSqFtFromAccommodations(): { minSquareFt: number; maxSquareFt: number } {
		let minSquareFt = 0;
		let maxSquareFt = 0;
		if (!ObjectUtils.isArrayWithData(destinationDetails?.accommodations))
			return { minSquareFt: minSquareFt, maxSquareFt: maxSquareFt };
		destinationDetails?.accommodations.forEach((item) => {
			if (item.maxSquareFt) {
				if (item.maxSquareFt > maxSquareFt) maxSquareFt = item.maxSquareFt;
			}
			if (item.minSquareFt) {
				if (minSquareFt === 0) minSquareFt = item.minSquareFt;
				if (item.minSquareFt < minSquareFt) minSquareFt = item.minSquareFt;
			}
		});
		return { minSquareFt: minSquareFt, maxSquareFt: maxSquareFt };
	}

	function renderPointsOrCash() {
		if (!reservationFilters.redeemPoints && destinationAvailability?.minAccommodationPrice) {
			return `$${StringUtils.formatMoney(destinationAvailability.minAccommodationPrice)}`;
		} else if (
			reservationFilters.redeemPoints &&
			destinationAvailability?.minAccommodationPoints &&
			loyaltyStatus === 'ACTIVE'
		) {
			return `${StringUtils.addCommasToNumber(destinationAvailability.minAccommodationPoints)}pts`;
		} else if (destinationAvailability) {
			return `$${StringUtils.formatMoney(destinationAvailability.minAccommodationPrice)}`;
		}
	}

	return !destinationDetails ? (
		<LoadingPage />
	) : (
		<Page className={'rsDestinationDetailsPage'}>
			<div className={'rs-page-content-wrapper'}>
				{size !== 'small' && (
					<SubNavMenu
						pageRefs={{
							overviewRef: overviewRef,
							experiencesRef: experiencesRef,
							availableStaysRef: availableStaysRef
						}}
					/>
				)}
				<Box boxRef={galleryRef} className={'gallerySection'}>
					{size === 'small' ? (
						<CarouselV2
							path={window.location.href}
							imgPaths={getImageUrls(destinationDetails)}
							onAddCompareClick={() => {
								comparisonService.addToComparison(destinationDetails.id).catch(console.error);
							}}
							onRemoveCompareClick={() => {
								comparisonService.removeFromComparison(destinationDetails.id);
							}}
							onGalleryClick={() => {
								popupController.open<MobileLightBoxProps>(MobileLightBox, {
									imageData: destinationDetails.media
								});
							}}
						/>
					) : (
						<DestinationImageGallery
							imageData={destinationDetails.media}
							onGalleryClick={() => {
								if (!destinationDetails) return;
								popupController.open<TabbedCarouselPopupProps>(LightBoxCarouselPopup, {
									imageData: destinationDetails.media
								});
							}}
						/>
					)}
				</Box>
				<Box boxRef={overviewRef} className={'overviewSection'}>
					<Box className={'titleAndPriceContainer'}>
						<Box className={'logoNameContainer'}>
							<img
								className="destinationLogo"
								src={destinationDetails.logoUrl}
								alt={destinationDetails.name + ' logo'}
							/>
							<Label variant={'destinationDetailsCustomThree'}>{destinationDetails.name}</Label>
						</Box>
						<Box className={'destinationPricingContainer'}>
							<Label variant={'destinationDetailsCustomFour'}>from</Label>
							<Label className={'price'} variant={'destinationDetailsCustomFive'}>
								{renderPointsOrCash()}
							</Label>
							<Label variant={'destinationDetailsCustomFour'}>per night</Label>
						</Box>
					</Box>
					<Box className={'destinationDetailsWrapper'}>
						<Box className={'minMaxDescription'}>
							<Box className={'minMaxContainer'}>
								<Box className={'minMaxLabels'}>
									<Label className={'minMaxLabel'} variant={'destinationDetailsCustomTwo'}>
										{destinationDetails.minBedroom}-{destinationDetails.maxBedroom} Bed
									</Label>
									<Label className={'minMaxLabel'} variant={'destinationDetailsCustomTwo'}>
										{destinationDetails.minBathroom}-{destinationDetails.maxBathroom} Bath
									</Label>
									<Label className={'minMaxLabel'} variant={'destinationDetailsCustomTwo'}>
										{renderMinMaxLabels(
											getMinMaxSqFtFromAccommodations().minSquareFt,
											getMinMaxSqFtFromAccommodations().maxSquareFt
										)}{' '}
										ft&sup2;
									</Label>
								</Box>
								<Box className={'cityStateContainer'}>
									<Icon
										className={'locationIcon'}
										iconImg={'icon-location'}
										size={25}
										color={'#FF6469'}
									/>
									<Label variant={'destinationDetailsCustomTwo'}>
										{destinationDetails.city},{' '}
										{destinationDetails.state === ''
											? destinationDetails.zip
											: destinationDetails.state}
									</Label>
								</Box>
							</Box>
							{destinationDetails.description ? (
								<Label variant={'body2'} className={'locationDescription'}>
									{destinationDetails.description}
								</Label>
							) : (
								<div />
							)}
						</Box>
						{size === 'small' && (
							<LabelButton
								className={'yellowButton'}
								look={'containedPrimary'}
								variant={'customTwelve'}
								label={'Reserve Stay'}
								onClick={() => {
									if (!availableStaysRef) return;
									let ref = availableStaysRef.current;
									if (!ref) return;
									window.scrollTo({ top: ref.offsetTop, behavior: 'smooth' });
								}}
							/>
						)}

						<Box
							width={'clamp(300px, 100%, 766px)'}
							height={size === 'small' ? '300px' : '430px'}
							id={'GoogleMap'}
						/>
					</Box>
				</Box>
				<hr />
				<Box boxRef={experiencesRef} className={'experienceSection'} mb={63}>
					<Label
						variant={size === 'small' ? 'destinationDetailsCustomOne' : 'tabbedImageCarouselCustomOne'}
						mb={size === 'small' ? 25 : 50}
					>
						Experiences
					</Label>
					{renderExperiencesSection()}
				</Box>

				{!destinationDetails.isActive ? (
					<div ref={availableStaysRef}>
						<Label variant={'h2'} color={'red'} className={'noDestinations'}>
							This destination is currently not accepting reservations from this site.
						</Label>
					</div>
				) : (
					<div className={'availableStays'} ref={availableStaysRef}>
						<hr />
						<Label variant={'h1'} className={'chooseYourAccommodation'}>
							Choose your accommodation
						</Label>
						<FilterBarLimited destinationId={destinationDetails.id} isMobile={size === 'small'} />
						<hr />
						<div className={'accommodationCardWrapper'}>
							{availabilityStayList.length <= 0 ? (
								<Label variant={'h2'}>No available options.</Label>
							) : (
								renderAccommodations()
							)}
						</div>
						<PaginationViewMore
							selectedRowsPerPage={perPage}
							total={totalResults}
							currentPageNumber={page}
							viewMore={(page) => setPage(page)}
						/>
					</div>
				)}
			</div>
		</Page>
	);
};

export default DestinationDetailsPage;
