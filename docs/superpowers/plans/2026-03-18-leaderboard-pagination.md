# Leaderboard Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full leaderboard page with server-side pagination, sorting by score, and syntax-highlighted code display.

**Architecture:** 
- **Backend:** New tRPC procedure `roast.getLeaderboard` fetching data from Drizzle/Postgres, processing syntax highlighting with Shiki on the server.
- **Frontend:** Server Component page fetching data via prefetch/SSR, rendering a list of `CollapsibleCodeRow` components, and a new `Pagination` component for navigation.

**Tech Stack:** Next.js (App Router), tRPC, Drizzle ORM, Tailwind CSS, Shiki.

---

### Task 1: Create Backend tRPC Procedure

**Files:**
- Modify: `src/trpc/routers/roast.ts`

**Steps:**

- [ ] **1. Define Input Schema & Output Type**
  - Add `z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(100).default(20) })` to input.
  - Define return type structure.

- [ ] **2. Implement `getLeaderboard` Procedure**
  - Add `getLeaderboard` to `roastRouter`.
  - Calculate `offset = (page - 1) * limit`.
  - Create query to fetch `roasts` joined with `submissions`.
  - Filter: `where(and(eq(roasts.status, "completed"), isNotNull(roasts.score)))`.
  - Order: `orderBy(asc(roasts.score))`.
  - Pagination: `.limit(limit).offset(offset)`.
  - Parallel execution: Run main query and count query (`db.select({ count: count() })...`) using `Promise.all`.

- [ ] **3. Implement Syntax Highlighting Processing**
  - Iterate over results.
  - Call `codeToHtml` (Shiki) for each item (language from submission, theme 'vesper').
  - Calculate `lineCount`.
  - Map to return object.

- [ ] **4. Verify Procedure**
  - Since we don't have a dedicated tRPC test runner in the plan context, we will verify this by checking the server logs or using the tRPC playground if available (or implicitly via the frontend implementation later). *Self-correction: We should ensure the code compiles.*
  - Run `pnpm typecheck` to ensure type safety.

- [ ] **5. Commit**
  - `git add src/trpc/routers/roast.ts`
  - `git commit -m "feat(trpc): add getLeaderboard procedure with pagination"`

---

### Task 2: Create Pagination UI Component

**Files:**
- Create: `src/components/ui/pagination.tsx`

**Steps:**

- [ ] **1. Create Component Structure**
  - Create `Pagination` component accepting `currentPage` and `totalPages`.
  - Use `useSearchParams` and `usePathname` from `next/navigation` to construct links.
  - Use `Link` from `next/link`.

- [ ] **2. Implement Navigation Logic**
  - "Previous" button (disabled if page <= 1).
  - "Next" button (disabled if page >= totalPages).
  - Page numbers: Show current page, maybe start/end if many pages (keep it simple for now: Prev [Current] Next, or Prev 1 2 [3] 4 5 Next).
  - *Design Decision:* Simple style: `[Prev] Page X of Y [Next]`.

- [ ] **3. Style Component**
  - Use `Button` component variants (`outline` or `ghost`).
  - Use `font-mono` for text.
  - Flexbox for alignment.

- [ ] **4. Commit**
  - `git add src/components/ui/pagination.tsx`
  - `git commit -m "feat(ui): add pagination component"`

---

### Task 3: Implement Leaderboard List Component

**Files:**
- Create: `src/components/leaderboard-list.tsx`

**Steps:**

- [ ] **1. Create Component & Query**
  - "use client" directive.
  - Get `page` from props or `useSearchParams` (props preferred for SSR hydration).
  - Call `useSuspenseQuery(trpc.roast.getLeaderboard.queryOptions({ page }))`.

- [ ] **2. Render List Items**
  - Iterate over `data.items`.
  - Render `CollapsibleCodeRow` for each item.
  - **Replicate Header Styles:** Copy the header styles (Rank, Score, Language, Line Count) from `src/components/leaderboard-entry.tsx` or `src/components/shame-leaderboard.tsx` to maintain consistency. *Note: `LeaderboardEntry` is the component used in the mock page, we should use that instead of raw `CollapsibleCodeRow` if it fits, or adapt it.*
  - *Refinement:* `LeaderboardEntry` already exists and looks correct. Let's reuse `LeaderboardEntry`! It takes `rank`, `score`, `language`, `code`, `lineCount`.
  - **Wait:** `LeaderboardEntry` uses `CodeBlock`, which might NOT be collapsible or might differ from `CollapsibleCodeRow`.
  - **Check:** `src/components/leaderboard-entry.tsx` imports `CodeBlock`.
  - **Check:** `src/components/shame-leaderboard.tsx` uses `CollapsibleCodeRow`.
  - **Decision:** The prompt asked to "replicate the homepage style" which uses `CollapsibleCodeRow`. The mock `LeaderboardEntry` might be different. Let's create a new `LeaderboardListEntry` or update `LeaderboardEntry` to use `CollapsibleCodeRow` if that's the desired look.
  - *Actually:* The homepage `ShameLeaderboard` iterates and renders a custom structure + `CollapsibleCodeRow`. Let's create `src/components/leaderboard-list-item.tsx` that replicates the homepage's row style exactly.

- [ ] **3. Render Pagination**
  - Add `<Pagination currentPage={data.currentPage} totalPages={data.totalPages} />` at the bottom.

- [ ] **4. Commit**
  - `git add src/components/leaderboard-list.tsx`
  - `git commit -m "feat(components): add LeaderboardList component"`

---

### Task 4: Update Leaderboard Page

**Files:**
- Modify: `src/app/leaderboard/page.tsx`

**Steps:**

- [ ] **1. Convert to Async Component**
  - Ensure `LeaderboardPage` is `async`.
  - Accept `searchParams`: `Promise<{ page?: string }>`.

- [ ] **2. Implement Server-Side Prefetching**
  - Parse `page` from searchParams (default 1).
  - `void trpc.roast.getLeaderboard.prefetch({ page })`.

- [ ] **3. Render Page Content**
  - Replace mock data and `LeaderboardEntry` map with `<LeaderboardList page={page} />`.
  - Wrap in `<HydrateClient>` and `<Suspense fallback={<LeaderboardSkeleton />}>`.
  - *Note:* Need to ensure `LeaderboardSkeleton` is suitable or create a generic `ListSkeleton`.

- [ ] **4. Verify End-to-End**
  - Run the dev server.
  - Visit `/leaderboard`.
  - Check if real data loads.
  - Check pagination.
  - Check syntax highlighting.

- [ ] **5. Commit**
  - `git add src/app/leaderboard/page.tsx`
  - `git commit -m "feat(page): integrate real leaderboard data"`
