# G1-G2 Guided Story Execution

Generated: 2026-05-09

Decision: COMPLETE

## G1 ROI / Competitive Containment

Completed:

- ROI and Competitive cards remain removed from the Story Bar.
- Run remains execution-focused and does not repeat the ROI thesis.
- ROI / Competitive content remains contained to the dedicated ROI / Competitive tab and trace export.
- Validator coverage prevents Story Bar value-card regression.

No-regression:

- Trace export still includes `roiCompetitiveReview`.
- Value support remains available, but it is a deliberate tab choice.
- No live NetSuite creation is enabled.

## G2 Guided Story From Intake To Execution

Completed:

- Added a guided step card below the Story Bar.
- The guided step changes by active tab:
  - Plan: set the demo brief.
  - Review: confirm what IDB will prepare.
  - ROI / Competitive: use only for value questions.
  - Run: guide the live demo.
  - Trace: capture and reset.
- Added a next-step button that moves consultants through the flow without needing to infer the next action.

No-regression:

- The guided step does not place ROI or competitive content back onto Plan, Review, Run, or Trace.
- Review direct build packet remains intact.
- Run Coach remains customer-aware.
- Creation remains locked.

## Next Block

G3 should add an execution plan preview that turns the direct build packet into a concise "what IDB will prepare / what consultant should verify / what the governed write path would create later" view.
