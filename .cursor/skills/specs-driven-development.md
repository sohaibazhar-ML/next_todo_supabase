# Agent Skill: Specs-Driven Development (SDD) Process Guide

## Purpose

This skill guides developers through the complete Specs-Driven Development lifecycle using GitHub's spec-kit. Follow this process for every new feature, from idea to deployed code. The SDD methodology ensures that AI-generated code is governed by specifications, not ad-hoc prompts.

## When to Use

Invoke this skill when:
- Starting a new feature
- Onboarding to the SDD process
- Reviewing whether a feature followed the correct workflow
- Training team members on AI-first development

**Trigger phrases**: "Start a new feature", "Follow the SDD process", "Guide me through spec-kit workflow"

---

## The SDD Workflow (8 Steps)

### Step 1: Read the Constitution

**What**: Before any work, read `.specify/memory/constitution.md` to understand the project's immutable principles.

**Why**: The constitution defines what is ALWAYS true about the project (tech stack, architecture, coding standards). Every decision must comply.

**Action**:
```
Read file: .specify/memory/constitution.md
```

**Example from this project**: Our constitution mandates:
- React Server Components by default
- Strict TypeScript (no `any`)
- Layered architecture (UI → Service → Data)
- SQLite via better-sqlite3 (server-only)
- All mutations through API routes

If a developer tries to add `"use client"` to a component that doesn't need interactivity, the constitution catches it. If they try to import the database from a component, the constitution blocks it.

---

### Step 2: Write the Feature Specification

**What**: Create a spec in `.specify/specs/[###-feature-name]/spec.md` using the spec-kit template.

**Why**: The spec is the source of truth. It defines WHAT to build and WHY, not HOW. AI generates code FROM this spec — garbage spec = garbage code.

**Template**: `.specify/templates/spec-template.md`

**Key sections**:
1. **User Scenarios & Testing** — User stories with priorities (P1, P2, P3), each independently testable
2. **Acceptance Scenarios** — Given/When/Then format for each story
3. **Edge Cases** — What happens when things go wrong
4. **Requirements** — Functional requirements with IDs (FR-001, FR-002...)
5. **Success Criteria** — Measurable outcomes (SC-001, SC-002...)

**Example from Waitlist Feature (002)**:
```markdown
### User Story 1 — Submit Waitlist Signup (Priority: P1)

A visitor fills out the waitlist form with their name, email, company (optional),
and role (optional), then clicks "Join Waitlist".

**Acceptance Scenarios**:
1. Given the form is visible, When I enter valid name and email and click "Join Waitlist",
   Then my data is saved to the database and I see a success confirmation
2. Given I submit with an empty name field, When I click "Join Waitlist",
   Then I see a validation error "Name is required"
5. Given I already signed up with "alice@example.com", When I try again,
   Then I see "This email is already on the waitlist"
```

**Spec-kit command**: `/speckit.specify`

---

### Step 3: Define Constraints

**What**: Create `.specify/specs/[###-feature-name]/constraints.md` listing what must NEVER happen.

**Why**: Constraints are hard gates. They prevent categories of bugs by defining forbidden patterns. Specs say what to build; constraints say what NOT to do.

**Key categories**:
- Architectural constraints (layer violations, forbidden imports)
- Security constraints (input validation, PII handling)
- Performance constraints (response times, bundle size)
- UX constraints (accessibility, mobile responsiveness)
- Forbidden patterns (specific code patterns that are banned)

**Example from Waitlist Feature**:
```markdown
## Forbidden Patterns
- NO fetch() in the form component that bypasses the service layer on the server
- NO console.log(email) or logging PII
- NO any type in Zod schemas, API handlers, or service functions
- NO inline SQL strings — only parameterized queries via better-sqlite3
```

**Also reference global constraints**: `.specify/specs/global/system-constraints.md`, `security-constraints.md`, `performance-constraints.md`

---

### Step 4: Design Data Model & API Contract (if applicable)

**What**: Create `data-model.md` with database schema and `contracts/api-spec.md` with request/response formats.

**Why**: These are the "executable" parts of the spec. They're precise enough for AI to generate correct code on the first try.

**Example data model**:
```sql
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL CHECK(length(name) >= 2 AND length(name) <= 100),
  email       TEXT    NOT NULL UNIQUE,
  company     TEXT,
  role        TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

**Example API contract**:
```
POST /api/waitlist
  Request:  { name: string, email: string, company?: string, role?: string }
  Success:  201 { success: true, data: WaitlistEntry }
  Invalid:  400 { success: false, error: "Validation failed", details: [...] }
  Duplicate: 409 { success: false, error: "This email is already on the waitlist" }
```

---

### Step 5: Create the Implementation Plan

**What**: Create `.specify/specs/[###-feature-name]/plan.md` with technical decisions and file structure.

**Why**: The plan bridges the WHAT (spec) and the HOW (code). It makes architectural decisions explicit and verifiable.

**Key sections**:
- Constitution check (verify compliance before coding)
- Technical context (language, dependencies, storage, testing)
- Project structure (exact file paths)
- Data flow diagram

**Spec-kit command**: `/speckit.plan`

---

### Step 6: Break into Tasks

**What**: Create `.specify/specs/[###-feature-name]/tasks.md` with ordered, actionable work items.

**Why**: Tasks are the implementation blueprint. They define exact file paths, execution order, and parallel opportunities.

**Task format**: `[ID] [P?] [Story] Description with exact file path`

**Example**:
```markdown
## Phase 2: Foundational
- [ ] T003 [P] Create src/lib/db.ts — SQLite connection singleton with WAL mode
- [ ] T004 [P] Create src/types/waitlist.ts — WaitlistEntry type, Zod schemas

## Phase 3: User Story 1 — Submit Waitlist (P1)
- [ ] T006 [US1] Create src/services/waitlist.service.ts — addWaitlistEntry(), getAllWaitlistEntries()
- [ ] T007 [US1] Create src/app/api/waitlist/route.ts — POST handler
```

**Rules**:
- Types before services
- Services before route handlers
- Route handlers before UI components
- Each phase has a checkpoint

**Spec-kit command**: `/speckit.tasks`

---

### Step 7: Implement Following the Plan

**What**: Execute tasks in order, writing code that traces back to the spec.

**Why**: This is where AI generates code. Because the spec, constraints, data model, and plan are precise, AI can produce correct, governance-compliant code.

**Implementation rules**:
1. Follow task order strictly
2. Reference spec user stories in code comments
3. Check governance after each phase: `npx tsc --noEmit && npx eslint . && npx prettier --check .`
4. Never invent functionality not in the spec
5. If you encounter ambiguity, mark `[NEEDS CLARIFICATION]` and stop

**Spec-kit command**: `/speckit.implement`

**Example code comment tracing to spec**:
```typescript
/**
 * Add a new entry to the waitlist.
 *
 * Spec: US-002 — Submit Waitlist Signup
 * Contract: POST /api/waitlist → 201 Created
 */
export function addWaitlistEntry(data: WaitlistFormData): WaitlistEntry {
```

---

### Step 8: Review and Document

**What**: Run the code review skill and create the activity log.

**Why**: The review verifies spec compliance and constraint adherence. The activity log becomes training material for the team.

**Actions**:
1. Run the code review skill: "Run the code review skill on this feature"
2. Fix any issues found
3. Create `.specify/specs/[###-feature-name]/activity-log.md` documenting:
   - Steps taken
   - Decisions made (with rationale)
   - Issues encountered (with fixes)
   - Governance check results
   - Spec compliance checklist

**Code review skill**: `.cursor/skills/code-review.md`

---

## Quick Reference: File Structure for a Feature

```
.specify/specs/[###-feature-name]/
├── spec.md           ← Step 2: What to build and why
├── constraints.md    ← Step 3: What must never happen
├── data-model.md     ← Step 4: Database schema (if applicable)
├── contracts/
│   └── api-spec.md   ← Step 4: API contracts (if applicable)
├── plan.md           ← Step 5: How to build it
├── tasks.md          ← Step 6: Ordered task list
└── activity-log.md   ← Step 8: Implementation journal
```

## Quick Reference: Spec-Kit Commands

| Command | Phase | Input | Output |
|---------|-------|-------|--------|
| `/speckit.constitution` | Setup | - | `constitution.md` |
| `/speckit.specify` | Step 2 | User description | `spec.md` |
| `/speckit.plan` | Step 5 | `spec.md` | `plan.md` |
| `/speckit.tasks` | Step 6 | `plan.md` + `spec.md` | `tasks.md` |
| `/speckit.implement` | Step 7 | `tasks.md` | Source code |
| `/speckit.clarify` | Any | `spec.md` | Clarification questions |
| `/speckit.analyze` | Pre-implement | All artifacts | Consistency report |

## Anti-Patterns to Avoid

1. **Vibe Coding**: Writing code without a spec → unpredictable, unreviewable output
2. **Spec-After-Code**: Writing the spec to match code you already wrote → defeats the purpose
3. **Ignoring Constraints**: Treating constraints as suggestions → bugs that governance was supposed to prevent
4. **Inventing Beyond Spec**: AI adds features not in the spec → scope creep, untested behavior
5. **Skipping Activity Log**: Not documenting what happened → lost learning, repeated mistakes

## References

- Constitution: `.specify/memory/constitution.md`
- Global Constraints: `.specify/specs/global/`
- Code Review Skill: `.cursor/skills/code-review.md`
- Governance Rules: `.cursor/rules/governance.mdc`
- spec-kit Templates: `.specify/templates/`
- Theory: `docs/GUIDE.md` (team training guide)
