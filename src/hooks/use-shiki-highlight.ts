"use client";

import { useEffect, useState } from "react";
import { ensureLanguage, getHighlighter } from "@/lib/shiki";

/**
 * Hook que transforma code + language em HTML colorizado via Shiki.
 * Atualiza a cada mudança de code ou language (sem debounce).
 *
 * Retorna uma string HTML vazia enquanto o highlighter inicializa
 * ou quando o code está vazio.
 */
export function useShikiHighlight(code: string, language: string): string {
	const [html, setHtml] = useState("");

	useEffect(() => {
		if (!code.trim()) {
			setHtml("");
			return;
		}

		let cancelled = false;

		async function highlight() {
			const highlighter = await getHighlighter();

			if (cancelled) return;

			await ensureLanguage(highlighter, language);

			if (cancelled) return;

			const loadedLangs = highlighter.getLoadedLanguages();
			const lang = loadedLangs.includes(language) ? language : "plaintext";

			const result = highlighter.codeToHtml(code, {
				lang,
				theme: "vesper",
			});

			if (!cancelled) {
				setHtml(result);
			}
		}

		highlight();

		return () => {
			cancelled = true;
		};
	}, [code, language]);

	return html;
}
