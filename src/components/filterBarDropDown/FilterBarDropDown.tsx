import * as React from 'react';
import './FilterBarDropDown.scss';
import Box from '@bit/redsky.framework.rs.996/dist/box/Box';
import Label from '@bit/redsky.framework.rs.label';
import Icon from '@bit/redsky.framework.rs.icon';
import { useState } from 'react';
import LabelButton from '../labelButton/LabelButton';
import useOnClickOutsideRef from '../../customHooks/useOnClickOutsideRef';

interface FilterBarDropDownProps {
	title?: string;
	placeholder?: string;
	onChangeCallBack: () => void;
	onClearCallback: () => void;
	isSortField?: boolean;
	className?: string;
	dropdownContentClassName?: string;
}

const FilterBarDropDown: React.FC<FilterBarDropDownProps> = (props) => {
	const [toggleContent, setToggleContent] = useState<boolean>(false);
	const modalRef = useOnClickOutsideRef(() => {
		if (toggleContent) setToggleContent(false);
	});
	function applyBtnCallback() {
		if (props.onChangeCallBack) props.onChangeCallBack();
		setToggleContent(false);
	}
	function onClearBtnCallBack() {
		if (props.onClearCallback) props.onClearCallback();
		if (props.onChangeCallBack) props.onChangeCallBack();
		setToggleContent(false);
	}
	return (
		<div className="rsFilterBarDropDown">
			<Box
				className={`rsDropdownBtn${props.className ? ` ${props.className}` : ''}`}
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				onClick={() => setToggleContent((prevState) => !prevState)}
			>
				<Box id="labelContainer">
					<Label variant="caption2" className="filterByLabel" paddingBottom={4}>
						{props.isSortField ? 'Sort By' : 'Filter By'}
					</Label>
					<Label variant="body3" className="filterTitleLabel">
						{props.title}
					</Label>
				</Box>
				<Box id="chevronIcon" className="chevronIcon">
					<Icon
						iconImg={`icon-chevron-thin-${toggleContent ? 'down' : 'up'}`}
						size={25}
						color={'#000000BD'}
					/>
				</Box>
			</Box>
			{toggleContent && (
				<Box boxRef={modalRef} className={`DropdownContent ${props.dropdownContentClassName || ''}`}>
					{props.children}
					<Box className="dropdownFooter" borderTop="1px solid #e0e0e0">
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
							height="75px"
							paddingX="10px"
						>
							<LabelButton variant="body1" label="Clear" look="none" onClick={onClearBtnCallBack} />
							<LabelButton
								variant="body2"
								label="Apply"
								look="containedPrimary"
								onClick={applyBtnCallback}
							/>
						</Box>
					</Box>
				</Box>
			)}
		</div>
	);
};

export default FilterBarDropDown;
