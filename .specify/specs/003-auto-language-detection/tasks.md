# Tasks: Automatic Language Detection

**Input**: spec.md, plan.md

## Phase 1: Foundational

- [ ] T001 Define country-to-locale mapping in a constant file or `routing.ts`
- [ ] T002 Update `routing.ts` default locale to `en`

## Phase 2: Implementation

- [x] T003 Implement `detectLocale` utility in a server-side helper or directly in `middleware.ts`
- [x] T004 Update `middleware.ts` to use detection logic for root redirects
- [x] T005 Ensure user preference cookie takes precedence over auto-detection

## Phase 3: Verification

- [x] T006 Test with various headers (FR, IT, DE, US)
- [x] T007 Verify mobile menu language switcher still works correctly
