# Especificacao: Drizzle ORM + PostgreSQL

> Spec de implementacao da camada de persistencia do devroast usando
> **Drizzle ORM** com **PostgreSQL** via **Docker Compose**.

---

## 1. Visao geral

O devroast e atualmente uma aplicacao frontend-only com dados mockados.
Esta spec define o schema de banco de dados necessario para persistir:

- **Submissoes de codigo** — texto submetido pelo usuario
- **Resultados de roast** — score, feedback, sugestoes geradas pela IA
- **Leaderboard** — ranking geral de submissoes por score

Todas as submissoes sao **anonimas** (sem autenticacao). O diff de sugestoes
e o feedback sao **armazenados no banco** para consulta sem re-gerar via IA.

---

## 2. Stack de infraestrutura

| Componente         | Tecnologia              | Versao        |
| ------------------ | ----------------------- | ------------- |
| ORM                | Drizzle ORM             | latest        |
| Driver             | `postgres` (postgres.js)| latest        |
| Banco de dados     | PostgreSQL              | 17-alpine     |
| Container          | Docker Compose          | v3.8+         |
| Migrations         | Drizzle Kit             | latest        |

---

## 3. Docker Compose

Criar `docker-compose.yml` na raiz do projeto:

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: devroast-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    volumes:
      - devroast-data:/var/lib/postgresql/data

volumes:
  devroast-data:
```

### Variavel de ambiente

Criar `.env.example` na raiz:

```env
DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
```

---

## 4. Pacotes necessarios

```bash
# Dependencias de producao
pnpm add drizzle-orm postgres

# Dependencias de desenvolvimento
pnpm add -D drizzle-kit
```

- `drizzle-orm` — o ORM
- `postgres` — driver PostgreSQL (postgres.js, nativo ESM, sem node-gyp)
- `drizzle-kit` — CLI para gerar e rodar migrations

---

## 5. Estrutura de arquivos

```
src/
  db/
    index.ts          # Conexao com o banco (client do postgres.js + drizzle)
    schema/
      index.ts        # Re-export de todos os schemas
      enums.ts        # Enums do PostgreSQL
      submissions.ts  # Tabela submissions
      roasts.ts       # Tabela roasts
```

---

## 6. Enums

### `roast_mode`

Modo de avaliacao escolhido pelo usuario ao submeter o codigo.

| Valor      | Descricao                            |
| ---------- | ------------------------------------ |
| `honest`   | Feedback direto e construtivo        |
| `roast`    | Maximo sarcasmo, modo full roast     |

```ts
// src/db/schema/enums.ts
import { pgEnum } from "drizzle-orm/pg-core";

export const roastModeEnum = pgEnum("roast_mode", ["honest", "roast"]);
```

### `roast_status`

Status do processamento do roast pela IA.

| Valor        | Descricao                                       |
| ------------ | ----------------------------------------------- |
| `pending`    | Submetido, aguardando processamento              |
| `processing` | IA esta gerando o roast                          |
| `completed`  | Roast finalizado com sucesso                     |
| `failed`     | Erro durante o processamento                     |

```ts
export const roastStatusEnum = pgEnum("roast_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);
```

### `language`

Linguagem de programacao do codigo submetido. Comecamos com as linguagens
que aparecem no layout mockado e as mais comuns. Pode ser estendido depois.

| Valor          |
| -------------- |
| `javascript`   |
| `typescript`   |
| `python`       |
| `java`         |
| `csharp`       |
| `go`           |
| `rust`         |
| `sql`          |
| `html`         |
| `css`          |
| `other`        |

```ts
export const languageEnum = pgEnum("language", [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "go",
  "rust",
  "sql",
  "html",
  "css",
  "other",
]);
```

---

## 7. Tabelas

### 7.1 `submissions`

Armazena cada trecho de codigo submetido para analise.

| Coluna       | Tipo                   | Constraints                  | Descricao                            |
| ------------ | ---------------------- | ---------------------------- | ------------------------------------ |
| `id`         | `uuid`                 | PK, default `gen_random_uuid()` | Identificador unico               |
| `code`       | `text`                 | NOT NULL                     | Codigo fonte submetido               |
| `language`   | `language` (enum)      | NOT NULL, default `'other'`  | Linguagem detectada/selecionada      |
| `mode`       | `roast_mode` (enum)    | NOT NULL, default `'roast'`  | Modo escolhido pelo usuario          |
| `created_at` | `timestamp with tz`    | NOT NULL, default `now()`    | Data da submissao                    |

```ts
// src/db/schema/submissions.ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { languageEnum, roastModeEnum } from "./enums";

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  language: languageEnum("language").notNull().default("other"),
  mode: roastModeEnum("mode").notNull().default("roast"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

### 7.2 `roasts`

Armazena o resultado completo de cada roast gerado pela IA.
Relacao **1:1** com `submissions` (cada submissao gera no maximo um roast).

| Coluna           | Tipo                   | Constraints                          | Descricao                                          |
| ---------------- | ---------------------- | ------------------------------------ | -------------------------------------------------- |
| `id`             | `uuid`                 | PK, default `gen_random_uuid()`      | Identificador unico                                |
| `submission_id`  | `uuid`                 | FK -> submissions.id, UNIQUE, NOT NULL | Submissao que gerou este roast                   |
| `status`         | `roast_status` (enum)  | NOT NULL, default `'pending'`        | Status do processamento                            |
| `score`          | `real`                 | nullable                             | Nota de 0.0 a 10.0 (null enquanto pending)         |
| `feedback`       | `text`                 | nullable                             | Texto de feedback/roast gerado pela IA             |
| `suggested_code` | `text`                 | nullable                             | Versao melhorada do codigo sugerida pela IA        |
| `created_at`     | `timestamp with tz`    | NOT NULL, default `now()`            | Data de criacao do registro                        |
| `completed_at`   | `timestamp with tz`    | nullable                             | Data em que o processamento finalizou              |

```ts
// src/db/schema/roasts.ts
import { pgTable, uuid, text, real, timestamp } from "drizzle-orm/pg-core";
import { roastStatusEnum } from "./enums";
import { submissions } from "./submissions";

export const roasts = pgTable("roasts", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .unique()
    .references(() => submissions.id, { onDelete: "cascade" }),
  status: roastStatusEnum("status").notNull().default("pending"),
  score: real("score"),
  feedback: text("feedback"),
  suggestedCode: text("suggested_code"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
```

---

## 8. Relations (Drizzle Relations API)

```ts
// src/db/schema/index.ts
import { relations } from "drizzle-orm";
import { submissions } from "./submissions";
import { roasts } from "./roasts";

export const submissionsRelations = relations(submissions, ({ one }) => ({
  roast: one(roasts, {
    fields: [submissions.id],
    references: [roasts.submissionId],
  }),
}));

export const roastsRelations = relations(roasts, ({ one }) => ({
  submission: one(submissions, {
    fields: [roasts.submissionId],
    references: [submissions.id],
  }),
}));

export * from "./enums";
export * from "./submissions";
export * from "./roasts";
```

---

## 9. Conexao com o banco

```ts
// src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
```

---

## 10. Configuracao do Drizzle Kit

Criar `drizzle.config.ts` na raiz do projeto:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## 11. Scripts do package.json

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

| Script         | Descricao                                          |
| -------------- | -------------------------------------------------- |
| `db:generate`  | Gera arquivos de migration a partir do schema      |
| `db:migrate`   | Aplica migrations pendentes no banco               |
| `db:push`      | Push direto do schema para o banco (dev)           |
| `db:studio`    | Abre o Drizzle Studio para visualizar dados        |

---

## 12. Queries essenciais (referencia)

### Criar submissao + roast

```ts
import { db } from "@/db";
import { submissions, roasts } from "@/db/schema";

async function createSubmission(code: string, language: string, mode: string) {
  return db.transaction(async (tx) => {
    const [submission] = await tx
      .insert(submissions)
      .values({ code, language, mode })
      .returning();

    const [roast] = await tx
      .insert(roasts)
      .values({ submissionId: submission.id })
      .returning();

    return { submission, roast };
  });
}
```

### Buscar submissao com roast

```ts
import { eq } from "drizzle-orm";

async function getSubmissionWithRoast(id: string) {
  return db.query.submissions.findFirst({
    where: eq(submissions.id, id),
    with: { roast: true },
  });
}
```

### Leaderboard (ranking geral por score)

```ts
import { desc, eq, isNotNull } from "drizzle-orm";

async function getLeaderboard(limit = 50, offset = 0) {
  return db
    .select({
      rank: sql<number>`row_number() over (order by ${roasts.score} asc)`,
      submissionId: submissions.id,
      code: submissions.code,
      language: submissions.language,
      score: roasts.score,
      createdAt: submissions.createdAt,
    })
    .from(roasts)
    .innerJoin(submissions, eq(roasts.submissionId, submissions.id))
    .where(eq(roasts.status, "completed"))
    .orderBy(roasts.score)
    .limit(limit)
    .offset(offset);
}
```

### Estatisticas globais (footer da homepage)

```ts
import { count, avg, eq } from "drizzle-orm";

async function getGlobalStats() {
  const [stats] = await db
    .select({
      totalRoasted: count(),
      avgScore: avg(roasts.score),
    })
    .from(roasts)
    .where(eq(roasts.status, "completed"));

  return stats;
}
```

---

## 13. Fluxo de uso (dev local)

```bash
# 1. Subir o PostgreSQL
docker compose up -d

# 2. Copiar variaveis de ambiente
cp .env.example .env

# 3. Instalar dependencias
pnpm install

# 4. Push do schema para o banco (dev)
pnpm db:push

# 5. Rodar a aplicacao
pnpm dev

# 6. (Opcional) Abrir Drizzle Studio
pnpm db:studio
```

---

## 14. Diagrama do schema

```
┌──────────────────────┐       ┌──────────────────────────┐
│     submissions      │       │         roasts           │
├──────────────────────┤       ├──────────────────────────┤
│ id          uuid PK  │──┐    │ id             uuid PK   │
│ code        text     │  │    │ submission_id  uuid FK   │──┐
│ language    enum     │  └───>│   (unique, not null)     │  │
│ mode        enum     │       │ status         enum      │  │
│ created_at  timestz  │       │ score          real      │  │
└──────────────────────┘       │ feedback       text      │  │
                               │ suggested_code text      │  │
  enums:                       │ created_at     timestz   │  │
  - roast_mode                 │ completed_at   timestz   │  │
  - roast_status               └──────────────────────────┘  │
  - language                          │                      │
                                      └──────────────────────┘
                                        1:1 (cascade delete)
```

---

## 15. Consideracoes

- **Sem auth**: nao ha tabela de `users`. Se auth for adicionado futuramente,
  basta criar a tabela e adicionar `user_id` FK em `submissions`.
- **Provedor de IA agnostico**: o schema nao acopla a nenhum provedor.
  A integracao com IA (OpenAI, Anthropic, etc.) sera tratada na camada de
  server actions/API routes, fora do schema.
- **`suggested_code` como texto**: armazenamos o codigo sugerido completo.
  O diff e computado no frontend comparando `submissions.code` com
  `roasts.suggested_code` (pode-se usar uma lib como `diff` ou computar
  server-side).
- **Indice implicito**: a constraint `UNIQUE` em `roasts.submission_id`
  ja cria um indice. Para o leaderboard, se a performance degradar,
  considerar um indice em `roasts.score` onde `status = 'completed'`.
- **`real` para score**: precisao suficiente para notas de 0.0 a 10.0.
  Nao ha necessidade de `numeric`/`decimal` para esse caso.
