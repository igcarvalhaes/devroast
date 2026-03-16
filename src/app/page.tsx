import Link from "next/link";
import { CodeInputSection } from "@/components/code-input-section";
import { HomeMetrics } from "@/components/home-metrics";
import { button } from "@/components/ui/button";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

const LEADERBOARD_DATA = [
	{
		rank: 1,
		score: "1.2",
		lines: ['eval(prompt("enter code"))', "document.write(response)", "// trust the user lol"],
		commentIndex: 2,
		lang: "javascript",
		rankColor: "text-accent-amber",
	},
	{
		rank: 2,
		score: "1.8",
		lines: [
			"if (x == true) { return true; }",
			"else if (x == false) { return false; }",
			"else { return !false; }",
		],
		commentIndex: -1,
		lang: "typescript",
		rankColor: "text-text-secondary",
	},
	{
		rank: 3,
		score: "2.1",
		lines: ["SELECT * FROM users WHERE 1=1", "-- TODO: add authentication"],
		commentIndex: 1,
		lang: "sql",
		rankColor: "text-text-secondary",
	},
] as const;

function HeroSection() {
	return (
		<div className="flex flex-col items-center gap-3">
			<div className="flex items-center gap-3">
				<span className="font-mono text-4xl font-bold text-accent-green">$</span>
				<h1 className="font-mono text-4xl font-bold text-text-primary">
					paste your code. get roasted.
				</h1>
			</div>
			<p className="font-body-mono text-sm text-text-secondary">
				{"// drop your code below and we'll rate it — brutally honest or full roast mode"}
			</p>
		</div>
	);
}

function FooterStats() {
	return (
		<HydrateClient>
			<HomeMetrics />
		</HydrateClient>
	);
}

function LeaderboardPreview() {
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
				{LEADERBOARD_DATA.map((row, rowIndex) => (
					<div
						key={`row-${row.rank}`}
						className={[
							"flex items-start px-5 py-4",
							rowIndex < LEADERBOARD_DATA.length - 1 ? "border-b border-border-primary" : "",
						].join(" ")}
					>
						<span className={`w-[50px] font-mono text-xs ${row.rankColor}`}>{row.rank}</span>
						<span className="w-[70px] font-mono text-xs font-bold text-accent-red">
							{row.score}
						</span>
						<div className="flex-1 flex flex-col gap-[3px]">
							{row.lines.map((line, lineIndex) => (
								<span
									key={line}
									className={[
										"font-mono text-xs",
										lineIndex === row.commentIndex ? "text-text-secondary" : "text-text-primary",
									].join(" ")}
								>
									{line}
								</span>
							))}
						</div>
						<span className="w-[100px] font-mono text-xs text-text-secondary">{row.lang}</span>
					</div>
				))}
			</div>

			{/* Fade Hint */}
			<div className="flex justify-center w-full">
				<span className="font-body-mono text-xs text-text-tertiary">
					{"showing top 3 of 2,847 · view full leaderboard >>"}
				</span>
			</div>
		</div>
	);
}

export default async function Home() {
	// Prefetch metrics no server
	prefetch(trpc.roast.getHomeMetrics.queryOptions());

	return (
		<main className="flex flex-col items-center gap-8 pt-20 pb-0 px-10 bg-bg-page min-h-screen">
			<HeroSection />
			<CodeInputSection />
			<FooterStats />

			{/* Spacer */}
			<div className="h-[60px] w-full shrink-0" />

			<LeaderboardPreview />

			{/* Bottom spacer */}
			<div className="h-[60px] w-full shrink-0" />
		</main>
	);
}
