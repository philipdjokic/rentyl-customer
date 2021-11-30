import * as React from 'react';
import './AccommodationsPopup.scss';
import { Box, Popup, popupController, PopupProps } from '@bit/redsky.framework.rs.996';
import Paper from '../../components/paper/Paper';
import Icon from '@bit/redsky.framework.rs.icon';
import { useEffect } from 'react';
import Label from '@bit/redsky.framework.rs.label';
import { DestinationSummaryTab } from '../../components/tabbedDestinationSummary/TabbedDestinationSummary';
import AccommodationSearchCardV2 from '../../components/accommodationSearchCardV2/AccommodationSearchCardV2';

export interface AccommodationsPopupProps extends PopupProps {
	content: DestinationSummaryTab;
}

const AccommodationsPopup: React.FC<AccommodationsPopupProps> = (props) => {
	useEffect(() => {
		console.log(props.content);
	}, []);

	function renderAccommodations() {
		return props.content.content.accommodations.map((accommodation) => {
			return <AccommodationSearchCardV2 key={accommodation.id} accommodation={accommodation} />;
		});
	}

	return (
		<Popup opened={props.opened} className={'rsAccommodationsPopup'}>
			<Paper className={'accommodationCardsContainer'}>
				<Box className={'titleContainer'}>
					<Label variant={'customEighteen'}>
						{props.content.content.destinationName} - {props.content.label}
					</Label>
					<Icon
						className={'closeIcon'}
						iconImg={'icon-close'}
						size={30}
						onClick={() => {
							popupController.close(AccommodationsPopup);
						}}
					/>
				</Box>
				{renderAccommodations()}
			</Paper>
		</Popup>
	);
};

export default AccommodationsPopup;
