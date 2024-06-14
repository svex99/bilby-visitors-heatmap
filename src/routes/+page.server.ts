import { trpcServer } from '$lib/trpc';

export const load = async ({ fetch }) => {
	return {
		visitorsByCountry: await trpcServer(fetch).visitors.getVisitorsByCountry.query({ period: 'last_week' })
	};
};
