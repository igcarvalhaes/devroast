import { type ComponentProps, forwardRef } from "react";

/* ── Types ───────────────────────────────────────────── */

type DiffBlockProps = ComponentProps<"div"> & {
	fileName: string;
	removed: string[];
	added: string[];
};

type DiffLineProps = ComponentProps<"div"> & {
	type: "removed" | "added" | "context";
	children: React.ReactNode;
};

/* ── Sub-components ──────────────────────────────────── */

const DiffLine = forwardRef<HTMLDivElement, DiffLineProps>(
	({ className, type, children, ...props }, ref) => {
		const bgClass = {
			removed: "bg-[#EF444415]",
			added: "bg-[#10B98115]",
			context: "",
		}[type];

		const prefixColor = {
			removed: "text-accent-red",
			added: "text-accent-green",
			context: "text-text-tertiary",
		}[type];

		const prefix = {
			removed: "- ",
			added: "+ ",
			context: "  ",
		}[type];

		const textColor = {
			removed: "text-[#EF4444]",
			added: "text-[#10B981]",
			context: "text-syn-operator",
		}[type];

		return (
			<div
				ref={ref}
				className={["flex h-7 items-center px-4 font-mono text-xs", bgClass, className]
					.filter(Boolean)
					.join(" ")}
				{...props}
			>
				<span className={`w-5 shrink-0 ${prefixColor}`}>{prefix}</span>
				<span className={textColor}>{children}</span>
			</div>
		);
	},
);

DiffLine.displayName = "DiffLine";

/* ── Root ────────────────────────────────────────────── */

export const DiffBlock = forwardRef<HTMLDivElement, DiffBlockProps>(
	({ className, fileName, removed, added, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={["overflow-hidden border border-border-primary bg-bg-input", className]
					.filter(Boolean)
					.join(" ")}
				{...props}
			>
				{/* Header */}
				<div className="flex h-10 items-center gap-2 border-b border-border-primary px-4">
					<span className="font-mono text-xs font-medium text-text-secondary">{fileName}</span>
				</div>

				{/* Diff body */}
				<div className="flex flex-col py-1">
					{/* Context line */}
					<DiffLine type="context">function calculateTotal(items) {"{"}</DiffLine>

					{/* Removed lines */}
					{removed.map((line) => (
						<DiffLine key={`rm-${line}`} type="removed">
							{line}
						</DiffLine>
					))}

					{/* Added lines */}
					{added.map((line) => (
						<DiffLine key={`add-${line}`} type="added">
							{line}
						</DiffLine>
					))}

					{/* Context line */}
					<DiffLine type="context">{"}"}</DiffLine>
				</div>
			</div>
		);
	},
);

DiffBlock.displayName = "DiffBlock";

export type { DiffBlockProps, DiffLineProps };
