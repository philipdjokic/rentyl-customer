import * as React from 'react';
import './DestinationDetailsPage.scss';
import { Page, popupController } from '@bit/redsky.framework.rs.996';
import HeroImage from '../../components/heroImage/HeroImage';
import { useEffect, useRef, useState } from 'react';
import router from '../../utils/router';
import serviceFactory from '../../services/serviceFactory';
import DestinationService from '../../services/destination/destination.service';
import LoadingPage from '../loadingPage/LoadingPage';
import Box from '@bit/redsky.framework.rs.996/dist/box/Box';
import DestinationInfoCard from '../../components/destinationInfoCard/DestinationInfoCard';
import { FooterLinks } from '../../components/footer/FooterLinks';
import Footer from '../../components/footer/Footer';
import Label from '@bit/redsky.framework.rs.label';
import LabelImage from '../../components/labelImage/LabelImage';
import TabbedImageCarousel from '../../components/tabbedImageCarousel/TabbedImageCarousel';
import { ObjectUtils } from '@bit/redsky.framework.rs.utils';
import useWindowResizeChange from '../../customHooks/useWindowResizeChange';
import Carousel from '../../components/carousel/Carousel';
import moment from 'moment';
import { formatFilterDateForServer, StringUtils, WebUtils } from '../../utils/utils';
import FilterBar from '../../components/filterBar/FilterBar';
import AccommodationSearchResultCard from '../../components/accommodationSearchResultCard/AccommodationSearchResultCard';
import AccommodationService from '../../services/accommodation/accommodation.service';
import LoginOrCreateAccountPopup, {
	LoginOrCreateAccountPopupProps
} from '../../popups/loginOrCreateAccountPopup/LoginOrCreateAccountPopup';
import { useRecoilState, useRecoilValue } from 'recoil';
import globalState from '../../state/globalState';
import ComparisonService from '../../services/comparison/comparison.service';
import FilterReservationPopup, {
	FilterReservationPopupProps
} from '../../popups/filterReservationPopup/FilterReservationPopup';
import PaginationButtons from '../../components/paginationButtons/PaginationButtons';
import { rsToastify } from '@bit/redsky.framework.rs.toastify';
import Accordion from '@bit/redsky.framework.rs.accordion';
import RateCodeSelect from '../../components/rateCodeSelect/RateCodeSelect';
import { OptionType } from '@bit/redsky.framework.rs.select';
import { RsFormControl, RsFormGroup } from '@bit/redsky.framework.rs.form';
import IconLabel from '../../components/iconLabel/IconLabel';
import SpinningLoaderPopup from '../../popups/spinningLoaderPopup/SpinningLoaderPopup';
interface DestinationDetailsPageProps {}

const DestinationDetailsPage: React.FC<DestinationDetailsPageProps> = () => {
	const params = router.getPageUrlParams<{
		destinationId: number;
		startDate?: string;
		endDate?: string;
		adults: number;
		children: number;
	}>([
		{ key: 'di', default: 0, type: 'integer', alias: 'destinationId' }, //need to coordinate with NDM on getting the correct destination from them to us
		{ key: 'startDate', default: '', type: 'string', alias: 'startDate' },
		{ key: 'endDate', default: '', type: 'string', alias: 'endDate' },
		{ key: 'adults', default: 2, type: 'integer', alias: 'adults' },
		{ key: 'children', default: 0, type: 'integer', alias: 'children' }
	]);
	const size = useWindowResizeChange();
	const parentRef = useRef<HTMLElement>(null);
	const availableStaysRef = useRef<HTMLElement>(null);
	const childRef = useRef<HTMLElement>(null);
	const user = useRecoilValue<Api.User.Res.Detail | undefined>(globalState.user);
	const destinationService = serviceFactory.get<DestinationService>('DestinationService');
	const accommodationService = serviceFactory.get<AccommodationService>('AccommodationService');
	const comparisonService = serviceFactory.get<ComparisonService>('ComparisonService');
	const [destinationDetails, setDestinationDetails] = useState<Api.Destination.Res.Details>();
	const [availabilityStayList, setAvailabilityStayList] = useState<Api.Accommodation.Res.Availability[]>([]);
	const [totalResults, setTotalResults] = useState<number>(0);
	const perPage = 5;
	const [page, setPage] = useState<number>(1);
	const recoilComparisonState = useRecoilState<Misc.ComparisonCardInfo[]>(globalState.destinationComparison);
	const [focusedInput, setFocusedInput] = useState<'startDate' | 'endDate' | null>(null);
	const [comparisonId, setComparisonId] = useState<number>(1);
	const initialStartDate = params.startDate ? moment(params.startDate) : moment();
	const initialEndDate = params.endDate ? moment(params.endDate) : moment().add(2, 'days');
	const [startDateControl, setStartDateControl] = useState<moment.Moment | null>(initialStartDate);
	const [endDateControl, setEndDateControl] = useState<moment.Moment | null>(initialEndDate);
	const [rateCode, setRateCode] = useRecoilState<string>(globalState.userRateCode);
	const [validCode, setValidCode] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<string>();
	const [searchQueryObj, setSearchQueryObj] = useState<Api.Accommodation.Req.Availability>({
		destinationId: params.destinationId,
		startDate: initialStartDate.format('YYYY-MM-DD'),
		endDate: initialEndDate.format('YYYY-MM-DD'),
		adults: params.adults || 2,
		children: params.children || 0,
		pagination: { page: 1, perPage: 5 }
	});
	const [options, setOptions] = useState<OptionType[]>([]);
	const [propertyType, setPropertyType] = useState<RsFormGroup>(
		new RsFormGroup([new RsFormControl('propertyType', [], [])])
	);

	useEffect(() => {
		async function getDestinationDetails(id: number) {
			try {
				let dest = await destinationService.getDestinationDetails(id);
				setDestinationDetails(dest);
				let newOptions = formatOptions(dest.propertyTypes);
				setOptions(newOptions);
			} catch (e) {
				rsToastify.error(
					WebUtils.getRsErrorMessage(e, 'Cannot get details for this destination.'),
					'Server Error'
				);
			}
		}
		getDestinationDetails(params.destinationId).catch(console.error);
	}, []);

	useEffect(() => {
		async function getAvailableStays() {
			if (
				searchQueryObj['priceRangeMin'] &&
				searchQueryObj['priceRangeMax'] &&
				searchQueryObj['priceRangeMin'] > searchQueryObj['priceRangeMax']
			)
				return;
			let newSearchQueryObj = { ...searchQueryObj };
			if (!!newSearchQueryObj.priceRangeMin) {
				newSearchQueryObj.priceRangeMin *= 100;
			}
			if (!!newSearchQueryObj.priceRangeMax) {
				newSearchQueryObj.priceRangeMax *= 100;
			}
			if (!rateCode) {
				delete newSearchQueryObj.rateCode;
			} else {
				newSearchQueryObj.rateCode = rateCode;
			}
			try {
				popupController.open(SpinningLoaderPopup);
				let result = await accommodationService.availability(newSearchQueryObj);
				setValidCode(rateCode === '' || (!!result.data && result.data.length > 0));
				setTotalResults(result.total || 0);
				setAvailabilityStayList(result.data);
				popupController.close(SpinningLoaderPopup);
			} catch (e) {
				popupController.close(SpinningLoaderPopup);
				setValidCode(rateCode === '');
				rsToastify.error(
					WebUtils.getRsErrorMessage(e, 'Unable to get available accommodations.'),
					'Server Error'
				);
			}
		}
		getAvailableStays().catch(console.error);
	}, [searchQueryObj]);

	function formatOptions(options: Api.Destination.Res.PropertyType[]) {
		return options.map((value) => {
			return { value: value.id, label: value.name };
		});
	}

	let imageIndex = 0;

	function moveImagesRight() {
		if (parentRef.current!.childElementCount - 1 === imageIndex) {
			imageIndex = 0;
		}
		imageIndex++;
		let childWidth = childRef.current!.offsetWidth;
		parentRef.current!.style.transform = `translateX(-${imageIndex * childWidth}px)`;
	}

	function moveImagesLeft() {
		if (imageIndex === 0) imageIndex = parentRef.current!.childElementCount;
		imageIndex--;
		let childWidth = childRef.current!.offsetWidth;
		parentRef.current!.style.transform = `translateX(-${imageIndex * childWidth}px)`;
	}

	function renderFeatures() {
		if (!destinationDetails || !destinationDetails.features) return;
		let featureArray: any = [];
		destinationDetails.features.forEach((item) => {
			if (!item.isActive || item.isCarousel) return false;
			let primaryMedia: any = '';
			for (let value of item.media) {
				if (!value.isPrimary) continue;
				primaryMedia = value.urls.imageKit;
				break;
			}
			if (primaryMedia === '') return false;
			featureArray.push(<LabelImage key={item.id} mainImg={primaryMedia} textOnImg={item.title} />);
		});
		return featureArray;
	}

	function renderFeatureCarousel() {
		if (!destinationDetails || !ObjectUtils.isArrayWithData(destinationDetails.features)) return;
		let carouselItems: any = [];
		for (let item of destinationDetails.features) {
			if (!item.isActive || !item.isCarousel) continue;
			let imagePath = '';
			if (ObjectUtils.isArrayWithData(item.media)) {
				const mainImg = item.media.find((image) => image.isPrimary);
				imagePath = mainImg?.urls.imageKit || item.media[0].urls.imageKit;
			}
			carouselItems.push({
				name: item.title,
				title: item.title,
				imagePath: imagePath,
				description: item.description,
				buttonLabel: 'View Photos',
				otherMedia: item.media
			});
		}
		return <TabbedImageCarousel tabs={carouselItems} />;
	}

	function renderMapSource() {
		if (!destinationDetails) return;
		let address = `${destinationDetails.address1} ${destinationDetails.city} ${destinationDetails.state} ${destinationDetails.zip}`;
		address = address.replace(/ /g, '+');
		return `https://www.google.com/maps/embed/v1/place?q=${address}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`;
	}

	function onDatesChange(startDate: moment.Moment | null, endDate: moment.Moment | null): void {
		setStartDateControl(startDate);
		setEndDateControl(endDate);
		updateSearchQueryObj('startDate', formatFilterDateForServer(startDate, 'start'));
		updateSearchQueryObj('endDate', formatFilterDateForServer(endDate, 'end'));
		if (!destinationDetails) return;
		router.updateUrlParams({
			di: destinationDetails.id,
			startDate: formatFilterDateForServer(startDate, 'start'),
			endDate: formatFilterDateForServer(endDate, 'end')
		});
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
			| 'rateCode'
			| 'propertyTypeIds',
		value: any
	) {
		if (key === 'adults' && value === 0) {
			//this should never evaluate to true with current implementations.
			throw rsToastify.error('Must have at least 1 adult', 'Missing or Incorrect Information');
		}
		if (key === 'adults' && isNaN(value)) {
			throw rsToastify.error('# of adults must be a number', 'Missing or Incorrect Information');
		}
		if (key === 'children' && isNaN(value)) {
			throw rsToastify.error('# of children must be a number', 'Missing or Incorrect Information');
		}
		if (key === 'priceRangeMin' && isNaN(parseInt(value))) {
			throw rsToastify.error('Price min must be a number', 'Missing or Incorrect Information');
		}
		if (key === 'priceRangeMax' && isNaN(parseInt(value))) {
			throw rsToastify.error('Price max must be a number', 'Missing or Incorrect Information');
		}
		if (key === 'priceRangeMin' && searchQueryObj['priceRangeMax'] && value > searchQueryObj['priceRangeMax']) {
			setErrorMessage('Price min must be lower than the max');
		} else if (
			key === 'priceRangeMax' &&
			searchQueryObj['priceRangeMin'] &&
			value < searchQueryObj['priceRangeMin']
		) {
			setErrorMessage('Price max must be greater than the min');
		} else {
			setErrorMessage('');
		}
		setSearchQueryObj((prev) => {
			let createSearchQueryObj: any = { ...prev };
			if (value === '' || value === undefined) {
				delete createSearchQueryObj[key];
			} else createSearchQueryObj[key] = value;
			return createSearchQueryObj;
		});
	}

	function renderAccommodations() {
		if (!ObjectUtils.isArrayWithData(availabilityStayList)) return;
		return availabilityStayList.map((item) => {
			return (
				<AccommodationSearchResultCard
					key={item.id}
					id={item.id}
					name={item.name}
					accommodationType="Suite"
					description={item.longDescription}
					pointsRatePerNight={item.pointsPerNight}
					pointsEarnable={item.pointsEarned}
					ratePerNightInCents={item.costPerNightCents}
					squareFeet={item.size ? item.size.max : null}
					maxSleeps={item.maxSleeps}
					onBookNowClick={() => {
						if (!destinationDetails) return;
						const newRoom: Misc.StayParams = {
							uuid: Date.now(),
							accommodationId: item.id,
							adults: searchQueryObj.adults,
							children: searchQueryObj.children,
							arrivalDate: searchQueryObj.startDate as string,
							departureDate: searchQueryObj.endDate as string,
							packages: []
						};
						if (rateCode) newRoom.rateCode = rateCode;
						const data = JSON.stringify({ destinationId: destinationDetails.id, newRoom });
						if (!user) {
							popupController.open<LoginOrCreateAccountPopupProps>(LoginOrCreateAccountPopup, {
								query: data
							});
						} else {
							router.navigate(`/booking/packages?data=${data}`).catch(console.error);
						}
					}}
					onViewDetailsClick={() => {
						const dates =
							!!searchQueryObj.startDate && !!searchQueryObj.endDate
								? `&startDate=${searchQueryObj.startDate}&endDate=${searchQueryObj.endDate}`
								: '';
						router.navigate(`/accommodation/details?ai=${item.id}${dates}`).catch(console.error);
					}}
					onCompareClick={() => {
						if (!destinationDetails) return;
						let selectedRoom = destinationDetails.accommodations.filter((value) => value.id === item.id);
						setComparisonId(comparisonId + 1);
						comparisonService.addToComparison(recoilComparisonState, {
							comparisonId: comparisonId,
							destinationId: Date.now(),
							logo: destinationDetails.logoUrl,
							title: destinationDetails.name,
							roomTypes: destinationDetails.accommodations
								.sort((room1, room2) => room2.maxOccupantCount - room1.maxOccupantCount)
								.map((value) => {
									return {
										value: value.id,
										label: value.name
									};
								}),
							selectedRoom: selectedRoom[0].id || destinationDetails.accommodations[0].id
						});
					}}
					roomStats={[
						{
							label: 'Sleeps',
							datum: item.maxSleeps
						},
						{
							label: 'Max Occupancy',
							datum: item.maxOccupantCount
						},
						{
							label: 'Accessible',
							datum: item.adaCompliant ? 'Yes' : 'No'
						},
						{
							label: 'Extra Bed',
							datum: item.extraBeds ? 'Yes' : 'No'
						}
					]}
					amenityIconNames={item.featureIcons}
					carouselImagePaths={item.media}
				/>
			);
		});
	}

	function popupSearch(
		checkinDate: moment.Moment | null,
		checkoutDate: moment.Moment | null,
		adults: string,
		children: string,
		priceRangeMin: string,
		priceRangeMax: string,
		propertyTypeIds: number[],
		rateCode: string
	) {
		setSearchQueryObj((prev) => {
			let createSearchQueryObj: any = { ...prev };
			createSearchQueryObj['startDate'] = formatFilterDateForServer(checkinDate, 'start');
			createSearchQueryObj['endDate'] = formatFilterDateForServer(checkoutDate, 'end');
			createSearchQueryObj['adults'] = parseInt(adults);
			if (children !== '') {
				createSearchQueryObj['children'] = parseInt(children);
			}
			if (priceRangeMax !== '') {
				createSearchQueryObj['priceRangeMin'] = parseInt(priceRangeMin);
			}
			if (priceRangeMax !== '') {
				createSearchQueryObj['priceRangeMax'] = parseInt(priceRangeMax);
			}
			if (propertyTypeIds.length >= 1) {
				createSearchQueryObj['propertyTypeIds'] = propertyTypeIds;
			} else {
				delete createSearchQueryObj['propertyTypeIds'];
			}
			if (rateCode !== '') {
				createSearchQueryObj['rateCode'] = rateCode;
			}
			return createSearchQueryObj;
		});
	}

	function renderSectionTwo() {
		if (!ObjectUtils.isArrayWithData(destinationDetails?.features?.filter((item) => !item.isCarousel))) return null;
		return (
			<Box className={'sectionTwo'} marginBottom={'120px'}>
				<Label variant={'h1'}>Features</Label>
				<Box display={'flex'} justifyContent={'center'} width={'100%'} flexWrap={'wrap'}>
					{size === 'small' ? <Carousel children={renderFeatures()} /> : renderFeatures()}
				</Box>
			</Box>
		);
	}

	function renderSectionThree() {
		if (!destinationDetails?.features) return null;
		return (
			<Box className={'sectionThree'} marginBottom={'190px'}>
				{renderFeatureCarousel()}
				{ObjectUtils.isArrayWithData(destinationDetails.features) && <div className={'yellowSquare'} />}
			</Box>
		);
	}

	function renderSectionFour() {
		if (!destinationDetails) return null;
		const addressData = {
			address1: destinationDetails.address1,
			address2: destinationDetails.address2,
			city: destinationDetails.city,
			state: destinationDetails.state,
			zip: destinationDetails.zip
		};
		return (
			<Box
				className={'sectionFour'}
				marginBottom={'124px'}
				display={'flex'}
				justifyContent={'center'}
				alignItems={'center'}
				flexWrap={'wrap'}
			>
				<Box width={size === 'small' ? '300px' : '420px'} marginRight={size === 'small' ? '0px' : '100px'}>
					<Label variant={'h1'}>Location</Label>
					{destinationDetails.locationDescription ? (
						<Label variant={'body2'}>{destinationDetails.locationDescription}</Label>
					) : (
						<div></div>
					)}
					<Label variant={'caption'}>{StringUtils.buildAddressString(addressData)}</Label>
				</Box>
				<Box width={size === 'small' ? '300px' : '570px'} height={size === 'small' ? '300px' : '450px'}>
					<iframe frameBorder="0" src={renderMapSource()} />
				</Box>
			</Box>
		);
	}

	return !destinationDetails ? (
		<LoadingPage />
	) : (
		<Page className={'rsDestinationDetailsPage'}>
			<div className={'rs-page-content-wrapper'}>
				<Box className={'sectionOne'}>
					<HeroImage image={destinationDetails.heroUrl} height={'420px'} mobileHeight={'420px'} />
					<Box className={'headerWrapper'}>
						<Box className={'destinationInfoCardWrapper'}>
							<DestinationInfoCard
								destinationId={destinationDetails.id}
								destinationName={destinationDetails.name}
								destinationImage={destinationDetails.logoUrl}
								address={destinationDetails.address1}
								city={destinationDetails.city}
								state={destinationDetails.state}
								zip={destinationDetails.zip}
								rating={destinationDetails.reviewRating}
								longDescription={destinationDetails.description}
								onViewAvailableStaysClick={() => {
									let availableStaysSection = availableStaysRef.current!.offsetTop;
									window.scrollTo({ top: availableStaysSection, behavior: 'smooth' });
								}}
							/>
							{/*TODO: section disabled, pending further information from NDM*/}
							{/*{size !== 'small' && (*/}
							{/*	<CarouselButtons*/}
							{/*		onClickLeft={() => {*/}
							{/*			moveImagesLeft();*/}
							{/*		}}*/}
							{/*		onClickRight={() => {*/}
							{/*			moveImagesRight();*/}
							{/*		}}*/}
							{/*		position={'absolute'}*/}
							{/*		bottom={'0'}*/}
							{/*		right={'-40px'}*/}
							{/*	/>*/}
							{/*)}*/}
						</Box>
						{/*{size !== 'small' ? (*/}
						{/*	<Box overflow={'hidden'}>*/}
						{/*		<div ref={parentRef} className={'featureSlider'}>*/}
						{/*			<div ref={childRef}>*/}
						{/*				<FeatureRoomCard*/}
						{/*					mainImg={require('../../images/landingPage/Margaritaville-Villa-Stay2x.png')}*/}
						{/*					title={'8 bedroom villa'}*/}
						{/*					discountAmount={150}*/}
						{/*					limitedOffer*/}
						{/*					bookNowPath={() => {*/}
						{/*						console.log('book now');*/}
						{/*					}}*/}
						{/*				/>*/}
						{/*			</div>*/}
						{/*		</div>*/}
						{/*	</Box>*/}
						{/*) : (*/}
						{/*	<Carousel*/}
						{/*		children={[*/}
						{/*			<FeatureRoomCard*/}
						{/*				mainImg={require('../../images/landingPage/Margaritaville-Villa-Stay2x.png')}*/}
						{/*				title={'8 bedroom villa'}*/}
						{/*				discountAmount={150}*/}
						{/*				limitedOffer*/}
						{/*				bookNowPath={() => {*/}
						{/*					console.log('book now');*/}
						{/*				}}*/}
						{/*			/>*/}
						{/*		]}*/}
						{/*	/>*/}
						{/*)}*/}
					</Box>
				</Box>
				{renderSectionTwo()}
				{renderSectionThree()}
				{renderSectionFour()}
				{!destinationDetails.isActive ? (
					<div ref={availableStaysRef}>
						<Label variant={'h2'} color={'red'} className={'noDestinations'}>
							This destination is currently not accepting reservations from this site.
						</Label>
					</div>
				) : (
					<div className={'sectionFive'} ref={availableStaysRef}>
						<Label variant={'h1'} mb={20}>
							Available Stays
						</Label>
						{size !== 'small' ? (
							<>
								<FilterBar
									className={'filterBar'}
									startDate={startDateControl}
									endDate={endDateControl}
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
											updateSearchQueryObj('priceRangeMin', parseInt(value));
										}
									}}
									onChangePriceMax={(value) => {
										if (value !== '') {
											updateSearchQueryObj('priceRangeMax', parseInt(value));
										}
									}}
									onChangePropertyType={(control) => {
										setPropertyType(propertyType.clone().update(control));
										updateSearchQueryObj('propertyTypeIds', control.value);
									}}
									adultsInitialInput={searchQueryObj.adults}
									childrenInitialInput={searchQueryObj.children}
									initialPriceMax={
										!!searchQueryObj.priceRangeMax ? searchQueryObj.priceRangeMax.toString() : ''
									}
									initialPriceMin={
										!!searchQueryObj.priceRangeMin ? searchQueryObj.priceRangeMin.toString() : ''
									}
									options={options}
									control={propertyType.get('propertyType')}
								/>
								<Label variant={'body1'} color={'red'}>
									{errorMessage}
								</Label>
								<Accordion
									hideHoverEffect
									hideChevron
									children={
										<RateCodeSelect
											apply={(value) => {
												updateSearchQueryObj('rateCode', value);
											}}
											code={rateCode}
											valid={!validCode}
										/>
									}
									titleReact={<Label variant={'button'}>toggle rate code</Label>}
								/>
							</>
						) : (
							<IconLabel
								className={'moreFiltersLink'}
								labelName={'More Filters'}
								iconImg={'icon-chevron-right'}
								iconPosition={'right'}
								iconSize={8}
								labelVariant={'caption'}
								onClick={() => {
									popupController.open<FilterReservationPopupProps>(FilterReservationPopup, {
										onClickApply: (
											adults: number,
											priceRangeMin: string,
											priceRangeMax: string,
											propertyTypeIds: number[]
										): void => {
											setSearchQueryObj((prev) => {
												let createSearchQueryObj: any = { ...prev };

												createSearchQueryObj['adults'] = adults;
												if (ObjectUtils.isArrayWithData(propertyTypeIds))
													createSearchQueryObj['propertyTypeIds'] = propertyTypeIds;
												if (priceRangeMin !== '' && !isNaN(parseInt(priceRangeMin)))
													createSearchQueryObj['priceRangeMin'] = +priceRangeMin;
												if (priceRangeMax !== '' && !isNaN(parseInt(priceRangeMax)))
													createSearchQueryObj['priceRangeMax'] = +priceRangeMax;
												if (rateCode !== '') createSearchQueryObj['rate'] = rateCode;
												return createSearchQueryObj;
											});
											if (!destinationDetails) return;
											router.updateUrlParams({
												di: destinationDetails.id
											});
										},
										className: 'filterPopup'
									});
								}}
							/>
						)}
						<hr />
						<div className={'accommodationCardWrapper'}>
							{availabilityStayList.length <= 0 ? (
								<Label variant={'h2'}>No available options.</Label>
							) : (
								renderAccommodations()
							)}
						</div>
						<PaginationButtons
							selectedRowsPerPage={5}
							total={totalResults}
							setSelectedPage={(newPage) => {
								updateSearchQueryObj('pagination', { page: newPage, perPage: perPage });
								setPage(newPage);
								let availableStaysSection = availableStaysRef.current!.offsetTop;
								window.scrollTo({ top: availableStaysSection, behavior: 'smooth' });
							}}
							currentPageNumber={page}
						/>
					</div>
				)}
				<Footer links={FooterLinks} />
			</div>
		</Page>
	);
};

export default DestinationDetailsPage;
