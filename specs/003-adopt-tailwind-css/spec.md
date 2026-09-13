# Feature Specification: Adopt Tailwind CSS

**Feature Branch**: `003-adopt-tailwind-css`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "i would like this project to start using tailwind instead of raw CSS"

## User Scenarios & Testing *(mandatory)*

<!--
  This feature has no new end-user-facing behavior — the app must look and work
  exactly as it does today. The "users" of this change are the people who
  maintain and extend this project's UI going forward.
-->

### User Story 1 - Style the app without hand-writing CSS rules (Priority: P1)

A developer working on this project's interface wants to style elements by applying utility classes directly in markup, instead of writing and maintaining new rules in a hand-authored stylesheet.

**Why this priority**: This is the core of the request — it's the reason to make the switch at all, and it must work for the migration to have any value.

**Independent Test**: Can be fully tested by adding a new small piece of UI (e.g., a button) styled entirely with utility classes and confirming no new custom CSS rule had to be written for it.

**Acceptance Scenarios**:

1. **Given** the project has adopted the utility-class styling system, **When** a developer needs to style a new element using standard spacing, color, layout, or typography, **Then** they can do so with utility classes alone, without adding a new rule to a hand-written stylesheet.
2. **Given** the migration is complete, **When** a developer inspects the project's existing screens, **Then** the styling for those screens is expressed through utility classes rather than the old hand-written stylesheet.

---

### User Story 2 - Preserve the app's current look and behavior (Priority: P1)

A person using the guitar chord transcriber app should not notice any difference in appearance or behavior after the styling system underneath it changes.

**Why this priority**: Equal priority to Story 1 — a styling migration that breaks or visibly alters the existing app is not an acceptable outcome, regardless of how clean the new styling approach is.

**Independent Test**: Can be fully tested by comparing every screen and interactive state (default, hover, focus, selected, disabled) of the app before and after the change and confirming they are visually equivalent.

**Acceptance Scenarios**:

1. **Given** the app previously rendered a given screen or state a certain way, **When** the same screen or state is viewed after the migration, **Then** it looks the same (layout, spacing, colors, borders, sizing).
2. **Given** the app currently switches between light and dark appearance based on the user's system preference, **When** the migration is complete, **Then** that automatic light/dark switching still works the same way.
3. **Given** interactive elements (fret cells, string-note inputs, the clear button, result buttons) currently have hover, focus, selected, and disabled visual states, **When** the migration is complete, **Then** each of those states still renders with the same visual treatment.
4. **Given** interactive elements currently meet a minimum touch-friendly size, **When** the migration is complete, **Then** those elements remain at least as large.

---

### User Story 3 - Keep local development simple (Priority: P2)

A developer running the project locally wants to start the app the same simple way as before, without adopting a heavy new toolchain just to see their styling changes.

**Why this priority**: Important for keeping the project approachable, but secondary to correctness of the styling itself (Stories 1 and 2).

**Independent Test**: Can be fully tested by following the project's documented steps to run the app locally and confirming styles apply correctly with no more than one additional simple step beyond what exists today.

**Acceptance Scenarios**:

1. **Given** a developer has just cloned the project, **When** they follow the documented steps to run it locally, **Then** the app displays fully styled with no manual, undocumented setup required.

---

### Edge Cases

- What happens to any visual detail from the old stylesheet that has no direct equivalent utility class (e.g., the sticky table header/result column, or the custom "unstyled button" reset)? These MUST still be achievable and MUST render the same as before.
- How does the system handle the automatic light/dark appearance switch, since it currently depends on the visitor's system-level preference rather than an in-app toggle?
- What happens on very narrow (mobile) and very wide screens — does the fretboard table's horizontal scrolling and sticky columns continue to behave the same?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST style its interface using a utility-class-based CSS system in place of the current hand-written stylesheet.
- **FR-002**: The app's visual appearance MUST remain unchanged for end users after the migration — no layout, spacing, color, or sizing regressions on any existing screen or state.
- **FR-003**: The existing automatic light/dark appearance switching (based on system preference) MUST continue to work after the migration.
- **FR-004**: All existing interactive visual states — hover, keyboard focus, selected, and disabled — MUST be preserved with equivalent visual treatment.
- **FR-005**: All interactive elements that currently meet the project's minimum touch-target sizing MUST continue to meet it after the migration.
- **FR-006**: The old hand-written stylesheet's rules MUST be replaced by the new utility-class system; any styling detail with no direct utility-class equivalent MUST still be reproduced (via the styling system's supported extension points) rather than dropped.
- **FR-007**: Running the project locally MUST remain a simple process; the change MUST NOT require contributors to adopt a heavy application bundler or framework that the project doesn't already use.
- **FR-008**: Documentation for running and building the project MUST be updated to reflect any new step introduced by the styling system (e.g., a build step needed to generate the final stylesheet).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every existing screen and interactive state (default, hover, focus, selected, disabled, light mode, dark mode) is visually indistinguishable from the pre-migration version when compared side by side.
- **SC-002**: A developer can style a newly added interface element using only utility classes, with zero new hand-written CSS rules needed, in the common case (spacing, color, layout, typography).
- **SC-003**: The project's hand-written stylesheet is eliminated except for content that the utility-class system itself generates or requires for configuration.
- **SC-004**: A developer following the project's documented setup steps can run the app locally with styling fully applied, in no more steps than exist today plus at most one new documented step.
- **SC-005**: No existing automated test regresses as a result of the migration.

## Assumptions

- The goal is a like-for-like replacement of the styling *mechanism*, not a visual redesign — the app should look the same to end users before and after.
- A small amount of configuration (e.g., a config file for the utility-class system, and/or a minimal stylesheet limited to defining the system's theme tokens and any one-off styling it cannot express) is acceptable and does not count as "raw CSS" for the purposes of this feature.
- Introducing a lightweight, dedicated build step to generate the final CSS (as most utility-class CSS systems require) is acceptable, since the project already has a documented local-run step; it should not require adopting a full application bundler or JavaScript framework, consistent with the project's current no-build, vanilla-JS approach.
- This migration covers the project's existing single page and all of its current UI (settings controls, fretboard table, buttons); it does not add any new user-facing screens or features.
