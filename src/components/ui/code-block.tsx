import { type ComponentProps, forwardRef } from "react";
import { codeToHtml } from "shiki";

/* ── Types ───────────────────────────────────────────── */

type CodeBlockRootProps = ComponentProps<"div">;

type CodeBlockHeaderProps = ComponentProps<"div"> & {
	filename?: string;
};

type CodeBlockBodyProps = ComponentProps<"div"> & {
	html: string;
	lineCount: number;
};

type CodeBlockProps = {
	code: string;
	language?: string;
	filename?: string;
	className?: string;
};

/* ── Sub-components ──────────────────────────────────── */

const CodeBlockRoot = forwardRef<HTMLDivElement, CodeBlockRootProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={[
					"overflow-hidden border border-border-primary bg-bg-input font-mono text-[13px]",
					className,
				]
					.filter(Boolean)
					.join(" ")}
				{...props}
			>
				{children}
			</div>
		);
	},
);

CodeBlockRoot.displayName = "CodeBlockRoot";

const CodeBlockHeader = forwardRef<HTMLDivElement, CodeBlockHeaderProps>(
	({ className, filename, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={["flex h-10 items-center gap-3 border-b border-border-primary px-4", className]
					.filter(Boolean)
					.join(" ")}
				{...props}
			>
				{children ?? (
					<>
						<span className="size-[10px] rounded-full bg-accent-red" />
						<span className="size-[10px] rounded-full bg-accent-amber" />
						<span className="size-[10px] rounded-full bg-accent-green" />
						<span className="flex-1" />
						{filename && <span className="text-xs text-text-tertiary">{filename}</span>}
					</>
				)}
			</div>
		);
	},
);

CodeBlockHeader.displayName = "CodeBlockHeader";

const CodeBlockBody = forwardRef<HTMLDivElement, CodeBlockBodyProps>(
	({ className, html, lineCount, children, ...props }, ref) => {
		return (
			<div ref={ref} className={["flex", className].filter(Boolean).join(" ")} {...props}>
				{children ?? (
					<>
						{/* Line numbers */}
						<div className="flex w-10 shrink-0 flex-col items-end border-r border-border-primary bg-bg-surface px-[10px] py-3 leading-snug text-text-tertiary select-none">
							{Array.from({ length: lineCount }, (_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: line numbers are static and never reorder
								<span key={i}>{i + 1}</span>
							))}
						</div>

						{/* Code */}
						<div
							className="code-block-content min-w-0 flex-1 overflow-x-auto p-3 leading-snug [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is safe server-side HTML
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					</>
				)}
			</div>
		);
	},
);

CodeBlockBody.displayName = "CodeBlockBody";

/* ── Convenience async wrapper (RSC) ─────────────────── */

async function CodeBlock({ code, language = "javascript", filename, className }: CodeBlockProps) {
	const html = await codeToHtml(code.trim(), {
		lang: language,
		theme: "vesper",
	});

	const lineCount = code.trim().split("\n").length;

	return (
		<CodeBlockRoot className={className}>
			{filename !== undefined && <CodeBlockHeader filename={filename} />}
			<CodeBlockBody html={html} lineCount={lineCount} />
		</CodeBlockRoot>
	);
}

CodeBlock.displayName = "CodeBlock";

export {
	CodeBlock,
	CodeBlockRoot,
	CodeBlockHeader,
	CodeBlockBody,
	type CodeBlockProps,
	type CodeBlockRootProps,
	type CodeBlockHeaderProps,
	type CodeBlockBodyProps,
};
