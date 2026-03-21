"use client";

import NumberFlow from "@number-flow/react";

type LeaderboardMetricsProps = {
	data: {
		totalRoasts: number;
		avgScore: number;
	};
};

export function LeaderboardMetrics({ data }: LeaderboardMetricsProps) {
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
