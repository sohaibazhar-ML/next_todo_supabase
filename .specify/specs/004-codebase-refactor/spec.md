# Feature Specification: Codebase Refactor & Standardization

**Feature Branch**: `004-codebase-refactor`  
**Created**: 2026-02-25  
**Status**: Draft  
**Audit Report**: [audit_report.md](../../../.antigravity/brain/audit_report.md)

## Context
The project has accumulated technical debt, including mixed concerns in API routes, inconsistent type safety (`any` usage), and scattered UI patterns (inline SVGs). To ensure scalability and maintainability, a comprehensive refactor is required.

## Core Requirements *(mandatory)*

### 1. Unified Architecture
- **API Routes**: Must only handle request/response and basic orchestration.
- **Server Services**: Introduce `/services/server/` to house all Prisma logic and business rules.
- **Custom Hooks**: Business logic in components must be extracted into feature-specific hooks.

### 2. Strict Type Safety
- **Zero 'any'**: Eliminate all `any` types.
- **Zod Validation**: Implement schema validation for all API inputs and form submissions.
- **Shared Types**: Centralize all interfaces in `/types/`.

### 3. Frontend Standardization
- **Icon Library**: Move all inline SVGs to `components/ui/icons/`.
- **Constants**: Centralize all static strings, error messages, and API endpoints.

## User Stories / Acceptance Criteria

### US-001: API Route Refactor
- **Given** an API route (e.g., `/api/profiles`), **When** it receives a request, **Then** it delegates the database work to a server service and validates input via Zod.

### US-002: UI Component Cleanup
- **Given** a component with inline SVVs or complex business logic, **When** refactored, **Then** it should be presentational, using extracted hooks and shared icon components.

### US-003: Type Integrity
- **Given** the entire codebase, **When** compiled, **Then** there should be zero TypeScript errors and no `any` usages.

## Success Criteria *(mandatory)*
- All API routes follow the `Route -> Service` pattern.
- No `any` types in the project.
- No inline SVGs in components.
- Centralized constants for all strings.
- 100% build success with strict TypeScript checks.
