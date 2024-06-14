import { createTRPCRouter } from './trpcContext';
import { visitorsRouter } from './routers/visitors.router';

export const appRouter = createTRPCRouter({
	visitors: visitorsRouter
});

export type AppRouter = typeof appRouter;
