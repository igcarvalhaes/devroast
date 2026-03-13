"use client";

import {
	type ComponentProps,
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react";
import { tv, type VariantProps } from "tailwind-variants";

/* ── Context ─────────────────────────────────────────── */

type CodeEditorContextValue = {
	code: string;
	lineCount: number;
	handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
	handleGutterClick: () => void;
	placeholder: string;
};

const PLACEHOLDER_CODE = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].qty;
  }

  if (total > 100) {
    total = total * 0.9;
    console.log("discount applied!");
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`;

const CodeEditorContext = createContext<CodeEditorContextValue>({
	code: "",
	lineCount: 16,
	handleChange: () => {},
	textareaRef: { current: null },
	handleGutterClick: () => {},
	placeholder: PLACEHOLDER_CODE,
});

function useCodeEditorContext() {
	return useContext(CodeEditorContext);
}

/* ── Variants ────────────────────────────────────────── */

const codeEditor = tv({
	base: ["flex flex-col overflow-hidden", "bg-bg-input border border-border-primary", "w-[780px]"],
});

/* ── Types ───────────────────────────────────────────── */

type CodeEditorVariants = VariantProps<typeof codeEditor>;

type CodeEditorProps = ComponentProps<"div"> &
	CodeEditorVariants & {
		value?: string;
		onValueChange?: (value: string) => void;
		placeholder?: string;
	};

type CodeEditorHeaderProps = ComponentProps<"div">;

type CodeEditorBodyProps = ComponentProps<"div">;

type CodeEditorGutterProps = ComponentProps<"button">;

type CodeEditorTextareaProps = Omit<ComponentProps<"textarea">, "value" | "onChange">;

/* ── Sub-components ──────────────────────────────────── */

const CodeEditorHeader = forwardRef<HTMLDivElement, CodeEditorHeaderProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={[
					"flex items-center h-10 px-4 border-b border-border-primary shrink-0",
					className,
				]
					.filter(Boolean)
					.join(" ")}
				{...props}
			>
				{children ?? (
					<div className="flex items-center gap-2">
						<span className="size-3 rounded-full bg-accent-red" />
						<span className="size-3 rounded-full bg-accent-amber" />
						<span className="size-3 rounded-full bg-accent-green" />
					</div>
				)}
			</div>
		);
	},
);

CodeEditorHeader.displayName = "CodeEditorHeader";

const CodeEditorGutter = forwardRef<HTMLButtonElement, CodeEditorGutterProps>(
	({ className, children, ...props }, ref) => {
		const { lineCount, handleGutterClick } = useCodeEditorContext();
		return (
			<button
				ref={ref}
				type="button"
				className={[
					"flex flex-col items-end gap-2 w-12 shrink-0 bg-bg-surface border-r border-border-primary p-4 py-4 cursor-text",
					className,
				]
					.filter(Boolean)
					.join(" ")}
				onClick={handleGutterClick}
				tabIndex={-1}
				aria-hidden="true"
				{...props}
			>
				{children ??
					Array.from({ length: lineCount }, (_, i) => {
						const lineNum = i + 1;
						return (
							<span
								key={`ln-${lineNum}`}
								className="font-mono text-xs leading-none text-text-tertiary select-none"
							>
								{lineNum}
							</span>
						);
					})}
			</button>
		);
	},
);

CodeEditorGutter.displayName = "CodeEditorGutter";

const CodeEditorTextarea = forwardRef<HTMLTextAreaElement, CodeEditorTextareaProps>(
	({ className, ...props }, ref) => {
		const { code, handleChange, textareaRef, placeholder } = useCodeEditorContext();

		// Merge refs: forward the external ref + keep internal textareaRef
		const setRefs = useCallback(
			(node: HTMLTextAreaElement | null) => {
				(textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
				if (typeof ref === "function") {
					ref(node);
				} else if (ref) {
					(ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
				}
			},
			[ref, textareaRef],
		);

		return (
			<textarea
				ref={setRefs}
				value={code}
				onChange={handleChange}
				placeholder={placeholder}
				spellCheck={false}
				className={[
					"flex-1 resize-none bg-transparent p-4",
					"font-mono text-xs leading-[20px] text-text-primary",
					"placeholder:text-text-muted",
					"outline-none border-none",
					"scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border-primary",
					className,
				]
					.filter(Boolean)
					.join(" ")}
				{...props}
			/>
		);
	},
);

CodeEditorTextarea.displayName = "CodeEditorTextarea";

const CodeEditorBody = forwardRef<HTMLDivElement, CodeEditorBodyProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div ref={ref} className={["flex h-[320px]", className].filter(Boolean).join(" ")} {...props}>
				{children ?? (
					<>
						<CodeEditorGutter />
						<CodeEditorTextarea />
					</>
				)}
			</div>
		);
	},
);

CodeEditorBody.displayName = "CodeEditorBody";

/* ── Root ────────────────────────────────────────────── */

const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(
	({ className, value, onValueChange, placeholder, children, ...props }, ref) => {
		const [internalValue, setInternalValue] = useState("");
		const textareaRef = useRef<HTMLTextAreaElement>(null);

		const code = value ?? internalValue;
		const lineCount = Math.max(code.split("\n").length, 16);

		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLTextAreaElement>) => {
				const newValue = e.target.value;
				setInternalValue(newValue);
				onValueChange?.(newValue);
			},
			[onValueChange],
		);

		const handleGutterClick = useCallback(() => {
			textareaRef.current?.focus();
		}, []);

		const ctx: CodeEditorContextValue = {
			code,
			lineCount,
			handleChange,
			textareaRef,
			handleGutterClick,
			placeholder: placeholder ?? PLACEHOLDER_CODE,
		};

		return (
			<CodeEditorContext value={ctx}>
				<div ref={ref} className={codeEditor({ className })} {...props}>
					{children ?? (
						<>
							<CodeEditorHeader />
							<CodeEditorBody />
						</>
					)}
				</div>
			</CodeEditorContext>
		);
	},
);

CodeEditor.displayName = "CodeEditor";

export {
	CodeEditor,
	CodeEditorHeader,
	CodeEditorBody,
	CodeEditorGutter,
	CodeEditorTextarea,
	codeEditor,
	type CodeEditorProps,
	type CodeEditorVariants,
	type CodeEditorHeaderProps,
	type CodeEditorBodyProps,
	type CodeEditorGutterProps,
	type CodeEditorTextareaProps,
};
