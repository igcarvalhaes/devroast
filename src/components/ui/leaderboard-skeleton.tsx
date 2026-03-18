import Link from "next/link";
import { button } from "./button";

export function LeaderboardSkeleton() {
	return (
		<div className="flex flex-col gap-6 w-[960px]">
			{/* Title Row - estático (não anima) */}
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center gap-2">
					<span className="font-mono text-sm font-bold text-accent-green">{"//"}</span>
					<span className="font-mono text-sm font-bold text-text-primary">shame_leaderboard</span>
				</div>
				{/* Button skeleton */}
				<Link
					href="/leaderboard"
					className={button({
						variant: "outline",
						size: "sm",
						className: "rounded-none px-3 py-1.5 text-xs text-text-secondary opacity-50",
					})}
				>
					$ view_all {">>"}
				</Link>
			</div>

			{/* Subtitle - estático */}
			<p className="font-body-mono text-[13px] text-text-tertiary -mt-2">
				{"// the worst code on the internet, ranked by shame"}
			</p>

			{/* Table skeleton */}
			<div className="flex flex-col border border-border-primary w-full">
				{/* Header - estático */}
				<div className="flex items-center h-10 px-5 bg-bg-surface border-b border-border-primary">
					<span className="w-[50px] font-mono text-xs font-medium text-text-tertiary">#</span>
					<span className="w-[70px] font-mono text-xs font-medium text-text-tertiary">score</span>
					<span className="flex-1 font-mono text-xs font-medium text-text-tertiary">code</span>
					<span className="w-[100px] font-mono text-xs font-medium text-text-tertiary">lang</span>
				</div>

				{/* 3 skeleton rows com pulse */}
				{[1, 2, 3].map((i, index) => (
					<div
						key={i}
						className={[
							"flex items-start px-5 py-4",
							index < 2 ? "border-b border-border-primary" : "",
						].join(" ")}
					>
						<div className="w-[50px]">
							<div className="h-4 w-3 bg-bg-surface rounded animate-pulse" />
						</div>
						<div className="w-[70px]">
							<div className="h-4 w-8 bg-bg-surface rounded animate-pulse" />
						</div>
						<div className="flex-1 flex flex-col gap-2">
							<div className="h-3 w-full bg-bg-surface rounded animate-pulse" />
							<div className="h-3 w-4/5 bg-bg-surface rounded animate-pulse" />
							<div className="h-3 w-3/5 bg-bg-surface rounded animate-pulse" />
						</div>
						<div className="w-[100px]">
							<div className="h-4 w-16 bg-bg-surface rounded animate-pulse" />
						</div>
					</div>
				))}
			</div>

			{/* Footer skeleton */}
			<div className="flex justify-center w-full">
				<div className="h-4 w-64 bg-bg-surface rounded animate-pulse" />
			</div>
		</div>
	);
}
