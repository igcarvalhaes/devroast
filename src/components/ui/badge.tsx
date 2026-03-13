"use client";

import { type ComponentProps, createContext, forwardRef, useContext } from "react";
import { tv, type VariantProps } from "tailwind-variants";

/* ── Context ─────────────────────────────────────────── */

type BadgeContextValue = {
	variant: "critical" | "warning" | "good";
};

const BadgeContext = createContext<BadgeContextValue>({ variant: "good" });

function useBadgeContext() {
	return useContext(BadgeContext);
}

/* ── Variants ────────────────────────────────────────── */

const badge = tv({
	base: "inline-flex items-center gap-2 font-mono text-xs",
	variants: {
		variant: {
			critical: "text-accent-red",
			warning: "text-accent-amber",
			good: "text-accent-green",
		},
	},
	defaultVariants: {
		variant: "good",
	},
});

const badgeDotVariant = tv({
	base: "size-2 shrink-0 rounded-full",
	variants: {
		variant: {
			critical: "bg-accent-red",
			warning: "bg-accent-amber",
			good: "bg-accent-green",
		},
	},
	defaultVariants: {
		variant: "good",
	},
});

/* ── Types ───────────────────────────────────────────── */

type BadgeVariants = VariantProps<typeof badge>;

type BadgeProps = ComponentProps<"span"> & BadgeVariants;

type BadgeDotProps = ComponentProps<"span">;

type BadgeLabelProps = ComponentProps<"span">;

/* ── Sub-components ──────────────────────────────────── */

const BadgeDot = forwardRef<HTMLSpanElement, BadgeDotProps>(({ className, ...props }, ref) => {
	const { variant } = useBadgeContext();
	return (
		<span
			ref={ref}
			className={badgeDotVariant({ variant, className })}
			aria-hidden="true"
			{...props}
		/>
	);
});

BadgeDot.displayName = "BadgeDot";

const BadgeLabel = forwardRef<HTMLSpanElement, BadgeLabelProps>(
	({ className, children, ...props }, ref) => {
		return (
			<span ref={ref} className={className} {...props}>
				{children}
			</span>
		);
	},
);

BadgeLabel.displayName = "BadgeLabel";

/* ── Root ────────────────────────────────────────────── */

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
	({ className, variant = "good", children, ...props }, ref) => {
		return (
			<BadgeContext value={{ variant: variant ?? "good" }}>
				<span ref={ref} className={badge({ variant, className })} {...props}>
					{children}
				</span>
			</BadgeContext>
		);
	},
);

Badge.displayName = "Badge";

export {
	Badge,
	BadgeDot,
	BadgeLabel,
	badge,
	type BadgeProps,
	type BadgeVariants,
	type BadgeDotProps,
	type BadgeLabelProps,
};
