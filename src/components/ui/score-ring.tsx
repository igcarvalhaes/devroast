"use client";

import { type ComponentProps, createContext, forwardRef, useContext } from "react";
import { tv, type VariantProps } from "tailwind-variants";

/* ── Context ─────────────────────────────────────────── */

const sizeMap = {
	sm: { px: 120, scoreFont: 32, denomFont: 12, stroke: 3 },
	md: { px: 180, scoreFont: 48, denomFont: 16, stroke: 4 },
	lg: { px: 240, scoreFont: 64, denomFont: 20, stroke: 5 },
} as const;

/** Resolved token values for SVG attributes (which can't use Tailwind classes). */
const tokenColors = {
	border: "var(--color-border-primary)",
	red: "var(--color-accent-red)",
	amber: "var(--color-accent-amber)",
	green: "var(--color-accent-green)",
} as const;

function getScoreColor(score: number): string {
	if (score <= 3) return tokenColors.red;
	if (score <= 6) return tokenColors.amber;
	return tokenColors.green;
}

type ScoreRingContextValue = {
	score: number;
	dims: (typeof sizeMap)[keyof typeof sizeMap];
	color: string;
	radius: number;
	circumference: number;
	dashOffset: number;
};

const ScoreRingContext = createContext<ScoreRingContextValue>({
	score: 0,
	dims: sizeMap.md,
	color: tokenColors.green,
	radius: 0,
	circumference: 0,
	dashOffset: 0,
});

function useScoreRingContext() {
	return useContext(ScoreRingContext);
}

/* ── Variants ────────────────────────────────────────── */

const scoreRing = tv({
	base: "relative inline-flex items-center justify-center",
	variants: {
		size: {
			sm: "size-[120px]",
			md: "size-[180px]",
			lg: "size-[240px]",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

/* ── Types ───────────────────────────────────────────── */

type ScoreRingVariants = VariantProps<typeof scoreRing>;

type ScoreRingProps = ComponentProps<"div"> &
	ScoreRingVariants & {
		/** Score value from 0 to 10 */
		score: number;
	};

type ScoreRingTrackProps = ComponentProps<"circle">;

type ScoreRingArcProps = ComponentProps<"circle">;

type ScoreRingLabelProps = ComponentProps<"div">;

/* ── Sub-components ──────────────────────────────────── */

const ScoreRingTrack = forwardRef<SVGCircleElement, ScoreRingTrackProps>(({ ...props }, ref) => {
	const { dims, radius } = useScoreRingContext();
	return (
		<circle
			ref={ref}
			cx={dims.px / 2}
			cy={dims.px / 2}
			r={radius}
			fill="none"
			stroke={tokenColors.border}
			strokeWidth={dims.stroke}
			{...props}
		/>
	);
});

ScoreRingTrack.displayName = "ScoreRingTrack";

const ScoreRingArc = forwardRef<SVGCircleElement, ScoreRingArcProps>(
	({ className, ...props }, ref) => {
		const { dims, color, radius, circumference, dashOffset } = useScoreRingContext();
		return (
			<circle
				ref={ref}
				cx={dims.px / 2}
				cy={dims.px / 2}
				r={radius}
				fill="none"
				stroke={color}
				strokeWidth={dims.stroke}
				strokeLinecap="round"
				strokeDasharray={circumference}
				strokeDashoffset={dashOffset}
				transform={`rotate(-90 ${dims.px / 2} ${dims.px / 2})`}
				className={["transition-all duration-700 ease-out", className].filter(Boolean).join(" ")}
				{...props}
			/>
		);
	},
);

ScoreRingArc.displayName = "ScoreRingArc";

const ScoreRingLabel = forwardRef<HTMLDivElement, ScoreRingLabelProps>(
	({ className, children, ...props }, ref) => {
		const { score, dims, color } = useScoreRingContext();
		return (
			<div
				ref={ref}
				className={["z-10 flex items-center gap-0.5 font-mono", className]
					.filter(Boolean)
					.join(" ")}
				{...props}
			>
				{children ?? (
					<>
						<span className="font-bold leading-none" style={{ fontSize: dims.scoreFont, color }}>
							{score.toFixed(1)}
						</span>
						<span className="leading-none text-text-tertiary" style={{ fontSize: dims.denomFont }}>
							/10
						</span>
					</>
				)}
			</div>
		);
	},
);

ScoreRingLabel.displayName = "ScoreRingLabel";

/* ── Root ────────────────────────────────────────────── */

const ScoreRing = forwardRef<HTMLDivElement, ScoreRingProps>(
	({ className, size = "md", score, children, ...props }, ref) => {
		const dims = sizeMap[size ?? "md"];
		const radius = (dims.px - dims.stroke) / 2;
		const circumference = 2 * Math.PI * radius;
		const clampedScore = Math.max(0, Math.min(10, score));
		const progress = clampedScore / 10;
		const dashOffset = circumference * (1 - progress);
		const color = getScoreColor(clampedScore);

		const ctx: ScoreRingContextValue = {
			score: clampedScore,
			dims,
			color,
			radius,
			circumference,
			dashOffset,
		};

		return (
			<ScoreRingContext value={ctx}>
				<div ref={ref} className={scoreRing({ size, className })} {...props}>
					{children ?? (
						<>
							<svg
								width={dims.px}
								height={dims.px}
								viewBox={`0 0 ${dims.px} ${dims.px}`}
								className="absolute inset-0"
								aria-hidden="true"
							>
								<ScoreRingTrack />
								<ScoreRingArc />
							</svg>
							<ScoreRingLabel />
						</>
					)}
				</div>
			</ScoreRingContext>
		);
	},
);

ScoreRing.displayName = "ScoreRing";

export {
	ScoreRing,
	ScoreRingTrack,
	ScoreRingArc,
	ScoreRingLabel,
	scoreRing,
	type ScoreRingProps,
	type ScoreRingVariants,
	type ScoreRingTrackProps,
	type ScoreRingArcProps,
	type ScoreRingLabelProps,
};
