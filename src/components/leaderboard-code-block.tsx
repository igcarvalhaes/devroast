import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const codeBlock = tv({
	slots: {
		container: ["flex overflow-clip", "bg-bg-input border border-border-primary"],
		lineNumbers: [
			"flex flex-col items-end gap-1.5",
			"w-10 h-full px-2.5 py-3.5",
			"bg-bg-surface border-r border-border-primary",
			"font-mono text-xs text-text-tertiary",
		],
		codeContent: ["flex flex-col gap-1.5", "px-4 py-3.5 w-full"],
		codeLine: "flex font-mono text-xs",
		token: "font-mono text-xs",
	},
});

type CodeBlockVariants = VariantProps<typeof codeBlock>;

interface Token {
	content: string;
	color: string;
}

interface CodeLine {
	tokens: Token[];
}

type CodeBlockProps = Omit<ComponentProps<"div">, "children"> &
	CodeBlockVariants & {
		lines: CodeLine[];
		height?: number;
	};

const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
	({ className, lines, height = 120, ...props }, ref) => {
		const styles = codeBlock();

		return (
			<div
				ref={ref}
				className={styles.container({ className })}
				style={{ height: `${height}px` }}
				{...props}
			>
				<div className={styles.lineNumbers()}>
					{lines.map((_, index) => (
						<span key={`line-${index + 1}`}>{index + 1}</span>
					))}
				</div>

				<div className={styles.codeContent()}>
					{lines.map((line, lineIndex) => (
						<div key={`code-line-${lineIndex + 1}`} className={styles.codeLine()}>
							{line.tokens.map((token, tokenIndex) => (
								<span
									key={`token-${lineIndex}-${tokenIndex}`}
									className={styles.token()}
									style={{ color: token.color }}
								>
									{token.content}
								</span>
							))}
						</div>
					))}
				</div>
			</div>
		);
	},
);

CodeBlock.displayName = "CodeBlock";

export {
	CodeBlock,
	codeBlock,
	type CodeBlockProps,
	type CodeBlockVariants,
	type Token,
	type CodeLine,
};
