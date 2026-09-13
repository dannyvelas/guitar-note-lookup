---

description: "Task list for feature implementation"
---

# Tasks: Adopt Tailwind CSS

**Input**: Design documents from `/specs/003-adopt-tailwind-css/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/theme-tokens.md, quickstart.md

**Tests**: Not requested — this feature has no new pure logic (see plan.md Testing). Validation is the manual walkthrough in quickstart.md, folded into the tasks below.

**Organization**: Tasks are grouped by user story per spec.md. User Story 1 ("style without hand-writing CSS") and User Story 2 ("preserve current look/behavior") are both P1 and, for this feature, inseparable — every conversion task both moves a piece of styling onto utility classes (US1) and must leave the app pixel-identical (US2's acceptance bar), so they share one implementation phase; US2 gets its own final verification task as the capstone. User Story 3 ("keep local dev simple") is delivered by the tooling decisions in Setup/Foundational and closed out with a documentation task.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Pull Request Plan (per user instruction)

Every task below is its own PR, in the exact order listed — this order **is** the stack: PR *n* merges to `main` (or the prior PR's branch) before PR *n+1* is opened, and after every single PR the app builds and looks/behaves identically to before that PR (or, for T001–T003, identically to the pre-migration app). No task needs to be bundled with another — the migration is staged (see T003) so that each subsequent conversion task touches exactly one self-contained group of selectors/consumers and deletes its own now-dead CSS, which keeps every task independently atomically mergeable. If that ever stops being true for a specific task while implementing, combine only that task with the minimum adjacent task(s) needed to keep every merge point working, and note it in that PR's description.

| PR # | Task | Depends on | Files touched |
|---|---|---|---|
| 1 | T001 | — | `package.json` |
| 2 | T002 | — | `src/tailwind.css` |
| 3 | T003 | T001, T002 | `package.json`(scripts already added)/`src/tailwind.css`, `src/styles.css` |
| 4 | T004 | T003 | `src/index.html`, `src/tailwind.css`, `src/styles.css` |
| 5 | T005 | T003 | `src/index.html`, `src/tailwind.css`, `src/styles.css` |
| 6 | T006 | T003 | `src/index.html`, `src/tailwind.css`, `src/styles.css` |
| 7 | T007 | T003 | `src/index.html`, `src/tailwind.css`, `src/styles.css` |
| 8 | T008 | T003 | `src/index.html`, `src/tailwind.css`, `src/styles.css` |
| 9 | T009 | T003 | `src/index.html`, `src/tailwind.css`, `src/styles.css` |
| 10 | T010 | T003 | `src/lib/fretboard.js`, `src/tailwind.css`, `src/styles.css` |
| 11 | T011 | T010 | `src/lib/fretboard.js`, `src/tailwind.css`, `src/styles.css` |
| 12 | T012 | T011 | `src/lib/fretboard.js`, `src/tailwind.css`, `src/styles.css` |
| 13 | T013 | T012 | `src/lib/fretboard.js`, `src/tailwind.css`, `src/styles.css` |
| 14 | T014 | T003 | `src/index.html`, `src/tailwind.css`, `src/styles.css` |
| 15 | T015 | T004–T014 | `src/tailwind.css`, `src/styles.css` |
| 16 | T016 | — (any point after T003) | `README.md` |

---

## Phase 1: Setup

**Purpose**: Bring in Tailwind's build tooling without touching anything that renders yet.

- [ ] T001 Add `tailwindcss` and `@tailwindcss/cli` as devDependencies in `package.json`; add `"build:css": "tailwindcss -i ./src/tailwind.css -o ./src/styles.css"` and `"watch:css": "npm run build:css -- --watch"` scripts; change `"start"` to `"npm run build:css && node scripts/serve.js"`. Do not run the build yet (`src/tailwind.css` doesn't exist). Run `npm install` and commit the resulting lockfile.
- [ ] T002 [P] Create `src/tailwind.css` containing only `@import "tailwindcss";` plus an `@theme { ... }` block defining every color token from `contracts/theme-tokens.md` (`--color-app-bg`, `--color-app-fg`, `--color-app-accent`, `--color-app-border`, `--color-app-disabled-bg`, `--color-app-disabled-fg`, `--color-app-error`) at their light values, with a `@media (prefers-color-scheme: dark)` override redeclaring the ones that change in dark mode. This file is not referenced by `build:css`'s output yet being used anywhere, so it changes nothing visible.

**Checkpoint**: `npm install` succeeds; the app is byte-for-byte unchanged (no build has run against real output yet).

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story task can begin until this phase is complete.

- [ ] T003 Move the entire current contents of `src/styles.css` (every existing rule, verbatim, unmodified) to below the `@import`/`@theme` block added in T002 inside `src/tailwind.css`. Run `npm run build:css` to generate `src/styles.css` (Tailwind's own utility layer is included but unused so far, contributing no visible output) and prepend it with a `/* GENERATED by \`npm run build:css\` from src/tailwind.css — do not edit directly */` header comment. Commit the compiled `src/styles.css`. This is the pivot point: styling authorship has moved from a hand-written `src/styles.css` to `src/tailwind.css`, with zero visual change, and every rule is now individually deletable/replaceable in later tasks.

**Checkpoint**: App is pixel-identical to pre-migration; `src/styles.css` is now a generated artifact; every subsequent task both adds real utility classes for one group of elements and deletes that group's now-redundant verbatim rule from `src/tailwind.css`.

---

## Phase 3: User Story 1 & 2 — Utility-class styling with zero visual change (Priority: P1) 🎯 MVP

**Goal**: Every existing screen element is styled via Tailwind utility classes instead of the hand-written rules moved into `src/tailwind.css` in T003, with the app looking and behaving exactly as before at every step.

**Independent Test**: After any single task in this phase, reload the app and compare it against the pre-migration version — everything the task's rule(s) covered should look and behave identically, and everything else is untouched (still served by its own still-present verbatim rule).

- [ ] T004 [US1] Apply utility classes to `<body>` in `src/index.html` reproducing the `*` (box-sizing) and `body` rules (margin, padding, font stack, `bg-app-bg`, `text-app-fg`); delete those two rules from `src/tailwind.css`; run `npm run build:css`; verify no visual change.
- [ ] T005 [US1] Apply utility classes to the `<header>`'s `<h1>`, each `<section>`, and each `<h2>` in `src/index.html` reproducing the `header h1`, `section`, and `h2` rules; delete those rules from `src/tailwind.css`; rebuild; verify no visual change.
- [ ] T006 [US1] Apply utility classes to the `.settings-row` divs and the `.hint` paragraph in `src/index.html` reproducing their current rules; delete those rules from `src/tailwind.css`; rebuild; verify no visual change.
- [ ] T007 [US1] Apply utility classes directly to `#tuning-preset` and `#capo-input` in `src/index.html` reproducing the shared `select, input[type='number'], input[type='text']` sizing rule; delete that rule from `src/tailwind.css`; rebuild; verify no visual change.
- [ ] T008 [US1] Apply utility classes to `#settings-error` in `src/index.html` reproducing the `.error` rule; delete that rule from `src/tailwind.css`; rebuild; verify no visual change.
- [ ] T009 [US1] Apply a utility class to `#fretboard-section` in `src/index.html` reproducing its `overflow-x: auto` rule; delete that rule from `src/tailwind.css`; rebuild; verify no visual change.
- [ ] T010 [US1] In `src/lib/fretboard.js`, replace the `table.className = 'fretboard'` assignment and the header-cell / `.fret-cell` class assignments with utility classes reproducing the `table.fretboard`, shared `th`/`td.fret-cell` border+sizing rule, and the sticky `th` rule; delete those rules from `src/tailwind.css`; rebuild; verify no visual change (including sticky-header scroll behavior).
- [ ] T011 [US1] In `src/lib/fretboard.js`, replace the `.fretboard__string-header`, `.fretboard__string-number`, and `.fretboard__string-note` class assignments with utility classes reproducing their current rules; delete those rules from `src/tailwind.css`; rebuild; verify no visual change.
- [ ] T012 [US1] In `src/lib/fretboard.js`, replace the `td.fret-cell`, `.fret-cell--disabled`, and `.fret-cell--selected` class assignments with utility classes reproducing their current rules; delete those rules from `src/tailwind.css`; rebuild; verify no visual change across default/disabled/selected states.
- [ ] T013 [US1] In `src/lib/fretboard.js`, replace the `td.fretboard__result`, `.fretboard__result-button` (using Tailwind's arbitrary-property syntax `[all:unset]` per research.md for the reset), and `.fretboard__result-cue` class assignments with utility classes, using Tailwind's `hover:`/`focus-visible:` variants to reproduce the existing `:hover`/`:focus-visible` rules; delete those rules from `src/tailwind.css`; rebuild; verify no visual change in resting, hover, and focus states.
- [ ] T014 [US1] Apply utility classes to `#clear-button` in `src/index.html` reproducing its current rule; delete that rule from `src/tailwind.css`; rebuild; verify no visual change.

**Checkpoint**: Every element in the app is styled via Tailwind utility classes. Proceed to T015 to confirm nothing was left behind.

---

## Phase 4: User Story 2 capstone — Full parity confirmation (Priority: P1)

**Goal**: Confirm the migration left no dead styling behind and that the whole app, in every state, is still visually and behaviorally identical to the pre-migration baseline.

**Independent Test**: `src/tailwind.css` contains nothing but the `@import` and `@theme` block; the full quickstart.md manual walkthrough passes with zero deviations.

- [ ] T015 [US2] Confirm `src/tailwind.css` now contains only the `@import "tailwindcss";` line and the `@theme` block from T002 (the old `:root`/dark-mode custom-property block and every other rule moved in T003 should already be gone via T004–T014's deletions — remove any stragglers found). Run `npm run build:css` and `node --test tests/` (confirms the unrelated existing test suite still passes). Perform the full manual walkthrough in `quickstart.md` (checks 1–5: light mode, dark mode, touch targets, a new utility-only test element, and narrow-screen sticky behavior).

**Checkpoint**: Migration is visually and functionally complete and verified.

---

## Phase 5: User Story 3 — Keep local dev simple (Priority: P2)

**Goal**: Anyone cloning the repo can still just run the app, and anyone changing styles knows the one new step.

**Independent Test**: A clean clone (no `node_modules`) runs via `npm start` or by opening `src/index.html` directly, fully styled, with no install step; `README.md` explains the one new step for people who *do* need to touch styling.

- [ ] T016 [US3] Add a `README.md` at the repository root (none currently exists) with a short "Development" section: `npm start` to run the app, and — only when changing styles — `npm install` once, then `npm run build:css` (or `npm run watch:css` while iterating), committing the regenerated `src/styles.css`; note that `src/styles.css` is generated from `src/tailwind.css` and must not be hand-edited. Verify quickstart.md check 6 (clean-clone zero-install run) still holds.

**Checkpoint**: All three user stories are satisfied.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T002 can run in parallel with T001 (different files); T001 alone and T002 alone are each independently safe to merge.
- **Foundational (Phase 2)**: T003 depends on both T001 and T002. Blocks every task in Phases 3–4.
- **User Story 1&2 phase (Phase 3)**: All tasks depend on T003. T004–T009 and T014 each touch only `src/index.html`; T010–T013 each touch only `src/lib/fretboard.js`. Within a shared file, tasks are sequential (each depends on the previous one in that file to avoid stacked-PR conflicts); across the two files, the index.html-group and the fretboard.js-group have no dependency on each other.
- **Phase 4**: T015 depends on all of T004–T014.
- **Phase 5**: T016 has no code dependency — it can be written any time after T003 exists (so the documented `build:css` step is accurate) but is listed last since it's the lowest-priority story.

### Parallel Opportunities

- T001 and T002 (different files, no shared state).
- The `src/index.html` conversion group (T004, T005, T006, T007, T008, T009, T014) and the `src/lib/fretboard.js` conversion group (T010, T011, T012, T013) touch disjoint files and have no functional dependency on each other — a second contributor could stack a parallel fretboard.js chain (T010→T013) alongside the index.html chain (T004→T009, T014). **Per the user's instruction this feature is being executed as a single linear stack in the exact PR order above**; this note is informational for anyone splitting the work across people.
- Tasks sharing a file (all of T004–T009+T014 in `src/index.html`; all of T010–T013 in `src/lib/fretboard.js`) are NOT marked `[P]` and must not be worked on concurrently, since concurrent edits to the same file would conflict in a stacked-PR chain.

---

## Parallel Example: Setup

```bash
# T001 and T002 touch different files and have no dependency on each other:
Task: "Add tailwindcss/@tailwindcss/cli devDependencies and build scripts in package.json"
Task: "Create src/tailwind.css with @import and the @theme token block"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 (Setup) and Phase 2 (Foundational) — T001, T002, T003. At this point the app is unchanged but fully wired to Tailwind's build.
2. Complete Phase 3 (T004–T014) — the actual utility-class conversion, one self-contained PR at a time.
3. Complete Phase 4 (T015) — confirm zero regressions and no leftover hand-written CSS.
4. **This is the full feature** — Phase 5 (T016) is a documentation nice-to-have and can ship in the same wave or slightly after.

### Incremental / Stacked Delivery (per user instruction)

Merge PRs 1 → 16 in the exact order in the Pull Request Plan table above. Each PR:

- Is opened against the tip of the previously-merged PR in the stack (or `main`/the feature branch once earlier PRs have landed).
- Leaves the app visually and functionally identical to the moment before it merged (or, for PR 16, adds only documentation).
- Needs no other PR in the stack to be "held open" alongside it — every merge point is a fully working state of the app.

---

## Notes

- `[P]` tasks = different files, no dependencies — see Parallel Opportunities above for exactly which tasks that applies to (only T001/T002 in this feature).
- Every task is its own PR (see Pull Request Plan); none required bundling with another task to stay atomically mergeable, because T003 stages the migration so each later task both adds and removes exactly one self-contained slice of CSS.
- Verify visually after every task (no automated visual-regression tooling exists in this project); `node --test tests/` remains green throughout since this feature touches no tested logic.
- Never hand-edit `src/styles.css` from T003 onward — edit `src/tailwind.css` and run `npm run build:css`.
