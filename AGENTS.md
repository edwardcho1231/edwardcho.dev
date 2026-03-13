# AGENTS.md

## Project Purpose
This repository is the DocRev monorepo (`/Users/clawed/Documents/coding/docrev`).

- `apps/web`: Next.js app (auth + document UI)
- `apps/api`: Express API
- `packages/db`: Prisma schema and DB client package
- `packages/types`: shared types package

## Runtime & Local Development Context
- `apps/web` typically runs on `http://localhost:3000`
- `apps/api` runs on `http://localhost:3001`
- API routes that fetch or mutate documents are Clerk-authenticated.

## General Working Rules
- Default to editing only what is necessary for the requested task.
- Prefer narrow, targeted changes rather than broad refactors.
- Do not use destructive git operations unless explicitly asked.
- Avoid reverting unrelated changes.
- Use existing monorepo tooling and scripts.
- Favor quick and synchronous fixes over over-exploration.

## File Access & Tooling Constraints
- Use `rg` for file searching instead of `grep`.
- Use `apply_patch` for file edits when possible.
- Avoid unnecessary file system reads.
- Do not run tests/builds/validation unless the user explicitly requests them.

## Development Commands (reference)
- Install deps: `pnpm install`
- Run all apps: `pnpm dev`
- Run web only: `pnpm --filter web dev`
- Run api only: `pnpm --filter api dev`
- Prisma setup:
  - `pnpm --filter @repo/db exec prisma generate`
  - `pnpm --filter @repo/db exec prisma migrate deploy`

## Route / Feature Notes
- Current `/documents` flow depends on Clerk session + backend API at `/api/v1/documents`.
- When fetching documents from the client, ensure auth/session context is available before calls.

## Editing Conventions
- Keep changes minimal and explicit.
- Avoid modifying files you did not touch unless needed for the requested work.
- Keep error handling user-facing and visible where relevant.

## Communication Style
- Be concise, practical, and explicit with outcomes.
- Prioritize fixing the requested behavior, then suggest optional follow-ups.

## Engineering & Delivery Principles
- Always provide a solution-oriented answer to the user’s problem rather than only listing possibilities.
- Keep changes minimal and effective:
  - Make the smallest code edits needed to resolve the issue.
  - Avoid speculative rewrites or feature additions not asked for.
- Do not cut corners:
  - Preserve existing behavior unless explicitly changed by the request.
  - Address root-cause issues instead of superficial UI-only patches when deeper fixes are needed.
- Apply high engineering standards:
  - Keep logic consistent, typed, and easy to reason about.
  - Prefer clear naming, explicit error handling, and predictable state transitions.
  - Keep security and auth behavior correct, especially on routes touching protected data.
- When uncertain between two implementations, choose the safer, more maintainable path and call out tradeoffs briefly.
