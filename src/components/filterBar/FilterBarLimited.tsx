import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import './FilterBarLimited.scss';
import { Box } from '@bit/redsky.framework.rs.996';
import { formatFilterDateForServer, ObjectUtils, StringUtils } from '../../utils/utils';
import { RsFormControl, RsFormGroup, RsValidator, RsValidatorEnum } from '@bit/redsky.framework.rs.form';
import { useRecoilState } from 'recoil';
import globalState from '../../state/globalState';
import { rsToastify } from '@bit/redsky.framework.rs.toastify';
import MaskedDateRangeSelector from '../maskedDateRangeSelector/MaskedDateRangeSelector';
import Button from '@bit/redsky.framework.rs.button';
import DateRangeSelector from '../dateRangeSelector/DateRangeSelector';
import Counter from '../counter/Counter';
import TitleLabel from '../topSearchBar/titleLabel/TitleLabel';

export interface FilterBarProps {
	destinationId?: number;
	hide?: boolean;
	isMobile?: boolean;
}

const FilterBarLimited: React.FC<FilterBarProps> = (props) => {
	const [focusedInput, setFocusedInput] = useState<'startDate' | 'endDate' | null>(null);
	const [reservationFilters, setReservationFilters] = useRecoilState<Misc.ReservationFilters>(
		globalState.reservationFilters
	);
	const [startDateControl, setStartDateControl] = useState<moment.Moment | null>(
		moment(reservationFilters.startDate)
	);
	const [endDateControl, setEndDateControl] = useState<moment.Moment | null>(moment(reservationFilters.endDate));
	const [filterForm, setFilterForm] = useState<RsFormGroup>(
		new RsFormGroup([
			new RsFormControl('adultCount', reservationFilters.adultCount || 2, [
				new RsValidator(RsValidatorEnum.REQ, '# of Guests Required'),
				new RsValidator(RsValidatorEnum.CUSTOM, 'Required', (control) => {
					return control.value !== 0;
				})
			])
		])
	);

	const labelInputRef = useRef<HTMLElement>(null);

	// Refreshes the accommodations when this page is hit on a verified accommodation error.
	useEffect(() => {
		updateSearchQuery().catch(console.error);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function updateSearchQuery() {
		let isFormValid = await filterForm.isValid();
		let _isFormFilledOut = isFormFilledOut();
		if (!(await (isFormValid && _isFormFilledOut))) return;

		updateSearchQueryObj('startDate', formatFilterDateForServer(startDateControl, 'start'));
		updateSearchQueryObj('endDate', formatFilterDateForServer(endDateControl, 'end'));
		updateSearchQueryObj('adultCount', filterForm.get('adultCount').value);
	}

	async function updateFilterForm(control: RsFormControl) {
		if (control.key === 'adultCount') {
			let newValue: string | number = '';
			if (control.value.toString().length > 0) {
				let value = StringUtils.removeAllExceptNumbers(control.value.toString());
				if (value.length !== 0) {
					newValue = parseInt(value);
				}
				control.value = newValue;
			}
		}
		if (control.key === 'adultCount' && labelInputRef.current) {
			const dataGuestCount = !!control.value ? `${control.value} guests` : '';
			labelInputRef.current.setAttribute('data-guest-count', dataGuestCount);
		}
		filterForm.update(control);
		await filterForm.isValid();
		setFilterForm(filterForm.clone());
	}

	function isFormFilledOut(): boolean {
		return !!filterForm.get('adultCount').value.toString().length;
	}

	function updateSearchQueryObj(key: string, value: any) {
		if (key === 'adultCount' && value === 0) {
			//this should never evaluate to true with current implementations.
			throw rsToastify.error('Must have at least 1 guest', 'Missing or Incorrect Information');
		}
		if (key === 'adultCount' && isNaN(value)) {
			throw rsToastify.error('# of guests must be a number', 'Missing or Incorrect Information');
		}
		setReservationFilters((prev) => {
			let createSearchQueryObj: any = { ...prev };
			if (value === '' || value === undefined) delete createSearchQueryObj[key];
			else createSearchQueryObj[key] = value;
			if (key === 'regionIds' || key === 'propertyTypeIds') {
				if (!ObjectUtils.isArrayWithData(value)) delete createSearchQueryObj[key];
			}
			return createSearchQueryObj;
		});
	}

	function onDatesChange(startDate: moment.Moment | null, endDate: moment.Moment | null): void {
		setStartDateControl(startDate);
		setEndDateControl(endDate);
	}

	function renderDateRangeSelector() {
		if (props.isMobile) {
			return (
				<DateRangeSelector
					startDate={startDateControl}
					endDate={endDateControl}
					onDatesChange={onDatesChange}
					monthsToShow={1}
					startDateLabel={'Selected dates'}
					focusedInput={focusedInput}
					onFocusChange={(input) => setFocusedInput(input)}
				/>
			);
		}

		return (
			<MaskedDateRangeSelector
				startDate={startDateControl}
				endDate={endDateControl}
				onDatesChange={onDatesChange}
				monthsToShow={2}
				startDateLabel={'Check in'}
				endDateLabel={'Check out'}
			/>
		);
	}

	function mobileGuestCounter() {
		return (
			<TitleLabel
				className="guestInputMobile"
				title={'Guests'}
				label={`${filterForm.get('adultCount').value}`}
				popoutBoxContent={
					<Counter
						title={'Guests'}
						className="guestsInput"
						control={filterForm.get('adultCount')}
						updateControl={updateFilterForm}
						minCount={1}
						maxCount={28}
						labelMarginRight={84}
					/>
				}
				titleLabelRef={labelInputRef}
				labelVariant="customFifteen"
				titleMarginBottom={0}
				popoutBoxPadding={'20px 10px'}
			/>
		);
	}

	return (
		<Box className={`rsFilterBarLimited ${props.isMobile ? 'small' : ''}`}>
			{renderDateRangeSelector()}
			{props.isMobile ? (
				mobileGuestCounter()
			) : (
				<TitleLabel
					className="guestInput"
					title={'Guests'}
					label={`${filterForm.get('adultCount').value} guests`}
					popoutBoxContent={
						<Counter
							title={'Guests'}
							className="guestsInput"
							control={filterForm.get('adultCount')}
							updateControl={updateFilterForm}
							minCount={1}
							maxCount={28}
							labelMarginRight={84}
						/>
					}
					titleLabelRef={labelInputRef}
				/>
			)}
			<Button look={'containedPrimary'} className={'updateButton'} onClick={updateSearchQuery}>
				Update
			</Button>
		</Box>
	);
};

export default FilterBarLimited;
