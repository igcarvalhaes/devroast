"use client";

import Link from "next/link";
import { CollapsibleCodeRow } from "@/components/ui/collapsible-code-row";
import { button } from "./ui/button";

type LeaderboardEntry = {
	id: string;
	rank: number;
	score: string;
	code: string;
	codeHtml: string;
	lineCount: number;
	language: string;
};

type ShameLeaderboardProps = {
	data: {
		leaderboard: LeaderboardEntry[];
		totalRoasts: number;
	};
};

export function ShameLeaderboard({ data }: ShameLeaderboardProps) {
	return (
		<div className="flex flex-col gap-6 w-[960px]">
			{/* Title Row */}
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center gap-2">
					<span className="font-mono text-sm font-bold text-accent-green">{"//"}</span>
					<span className="font-mono text-sm font-bold text-text-primary">shame_leaderboard</span>
				</div>
				<Link
					href="/leaderboard"
					className={button({
						variant: "outline",
						size: "sm",
						className: "rounded-none px-3 py-1.5 text-xs text-text-secondary",
					})}
				>
					$ view_all {">>"}
				</Link>
			</div>

			{/* Subtitle */}
			<p className="font-body-mono text-[13px] text-text-tertiary -mt-2">
				{"// the worst code on the internet, ranked by shame"}
			</p>

			{/* Leaderboard Cards */}
			<div className="flex flex-col gap-5 w-full">
				{data.leaderboard.map((entry) => {
					// Determinar cor do rank (gold/silver/bronze)
					const rankColor =
						entry.rank === 1
							? "text-accent-amber"
							: entry.rank === 2
								? "text-[#C0C0C0]"
								: entry.rank === 3
									? "text-[#CD7F32]"
									: "text-text-primary";

					return (
						<div key={entry.id} className="flex flex-col w-full border border-border-primary">
							{/* Meta Row */}
							<div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
								<div className="flex items-center gap-4">
									{/* Rank */}
									<div className="flex items-center gap-1.5">
										<span className="font-mono text-[13px] text-text-tertiary">#</span>
										<span className={`font-mono text-[13px] font-bold ${rankColor}`}>
											{entry.rank}
										</span>
									</div>

									{/* Score */}
									<div className="flex items-center gap-1.5">
										<span className="font-mono text-xs text-text-tertiary">score:</span>
										<span className="font-mono text-[13px] font-bold text-accent-red">
											{entry.score}
										</span>
									</div>
								</div>

								{/* Language + Lines */}
								<div className="flex items-center gap-3">
									<span className="font-mono text-xs text-text-secondary">{entry.language}</span>
									<span className="font-mono text-xs text-text-tertiary">
										{entry.lineCount} lines
									</span>
								</div>
							</div>

							{/* Collapsible Code */}
							<CollapsibleCodeRow
								codeHtml={entry.codeHtml}
								lineCount={entry.lineCount}
								language={entry.language}
								defaultOpen={false}
							/>
						</div>
					);
				})}
			</div>

			{/* Footer com métricas */}
			<div className="flex justify-center w-full">
				<span className="font-body-mono text-xs text-text-tertiary">
					showing top 3 of {data.totalRoasts.toLocaleString()} · view full leaderboard {">>"}
				</span>
			</div>
		</div>
	);
}
