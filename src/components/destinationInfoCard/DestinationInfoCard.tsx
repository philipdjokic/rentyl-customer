import * as React from 'react';
import './DestinationInfoCard.scss';
import Paper from '../paper/Paper';
import Label from '@bit/redsky.framework.rs.label';
import StarRating from '../starRating/StarRating';
import Box from '../box/Box';
import LabelLink from '../labelLink/LabelLink';
import LabelButton from '../labelButton/LabelButton';

interface DestinationInfoCardProps {
	destinationId: number;
	destinationName: string;
	destinationImage: string;
	address: string;
	city: string;
	state: string;
	zip: number;
	rating: 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;
	longDescription: string;
}

const DestinationInfoCard: React.FC<DestinationInfoCardProps> = (props) => {
	return (
		<Paper
			className={'rsDestinationInfoCard'}
			padding={'50px'}
			boxShadow
			backgroundColor={'#FCFBF8'}
			width={'536px'}
			height={'458px'}
		>
			<img src={props.destinationImage} alt={'Destination Logo'} />
			<Label variant={'caption'}>
				{props.address}, {props.state}, {props.city} {props.zip}
			</Label>
			<Label variant={'h1'}>{props.destinationName}</Label>
			<Box display={'flex'} marginBottom={'15px'}>
				<StarRating size={'small16px'} rating={props.rating} />
				<LabelLink
					path={`/ratings?ri=${props.destinationId}`}
					externalLink={false}
					label={'view ratings'}
					variant={'button'}
				/>
			</Box>
			<Label variant={'body2'}>{props.longDescription}</Label>
			<Box display={'flex'} marginTop={'30px'}>
				<LabelButton look={'containedPrimary'} variant={'button'} label={'View Available Stays'} />
				<LabelLink
					path={'/'}
					externalLink={false}
					label={'Watch video'}
					variant={'button'}
					iconRight={'icon-chevron-circle-right'}
					iconSize={12}
				/>
			</Box>
		</Paper>
	);
};

export default DestinationInfoCard;
