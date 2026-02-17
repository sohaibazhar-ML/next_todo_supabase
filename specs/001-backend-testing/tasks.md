# Task Checklist: Backend Testing

## Infrastructure (Phase 2)
- [x] Set up Jest with TypeScript and Module Aliases
- [x] Implement global mocking for Prisma Client
- [x] Implement global mocking for Supabase Client
- [x] Create API handler test utilities
- [x] Setup zero-dependency validation

## Core API Handler Tests (Phase 3)
- [x] Test Profile fetching, creation, and updates (app/api/profiles)
    - [x] GET: Auth & Basic retrieval
    - [x] GET: Filtering (Date range, Role)
    - [x] GET: Edge cases (404, 500)
    - [x] POST: Validation & Conflicts
    - [x] POST: Creation & Serialization
    - [x] PUT: RBAC & Role Restrictions
    - [x] PUT: Successful updates
- [x] Test Document listing and search (app/api/documents)
- [x] Test Document upload and conversion handlers
- [x] Test Authentication flows and callbacks
- [x] Test Admin dashboard statistics APIs
- [x] Test User management APIs

## Service Layer & Logic (Phase 4)
- [x] Test Google Docs action logic with mocked Drive API
- [x] Test Prisma-based service function business logic
- [x] Test utility functions (formatting, normalization)

## Verification & Compliance (Phase 5)
- [ ] Sabotage business logic to verify test failure
- [ ] Establish "Zero Infrastructure" baseline CI check
- [ ] Final compliance review against Constitution
