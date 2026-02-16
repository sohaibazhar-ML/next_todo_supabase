# Next.js Todo Supabase Constitution

## Core Principles

### I. Exclusive Backend testing
Backend behavior must be verified using automated tests written in Jest. Frontend and UI testing are explicitly out of scope for this architecture. All core logic must reside in or be accessible to backend handlers and services.

### II. Total Isolation & Mocking (NON-NEGOTIABLE)
All external dependencies MUST be mocked. This includes databases, Prisma Client, Supabase, internal/external services, utilities, network calls, file system access, environment variables, time, randomness, and generated IDs. Tests must run in a "vacuum" without any dependency on the outside world.

### III. Strict Unit Focus
No integration, database, or end-to-end tests are permitted. Specifications that cannot be verified without real infrastructure are considered invalid. Tests must be fast, deterministic, and isolated.

### IV. Authentic Behavior Verification
Tests must be behavior-driven and authentic. They must fail when business logic, control flow, error handling, or public contracts change. Shallow replicas or always-green tests that do not exercise logic are unacceptable. Trivial assertions and snapshot tests are disallowed.

### V. Prisma Mock Integrity
Prisma Client mocks must always be used and must respect real method names, input arguments, and return data shapes. Mocks must act as faithful representations of the database layer to ensure contract safety without a real database connection.

## Development Constraints

- Internal implementation details (private methods, non-exported logic) must not be tested or mocked directly to avoid brittle tests.
- API routes must be tested via direct handler invocation.
- Assertions must validate both status codes and response contracts.
- Code without meaningful, authentic tests is considered incomplete and will fail compliance checks.

## Execution Standards

- Tests must be side-effect free and capable of running in parallel.
- Spec Kit analysis will flag unverifiable behavior, missing tests, or non-authentic verification patterns.
- Environment variables, time (timers), and randomness (Math.random, UUIDs) must be controlled via global or local mocks.

## Governance

This constitution defines non-negotiable constraints for all future development. It supersedes all other documentation. Amendments require documentation, unanimous agreement, and a major version update. All development must be validated against these principles by the Spec Kit.

**Version**: 1.0.0 | **Ratified**: 2026-02-13 | **Last Amended**: 2026-02-13
