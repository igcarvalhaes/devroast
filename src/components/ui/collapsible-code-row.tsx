"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { type ComponentProps, forwardRef } from "react";
import { tv } from "tailwind-variants";

/* ── Variants ─────────────────────────────────────────── */

const collapsibleCodeRow = tv({
	slots: {
		root: "overflow-hidden border-t border-border-primary bg-bg-input",

		// Content wrapper (scrollable quando collapsed)
		content: [
			"overflow-hidden transition-all duration-300 ease-in-out",
			"data-[state=closed]:max-h-[120px]",
			"data-[state=open]:max-h-none",
		],

		// Code display area
		codeWrapper: "flex",

		// Line numbers column
		lineNumbers: [
			"flex w-10 shrink-0 flex-col items-end",
			"border-r border-border-primary bg-bg-surface",
			"px-[10px] py-3 leading-snug",
			"text-text-tertiary select-none font-mono text-[13px]",
		],

		// Code content
		codeContent: [
			"min-w-0 flex-1 overflow-x-auto p-3 leading-snug font-mono text-[13px]",
			"[&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent",
		],

		// Footer com botão toggle
		footer: [
			"flex items-center justify-center",
			"h-8 border-t border-border-primary bg-bg-surface",
			"hover:bg-bg-input transition-colors cursor-pointer",
		],

		toggleButton: [
			"font-mono text-xs text-text-tertiary",
			"hover:text-text-secondary transition-colors",
		],
	},
});

/* ── Types ───────────────────────────────────────────── */

type CollapsibleCodeRowProps = Omit<ComponentProps<"div">, "children"> & {
	codeHtml: string;
	lineCount: number;
	language: string;
	defaultOpen?: boolean;
};

/* ── Component ───────────────────────────────────────── */

const CollapsibleCodeRow = forwardRef<HTMLDivElement, CollapsibleCodeRowProps>(
	({ className, codeHtml, lineCount, language, defaultOpen = false, ...props }, ref) => {
		const styles = collapsibleCodeRow();

		return (
			<Collapsible.Root defaultOpen={defaultOpen}>
				<div ref={ref} className={styles.root({ className })} {...props}>
					{/* Collapsible Panel */}
					<Collapsible.Panel className={styles.content()}>
						<div className={styles.codeWrapper()}>
							{/* Line numbers */}
							<div className={styles.lineNumbers()}>
								{Array.from({ length: lineCount }, (_, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: line numbers are static and never reorder
									<span key={i}>{i + 1}</span>
								))}
							</div>

							{/* Code com syntax highlighting do Shiki */}
							<div
								className={styles.codeContent()}
								// biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is safe server-side HTML
								dangerouslySetInnerHTML={{ __html: codeHtml }}
							/>
						</div>
					</Collapsible.Panel>

					{/* Toggle button (sempre visível) */}
					<Collapsible.Trigger className={styles.footer()}>
						<span className={styles.toggleButton()}>
							<span className="data-[state=closed]:inline data-[state=open]:hidden">
								show more ↓
							</span>
							<span className="data-[state=closed]:hidden data-[state=open]:inline">
								show less ↑
							</span>
						</span>
					</Collapsible.Trigger>
				</div>
			</Collapsible.Root>
		);
	},
);

CollapsibleCodeRow.displayName = "CollapsibleCodeRow";

/* ── Exports ─────────────────────────────────────────── */

export { CollapsibleCodeRow, collapsibleCodeRow, type CollapsibleCodeRowProps };
