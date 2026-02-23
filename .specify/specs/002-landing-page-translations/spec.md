# Feature Specification: Landing Page Translations

**Feature Branch**: `002-landing-page-translations`  
**Created**: 2026-02-23  
**Status**: Draft  
**Input**: User description: "analyze the landing page and add all ui translation for missing languages"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Landing Page in French (Priority: P1)

A French-speaking visitor arrives at the homepage and sees all content translated into French, allowing them to understand the value proposition of mySwissMove.

**Why this priority**: French is a major language in Switzerland and essential for reaching the target audience in the Romandie region.

**Independent Test**: Navigate to `/fr` and verify that every section (Navbar, Hero, How it Works, etc.) displays French text without any missing keys.

**Acceptance Scenarios**:

1. **Given** a visitor on `/fr`, **When** the page loads, **Then** the Hero headline displays "Plus de 90 modèles pour votre déménagement en Suisse. Téléchargement gratuit dès maintenant."
2. **Given** a visitor on `/fr`, **When** they look at the Navbar, **Then** they see "Comment ça marche", "Mes documents", and "Contact".

---

### User Story 2 - View Landing Page in Italian (Priority: P1)

An Italian-speaking visitor arrives at the homepage and sees all content translated into Italian, ensuring a seamless experience for visitors from the Ticino region.

**Why this priority**: Italian is the third national language of Switzerland and critical for full regional coverage.

**Independent Test**: Navigate to `/it` and verify that every section displays Italian text without any missing keys.

**Acceptance Scenarios**:

1. **Given** a visitor on `/it`, **When** the page loads, **Then** the Hero headline displays "Oltre 90 modelli per il tuo trasloco in Svizzera. Scaricali subito gratuitamente."
2. **Given** a visitor on `/it`, **When** they look at the Navbar, **Then** they see "Come funziona", "I miei documenti", and "Contatto".

---

### Edge Cases

- **Missing Keys**: If a translation key is missing in `fr.json` or `it.json`, it should fallback gracefully (likely to English or the key name), but the goal is 100% coverage for the landing page.
- **Text Length**: French and Italian translations often result in longer strings than German or English. The UI must handle potential text wrapping or overflow without breaking the layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide full French (`fr`) translations for all strings in the `landing` namespace.
- **FR-002**: System MUST provide full Italian (`it`) translations for all strings in the `landing` namespace.
- **FR-003**: The `landing` translation keys MUST match the structure defined in `messages/de.json` exactly.
- **FR-004**: Translations MUST be linguistically accurate and follow the professional tone established in the German/English versions.
- **FR-005**: All CTA buttons (e.g., "Kostenlos registrieren", "Login") MUST be translated consistently across all sections.

### Key Entities

- **I18n Messages**: The JSON resource files located in the `messages/` directory.
- **Landing Page Components**: The React components in `components/landing/` that consume these translations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of translation keys under `landing` in `de.json` have corresponding entries in `fr.json` and `it.json`.
- **SC-002**: Zero "missing translation" warnings in the console when viewing the landing page in French or Italian.
- **SC-003**: All UI elements on the landing page remain visually aligned and responsive with the new translations.
