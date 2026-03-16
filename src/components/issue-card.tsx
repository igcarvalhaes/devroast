import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

/* ── Variants ────────────────────────────────────────── */

const issueCard = tv({
	base: ["flex flex-col gap-3 border border-border-primary p-5", "transition-colors duration-150"],
	variants: {
		type: {
			error: "",
			warning: "",
			success: "",
		},
	},
	defaultVariants: {
		type: "error",
	},
});

const issueBadge = tv({
	base: "inline-flex items-center gap-2 font-mono text-xs font-medium",
	variants: {
		type: {
			error: "text-accent-red",
			warning: "text-accent-amber",
			success: "text-accent-green",
		},
	},
	defaultVariants: {
		type: "error",
	},
});

const issueDot = tv({
	base: "size-2 shrink-0 rounded-full",
	variants: {
		type: {
			error: "bg-accent-red",
			warning: "bg-accent-amber",
			success: "bg-accent-green",
		},
	},
	defaultVariants: {
		type: "error",
	},
});

/* ── Types ───────────────────────────────────────────── */

type IssueCardVariants = VariantProps<typeof issueCard>;

type IssueCardProps = ComponentProps<"div"> &
	IssueCardVariants & {
		title: string;
		description: string;
	};

/* ── Component ───────────────────────────────────────── */

export const IssueCard = forwardRef<HTMLDivElement, IssueCardProps>(
	({ className, type = "error", title, description, ...props }, ref) => {
		return (
			<div ref={ref} className={issueCard({ type, className })} {...props}>
				{/* Header with icon */}
				<div className={issueBadge({ type })}>
					<span className={issueDot({ type })} aria-hidden="true" />
					<span>{type}</span>
				</div>

				{/* Title */}
				<h3 className="font-mono text-[13px] font-medium text-text-primary">{title}</h3>

				{/* Description */}
				<p className="font-body-mono text-xs leading-relaxed text-text-secondary">{description}</p>
			</div>
		);
	},
);

IssueCard.displayName = "IssueCard";

export { issueCard, type IssueCardProps, type IssueCardVariants };
