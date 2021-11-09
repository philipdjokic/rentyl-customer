import * as React from 'react';
import './CarouselV2.scss';
import { useEffect, useRef, useState } from 'react';
import Img from '@bit/redsky.framework.rs.img';
import Button from '@bit/redsky.framework.rs.button';
import Icon from '@bit/redsky.framework.rs.icon';
import { Box } from '@bit/redsky.framework.rs.996';
import router from '../../utils/router';
import Label from '@bit/redsky.framework.rs.label';

interface CarouselV2Props {
	path: string;
	imgPaths: string[];
	onAddCompareClick: () => void;
}

const CarouselV2: React.FC<CarouselV2Props> = (props) => {
	const parentRef = useRef<HTMLDivElement>(null);
	const totalChildren = props.imgPaths.length;
	const [imageViewIndex, setImageViewIndex] = useState<number>(1);

	useEffect(() => {
		setTimeout(() => {
			parentRef.current!.scrollTo({ top: 0, left: 0 });
		}, 50);
	}, []);

	function renderImages() {
		// let images = [
		// 	"https://ik.imagekit.io/redsky/spire/1633461917373_L.jpg",
		// 	"https://ik.imagekit.io/redsky/spire/1633461930016_L.jpg",
		// 	"https://ik.imagekit.io/redsky/spire/1633461920632_L.jpg",
		// 	"https://ik.imagekit.io/redsky/spire/1633461924642_L.jpg"
		// ];

		return props.imgPaths.map((item, index) => {
			return (
				<div key={index}>
					<Img src={item} alt={'img alt'} width={414} height={278} />
				</div>
			);
		});
	}

	return (
		<div
			className={'rsCarouselV2'}
			onClick={() => {
				router.navigate(props.path).catch(console.error);
			}}
		>
			<div ref={parentRef} className={'imageCarouselContainer'}>
				{renderImages()}
			</div>
			<Button
				className={'clickLeft'}
				look={'none'}
				onClick={(event) => {
					event.stopPropagation();
					let val = parentRef.current!.scrollLeft - parentRef.current!.offsetWidth;

					setImageViewIndex(imageViewIndex - 1);
					if (imageViewIndex <= 1) {
						val = parentRef.current!.offsetWidth * totalChildren;
						setImageViewIndex(totalChildren);
					}
					parentRef.current!.scrollTo({ top: 0, left: val, behavior: 'smooth' });
				}}
			>
				<Icon iconImg={'icon-chevron-left'} color={'#001933'} size={8} />
			</Button>
			<Button
				className={'clickRight'}
				look={'none'}
				onClick={(event) => {
					event.stopPropagation();
					let val = parentRef.current!.offsetWidth + parentRef.current!.scrollLeft;
					setImageViewIndex(imageViewIndex + 1);
					if (imageViewIndex >= totalChildren) {
						val = 0;
						setImageViewIndex(1);
					}
					parentRef.current!.scrollTo({ top: 0, left: val, behavior: 'smooth' });
				}}
			>
				<Icon iconImg={'icon-chevron-right'} color={'#001933'} size={8} />
			</Button>
			<Button
				className={'addToCompareButton'}
				look={'none'}
				disableRipple
				onClick={(event) => {
					event.stopPropagation();
					props.onAddCompareClick();
				}}
			>
				<Icon iconImg={'icon-plus'} color={'#ffffff'} size={12} />
				<div className={'compareToolTip'}>
					<div className={'toolTipTriangle'} />
					<Label className={'caption'}>Compare</Label>
				</div>
			</Button>
			<div className={'imageCountContainer'}>
				<Icon iconImg={'icon-gallery'} />
				<Label variant={'body1'}></Label>
			</div>
		</div>
	);
};

export default CarouselV2;
