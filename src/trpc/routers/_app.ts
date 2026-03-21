import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { roastRouter } from "./roast";

export const appRouter = createTRPCRouter({
	roast: roastRouter,
});

/**
 * Exporta o type do router para o client
 * NUNCA importe o router em si no client!
 */
export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
