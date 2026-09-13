# Contract: Theme Tokens

As with [001](../../001-chord-note-lookup/contracts/note-engine.md) and [002](../../002-pluck-string-preview/contracts/string-sound.md), this app has no external API. The part of this feature worth contracting precisely is the mapping from today's hand-written CSS custom properties to Tailwind `@theme` tokens — this mapping is what FR-002/SC-001 (visual parity) depends on, and any future styling work should keep using these tokens rather than raw hex values or Tailwind's own defaults.

## Color tokens (`src/styles.css` `:root` → `src/tailwind.css` `@theme`)

| Current custom property | Light value | Dark value (`prefers-color-scheme: dark`) | New theme token | Example utilities generated |
|---|---|---|---|---|
| `--bg` | `#fafafa` | `#14161a` | `--color-app-bg` | `bg-app-bg` |
| `--fg` | `#1a1a1a` | `#eee` | `--color-app-fg` | `text-app-fg` |
| `--accent` | `#2f6fed` | `#2f6fed` (unchanged) | `--color-app-accent` | `bg-app-accent`, `text-app-accent`, `outline-app-accent` |
| `--border` | `#ccc` | `#444` | `--color-app-border` | `border-app-border` |
| `--disabled-bg` | `#eee` | `#22252b` | `--color-app-disabled-bg` | `bg-app-disabled-bg` |
| `--disabled-fg` | `#999` | `#777` | `--color-app-disabled-fg` | `text-app-disabled-fg` |
| `--error` | `#c62828` | `#c62828` (unchanged) | `--color-app-error` | `text-app-error` |

Light values are the token's default; dark values are supplied the same way Tailwind's own defaults are — inside a `@media (prefers-color-scheme: dark)` override of the same custom properties, preserving today's mechanism (FR-003) exactly rather than switching to class-based dark mode.

## Non-color values worth naming as tokens

| Concern | Current value | Notes |
|---|---|---|
| Minimum interactive size | `44px` (`min-height`/`min-width` on inputs, buttons, fret cells) | Maps to Tailwind's existing `11` spacing step (`2.75rem` = `44px`) — no custom token needed, use `min-h-11`/`min-w-11` (FR-005). |
| Base font stack | `system-ui, -apple-system, sans-serif` | Matches Tailwind's default `font-sans` stack closely enough to keep, or pin explicitly via `--font-sans` in `@theme` if any character differs after visual comparison. |

## Non-utility-expressible rule

| Current rule | Reproduction |
|---|---|
| `.fretboard__result-button { all: unset; }` | Tailwind arbitrary property: `[all:unset]` (see [research.md](../research.md)) — compiles to the identical declaration. |

## Consumers

`src/tailwind.css` declares every color row above as a `--color-app-*` token inside `@theme` (plus its dark override), which is what makes the corresponding utility class names (`bg-app-bg`, `text-app-fg`, etc.) available to `src/index.html` and to the class-name strings assigned in `src/lib/fretboard.js`. No other file needs to reference a raw hex value or Tailwind default color for anything currently styled by `src/styles.css`.
