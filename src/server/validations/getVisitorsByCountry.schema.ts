import { z } from 'zod';

export const getVisitorsByCountryParamsSchema = z.object({
	period: z.enum(['last_week', 'last_two_weeks', 'last_month', 'last_quarter', 'last_year'], {
		message: 'Invalid period.'
	})
});

export type GetVisitorsByCountryParams = z.infer<typeof getVisitorsByCountryParamsSchema>;
