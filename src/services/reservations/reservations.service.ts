import modelFactory from '../../models/modelFactory';
import { Service } from '../Service';
import ReservationsModel from '../../models/reservations/reservations.model';
import http from '../../utils/http';
import { RsResponseData } from '@bit/redsky.framework.rs.http';
import StandardOrderTypes = RedSky.StandardOrderTypes;
import MatchTypes = RedSky.MatchTypes;
import FilterQueryValue = RedSky.FilterQueryValue;

export default class ReservationsService extends Service {
	reservationsModel: ReservationsModel = modelFactory.get<ReservationsModel>('ReservationsModel');

	async verifyAvailability(data: Api.Reservation.Req.Verification) {
		return await http.get<RsResponseData<Api.Reservation.Res.Verification>>('reservation/verification', data);
	}

	async create(data: Api.Reservation.Req.Create) {
		let response = await http.post<RsResponseData<Api.Reservation.Res.Create>>('reservation', data);
		return response.data.data;
	}

	async createItinerary(data: Api.Reservation.Req.Itinerary.Create): Promise<Api.Reservation.Res.Itinerary.Get> {
		const response = await http.post<RsResponseData<Api.Reservation.Res.Itinerary.Get>>(
			'reservation/itinerary',
			data
		);
		return response.data.data;
	}

	async get(id: number): Promise<Api.Reservation.Res.Get> {
		let response = await http.get<RsResponseData<Api.Reservation.Res.Get>>('reservation', { id });
		return response.data.data;
	}

	async getByPage(
		page: number,
		perPage: number,
		sortField?: string,
		sortOrder?: StandardOrderTypes,
		matchType?: MatchTypes,
		filter?: FilterQueryValue[]
	) {
		let response = await this.reservationsModel.getByPage(page, perPage, sortField, sortOrder, matchType, filter);
		return response.data;
	}

	async upcoming(limit: number) {
		let response = await http.get<RsResponseData<Api.Reservation.Res.Upcoming[]>>('reservation/upcoming', {
			limit
		});
		return response.data.data;
	}

	async updateReservation(data: Api.Reservation.Req.Update) {
		let response = await http.put<RsResponseData<Api.Reservation.Res.Get>>('reservation', data);
		return response.data.data;
	}

	async cancel(id: number): Promise<Api.Reservation.Res.Cancel> {
		let response = await http.post<RsResponseData<Api.Reservation.Res.Cancel>>('reservation/cancel', { id });
		return response.data.data;
	}

	async getPackages(data: Api.Package.Req.GetByPage): Promise<RsResponseData<Api.Package.Res.GetByPage>> {
		let response = await http.get<Api.Package.Res.GetByPage>('package/paged', {});
		return response;
	}
}
