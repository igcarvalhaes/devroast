# Padrões de Componentes de Features

Este documento define os padrões para componentes em `src/components/` (componentes
de features/páginas, não componentes primitivos de UI).

---

## Diferença entre `components/` e `components/ui/`

### `src/components/ui/`

Componentes **primitivos e reutilizáveis** que formam o design system:
- Botões, inputs, badges, cards, modals
- Sem lógica de negócio ou chamadas de API
- Podem ser usados em qualquer página
- Exemplos: `Button`, `Badge`, `CodeBlock`, `ScoreRing`

### `src/components/`

Componentes de **features e páginas específicas**:
- Seções de páginas, formulários complexos, layouts compostos
- Podem conter lógica de negócio, chamadas tRPC, state management
- Específicos do domínio da aplicação
- Exemplos: `HomeMetrics`, `CodeInputSection`, `RoastResultCard`

---

## Regras gerais

### Exports

- **Named exports apenas** (nunca `export default`)
- Exportar o componente principal e tipos se relevante

### Client vs Server Components

- Por padrão, componentes são **Server Components** (sem diretiva)
- Usar `"use client"` apenas quando necessário:
  - Hooks do React (`useState`, `useEffect`, `useContext`)
  - Event handlers (`onClick`, `onChange`, etc)
  - Browser APIs (`window`, `localStorage`)
  - React Query hooks (`useQuery`, `useMutation`)

### tRPC em componentes

#### Server Components (com prefetch)

```tsx
// app/page.tsx
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { RoastList } from "@/components/roast-list";

export default async function Page() {
  // Prefetch no servidor
  prefetch(trpc.roast.list.queryOptions());

  return (
    <HydrateClient>
      <RoastList />
    </HydrateClient>
  );
}
```

#### Client Components (com useQuery)

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function HomeMetrics() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.roast.getHomeMetrics.queryOptions());
  
  const total = data?.totalRoasts ?? 0;
  
  return <div>{total} codes roasted</div>;
}
```

**Regras:**
- Sempre usar `data?.field ?? fallback` para valores opcionais
- Usar `useQuery` quando quiser valores iniciais customizados
- Usar `useSuspenseQuery` quando quiser Suspense automático

---

## Estrutura de arquivos

### Componentes simples (1 arquivo)

```
src/components/
  home-metrics.tsx          # Client component com tRPC
  code-input-section.tsx    # Seção da homepage
  roast-result-card.tsx     # Card de resultado
```

### Componentes complexos (pasta)

```
src/components/
  roast-form/
    index.tsx               # Export público
    roast-form.tsx          # Componente principal
    language-select.tsx     # Sub-componente
    mode-toggle.tsx         # Sub-componente
    use-roast-form.ts       # Hook customizado
```

**Regras:**
- Criar pasta quando o componente tem 3+ arquivos relacionados
- `index.tsx` exporta apenas o componente principal (facilita imports)
- Sub-componentes podem ser privados (não exportados no index)

---

## Nomenclatura

### Arquivos

- **kebab-case**: `home-metrics.tsx`, `code-input-section.tsx`
- Nunca usar PascalCase em nomes de arquivo

### Componentes

- **PascalCase**: `HomeMetrics`, `CodeInputSection`
- Sufixos descritivos quando relevante: `RoastCard`, `RoastList`, `RoastForm`

### Hooks customizados

- **camelCase** com prefixo `use`: `useRoastForm`, `useCodeEditor`
- Um hook por arquivo: `use-roast-form.ts`

---

## Loading States

### Opção 1: Suspense boundaries

Para loading states visuais (spinners, skeletons):

```tsx
// app/page.tsx
import { Suspense } from "react";
import { RoastList } from "@/components/roast-list";
import { RoastListSkeleton } from "@/components/ui/roast-list-skeleton";

export default function Page() {
  return (
    <Suspense fallback={<RoastListSkeleton />}>
      <RoastList />
    </Suspense>
  );
}

// components/roast-list.tsx
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

export function RoastList() {
  const { data } = useSuspenseQuery(trpc.roast.list.queryOptions());
  return <ul>{data.map(...)}</ul>;
}
```

### Opção 2: Valores iniciais

Para animações de transição (NumberFlow, contadores):

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import NumberFlow from "@number-flow/react";

export function HomeMetrics() {
  const { data } = useQuery(trpc.roast.getHomeMetrics.queryOptions());
  
  // Valor inicial 0, anima para o real quando carregar
  const total = data?.totalRoasts ?? 0;
  
  return <NumberFlow value={total} />;
}
```

**Quando usar cada uma:**
- **Suspense**: dados essenciais que bloqueiam a renderização
- **Valores iniciais**: métricas/contadores com transições suaves

---

## Composição de componentes UI

Componentes de features devem compor componentes UI do design system:

```tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";

export function RoastResultCard({ roast }) {
  return (
    <div className="flex flex-col gap-4 p-6 border border-border-primary">
      <div className="flex items-center justify-between">
        <Badge variant={roast.score < 5 ? "critical" : "good"}>
          Score: {roast.score}
        </Badge>
        <Button variant="outline" size="sm">
          Share
        </Button>
      </div>
      
      <CodeBlock code={roast.code} language={roast.language} />
    </div>
  );
}
```

**Regras:**
- Importar componentes UI de `@/components/ui/[componente]`
- Nunca duplicar estilos que já existem em componentes UI
- Usar tokens de cor (`text-text-primary`, `bg-bg-surface`) em vez de hex

---

## Props

### Tipagem

```tsx
type HomeMetricsProps = {
  initialData?: { totalRoasts: number; avgScore: number };
  className?: string;
};

export function HomeMetrics({ initialData, className }: HomeMetricsProps) {
  // ...
}
```

**Regras:**
- Sempre tipar props explicitamente (não usar `any`)
- Usar `?` para props opcionais
- Incluir `className` quando o componente pode ser customizado externamente

### Children

Para componentes que aceitam children:

```tsx
type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return <div className={className}>{children}</div>;
}
```

---

## Error Boundaries

Para componentes que podem falhar (chamadas API, parsing, etc):

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

export function RoastList() {
  const { data, error, isError } = useQuery(trpc.roast.list.queryOptions());
  
  if (isError) {
    return (
      <div className="text-accent-red">
        Error loading roasts: {error.message}
      </div>
    );
  }
  
  return <ul>{data?.map(...)}</ul>;
}
```

**Regras:**
- Sempre verificar `isError` antes de renderizar dados
- Exibir mensagens de erro amigáveis ao usuário
- Considerar adicionar botão de "Try again" para retry

---

## Formulários

Para formulários complexos com validação:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";

export function RoastForm() {
  const [code, setCode] = useState("");
  const trpc = useTRPC();
  
  const createMutation = trpc.roast.create.useMutation({
    onSuccess: (data) => {
      // Redirecionar ou mostrar sucesso
    },
    onError: (error) => {
      // Mostrar erro
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ code, language: "javascript" });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} />
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
```

**Regras:**
- Usar `useMutation` para operações de escrita
- Desabilitar botão de submit durante loading (`isPending`)
- Mostrar feedback de loading no texto do botão
- Validar no client antes de enviar (evitar requests desnecessários)

---

## Checklist para novos componentes

- [ ] Named exports (nunca `export default`)
- [ ] `"use client"` apenas quando necessário
- [ ] Props tipadas explicitamente
- [ ] tRPC queries com `data?.field ?? fallback`
- [ ] Error handling para queries que podem falhar
- [ ] Loading states apropriados (Suspense ou valores iniciais)
- [ ] Compor componentes UI do design system
- [ ] Usar tokens de cor (nunca hex hardcoded)
- [ ] Fontes apropriadas (`font-sans`, `font-mono`, `font-body-mono`)
- [ ] Lint passando (`pnpm biome check`)

---

## Referências

- Componentes UI: `src/components/ui/AGENTS.md`
- tRPC: `src/trpc/AGENTS.md`
- Padrões globais: `AGENTS.md` raiz
