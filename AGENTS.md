# devroast

Aplicação de code roasting que analisa e pontua trechos de codigo submetidos
pelos usuarios, com feedback humoristico e brutalmente honesto.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript** strict
- **Tailwind CSS 4** com tokens customizados via `@theme`
- **tailwind-variants** (`tv`) para variantes de componentes
- **Biome** para lint e formatacao (nao usa ESLint/Prettier)
- **tRPC v11** com TanStack React Query para API type-safe
- **Drizzle ORM** com PostgreSQL
- **Shiki** para syntax highlighting server-side
- **pnpm** como package manager

## Estrutura

```
src/
  app/           # Rotas e layouts (App Router)
  components/    # Componentes de pagina e features
    ui/          # Componentes primitivos reutilizaveis
  trpc/          # Configuracao tRPC e routers
  db/            # Drizzle ORM config e schemas
specs/           # Documentacao de features e specs tecnicas
```

## Padroes globais

### Exports

Named exports apenas. Nunca `export default` em componentes (pages usam
`export default` por convencao do Next.js).

### Componentes

- `forwardRef` em todos os componentes
- `displayName` sempre definido
- Props estendem `ComponentProps<"elemento">` do React
- Variantes com `tv()` — className passado direto no `tv()`, nunca usar
  `cn()` ou `twMerge()` diretamente

### Composicao

Componentes com sub-partes usam o composition pattern:

- **Client components** — React Context compartilha variante/estado do Root
  para sub-componentes (`Badge > BadgeDot + BadgeLabel`)
- **Server components** — props diretas em vez de Context
  (`CodeBlock > CodeBlockHeader + CodeBlockBody`)
- Root renderiza default children quando `children` nao e fornecido

### Tokens de cor

Todas as cores usam tokens definidos em `globals.css` via `@theme`.
Nunca usar hex hardcoded ou palette padrao do Tailwind nos componentes.

### Fontes

- `font-sans` — sistema (UI geral)
- `font-mono` — JetBrains Mono (codigo, botoes, badges)
- `font-body-mono` — IBM Plex Mono (subtitulos, hints)

### Commits

Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).

### API Layer

- **tRPC** para toda comunicacao client-server (type-safety end-to-end)
- Routers organizados por dominio/feature em `src/trpc/routers/`
- SSR com prefetch + hydration via React Query
- Validacao de input com Zod
- Ver `src/trpc/AGENTS.md` para padroes detalhados

### Data Fetching

- **Server Components**: usar `prefetch()` + `HydrateClient` para SSR
- **Client Components**: usar `useQuery` ou `useSuspenseQuery` do React Query
- Loading states:
  - **Suspense** para skeletons/spinners visiveis
  - **Valores iniciais** (ex: `?? 0`) para animacoes de transicao (NumberFlow)
- Sempre usar nullish coalescing (`data?.field ?? fallback`) para safety

### Database

- **Drizzle ORM** com PostgreSQL
- Schemas em `src/db/schema/`
- Cliente exportado como `db` em `src/db/index.ts`
- Queries sempre com `await` (async/await pattern)

### Documentacao

- Specs de features em `specs/*.md` antes de implementar
- AGENTS.md por diretorio para padroes especificos
- JSDoc em funcoes/procedures publicas
- README.md apenas para setup inicial do projeto
