import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { CodeBlock, type CodeLine } from "./leaderboard-code-block";

const leaderboardEntry = tv({
	slots: {
		container: ["flex flex-col w-full", "border border-border-primary"],
		metaRow: ["flex items-center justify-between", "h-12 px-5", "border-b border-border-primary"],
		metaLeft: "flex items-center gap-4",
		rankGroup: "flex items-center gap-1.5",
		rankHash: "font-mono text-[13px] text-text-tertiary",
		rankNumber: "font-mono text-[13px] font-bold",
		scoreGroup: "flex items-center gap-1.5",
		scoreLabel: "font-mono text-xs text-text-tertiary",
		scoreValue: "font-mono text-[13px] font-bold text-accent-red",
		metaRight: "flex items-center gap-3",
		language: "font-mono text-xs text-text-secondary",
		lineCount: "font-mono text-xs text-text-tertiary",
	},
	variants: {
		rank: {
			1: {
				rankNumber: "text-accent-amber",
			},
			2: {
				rankNumber: "text-[#C0C0C0]",
			},
			3: {
				rankNumber: "text-[#CD7F32]",
			},
			default: {
				rankNumber: "text-text-primary",
			},
		},
	},
	defaultVariants: {
		rank: "default",
	},
});

type LeaderboardEntryVariants = VariantProps<typeof leaderboardEntry>;

type LeaderboardEntryProps = Omit<ComponentProps<"div">, "children"> &
	Omit<LeaderboardEntryVariants, "rank"> & {
		rank: number;
		score: number;
		language: string;
		lineCount: number;
		code: CodeLine[];
	};

const LeaderboardEntry = forwardRef<HTMLDivElement, LeaderboardEntryProps>(
	({ className, rank, score, language, lineCount, code, ...props }, ref) => {
		const rankVariant: 1 | 2 | 3 | "default" =
			rank === 1 ? 1 : rank === 2 ? 2 : rank === 3 ? 3 : "default";
		const styles = leaderboardEntry({ rank: rankVariant });

		return (
			<div ref={ref} className={styles.container({ className })} {...props}>
				<div className={styles.metaRow()}>
					<div className={styles.metaLeft()}>
						<div className={styles.rankGroup()}>
							<span className={styles.rankHash()}>#</span>
							<span className={styles.rankNumber()}>{rank}</span>
						</div>

						<div className={styles.scoreGroup()}>
							<span className={styles.scoreLabel()}>score:</span>
							<span className={styles.scoreValue()}>{score.toFixed(1)}</span>
						</div>
					</div>

					<div className={styles.metaRight()}>
						<span className={styles.language()}>{language}</span>
						<span className={styles.lineCount()}>{lineCount} lines</span>
					</div>
				</div>

				<CodeBlock lines={code} height={120} />
			</div>
		);
	},
);

LeaderboardEntry.displayName = "LeaderboardEntry";

export {
	LeaderboardEntry,
	leaderboardEntry,
	type LeaderboardEntryProps,
	type LeaderboardEntryVariants,
};
