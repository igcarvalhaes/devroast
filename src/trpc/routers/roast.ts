import { and, asc, avg, count, eq, isNotNull } from "drizzle-orm";
import { codeToHtml } from "shiki";
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
	 * Query publica — retorna os 3 piores roasts (menores scores)
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

		// Processar cada roast para truncar e gerar HTML
		const leaderboard = await Promise.all(
			worstRoasts.map(async (roast, index) => {
				const lines = roast.code.trim().split("\n");
				const truncatedLines = lines.slice(0, 3);
				const truncatedCode = truncatedLines.join("\n");

				// Detectar qual linha é comentário
				const commentIndex = truncatedLines.findIndex((line) =>
					isCommentLine(line.trim(), roast.language),
				);

				// Gerar HTML com syntax highlighting
				const codeHtml = await codeToHtml(truncatedCode, {
					lang: roast.language,
					theme: "vesper",
				});

				return {
					id: roast.id,
					rank: index + 1,
					score: roast.score ? roast.score.toFixed(1) : "0.0",
					codeHtml,
					lines: truncatedLines,
					commentIndex,
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
});

/**
 * Helper para detectar se uma linha é comentário
 */
function isCommentLine(line: string, language: string): boolean {
	// JavaScript/TypeScript/Java/C#/Go/Rust
	if (["javascript", "typescript", "java", "csharp", "go", "rust"].includes(language)) {
		return line.startsWith("//") || line.startsWith("/*");
	}

	// Python
	if (language === "python") {
		return line.startsWith("#");
	}

	// SQL
	if (language === "sql") {
		return line.startsWith("--");
	}

	// HTML/CSS
	if (["html", "css"].includes(language)) {
		return line.startsWith("<!--") || line.startsWith("/*");
	}

	return false;
}
