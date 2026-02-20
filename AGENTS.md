# AGENTS.md — next_crud

## Project Overview

next_crud — initialized for Specs-Driven Development.

## Development Methodology

This project follows **Specs-Driven Development** powered by spec-kit. All development flows through:

1. **Constitution** (`.specify/memory/constitution.md`) — immutable project principles
2. **Specifications** (`.specify/specs/`) — what to build and why
3. **Plans** — technical implementation architecture
4. **Tasks** — ordered, actionable work items
5. **Implementation** — code generated from specs, never invented

## AI Trust Levels

| Level | Description | When to Use |
|-------|-------------|-------------|
| L0 | AI drafts only, human writes final | New/unfamiliar domains |
| L1 | AI writes code, human edits | Learning phase |
| L2 | AI writes code + tests, human reviews | Standard development |
| L3 | AI writes code + tests + docs, human reviews diffs | Mature features |

**Current level**: L2

## Non-Negotiable Rules

1. **Do not invent beyond spec.** If the spec does not mention it, do not build it. If ambiguity exists, mark `[NEEDS CLARIFICATION]` and stop.
2. **All code must trace to a spec.** Every file, function, and component must reference a feature spec and user story.
3. **Constraints are hard gates.** Violating a constraint in `.specify/specs/global/` or a feature `constraints.md` is a blocking failure, not a discussion.
4. **Spec before code.** No implementation PR without a reviewed spec. Spec changes require re-review.
5. **Learning notes on failure.** If AI produces incorrect output, document what happened, why, and the fix in the activity log.

## Key Directories

| Path | Purpose |
|------|---------|
| `.specify/memory/constitution.md` | Project governing principles |
| `.specify/specs/global/` | Global constraints (system, security, performance) |
| `.specify/specs/001-*/` | Feature specifications, plans, tasks, activity logs |
| `.specify/templates/` | spec-kit templates for specs, plans, tasks |
| `.cursor/skills/` | Agent skills (code review, SDD process) |
| `.cursor/rules/` | Cursor governance rules |

## Tech Stack

- **Language**: TypeScript
- **Framework**: Next.js
- **Database**: Prisma
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Testing**: Jest
- **Package Manager**: npm

## Code Conventions

- TypeScript strict mode — no `any`, no `@ts-ignore`
- Zod for runtime validation at API boundaries
- React Server Components by default; `"use client"` only for interactive components
- All data mutations through API route handlers in `app/api/`
- Business logic in services layer, never in route handlers or UI components
- No secrets in client-side code or source control
- All API responses follow a consistent response shape

## Governance

- **Code review skill** (`.cursor/skills/code-review.md`) checks best practices, clean code patterns, strict types, API patterns, spec compliance, and constraint violations
- **Every PR** must update at least one artifact (spec, test, doc, or governance rule)

## Spec-Kit Commands

Use these slash commands in Cursor for the SDD workflow:

- `/speckit.constitution` — View/update project principles
- `/speckit.specify` — Create feature specification
- `/speckit.plan` — Create implementation plan
- `/speckit.tasks` — Generate task breakdown
- `/speckit.implement` — Execute implementation
- `/speckit.clarify` — Clarify ambiguous requirements
- `/speckit.analyze` — Cross-artifact consistency check
- `/speckit.checklist` — Generate requirements quality checklist
- `/speckit.code-review` — Run AI code review
- `/speckit.taskstoissues` — Convert tasks to GitHub issues
