# Performance Constraints (Global)

These performance rules apply to ALL features in this project.

## Core Web Vitals Targets

| Metric | Target | Hard Limit |
|--------|--------|------------|
| Largest Contentful Paint (LCP) | < 2.0s | < 2.5s |
| First Input Delay (FID) | < 50ms | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.05 | < 0.1 |
| First Contentful Paint (FCP) | < 1.5s | < 2.0s |
| Time to Interactive (TTI) | < 3.0s | < 3.5s |

## Server Performance

- API response time: < 200ms for simple queries
- API response time: < 500ms for complex operations
- Database query time: < 50ms per query
- No N+1 query patterns

## Client Performance

- JavaScript bundle size: < 100KB gzipped for initial load
- No blocking async calls during initial render
- Images and static assets optimized
- No layout shifts after first paint
- Fonts loaded with `display: swap` or `display: optional`
- No synchronous operations on the main thread > 50ms

## Rendering

- Server-side rendering (SSR) or Static Site Generation (SSG) for content pages
- React Server Components by default — client components only for interactive elements
- No unnecessary re-renders — memoize expensive computations
- Use `next/image` for all images

## Forbidden Performance Patterns

- NEVER: Unoptimized images served directly
- NEVER: Importing entire libraries when only a subset is needed
- NEVER: Inline scripts that block rendering
- NEVER: CSS that causes layout shift after load
- NEVER: Client-side JavaScript for content that can be server-rendered

## Monitoring

- Bundle size tracked and budgeted (if applicable)
- API response times logged for monitoring

**Compliance**: Hard limit violations are blocking failures. Target violations require documented justification.
