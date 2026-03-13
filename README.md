🚧 **Status: Work in Progress**

# DocRev

DocRev is an experimental editorial platform built with **React, Next.js, and TypeScript** that explores document editing and revision workflows similar to modern editorial CMS systems.

The project is inspired by the CMS tooling I’ve worked on professionally and is used both as a technical experiment and as the publishing system for my personal blog. Authenticated users can create and edit documents, while published documents will power the blog portion of the site.

The goal of DocRev is to explore how document editing, revision history, and publishing workflows can be implemented in a modern full-stack TypeScript application.

Recruiters and visitors can create accounts to try the editor and document workflows.

## Current Features

- User authentication via Clerk
- Create and delete documents
- Markdown editor with live preview
- Document persistence using Postgres + Prisma
- Basic API layer for document management
- Monorepo architecture using Turborepo

## Planned Features

- Editing existing documents
- Draft → Published workflow for blog posts
- Blog route generated from published documents
- Revision history timeline
- Revision comparison
- Visual diff for document changes
- Reverting documents to previous revisions

## Repo Setup

DocRev is a Turborepo with:
- `apps/web`: Next.js + Clerk UI app
- `apps/api`: Express API with Clerk auth middleware
- `packages/db`: Prisma schema/client package for Postgres
- `packages/types`: shared types package scaffold

## Tech Stack

- Node.js + pnpm workspaces + Turborepo
- Next.js 16 / React 19 (`apps/web`)
- Express 5 (`apps/api`)
- Clerk (`@clerk/nextjs`, `@clerk/express`)
- Prisma + Postgres (`packages/db`)

## Repository Layout

```text
apps/
  api/      Express API (port 3001)
  web/      Next.js app (port 3000)
packages/
  db/       Prisma schema + Prisma client singleton export
  types/    Shared types package scaffold
```

## Prerequisites

- Node.js `>=18` (Node 22 is currently used in this repo)
- pnpm `9`
- A Postgres database
- A Clerk application (publishable key + secret key)

## Environment Setup

Create `apps/web/.env`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
# Optional but currently present in this repo:
CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

Create `apps/api/.env`:

```env
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
DATABASE_URL=postgresql://USER:PASS@HOST:5432/DB_NAME
PORT=3001
```

Important:
- `apps/web` and `apps/api` must use keys from the same Clerk instance.
- A malformed `DATABASE_URL` will fail API startup or Prisma queries.

## Install Dependencies

```bash
pnpm install
```

## Database Setup (Prisma)

Apply migrations:

```bash
DATABASE_URL=postgresql://USER:PASS@HOST:5432/DB_NAME \
pnpm --filter @repo/db exec prisma migrate deploy
```

Generate Prisma client:

```bash
DATABASE_URL=postgresql://USER:PASS@HOST:5432/DB_NAME \
pnpm --filter @repo/db exec prisma generate
```

Optional:

```bash
DATABASE_URL=postgresql://USER:PASS@HOST:5432/DB_NAME \
pnpm --filter @repo/db exec prisma studio
```

## Run Locally

Run all apps:

```bash
pnpm dev
```

Run apps separately:

```bash
pnpm --filter web dev
pnpm --filter api dev
```

Default URLs:
- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- Health check: `http://localhost:3001/api/v1/health`

## API Endpoints

Current API routes in `apps/api/src/routes`:

- `GET /api/v1/health`
  - Public
  - Returns `{ "status": "ok" }`

- `GET /api/v1/documents`
  - Requires Clerk auth
  - Returns current user id and document list (including `latestRevision`)

- `POST /api/v1/documents`
  - Requires Clerk auth
  - Body:
    - `title: string`
    - `content: string`
  - Creates a `Document`, creates initial `Revision`, then updates `latestRevisionId`

## Testing Authenticated API Calls with curl

1. Sign in to the web app.
2. In browser console, get a fresh token:

```js
await window.Clerk.session.getToken()
```

3. Call API quickly (token is short-lived in local dev):

```bash
curl -i http://localhost:3001/api/v1/documents \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Origin: http://localhost:3000" \
  -H "Referer: http://localhost:3000/" \
  -H "Sec-Fetch-Dest: empty" \
  -H "X-Forwarded-Host: localhost:3000" \
  -H "X-Forwarded-Proto: http"
```

## Scripts

From repo root:

- `pnpm dev` runs package `dev` tasks through Turbo
- `pnpm lint` runs available `lint` tasks (currently `apps/web`)
- `pnpm format` formats `*.ts`, `*.tsx`, `*.md`
- `pnpm build` runs package `build` tasks
