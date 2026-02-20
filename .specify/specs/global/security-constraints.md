# Security Constraints (Global)

These security rules apply to ALL features in this project.

## Input Validation

- ALL user input MUST be validated server-side with Zod schemas
- Client-side validation is for UX only — never trust it for security
- Maximum input lengths enforced at both validation and database levels
- No raw user input in database queries — always use parameterized statements or ORM

## Data Protection

- No PII (Personally Identifiable Information) in:
  - Console logs
  - Error messages returned to client
  - Client-side storage (localStorage, sessionStorage, cookies)
  - URL parameters
- Database files must not be in a publicly accessible directory

## Injection Prevention

- SQL injection: Prevented by Prisma ORM (mandatory — no raw queries without parameterization)
- XSS: Next.js default escaping — no unescaped HTML rendering
- CSRF: Use framework built-in protections
- No `eval()`, `Function()`, or dynamic code execution
- No string interpolation in database queries

## API Security

- Rate limiting consideration for POST endpoints
- CORS headers must be explicitly configured
- No sensitive data in GET request URLs or query parameters
- API responses must not leak internal error details or stack traces
- Content-Type headers must be validated on incoming requests

## Secrets Management

- No secrets, API keys, or credentials in source code
- No secrets in client-side bundle
- Environment variables for all configuration
- `.env` files in `.gitignore`

## Headers

- `X-Content-Type-Options: nosniff` header set
- `X-Frame-Options: DENY` or CSP frame-ancestors configured
- Referrer-Policy header configured

## Forbidden Patterns

- NEVER: `eval()` or equivalent dynamic code execution
- NEVER: Unescaped/unsanitized HTML rendering
- NEVER: String interpolation in database queries
- NEVER: Logging PII (emails, names, personal data)
- NEVER: Secrets as function default parameters
- NEVER: Disabled TypeScript strict checking (`// @ts-ignore`, `// @ts-nocheck`)

**Compliance**: Any security constraint violation is a BLOCKING failure and must be fixed before merge.
