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

	async getVisitorsByCountry(params: GetVisitorsByCountryParams) {
		const periodRange = this.getPeriodRange(params.period);

		const visitorsByCountry = await this.elasticService.getUniqueVisitorsByCountry(periodRange);

		// Return result in a simpler shape for frontend.
		return visitorsByCountry.map((country) => ({
			key: country.key,
			hours: country.hours.buckets.map((hour) => ({ key: hour.key, unique: hour.unique.value }))
		}));
	}
}
