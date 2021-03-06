import * as React from 'react';
import { useEffect, useState } from 'react';
import { Popup, popupController } from '@bit/redsky.framework.rs.996';
import { PopupProps } from '@bit/redsky.framework.rs.996/dist/popup/Popup';
import './FilterReservationPopup.scss';
import Label from '@bit/redsky.framework.rs.label/dist/Label';
import Paper from '../../components/paper/Paper';
import LabelButton from '../../components/labelButton/LabelButton';
import { WebUtils } from '../../utils/utils';
import { RsFormControl, RsFormGroup, RsValidator, RsValidatorEnum } from '@bit/redsky.framework.rs.form';
import { rsToastify } from '@bit/redsky.framework.rs.toastify';
import DestinationService from '../../services/destination/destination.service';
import serviceFactory from '../../services/serviceFactory';
import Box from '@bit/redsky.framework.rs.996/dist/box/Box';
import Icon from '@bit/redsky.framework.rs.icon';
import LabelRadioButton from '../../components/labelRadioButton/LabelRadioButton';
import Counter from '../../components/counter/Counter';
import Switch from '@bit/redsky.framework.rs.switch';
import LabelCheckboxFilterBar from '../../components/labelCheckbox/LabelCheckboxFilterBar';
import Slider, { SliderMode } from '@bit/redsky.framework.rs.slider';
import LabelInputFilterBar from '../../components/labelInput/LabelInputFilterBar';
import globalState from '../../state/globalState';
import { useRecoilState } from 'recoil';
import AccommodationService from '../../services/accommodation/accommodation.service';

export interface FilterReservationPopupProps extends PopupProps {
	className?: string;
}

const TIMEOUT_INTERVAL = 500;

const FilterReservationPopup: React.FC<FilterReservationPopupProps> = (props) => {
	const destinationService = serviceFactory.get<DestinationService>('DestinationService');
	const accommodationService = serviceFactory.get<AccommodationService>('AccommodationService');
	const [reservationFilters, setReservationFilters] = useRecoilState<Misc.ReservationFilters>(
		globalState.reservationFilters
	);
	const [propertyTypes, setPropertyTypes] = useState<Model.PropertyType[]>([]);
	const [experienceOptions, setExperienceOptions] = useState<Misc.OptionType[]>([]);
	const [amenityOptions, setAmenityOptions] = useState<Misc.OptionType[]>([]);
	const [filterForm, setFilterForm] = useState<RsFormGroup>(
		new RsFormGroup([
			//propertyTypeIds are the text accommodationType on the front end.
			//We already have accommodationType and this was already listed as propertyType on the backend.
			new RsFormControl('propertyTypeIds', reservationFilters.propertyTypeIds || [], []),
			new RsFormControl('adultCount', reservationFilters.adultCount || 1, [
				new RsValidator(RsValidatorEnum.REQ, '# Of Adults Required')
			]),
			new RsFormControl('bedroomCount', reservationFilters.bedroomCount || 0, [
				new RsValidator(RsValidatorEnum.REQ, '# Of Bedrooms Required')
			]),
			new RsFormControl('bathroomCount', reservationFilters.bathroomCount || 0, [
				new RsValidator(RsValidatorEnum.REQ, '# Of Bathrooms Required')
			]),
			new RsFormControl('priceRangeMax', reservationFilters.priceRangeMax || 1000, []),
			new RsFormControl('priceRangeMin', reservationFilters.priceRangeMin || 1, []),
			new RsFormControl('experienceIds', reservationFilters.experienceIds || [], []),
			new RsFormControl('amenityIds', reservationFilters.amenityIds || [], []),
			new RsFormControl('sortOrder', reservationFilters.sortOrder || 'ASC', [])
		])
	);
	let timeout: number;

	useEffect(() => {
		const filters = WebUtils.parseURLParamsToFilters();
		let {
			propertyTypeControl,
			adultCountControl,
			bedroomCountControl,
			bathroomCountControl,
			priceRangeMinControl,
			priceRangeMaxControl,
			experienceIdsControl,
			amenityIdsControl,
			sortOrderControl
		} = getAllControls();

		propertyTypeControl.value = filters.propertyTypeIds || [];
		adultCountControl.value = filters.adultCount;
		bedroomCountControl.value = filters.bedroomCount || 0;
		bathroomCountControl.value = filters.bathroomCount || 0;
		priceRangeMinControl.value = filters.priceRangeMin || 10;
		priceRangeMaxControl.value = filters.priceRangeMax || 1000;
		experienceIdsControl.value = filters.experienceIds || [];
		amenityIdsControl.value = filters.amenityIds || [];
		sortOrderControl.value = filters.sortOrder;

		updateAllControls([
			propertyTypeControl,
			adultCountControl,
			bedroomCountControl,
			bathroomCountControl,
			priceRangeMinControl,
			priceRangeMaxControl,
			experienceIdsControl,
			amenityIdsControl,
			sortOrderControl
		]);
		//update all controls

		setReservationFilters(filters);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		async function getAllFiltersOptions() {
			try {
				const propertyTypes = await destinationService.getAllPropertyTypes();
				const experiences = await destinationService.getExperienceTypes();
				const amenities = await accommodationService.getAllAmenities();
				setPropertyTypes(propertyTypes);
				setExperienceOptions(
					experiences.map((experience) => {
						return { value: experience.id, label: experience.title };
					})
				);
				setAmenityOptions(
					amenities.map((amenity) => {
						return { value: amenity.id, label: amenity.title };
					})
				);
			} catch (e) {
				rsToastify.error(
					'An unexpected error occurred on the server, unable to get all the options.',
					'Server Error!'
				);
			}
		}

		getAllFiltersOptions().catch(console.error);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		/**
		 * This is used to update the url parameters anytime the recoil state changes
		 */
		WebUtils.updateUrlParams(reservationFilters);
	}, [reservationFilters]);

	function getAllControls(): { [key: string]: RsFormControl } {
		let propertyTypeControl = filterForm.get('propertyTypeIds');
		let adultCountControl = filterForm.get('adultCount');
		let bedroomCountControl = filterForm.get('bedroomCount');
		let bathroomCountControl = filterForm.get('bathroomCount');
		let priceRangeMinControl = filterForm.get('priceRangeMin');
		let priceRangeMaxControl = filterForm.get('priceRangeMax');
		let experienceIdsControl = filterForm.get('experienceIds');
		let amenityIdsControl = filterForm.get('amenityIds');
		let sortOrderControl = filterForm.get('sortOrder');
		return {
			propertyTypeControl,
			adultCountControl,
			bedroomCountControl,
			bathroomCountControl,
			priceRangeMinControl,
			priceRangeMaxControl,
			experienceIdsControl,
			amenityIdsControl,
			sortOrderControl
		};
	}

	function updateAllControls(controls: RsFormControl[]) {
		let formClone = filterForm.clone();
		controls.forEach((control) => {
			formClone.update(control);
		});
		setFilterForm(formClone);
	}

	function sanitizePriceFieldsAndUpdate(control: RsFormControl) {
		if (!control) return;
		control.value = control.value.toString().replaceAll(/[^0-9]/g, '');
		updateFilterFormWithTimeout(control);
	}

	function updateFilterFormWithTimeout(control: RsFormControl | undefined) {
		if (timeout) window.clearTimeout(timeout);
		timeout = window.setTimeout(() => updateFilterForm(control), TIMEOUT_INTERVAL);
	}

	function updateFilterForm(control: RsFormControl | undefined) {
		if (!control) return;
		filterForm.update(control);
		setFilterForm(filterForm.clone());
	}

	function clearAll() {
		let {
			propertyTypeControl,
			bedroomCountControl,
			adultCountControl,
			bathroomCountControl,
			priceRangeMinControl,
			priceRangeMaxControl,
			experienceIdsControl,
			amenityIdsControl,
			sortOrderControl
		} = getAllControls();

		propertyTypeControl.value = [];
		adultCountControl.value = 1;
		bedroomCountControl.value = 0;
		bathroomCountControl.value = 0;
		priceRangeMinControl.value = 10;
		priceRangeMaxControl.value = 1000;
		experienceIdsControl.value = [];
		amenityIdsControl.value = [];
		sortOrderControl.value = 'ASC';

		updateAllControls([
			propertyTypeControl,
			bedroomCountControl,
			adultCountControl,
			bathroomCountControl,
			priceRangeMinControl,
			priceRangeMaxControl,
			experienceIdsControl,
			amenityIdsControl,
			sortOrderControl
		]);
	}

	function saveFilter() {
		setReservationFilters((prev) => {
			const form = filterForm.toModel<{
				adultCount: number;
				priceRangeMin: number;
				priceRangeMax: number;
				accommodationType: number[];
				bedroomCount: number;
				bathroomCount: number;
				propertyTypeIds: number[];
			}>();
			return { ...prev, ...form };
		});
		popupController.close(FilterReservationPopup);
	}

	function renderAccommodationCheckboxes() {
		return propertyTypes.map((item) => (
			<LabelCheckboxFilterBar
				className="listCheckboxes"
				key={item.id}
				value={item.id}
				text={item.name}
				onSelect={() => {
					let tempControl = filterForm.get('propertyTypeIds');
					tempControl.value = [...(tempControl.value as number[]), item.id];
					updateFilterForm(tempControl);
				}}
				isChecked={(filterForm.get('propertyTypeIds').value as number[]).includes(item.id as number)}
				onDeselect={() => {
					filterForm.get('propertyTypeIds').value = (
						filterForm.get('propertyTypeIds').value as number[]
					).filter((type) => type !== item.id);
					updateFilterForm(filterForm.get('propertyTypeIds'));
				}}
			/>
		));
	}

	function renderResortExperiences() {
		return (
			<>
				{experienceOptions.map((item) => (
					<Box marginY={10}>
						<LabelCheckboxFilterBar
							key={item.value}
							value={item.value}
							text={item.label}
							onSelect={() => {
								let tempControl = filterForm.get('experienceIds');
								tempControl.value = [...(tempControl.value as number[]), item.value as number];
								updateFilterForm(tempControl);
							}}
							isChecked={(filterForm.get('experienceIds').value as number[]).includes(
								item.value as number
							)}
							onDeselect={() => {
								filterForm.get('experienceIds').value = (
									filterForm.get('experienceIds').value as number[]
								).filter((id) => id !== item.value);
								updateFilterForm(filterForm.get('propertyTypeIds'));
							}}
						/>
					</Box>
				))}
			</>
		);
	}

	function renderInUnitAmenities() {
		return (
			<>
				{amenityOptions.map((item) => (
					<Box marginY={10}>
						<LabelCheckboxFilterBar
							key={item.value}
							value={item.value}
							text={item.label}
							onSelect={() => {
								let tempControl = filterForm.get('amenityIds');
								tempControl.value = [...(tempControl.value as number[]), item.value as number];
								updateFilterForm(tempControl);
							}}
							isChecked={(filterForm.get('amenityIds').value as number[]).includes(item.value as number)}
							onDeselect={() => {
								filterForm.get('amenityIds').value = (
									filterForm.get('amenityIds').value as number[]
								).filter((id) => id !== item.value);
								updateFilterForm(filterForm.get('propertyTypeIds'));
							}}
						/>
					</Box>
				))}
			</>
		);
	}

	return (
		<Popup opened={props.opened} preventCloseByBackgroundClick>
			<div className={'rsFilterReservationPopup'}>
				<Paper className={'paperWrapper'}>
					<Box className="paperHeader">
						<Label className={'filtersLabel'} variant={'h5'}>
							Filters
						</Label>
						<Label onClick={() => popupController.closeLast()}>
							<Icon iconImg="icon-close" size={20} className="closeIcon" />
						</Label>
					</Box>
					<Box className="paperBody">
						<div className="formDiv" id="sortByDiv">
							<Label className="sortByLabel" variant="body1" marginBottom={15}>
								Sort by
							</Label>
							<LabelRadioButton
								radioName="highestRadioBtn"
								value="sortHigh"
								checked={filterForm.get('sortOrder').value === 'DESC'}
								text="Highest Price"
								onSelect={() => {
									let tempControl = filterForm.get('sortOrder');
									tempControl.value = 'DESC';
									updateFilterForm(tempControl);
								}}
								labelSize="body2"
								className="labelRadio"
							/>
							<LabelRadioButton
								radioName="lowestRadioBtn"
								value="sortLow"
								checked={filterForm.get('sortOrder').value === 'ASC'}
								text="Lowest Price"
								onSelect={() => {
									let tempControl = filterForm.get('sortOrder');
									tempControl.value = 'ASC';
									updateFilterForm(tempControl);
								}}
								labelSize="body2"
								className="labelRadio"
							/>
						</div>
						<div className="formDiv" id="guestsDiv">
							<Counter
								title="Guests"
								control={filterForm.get('adultCount')}
								updateControl={updateFilterForm}
								className={'filterCounter'}
								minCount={1}
								maxCount={28}
								labelMarginRight={5}
							/>
							<Counter
								title="Bedrooms"
								control={filterForm.get('bedroomCount')}
								updateControl={updateFilterForm}
								className={'filterCounter'}
								minCount={0}
								maxCount={15}
								labelMarginRight={5}
							/>
							<Counter
								title="Bathrooms"
								control={filterForm.get('bathroomCount')}
								updateControl={updateFilterForm}
								className={'filterCounter'}
								minCount={0}
								maxCount={15}
								labelMarginRight={5}
							/>
						</div>
						<div className="formDiv" id="redeemPointsDiv">
							<Box className="redeemPointsContainer">
								<Label className="redeemPointsLabel" variant="body1">
									Redeem Points
								</Label>
								<Switch
									className={'toggleButton'}
									label={'{"left":"" }'}
									onChange={() =>
										setReservationFilters({
											...reservationFilters,
											redeemPoints: !reservationFilters.redeemPoints
										})
									}
									checked={reservationFilters.redeemPoints}
								/>
							</Box>
						</div>
						<div className="formDiv" id="priceSliderDiv">
							<Label className="priceLabel" variant="body1" marginY={15}>
								Price
							</Label>
							<Slider
								range={[1, 1000]}
								minControl={filterForm.get('priceRangeMin')}
								maxControl={filterForm.get('priceRangeMax')}
								sliderIcons={'icon-hamburger-menu'}
								rotate={90}
								updateMinControl={updateFilterForm}
								updateMaxControl={updateFilterForm}
								mode={SliderMode.COLLISION}
								handleStyle={{ border: '1px solid black', borderRadius: '50%' }}
								railClass="priceSliderRail"
								sliderClass="priceSlider"
							/>
							<div className={'minMaxDiv'}>
								<LabelInputFilterBar
									className={`priceMin ${
										Number(filterForm.get('priceRangeMin').value) >= 1000 ? 'andGreater' : ''
									}`}
									inputType="text"
									title="min price"
									control={filterForm.get('priceRangeMin')}
									updateControl={sanitizePriceFieldsAndUpdate}
								/>
								<hr className="divider" />
								<LabelInputFilterBar
									className={`priceMax ${
										Number(filterForm.get('priceRangeMax').value) >= 1000 ? 'andGreater' : ''
									}`}
									inputType="text"
									title="max price"
									control={filterForm.get('priceRangeMax')}
									updateControl={sanitizePriceFieldsAndUpdate}
								/>
							</div>
						</div>
						<div className="formDiv" id="accommodationDiv">
							<Label className="accommodationLabel" variant="body1" marginY={15}>
								Accommodation
							</Label>
							{renderAccommodationCheckboxes()}
						</div>
						<div className="formDiv" id="resortExperiencesDiv">
							<Label className="accommodationLabel" variant="body1" marginY={15}>
								Resort Experiences
							</Label>
							{renderResortExperiences()}
						</div>
						<div className="formDiv bottomForm" id="resortExperiencesDiv">
							<Label className="accommodationLabel" variant="body1" marginY={15}>
								In Unit Amenities
							</Label>
							{renderInUnitAmenities()}
						</div>
					</Box>
					<div className={'paperFooter'}>
						<LabelButton
							className={'cancelButton'}
							look={'containedSecondary'}
							variant={'button'}
							label={'Clear'}
							onClick={clearAll}
						/>
						<LabelButton
							className={'applyButton'}
							look={'containedPrimary'}
							variant={'button'}
							label={'Apply'}
							onClick={() => {
								saveFilter();
							}}
						/>
					</div>
				</Paper>
			</div>
		</Popup>
	);
};

export default FilterReservationPopup;
