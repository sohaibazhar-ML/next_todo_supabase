# Implementation Plan: Backend Testing Infrastructure

## Goal
Implement a robust rendering of the Backend Testing Specification, prioritizing total isolation and dependency mocking.

## Proposed Changes

### [Mocking Infrastructure]
- **Prisma**: Deep mock using `jest-mock-extended` in `lib/__mocks__/prisma.ts`.
- **Supabase**: Global mock in `jest.setup.ts`.
- **Global Setup**: `jest.setup.ts` to handle env, auth, and navigation mocks.

### [Standard Utilities]
- **Handler Utils**: `test/utils/handler-utils.ts` for `createMockRequest` and `validateResponse<T>`.
- **Time/Randomness**: Support for `jest.useFakeTimers()` in utilities.

### [Pilot Implementation: Profiles API]
Implement exhaustive, authentic tests for `app/api/profiles/route.ts`.

#### GET: Fetching & Filtering
- Authorized vs Unauthorized access (401).
- Own profile vs other profile (Admin checks) (200/403).
- Filter verification: `role`, `search`, and `DateRange` query params.
- Error path: `Profile not found` (404).

#### POST: Validation & Creation
- Required field validation (400).
- Valid UUID format enforcement (400).
- Username/ID conflict prevention (400).
- Successful creation with ISO date serialization (201).

#### PUT: Updates & Guardrails
- Generic fields update (200).
- RBAC: Non-admins cannot change roles (403).
- Logic: Subadmin role transition restrictions (400).

## Verification Plan

### Automated
- `npx jest` to run all suites.
- TypeScript check (`tsc --noEmit`) to verify mock types.

### Manual
- **Sabotage Check**: Break the RBAC logic in `profiles/route.ts` and verify test failure.
