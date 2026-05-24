# W25 Redwood Token UX Alignment

Generated: 2026-05-10

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Apply the detailed Redwood design-token guidance to the Intelligent Demo Builder drawer UI without changing write behavior.

## Goal

Move the drawer toward token-governed, accessible, compact enterprise UI so consultants get clearer live-demo guidance with less visual noise.

## Design Review

Reviewed `/path/to/downloads/DESIGN - Redwood.md`.

Key takeaways applied in W25:

- Application UI should consume semantic/component tokens instead of one-off styling.
- Compact enterprise density must be explicit.
- Focus, forced-colors, and reduced-motion are acceptance criteria, not late polish.
- Logical spacing should use inline/block direction where possible.
- Status styling must keep a text/shape affordance, not color alone.

## Implementation

- Added a Redwood-aligned semantic CSS variable layer inside the drawer scope.
- Added explicit `data-density="compact"` to the drawer.
- Moved key shell surfaces toward tokenized color, typography, radius, spacing, and motion.
- Added `:focus-visible` treatment for buttons, inputs, textareas, and the rail button.
- Added `prefers-reduced-motion` handling for drawer/workspace transitions.
- Added `forced-colors: active` handling for high-contrast environments.
- Preserved the Story Bar, guided step, Review, ROI / Competitive, Run, and Trace flow.

## Roles

- Consultant UX Director Agent owns live-demo readability and first-viewport clarity.
- Redwood Token Steward Agent owns token naming and semantic mapping.
- Accessibility Sentinel Agent owns focus, reduced motion, forced-colors, and non-color state affordances.
- Session State Engineer Agent owns no changes to session persistence or reset behavior.
- Validation And Evidence Agent owns validator and preflight evidence.

## No Regression

- Main drawer still does not write records.
- Main Suitelet remains `CREATE_ENABLED = false`.
- W24 pilot branch remains separate and governed.
- No Sales Order write.
- No LLM write authority.

## Follow-Up Blocks

- W26: Redwood Token Coverage Expansion - continue converting legacy raw CSS to semantic tokens and add a raw-value lint allowlist.
- W27: Five-Consultant Visual Pilot Rubric - turn the token work into a screenshot checklist for Plan, Review, ROI / Competitive, Run, and Trace.
- W28: SuiteScript Pilot Result UX - once W24 NetSuite POST evidence returns, show created Customer and Proof Item links in a compact result card.
