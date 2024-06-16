import type { GetVisitorsByCountryParams } from '$server/validations/getVisitorsByCountry.schema';
import type { ElasticSearchService } from './elastic.service';

export class VisitorsService {
	elasticService: ElasticSearchService;

	constructor(elasticSearchClient: ElasticSearchService) {
		this.elasticService = elasticSearchClient;
	}

	private getPeriodRange(period: GetVisitorsByCountryParams['period']) {
		const now = new Date();
		const lowerBound = new Date(now);

		switch (period) {
			case 'last_week':
				lowerBound.setDate(now.getDate() - 7);
				break;
			case 'last_two_weeks':
				lowerBound.setDate(now.getDate() - 14);
				break;
			case 'last_month':
				lowerBound.setMonth(now.getMonth() - 1);
				break;
			case 'last_quarter':
				lowerBound.setMonth(now.getMonth() - 3);
				break;
			case 'last_year':
				lowerBound.setFullYear(now.getFullYear() - 1);
				break;
		}

		return { fromDate: lowerBound, toDate: now };
	}

	
	/**
	 * Retrieves the unique visitors by country for a given period.
	 * 
	 * @param params - The parameters for retrieving visitors by country.
	 * @returns A Promise that resolves to an array of unique visitors by country.
	 */
	async getVisitorsByCountry(params: GetVisitorsByCountryParams) {
		const periodRange = this.getPeriodRange(params.period);

		const visitorsByCountry = await this.elasticService.getUniqueVisitorsByCountry(periodRange);

		return visitorsByCountry;
	}
}
