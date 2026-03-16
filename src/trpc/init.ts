import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import "server-only";

/**
 * Context criado por request — use para sessao, DB, etc.
 * IMPORTANTE: Envolver com cache() para RSC
 */
export const createTRPCContext = cache(async () => {
	// TODO: Integrar com sistema de autenticacao
	// const session = await getSession();

	return {
		userId: null as string | null, // exemplo
		// session,
		// db,
	};
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Inicializa tRPC com context e transformer
 */
const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape }) {
		return shape;
	},
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Procedure publica (sem autenticacao)
 */
export const publicProcedure = t.procedure;

/**
 * Procedure protegida (requer usuario logado)
 */
export const protectedProcedure = t.procedure.use(function isAuthed(opts) {
	if (!opts.ctx.userId) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Voce precisa estar logado para acessar este recurso",
		});
	}

	return opts.next({
		ctx: {
			...opts.ctx,
			userId: opts.ctx.userId, // agora non-nullable
		},
	});
});
