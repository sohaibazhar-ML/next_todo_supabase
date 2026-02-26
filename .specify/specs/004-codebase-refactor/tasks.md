# Tasks: Codebase Refactor & Standardization

## Phase 1: Foundation & Services (P1)
- [X] T001 Create `lib/validations/` and define Zod schemas for Profiles and Documents
- [X] T002 Implement `services/server/profile.service.ts` with Prisma logic
- [X] T003 Implement `services/server/document.service.ts` with Prisma logic
- [X] T004 Refactor `app/api/profiles/route.ts` to use Service + Zod
- [X] T005 Refactor `app/api/documents/route.ts` to use Service + Zod

## Phase 2: Technical Debt Clearance (P1)
- [X] T006 Remove `any` from `hooks/useOptimisticUpdate.ts` and improve generics
- [X] T007 Remove `any` from and refactor `components/DocumentList.tsx`
- [X] T008 Perform project-wide grep for `any` and replace with proper types
- [X] T009 Centralized constants for all API endpoints and common messages

## Phase 3: UI & Icon Standardization (P2)
- [X] T010 Extract inline SVG from `components/landing/SwissFlag.tsx` to `components/ui/icons/`
- [X] T011 Extract inline SVG from `components/landing/AllDocuments.tsx` to `components/ui/icons/`
- [X] T012 Standardize SVGs to accept `className`, `size`, and `color` props

## Phase 4: Verification & Cleanup (P1)
- [X] T013 Final lint and type check (`npm run lint`, `tsc --noEmit`)
- [X] T014 Remove unused imports and dead code globally
- [X] T015 Verify all core user flows (Auth, Docs, Profile)
