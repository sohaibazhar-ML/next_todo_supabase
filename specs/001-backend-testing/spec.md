# Feature Specification: Strict Backend Testing Infrastructure

## Overview
Establish a robust, unit-only backend testing infrastructure for the Next.js/Supabase project, ensuring compliance with the Backend Testing Constitution v1.0.0.

## Requirements

### R1: Technical Isolation
- All external dependencies (Prisma, Supabase, APIs, Env, Time) must be mocked.
- Zero infrastructure dependency for test execution.
- Tests must pass in a complete network-less environment.

### R2: Authentic Behavior Verification
- Tests must verify the actual business logic inside handlers (e.g., query construction, filtering logic, RBAC checks).
- Tests must fail if the core logic is sabotaged or modified.

### R3: Standardized API Handler Testing
- Handlers must be testable via direct invocation.
- Consistent Request mocking and Response contract validation.

### R4: Mock Integrity
- Prisma mocks must be type-safe and represent real method signatures.
- Mocks must handle runtime validation (e.g., UUID format checking) faithfully.

### R5: Exhaustive CRUD Coverage
- **GET**: Must verify filters (search, role, date range), own-profile logic, and edge cases.
- **POST**: Must verify schema validation, ID format checks, and conflict handling.
- **PUT**: Must verify RBAC (Role-Based Access Control) for role updates and subadmin restrictions.

## Success Criteria
- [x] Phase 2: Core infrastructure verified with pilot tests.
- [x] 100% coverage of all logical paths in `profiles/route.ts` (GET, POST, PUT).
- [x] Zero `any` types in test files or mocking utilities.
- [x] Successful "Sabotage Verification" (tests fail when logic is broken).
