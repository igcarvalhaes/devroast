import { and, avg, count, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { roasts } from "@/db/schema";
import { createTRPCRouter, publicProcedure } from "../init";

export const roastRouter = createTRPCRouter({
	/**
	 * Query publica — retorna metricas da homepage
	 */
	getHomeMetrics: publicProcedure.query(async () => {
		// Query 1: COUNT total de roasts completed
		const totalRoastsResult = await db
			.select({ count: count() })
			.from(roasts)
			.where(eq(roasts.status, "completed"));

		// Query 2: AVG score de roasts completed com score nao-null
		const avgScoreResult = await db
			.select({ avg: avg(roasts.score) })
			.from(roasts)
			.where(and(eq(roasts.status, "completed"), isNotNull(roasts.score)));

		const totalRoasts = totalRoastsResult[0]?.count ?? 0;
		const avgScoreValue = avgScoreResult[0]?.avg;

		// Converter para numero e formatar com 1 casa decimal
		const avgScore = avgScoreValue ? Number.parseFloat(avgScoreValue.toString()).toFixed(1) : "0.0";

		return {
			totalRoasts: Number(totalRoasts),
			avgScore: Number.parseFloat(avgScore),
		};
	}),
});
