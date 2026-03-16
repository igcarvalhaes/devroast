"use client";

import hljs from "highlight.js/lib/core";
import { useEffect, useState } from "react";
import { normalizeLanguageId } from "@/lib/languages";

/* ── Registrar linguagens para auto-detecção ────────── */

import hljsBash from "highlight.js/lib/languages/bash";
import hljsC from "highlight.js/lib/languages/c";
import hljsCpp from "highlight.js/lib/languages/cpp";
import hljsCsharp from "highlight.js/lib/languages/csharp";
import hljsCss from "highlight.js/lib/languages/css";
import hljsDart from "highlight.js/lib/languages/dart";
import hljsDockerfile from "highlight.js/lib/languages/dockerfile";
import hljsElixir from "highlight.js/lib/languages/elixir";
import hljsGo from "highlight.js/lib/languages/go";
import hljsGraphql from "highlight.js/lib/languages/graphql";
import hljsHaskell from "highlight.js/lib/languages/haskell";
import hljsJava from "highlight.js/lib/languages/java";
// Importar apenas as linguagens mais comuns para detecção.
// highlight.js é usado APENAS para detecção, não para rendering.
import hljsJavascript from "highlight.js/lib/languages/javascript";
import hljsJson from "highlight.js/lib/languages/json";
import hljsKotlin from "highlight.js/lib/languages/kotlin";
import hljsLua from "highlight.js/lib/languages/lua";
import hljsMarkdown from "highlight.js/lib/languages/markdown";
import hljsPerl from "highlight.js/lib/languages/perl";
import hljsPhp from "highlight.js/lib/languages/php";
import hljsPowershell from "highlight.js/lib/languages/powershell";
import hljsPython from "highlight.js/lib/languages/python";
import hljsR from "highlight.js/lib/languages/r";
import hljsRuby from "highlight.js/lib/languages/ruby";
import hljsRust from "highlight.js/lib/languages/rust";
import hljsScala from "highlight.js/lib/languages/scala";
import hljsSql from "highlight.js/lib/languages/sql";
import hljsSwift from "highlight.js/lib/languages/swift";
import hljsTypescript from "highlight.js/lib/languages/typescript";
import hljsXml from "highlight.js/lib/languages/xml";
import hljsYaml from "highlight.js/lib/languages/yaml";

hljs.registerLanguage("javascript", hljsJavascript);
hljs.registerLanguage("typescript", hljsTypescript);
hljs.registerLanguage("python", hljsPython);
hljs.registerLanguage("go", hljsGo);
hljs.registerLanguage("rust", hljsRust);
hljs.registerLanguage("java", hljsJava);
hljs.registerLanguage("cpp", hljsCpp);
hljs.registerLanguage("c", hljsC);
hljs.registerLanguage("csharp", hljsCsharp);
hljs.registerLanguage("php", hljsPhp);
hljs.registerLanguage("ruby", hljsRuby);
hljs.registerLanguage("swift", hljsSwift);
hljs.registerLanguage("kotlin", hljsKotlin);
hljs.registerLanguage("scala", hljsScala);
hljs.registerLanguage("lua", hljsLua);
hljs.registerLanguage("dart", hljsDart);
hljs.registerLanguage("elixir", hljsElixir);
hljs.registerLanguage("haskell", hljsHaskell);
hljs.registerLanguage("perl", hljsPerl);
hljs.registerLanguage("r", hljsR);
hljs.registerLanguage("bash", hljsBash);
hljs.registerLanguage("sql", hljsSql);
hljs.registerLanguage("xml", hljsXml);
hljs.registerLanguage("css", hljsCss);
hljs.registerLanguage("json", hljsJson);
hljs.registerLanguage("yaml", hljsYaml);
hljs.registerLanguage("markdown", hljsMarkdown);
hljs.registerLanguage("dockerfile", hljsDockerfile);
hljs.registerLanguage("graphql", hljsGraphql);
hljs.registerLanguage("powershell", hljsPowershell);

/**
 * Hook que detecta automaticamente a linguagem do código via highlight.js.
 * Usa debounce de 300ms para evitar trocas rápidas enquanto o usuário digita.
 *
 * Retorna o ID normalizado para Shiki (ex: "typescript", "python").
 */
export function useLanguageDetection(code: string): string {
	const [detected, setDetected] = useState("plaintext");

	useEffect(() => {
		if (!code.trim()) {
			setDetected("plaintext");
			return;
		}

		const timeout = setTimeout(() => {
			const result = hljs.highlightAuto(code);
			const langId = result.language ?? "plaintext";
			setDetected(normalizeLanguageId(langId));
		}, 300);

		return () => clearTimeout(timeout);
	}, [code]);

	return detected;
}
