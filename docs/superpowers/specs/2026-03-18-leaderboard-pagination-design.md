# Leaderboard Pagination & Display Design

## Overview
This design covers the implementation of the full leaderboard page (`/leaderboard`) with pagination and collapsible code display, matching the style of the homepage shame leaderboard.

## Goals
1.  Replace static mock data with real data fetched via tRPC.
2.  Implement server-side rendering (SSR) with prefetching for initial data load.
3.  Support pagination (20 items per page) with standard "Prev 1 2 ... Next" navigation.
4.  Replicate the homepage's collapsible code display style with syntax highlighting.
5.  Maintain high performance by generating HTML on the server.

## Architecture

### Backend (tRPC)
Add a new public procedure `getLeaderboard` to `src/trpc/routers/roast.ts`:

-   **Input:** `{ page: number (default 1), limit: number (default 20) }`
-   **Output:**
    ```ts
    {
      items: Array<{
        id: string;
        rank: number;
        score: number;
        code: string;
        codeHtml: string;
        language: string;
        lineCount: number;
      }>;
      totalCount: number;
      totalPages: number;
      currentPage: number;
    }
    ```
-   **Logic:**
    -   Calculate offset based on page and limit.
    -   Query `roasts` table joined with `submissions`.
    -   Filter by `status = 'completed'` and `score IS NOT NULL`.
    -   Order by `score ASC`.
    -   Execute main query and count query in parallel (`Promise.all`).
    -   Process each item to generate syntax-highlighted HTML using `shiki` (`codeToHtml`).

### Frontend

#### 1. Page Component (`src/app/leaderboard/page.tsx`)
-   Convert to async Server Component.
-   Read `page` from search params (default to 1).
-   Prefetch `getLeaderboard` query on the server.
-   Render `HydrateClient` wrapping the client-side list component.

#### 2. List Component (`src/components/leaderboard-list.tsx`)
-   New Client Component.
-   Uses `useSuspenseQuery` to consume the prefetched data.
-   Renders the list of items using `CollapsibleCodeRow` (reusing the existing UI component).
-   Implements the layout structure from the homepage (Rank, Score, Language, Line Count).
-   Includes the `Pagination` component at the bottom.

#### 3. Pagination Component (`src/components/ui/pagination.tsx`)
-   New component for navigation controls.
-   Props: `{ totalPages, currentPage }`.
-   Renders "Previous" and "Next" buttons.
-   Renders page numbers with simple logic (e.g., current +/- 2 pages).
-   Updates the URL using `Link` or `useRouter` to `?page=X`.

## Data Flow
1.  User visits `/leaderboard?page=2`.
2.  Server component reads `page=2`.
3.  Server calls `trpc.roast.getLeaderboard({ page: 2 })`.
4.  Data (including pre-rendered HTML) is serialized to client.
5.  Client hydrates and displays the list instantly.
6.  User clicks "Next" -> URL updates to `?page=3` -> Next.js handles navigation (potentially with partial hydration/prefetching).

## Error Handling
-   If `page` param is invalid, default to 1.
-   If `getLeaderboard` fails, show a friendly error message or fallback UI.

## Testing Strategy
-   Verify pagination links update the URL correctly.
-   Check that syntax highlighting is applied.
-   Ensure "Collapsible" functionality works for long code blocks.
