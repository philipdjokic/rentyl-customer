import * as React from 'react';
import './ComparisonDrawer.scss';
import useWindowResizeChange from '../../customHooks/useWindowResizeChange';
import ResortComparisonCard from '../../components/resortComparisonCard/ResortComparisonCard';
import LabelButton from '../../components/labelButton/LabelButton';
import { useRecoilState } from 'recoil';
import globalState from '../../state/globalState';
import { ObjectUtils } from '../../utils/utils';
import { Box, popupController } from '@bit/redsky.framework.rs.996';
import Icon from '@bit/redsky.framework.rs.icon';
import Button from '@bit/redsky.framework.rs.button';
import Label from '@bit/redsky.framework.rs.label/dist/Label';
import ComparisonPopup, { ComparisonPopupProps } from '../comparisonPopup/ComparisonPopup';
import { useEffect } from 'react';

const ComparisonDrawer: React.FC = () => {
	const size = useWindowResizeChange();
	const [recoilComparisonState, setRecoilComparisonState] = useRecoilState<Misc.ComparisonState>(
		globalState.destinationComparison
	);

	useEffect(() => {
		setRecoilComparisonState((prev) => {
			return {
				destinationDetails: prev.destinationDetails,
				showCompareButton: true
			};
		});
	}, []);

	function renderComparisonCard() {
		if (size === 'small') return;
		if (
			!ObjectUtils.isArrayWithData(recoilComparisonState.destinationDetails) ||
			recoilComparisonState.destinationDetails.length > 3
		) {
			return;
		}
		return recoilComparisonState.destinationDetails.map((item) => {
			return <ResortComparisonCard key={item.destinationId} destinationDetails={item} />;
		});
		return;
	}

	return (
		<Box
			className={`rsComparisonDrawer ${
				ObjectUtils.isArrayWithData(recoilComparisonState.destinationDetails) ? 'show' : ''
			}`}
		>
			{!!recoilComparisonState && <Box display={'flex'}>{renderComparisonCard()}</Box>}
			{size === 'small' ? (
				<Box className={'comparisonButtons'}>
					<LabelButton
						look={'containedPrimary'}
						variant={'body1'}
						label={'Compare'}
						disabled={
							size === 'small' &&
							recoilComparisonState.showCompareButton &&
							recoilComparisonState.destinationDetails.length < 2
						}
						onClick={() => {
							if (
								ObjectUtils.isArrayWithData(recoilComparisonState.destinationDetails) &&
								recoilComparisonState.destinationDetails.length > 1
							) {
								popupController.open<ComparisonPopupProps>(ComparisonPopup, {});
							}
						}}
					>
						{!ObjectUtils.isArrayWithData(recoilComparisonState.destinationDetails) ? (
							<div className={'plusCompareIcon'}>
								<Icon iconImg={'icon-plus'} size={13} color={'#ffffff'} />
							</div>
						) : (
							<Label variant={'caption1'}>{recoilComparisonState.destinationDetails.length}</Label>
						)}
					</LabelButton>
					{(recoilComparisonState.showCompareButton ||
						ObjectUtils.isArrayWithData(recoilComparisonState.destinationDetails)) && (
						<Button
							className={'clearButton'}
							look={'none'}
							onClick={() => {
								setRecoilComparisonState({ ...recoilComparisonState, destinationDetails: [] });
							}}
						>
							<Icon iconImg={'icon-solid-plus'} color={'#ffffff'} />
						</Button>
					)}
				</Box>
			) : (
				<Button
					look={'containedSecondary'}
					onClick={() => {
						popupController.open<ComparisonPopupProps>(ComparisonPopup, {});
					}}
					disabled={recoilComparisonState.destinationDetails.length < 2}
				>
					Compare resorts
				</Button>
			)}
		</Box>
	);
};

export default ComparisonDrawer;
