# Tasks: Landing Page

**Input**: Design documents from `/specs/001-landing-page/`  
**Prerequisites**: plan.md (required), spec.md (required)

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Constants, icons, and translation keys

- [x] T001 [P] Create `constants/landing.ts` with design tokens, nav links, steps, checklist, benefits, and footer link keys
- [x] T002 [P] Create `components/ui/icons/IconCheckCircle.tsx`
- [x] T003 [P] Create `components/ui/icons/IconPhone.tsx`
- [x] T004 [P] Create `components/ui/icons/IconHamburger.tsx`
- [x] T005 Add `landing` namespace to `messages/de.json` with all German translations
- [x] T006 [P] Add `landing` namespace to `messages/en.json` with all English translations

**Checkpoint**: All shared resources ready

---

## Phase 2: User Story 1 — View Landing Page (P1) 🎯 MVP

**Goal**: Visitor sees the full landing page with all sections  
**Independent Test**: Navigate to `/` and verify all sections render

### Implementation

- [x] T007 [P] [US1] Create `components/landing/Logo.tsx` — brand logo with color split
- [x] T008 [P] [US1] Create `components/landing/StepCard.tsx` — single step presentational component
- [x] T009 [P] [US1] Create `components/landing/ChecklistItem.tsx` — checklist row with icon
- [x] T010 [US1] Create `components/landing/Navbar.tsx` — sticky header with mobile menu (`use client`)
- [x] T011 [US1] Create `components/landing/HeroSection.tsx` — hero headline + image placeholder
- [x] T012 [US1] Create `components/landing/InfoBar.tsx` — trust messaging strip
- [x] T013 [US1] Create `components/landing/HowItWorks.tsx` — 3-step section using StepCard
- [x] T014 [US1] Create `components/landing/MyDocuments.tsx` — doc features with checklist
- [x] T015 [US1] Create `components/landing/AllDocuments.tsx` — benefits section with checklist
- [x] T016 [US1] Create `components/landing/Footer.tsx` — callback bar + footer links
- [x] T017 [US1] Create `components/landing/index.ts` — barrel export
- [x] T018 [US1] Modify `app/[locale]/page.tsx` — compose all sections

**Checkpoint**: Full landing page visible at `/`

---

## Phase 3: User Story 2 — Navigate Sections (P2)

**Goal**: Nav links scroll to section anchors  
**Independent Test**: Click nav links and verify scroll targets

### Implementation

- [x] T019 [US2] Verify `id` attributes on sections (`so-gehts`, `my-documents`, `kontakt`) match nav `href` anchors
- [x] T020 [US2] Test mobile menu closes after clicking a nav link

**Checkpoint**: In-page navigation functional

---

## Phase 4: User Story 3 — Request Callback (P3)

**Goal**: Visitor can submit callback form  
**Independent Test**: Fill form, submit, see success feedback

### Implementation

- [x] T021 [US3] Create `components/landing/CallbackForm.tsx` — interactive form (`use client`)
- [x] T022 [US3] Integrate CallbackForm into Footer component

**Checkpoint**: Callback form submits with visual feedback

---

## Phase 5: Polish & Cross-Cutting

**Purpose**: Final validation and cleanup

- [ ] T023 Run `npx tsc --noEmit` — zero type errors
- [ ] T024 Run `npm run lint` — zero warnings
- [ ] T025 Verify responsive layout on mobile (≤640px), tablet (768px), desktop (1200px+)
- [ ] T026 Verify i18n — switch to EN and confirm all `landing` keys render

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies — start immediately, all tasks parallel
- **Phase 2**: Depends on Phase 1 completion. T007-T009 parallel, then T010-T016 sequential (same directory), T017-T018 last
- **Phase 3**: Depends on Phase 2
- **Phase 4**: Depends on Phase 2 (Footer must exist)
- **Phase 5**: Depends on all phases

## Notes

- [P] tasks = different files, no dependencies
- Components ≤ 100 lines each
- Commit after each phase checkpoint
