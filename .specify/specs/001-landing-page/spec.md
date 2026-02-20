# Feature Specification: Landing Page

**Feature Branch**: `001-landing-page`  
**Created**: 2026-02-20  
**Status**: Draft  
**Input**: User description: "Build the frontend landing page for mySwissMove, matching the provided reference design pixel-perfectly"

## User Scenarios & Testing

### User Story 1 - View Landing Page (Priority: P1)

A visitor arrives at the homepage and sees a professional, high-conversion landing page that clearly communicates what mySwissMove offers: 90+ document templates for expats moving to Switzerland.

**Why this priority**: First impression is critical — this is the entry point for all users. Without a compelling landing page, no conversions happen.

**Independent Test**: Navigate to `/` and verify all sections render correctly, CTAs link to `/signup` and `/login`, and the page is fully responsive.

**Acceptance Scenarios**:

1. **Given** a visitor on any device, **When** they load the homepage, **Then** they see the Navbar, Hero, How-it-Works, My Documents, All Documents, and Footer sections in correct order.
2. **Given** a visitor on mobile, **When** they view the page, **Then** all sections stack vertically with appropriate spacing and readable font sizes.
3. **Given** a visitor, **When** they click "Kostenlos registrieren", **Then** they are navigated to `/signup`.

---

### User Story 2 - Navigate Sections (Priority: P2)

A visitor uses the navigation links (So geht's, My documents, Kontakt) to jump to specific sections on the landing page.

**Why this priority**: In-page navigation improves UX for users scanning the page for specific information.

**Independent Test**: Click each nav link and verify smooth scroll to the corresponding section anchor.

**Acceptance Scenarios**:

1. **Given** a visitor on desktop, **When** they click "So geht's" in the navbar, **Then** the page scrolls to the How-it-Works section.
2. **Given** a visitor on mobile, **When** they open the hamburger menu and click a link, **Then** the menu closes and the page scrolls to the target section.

---

### User Story 3 - Request Callback (Priority: P3)

A visitor fills out the callback form in the footer to request a phone call.

**Why this priority**: A secondary conversion action that adds value but is not critical for MVP launch.

**Independent Test**: Fill in Name, Phone, and preferred Time, submit the form, and verify success feedback.

**Acceptance Scenarios**:

1. **Given** a visitor, **When** they fill in Name and Phone and submit, **Then** they see a success confirmation.
2. **Given** a visitor, **When** they submit with empty required fields, **Then** they see browser-native validation prompts.

---

### Edge Cases

- What happens when JavaScript is disabled? Server-rendered sections should still display.
- How does the page handle extremely long text in translations? Layout should not break.
- Mobile menu should close when clicking outside or on an anchor link.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a sticky navbar on #f5f5f5 bg (same as hero) with logo (gray "my", red italic "swiss", gray "move" + tagline), red nav links (32px gap), rectangular bordered Login button, red filled CTA, and Swiss flag icon.
- **FR-002**: System MUST render a hero section on #f5f5f5 bg with a WHITE panel (left) containing headline (38px bold), subheadline (15px gray), red CTA button, and hero.png image (right) filling the space.
- **FR-003**: System MUST show an info bar with trust messaging below the hero.
- **FR-004**: System MUST display 3 numbered steps horizontally (number LEFT of text, not centered above) in the "How it Works" section on #f0f0f0 bg.
- **FR-005**: System MUST show "My documents" section on #edece6 bg with app-screenshot.png (left), red triangle (▲) checklist items and CTA (right).
- **FR-006**: System MUST show "All Documents" section on #f0f0f0 bg with red checkbox (☑) benefit items (left), moving-image.png (right).
- **FR-007**: System MUST render a footer with a callback form bar and footer links.
- **FR-008**: System MUST support 4 languages (DE, EN, FR, IT) via next-intl.
- **FR-009**: System MUST be fully responsive (mobile, tablet, desktop).
- **FR-010**: Components MUST be small (≤100 lines), reusable, and follow separation of concerns.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All landing page sections match the reference design on desktop and mobile viewports.
- **SC-002**: Page loads in under 3 seconds on 3G connection (Lighthouse performance > 80).
- **SC-003**: All navigation links correctly anchor-scroll to their target sections.
- **SC-004**: All CTA buttons navigate to the correct auth pages (`/signup`, `/login`).
- **SC-005**: i18n translations render correctly in all 4 supported languages.
