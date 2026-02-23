# Tasks: Landing Page Translations

**Input**: Design documents from `.specify/specs/002-landing-page-translations/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Verify the environment and source of truth for translations.

- [x] T001 Analyze `messages/de.json` to extract all keys under the `landing` namespace
- [x] T002 [P] Verify that `messages/fr.json` and `messages/it.json` are valid JSON files

---

## Phase 2: User Story 1 - View Landing Page in French (Priority: P1) 🎯 MVP

**Goal**: Implement all French translations for the landing page.

**Independent Test**: Navigate to `/fr` and verify all landing page sections display correct French text.

### Implementation for User Story 1

- [x] T003 [US1] Add `landing` namespace to `messages/fr.json`
- [x] T004 [US1] Translate `landing.nav` keys into French
- [x] T005 [US1] Translate `landing.hero` keys into French
- [x] T006 [US1] Translate `landing.infoBar` keys into French
- [x] T007 [US1] Translate `landing.howItWorks` keys into French
- [x] T008 [US1] Translate `landing.myDocuments` keys into French
- [x] T009 [US1] Translate `landing.allDocuments` keys into French
- [x] T010 [US1] Translate `landing.callback` keys into French
- [x] T011 [US1] Translate `landing.footer` keys into French

---

## Phase 3: User Story 2 - View Landing Page in Italian (Priority: P1)

**Goal**: Implement all Italian translations for the landing page.

**Independent Test**: Navigate to `/it` and verify all landing page sections display correct Italian text.

### Implementation for User Story 2

- [x] T012 [US2] Add `landing` namespace to `messages/it.json`
- [x] T013 [US2] Translate all sub-keys in `landing` into Italian (Nav, Hero, Steps, etc.)

---

## Phase 4: Polish & Verification

**Purpose**: Ensure consistency and layout integrity.

- [ ] T013 [P] Verify JSON linting for both `fr.json` and `it.json`
- [ ] T014 Perform a final visual check on `/fr` and `/it` across mobile and desktop viewports
- [ ] T015 Check for any hardcoded strings in `components/landing/*.tsx` that might have been missed

---

## Dependencies & Execution Order

- **Phase 1** must be completed first to establish the baseline.
- **Phase 2** and **Phase 3** can be done in parallel.
- **Phase 4** requires Phase 2 and 3 completion.
