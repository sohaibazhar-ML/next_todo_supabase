# Feature Specification: Automatic Language Detection

**Feature Branch**: `003-auto-language-detection`  
**Created**: 2026-02-23  
**Status**: Draft  
**Input**: "Detect IP or browser language and auto-select FR, IT, or DE. Default to EN for others."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visit from France (Priority: P1)
A user visiting the site from France (or with a French browser) should be automatically redirected to the `/fr` version of the site upon their first arrival at `/`.

**Acceptance Scenarios**:
1. **Given** a user with a French IP/Browser, **When** they visit `myswissmove.ch/`, **Then** they are redirected to `myswissmove.ch/fr`.

---

### User Story 2 - Visit from Italy (Priority: P1)
A user visiting the site from Italy (or with an Italian browser) should be automatically redirected to the `/it` version.

---

### User Story 3 - Visit from Germany (Priority: P1)
A user visiting the site from Germany (or with a German browser) should be automatically redirected to the `/de` version.

---

### User Story 4 - Visit from Other Countries (Priority: P1)
A user visiting from any other region (e.g., USA, UK, Spain) should default to the `/en` version.

---

### Edge Cases
- **Manual Override**: If a user manually switches language via the switcher, their choice should be remembered (cookie), overriding the auto-detection.
- **VPNs**: IP detection will reflect the VPN location, not the user's actual physical location.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: Implement logic to detect user country via IP (x-vercel-ip-country header or similar).
- **FR-002**: Map country codes to locales (FR -> fr, IT -> it, DE -> de, AT/CH -> de/fr/it as appropriate).
- **FR-003**: Fallback to `en` for any country not explicitly mapped.
- **FR-004**: Integrate detection logic into `middleware.ts`.
- **FR-005**: Ensure local development still works (likely defaulting to `en` or `de`).

## Success Criteria *(mandatory)*
- **SC-001**: 100% accurate redirection for tested IP country headers.
- **SC-002**: Redirect occurs before the page content is rendered (server-side).
- **SC-003**: User's manual language choice is persistent via cookies.
