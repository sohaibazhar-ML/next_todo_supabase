# System Constraints (Global)

These rules apply to ALL features in this project.

## Architecture

- Clear separation of UI, service, and data layers
- No circular dependencies between modules
- One-directional data flow: UI -> Service -> Data
- No cross-feature imports without explicit shared module
- All shared types live in a dedicated types directory
- All database access isolated in a dedicated data layer

## Technology Stack

- **Language**: TypeScript
- **Framework**: Next.js
- **Database**: Prisma
- **Styling**: Tailwind CSS (no other CSS solutions)
- **Validation**: Zod for runtime type checking at API boundaries

## Code Organization

- Feature code organized by domain, not by technical layer
- Component files use PascalCase: `UserForm.tsx`
- Non-component files use camelCase: `user.service.ts`
- One component/class per file (no barrel exports that hurt tree-shaking)
- Index files only for explicit public API of a module

## Error Handling

- All errors must be caught and handled — no unhandled rejections or uncaught exceptions
- API routes must return structured error responses, never raw exceptions
- Client-facing errors must have graceful degradation
- Errors must be typed — use discriminated unions or typed error classes, not string messages

## Data Integrity

- All database operations use transactions when modifying multiple records
- Unique constraints enforced at database level, not just application level
- Timestamps generated server-side, never client-side
- No partial writes — operations succeed completely or fail completely

## Dependencies

- Minimize external dependencies — prefer built-in features
- No dependency without explicit justification
- Pin exact versions in dependency files
- No dependencies with known security vulnerabilities

## Environment

- Configuration via environment variables
- No hardcoded URLs, ports, or credentials
- Sensible defaults for local development

**Compliance**: Violating any system constraint is a hard PR failure. No exceptions without constitution amendment.
