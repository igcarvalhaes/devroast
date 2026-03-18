"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { button } from "./ui/button";

export function ShameLeaderboard() {
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.roast.getTopWorstRoasts.queryOptions());

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

			{/* Table */}
			<div className="flex flex-col border border-border-primary w-full">
				{/* Header */}
				<div className="flex items-center h-10 px-5 bg-bg-surface border-b border-border-primary">
					<span className="w-[50px] font-mono text-xs font-medium text-text-tertiary">#</span>
					<span className="w-[70px] font-mono text-xs font-medium text-text-tertiary">score</span>
					<span className="flex-1 font-mono text-xs font-medium text-text-tertiary">code</span>
					<span className="w-[100px] font-mono text-xs font-medium text-text-tertiary">lang</span>
				</div>

				{/* Data Rows */}
				{data.leaderboard.map((row, rowIndex) => (
					<div
						key={row.id}
						className={[
							"flex items-start px-5 py-4",
							rowIndex < data.leaderboard.length - 1 ? "border-b border-border-primary" : "",
						].join(" ")}
					>
						<span
							className={`w-[50px] font-mono text-xs ${
								row.rank === 1 ? "text-accent-amber" : "text-text-secondary"
							}`}
						>
							{row.rank}
						</span>
						<span className="w-[70px] font-mono text-xs font-bold text-accent-red">
							{row.score}
						</span>

						{/* Code com syntax highlighting do Shiki */}
						<div
							className="flex-1 font-mono text-xs leading-snug [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent [&_.line]:block"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is safe server-side HTML
							dangerouslySetInnerHTML={{ __html: row.codeHtml }}
						/>

						<span className="w-[100px] font-mono text-xs text-text-secondary">{row.language}</span>
					</div>
				))}
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
