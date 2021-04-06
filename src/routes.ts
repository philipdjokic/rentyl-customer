import { RouteDetails } from '@bit/redsky.framework.rs.996';
import NotFoundPage from './pages/notFoundPage/notFoundPage';
import DashboardPage from './pages/dashboardPage/DashboardPage';
import LandingPage from './pages/landingPage/LandingPage';
import SignInPage from './pages/signInPage/SignInPage';
import SignUpPage from './pages/signUpPage/SignUpPage';
import ComparisonPage from './pages/comparisonPage/ComparisonPage';
import ReservationAvailabilityPage from './pages/reservationAvailabilityPage/ReservationAvailabilityPage';
import DestinationDetailsPage from './pages/destinationDetailsPage/DestinationDetailsPage';
import AccommodationDetailsPage from './pages/accommodationDetailsPage/AccommodationDetailsPage';
import AccountPersonalInfoPage from './pages/accountPersonalInfoPage/AccountPersonalInfoPage';
import AccountAddressPage from './pages/accountAddressPage/AccountAddressPage';

const routes: RouteDetails[] = [
	{
		path: '/',
		page: LandingPage,
		options: {
			view: 'landingPage'
		}
	},
	{
		path: '/dashboard',
		page: DashboardPage,
		options: {
			view: 'landingPage'
		}
	},
	{
		path: '/signin',
		page: SignInPage,
		options: {
			view: 'landingPage'
		}
	},
	{
		path: '/signup',
		page: SignUpPage
	},
	{
		path: '/reservation/availability',
		page: ReservationAvailabilityPage
	},
	{
		path: '/compare',
		page: ComparisonPage
	},
	{
		path: '/destination/details',
		page: DestinationDetailsPage,
		options: {
			view: 'landingPage'
		}
	},
	{
		path: '/account/personal-info',
		page: AccountPersonalInfoPage,
		options: {
			view: 'landingPage'
		}
	},
	{
		path: '/account/address',
		page: AccountAddressPage,
		options: {
			view: 'landingPage'
		}
	},
	{
		path: '/accommodation/details',
		page: AccommodationDetailsPage,
		options: {
			view: 'landingPage'
		}
	},
	{
		path: '*',
		page: NotFoundPage,
		options: {
			view: 'home'
		}
	}
];

export default routes;
(window as any).routes = routes;
