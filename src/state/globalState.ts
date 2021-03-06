import {
	atom,
	Loadable,
	RecoilState,
	RecoilValue,
	useRecoilCallback,
	useRecoilTransactionObserver_UNSTABLE
} from 'recoil';
import * as React from 'react';
import moment from 'moment';

enum GlobalStateKeys {
	COMPARISON_CARD = 'DestinationComparison',
	USER_TOKEN = 'UserToken',
	USER = 'User',
	CHECKOUT_USER = 'CheckoutUser',
	COMPANY = 'Company',
	VERIFIED_ACCOMMODATION = 'VerifiedAccommodation',
	RESERVATION_FILTERS = 'ReservationFilter',
	LAST_NAVIGATION_PATH = 'LastNavigationPath'
}

// Change based on project so we don't have classing when developing on localhost (va = Volcanic Admin)
export const KEY_PREFIX = 'spireCust-';

class GlobalState {
	destinationComparison: RecoilState<Misc.ComparisonState>;
	userToken: RecoilState<string>;
	user: RecoilState<Api.User.Res.Detail | undefined>;
	checkoutUser: RecoilState<Misc.Checkout | undefined>;
	company: RecoilState<Api.Company.Res.GetCompanyAndClientVariables>;
	verifiedAccommodation: RecoilState<Api.Reservation.Res.Verification | undefined>;
	reservationFilters: RecoilState<Misc.ReservationFilters>;
	lastNavigationPath: RecoilState<string>;

	saveToStorageList: string[] = [];

	constructor() {
		this.destinationComparison = atom<Misc.ComparisonState>({
			key: GlobalStateKeys.COMPARISON_CARD,
			default: this.loadFromLocalStorage<Misc.ComparisonState>(GlobalStateKeys.COMPARISON_CARD, {
				destinationDetails: [],
				showCompareButton: false
			})
		});

		this.user = atom<Api.User.Res.Detail | undefined>({
			key: GlobalStateKeys.USER,
			default: undefined
		});

		this.checkoutUser = atom<Misc.Checkout | undefined>({
			key: GlobalStateKeys.CHECKOUT_USER,
			default: this.loadFromLocalStorage<Misc.Checkout | undefined>(GlobalStateKeys.CHECKOUT_USER, undefined)
		});

		this.userToken = atom<string>({
			key: GlobalStateKeys.USER_TOKEN,
			default: this.loadFromLocalStorage<string>(GlobalStateKeys.USER_TOKEN, '')
		});

		this.company = atom<Api.Company.Res.GetCompanyAndClientVariables>({
			key: GlobalStateKeys.COMPANY,
			default: {
				id: 0,
				name: '',
				squareLogoUrl: '',
				wideLogoUrl: '',
				allowPointBooking: 0,
				allowCashBooking: 0,
				customPages: {},
				unauthorizedPages: []
			}
		});

		this.verifiedAccommodation = atom<Api.Reservation.Res.Verification | undefined>({
			key: GlobalStateKeys.VERIFIED_ACCOMMODATION,
			default: undefined
		});

		// The following is stored in local storage automatically
		this.saveToStorageList = [
			GlobalStateKeys.USER_TOKEN,
			GlobalStateKeys.COMPARISON_CARD,
			GlobalStateKeys.CHECKOUT_USER
		];

		this.reservationFilters = atom<Misc.ReservationFilters>({
			key: GlobalStateKeys.RESERVATION_FILTERS,
			default: {
				startDate: moment(new Date()).add(14, 'days').format('YYYY-MM-DD'),
				endDate: moment(new Date()).add(19, 'days').format('YYYY-MM-DD'),
				adultCount: 1,
				childCount: 0,
				redeemPoints: false,
				sortOrder: 'ASC',
				pagination: { page: 1, perPage: 10 }
			}
		});

		this.lastNavigationPath = atom<string>({
			key: GlobalStateKeys.LAST_NAVIGATION_PATH,
			default: ''
		});
	}

	private loadFromLocalStorage<T>(key: string, defaultValue: T): T {
		let item = localStorage.getItem(KEY_PREFIX + key);
		if (!item) return defaultValue;
		try {
			item = JSON.parse(item);
		} catch (e) {}
		// @ts-ignore
		return item;
	}
}

export function clearPersistentState() {
	// All we really need to do is clear local storage
	localStorage.clear();
}

export const GlobalStateObserver: React.FC = () => {
	useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
		for (const item of snapshot.getNodes_UNSTABLE({ isModified: true })) {
			let value = snapshot.getLoadable(item).contents as string;
			if (process.env.NODE_ENV === 'development') {
				console.log('Recoil item changed: ', item.key);
				console.log('Value: ', value);
			}

			if (globalState.saveToStorageList.includes(item.key)) {
				if (typeof value === 'object') value = JSON.stringify(value);
				localStorage.setItem(KEY_PREFIX + item.key, value);
			}
		}
	});
	return null;
};

const globalState = new GlobalState();
export default globalState;

/**
 * Returns a Recoil state value, from anywhere in the app.
 *
 * Can be used outside of the React tree (outside a React component), such as in utility scripts, etc.

 * <GlobalStateInfluencer> must have been previously loaded in the React tree, or it won't work.
 * Initialized as a dummy function "() => null", it's reference is updated to a proper Recoil state mutator when GlobalStateInfluencer is loaded.
 *
 * @example const lastCreatedUser = getRecoilExternalValue(lastCreatedUserState);
 *
  */
export let getRecoilExternalLoadable: <T>(recoilValue: RecoilValue<T>) => Loadable<T> = () => null as any;

/**
 * Retrieves the value from the loadable. More information about loadables are here:
 * https://recoiljs.org/docs/api-reference/core/Loadable
 * @param recoilValue Recoil value to retrieve its base value
 */
export function getRecoilExternalValue<T>(recoilValue: RecoilValue<T>): T {
	return getRecoilExternalLoadable<T>(recoilValue).getValue();
}

/**
 * Sets a Recoil state value, from anywhere in the app.
 *
 * Can be used outside of the React tree (outside a React component), such as in utility scripts, etc.
 *
 * <RecoilExternalStatePortal> must have been previously loaded in the React tree, or it won't work.
 * Initialized as a dummy function "() => null", it's reference is updated to a proper Recoil state mutator when GlobalStateInfluencer is loaded.
 *
 * NOTE - Recoil value isn't fully changed until some time later.
 *
 * @example setRecoilExternalState(lastCreatedUserState, newUser)
 */
export let setRecoilExternalValue: <T>(
	recoilState: RecoilState<T>,
	valOrUpdater: ((currVal: T) => T) | T
) => void = () => null as any;

export const GlobalStateInfluencer: React.FC = () => {
	useRecoilCallback(({ set, snapshot }) => {
		setRecoilExternalValue = set;
		getRecoilExternalLoadable = snapshot.getLoadable;
		return async () => {};
	})();

	// We need to update the getRecoilExternalLoadable every time there's a new snapshot
	// Otherwise we will load old values from when the component was mounted
	useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
		getRecoilExternalLoadable = snapshot.getLoadable;
	});

	return null;
};
