import React, { useEffect, useState } from 'react';
import moment from 'moment';
import DateRangeSelector from '../dateRangeSelector/DateRangeSelector';
import LabelInput from '../labelInput/LabelInput';
import './FilterBar.scss';
import debounce from 'lodash.debounce';
import { Box } from '@bit/redsky.framework.rs.996';
import { StringUtils, WebUtils } from '../../utils/utils';
import LabelSelect from '../labelSelect/LabelSelect';
import { OptionType } from '@bit/redsky.framework.rs.select';
import { RsFormControl, RsFormGroup } from '@bit/redsky.framework.rs.form';
import serviceFactory from '../../services/serviceFactory';
import DestinationService from '../../services/destination/destination.service';
import { rsToastify } from '@bit/redsky.framework.rs.toastify';

export interface FilterBarProps {
	startDate: moment.Moment | null;
	endDate: moment.Moment | null;
	onDatesChange: (startDate: moment.Moment | null, endDate: moment.Moment | null) => void;
	focusedInput: 'startDate' | 'endDate' | null;
	onFocusChange: (focusedInput: 'startDate' | 'endDate' | null) => void;
	monthsToShow: number;
	onChangeAdults: (value: any) => void;
	onChangeChildren: (value: any) => void;
	onChangePriceMin: (value: any) => void;
	onChangePriceMax: (value: any) => void;
	onChangePropertyType: (control: RsFormControl) => void;
	adultsInitialInput?: string;
	childrenInitialInput?: string;
	initialPriceMin?: string;
	initialPriceMax?: string;
	className?: string;
	display?: string;
	control: RsFormControl;
	options: OptionType[];
}

const FilterBar: React.FC<FilterBarProps> = (props) => {
	return (
		<Box className={`rsFilterBar ${props.className || ''}`}>
			<DateRangeSelector
				startDate={props.startDate}
				endDate={props.endDate}
				onDatesChange={props.onDatesChange}
				monthsToShow={props.monthsToShow}
				focusedInput={props.focusedInput}
				onFocusChange={(focusedInput) => props.onFocusChange(focusedInput)}
				startDateLabel={'check in'}
				endDateLabel={'check out'}
			/>
			<LabelInput
				className="numberOfAdults"
				inputType="text"
				title="# of Adults"
				initialValue={props.adultsInitialInput || '2'}
				onChange={debounce(async (value) => {
					if (!isNaN(parseInt(value)) && parseInt(value) < 1) {
						value = 1;
					}
					props.onChangeAdults(value);
				}, 300)}
			/>
			<LabelInput
				className="numberOfChildren"
				inputType="text"
				title="# of Children"
				initialValue={props.childrenInitialInput || '0'}
				onChange={debounce(async (value) => {
					props.onChangeChildren(value);
				}, 300)}
			/>
			<LabelInput
				className="priceMin"
				inputType="text"
				title="Price Min"
				initialValue={`$${StringUtils.addCommasToNumber(props.initialPriceMin)}` || ''}
				onChange={debounce(async (value) => {
					props.onChangePriceMin(
						value === '' ? 0 : StringUtils.removeLineEndings(value.replace(/[,$]/g, ''))
					);
				}, 500)}
			/>
			<LabelInput
				className="priceMax"
				inputType="text"
				title="Price Max"
				initialValue={`$${StringUtils.addCommasToNumber(props.initialPriceMax)}` || ''}
				onChange={debounce(async (value) => {
					props.onChangePriceMax(
						value === '' ? 0 : StringUtils.removeLineEndings(value.replace(/[,$]/g, ''))
					);
				}, 500)}
			/>
			<LabelSelect
				className={props.display}
				title="Property Type"
				control={props.control}
				updateControl={(control) => {
					props.onChangePropertyType(control);
				}}
				selectOptions={props.options}
				isMulti={true}
			/>
		</Box>
	);
};

export default FilterBar;
