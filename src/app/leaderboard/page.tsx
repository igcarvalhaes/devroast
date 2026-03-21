import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { LeaderboardList } from "@/components/leaderboard-list";
import { LeaderboardMetrics } from "@/components/leaderboard-metrics";
import { LeaderboardSkeleton } from "@/components/ui/leaderboard-skeleton";
import { caller, HydrateClient, prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = {
	title: "Shame Leaderboard | devroast",
	description: "The most roasted code on the internet",
};

async function getLeaderboardData(page: number) {
	"use cache";
	cacheLife("hours");
	cacheTag("leaderboard");

	return caller.roast.getLeaderboard({ page, limit: 20 });
}

async function getMetrics() {
	"use cache";
	cacheLife("hours");
	cacheTag("homepage");

	return caller.roast.getHomeMetrics();
}

async function LeaderboardContent({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
	const { page } = await searchParams;
	const pageNumber = Math.max(1, Number(page) || 1);

	// Fetch dados em paralelo (cacheados por 1h)
	const [leaderboardData, metrics] = await Promise.all([
		getLeaderboardData(pageNumber),
		getMetrics(),
	]);

	return (
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

				<LeaderboardMetrics data={metrics} />
			</div>

			{/* Leaderboard com dados do servidor */}
			<LeaderboardList data={leaderboardData} />
		</div>
	);
}

export default function LeaderboardPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	return (
		<main className="flex flex-col w-full bg-bg-page px-20 py-10">
			<Suspense fallback={<LeaderboardSkeleton />}>
				<LeaderboardContent searchParams={searchParams} />
			</Suspense>
		</main>
	);
}
