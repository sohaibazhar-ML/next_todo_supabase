# Implementation Plan: Landing Page Translations

**Branch**: `002-landing-page-translations` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `.specify/specs/002-landing-page-translations/spec.md`

## Summary

This feature involves adding missing UI translations for the landing page in French (`fr`) and Italian (`it`). The `landing` translation namespace, which currently exists in `de.json` and `en.json`, will be implemented in `fr.json` and `it.json`. This ensures that all sections of the landing page are fully localized for Switzerland's major language regions.

## Technical Context

**Language/Version**: TypeScript / Next.js 16
**Primary Dependencies**: `next-intl`
**Storage**: JSON message files (`messages/*.json`)
**Testing**: Manual visual verification on `/fr` and `/it` locales.
**Project Type**: Web Application (Next.js)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-First Development: Feature spec created and reviewed.
- [x] TypeScript: No TS changes required, mostly JSON updates.
- [x] Layered Architecture: Translations are managed in the `messages/` layer.
- [x] Simplicity: Direct addition of missing content without new abstractions.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/002-landing-page-translations/
├── plan.md              # This file
├── spec.md              # Feature specification
└── tasks.md             # Task breakdown
```

### Source Code

```text
messages/
├── de.json              # Source of truth for keys
├── en.json              # Completed
├── fr.json              # [TARGET] Add landing namespace
└── it.json              # [TARGET] Add landing namespace
```

**Structure Decision**: No new directories or source code files will be created. The implementation is limited to updating existing translation files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations.*
