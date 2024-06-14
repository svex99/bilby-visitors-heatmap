import { createTRPCRouter, publicProcedure } from '../trpcContext';
import { elasticSearchService } from '$server/services';
import { VisitorsService } from '$server/services/visitors.service';
import { getVisitorsByCountryParamsSchema } from '$server/validations/getVisitorsByCountry.schema';

export const visitorsRouter = createTRPCRouter({
	getVisitorsByCountry: publicProcedure.input(getVisitorsByCountryParamsSchema).query(({ input }) => {
		return new VisitorsService(elasticSearchService).getVisitorsByCountry(input);
	})
});
