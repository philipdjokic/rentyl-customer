import * as React from 'react';
import './Select.scss';
import { Box } from '@bit/redsky.framework.rs.996';
import { useEffect, useRef, useState } from 'react';
import Icon from '@bit/redsky.framework.rs.icon';
import SelectOption from './selectOption/SelectOption';

export type SelectOptions = { value: number | string; text: number | string; selected: boolean };

interface SpireSelectProps {
	className?: string;
	placeHolder?: string;
	showSelectedAsPlaceHolder?: boolean;
	onChange: (value: string | number | null) => void;
	options: SelectOptions[];
	autoCalculateWidth?: boolean;
}

const Select: React.FC<SpireSelectProps> = (props) => {
	const popupRef = useRef<HTMLElement>(null);
	const optionContainerRef = useRef<HTMLElement>(null);
	const [showOptions, setShowOptions] = useState<boolean>(false);
	const [options, setOptions] = useState<SelectOptions[]>([]);
	const [selectedValue, setSelectedValue] = useState<number | string | null>('');
	const [selectedText, setSelectedText] = useState<number | string | null>('');

	useEffect(() => {
		function handleClickOutside(event: any) {
			if (popupRef && popupRef.current && !popupRef.current.contains(event.target)) {
				setShowOptions(false);
				optionContainerRef.current!.style.height = '';
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		setOptions([...props.options]);
		setSelectedValue(getInitialSelectedData('value', [...props.options]));
		setSelectedText(getInitialSelectedData('text', [...props.options]));
	}, [props.options]);

	function getInitialSelectedData(type: 'value' | 'text', arrayOptions: SelectOptions[]) {
		return arrayOptions
			.filter((item) => {
				return item.selected;
			})
			.map((item) => {
				return item[type];
			})[0];
	}

	function renderOptions() {
		return options.map((item, index) => {
			return (
				<SelectOption
					key={item.value}
					value={item.value}
					text={item.text}
					onSelect={(value, text) => {
						let newOptions = [...options];
						newOptions = newOptions.map((item) => {
							return {
								selected: item.value === value,
								value: item.value,
								text: item.text
							};
						});
						setOptions(newOptions);
						setSelectedValue(value);
						setSelectedText(text);
						props.onChange(value);
						setShowOptions(false);
						optionContainerRef.current!.style.height = '';
					}}
					onDeselect={() => {
						let newOptions = [...options];
						newOptions = newOptions.map((item) => {
							return {
								selected: false,
								value: item.value,
								text: item.text
							};
						});
						setOptions(newOptions);
						setSelectedValue(null);
						setSelectedText(null);
						props.onChange(null);
						setShowOptions(false);
						optionContainerRef.current!.style.height = '';
					}}
					selected={item.selected}
				/>
			);
		});
	}

	function renderPlaceHolder() {
		if (!selectedValue) return props.placeHolder;
		else return <span className={'primaryTextColor'}>{selectedText}</span>;
	}

	function renderOptionsHeight() {
		let container = optionContainerRef.current;
		if (container) {
			if (container.style.height) {
				container.style.height = '';
			} else {
				container.style.height = container.scrollHeight + 20 + 'px';
			}
		}
	}

	function renderContainerWidth() {
		if (!props.autoCalculateWidth) return {};

		let containerWidth = 0;
		props.options.forEach((item) => {
			if (item.text.toString().length > containerWidth) containerWidth = item.text.toString().length;
		});
		return { width: containerWidth + 'ch' };
	}

	return (
		<div ref={popupRef} className={`rsSelect ${props.className || ''}`} style={renderContainerWidth()}>
			<Box
				className={'placeHolder'}
				display={'flex'}
				alignItems={'center'}
				justifyContent={'space-between'}
				onClick={() => {
					setShowOptions(!showOptions);
					renderOptionsHeight();
				}}
			>
				{renderPlaceHolder()}
				<Icon
					iconImg={'icon-chevron-down'}
					className={showOptions ? 'iconSpinDown' : 'iconSpinUp'}
					color={'#dedede'}
				/>
			</Box>

			<div ref={optionContainerRef} className={showOptions ? 'optionList show' : 'optionList'}>
				{renderOptions()}
			</div>
		</div>
	);
};

export default Select;
