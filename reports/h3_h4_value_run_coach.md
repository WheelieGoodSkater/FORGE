# H3-H4 ROI / Competitive Review And Run Coach

Generated: 2026-05-09

Decision: COMPLETE

## H3 ROI / Competitive Review

Implemented:

- Added a dedicated `ROI / Competitive` workflow tab.
- Added a `valueReviewPacket` model that derives:
  - Business pain.
  - ROI thesis.
  - Value agenda.
  - NetSuite proof path.
  - Competitive review.
  - Objection handling.
  - Discovery questions.
- Added the value review packet to trace export as `roiCompetitiveReview`.

No-regression:

- Competitive copy stays workflow-based unless verified competitor facts are available.
- Value content is advisory and does not change lane authority, proof anchor, or creation state.
- Story Bar remains concise.

## H4 Run Coach

Implemented:

- Replaced generic live-control labels with:
  - `Open`
  - `Prove`
  - `Handle objection`
  - `Close value`
- Added a top-three-moves live coach in Run:
  - Open with customer pain.
  - Prove the selected proof anchor.
  - Close on ROI value.
- Run coach now uses customer notes, selected lane, product signal, page context, and recommendation.

No-regression:

- `story_action_selected` trace remains active.
- Guardrails remain visible in Run.
- Recommended move still works.
- No live NetSuite writes are enabled.

## Next Block

H5 should focus on interaction and color polish: stronger Redwood-aligned selected states, progress affordance, and lower first-viewport clutter now that value and run coaching have their own surfaces.
