# AGENTS.md

## Project Purpose
This repository is the edwardcho.dev monorepo.

- `apps/web`: Next.js app (auth + document UI)
- `packages/db`: Prisma schema and DB client package
- `packages/types`: shared types package

## Runtime & Local Development Context
- `apps/web` typically runs on `http://localhost:3000`
- API routes that fetch or mutate documents are Clerk-authenticated.

## General Working Rules
- Default to editing only what is necessary for the requested task.
- Prefer narrow, targeted changes rather than broad refactors.
- Do not use destructive git operations unless explicitly asked.
- Avoid reverting unrelated changes.
- Use existing monorepo tooling and scripts.
- Favor quick and synchronous fixes over over-exploration.
- If a fix can be implemented directly, do it rather than only describing it.

## File Access & Tooling Constraints
- Use `rg` for file searching instead of `grep`.
- Use `apply_patch` for file edits when possible.
- Avoid unnecessary file system reads.
- Do not run tests/builds/validation unless the user explicitly requests them.

## Development Commands (reference)
- Install deps: `pnpm install`
- Run all apps: `pnpm dev`
- Run web only: `pnpm --filter web dev`
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

## General Operating Principles
- Source of truth:
  - Treat code and runtime behavior as the source of truth when docs and implementation diverge.
  - Update docs to match current implementation as part of the change.
- Single ownership per concern:
  - Keep one canonical location per topic (overview, app behavior, database setup, API details).
  - Prefer linking to the canonical location over duplicating content.
- Consistency over preference:
  - Follow existing naming, structure, and repository conventions unless there is a strong reason to change.
- Small, reversible changes:
  - Prefer incremental edits that are easy to review, reason about, and roll back.
- Verify before finalizing:
  - Confirm key assumptions with quick checks before reporting completion.
- Environment-aware guidance:
  - Keep setup and operational guidance portable across environments.
  - Avoid machine-specific details in committed docs and instructions.
- Explicit scope control:
  - Keep work within requested scope unless an adjacent change is necessary for correctness.
- Decision traceability:
  - Briefly document important tradeoffs so future maintainers understand why a choice was made.
- Security and secrets hygiene:
  - Never commit secrets or sensitive credentials.
  - Avoid exposing unnecessary sensitive operational details in docs.

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
