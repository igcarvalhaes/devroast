# tRPC — Spec de implementacao

Integracao do tRPC como camada de API/back-end do **devroast**, com suporte total
a Server Components, SSR e App Router do Next.js 16.

---

## Stack e dependencias

```bash
pnpm add @trpc/server @trpc/client @trpc/tanstack-react-query
pnpm add @tanstack/react-query zod
pnpm add -D client-only server-only
```

**Versoes minimas:**
- `@trpc/server` ^11.0.0
- `@tanstack/react-query` ^5.0.0
- `zod` ^3.0.0

---

## Estrutura de arquivos

```
src/
  trpc/
    init.ts             # Inicializacao do tRPC (context + t-object)
    routers/
      _app.ts           # Root router (exporta AppRouter type)
      roast.ts          # Router de roasting de codigo
      user.ts           # Router de usuarios (exemplo)
    client.tsx          # Provider e hooks para Client Components
    server.ts           # Proxy e helpers para Server Components
    query-client.ts     # Factory do QueryClient (singleton seguro)
  app/
    api/
      trpc/
        [trpc]/
          route.ts      # Handler HTTP do tRPC (GET + POST)
```

---

## Padroes globais

### Exports

Named exports apenas. Nunca `export default` em routers ou procedures.

### Context e autenticacao

- Context deve usar `cache()` do React para estabilidade no RSC
- Usar `server-only` em `init.ts` e `server.ts`
- Usar `client-only` em `client.tsx`

### Procedures

- `publicProcedure` — sem autenticacao
- `protectedProcedure` — requer usuario logado (middleware `isAuthed`)
- Sempre tipar input com `zod`

### Error handling

- Usar `TRPCError` com codigos semanticos (`UNAUTHORIZED`, `BAD_REQUEST`, `NOT_FOUND`)
- Nunca lançar `Error` generico em procedures

### Data transformers

- Usar **SuperJSON** para suporte a `Date`, `Map`, `Set`, etc.
- Configurar tanto no server quanto no client

---

## Configuracao

### 1. Inicializacao do tRPC (`trpc/init.ts`)

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import "server-only";

/**
 * Context criado por request — use para sessao, DB, etc.
 * IMPORTANTE: Envolver com cache() para RSC
 */
export const createTRPCContext = cache(async () => {
  // TODO: Integrar com sistema de autenticacao
  // const session = await getSession();
  
  return {
    userId: null as string | null, // exemplo
    // session,
    // db,
  };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Inicializa tRPC com context e transformer
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Procedure publica (sem autenticacao)
 */
export const publicProcedure = t.procedure;

/**
 * Procedure protegida (requer usuario logado)
 */
export const protectedProcedure = t.procedure.use(function isAuthed(opts) {
  if (!opts.ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Voce precisa estar logado para acessar este recurso",
    });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      userId: opts.ctx.userId, // agora non-nullable
    },
  });
});
```

---

### 2. Root router (`trpc/routers/_app.ts`)

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

---

### 3. Router de exemplo (`trpc/routers/roast.ts`)

```typescript
import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";

export const roastRouter = createTRPCRouter({
  /**
   * Query publica — lista roasts
   */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // TODO: Buscar do DB
      return {
        items: [],
        nextCursor: null,
      };
    }),

  /**
   * Query publica — busca roast por ID
   */
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // TODO: Buscar do DB
      return {
        id: input.id,
        code: "console.log('hello')",
        roast: "Esse codigo e tao basico que ate o debugger tem vergonha",
        score: 3,
        language: "typescript",
      };
    }),

  /**
   * Mutation protegida — criar roast
   */
  create: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1),
        language: z.string().default("typescript"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // ctx.userId esta disponivel (non-nullable)
      
      // TODO: Processar roast com LLM
      // TODO: Salvar no DB
      
      return {
        id: "roast_123",
        roast: "Gerando roast...",
        score: 0,
      };
    }),
});
```

---

### 4. Factory do QueryClient (`trpc/query-client.ts`)

```typescript
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Com SSR, evitar refetch imediato no client
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
```

---

### 5. Client Provider e hooks (`trpc/client.tsx`)

```typescript
"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: sempre criar novo QueryClient
    return makeQueryClient();
  }

  // Browser: reusar QueryClient existente
  // Evita recriar se React suspender no render inicial
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  })();
  return `${base}/api/trpc`;
}

export function TRPCReactProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
          headers: async () => {
            // TODO: Adicionar token de autenticacao
            return {
              // Authorization: `Bearer ${token}`,
            };
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

**Montar em `app/layout.tsx`:**

```typescript
import { TRPCReactProvider } from "@/trpc/client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
```

---

### 6. Server proxy e helpers (`trpc/server.ts`)

```typescript
import "server-only";

import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

/**
 * IMPORTANTE: Usar cache() para estabilidade por request
 */
export const getQueryClient = cache(makeQueryClient);

/**
 * Proxy typesafe para prefetch/fetch em Server Components
 */
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

/**
 * Helper para prefetch de queries
 * Uso: prefetch(trpc.roast.list.queryOptions({ limit: 10 }))
 */
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();

  if (queryOptions.queryKey[1]?.type === "infinite") {
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}

/**
 * Helper para hidratar client
 * Uso: <HydrateClient>{children}</HydrateClient>
 */
export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

/**
 * Server caller — para usar diretamente em Server Components
 * sem hidratar no client
 */
export const caller = appRouter.createCaller(createTRPCContext);
```

---

### 7. HTTP handler (`app/api/trpc/[trpc]/route.ts`)

```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
```

---

## Uso nos componentes

### Client Component (com hooks)

```typescript
"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function RoastList() {
  const trpc = useTRPC();

  const roastsQuery = useQuery(
    trpc.roast.list.queryOptions({
      limit: 10,
    }),
  );

  const createRoastMutation = useMutation(
    trpc.roast.create.mutationOptions(),
  );

  if (!roastsQuery.data) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      {roastsQuery.data.items.map((roast) => (
        <div key={roast.id}>{roast.roast}</div>
      ))}

      <button
        onClick={() =>
          createRoastMutation.mutate({
            code: "const x = 1",
            language: "typescript",
          })
        }
      >
        Criar roast
      </button>
    </div>
  );
}
```

---

### Server Component (com prefetch)

```typescript
import { prefetch, HydrateClient, trpc } from "@/trpc/server";
import { RoastList } from "./roast-list";

export default async function RoastsPage() {
  // Prefetch no server, hidratar no client
  prefetch(trpc.roast.list.queryOptions({ limit: 10 }));

  return (
    <HydrateClient>
      <h1>Roasts</h1>
      <RoastList />
    </HydrateClient>
  );
}
```

---

### Server Component (sem hidratar)

Use o `caller` quando os dados sao apenas para renderizar no server,
sem precisar do client cache:

```typescript
import { caller } from "@/trpc/server";

export default async function RoastPage({ params }: { params: { id: string } }) {
  const roast = await caller.roast.byId({ id: params.id });

  return (
    <div>
      <h1>Roast #{roast.id}</h1>
      <pre>{roast.code}</pre>
      <p>{roast.roast}</p>
    </div>
  );
}
```

---

### Suspense e Error Boundaries

```typescript
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { prefetch, HydrateClient, trpc } from "@/trpc/server";
import { RoastList } from "./roast-list";

export default async function RoastsPage() {
  prefetch(trpc.roast.list.queryOptions({ limit: 10 }));

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Algo deu errado</div>}>
        <Suspense fallback={<div>Carregando...</div>}>
          <RoastList />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
```

---

## Checklist de implementacao

- [ ] Instalar dependencias (`@trpc/*`, `@tanstack/react-query`, `zod`, `superjson`)
- [ ] Criar estrutura de pastas (`trpc/`, `app/api/trpc/`)
- [ ] Configurar `init.ts` com context e procedures
- [ ] Criar `_app.ts` router (root)
- [ ] Implementar routers de features (`roast.ts`, etc)
- [ ] Configurar `query-client.ts` com SuperJSON
- [ ] Implementar `client.tsx` com Provider
- [ ] Implementar `server.ts` com proxy e helpers
- [ ] Criar route handler em `app/api/trpc/[trpc]/route.ts`
- [ ] Montar `TRPCReactProvider` no `layout.tsx` raiz
- [ ] Testar query em Client Component
- [ ] Testar prefetch em Server Component
- [ ] Testar mutation em Client Component
- [ ] Testar caller em Server Component
- [ ] Integrar autenticacao (se necessario)
- [ ] Adicionar error handling customizado
- [ ] Configurar React Query Devtools (desenvolvimento)

---

## Notas importantes

### SuperJSON

**Obrigatorio** para suportar tipos nao-JSON (`Date`, `Map`, `Set`, `BigInt`, etc).
Configurar em **tres lugares**:

1. `trpc/init.ts` — `initTRPC.create({ transformer: superjson })`
2. `trpc/client.tsx` — `httpBatchLink({ transformer: superjson })`
3. `trpc/query-client.ts` — `serializeData` e `deserializeData`

### Cache do QueryClient

No browser, **reusar** o QueryClient para evitar recriar se React suspender.
No server, **sempre criar novo** por request.

### Context vs Caller

- **Context** → compartilha estado/sessao entre procedures
- **Caller** → executa procedures diretamente no server, sem HTTP

### Prefetch vs Fetch

- **prefetch** → inicia request no server, dados podem ser `undefined` no primeiro render do client (streaming)
- **fetchQuery** → bloqueia ate dados estarem prontos, sem streaming (mais lento)

### TypeScript

Nunca importar o `appRouter` no client! Apenas o **type** `AppRouter`.
Use `import type { AppRouter }` para garantir tree-shaking.

---

## Proximos passos

1. Integrar com sistema de autenticacao (NextAuth, Clerk, etc)
2. Conectar com database (Prisma, Drizzle, etc)
3. Adicionar middleware de rate limiting
4. Configurar CORS (se necessario)
5. Implementar subscriptions via WebSocket (se necessario)
6. Adicionar validacao de input mais robusta
7. Criar testes unitarios para procedures
8. Configurar CI/CD com type-checking do tRPC
