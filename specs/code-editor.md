# Spec: Code Editor com Syntax Highlighting

## Status

`implemented` — feature completa, build e lint passando.

---

## Resumo

Adicionar syntax highlighting em tempo real ao `CodeEditor` existente, usando
a técnica de **textarea transparente + overlay com HTML colorizado** (mesma
abordagem do [ray-so](https://github.com/raycast/ray-so)). O usuário cola ou
digita código, o editor detecta a linguagem automaticamente e renderiza o
highlight. Um seletor no header do editor permite trocar a linguagem
manualmente.

---

## Pesquisa e decisões

### Abordagens avaliadas

| Abordagem | Prós | Contras | Decisão |
|---|---|---|---|
| **Textarea + Shiki overlay** (ray-so) | Leve (~200KB WASM), já usamos Shiki, controle total do visual | Sem autocomplete/multi-cursor (não precisamos) | **Escolhida** |
| **CodeMirror 6** | Editor robusto, extensível, ~150KB | Complexidade desnecessária, theming separado do Shiki, bundle maior | Descartada |
| **Monaco Editor** | VS Code completo no browser | ~5MB bundle, overkill absoluto para paste+roast | Descartada |
| **Prism.js** | Leve, popular | Menos linguagens, não usamos no projeto, seria dependência extra | Descartada |

### Por que a abordagem do ray-so é ideal

1. **Já temos Shiki** — o `CodeBlock` (RSC) já usa `codeToHtml` com tema
   `vesper`. Reutilizar a mesma engine no client garante consistência visual.
2. **Bundle eficiente** — Shiki WASM no browser é ~200KB. Com lazy loading de
   gramáticas, o carregamento inicial é mínimo.
3. **Complexidade proporcional** — o editor do devroast é um campo de input
   glorificado. Não precisa de autocomplete, error markers, ou multi-cursor.
   Uma textarea com overlay cobre 100% do caso de uso.
4. **Tema unificado** — o código no editor (input) e no CodeBlock (output do
   roast) usam o mesmo tema `vesper`, criando consistência visual.

### Auto-detecção de linguagem

O ray-so usa **highlight.js** (`hljs.highlightAuto()`) exclusivamente para
detecção, enquanto Shiki faz o rendering. Essa separação é pragmática:

- `hljs.highlightAuto()` é rápido e leve (~70KB com subset de linguagens)
- Shiki não tem detecção de linguagem built-in
- A alternativa seria fazer matching manual por heurísticas, mas highlight.js
  já resolve isso com alta precisão

**Decisão:** usar `highlight.js` apenas para detecção (sem rendering), mesma
abordagem do ray-so. Importar apenas o core + as linguagens necessárias para
manter o bundle pequeno.

---

## Arquitetura

### Visão geral

```
CodeInputSection (orquestrador)
├── CodeEditor (root — já existe, será evoluído)
│   ├── CodeEditorHeader (já existe — será estendido)
│   │   ├── Traffic-light dots (já existe)
│   │   └── LanguageSelector (NOVO — dropdown/combobox)
│   └── CodeEditorBody (já existe — será refatorado)
│       ├── CodeEditorGutter (já existe)
│       └── CodeEditorContent (NOVO — container do textarea + overlay)
│           ├── CodeEditorTextarea (já existe — será ajustado)
│           └── CodeEditorHighlight (NOVO — div com HTML do Shiki)
```

### Fluxo de dados

```
Usuário digita/cola código
        │
        ▼
   CodeEditor (state: code)
        │
        ├──▶ highlight.js detecta linguagem (debounce 300ms)
        │         │
        │         ▼
        │    detectedLanguage (state)
        │
        ├──▶ Shiki renderiza HTML (a cada keystroke)
        │         │
        │         ▼
        │    highlightedHtml (state)
        │
        └──▶ selectedLanguage = userLanguage ?? detectedLanguage
```

### Resolução de linguagem (3 níveis)

1. **Linguagem manual** — usuário selecionou no dropdown → usa essa
2. **Auto-detectada** — `hljs.highlightAuto()` analisou o código → usa o
   resultado
3. **Fallback** — nenhum código ou detecção falhou → `"plaintext"`

Quando o usuário seleciona uma linguagem manualmente, a auto-detecção é
ignorada. Se o usuário selecionar "Auto-Detect" no dropdown, volta para o
modo automático.

---

## Dependências

### Novas

| Pacote | Versão | Propósito | Tamanho |
|---|---|---|---|
| `highlight.js` | ^11.x | Auto-detecção de linguagem via `highlightAuto()` | ~70KB (core + subset) |

### Existentes (sem mudanças)

| Pacote | Uso |
|---|---|
| `shiki` ^4.0.2 | Rendering do syntax highlight (já instalado) |
| `@base-ui/react` ^1.3.0 | Combobox para o language selector |

---

## Implementação

### 1. Shiki no client — highlighter singleton

O `CodeBlock` existente usa `codeToHtml` server-side (RSC). Para o editor,
precisamos do Shiki rodando no client em tempo real.

**Criar `src/lib/shiki.ts`:**

```ts
import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Retorna um singleton do Shiki highlighter.
 * Na primeira chamada, inicializa com um subset mínimo de linguagens.
 * Linguagens adicionais são carregadas sob demanda.
 */
export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["vesper"],
      langs: ["javascript", "typescript", "python", "go"],
    });
  }
  return highlighterPromise;
}

/**
 * Garante que uma linguagem está carregada no highlighter.
 * Se já estiver, é um no-op.
 */
export async function ensureLanguage(
  highlighter: Highlighter,
  lang: string,
): Promise<void> {
  const loaded = highlighter.getLoadedLanguages();
  if (!loaded.includes(lang)) {
    await highlighter.loadLanguage(lang as any);
  }
}
```

**Decisão de design:**
- Singleton evita re-inicialização do WASM a cada render
- 4 linguagens pré-carregadas (as mais prováveis de serem coladas)
- Lazy loading para todas as outras (~150+ do Shiki)

### 2. Hook `useShikiHighlight`

**Criar `src/hooks/use-shiki-highlight.ts`:**

```ts
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
      await ensureLanguage(highlighter, language);

      if (cancelled) return;

      const result = highlighter.codeToHtml(code, {
        lang: language,
        theme: "vesper",
      });

      if (!cancelled) setHtml(result);
    }

    highlight();

    return () => { cancelled = true; };
  }, [code, language]);

  return html;
}
```

**Por que não debounce no highlight:**
- O Shiki com WASM é rápido o suficiente para tempo real (<5ms para snippets
  típicos)
- Debounce causaria "flicker" perceptível entre texto plain e highlighted
- O ray-so também faz highlight a cada keystroke sem debounce

### 3. Hook `useLanguageDetection`

**Criar `src/hooks/use-language-detection.ts`:**

```ts
export function useLanguageDetection(code: string): string {
  const [detected, setDetected] = useState("plaintext");

  useEffect(() => {
    if (!code.trim()) {
      setDetected("plaintext");
      return;
    }

    const timeout = setTimeout(() => {
      const result = hljs.highlightAuto(code);
      setDetected(result.language ?? "plaintext");
    }, 300);

    return () => clearTimeout(timeout);
  }, [code]);

  return detected;
}
```

**Por que debounce de 300ms na detecção (mas não no highlight):**
- A detecção é um "palpite" — não precisa atualizar a cada keystroke
- Evita trocas rápidas de linguagem enquanto o usuário digita (ex: 3 chars
  detecta como "lua", 10 chars detecta como "python")
- O highlight continua rodando em tempo real com a linguagem atual; quando a
  detecção atualiza, o highlight re-renderiza com a nova linguagem

### 4. Evolução do `CodeEditor`

O componente já existe com o padrão de composição correto. As mudanças são
incrementais:

#### 4.1 Novos valores no Context

```ts
type CodeEditorContextValue = {
  // Existentes
  code: string;
  lineCount: number;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleGutterClick: () => void;
  placeholder: string;

  // Novos
  highlightedHtml: string;
  selectedLanguage: string;
  detectedLanguage: string;
  onLanguageChange: (language: string | null) => void;
  // null = voltar para auto-detect
};
```

#### 4.2 State no Root

```ts
const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(
  ({ value, onValueChange, language, onLanguageChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState("");
    const [userLanguage, setUserLanguage] = useState<string | null>(
      language ?? null,
    );

    const code = value ?? internalValue;
    const detectedLanguage = useLanguageDetection(code);

    const selectedLanguage = userLanguage ?? detectedLanguage;
    const highlightedHtml = useShikiHighlight(code, selectedLanguage);

    const handleLanguageChange = useCallback((lang: string | null) => {
      setUserLanguage(lang);
      onLanguageChange?.(lang);
    }, [onLanguageChange]);

    // ... resto do componente
  },
);
```

**Novas props do CodeEditor:**
- `language?: string` — linguagem controlada externamente (opcional)
- `onLanguageChange?: (language: string | null) => void` — callback quando
  muda

#### 4.3 `CodeEditorContent` (NOVO)

Container que sobrepõe textarea transparente + div com HTML do Shiki:

```tsx
const CodeEditorContent = forwardRef<HTMLDivElement, CodeEditorContentProps>(
  ({ className, children, ...props }, ref) => {
    const { code, highlightedHtml, handleChange, textareaRef, placeholder } =
      useCodeEditorContext();

    return (
      <div ref={ref} className="relative flex-1 overflow-auto" {...props}>
        {children ?? (
          <>
            {/* Highlight layer (behind) */}
            <div
              className="absolute inset-0 p-4 font-mono text-xs leading-[20px] pointer-events-none [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />

            {/* Textarea layer (front, transparent) */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleChange}
              placeholder={placeholder}
              spellCheck={false}
              className="relative w-full h-full resize-none bg-transparent p-4 font-mono text-xs leading-[20px] text-transparent caret-text-primary placeholder:text-text-muted outline-none border-none"
            />
          </>
        )}
      </div>
    );
  },
);
```

**Pontos técnicos:**
- O textarea tem `text-transparent` — o texto é invisível, mas a seleção e
  cursor continuam funcionando
- O `caret-text-primary` garante que o cursor fica visível (branco)
- Ambos usam **exatamente o mesmo** `font-mono text-xs leading-[20px] p-4`
  para alinhar pixel-perfect
- O overlay tem `pointer-events-none` para que clicks passem para o textarea

#### 4.4 `LanguageSelector` (NOVO)

Combobox no header do editor usando `@base-ui/react`:

```tsx
const LanguageSelector = forwardRef<HTMLDivElement, LanguageSelectorProps>(
  ({ className, ...props }, ref) => {
    const { selectedLanguage, detectedLanguage, onLanguageChange } =
      useCodeEditorContext();

    // Lista de linguagens suportadas
    // Label exibe "(auto)" quando está em modo auto-detect

    return (
      <div ref={ref} className={className} {...props}>
        {/* Combobox com busca, usando @base-ui/react */}
        {/* Primeira opção: "Auto-Detect" → onLanguageChange(null) */}
        {/* Demais: lista de linguagens → onLanguageChange("python") */}
      </div>
    );
  },
);
```

**Comportamento do dropdown:**
- Mostra a linguagem atual (ex: "TypeScript" ou "Auto · Python")
- Primeira opção: "Auto-Detect" — volta para modo automático
- Lista filtrada por busca (o usuário digita para encontrar)
- Ao selecionar uma linguagem, trava nela até selecionar "Auto-Detect"

#### 4.5 Mapa de linguagens

**Criar `src/lib/languages.ts`:**

Mapa normalizado de linguagens com metadata para o dropdown:

```ts
export type Language = {
  id: string;        // ID do Shiki (ex: "typescript")
  name: string;      // Display name (ex: "TypeScript")
  aliases: string[]; // Para busca no combobox (ex: ["ts", "tsx"])
};

export const LANGUAGES: Language[] = [
  { id: "javascript", name: "JavaScript", aliases: ["js", "jsx"] },
  { id: "typescript", name: "TypeScript", aliases: ["ts", "tsx"] },
  { id: "python", name: "Python", aliases: ["py"] },
  // ... ~150+ linguagens do Shiki
];
```

Esse mapa serve para:
1. Popular o dropdown com nomes legíveis
2. Busca fuzzy por nome ou alias
3. Normalizar o output do `hljs.highlightAuto()` para IDs do Shiki

### 5. Refactor do `CodeEditorBody`

O `CodeEditorBody` atual renderiza `CodeEditorGutter` + `CodeEditorTextarea`.
Após a mudança:

```tsx
// Antes
<CodeEditorBody>
  <CodeEditorGutter />
  <CodeEditorTextarea />
</CodeEditorBody>

// Depois
<CodeEditorBody>
  <CodeEditorGutter />
  <CodeEditorContent />    {/* textarea + highlight overlay */}
</CodeEditorBody>
```

O `CodeEditorTextarea` continua existindo como sub-componente exportado para
uso composicional, mas o default children do `CodeEditorBody` passa a usar
`CodeEditorContent`.

### 6. Keyboard handling

Adicionar tratamento de teclas no textarea (similar ao ray-so):

| Tecla | Ação |
|---|---|
| `Tab` | Insere 2 espaços (ou indenta seleção) |
| `Shift+Tab` | Remove indentação da linha/seleção |
| `Enter` | Auto-indent (mantém indentação da linha anterior) |
| `Escape` | Blur do textarea |

Implementar como um hook `useEditorKeyboard` ou diretamente no
`CodeEditorContent` via `onKeyDown`.

---

## Estrutura de arquivos

```
src/
├── lib/
│   ├── shiki.ts              # Singleton do highlighter + ensureLanguage
│   └── languages.ts          # Mapa de linguagens (id, name, aliases)
├── hooks/
│   ├── use-shiki-highlight.ts    # Hook: code + lang → HTML
│   └── use-language-detection.ts # Hook: code → detected language
└── components/
    ├── code-editor.tsx        # Evoluído: novos states, Context expandido
    └── ui/
        └── (sem mudanças)
```

---

## Tarefas de implementação

### Fase 1 — Infraestrutura

- [ ] Instalar `highlight.js` (`pnpm add highlight.js`)
- [ ] Criar `src/lib/shiki.ts` — singleton do highlighter client-side
- [ ] Criar `src/lib/languages.ts` — mapa de linguagens normalizado
- [ ] Criar `src/hooks/use-shiki-highlight.ts`
- [ ] Criar `src/hooks/use-language-detection.ts`

### Fase 2 — Componentes

- [ ] Criar `CodeEditorContent` — container textarea + highlight overlay
- [ ] Criar `LanguageSelector` — combobox no header do editor
- [ ] Expandir `CodeEditorContext` com novos valores
- [ ] Refatorar `CodeEditor` root — integrar hooks, novos states
- [ ] Refatorar `CodeEditorBody` — default children usa `CodeEditorContent`
- [ ] Refatorar `CodeEditorHeader` — adicionar `LanguageSelector` ao default

### Fase 3 — Keyboard e polish

- [ ] Implementar keyboard handling (Tab, Shift+Tab, Enter auto-indent)
- [ ] Garantir scroll sync entre textarea e highlight overlay
- [ ] Testar alinhamento pixel-perfect (font size, line-height, padding)
- [ ] Testar com código longo (performance do Shiki em tempo real)
- [ ] Testar lazy loading de linguagens menos comuns

### Fase 4 — Integração

- [ ] Atualizar `CodeInputSection` para receber/propagar linguagem
- [ ] Testar fluxo completo: colar código → detectar → highlight → submit

---

## Considerações técnicas

### Performance

- **Shiki WASM** é rápido para snippets típicos (<5ms para ~50 linhas). Para
  código muito longo (500+ linhas), considerar debounce adaptativo.
- **Lazy loading** de gramáticas mantém o bundle inicial pequeno. Apenas 4
  linguagens são pré-carregadas; as demais carregam sob demanda (~10-50KB por
  gramática).
- **highlight.js** para detecção usa o subset de linguagens registrado. Não
  precisa carregar todas as 150+ — um subset de ~30 linguagens populares
  cobre 95% dos casos.

### Acessibilidade

- O textarea real continua sendo o elemento focável — leitores de tela leem
  o texto plain do textarea, não o HTML do overlay.
- O overlay tem `aria-hidden="true"` e `pointer-events-none`.
- O `LanguageSelector` usa um combobox acessível do `@base-ui/react`.
- Line numbers no gutter continuam com `aria-hidden="true"`.

### Alinhamento textarea × overlay

O ponto mais crítico da implementação. Ambos **devem** usar:

```
font-family: font-mono (JetBrains Mono)
font-size: text-xs (12px)
line-height: leading-[20px]
padding: p-4 (16px)
```

Qualquer divergência causa desalinhamento visível. O textarea não pode ter
`letter-spacing`, `word-spacing`, ou qualquer propriedade tipográfica
diferente do overlay.

### Mapeamento highlight.js → Shiki

Os IDs de linguagem do highlight.js nem sempre coincidem com os do Shiki.
O `src/lib/languages.ts` deve incluir um mapa de normalização:

```ts
// highlight.js retorna "cpp" → Shiki usa "cpp" ✓
// highlight.js retorna "cs" → Shiki usa "csharp" ✗ — precisa mapear
const HLJS_TO_SHIKI: Record<string, string> = {
  cs: "csharp",
  // ... outros que divergem
};
```

---

## Fora de escopo

- Múltiplos temas (apenas `vesper`)
- Exportar como imagem (funcionalidade do ray-so)
- Compartilhar via URL (encode do código no hash)
- Formatação automática (Prettier/etc.)
- Autocomplete ou intellisense
- Multi-cursor ou seleção avançada
- Line highlighting (Alt+Click do ray-so)
- Minimap
