# Repository Guidelines

## Project Structure

This repository contains the PanganTani Next.js frontend. Put App Router pages, layouts, and global styles in `src/app/`. Keep reusable React components in `src/components/`, shadcn/Base UI primitives in `src/components/ui/`, and shared helpers in `src/lib/`. Place static assets in `public/`, workflow files in `.github/workflows/`, and project documentation in `docs/`. The `logs/` directory (ignored by Git) contains AI workflow planning, notes, and checkpoints.

## Build and Development

Run commands from the Git root with Node.js 24 and Bun 1.4.4 to match CI.

- `bun install --frozen-lockfile` installs the locked dependencies and runs the Lefthook setup.
- `bun dev` starts the development server at `http://localhost:3000`.
- `bun run next typegen && bun run tsc --noEmit` generates route types and checks TypeScript.
- `bun run build` creates the production build. `bun run start` serves it locally.

## Coding Style

Use TypeScript and TSX for application code. Follow the existing lowercase component filenames such as `button.tsx` and use PascalCase for React component names. Prettier uses two spaces, single quotes in TypeScript and JSX, and no statement-ending semicolons. Run `bun run lint` for Oxlint and `bun run format:check` for Prettier. Lefthook also checks staged files before commit.

Keep handwritten source, tests, scripts, and configuration free of comments. Limit file length to a maximum of 500 lines; split larger files into separate components or libraries. Use descriptive names, types, tests, and documentation to explain intent. Follow the [code style guide](docs/CODE-STYLE.md).

## AI Workflow and Logs Directory

The `logs/` directory (ignored in `.gitignore`) serves as the core information base for AI agents when planning and creating features:

- `logs/plan/`: Planning files. Every new feature or architectural refactor must have a dedicated markdown plan created here first before code implementation starts. Implement all planned steps sequentially and systematically.
- `logs/notes/`: Implementation notes, architectural decisions, technical considerations, or background context captured during work.
- `logs/checkpoints/`: Implementation outcome records, completed milestone summaries, and verification checkpoints. You MUST create or update a checkpoint file here for every single change without exception, including minor bug fixes, small refactors, styling tweaks, config adjustments, or small additions. Every implementation phase, fix, or update must record a dedicated checkpoint documenting changes, files touched, and verification results before completing the task.

## Environment Variables and Validation

Keep environment variable schemas strictly validated using Zod in `src/lib/env.ts`.

- Whenever any new environment variable is introduced or referenced (in `.env`, `.env.example`, Server Components, Client Components, API client, or build scripts), you MUST immediately update the Zod schema in `src/lib/env.ts` with appropriate types, defaults, and constraints, and update `.env.example` with safe placeholder values.
- Separate server-side and client-side (prefixed with `NEXT_PUBLIC_`) variables. Never expose private server secrets or credentials to the client bundle.
- Validate environment variables at build and startup time by importing `src/lib/env.ts` in `next.config.ts`.
- Consume environment variables via `import { env } from '@/lib/env'` for type safety and autocomplete instead of raw `process.env`.

## Testing

Run unit tests with `bun run test`. Place Bun tests next to the code they cover, following `src/components/ui/button.test.mjs`. Cover default and alternate behavior when changing a component. After building, run `bash scripts/smoke.sh` to check that the production homepage returns HTTP `200` and HTML. CT gates on passing tests. Coverage measurement is optional.

## Commits and Pull Requests

Branch from `main` with a descriptive name such as `fix/price-input`. Commitlint enforces Conventional Commits, for example `fix(cart): correct subtotal`. Target `main`, summarize the change and how you verified it, and link related issues when available. Include screenshots when they help reviewers assess a visual change. Wait for CI, CT, and at least one team approval before merging. See the [commit convention](docs/COMMIT-CONVENTION.md) and [contributor guide](CONTRIBUTING.md).

## Security and Operations

Keep secrets server-side and out of Git, logs, and build artifacts. Report vulnerabilities privately through the core team. Follow the [security guide](docs/SECURITY.md).

Check current CI and CT requirements and review staging, monitoring, and rollback recommendations before connecting CD to a production target. See the [development and production guide](docs/DEVELOPMENT-PRODUCTION.md).

## Next.js Implementation Guidelines

This repo runs Next.js 16.4.6 with Cache Components enabled. Use the conventions below for new routes and integrations. Keep code examples and implementation files free of comments.

### App Router

- Keep pages and layouts as Server Components by default. Put `'use client'` at the smallest boundary that needs event handlers, state, or browser APIs. Co-locate route-specific components and tests under `src/app/` and move reusable components to `src/components/`. [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- Use `page.tsx` for route UI and a thin `layout.tsx` for shared UI that persists through navigation. Fetch route-specific data in the page or its child Server Components. Use `template.tsx` when navigation should deliberately remount the subtree. A group such as `(dashboard)` shares a layout without adding a URL segment.
- Await `params` and `searchParams` where applicable. Use `[id]` for one segment, `[...slug]` for one or more, and `[[...slug]]` for zero or more. Use `metadata` or `generateMetadata` for page metadata. When using `generateStaticParams` with Cache Components, return at least one real parameter set. [Dynamic routes with Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components#generatestaticparams-and-dynamicparams)
- Use `loading.tsx` for route-level fallbacks and `<Suspense>` for independent sections. Use `notFound()` with `not-found.tsx` for missing resources. Implement `error.tsx` as a Client Component and use `retry()` when the user can retry a transient failure. [Route error boundaries](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- Use parallel slots such as `@analytics` when a layout needs independently navigable views. Provide `default.tsx` fallbacks for slots that can be unmatched on a hard reload, including `children` when applicable. For modal routes, pair interception with a canonical page and test client navigation, direct links, and reloads. [Parallel routes](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes) · [Intercepting routes](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes)

### Data Fetching and Caching

- Read data directly from its source in Server Components or server-only helpers. Check `response.ok` before parsing fetch results. Start independent requests together with `Promise.all` when the view needs all results, or stream them behind separate Suspense boundaries. Use client-side TanStack Query for flows that need polling or interactive refetching.
- Read request-specific data such as `cookies()`, `headers()`, and uncached async results behind a Suspense boundary. Use `'use cache'` with `cacheLife` for reusable public data and `cacheTag` for targeted invalidation. Keep user-specific reads request-scoped unless the cache design explicitly isolates users. Use React `cache()` for request-scoped deduplication of repeated server reads. [Cache Components](https://nextjs.org/docs/app/getting-started/caching)
- Follow Cache Components guidance when adapting examples built around segment-level `dynamic`, `revalidate`, or `unstable_cache`. Use `revalidateTag(tag, 'max')` for background revalidation, `updateTag(tag)` inside a Server Action when the next read must reflect the write, and `revalidatePath` for a specific affected route. Verify freshness with a production build and `bun run start`. [Migrating to Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components) · [Cache invalidation](https://nextjs.org/docs/app/api-reference/functions/updateTag)

### Route Handlers

- Define HTTP contracts, webhooks, and streaming endpoints in `src/app/**/route.ts`. Put `route.ts` and `page.tsx` in separate route segments. Use `Request` and `Response`, or Next.js extensions when needed. Await dynamic `params`. A `GET` can be prerendered when it can complete without request-time data. Put `'use cache'` in a helper if a handler needs cached data. Use the default Node.js runtime required by Cache Components. [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) · [Runtime configuration](https://nextjs.org/docs/app/guides/migrating-to-cache-components#runtime--edge)
- Validate input with Zod and authorize access to the specific resource inside the handler. Distinguish invalid input, missing authentication, forbidden access, and server errors in HTTP responses. Return safe error messages and log diagnostic context without secrets. Use an explicit origin allowlist and handle `OPTIONS` when cross-origin access is needed. [Security guide](docs/SECURITY.md)
- Read the body once. Verify signed webhooks against the raw payload before processing and handle duplicate deliveries safely. For uploads, enforce file type and size limits and use durable object storage. Prefer direct-to-storage uploads with scoped, short-lived permissions for large files.

### Images and Fonts

- Use `next/image` for content images. Supply descriptive `alt` text or `alt=''` for decorative images. Prefer static imports for known local dimensions. For remote images, supply dimensions or use `fill` with a positioned parent that reserves space. Set `sizes` to match responsive widths and restrict `remotePatterns` to approved hosts and paths. [Image component](https://nextjs.org/docs/app/api-reference/components/image)
- Leave ordinary images lazy-loaded. Set `loading='eager'` for an above-the-fold image that should load immediately, and add `fetchPriority='high'` when the request needs priority. Reserve `preload` for a known LCP image that warrants a head preload. The `priority` prop is deprecated in Next.js 16. Use `next/font` for typography and `next/og` when generating Open Graph images. [Image loading](https://nextjs.org/docs/app/api-reference/components/image#preload) · [Font optimization](https://nextjs.org/docs/app/getting-started/fonts)

### Proxy and Request Routing

- Use `src/proxy.ts` for new cross-route redirects, rewrites, locale routing, or inexpensive request checks. Next.js 16 calls this convention Proxy and runs it on Node.js. Scope the `matcher` to the intended URL paths so static assets and the image optimizer remain outside unrelated checks. [Proxy convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- Keep Proxy work lightweight. Put data access, resource authorization, and input parsing in the server entry point that handles the operation. Apply shared response headers at the app or hosting layer where appropriate. Use a shared store if rate limits must be consistent across production instances. [Next.js data security](https://nextjs.org/docs/app/guides/data-security)

### Server Actions

- Use async functions marked with `'use server'` for mutations initiated by the app UI. Attach form mutations with `<form action={...}>` and put reusable actions in dedicated files. Use `useActionState` for expected errors and pending UI, and `useOptimistic` for reversible optimistic updates. Use `startTransition` for non-form action calls where transition state is needed. [Mutating data](https://nextjs.org/docs/app/getting-started/mutating-data)
- Treat every action as a callable POST entry point. Authenticate the caller, authorize the resource, and validate all input and bound arguments. Return serializable results with only the data needed by the UI. Run targeted cache invalidation after a successful write and call `redirect()` outside any `try` block that catches application errors. [Next.js data security](https://nextjs.org/docs/app/guides/data-security) · [Mutating data](https://nextjs.org/docs/app/getting-started/mutating-data)
