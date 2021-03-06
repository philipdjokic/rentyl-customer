import * as React from 'react';
import './LabelLink.scss';
import Label from '@bit/redsky.framework.rs.label';
import Icon from '@bit/redsky.framework.rs.icon';
import { Link } from '@bit/redsky.framework.rs.996';

interface LabelLinkProps {
	path: string;
	externalLink?: boolean;
	label: string;
	variant: Misc.Variant;
	iconLeft?: string;
	iconRight?: string;
	iconSize?: number;
	iconColor?: string;
	className?: string;
	onClick?: () => void;
}

const LabelLink: React.FC<LabelLinkProps> = (props) => {
	return (
		<Link
			path={props.path}
			className={`rsLabelLink ${props.className || ''}`}
			external={props.externalLink}
			onClick={props.onClick}
		>
			{!!props.iconLeft && (
				<Icon
					className={'iconLeft'}
					iconImg={props.iconLeft}
					size={props.iconSize || 16}
					color={props.iconColor || 'inherit'}
				/>
			)}
			<Label variant={props.variant}>{props.label}</Label>
			{!!props.iconRight && (
				<Icon
					className={'iconRight'}
					iconImg={props.iconRight}
					size={props.iconSize || 16}
					color={props.iconColor || 'inherit'}
				/>
			)}
		</Link>
	);
};

export default LabelLink;
