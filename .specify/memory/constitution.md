# next_crud Constitution

## Core Principles

### I. Spec-First Development
All features begin with a specification. No code is written without a reviewed spec. AI generates code FROM specs — not from ad-hoc prompts. If ambiguity exists, mark `[NEEDS CLARIFICATION]` and stop.

### II. TypeScript with Strict Typing
TypeScript `strict: true` mode is mandatory. No `any` types. No `@ts-ignore` or `@ts-expect-error` without documented justification. All function parameters and return types must be explicit.

### III. Layered Architecture
Clear separation of concerns:
- `app/` — Route handlers and pages (UI + API entry points)
- `components/` — UI components (no business logic)
- `services/` — Business logic (no DB imports, no UI imports)
- `lib/` — Database access, utilities
- `types/` — Shared types and validation schemas
No circular dependencies. One-directional data flow. Shared types in a dedicated types directory.

### IV. Simplicity & YAGNI
Start with the simplest solution that meets the spec. Do not add features, abstractions, or dependencies that are not required. Complexity must be justified in the implementation plan.

### V. Next.js Conventions
React Server Components by default. `"use client"` only for interactive components. All data mutations through API route handlers. Use `next/image` for images, `next/link` for navigation.

### VI. Data Integrity
All database operations use transactions when modifying multiple records. Unique constraints enforced at database level. Timestamps generated server-side. No partial writes — operations succeed completely or fail completely.

## Technology Stack

- **Language**: TypeScript
- **Framework**: Next.js
- **Database**: Prisma
- **Styling**: Tailwind CSS (no other CSS solutions)
- **Validation**: Zod for runtime type checking at API boundaries
- **Testing**: Jest

## Quality Gates

Before committing, ensure:
1. `npx tsc --noEmit` passes (zero type errors)
2. Linter passes with zero warnings or errors
3. Formatter check passes (consistent formatting)
4. Tests pass: `npx jest`

## Security

- All user input validated server-side
- No PII in logs
- Parameterized queries / ORM for all database access
- No secrets in source code or client bundles
- Environment variables for all configuration

## Governance

- Constitution supersedes all other guidance
- Amendments require documented rationale and review
- All PRs/reviews must verify compliance
- Complexity must be justified against the simplicity principle

**Version**: 1.0.0 | **Ratified**: 2026-02-19 | **Last Amended**: 2026-02-19
