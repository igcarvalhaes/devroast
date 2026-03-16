export type Language = {
	/** ID usado pelo Shiki (ex: "typescript") */
	id: string;
	/** Nome legível para exibição (ex: "TypeScript") */
	name: string;
	/** Aliases para busca no combobox (ex: ["ts", "tsx"]) */
	aliases: string[];
};

/**
 * Mapa de linguagens suportadas pelo editor.
 * Cobre as linguagens mais populares — o Shiki suporta ~150+
 * mas o dropdown fica mais usável com um subset curado.
 * Linguagens adicionais são carregadas sob demanda pelo Shiki.
 */
export const LANGUAGES: Language[] = [
	{ id: "javascript", name: "JavaScript", aliases: ["js", "jsx", "mjs", "cjs"] },
	{ id: "typescript", name: "TypeScript", aliases: ["ts", "tsx", "mts", "cts"] },
	{ id: "python", name: "Python", aliases: ["py", "pyw"] },
	{ id: "go", name: "Go", aliases: ["golang"] },
	{ id: "rust", name: "Rust", aliases: ["rs"] },
	{ id: "java", name: "Java", aliases: [] },
	{ id: "c", name: "C", aliases: ["h"] },
	{ id: "cpp", name: "C++", aliases: ["cc", "cxx", "hpp", "hxx"] },
	{ id: "csharp", name: "C#", aliases: ["cs", "dotnet"] },
	{ id: "php", name: "PHP", aliases: [] },
	{ id: "ruby", name: "Ruby", aliases: ["rb"] },
	{ id: "swift", name: "Swift", aliases: [] },
	{ id: "kotlin", name: "Kotlin", aliases: ["kt", "kts"] },
	{ id: "scala", name: "Scala", aliases: [] },
	{ id: "r", name: "R", aliases: [] },
	{ id: "lua", name: "Lua", aliases: [] },
	{ id: "perl", name: "Perl", aliases: ["pl", "pm"] },
	{ id: "dart", name: "Dart", aliases: [] },
	{ id: "elixir", name: "Elixir", aliases: ["ex", "exs"] },
	{ id: "erlang", name: "Erlang", aliases: ["erl"] },
	{ id: "haskell", name: "Haskell", aliases: ["hs"] },
	{ id: "clojure", name: "Clojure", aliases: ["clj", "cljs"] },
	{ id: "ocaml", name: "OCaml", aliases: ["ml"] },
	{ id: "fsharp", name: "F#", aliases: ["fs", "fsi", "fsx"] },
	{ id: "zig", name: "Zig", aliases: [] },
	{ id: "nim", name: "Nim", aliases: [] },
	{ id: "html", name: "HTML", aliases: ["htm"] },
	{ id: "css", name: "CSS", aliases: [] },
	{ id: "scss", name: "SCSS", aliases: [] },
	{ id: "less", name: "Less", aliases: [] },
	{ id: "json", name: "JSON", aliases: ["jsonc"] },
	{ id: "yaml", name: "YAML", aliases: ["yml"] },
	{ id: "toml", name: "TOML", aliases: [] },
	{ id: "xml", name: "XML", aliases: [] },
	{ id: "markdown", name: "Markdown", aliases: ["md"] },
	{ id: "sql", name: "SQL", aliases: [] },
	{ id: "graphql", name: "GraphQL", aliases: ["gql"] },
	{ id: "bash", name: "Bash", aliases: ["sh", "shell", "zsh"] },
	{ id: "powershell", name: "PowerShell", aliases: ["ps", "ps1"] },
	{ id: "dockerfile", name: "Dockerfile", aliases: ["docker"] },
	{ id: "terraform", name: "Terraform", aliases: ["tf", "hcl"] },
	{ id: "prisma", name: "Prisma", aliases: [] },
	{ id: "svelte", name: "Svelte", aliases: [] },
	{ id: "vue", name: "Vue", aliases: [] },
	{ id: "astro", name: "Astro", aliases: [] },
	{ id: "mdx", name: "MDX", aliases: [] },
	{ id: "plaintext", name: "Plain Text", aliases: ["text", "txt"] },
];

/**
 * Normaliza IDs do highlight.js para IDs do Shiki.
 * Alguns IDs divergem entre as duas libs.
 */
const HLJS_TO_SHIKI: Record<string, string> = {
	cs: "csharp",
	"c++": "cpp",
	"c#": "csharp",
	"f#": "fsharp",
	shell: "bash",
	sh: "bash",
	zsh: "bash",
	yml: "yaml",
	text: "plaintext",
	txt: "plaintext",
};

/**
 * Normaliza um ID de linguagem (vindo do hljs ou do usuário) para
 * um ID válido do Shiki. Retorna "plaintext" se não encontrar.
 */
export function normalizeLanguageId(langId: string): string {
	const lower = langId.toLowerCase();

	// Primeiro tenta o mapa de normalização
	if (HLJS_TO_SHIKI[lower]) {
		return HLJS_TO_SHIKI[lower];
	}

	// Depois tenta match direto pelo ID
	if (LANGUAGES.some((l) => l.id === lower)) {
		return lower;
	}

	// Tenta match por alias
	const byAlias = LANGUAGES.find((l) => l.aliases.includes(lower));
	if (byAlias) {
		return byAlias.id;
	}

	return "plaintext";
}
