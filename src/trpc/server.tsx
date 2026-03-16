import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy, type TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

/**
 * IMPORTANTE: Usar cache() para estabilidade por request
 */
export const getQueryClient = cache(makeQueryClient);

/**
 * Proxy typesafe para prefetch/fetch em Server Components
 */
export const trpc = createTRPCOptionsProxy({
	ctx: createTRPCContext,
	router: appRouter,
	queryClient: getQueryClient,
});

/**
 * Helper para prefetch de queries
 * Uso: prefetch(trpc.roast.getHomeMetrics.queryOptions())
 */
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
	const queryClient = getQueryClient();

	if (queryOptions.queryKey[1]?.type === "infinite") {
		void queryClient.prefetchInfiniteQuery(queryOptions as any);
	} else {
		void queryClient.prefetchQuery(queryOptions);
	}
}

/**
 * Helper para hidratar client
 * Uso: <HydrateClient>{children}</HydrateClient>
 */
export function HydrateClient({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}

/**
 * Server caller — para usar diretamente em Server Components
 * sem hidratar no client
 */
export const caller = appRouter.createCaller(createTRPCContext);
