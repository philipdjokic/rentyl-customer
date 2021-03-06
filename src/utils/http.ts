import HttpClient from '@bit/redsky.framework.rs.http';
import { WebUtils } from './utils';

export enum HttpStatusCode {
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	METHOD_NOT_ALLOWED = 405,
	ALREADY_EXISTS = 409,
	CONFLICT = 409,
	VERSION_OUT_OF_DATE = 418, // Technically this is the I'm a teapot code that was a joke.
	SERVER_ERROR = 500,
	SERVICE_UNAVAILABLE = 503,
	NETWORK_CONNECT_TIMEOUT = 599
}

function getCompanyId() {
	let companyId: number | undefined | null;
	let urlParams = new URLSearchParams(window.location.search);
	let queryCompanyId = urlParams.get('company_id');
	if (queryCompanyId) {
		companyId = parseInt(queryCompanyId);
		sessionStorage['company_id'] = companyId;
	} else if (sessionStorage['company_id']) {
		companyId = parseInt(sessionStorage['company_id']);
	}
	return companyId;
}

let headers: any = {
	'Content-Type': 'application/json',
	'Access-Control-Allow-Origin': '*',
	Accept: 'application/json, text/plain, */*',
	'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT'
};

if (WebUtils.isLocalHost()) headers['company-id'] = getCompanyId();
if (headers['company-id'] === null || headers['company-id'] === undefined) delete headers['company-id'];

const http = new HttpClient({
	baseURL: '/api/v1',
	headers
});

export default http;
