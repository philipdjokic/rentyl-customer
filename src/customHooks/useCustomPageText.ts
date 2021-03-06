import { useRecoilValue } from 'recoil';
import globalState from '../state/globalState';

// Get's the language type from the browser's preference
// Language tags returned are based on this RFC: https://tools.ietf.org/rfc/bcp/bcp47.txt
function getBrowserLanguage(): string {
	return navigator.language.split('-')[0];
}

export default function useCustomPageText(pageName: string): (key: string, defaultValue: string) => string {
	let companyVariables = useRecoilValue<Api.Company.Res.GetCompanyAndClientVariables>(globalState.company);
	let pageText: { [key: string]: any } = {};
	let text = function (key: string, defaultValue: string): string {
		if (!pageText[key]) return defaultValue;
		return pageText[key][language] || pageText[key]['en'] || defaultValue;
	};

	if (
		!companyVariables ||
		!('customPages' in companyVariables) ||
		!('pages' in companyVariables.customPages) ||
		!(pageName in companyVariables.customPages.pages)
	) {
		return text;
	}
	pageText = companyVariables.customPages.pages[pageName];

	const language = getBrowserLanguage();

	return text;
}
