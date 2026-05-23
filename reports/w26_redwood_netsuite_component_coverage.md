# W26 Redwood NetSuite Component Coverage

Generated: 2026-05-10

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Expand W25 Redwood token alignment with NetSuite-specific component coverage and live-demo readability guidance.

## Goal

Make IDB feel more like a compact Redwood operational surface: clearer action hierarchy, stronger scanability, visible status semantics, and less ad hoc component styling.

## Design Review

Reviewed:

- `/path/to/downloads/DESIGN - Redwood.md`
- `/path/to/downloads/netsuite-redwood-design-guide.md`

The second guide overlaps with W25 but adds practical NetSuite prompt-output guidance:

- Reduce cognitive load and help users make quick decisions.
- Use Oracle Sans with system fallbacks.
- Use semantic status colors with text/shape affordances.
- Keep dense operational surfaces compact and scannable.
- Use card elevation and hover affordances sparingly for containment and interactivity.
- Use tabular figures for operational values.

## Implementation

- Expanded the scoped `--rw-*` token layer with NetSuite guide signals:
  - Redwood brand accent.
  - link/default interactive color.
  - success, warning, danger, info, and neutral status backgrounds.
  - data visualization series tokens for workflow progress.
  - card and hover shadow tokens.
  - Oracle Sans / Oracle Sans Mono fallback stacks.
- Applied token coverage to high-use IDB surfaces:
  - tabs and progress rail.
  - Story Bar.
  - Guided Step.
  - Review packet rows.
  - ROI / Competitive cards.
  - Run coach cards.
  - chips, inputs, and action buttons.
- Preserved compact density for the drawer.
- Preserved W24 write boundaries.

## Roles

- Consultant UX Director Agent owns clarity and live-demo scanability.
- Redwood Token Steward Agent owns token consistency.
- NetSuite Component Pattern Agent owns card, row, chip, progress, and action hierarchy patterns.
- Accessibility Sentinel Agent owns non-color status meaning, focus, reduced-motion, and forced-colors.
- Validation And Evidence Agent owns validator and preflight proof.

## No Regression

- Main drawer still does not write records.
- Main Suitelet remains `CREATE_ENABLED = false`.
- W24 pilot Suitelet remains separate.
- No Sales Order write.
- No LLM write authority.

## Next

W27 should turn this into a five-consultant visual pilot rubric: one screenshot checklist for Plan, Review, ROI / Competitive, Run, Trace, and W24 pilot result handling.
