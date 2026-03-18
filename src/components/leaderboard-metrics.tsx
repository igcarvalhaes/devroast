"use client";

import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function LeaderboardMetrics() {
	const trpc = useTRPC();
	const { data, isLoading, isError } = useQuery(trpc.roast.getHomeMetrics.queryOptions());

	if (isLoading) {
		return (
			<div className="flex items-center gap-2">
				<span className="font-body-mono text-xs text-text-tertiary">loading stats...</span>
			</div>
		);
	}

	if (isError || !data) {
		return null;
	}

	return (
		<div className="flex items-center gap-2">
			<span className="font-body-mono text-xs text-text-tertiary">
				<NumberFlow value={data.totalRoasts} /> submissions
			</span>
			<span className="font-body-mono text-xs text-text-tertiary">·</span>
			<span className="font-body-mono text-xs text-text-tertiary">
				avg score:{" "}
				<NumberFlow
					value={data.avgScore}
					format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
				/>
				/10
			</span>
		</div>
	);
}
