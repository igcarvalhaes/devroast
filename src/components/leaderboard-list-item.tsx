"use client";

import { CollapsibleCodeRow } from "@/components/ui/collapsible-code-row";

export type LeaderboardListItemProps = {
	rank: number;
	score: string;
	language: string;
	lineCount: number;
	codeHtml: string;
};

export function LeaderboardListItem({
	rank,
	score,
	language,
	lineCount,
	codeHtml,
}: LeaderboardListItemProps) {
	// Determinar cor do rank (gold/silver/bronze)
	const rankColor =
		rank === 1
			? "text-accent-amber"
			: rank === 2
				? "text-text-secondary"
				: rank === 3
					? "text-text-tertiary"
					: "text-text-primary";

	return (
		<div className="flex flex-col w-full border border-border-primary">
			{/* Meta Row */}
			<div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
				<div className="flex items-center gap-4">
					{/* Rank */}
					<div className="flex items-center gap-1.5">
						<span className="font-mono text-[13px] text-text-tertiary">#</span>
						<span className={`font-mono text-[13px] font-bold ${rankColor}`}>{rank}</span>
					</div>

					{/* Score */}
					<div className="flex items-center gap-1.5">
						<span className="font-mono text-xs text-text-tertiary">score:</span>
						<span className="font-mono text-[13px] font-bold text-accent-red">{score}</span>
					</div>
				</div>

				{/* Language + Lines */}
				<div className="flex items-center gap-3">
					<span className="font-mono text-xs text-text-secondary">{language}</span>
					<span className="font-mono text-xs text-text-tertiary">{lineCount} lines</span>
				</div>
			</div>

			{/* Collapsible Code */}
			<CollapsibleCodeRow
				codeHtml={codeHtml}
				lineCount={lineCount}
				language={language}
				defaultOpen={false}
			/>
		</div>
	);
}
