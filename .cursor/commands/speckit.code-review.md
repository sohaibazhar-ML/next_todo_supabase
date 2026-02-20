---
description: Run a comprehensive AI code review against specs, constraints, and constitution for a feature.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Perform a structured code review of a feature's implementation by reading the code review skill and executing it against the specified feature's source files, specs, constraints, and constitution.

## Execution Steps

### 1. Locate Feature Directory

Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse `FEATURE_DIR` from the JSON output.

If user provided a specific feature path in `$ARGUMENTS`, use that instead.
For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

### 2. Load the Code Review Skill

Read the skill file at `.cursor/skills/code-review.md`. This contains the full review checklist and output format. Follow its instructions exactly.

### 3. Load Review Context

Read the following artifacts for the feature (skip any that don't exist):

- **Spec**: `FEATURE_DIR/spec.md`
- **Plan**: `FEATURE_DIR/plan.md`
- **Constraints**: `FEATURE_DIR/constraints.md`
- **Data Model**: `FEATURE_DIR/data-model.md`
- **API Contracts**: `FEATURE_DIR/contracts/api-spec.md`
- **Constitution**: `.specify/memory/constitution.md`
- **Global Constraints**: `.specify/specs/global/system-constraints.md`

### 4. Identify Source Files to Review

From the plan and tasks, identify all source files that were created or modified for this feature. Read each one.

Typical locations:
- `src/app/` — route pages and API route handlers
- `src/components/` — React components
- `src/services/` — business logic
- `src/types/` — TypeScript types and Zod schemas
- `src/lib/` — database access and schema
- `src/middleware.ts` — middleware changes

### 5. Execute the Review Checklist

Run through all 8 sections of the code review skill checklist:

0. **PR Metadata & Spec Compliance** — Does every file trace to a spec requirement?
1. **React & Next.js Best Practices** — RSC by default, proper use of `"use client"`, etc.
2. **Clean Code Patterns** — Single responsibility, meaningful names, no dead code, etc.
3. **Strict Type Checking** — No `any`, explicit types, Zod at boundaries, etc.
4. **API Design Patterns** — Route handlers delegate to services, standard response shape, etc.
5. **Security Review** — Server-side validation, no secrets in client, parameterized queries, etc.
6. **Performance Review** — No N+1 queries, proper component splitting, etc.
7. **Testing Review** — Coverage of service and API layers

### 6. Produce the Review Report

Output the structured report as defined in the skill file's "Output Format" section:

```markdown
## Code Review Report — [Feature Name]

**Spec Reference**: `FEATURE_DIR/spec.md`
**Date**: YYYY-MM-DD
**Reviewer**: AI Agent

### Summary
### Spec Deviations
### Constraint Violations (BLOCKING)
### Security Risks (BLOCKING)
### Type Safety Issues (BLOCKING)
### API Pattern Issues
### Clean Code Suggestions
### Performance Concerns
### Testing Gaps
### Suggested Fixes (Minimal)
```

Classify each finding as:
- **BLOCKING** — Must be fixed before merge
- **WARNING** — Should be fixed, not a hard gate
- **INFO** — Improvement suggestion

### 7. Offer to Apply Fixes

If blocking issues are found, ask: "Would you like me to apply the suggested fixes?"

Wait for user confirmation before modifying any files.

## Operating Constraints

- **Read-only until user approves fixes** — Do not modify source files during the review phase
- **Constitution is non-negotiable** — Violations are always BLOCKING
- **Be specific** — Reference exact file paths, line numbers, and code snippets in findings
- **Don't invent requirements** — Only check against what the spec actually says
