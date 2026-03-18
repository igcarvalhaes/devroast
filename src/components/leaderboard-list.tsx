"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { LeaderboardListItem } from "@/components/leaderboard-list-item";
import { Pagination } from "@/components/ui/pagination";
import { useTRPC } from "@/trpc/client";

type LeaderboardListProps = {
	page: number;
};

export function LeaderboardList({ page }: LeaderboardListProps) {
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.roast.getLeaderboard.queryOptions({ page, limit: 20 }));

	return (
		<div className="flex flex-col w-full gap-6">
			{/* List Items */}
			<div className="flex flex-col gap-4">
				{data.items.length === 0 ? (
					<div className="flex items-center justify-center p-12 border border-dashed border-border-primary">
						<span className="font-mono text-sm text-text-tertiary">// No entries found</span>
					</div>
				) : (
					data.items.map((item) => (
						<LeaderboardListItem
							key={item.id}
							rank={item.rank}
							score={item.score}
							language={item.language}
							lineCount={item.lineCount}
							codeHtml={item.codeHtml}
						/>
					))
				)}
			</div>

			{/* Pagination */}
			{data.totalPages > 1 && (
				<div className="flex justify-center mt-2">
					<Pagination
						currentPage={data.currentPage}
						totalPages={data.totalPages}
						buildHref={(p) => `?page=${p}`}
					/>
				</div>
			)}
		</div>
	);
}
