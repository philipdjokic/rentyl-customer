import * as React from 'react';
import './BookNowImage.scss';
import Label from '@bit/redsky.framework.rs.label/dist/Label';
import LabelLink from '../labelLink/LabelLink';
import { Box } from '@bit/redsky.framework.rs.996';
import useWindowResizeChange from '../../customHooks/useWindowResizeChange';
import LabelButton from '../labelButton/LabelButton';
import router from '../../utils/router';

interface BookNowImageProps {
	width: string;
	height: string;
	title?: string;
	reactTitle?: React.ReactNode;
	linkPath: string;
	imgUrl: string;
}

const BookNowImage: React.FC<BookNowImageProps> = (props) => {
	const size = useWindowResizeChange();

	function renderStyle() {
		let styles: any = {
			width: props.width,
			height: props.height,
			backgroundImage: `url(${props.imgUrl})`
		};
		return styles;
	}

	return (
		<div className={'rsBookNowImage'} style={renderStyle()}>
			<Box>
				{!!props.reactTitle ? (
					props.reactTitle
				) : (
					<Label mb={5} variant={'body1'}>
						{props.title}
					</Label>
				)}
				{size !== 'small' ? (
					<LabelLink
						path={props.linkPath}
						label={'Book Now'}
						variant={'button'}
						iconRight={'icon-chevron-right'}
						iconSize={7}
						iconColor={'#ffffff'}
					/>
				) : (
					<LabelButton
						variant={'button'}
						label={'Book Now'}
						look={'containedPrimary'}
						onClick={() => {
							router.navigate(props.linkPath).catch(console.error);
						}}
					/>
				)}
			</Box>
		</div>
	);
};

export default BookNowImage;