import { and, asc, avg, count, eq, isNotNull } from "drizzle-orm";
import { codeToHtml } from "shiki";
import { z } from "zod";
import { db } from "@/db";
import { roasts, submissions } from "@/db/schema";
import { createTRPCRouter, publicProcedure } from "../init";

export const roastRouter = createTRPCRouter({
	/**
	 * Query publica — retorna metricas da homepage
	 */
	getHomeMetrics: publicProcedure.query(async () => {
		// Executar queries em paralelo com Promise.all
		const [totalRoastsResult, avgScoreResult] = await Promise.all([
			// Query 1: COUNT total de roasts completed
			db.select({ count: count() }).from(roasts).where(eq(roasts.status, "completed")),

			// Query 2: AVG score de roasts completed com score nao-null
			db
				.select({ avg: avg(roasts.score) })
				.from(roasts)
				.where(and(eq(roasts.status, "completed"), isNotNull(roasts.score))),
		]);

		const totalRoasts = totalRoastsResult[0]?.count ?? 0;
		const avgScoreValue = avgScoreResult[0]?.avg;

		// Converter para numero e formatar com 1 casa decimal
		const avgScore = avgScoreValue ? Number.parseFloat(avgScoreValue.toString()).toFixed(1) : "0.0";

		return {
			totalRoasts: Number(totalRoasts),
			avgScore: Number.parseFloat(avgScore),
		};
	}),

	/**
	 * Query publica — retorna os 3 piores roasts (menores scores) com código completo
	 */
	getTopWorstRoasts: publicProcedure.query(async () => {
		// Executar queries em paralelo com Promise.all
		const [worstRoasts, totalRoastsResult] = await Promise.all([
			// Query 1: buscar os 3 roasts com menores scores (completed e com score)
			db
				.select({
					id: roasts.id,
					score: roasts.score,
					code: submissions.code,
					language: submissions.language,
				})
				.from(roasts)
				.innerJoin(submissions, eq(roasts.submissionId, submissions.id))
				.where(and(eq(roasts.status, "completed"), isNotNull(roasts.score)))
				.orderBy(asc(roasts.score))
				.limit(3),

			// Query 2: buscar total de roasts para o rodapé
			db.select({ count: count() }).from(roasts).where(eq(roasts.status, "completed")),
		]);

		// Processar cada roast para gerar HTML completo do código
		const leaderboard = await Promise.all(
			worstRoasts.map(async (roast, index) => {
				// Gerar HTML com syntax highlighting para o código completo
				const codeHtml = await codeToHtml(roast.code.trim(), {
					lang: roast.language,
					theme: "vesper",
				});

				const lineCount = roast.code.trim().split("\n").length;

				return {
					id: roast.id,
					rank: index + 1,
					score: roast.score ? roast.score.toFixed(1) : "0.0",
					code: roast.code.trim(),
					codeHtml,
					lineCount,
					language: roast.language,
				};
			}),
		);

		const totalRoasts = totalRoastsResult[0]?.count ?? 0;

		return {
			leaderboard,
			totalRoasts: Number(totalRoasts),
		};
	}),

	/**
	 * Query publica — retorna leaderboard paginado
	 */
	getLeaderboard: publicProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(20),
			}),
		)
		.query(async ({ input }) => {
			const { page, limit } = input;
			const offset = (page - 1) * limit;

			// Executar queries em paralelo com Promise.all
			const [items, totalCountResult] = await Promise.all([
				// Query 1: buscar roasts paginados
				db
					.select({
						id: roasts.id,
						score: roasts.score,
						code: submissions.code,
						language: submissions.language,
						createdAt: roasts.createdAt,
					})
					.from(roasts)
					.innerJoin(submissions, eq(roasts.submissionId, submissions.id))
					.where(and(eq(roasts.status, "completed"), isNotNull(roasts.score)))
					.orderBy(asc(roasts.score))
					.limit(limit)
					.offset(offset),

				// Query 2: buscar total de roasts no leaderboard
				db
					.select({ count: count() })
					.from(roasts)
					.where(and(eq(roasts.status, "completed"), isNotNull(roasts.score))),
			]);

			const total = totalCountResult[0]?.count ?? 0;
			const totalPages = Math.ceil(Number(total) / limit);

			// Processar cada roast para gerar HTML completo do código
			const leaderboard = await Promise.all(
				items.map(async (roast, index) => {
					// Gerar HTML com syntax highlighting
					const codeHtml = await codeToHtml(roast.code.trim(), {
						lang: roast.language,
						theme: "vesper",
					});

					const lineCount = roast.code.trim().split("\n").length;

					return {
						id: roast.id,
						rank: offset + index + 1,
						score: roast.score ? roast.score.toFixed(1) : "0.0",
						code: roast.code.trim(),
						codeHtml,
						lineCount,
						language: roast.language,
						createdAt: roast.createdAt,
					};
				}),
			);

			return {
				items: leaderboard,
				totalCount: Number(total),
				totalPages,
				currentPage: page,
			};
		}),
});
