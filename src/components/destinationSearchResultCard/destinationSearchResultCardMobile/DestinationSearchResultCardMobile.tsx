import * as React from 'react';
import './DestinationSearchResultCardMobile.scss';
import CarouselV2 from '../../carouselV2/CarouselV2';
import { Box, popupController } from '@bit/redsky.framework.rs.996';
import Label from '@bit/redsky.framework.rs.label';
import router from '../../../utils/router';
import Icon from '@bit/redsky.framework.rs.icon';
import { useRecoilValue } from 'recoil';
import globalState from '../../../state/globalState';
import { StringUtils } from '../../../utils/utils';
import DestinationDetailsMobilePopup, {
	DestinationDetailsMobilePopupProps
} from '../../../popups/destinationDetailsMobilePopup/DestinationDetailsMobilePopup';

interface DestinationSearchResultCardMobileProps {
	className?: string;
	destinationObj: Api.Destination.Res.Availability;
	picturePaths: string[];
	onAddCompareClick?: () => void;
	onGalleryClick: () => void;
	onRemoveCompareClick?: () => void;
	pointsEarnable: number;
	availabilityStayList: Api.Accommodation.Res.Availability[];
}

const DestinationSearchResultCardMobile: React.FC<DestinationSearchResultCardMobileProps> = (props) => {
	const reservationFilters = useRecoilValue(globalState.reservationFilters);

	function renderPricePerNight() {
		if (reservationFilters.redeemPoints) {
			return (
				<Box display={'flex'}>
					<Label variant={'boldCaption1'} className={'yellowText'}>
						{StringUtils.addCommasToNumber(props.destinationObj.minAccommodationPoints)}pts
					</Label>
					<Label variant={'caption1'}>/night</Label>
				</Box>
			);
		} else {
			return (
				<Box display={'flex'}>
					<Label variant={'boldCaption1'}>
						${StringUtils.formatMoney(props.destinationObj.minAccommodationPrice)}/
					</Label>
					<Label variant={'caption1'}>night</Label>
				</Box>
			);
		}
	}

	return (
		<Box className={'rsDestinationSearchResultCardMobile'}>
			<CarouselV2
				path={() => {
					router.updateUrlParams({
						di: props.destinationObj.id,
						startDate: reservationFilters.startDate as string,
						endDate: reservationFilters.endDate as string
					});
					popupController.open<DestinationDetailsMobilePopupProps>(DestinationDetailsMobilePopup);
				}}
				imgPaths={props.picturePaths}
				onAddCompareClick={() => {
					if (props.onAddCompareClick) props.onAddCompareClick();
				}}
				onGalleryClick={props.onGalleryClick}
				onRemoveCompareClick={() => {
					if (props.onRemoveCompareClick) props.onRemoveCompareClick();
				}}
				destinationId={props.destinationObj.id}
			/>
			<Box className={'mobileCardInfo'}>
				<Box display={'flex'} justifyContent={'space-between'} paddingTop={'10px'} paddingBottom={'18px'}>
					<Label variant={'subtitle1'}>{props.destinationObj.name}</Label>
					<Icon
						iconImg={'icon-info-outline'}
						onClick={() => {
							router.updateUrlParams({
								di: props.destinationObj.id,
								startDate: reservationFilters.startDate as string,
								endDate: reservationFilters.endDate as string
							});
							popupController.open<DestinationDetailsMobilePopupProps>(DestinationDetailsMobilePopup);
						}}
						size={20}
					/>
				</Box>
				<Box display={'flex'} justifyContent={'space-between'} paddingBottom={'16px'}>
					{renderPricePerNight()}
					<Label variant={'caption1'} className={'addressLabel'}>
						{StringUtils.buildAddressString({
							city: props.destinationObj.city,
							state: props.destinationObj.state
						})}
					</Label>
				</Box>
				<Box display={'flex'} justifyContent={'flex-end'}>
					{!reservationFilters.redeemPoints && (
						<Label className={'earnText'} variant={'italicBold'}>
							You could earn from {props.pointsEarnable} points for this stay
						</Label>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default DestinationSearchResultCardMobile;
