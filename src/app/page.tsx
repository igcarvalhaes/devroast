import { Suspense } from "react";
import { CodeInputSection } from "@/components/code-input-section";
import { HomeMetrics } from "@/components/home-metrics";
import { ShameLeaderboard } from "@/components/shame-leaderboard";
import { LeaderboardSkeleton } from "@/components/ui/leaderboard-skeleton";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const revalidate = 3600;

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

export default async function Home() {
	// Prefetch metrics e leaderboard no server
	prefetch(trpc.roast.getHomeMetrics.queryOptions());
	prefetch(trpc.roast.getTopWorstRoasts.queryOptions());

	return (
		<main className="flex flex-col items-center gap-8 pt-20 pb-0 px-10 bg-bg-page min-h-screen">
			<HeroSection />
			<CodeInputSection />
			<FooterStats />

			{/* Spacer */}
			<div className="h-[60px] w-full shrink-0" />

			<HydrateClient>
				<Suspense fallback={<LeaderboardSkeleton />}>
					<ShameLeaderboard />
				</Suspense>
			</HydrateClient>

			{/* Bottom spacer */}
			<div className="h-[60px] w-full shrink-0" />
		</main>
	);
}
