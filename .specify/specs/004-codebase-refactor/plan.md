# Implementation Plan: Codebase Refactor & Standardization

**Branch**: `004-codebase-refactor` | **Date**: 2026-02-25 | **Spec**: [spec.md](./spec.md)

## Summary
A systematic refactor to enforce clean architecture, strict typing, and UI standardization across the project.

## Proposed Changes

### [Backend/Services]
- **[NEW] `services/server/profile.service.ts`**: Extract all Prisma logic from `/api/profiles`.
- **[NEW] `services/server/document.service.ts`**: Extract all Prisma logic from `/api/documents`.
- **[MODIFY] `/app/api/**/*`**: Refactor route handlers to use the new server services and Zod validation.

### [Frontend/UI]
- **[NEW] `components/ui/icons/IconSwissFlag.tsx`**: Extract inline SVG from `landing/SwissFlag.tsx`.
- **[MODIFY] `components/landing/AllDocuments.tsx`**: Replace inline SVG with `IconSuccess` or similar.
- **[MODIFY] `components/landing/index.ts`**: Export new icon components.

### [Types & Validation]
- **[NEW] `lib/validations/profile.schema.ts`**: Define Zod schemas for profile operations.
- **[NEW] `lib/validations/document.schema.ts`**: Define Zod schemas for document operations.
- **[MODIFY] `types/prisma.ts`**: Replace `any` with strict Prisma-generated or manual types.

### [Hooks]
- **[NEW] `hooks/useProfile.ts`**: Extract profile-related logic from components.
- **[MODIFY] `hooks/useOptimisticUpdate.ts`**: Fix `any` types and improve generic handling.

## Verification Plan

### Automated Tests
- `npm run lint`: Must pass with zero errors.
- `tsc --noEmit`: Must pass with zero type errors.
- `npm run test`: Ensure current tests still pass after reflow.

### Manual Verification
- Verify successful login/signup flow.
- Verify document upload and listing functionality.
- Verify landing page UI remains visually identical.
