import { env } from '$env/dynamic/private';
import { Client } from '@elastic/elasticsearch';

/**
 * Represents the aggregation result for unique destinations.
 */
type UniqueDestinationsAggregation = {
	countries: {
		buckets: {
			key: string;
			hours: {
				buckets: {
					key: number;
					unique: {
						value: number;
					};
				}[];
			};
		}[];
	};
};

export class ElasticSearchService {
	private readonly client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	async getUniqueVisitorsByCountry(range: { fromDate: Date; toDate: Date }) {
		const response = await this.client.search<unknown, UniqueDestinationsAggregation>({
			index: env.ELASTIC_SEARCH_INDEX,
			aggs: {
				countries: {
					terms: {
						field: 'geo.dest',
						size: 25
					},
					aggs: {
						hours: {
							histogram: {
								field: 'hour_of_day',
								interval: 1
							},
							aggs: {
								unique: {
									cardinality: {
										field: 'clientip'
									}
								}
							}
						}
					}
				}
			},
			size: 0,
			query: {
				bool: {
					must: [
						{
							range: {
								'@timestamp': {
									gte: range.fromDate.toISOString(),
									lte: range.toDate.toISOString(),
									format: 'strict_date_optional_time'
								}
							}
						}
					]
				}
			},
			runtime_mappings: {
				hour_of_day: {
					type: 'long',
					script: {
						source: "emit(doc['timestamp'].value.getHour());"
					}
				}
			}
		});

		return response.aggregations?.countries.buckets ?? [];
	}
}
