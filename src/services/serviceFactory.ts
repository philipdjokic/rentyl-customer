import { Service } from './Service';
import UserService from './user/user.service';
import ReservationsService from './reservations/reservations.service';
import ComparisonService from './comparison/comparison.service';
import DestinationService from './destination/destination.service';
import AccommodationService from './accommodation/accommodation.service';
import CountryService from './country/country.service';
import UserAddressService from './userAddress/userAddress.service';
import RewardService from './reward/reward.service';
import UserPointService from './userPoint/userPoint.service';
import PaymentService from './payment/payment.service';
import CompanyService from './company/company.service';
import PackageService from './package/package.service';
import ReviewService from './review/review.service';
import RegionService from './region/region.service';

type ServiceKey =
	| 'UserService'
	| 'ReservationsService'
	| 'ComparisonService'
	| 'CompanyService'
	| 'DestinationService'
	| 'AccommodationService'
	| 'CountryService'
	| 'UserAddressService'
	| 'RewardService'
	| 'UserPointService'
	| 'PaymentService'
	| 'PackageService'
	| 'RegionService'
	| 'ReviewService';

class ServiceFactory {
	private services: { [key: string]: Service } = {};

	create() {
		// Add new models here to the factory
		this.services['UserService'] = new UserService();
		this.services['ReservationsService'] = new ReservationsService();
		this.services['ComparisonService'] = new ComparisonService();
		this.services['CompanyService'] = new CompanyService();
		this.services['DestinationService'] = new DestinationService();
		this.services['AccommodationService'] = new AccommodationService();
		this.services['CountryService'] = new CountryService();
		this.services['UserAddressService'] = new UserAddressService();
		this.services['RewardService'] = new RewardService();
		this.services['UserPointService'] = new UserPointService();
		this.services['PaymentService'] = new PaymentService();
		this.services['PackageService'] = new PackageService();
		this.services['ReviewService'] = new ReviewService();
		this.services['RegionService'] = new RegionService();

		for (let key in this.services) {
			this.services[key].start();
		}
	}

	get<T extends Service>(name: ServiceKey): T {
		return this.services[name] as T;
	}
}

let serviceFactory = new ServiceFactory();
export default serviceFactory;

// TEMP
//window.sf = serviceFactory;
