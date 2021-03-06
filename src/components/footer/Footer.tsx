import * as React from 'react';
import './Footer.scss';
import Label from '@bit/redsky.framework.rs.label';
import Icon from '@bit/redsky.framework.rs.icon';
import { Box, Link } from '@bit/redsky.framework.rs.996';
import router from '../../utils/router';
import { Fragment, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import globalState from '../../state/globalState';
import { isRouteUnauthorized } from '../../utils/utils';
import SignupBanner from '../signupBanner/SignupBanner';
import useWindowResizeChange from '../../customHooks/useWindowResizeChange';

interface FooterLink {
	text: string;
	path: string;
}

export interface FooterSection {
	title: string;
	links: FooterLink[];
}

interface FooterProps {
	links: FooterSection[];
}

const Footer: React.FC<FooterProps> = (props) => {
	const company = useRecoilValue<Api.Company.Res.GetCompanyAndClientVariables>(globalState.company);
	const user = useRecoilValue<Api.User.Res.Detail | undefined>(globalState.user);
	const size = useWindowResizeChange();
	useEffect(() => {
		let id = router.subscribeToBeforeRouterNavigate(() => {
			setTimeout(() => {
				window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
			}, 300);
		});
		return () => {
			router.unsubscribeFromBeforeRouterNavigate(id);
		};
	}, []);

	function renderLinks(links: FooterLink[]) {
		return links.map((link: FooterLink, index: number) => {
			if (isRouteUnauthorized(link.path)) return false;
			return (
				<Link
					path={link.path}
					key={index}
					onClick={() => {
						window.open(link.path, '_blank');
					}}
				>
					{link.text}
				</Link>
			);
		});
	}

	function renderSections(sections: FooterSection[]) {
		return sections.map((section: FooterSection, index) => {
			return (
				<Box
					className={`footerSection ${section.title === 'Terms and Policies' ? 'termsAndPolicies' : ''}`}
					key={section.title}
				>
					<Label variant={size === 'small' ? 'reservationDetailsCustomOneFooter' : 'h4'} mb={7}>
						{section.title}
					</Label>
					{renderLinks(section.links)}
				</Box>
			);
		});
	}

	return (
		<Fragment>
			<Box className={'rsFooter'}>
				{!user && <SignupBanner />}
				<Box className={'footerNavigation'}>
					<Box className={'companyFooterLogo'}>
						<Link path={`https://rentylresorts.com/`} external target={'blank'} className="logoContainer">
							<img src={company.wideLogoUrl} alt={company.name} />
						</Link>
					</Box>
					<Box className={'footerSections'}>{renderSections(props.links)}</Box>
				</Box>
				<Box className="copyright" display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
					<Label variant={'caption'}>Spire &#169; {new Date().getFullYear()}, all rights reserved.</Label>
					<Box className={'socialMediaLinks'} display={'flex'}>
						<Link
							path={'https://business.facebook.com/Spire-Loyalty'}
							className={'socialMediaLink'}
							onClick={() => {
								window.open('https://business.facebook.com/Spire-Loyalty', '_blank');
							}}
						>
							<Icon iconImg={'icon-facebook'} size={21} color={'#004B98'} cursorPointer />
						</Link>
						<Link
							path={'https://twitter.com/LoyaltySpire'}
							className={'socialMediaLink'}
							onClick={() => {
								window.open('https://twitter.com/LoyaltySpire', '_blank');
							}}
						>
							<Icon iconImg={'icon-Twitter'} size={21} color={'#004B98'} cursorPointer />
						</Link>
						<Link
							path={'https://www.linkedin.com/company/spire-loyalty'}
							className={'socialMediaLink'}
							onClick={() => {
								window.open('https://www.linkedin.com/company/spire-loyalty', '_blank');
							}}
						>
							<Icon iconImg={'icon-linkedin'} size={21} color={'#004B98'} cursorPointer />
						</Link>
						<Link
							path={'https://www.instagram.com/spireloyalty/'}
							className={'socialMediaLink'}
							onClick={() => {
								window.open('https://www.instagram.com/spireloyalty/', '_blank');
							}}
						>
							<Icon iconImg={'icon-instagram'} size={21} color={'#004B98'} cursorPointer />
						</Link>
					</Box>
				</Box>
			</Box>
		</Fragment>
	);
};

export default Footer;
