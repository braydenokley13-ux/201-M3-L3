# Front Office Draft — v2 Architecture Plan

## Current State Assessment

The v1 is a ~1,900-line vanilla HTML/CSS/JS educational simulation where users build a sports analytics department under a $10M budget, discovering synergies and secret combos to hit a score threshold. It works, it's dependency-free, and the game design is solid. The v2 shouldn't fix what isn't broken — it should deepen the experience where it matters.

---

## v2 Changes — Organized by Priority

### 1. Replace `alert()` / `confirm()` with In-Page Feedback

**Why:** Three places use blocking `alert()` dialogs (`app.js:344`, `354`, `470`) and one uses `confirm()` (`327`). These break the flow of an otherwise polished UI.

**What to do:**
- Create a lightweight toast/notification component for budget warnings and validation messages. A `<div>` that slides in from the top or bottom, auto-dismisses after 3s, with a close button.
- Replace the `confirm()` on "Clear All" with a two-step button pattern: first click changes text to "Are you sure? Click again", second click clears. No modal needed.
- Replace the clipboard `alert()` fallback with the same toast system.

**Files changed:** `app.js` (new `showToast()` function, remove 3 `alert()` calls and 1 `confirm()`), `index.html` (add toast container `<div>`), `styles.css` (toast styles + animation).

---

### 2. Stop Re-rendering All Cards on Every Selection

**Why:** `updateUI()` calls `renderOptions()` which rebuilds all 10 cards via `innerHTML` on every click (`app.js:216`). This tears down and recreates DOM nodes and event listeners unnecessarily. With 10 cards it's fine functionally, but it causes a visible flash on slower devices and is the wrong pattern.

**What to do:**
- Render cards once during `init()`.
- On state change, only toggle CSS classes (`selected`, `disabled`) on affected cards using `data-id` selectors.
- Use event delegation: one click listener on `#options-grid` instead of 10 individual listeners.

**Files changed:** `app.js` — refactor `renderOptions()` into `renderOptionsOnce()` (called in `init`) and `updateCardStates()` (called in `updateUI`). Remove `renderOptions()` from `updateUI()`.

---

### 3. Add Keyboard Navigation & Basic Accessibility

**Why:** Cards are `<div>` elements with click handlers. Keyboard-only users and screen reader users can't interact with them at all. The modals don't trap focus or announce themselves.

**What to do:**
- Add `tabindex="0"` and `role="button"` to option cards. Add `aria-pressed` to reflect selection state.
- Handle `Enter` and `Space` keypress on cards to trigger `toggleOption()`.
- Add `role="dialog"` and `aria-modal="true"` to success/failure modals. Trap focus inside modal when open. Return focus to trigger element on close.
- Add `aria-live="polite"` to the synergy list and budget display so screen readers announce changes.
- Add visually-hidden text alternatives for color-only budget indicators (e.g., "Budget: 85% used, approaching limit").

**Files changed:** `index.html` (ARIA attributes on modals), `app.js` (keyboard handlers, focus management, aria-pressed updates in `updateCardStates()`), `styles.css` (`.sr-only` class for screen-reader-only text, focus ring styles).

---

### 4. Decouple Synergy Logic from Hardcoded IDs

**Why:** The synergy checker (`app.js:156-207`) has a hardcoded special case for Culture Lead (`id === 9`) and the rules mix ID-based matching with tag-based matching with `minPeople` thresholds. Adding a new synergy type means editing branching logic. The data format should handle all the variation, not the checker function.

**What to do:**
- Normalize synergy rule format. Every synergy/anti-synergy gets a `condition` object:
  ```js
  // ID-based: all these must be selected
  { type: "all_ids", ids: [1, 6] }

  // Tag-based: at least N items with any of these tags
  { type: "min_tag_count", tags: ["tech-heavy"], minCount: 3 }

  // Category count: at least N items of a category, plus specific IDs
  { type: "id_with_category_min", ids: [9], category: "hire", minCount: 3 }
  ```
- Rewrite `checkSynergies()` as a single loop that delegates to a `matchesCondition(condition, selectedData)` function. No more `if (synergy.minPeople)` / `else if (antiSynergy.tags)` branching.
- Merge `SYNERGIES`, `ANTI_SYNERGIES`, and `SECRET_COMBOS` into a single `RULES` array with a `type` field (`"synergy"`, `"anti_synergy"`, `"secret_combo"`). This eliminates three separate loops doing the same work.

**Files changed:** `data.js` (restructure data), `app.js` (rewrite `checkSynergies()` into ~20 lines with the new matcher).

---

### 5. Fix State Persistence Gaps

**Why:** `saveState()` only persists `selectedOptions` and `totalCost`. If a user evaluates their build, sees their score, and refreshes — the score section disappears. The synergies they discovered are also gone. The state is inconsistent with what they last saw.

**What to do:**
- Persist the full state object: `selectedOptions`, `totalCost`, `scores`, `activeSynergies`, `activeAntiSynergies`, `secretCombos`, and a boolean `hasEvaluated`.
- On `loadSavedState()`, if `hasEvaluated` is true, call `displayScores()` to restore the score section.
- Recalculate `totalCost` from `selectedOptions` instead of trusting the saved value. This eliminates floating-point drift from repeated add/subtract.

**Files changed:** `app.js` — expand `saveState()` and `loadSavedState()`.

---

### 6. Replace Inline `onclick` with Delegated Events

**Why:** `updateSelectedList()` (`app.js:263`) injects `onclick="toggleOption(${option.id})"` into innerHTML. This requires `toggleOption` to be a global function and is the innerHTML + inline handler pattern that creates maintenance risk.

**What to do:**
- Use event delegation on `#selected-items`. Listen for clicks on `.remove-item` buttons, read `data-id` from the button or parent, call `toggleOption()`.
- Same pattern for the options grid (covered in item 2 above).

**Files changed:** `app.js` — update `updateSelectedList()` to use `data-id` attributes instead of `onclick`, add delegated listener in `attachEventListeners()`.

---

### 7. Add a "Scoring Breakdown" View

**Why:** Users see a final score but don't understand the formula. The scoring formula is documented only in a code comment (`data.js:238-245`). Users who fail at 6.8 don't know if they need better base impact or more synergies.

**What to do:**
- After evaluation, show a breakdown panel (reuse the existing score section styling) that shows:
  - Each selected item's individual impact contribution
  - Each active synergy/anti-synergy and its point value
  - The threshold line (7.0) with visual indication of how close they are
- Add a simple horizontal bar or number line showing `finalScore` vs `SUCCESS_THRESHOLD`.

**Files changed:** `app.js` (expand `displayScores()`), `index.html` (add breakdown container in score section), `styles.css` (threshold bar styles).

---

### 8. Add Undo (Single-Step)

**Why:** Currently users can only "Clear All" or individually click to deselect. There's no quick undo for the last action, which is frustrating when accidentally deselecting.

**What to do:**
- Maintain a `lastAction` object in state: `{ type: "select"|"deselect", optionId: N }`.
- Add an "Undo" button next to "Clear All" that reverses the last action.
- Clear `lastAction` after undo (no redo, no history stack — keep it simple).

**Files changed:** `app.js` (save last action in `toggleOption()`, add `undoLastAction()` function), `index.html` (add Undo button), `styles.css` (button styling, reuse `.btn-secondary`).

---

### 9. Wrap Critical Flows in Error Handling

**Why:** `toggleOption()`, `evaluateBuild()`, and `checkSynergies()` have no error handling. If `OPTIONS.find()` returns `undefined` (e.g., corrupted saved state references a deleted option ID), the app crashes silently.

**What to do:**
- Add a guard in `toggleOption()`: if `OPTIONS.find()` returns falsy, return early and clear the invalid ID from state.
- Add try-catch around `evaluateBuild()` with a user-facing error toast (from item 1).
- Validate `selectedOptions` IDs against `OPTIONS` during `loadSavedState()` — discard any that don't match.

**Files changed:** `app.js` — targeted guards, not blanket try-catch everywhere.

---

### 10. CSS Cleanup — Reduce Specificity & Remove Duplication

**Why:** The synergy section styles (`styles.css:883-895`) duplicate the generic sidebar card styles (`styles.css:236-241`). The `.actions-section` lives inside sidebar but isn't a styled card (it's just buttons), yet the `sidebar > div` selector applies card styling to it too.

**What to do:**
- Extract a `.card` utility class for the white/rounded/shadow pattern used by budget, selected items, synergy, and score sections.
- Apply `.card` explicitly to each section in HTML instead of relying on `.sidebar > div`.
- Remove the duplicated synergy section background/border-radius/padding/shadow since `.card` handles it.

**Files changed:** `styles.css` (add `.card` class, remove duplication), `index.html` (add `card` class to sidebar sections).

---

## What NOT to Change in v2

These are things that might seem tempting but would be over-engineering for this project:

- **Don't add a framework** (React, Vue, etc.). This is a single-page educational activity with 10 items. Vanilla JS is the right call.
- **Don't add a build system** (Webpack, Vite). Zero-config static deployment is a feature.
- **Don't add TypeScript**. The codebase is ~800 lines of JS. Type safety won't catch bugs here that reading the code doesn't.
- **Don't add a component system**. The template strings in `createOptionCard()` are fine. Web Components would add complexity for no benefit at this scale.
- **Don't add unit tests**. The value-to-effort ratio is low. The app has one meaningful algorithm (scoring), and the rest is DOM wiring. Manual testing via `window.draftApp` is appropriate.
- **Don't add a database or backend**. localStorage is sufficient for single-session persistence.
- **Don't redesign the visual UI**. The CSS is well-executed with good responsive breakpoints, animations, and color system. Polish, don't rebuild.

---

## Implementation Order

The changes above are ordered roughly by impact and dependency:

| Step | Item | Depends On |
|------|------|------------|
| 1    | Toast system (#1) | Nothing — foundational, other items use it |
| 2    | Event delegation & card rendering (#2, #6) | Nothing |
| 3    | Synergy logic refactor (#4) | Nothing |
| 4    | State persistence fix (#5) | Nothing |
| 5    | Error handling (#9) | #1 (toast for error display) |
| 6    | Accessibility (#3) | #2 (needs event delegation in place) |
| 7    | Scoring breakdown (#7) | #4 (clean synergy data helps) |
| 8    | Undo (#8) | #2 (event delegation) |
| 9    | CSS cleanup (#10) | #3 (accessibility adds `.sr-only`) |

Steps 1-4 can be done in parallel. Steps 5-9 have light dependencies as noted.

---

## Estimated Scope

- **Lines added:** ~200-300
- **Lines removed:** ~100-150
- **Net change:** ~100-150 lines added
- **Files touched:** 3 (all of them: `index.html`, `app.js`, `data.js`, `styles.css`)
- **New files:** 0
- **New dependencies:** 0
