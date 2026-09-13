# Phase 0 Research: Adopt Tailwind CSS

## Decision: Tailwind CSS v4 via the standalone `@tailwindcss/cli`, not v3 and not a bundler plugin

**Rationale**: v4 is the current mainline release and configures itself in CSS (`@import "tailwindcss";` plus an `@theme` block) rather than requiring a separate `tailwind.config.js`, which keeps the footprint small for a project this size. The standalone CLI compiles `src/tailwind.css` → `src/styles.css` using only Node, which the project already requires for `scripts/serve.js` — no webpack/Vite/PostCSS pipeline needed, satisfying FR-007 (no new bundler/framework).

**Alternatives considered**:
- Tailwind v3 + `tailwind.config.js` — rejected: functionally equivalent for this project's needs, but v4's CSS-native config is simpler and is where new Tailwind projects should start.
- The Tailwind Play CDN (`<script src="...tailwindcss...">`) — rejected: compiles utilities in the browser on every page load and Tailwind's own docs call it unsuitable for anything beyond quick demos; it also can't be pinned/versioned as a devDependency the way the CLI can.
- A PostCSS pipeline via a bundler (Vite/webpack) — rejected: pulls in an entire JS build tool the project doesn't otherwise need, when the CLI alone does the one job required (compile CSS).

## Decision: Port existing custom properties into a Tailwind `@theme` block; don't adopt Tailwind's default theme

**Rationale**: FR-002/SC-001 require the app to look identical after migration. Tailwind's default color palette, spacing scale, and font stack differ from this project's current values (`--bg`, `--fg`, `--accent: #2f6fed`, `--border`, `--disabled-bg`, `--disabled-fg`, `--error: #c62828`, `system-ui` font stack). Declaring these as named tokens in `@theme` (e.g. `--color-app-accent: #2f6fed`) generates matching utilities (`bg-app-accent`, `text-app-accent`, …) that resolve to exactly today's values, so the migration only changes *how* styles are expressed, not what they compute to. See [contracts/theme-tokens.md](contracts/theme-tokens.md) for the full mapping.

**Alternatives considered**:
- Use Tailwind's built-in palette (e.g. `blue-600` in place of the current accent) — rejected: `blue-600` is a different hex value than `#2f6fed`, which would violate SC-001's visual-parity requirement; picking "close enough" defaults is exactly the redesign the spec's Assumptions rule out.

## Decision: Keep dark mode on Tailwind's default `dark:` (media-query) variant

**Rationale**: The current CSS switches theme purely via `@media (prefers-color-scheme: dark)`, with no in-app toggle. Tailwind's `dark:` variant defaults to the same `prefers-color-scheme` media query, so no extra configuration (no `dark` class toggling, no custom variant) is needed to preserve FR-003's automatic switching — it falls out of the default behavior.

**Alternatives considered**:
- Class-based dark mode (`dark` class on `<html>`, toggled by a script) — rejected: would require adding a mechanism (and likely a manual toggle control) that does not exist today; out of scope per the spec's Assumptions (like-for-like mechanism swap only).

## Decision: Commit the compiled `src/styles.css` output; only styling *changes* require the build step

**Rationale**: The project's documented zero-install path (opening or serving `src/index.html` directly with no `npm install`, established in [002's quickstart](../002-pluck-string-preview/quickstart.md)) must keep working per FR-007/SC-004 ("no more than one new documented step" — and that step should apply to *changing* styles, not to *running* the app). Committing the generated `styles.css` (marked with a header comment as generated) means a fresh clone or a simple static-file server works immediately with no build step at all; only a contributor editing styles needs to run `npm run build:css` (or `watch:css`) and commit the regenerated file.

**Alternatives considered**:
- Gitignore the generated CSS and require `npm install && npm run build:css` before the app can be run at all — rejected: turns "just running the app" into a two-step, `npm`-dependent process where today there is none, which is a strictly worse outcome than the one new *optional* step this decision produces for the smaller audience of people changing styles.
- Build the CSS at request time inside `scripts/serve.js` — rejected: adds runtime complexity (invoking the Tailwind compiler from within the dev server, or a file watcher) for no benefit over a one-line `npm run build:css` a contributor runs before committing.

## Decision: Rewrite `fretboard.js`'s dynamic `className`/`classList` string literals directly as Tailwind utility strings

**Rationale**: Tailwind's CLI scans file contents as plain text for class-name-shaped substrings; it does not need to understand JavaScript. Because every current class assignment in `fretboard.js` is a static string literal (e.g. `cell.className = 'fret-cell'`), replacing those literals with utility-class strings (e.g. `cell.className = 'border border-app-border min-w-11 h-11 text-center ...'`) is scanned correctly as long as the Tailwind content glob includes `src/**/*.js` alongside `src/**/*.html`.

**Alternatives considered**:
- Keep BEM-style custom class names in `fretboard.js` and define them with `@apply` in `tailwind.css` — rejected: this still leaves a hand-written, growing list of custom CSS rules, which is the exact thing FR-001/FR-006 ask to move away from; it would satisfy "compiles with Tailwind" but not the actual intent of the migration.

## Decision: Reproduce the `all: unset` button reset with Tailwind's arbitrary-property syntax

**Rationale**: `.fretboard__result-button { all: unset; ... }` has no direct named Tailwind utility. Tailwind supports arbitrary CSS properties via bracket syntax (`class="[all:unset]"`), which compiles to the identical declaration, giving exact parity (FR-006) without leaving a hand-written CSS rule behind.

**Alternatives considered**:
- Approximate the reset with several named utilities (`bg-transparent border-0 p-0 ...`) — rejected: `all: unset` also resets properties (e.g. `font`, `text-align` inheritance quirks across browsers) that would need to be individually enumerated and verified; the arbitrary-property form is both shorter and exact.
