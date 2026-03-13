"use client";

import { type ComponentProps, createContext, forwardRef, useContext } from "react";
import { tv, type VariantProps } from "tailwind-variants";

/* ── Context ─────────────────────────────────────────── */

type DiffLineContextValue = {
	variant: "added" | "removed" | "context";
};

const DiffLineContext = createContext<DiffLineContextValue>({ variant: "context" });

function useDiffLineContext() {
	return useContext(DiffLineContext);
}

/* ── Variants ────────────────────────────────────────── */

const diffLine = tv({
	base: "flex gap-2 px-4 py-2 font-mono text-[13px] leading-snug",
	variants: {
		variant: {
			added: "bg-diff-added-bg",
			removed: "bg-diff-removed-bg",
			context: "",
		},
	},
	defaultVariants: {
		variant: "context",
	},
});

const diffLinePrefixVariant = tv({
	base: "shrink-0 select-none",
	variants: {
		variant: {
			added: "text-accent-green",
			removed: "text-accent-red",
			context: "text-text-tertiary",
		},
	},
	defaultVariants: {
		variant: "context",
	},
});

const diffLineCodeVariant = tv({
	base: "whitespace-pre",
	variants: {
		variant: {
			added: "text-text-primary",
			removed: "text-text-secondary",
			context: "text-text-secondary",
		},
	},
	defaultVariants: {
		variant: "context",
	},
});

/* ── Types ───────────────────────────────────────────── */

type DiffLineVariants = VariantProps<typeof diffLine>;

type DiffLineProps = ComponentProps<"div"> & DiffLineVariants;

type DiffLinePrefixProps = ComponentProps<"span">;

type DiffLineCodeProps = ComponentProps<"span">;

/* ── Prefix map ──────────────────────────────────────── */

const prefixMap = {
	added: "+",
	removed: "-",
	context: " ",
} as const;

/* ── Sub-components ──────────────────────────────────── */

const DiffLinePrefix = forwardRef<HTMLSpanElement, DiffLinePrefixProps>(
	({ className, children, ...props }, ref) => {
		const { variant } = useDiffLineContext();
		return (
			<span
				ref={ref}
				className={diffLinePrefixVariant({ variant, className })}
				aria-hidden="true"
				{...props}
			>
				{children ?? prefixMap[variant]}
			</span>
		);
	},
);

DiffLinePrefix.displayName = "DiffLinePrefix";

const DiffLineCode = forwardRef<HTMLSpanElement, DiffLineCodeProps>(
	({ className, children, ...props }, ref) => {
		const { variant } = useDiffLineContext();
		return (
			<span ref={ref} className={diffLineCodeVariant({ variant, className })} {...props}>
				{children}
			</span>
		);
	},
);

DiffLineCode.displayName = "DiffLineCode";

/* ── Root ────────────────────────────────────────────── */

const DiffLine = forwardRef<HTMLDivElement, DiffLineProps>(
	({ className, variant = "context", children, ...props }, ref) => {
		return (
			<DiffLineContext value={{ variant: variant ?? "context" }}>
				<div ref={ref} className={diffLine({ variant, className })} {...props}>
					{children}
				</div>
			</DiffLineContext>
		);
	},
);

DiffLine.displayName = "DiffLine";

export {
	DiffLine,
	DiffLinePrefix,
	DiffLineCode,
	diffLine,
	type DiffLineProps,
	type DiffLineVariants,
	type DiffLinePrefixProps,
	type DiffLineCodeProps,
};
