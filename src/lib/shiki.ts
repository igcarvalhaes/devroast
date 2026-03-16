import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { bundledLanguages } from "shiki/langs";
import { bundledThemes } from "shiki/themes";

let highlighterPromise: Promise<HighlighterCore> | null = null;

/**
 * Retorna um singleton do Shiki highlighter usando o JS RegExp engine
 * (sem WASM). Na primeira chamada, inicializa com um subset mínimo de
 * linguagens. Linguagens adicionais são carregadas sob demanda via
 * `ensureLanguage`.
 */
export function getHighlighter(): Promise<HighlighterCore> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighterCore({
			engine: createJavaScriptRegexEngine(),
			themes: [bundledThemes.vesper()],
			langs: [
				bundledLanguages.javascript(),
				bundledLanguages.typescript(),
				bundledLanguages.python(),
				bundledLanguages.go(),
			],
		});
	}
	return highlighterPromise;
}

/**
 * Garante que uma linguagem está carregada no highlighter.
 * Se já estiver carregada, é um no-op.
 */
export async function ensureLanguage(highlighter: HighlighterCore, lang: string): Promise<void> {
	const loaded = highlighter.getLoadedLanguages();
	if (!loaded.includes(lang)) {
		const loader = bundledLanguages[lang as keyof typeof bundledLanguages];
		if (loader) {
			try {
				const langModule = await loader();
				await highlighter.loadLanguage(langModule);
			} catch {
				// Linguagem não encontrada — fallback silencioso para plaintext
			}
		}
	}
}
