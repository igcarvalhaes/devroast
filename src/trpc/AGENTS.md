# Padrões tRPC

Este documento define os padrões de implementação tRPC no projeto **devroast**.
Seguimos a especificação oficial do tRPC v11 com TanStack React Query.

---

## Estrutura de arquivos

```
src/trpc/
├── init.ts                # Context + procedures (public/protected)
├── query-client.ts        # QueryClient factory com SuperJSON
├── client.tsx             # Provider + hooks para Client Components
├── server.tsx             # Proxy + helpers (prefetch, HydrateClient, caller)
└── routers/
    ├── _app.ts            # Root router (AppRouter type)
    └── [feature].ts       # Routers por feature (roast, user, etc)
```

---

## Regras gerais

### Exports

- **Named exports apenas** em todos os arquivos (exceto route handlers de API)
- Exportar tipos explicitamente: `AppRouter`, `RouterInputs`, `RouterOutputs`

### Markers de ambiente

- **`init.ts`** e **`server.tsx`**: usar `import "server-only"` no topo
- **`client.tsx`**: usar `import "client-only"` no topo (dev dependency)
- **`query-client.ts`**: sem marker (usado em ambos os lados)

### SuperJSON

Usar SuperJSON em **3 lugares** para serialização de Dates e tipos especiais:

1. `init.ts` — `transformer: superjson` no `initTRPC`
2. `client.tsx` — `transformer: superjson` no `createTRPCClient`
3. `query-client.ts` — `dataTransformer: superjson` no `QueryClient`

### Nomenclatura

- **Routers por feature/domínio**: `roastRouter`, `userRouter`, `submissionRouter`
- **Procedures por ação**: `getHomeMetrics`, `list`, `byId`, `create`, `update`
- **Nunca abreviar**: usar nomes completos e descritivos

---

## Context (`init.ts`)

O context deve conter informações de autenticação e configurações compartilhadas:

```typescript
export async function createTRPCContext(opts: { headers: Headers }) {
  // TODO: adicionar lógica de autenticação aqui
  // const session = await getServerSession();
  
  return {
    userId: null as string | null,
    // Adicionar outros campos conforme necessário
  };
}
```

**Regras:**
- Context é criado **por request** (não é singleton)
- Usar `async` quando precisar fazer queries (sessão, DB, etc)
- Tipos devem ser explícitos (não inferir `any`)

---

## Procedures

### Public Procedure

Para endpoints públicos (não requerem autenticação):

```typescript
export const publicProcedure = t.procedure;
```

### Protected Procedure

Para endpoints que requerem autenticação:

```typescript
export const protectedProcedure = t.procedure.use(isAuthed);

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { userId: ctx.userId } });
});
```

---

## Routers (`routers/`)

### Estrutura de um router

```typescript
import { createTRPCRouter, publicProcedure } from "../init";
import { z } from "zod";
import { db } from "@/db";
import { roasts } from "@/db/schema";

export const roastRouter = createTRPCRouter({
  /**
   * Query: retorna métricas da homepage
   */
  getHomeMetrics: publicProcedure.query(async () => {
    // Lógica de query ao DB
    return {
      totalRoasts: 92,
      avgScore: 4.4,
    };
  }),

  /**
   * Query: busca roast por ID
   */
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const roast = await db.query.roasts.findFirst({
        where: (roasts, { eq }) => eq(roasts.id, input.id),
      });
      return roast;
    }),

  /**
   * Mutation: cria novo roast
   */
  create: publicProcedure
    .input(z.object({ code: z.string(), language: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Lógica de criação
      return { id: "xyz" };
    }),
});
```

**Regras:**
- Um router por feature/domínio (ex: `roastRouter`, `userRouter`)
- JSDoc nos procedures para documentação
- Validação com Zod em `.input()`
- `query` para leitura, `mutation` para escrita
- Retornar objetos tipados (não usar `any`)

### Root router (`_app.ts`)

Combina todos os routers em um único root:

```typescript
import { createTRPCRouter } from "../init";
import { roastRouter } from "./roast";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  roast: roastRouter,
  user: userRouter,
});

/**
 * Exporta o type do router para o client
 * NUNCA importe o router em si no client!
 */
export type AppRouter = typeof appRouter;
```

**Regras:**
- Exportar **APENAS** o type `AppRouter` (nunca o valor `appRouter`)
- Keys do router devem ser singular (ex: `roast`, não `roasts`)
- Organizar imports alfabeticamente

---

## Client Components (`client.tsx`)

### Provider

O `TRPCReactProvider` deve envolver a aplicação no layout raiz:

```tsx
// app/layout.tsx
import { TRPCReactProvider } from "@/trpc/client";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
```

### Hooks

Usar `useTRPC()` para acessar o client:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function MyComponent() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.roast.getHomeMetrics.queryOptions());
  
  return <div>{data?.totalRoasts}</div>;
}
```

**Regras:**
- Usar `useQuery` (não `useSuspenseQuery`) quando quiser valores iniciais personalizados
- Usar `useSuspenseQuery` com `<Suspense>` para loading states automáticos
- Sempre usar `data?.field` (nullish coalescing) ou `?? fallback`

---

## Server Components (`server.tsx`)

### Prefetch

Prefetch de queries no servidor para SSR:

```tsx
// app/page.tsx
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function Page() {
  // Prefetch no servidor
  prefetch(trpc.roast.getHomeMetrics.queryOptions());

  return (
    <HydrateClient>
      <MyClientComponent />
    </HydrateClient>
  );
}
```

### Server-side calls

Para chamar procedures diretamente no servidor (sem React Query):

```tsx
import { caller } from "@/trpc/server";

export default async function Page() {
  const metrics = await caller.roast.getHomeMetrics();
  return <div>{metrics.totalRoasts}</div>;
}
```

**Regras:**
- `prefetch()` para dados que serão usados em Client Components
- `caller` para dados usados diretamente em Server Components
- `HydrateClient` envolve Client Components que consomem dados prefetched

---

## API Route Handler (`app/api/trpc/[trpc]/route.ts`)

```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/trpc/routers/_app";
import { createTRPCContext } from "@/trpc/init";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
```

**Regras:**
- Único arquivo de route handler (catch-all `[trpc]`)
- Exportar `handler` como `GET` e `POST` (named exports)
- Nunca modificar diretamente (é boilerplate estável)

---

## Loading States

### Opção 1: Suspense (skeleton automático)

```tsx
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function Page() {
  prefetch(trpc.roast.list.queryOptions());
  
  return (
    <HydrateClient>
      <Suspense fallback={<Skeleton />}>
        <RoastList />
      </Suspense>
    </HydrateClient>
  );
}

function RoastList() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.roast.list.queryOptions());
  return <ul>{data.map(...)}</ul>;
}
```

### Opção 2: Valores iniciais (sem skeleton)

Para animações de incremento (ex: NumberFlow):

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import NumberFlow from "@number-flow/react";

export function Metrics() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.roast.getHomeMetrics.queryOptions());
  
  // Valor inicial 0, anima para o valor real quando carregar
  const total = data?.totalRoasts ?? 0;
  
  return <NumberFlow value={total} />;
}
```

**Regras:**
- Use **Suspense** quando quiser loading state visual (spinners, skeletons)
- Use **valores iniciais** quando quiser animações de transição (NumberFlow, contadores)
- Nunca renderizar `null` ou texto "Loading..." diretamente (use Suspense)

---

## Error Handling

### Throwing errors

```typescript
import { TRPCError } from "@trpc/server";

export const roastRouter = createTRPCRouter({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const roast = await db.query.roasts.findFirst(...);
      
      if (!roast) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Roast not found",
        });
      }
      
      return roast;
    }),
});
```

### Catching errors no client

```tsx
const { data, error, isError } = useQuery(trpc.roast.byId.queryOptions({ id }));

if (isError) {
  return <div>Error: {error.message}</div>;
}
```

**Códigos de erro comuns:**
- `UNAUTHORIZED` — usuário não autenticado
- `FORBIDDEN` — usuário sem permissão
- `NOT_FOUND` — recurso não encontrado
- `BAD_REQUEST` — input inválido
- `INTERNAL_SERVER_ERROR` — erro genérico

---

## Validação com Zod

Sempre validar inputs com Zod:

```typescript
import { z } from "zod";

export const roastRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        code: z.string().min(1).max(10000),
        language: z.string().min(1),
        mode: z.enum(["honest", "roast"]).default("honest"),
      })
    )
    .mutation(async ({ input }) => {
      // input é tipado e validado automaticamente
      const { code, language, mode } = input;
      // ...
    }),
});
```

**Regras:**
- Sempre usar `.input()` para validação
- Usar `.default()` para valores opcionais com fallback
- Usar `.min()`, `.max()`, `.email()`, etc para validações adicionais
- Exportar schemas complexos se forem reutilizados

---

## Checklist para novos routers

- [ ] Arquivo nomeado por feature (ex: `roast.ts`, `user.ts`)
- [ ] Router exportado como `[feature]Router` (named export)
- [ ] Procedures documentados com JSDoc
- [ ] Validação de input com Zod
- [ ] Tipos de retorno explícitos (não inferir)
- [ ] Usar `publicProcedure` ou `protectedProcedure` conforme necessário
- [ ] Router registrado em `_app.ts`
- [ ] Queries usam `.query()`, mutations usam `.mutation()`
- [ ] Erros lançados com `TRPCError` e códigos apropriados

---

## Referências

- Spec completa: `specs/trpc.md`
- Documentação oficial: https://trpc.io/docs/server/procedures
- TanStack Query: https://tanstack.com/query/latest
