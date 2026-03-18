import type { Metadata } from "next";
import { Suspense } from "react";
import { LeaderboardList } from "@/components/leaderboard-list";
import { LeaderboardMetrics } from "@/components/leaderboard-metrics";
import { LeaderboardSkeleton } from "@/components/ui/leaderboard-skeleton";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = {
	title: "Shame Leaderboard | devroast",
	description: "The most roasted code on the internet",
};

export default async function LeaderboardPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const { page } = await searchParams;
	const pageNumber = Number(page) || 1;

	void prefetch(trpc.roast.getLeaderboard.queryOptions({ page: pageNumber, limit: 20 }));
	void prefetch(trpc.roast.getHomeMetrics.queryOptions());

	return (
		<main className="flex flex-col w-full bg-bg-page px-20 py-10">
			<HydrateClient>
				<div className="flex flex-col w-full gap-10">
					{/* Hero Section */}
					<div className="flex flex-col gap-4 w-full">
						<div className="flex items-center gap-3">
							<span className="font-mono text-3xl font-bold text-accent-green">{">"}</span>
							<h1 className="font-mono text-2xl font-bold text-text-primary">shame_leaderboard</h1>
						</div>

						<p className="font-body-mono text-sm text-text-secondary">
							{"// the most roasted code on the internet"}
						</p>

						<LeaderboardMetrics />
					</div>

					{/* Leaderboard Entries */}
					<Suspense fallback={<LeaderboardSkeleton />}>
						<LeaderboardList page={pageNumber} />
					</Suspense>
				</div>
			</HydrateClient>
		</main>
	);
}
