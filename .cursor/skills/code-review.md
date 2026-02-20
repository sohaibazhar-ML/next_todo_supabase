# Agent Skill: Code Review

## Purpose

This skill performs a comprehensive AI code review following the AI-First SDLC governance checklist. It checks code against specs, constraints, framework best practices, clean code patterns, strict typing, and API design standards.

Execute this skill on demand or as part of the pre-merge review process.

## How to Use

Invoke this skill by asking: "Run the code review skill on [file/directory/feature]"

The agent will read the relevant files, cross-reference specs and constraints, and produce a structured review report.

---

## Review Checklist

### 0. PR Metadata & Spec Compliance

- [ ] Code traces back to a feature spec in `.specify/specs/`
- [ ] No functionality exists that is not described in the spec ("no AI invention")
- [ ] All acceptance criteria from the spec are addressed
- [ ] If behavior changed, the spec has been updated
- [ ] Constraints doc referenced and all constraints satisfied

**Action**: Read the relevant `spec.md` and `constraints.md`. For each function/component, verify it maps to a spec requirement.

---

### 1. Framework Best Practices

- [ ] Framework conventions followed (see constitution for project-specific patterns)
- [ ] Proper separation of client/server concerns (if applicable)
- [ ] No anti-patterns for the framework in use
- [ ] Error handling follows framework conventions
- [ ] Routing and middleware patterns used correctly
- [ ] Static assets and images optimized per framework guidelines
- [ ] No barrel exports that hurt tree-shaking (if applicable)

**Severity**: Warning (best practices) / Error (if spec requires it)

---

### 2. Clean Code Patterns

- [ ] **Single Responsibility**: Each function/component does one thing
- [ ] **Meaningful Names**: Variables, functions, components named for what they represent, not how they work
- [ ] **No Magic Numbers**: All numeric constants named and explained
- [ ] **DRY**: No duplicated logic (but don't over-abstract — see YAGNI)
- [ ] **KISS**: Simplest solution that meets the spec
- [ ] **Small Functions**: No function longer than 30 lines (guideline, not hard rule)
- [ ] **No Dead Code**: No commented-out code, no unused imports, no unreachable branches
- [ ] **Early Returns**: Guard clauses instead of deep nesting
- [ ] **Explicit Over Implicit**: No hidden side effects, no surprise mutations
- [ ] **No `console.log`**: Use proper logging at appropriate levels

**Severity**: Warning

---

### 3. Strict Type Checking

- [ ] No `any` type anywhere — use `unknown` with type guards if needed (typed languages)
- [ ] All function parameters have explicit types
- [ ] All function return types are explicit (no implicit inference for exported functions)
- [ ] Validation schemas used at API boundaries for runtime validation
- [ ] Discriminated unions or equivalent for state management
- [ ] Exhaustive pattern matching where applicable
- [ ] No type suppression comments without justification
- [ ] Null/undefined handled explicitly — no optional chaining for masking bugs
- [ ] Generic types used appropriately — not over-generalized

**Severity**: Error (blocking)

---

### 4. API Design Patterns

- [ ] Route handlers only parse, validate, delegate, and respond
- [ ] No business logic in route handlers — all logic in service layer
- [ ] Request body validated before any processing
- [ ] Response shape follows project conventions
- [ ] Proper HTTP status codes: 200, 201, 400, 404, 409, 500
- [ ] Error responses never expose internal details or stack traces
- [ ] Error handling wraps the entire handler with proper error response
- [ ] Content-Type validated for POST/PUT requests
- [ ] No database imports in route handler files — only service imports

**Severity**: Error (blocking for constraint violations)

---

### 5. Security Review

- [ ] All user input validated server-side (client validation is UX only)
- [ ] No PII in logs
- [ ] No secrets in source code or client bundle
- [ ] Database queries use parameterized statements / ORM
- [ ] No `eval()`, `new Function()`, or equivalent dynamic code execution
- [ ] No type safety suppressions disabling security checks
- [ ] CORS configured if API is cross-origin
- [ ] No sensitive data in URL parameters

**Severity**: Error (blocking)

---

### 6. Performance Review

- [ ] No N+1 queries or unnecessary database calls
- [ ] No blocking operations on main thread
- [ ] Images and static assets optimized
- [ ] No layout shifts from dynamic content (if applicable)
- [ ] Unnecessary re-renders or recomputations avoided
- [ ] Bundle size impact considered — no large library imports for small features

**Severity**: Warning (Error if performance constraints violated)

---

### 7. Testing Review

- [ ] Service layer functions have unit tests
- [ ] API endpoints have integration tests
- [ ] Tests are deterministic — no timing dependencies or flaky assertions
- [ ] Tests cover happy path AND error cases
- [ ] No tests that test implementation details (test behavior, not internals)
- [ ] Mock only external dependencies, not internal modules

**Severity**: Warning (Error if spec requires test coverage)

---

## Output Format

When executing this skill, produce a structured report:

```markdown
## Code Review Report — [Feature/File]

**Spec Reference**: `.specify/specs/[feature]/spec.md`
**Date**: YYYY-MM-DD
**Reviewer**: AI Agent

### Summary
[1-2 sentence overview of findings]

### Spec Deviations
- [List any functionality not in spec or missing acceptance criteria]

### Constraint Violations (BLOCKING)
- [List any violations of constraints.md or global constraints]

### Security Risks (BLOCKING)
- [List any security concerns]

### Type Safety Issues (BLOCKING)
- [List any type safety violations]

### API Pattern Issues
- [List any route handler, response format, or validation issues]

### Clean Code Suggestions
- [List any clean code improvements]

### Performance Concerns
- [List any performance issues]

### Testing Gaps
- [List any missing test coverage]

### Suggested Fixes (Minimal)
- [Specific code changes recommended, with file paths]
```

---

## Escalation Rules

If the same issue type appears:
- **2x in a sprint**: Add a lint rule or Cursor rule to catch it automatically
- **3x in a month**: Add to the project constitution as a forbidden pattern
- **Causes production incident**: Immediately add as a blocking CI gate

---

## References

- Project Constitution: `.specify/memory/constitution.md`
- Global Constraints: `.specify/specs/global/`
- Feature Constraints: `.specify/specs/[feature]/constraints.md`
- API Contracts: `.specify/specs/[feature]/contracts/`
