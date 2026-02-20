# Implementation Plan: Landing Page

**Branch**: `001-landing-page` | **Date**: 2026-02-20 | **Spec**: [spec.md](file:///c:/Users/Microsoft/Desktop/NextJs/next_todo_supabase/.specify/specs/001-landing-page/spec.md)

## Summary

Build the mySwissMove landing page as a composition of small, reusable React components following the reference design. The page is a Server Component composite that delegates interactivity (mobile menu, callback form) to Client Components.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)  
**Primary Dependencies**: Next.js 16 (App Router), next-intl 4, Tailwind CSS 4  
**Storage**: N/A (no backend for landing page)  
**Testing**: Visual verification + Lighthouse  
**Target Platform**: Web (all modern browsers, responsive)  
**Project Type**: Web application (Next.js)  
**Performance Goals**: Lighthouse > 80, LCP < 2.5s  
**Constraints**: Components ≤ 100 lines, no `any` types, reusable design  

### Design Tokens (from reference)

| Token | Value | Usage |
|-------|-------|-------|
| Primary Red | `#e62e2d` | CTAs, nav links, logo "swiss", markers |
| Section Gray BG | `#f5f5f5` | Navbar + Hero background |
| How-it-Works BG | `#f0f0f0` | Steps + AllDocuments background |
| MyDocuments BG | `#edece6` | Warm beige section |
| Footer BG | `#666` | Dark charcoal footer |
| Body Text | `#333` | Headlines |
| Muted Text | `#777` | Subheadlines |
| Logo "my"/"move" | `#888` | Gray, normal weight |
| Logo "swiss" | `#e62e2d` | Red, bold italic |
| Nav link gap | `32px` | Between nav items |
| Navbar height | `80px` | Sticky header |
| Hero headline | `38px` | Bold, on white card |
| Hero subheadline | `15px` | Gray, on white card |  

## Constitution Check

| Gate | Status |
|------|--------|
| Spec-First Development | ✅ Spec written before code |
| TypeScript strict mode | ✅ Will enforce |
| Layered Architecture | ✅ components/landing/ for UI, constants/ for data |
| Simplicity & YAGNI | ✅ Only what the spec requires |
| Next.js Conventions | ✅ RSC by default, `use client` only where needed |

## Project Structure

### Documentation (this feature)

```text
specs/001-landing-page/
├── spec.md           # Feature specification
├── plan.md           # This file
└── tasks.md          # Task breakdown
```

### Source Code (repository root)

```text
components/
├── landing/
│   ├── index.ts              # Barrel export
│   ├── Logo.tsx              # Brand logo (≤20 lines)
│   ├── Navbar.tsx            # Sticky header with mobile menu (client)
│   ├── HeroSection.tsx       # Hero with headline + image placeholder
│   ├── InfoBar.tsx           # Trust messaging strip
│   ├── StepCard.tsx          # Single step card (presentational)
│   ├── HowItWorks.tsx        # 3-step section
│   ├── ChecklistItem.tsx     # Reusable checklist row
│   ├── MyDocuments.tsx       # Document features section
│   ├── AllDocuments.tsx      # Benefits section
│   ├── CallbackForm.tsx      # Interactive form (client)
│   └── Footer.tsx            # Callback bar + footer links
├── ui/icons/
│   ├── IconCheckCircle.tsx   # Checkmark icon (new)
│   ├── IconPhone.tsx         # Phone icon (new)
│   └── IconHamburger.tsx     # Menu icon (new)

constants/
└── landing.ts                # Design tokens, nav links, steps, benefits

messages/
├── de.json                   # + `landing` namespace
└── en.json                   # + `landing` namespace

app/[locale]/
└── page.tsx                  # Composed landing page (modified)
```

**Structure Decision**: All landing components go in `components/landing/` with a barrel export. Constants are centralized in `constants/landing.ts`. Translation keys use a `landing` namespace in all locale files. The main page (`app/[locale]/page.tsx`) simply composes sections — no logic.
