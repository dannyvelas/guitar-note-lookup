# Implementation Plan: Adopt Tailwind CSS

**Branch**: `003-adopt-tailwind-css` | **Date**: 2026-09-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-adopt-tailwind-css/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the project's hand-written stylesheet (`src/styles.css`, 194 lines) with Tailwind CSS utility classes applied directly in `src/index.html` and in the class names `src/lib/fretboard.js` assigns at runtime, with zero visible change to the app (see [research.md](research.md)). Tailwind CSS v4 is added as the project's first dependency, scoped entirely to a dev-time CSS build step (`@tailwindcss/cli`) — no JS bundler, no runtime dependency. The current design tokens (colors, spacing) and the automatic light/dark switching are ported into a Tailwind `@theme` block so utilities resolve to the exact same values as today. The compiled CSS output continues to be committed to `src/styles.css`, so the app still runs with no install step for anyone just opening or serving it; `npm install` + a build script are only needed when someone changes the styling.

## Technical Context

**Language/Version**: JavaScript (ES2020+), no transpilation — unchanged from [002-pluck-string-preview](../002-pluck-string-preview/plan.md); this feature adds a Node-based *CSS* build step only, not a JS build step.

**Primary Dependencies**: Tailwind CSS v4 (`tailwindcss` + `@tailwindcss/cli`) as devDependencies — the project's first dependency of any kind. No dependency is added to what ships to the browser; the browser still receives one plain, pre-compiled `styles.css`.

**Storage**: N/A (no persistence; unchanged)

**Testing**: Existing Node.js built-in test runner (`node --test`) is unaffected — this feature has no pure-logic surface to unit test. Visual-parity verification is manual, via [quickstart.md](quickstart.md), the same pattern feature 002 used for audio it couldn't assert on under Node.

**Target Platform**: Same modern desktop/mobile browsers as before; Tailwind's generated CSS targets standard evergreen browsers, so no new browser requirement is introduced.

**Project Type**: Single-page web application (frontend only) — extends the existing app, no new project.

**Performance Goals**: N/A at runtime (static CSS, same as today). The one new build step (`npm run build:css`) must stay fast enough to not disrupt local iteration (SC-004); Tailwind's CLI JIT scan of this project's small `src/` tree is well under a second.

**Constraints**: FR-007 rules out adopting a bundler/framework — Tailwind's standalone CLI needs only Node, which the project already requires for `scripts/serve.js`, so no new tooling category is introduced. FR-002/SC-001 require pixel-level visual parity, so Tailwind's default theme (colors, spacing scale, font stack) is *not* used as-is; the current custom properties (`--bg`, `--fg`, `--accent`, `--border`, `--disabled-bg`, `--disabled-fg`, `--error`) are carried over verbatim as Tailwind theme tokens (see [research.md](research.md) and [contracts/theme-tokens.md](contracts/theme-tokens.md)).

**Scale/Scope**: One page (`src/index.html`), one stylesheet (194 lines), and one file with runtime `className`/`classList` calls (`src/lib/fretboard.js`) are migrated. No new pages, no new features, no change to `notes.js`, `tuning.js`, `string-sound.js`, or `app.js` beyond whatever `fretboard.js` needs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template — no project-specific gates to evaluate against, same as features 001 and 002. Proceeding under the same general engineering defaults: minimize new dependencies. This feature is the first to introduce one (Tailwind), but it is confined to a dev-time CSS build step — the shipped app remains a dependency-free static page, so the project's "no runtime dependencies" posture is preserved even though its dev tooling now has one. No violations to record in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/003-adopt-tailwind-css/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── theme-tokens.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
package.json            # + tailwindcss & @tailwindcss/cli devDependencies
                         # + "build:css" / "watch:css" scripts
                         # ~ "start" now runs build:css before serving

src/
├── index.html           # ~ elements re-marked with Tailwind utility classes (same DOM structure)
├── tailwind.css          # NEW: Tailwind entry point — `@import "tailwindcss";` + `@theme` block
│                          #      porting today's :root / dark-mode custom properties
├── styles.css            # ~ becomes the committed BUILD OUTPUT of tailwind.css (generated,
│                          #    not hand-edited; header comment marks it as such)
└── lib/
    ├── app.js
    ├── fretboard.js       # ~ className/classList string literals rewritten to Tailwind utilities
    ├── notes.js
    ├── string-sound.js
    └── tuning.js

tests/                    # unchanged — no new pure logic introduced by this feature
```

**Structure Decision**: Extends the existing single static frontend project — no new project, no backend, no JS bundler. The only structural addition is `src/tailwind.css` (the new hand-edited source of truth for styling) and the `package.json`/build-script wiring needed to compile it; `src/styles.css` changes role from hand-written stylesheet to generated build artifact but keeps its path and remains committed, so `src/index.html` still works if opened or served with no install step, matching the zero-setup path documented in [002's quickstart](../002-pluck-string-preview/quickstart.md).

## Complexity Tracking

*No constitution gates were violated — see Constitution Check above. Table intentionally omitted.*
