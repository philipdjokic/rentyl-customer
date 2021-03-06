import * as React from 'react';
import './DestinationImageGallery.scss';
import Img from '@bit/redsky.framework.rs.img';
import Icon from '@bit/redsky.framework.rs.icon';
import Label from '@bit/redsky.framework.rs.label';
import Button from '@bit/redsky.framework.rs.button';
import { useEffect, useState } from 'react';
import { popupController } from '@bit/redsky.framework.rs.996';
import LightBoxCarouselPopup, {
	TabbedCarouselPopupProps
} from '../../popups/lightBoxCarouselPopup/LightBoxCarouselPopup';
import { ObjectUtils } from '../../utils/utils';

interface DestinationImageGalleryProps {
	onGalleryClick: () => void;
	imageData: Api.Media[];
}

const DestinationImageGallery: React.FC<DestinationImageGalleryProps> = (props) => {
	const [primaryImage, setPrimaryImage] = useState<Api.Media>();
	const [nonPrimaryImages, setNonPrimaryImages] = useState<Api.Media[]>([]);

	useEffect(() => {
		let primaryImg = props.imageData.find((item) => item.isPrimary);
		if (!primaryImg) primaryImg = props.imageData[0];
		let nonPrimaryImgs = props.imageData.filter((item) => !item.isPrimary);
		setNonPrimaryImages(nonPrimaryImgs);

		setPrimaryImage(primaryImg);
	}, [props.imageData]);

	function renderPrimaryImage() {
		if (!primaryImage) return;
		return (
			<Img
				className={'imageOne'}
				src={primaryImage!.urls.imageKit}
				alt={'Primary Destination Image'}
				width={'1920px'}
				height={'auto'}
				onClick={() => {
					popupController.open<TabbedCarouselPopupProps>(LightBoxCarouselPopup, {
						imageData: [primaryImage, ...nonPrimaryImages]
					});
				}}
			/>
		);
	}

	function renderNonPrimaryImageSrc(index: number): string {
		if (!ObjectUtils.isArrayWithData(nonPrimaryImages) || nonPrimaryImages.length <= index) {
			return require('../../images/noImageFound.png');
		} else {
			return nonPrimaryImages[index].urls.imageKit;
		}
	}

	function renderNonPrimaryImages() {
		if (!nonPrimaryImages || !primaryImage) return;
		return (
			<React.Fragment>
				<Img
					className={'imageTwo'}
					src={renderNonPrimaryImageSrc(0)}
					alt={'Destination Image'}
					width={'1920px'}
					height={'auto'}
					onClick={() => {
						if (nonPrimaryImages.length <= 0) return;
						popupController.open<TabbedCarouselPopupProps>(LightBoxCarouselPopup, {
							imageData: [primaryImage, ...nonPrimaryImages],
							defaultImageIndex: 1
						});
					}}
				/>
				<div className={'imageThree'}>
					<Img
						src={renderNonPrimaryImageSrc(1)}
						alt={'Destination Image'}
						width={'1920px'}
						height={'auto'}
						onClick={() => {
							if (nonPrimaryImages.length <= 1) return;
							popupController.open<TabbedCarouselPopupProps>(LightBoxCarouselPopup, {
								imageData: [primaryImage, ...nonPrimaryImages],
								defaultImageIndex: 2
							});
						}}
					/>
					<Button
						look={'none'}
						className={'imageCountContainer'}
						onClick={(event) => {
							event.stopPropagation();
							props.onGalleryClick();
						}}
					>
						<Icon iconImg={'icon-gallery'} color={'#ffffff'} size={18} />
						<Label variant={'subtitle1'}>{`${props.imageData.length}`}</Label>
					</Button>
				</div>
			</React.Fragment>
		);
	}

	return (
		<div className={'rsDestinationImageGallery'}>
			{renderPrimaryImage()}
			{renderNonPrimaryImages()}
		</div>
	);
};

export default DestinationImageGallery;
