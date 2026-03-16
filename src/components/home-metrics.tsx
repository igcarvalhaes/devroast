"use client";

import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function HomeMetrics() {
	const trpc = useTRPC();
	const { data } = useQuery(trpc.roast.getHomeMetrics.queryOptions());

	// Valores iniciais 0 enquanto carrega, depois anima para o valor real
	const totalRoasts = data?.totalRoasts ?? 0;
	const avgScore = data?.avgScore ?? 0;

	return (
		<div className="flex items-center justify-center gap-6">
			<span className="font-body-mono text-xs text-text-tertiary">
				<NumberFlow value={totalRoasts} /> codes roasted
			</span>
			<span className="font-mono text-xs text-text-tertiary">·</span>
			<span className="font-body-mono text-xs text-text-tertiary">
				avg score:{" "}
				<NumberFlow
					value={avgScore}
					format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
				/>
				/10
			</span>
		</div>
	);
}
