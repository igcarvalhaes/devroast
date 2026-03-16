"use client";

import { Combobox } from "@base-ui/react/combobox";
import {
	type ComponentProps,
	createContext,
	forwardRef,
	type KeyboardEvent,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useLanguageDetection } from "@/hooks/use-language-detection";
import { useShikiHighlight } from "@/hooks/use-shiki-highlight";
import { LANGUAGES, type Language } from "@/lib/languages";

/* ── Context ─────────────────────────────────────────── */

type CodeEditorContextValue = {
	code: string;
	lineCount: number;
	handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
	handleGutterClick: () => void;
	placeholder: string;
	highlightedHtml: string;
	selectedLanguage: string;
	detectedLanguage: string;
	userLanguage: string | null;
	onLanguageChange: (language: string | null) => void;
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
	handleKeyDown: () => {},
	textareaRef: { current: null },
	handleGutterClick: () => {},
	placeholder: PLACEHOLDER_CODE,
	highlightedHtml: "",
	selectedLanguage: "plaintext",
	detectedLanguage: "plaintext",
	userLanguage: null,
	onLanguageChange: () => {},
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
		language?: string;
		onLanguageChange?: (language: string | null) => void;
	};

type CodeEditorHeaderProps = ComponentProps<"div">;

type CodeEditorBodyProps = ComponentProps<"div">;

type CodeEditorGutterProps = ComponentProps<"button">;

type CodeEditorTextareaProps = Omit<ComponentProps<"textarea">, "value" | "onChange">;

type CodeEditorContentProps = ComponentProps<"div">;

type LanguageSelectorProps = ComponentProps<"div">;

/* ── Keyboard handling ───────────────────────────────── */

function handleEditorKeyDown(
	e: KeyboardEvent<HTMLTextAreaElement>,
	code: string,
	onCodeChange: (newCode: string) => void,
) {
	const textarea = e.currentTarget;
	const { selectionStart, selectionEnd } = textarea;

	if (e.key === "Tab") {
		e.preventDefault();
		const indent = "  ";

		if (e.shiftKey) {
			// Shift+Tab: dedent
			const beforeCursor = code.slice(0, selectionStart);
			const lineStart = beforeCursor.lastIndexOf("\n") + 1;

			if (selectionStart === selectionEnd) {
				// Single line dedent
				const line = code.slice(lineStart, selectionEnd);
				if (line.startsWith(indent)) {
					const newCode =
						code.slice(0, lineStart) + line.slice(indent.length) + code.slice(selectionEnd);
					onCodeChange(newCode);
					requestAnimationFrame(() => {
						textarea.selectionStart = Math.max(selectionStart - indent.length, lineStart);
						textarea.selectionEnd = Math.max(selectionEnd - indent.length, lineStart);
					});
				}
			} else {
				// Multi-line dedent
				const selectedText = code.slice(lineStart, selectionEnd);
				const lines = selectedText.split("\n");
				let removed = 0;
				const dedented = lines.map((line, i) => {
					if (line.startsWith(indent)) {
						if (i === 0) removed = indent.length;
						return line.slice(indent.length);
					}
					if (i === 0) removed = 0;
					return line;
				});
				const newCode = code.slice(0, lineStart) + dedented.join("\n") + code.slice(selectionEnd);
				onCodeChange(newCode);
				requestAnimationFrame(() => {
					textarea.selectionStart = Math.max(selectionStart - removed, lineStart);
					textarea.selectionEnd = lineStart + dedented.join("\n").length;
				});
			}
		} else {
			// Tab: indent
			if (selectionStart === selectionEnd) {
				// Single cursor — insert spaces
				const newCode = code.slice(0, selectionStart) + indent + code.slice(selectionEnd);
				onCodeChange(newCode);
				requestAnimationFrame(() => {
					textarea.selectionStart = selectionStart + indent.length;
					textarea.selectionEnd = selectionStart + indent.length;
				});
			} else {
				// Multi-line indent
				const beforeCursor = code.slice(0, selectionStart);
				const lineStart = beforeCursor.lastIndexOf("\n") + 1;
				const selectedText = code.slice(lineStart, selectionEnd);
				const indented = selectedText
					.split("\n")
					.map((line) => indent + line)
					.join("\n");
				const newCode = code.slice(0, lineStart) + indented + code.slice(selectionEnd);
				onCodeChange(newCode);
				requestAnimationFrame(() => {
					textarea.selectionStart = selectionStart + indent.length;
					textarea.selectionEnd = lineStart + indented.length;
				});
			}
		}
		return;
	}

	if (e.key === "Enter") {
		e.preventDefault();
		const beforeCursor = code.slice(0, selectionStart);
		const currentLineStart = beforeCursor.lastIndexOf("\n") + 1;
		const currentLine = beforeCursor.slice(currentLineStart);
		const indentMatch = currentLine.match(/^(\s*)/);
		const currentIndent = indentMatch ? indentMatch[1] : "";

		// Extra indent after { [ : >
		const trimmed = beforeCursor.trimEnd();
		const lastChar = trimmed[trimmed.length - 1];
		const extraIndent = lastChar && "{[:(>".includes(lastChar) ? "  " : "";

		const insertion = `\n${currentIndent}${extraIndent}`;
		const newCode = code.slice(0, selectionStart) + insertion + code.slice(selectionEnd);
		onCodeChange(newCode);
		requestAnimationFrame(() => {
			textarea.selectionStart = selectionStart + insertion.length;
			textarea.selectionEnd = selectionStart + insertion.length;
		});
		return;
	}

	if (e.key === "Escape") {
		textarea.blur();
	}
}

/* ── LanguageSelector ────────────────────────────────── */

const AUTO_DETECT_VALUE = "__auto__";

const LanguageSelector = forwardRef<HTMLDivElement, LanguageSelectorProps>(
	({ className, ...props }, ref) => {
		const { selectedLanguage, userLanguage, detectedLanguage, onLanguageChange } =
			useCodeEditorContext();

		const isAutoDetect = userLanguage === null;

		const displayLabel = isAutoDetect
			? `auto · ${LANGUAGES.find((l) => l.id === detectedLanguage)?.name ?? detectedLanguage}`
			: (LANGUAGES.find((l) => l.id === selectedLanguage)?.name ?? selectedLanguage);

		const items = useMemo(() => {
			const autoItem: Language = {
				id: AUTO_DETECT_VALUE,
				name: "Auto-Detect",
				aliases: ["auto", "detect"],
			};
			return [autoItem, ...LANGUAGES.filter((l) => l.id !== "plaintext")];
		}, []);

		const handleValueChange = useCallback(
			(value: Language | null) => {
				if (!value || value.id === AUTO_DETECT_VALUE) {
					onLanguageChange(null);
				} else {
					onLanguageChange(value.id);
				}
			},
			[onLanguageChange],
		);

		const filterFn = useCallback((item: Language, query: string) => {
			const lower = query.toLowerCase();
			return (
				item.name.toLowerCase().includes(lower) ||
				item.id.includes(lower) ||
				item.aliases.some((alias) => alias.includes(lower))
			);
		}, []);

		return (
			<div ref={ref} className={className} {...props}>
				<Combobox.Root
					items={items}
					onValueChange={handleValueChange}
					filter={filterFn}
					itemToStringLabel={(item) => item.name}
					itemToStringValue={(item) => item.id}
				>
					<Combobox.Trigger className="flex items-center gap-1.5 px-2 py-1 font-mono text-[11px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
						<span className="pointer-events-none">{displayLabel}</span>
						<svg
							width="10"
							height="10"
							viewBox="0 0 10 10"
							fill="none"
							aria-hidden="true"
							className="shrink-0 opacity-50"
						>
							<path
								d="M2.5 3.75L5 6.25L7.5 3.75"
								stroke="currentColor"
								strokeWidth="1.2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</Combobox.Trigger>

					<Combobox.Portal>
						<Combobox.Positioner side="bottom" sideOffset={4} align="end" className="z-50">
							<Combobox.Popup className="flex flex-col overflow-hidden border border-border-primary bg-bg-elevated shadow-xl max-h-[280px] w-[220px]">
								<div className="p-2 border-b border-border-primary">
									<Combobox.Input
										placeholder="search language..."
										className="w-full bg-bg-input border border-border-primary px-2.5 py-1.5 font-mono text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-border-hover"
									/>
								</div>

								<Combobox.List className="overflow-y-auto p-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border-primary">
									{(item: Language) => (
										<Combobox.Item
											key={item.id}
											value={item}
											className="flex items-center gap-2 px-2.5 py-1.5 font-mono text-xs text-text-secondary cursor-pointer select-none data-[highlighted]:bg-bg-elevated-hover data-[highlighted]:text-text-primary data-[selected]:text-accent-green"
										>
											<Combobox.ItemIndicator className="shrink-0">
												<svg
													width="12"
													height="12"
													viewBox="0 0 12 12"
													fill="none"
													aria-hidden="true"
												>
													<path
														d="M2.5 6L5 8.5L9.5 3.5"
														stroke="currentColor"
														strokeWidth="1.5"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											</Combobox.ItemIndicator>
											<span>{item.name}</span>
										</Combobox.Item>
									)}
								</Combobox.List>

								<Combobox.Empty className="px-2.5 py-4 text-center font-mono text-xs text-text-muted">
									no languages found
								</Combobox.Empty>
							</Combobox.Popup>
						</Combobox.Positioner>
					</Combobox.Portal>
				</Combobox.Root>
			</div>
		);
	},
);

LanguageSelector.displayName = "LanguageSelector";

/* ── Sub-components ──────────────────────────────────── */

const CodeEditorHeader = forwardRef<HTMLDivElement, CodeEditorHeaderProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={[
					"flex items-center justify-between h-10 px-4 border-b border-border-primary shrink-0",
					className,
				]
					.filter(Boolean)
					.join(" ")}
				{...props}
			>
				{children ?? (
					<>
						<div className="flex items-center gap-2">
							<span className="size-3 rounded-full bg-accent-red" />
							<span className="size-3 rounded-full bg-accent-amber" />
							<span className="size-3 rounded-full bg-accent-green" />
						</div>
						<LanguageSelector />
					</>
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
					"flex flex-col items-end w-12 shrink-0 bg-bg-surface border-r border-border-primary pt-4 px-3 cursor-text",
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
								className="font-mono text-xs leading-[20px] text-text-tertiary select-none"
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
		const { code, handleChange, handleKeyDown, textareaRef, placeholder } = useCodeEditorContext();

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
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				spellCheck={false}
				className={[
					"absolute inset-0 w-full h-full resize-none bg-transparent p-4",
					"font-mono text-xs leading-[20px] text-transparent caret-text-primary",
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

const CodeEditorContent = forwardRef<HTMLDivElement, CodeEditorContentProps>(
	({ className, children, ...props }, ref) => {
		const { highlightedHtml } = useCodeEditorContext();

		return (
			<div
				ref={ref}
				className={["relative flex-1 overflow-auto", className].filter(Boolean).join(" ")}
				{...props}
			>
				{children ?? (
					<>
						{/* Highlight layer (behind) */}
						<div
							className="absolute inset-0 p-4 font-mono text-xs leading-[20px] pointer-events-none overflow-hidden [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_code]:!bg-transparent"
							aria-hidden="true"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is safe HTML
							dangerouslySetInnerHTML={{ __html: highlightedHtml }}
						/>

						{/* Textarea layer (front, transparent text) */}
						<CodeEditorTextarea />
					</>
				)}
			</div>
		);
	},
);

CodeEditorContent.displayName = "CodeEditorContent";

const CodeEditorBody = forwardRef<HTMLDivElement, CodeEditorBodyProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div ref={ref} className={["flex h-[320px]", className].filter(Boolean).join(" ")} {...props}>
				{children ?? (
					<>
						<CodeEditorGutter />
						<CodeEditorContent />
					</>
				)}
			</div>
		);
	},
);

CodeEditorBody.displayName = "CodeEditorBody";

/* ── Root ────────────────────────────────────────────── */

const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(
	(
		{
			className,
			value,
			onValueChange,
			placeholder,
			language,
			onLanguageChange,
			children,
			...props
		},
		ref,
	) => {
		const [internalValue, setInternalValue] = useState("");
		const [userLanguage, setUserLanguage] = useState<string | null>(language ?? null);
		const textareaRef = useRef<HTMLTextAreaElement>(null);

		const code = value ?? internalValue;
		const lineCount = Math.max(code.split("\n").length, 16);
		const detectedLanguage = useLanguageDetection(code);
		const selectedLanguage = userLanguage ?? detectedLanguage;
		const highlightedHtml = useShikiHighlight(code, selectedLanguage);

		const updateCode = useCallback(
			(newCode: string) => {
				setInternalValue(newCode);
				onValueChange?.(newCode);
			},
			[onValueChange],
		);

		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLTextAreaElement>) => {
				updateCode(e.target.value);
			},
			[updateCode],
		);

		const handleKeyDown = useCallback(
			(e: KeyboardEvent<HTMLTextAreaElement>) => {
				handleEditorKeyDown(e, code, updateCode);
			},
			[code, updateCode],
		);

		const handleGutterClick = useCallback(() => {
			textareaRef.current?.focus();
		}, []);

		const handleLanguageChange = useCallback(
			(lang: string | null) => {
				setUserLanguage(lang);
				onLanguageChange?.(lang);
			},
			[onLanguageChange],
		);

		const ctx: CodeEditorContextValue = {
			code,
			lineCount,
			handleChange,
			handleKeyDown,
			textareaRef,
			handleGutterClick,
			placeholder: placeholder ?? PLACEHOLDER_CODE,
			highlightedHtml,
			selectedLanguage,
			detectedLanguage,
			userLanguage,
			onLanguageChange: handleLanguageChange,
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
	CodeEditorContent,
	LanguageSelector,
	codeEditor,
	type CodeEditorProps,
	type CodeEditorVariants,
	type CodeEditorHeaderProps,
	type CodeEditorBodyProps,
	type CodeEditorGutterProps,
	type CodeEditorTextareaProps,
	type CodeEditorContentProps,
	type LanguageSelectorProps,
};
