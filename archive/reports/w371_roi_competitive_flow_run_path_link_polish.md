# W371: Consultant ROI/Competitive Flow Redesign And Run Path Link Polish

W371 responds to the user-provided W369 Bayview review trace and screenshots. The trace was run on Drawer 1.0.15 / W369, before W370 Parts/Service was installed, so it is treated as UX evidence rather than the current lane-classification baseline.

No live smoke was run in W371.

## Review Findings

- ROI / Competitive was leading with five boxed decision chips. The density was useful, but the layout read like a coaching report instead of a day-of-demo consultant flow.
- The consultant needed the tab to answer, in order: what to say, what to ask, what to prove, what value matters most, where to objection-handle, and what claim caution applies.
- The Run tab's numbered NetSuite path looked much better after W368, but steps 1-4 still read like static object labels rather than direct Open actions.
- Selected script and Live Script First repeated too much of the same paragraph.

## Scoped Change

- Drawer marker advances to `Drawer 1.0.17 / W371`.
- ROI / Competitive now opens with a flow-first surface:
  - Talk track.
  - Discovery.
  - Proof move.
  - Largest value to prove.
  - Objection handle.
  - Claim caution.
- The old decision-card grid is removed from the top read and the long evidence/audit material stays collapsed lower.
- Run NetSuite path nodes are clickable Open links only when verified link authority exists.
- If link authority is not verified, the path step renders as a non-clickable state with the authority reason.
- Selected script now points to the active Say / Show / Close steps instead of repeating the full Say paragraph.

## Pass / Fail Table

| Gate | Result | Evidence |
| --- | --- | --- |
| ROI/Competitive flow readability | PASS | First visible ROI / Competitive surface uses flow rows, not a box-grid of decision chips. |
| Talk track/discovery/proof-first layout | PASS | Talk track, Discovery, and Proof move appear before ROI and competitive detail. |
| Largest-value-to-prove clarity | PASS | The ROI row is labeled `Largest value to prove` and includes baseline capture guidance. |
| Competitive objection/watch-out clarity | PASS | The competitive row is labeled `Objection handle` and keeps competitor pressure advisory-only. |
| Repetition reduction | PASS | Selected script no longer repeats the full Say paragraph already shown in Say / Show / Close. |
| Run path clickable Open-link preservation | PASS | Numbered NetSuite path steps become anchors only when verified Open URL authority exists. |
| Claim safety | PASS | Measured savings still require a customer-confirmed baseline; competitor claims remain advisory unless confirmed. |
| Confidence separation | PASS | Public website evidence, N/LLM advisory, build/import proof, and Open-link authority remain separate. |
| No fake Open links | PASS | Non-verified path steps render as unavailable states rather than anchors. |
| No-regression gates | PASS | No runner, adapter, source lane pack, record creation, transaction write, or completed-result validation behavior changed. |

## Smoke-Minimizing Expansion Plan Note

- W371 remains fixture/trace-review only.
- Future industry expansion continues fixture-first.
- Live smoke is only required when runner/import/Open-link integration risk changes.
- UI flow polish, copy cleanup, lane-story polish, and collapsed support-detail adjustments should continue through fixtures and locked traces.

## Recommendation

Lock ROI/Competitive flow redesign and Run path link polish. Continue fixture-first industry expansion after W371 without live smoke unless a future change introduces real integration risk.
