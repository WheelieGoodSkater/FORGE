# U1-U2 Guided Intake And Story-First Viewport

Generated: 2026-05-09

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Begin the next two-day UX overhaul by reducing setup friction and making the first viewport tell the consultant what to do with the entered SC request.

## U1 Guided Intake Wizard

Implemented:

- Plan tab now leads with `Guided intake`.
- Intake has three visible steps: identify account, capture pains, accept lane.
- Lane recommendation updates from customer, website, notes, objective, competitor, and decision criteria.
- Recommendation shows evidence chips instead of forcing the consultant to infer why a lane was suggested.
- Primary action is now `Use this lane and build packet`.
- Accepting the recommendation applies the lane, selects the recommended move, builds the packet, traces the event, and moves to Review.

Trace evidence:

- `lane_recommended`
- `lane_accepted`

## U2 Story-First First Viewport

Implemented:

- Story Bar now includes the value hook above the fold.
- Story Bar emphasizes customer, winning lane, proof anchor, first move, and value reason.
- Status details are moved to a compact chip row.
- Clear all remains visible but secondary to the story.

## No-Regression Confirmation

- No live writes enabled.
- No SuiteScript create state changed.
- No lane, proof anchor, or packet order changed.
- ROI / Competitive remains contained to its tab.
- Trace export remains active.

## Next Recommended Block

U3 should simplify Review further into direct build statements with collapsed detail rows.
