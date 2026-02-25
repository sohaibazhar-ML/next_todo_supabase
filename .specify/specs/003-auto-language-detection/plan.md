# Implementation Plan: Automatic Language Detection

**Branch**: `003-auto-language-detection` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Integrated country-based redirection logic for France, Italy, and Germany.

## Summary

This feature adds logic to `middleware.ts` to automatically route first-time visitors to the correct language version based on their IP location or browser language.

## Technical Context

**Platform**: Next.js (Edge Runtime)
**Locale Library**: `next-intl`
**Detection Method (Hybrid Approach)**: 
1. **IP Geolocation**: 
   - Vercel: `x-vercel-ip-country`
   - Cloudflare: `cf-ipcountry`
   - Generic: Fallback to Browser detection.
2. **Browser Preference**: Use `Accept-Language` header (standard across all hosting).
3. **Logic Mapping**: 
   - `FR` (IP) or `fr-*` (Browser) -> `/fr`
   - `IT` (IP) or `it-*` (Browser) -> `/it`
   - `DE`, `AT`, `CH` (IP) or `de-*` (Browser) -> `/de`
   - Default -> `/en`

## Proposed Changes

### [I18n Configuration]

#### [MODIFY] [routing.ts](file:///Users/apple/Desktop/ML%20Projects/next_todo_supabase/i18n/routing.ts)
- Change `defaultLocale` from `de` to `en` to ensure global visitors see the English version by default if detection fails.

### [Middleware]

#### [MODIFY] [middleware.ts](file:///Users/apple/Desktop/ML%20Projects/next_todo_supabase/middleware.ts)
- Implement custom detection logic before executing the standard `intlMiddleware`.
- Extract country/language info from headers.
- Handle redirects for root (`/`) path to the determined or default locale.

## Verification Plan

### Manual Verification
1. **Mock Headers**: Using a tool like Postman or browser headers modifier, set `x-vercel-ip-country` to `FR` and visit `/`. Verify it redirects to `/fr`.
2. **Cookie Check**: Manually switch language and verify that the `NEXT_LOCALE` cookie prevents auto-redirection on the next visit.
3. **Default Case**: Visit from an unknown country (e.g., `US`) and verify it defaults to `/en`.
