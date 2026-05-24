# P8 Consultant UX Redesign

Generated: 2026-05-09

Decision: COMPLETE

## Objective

Make the drawer feel like a consultant cockpit instead of a stacked document. The experience should help the consultant tell the story, see the value, review the build packet, and run the demo without hunting through repeated sections.

## Completed

The drawer now has four clearer regions:

- `Story bar`: customer, lane, proof, product cue, ROI, competitive contrast, NetSuite proof point, next move, and create state.
- `Setup builder`: customer context, website, notes, lane signal, and setup controls.
- `Build packet`: exact records, proposed names, record types, intended fields, dependencies, toggle impact, blockers, and readiness.
- `Live run`: recommended move, proof context, move selection, live controls, and guardrails.

## UX Decisions

- The prior summary and value cards were consolidated into a single top story bar.
- ROI and competitive proof are now above the working panels.
- Review uses `Build packet` language because that is the consultant's functional checkpoint.
- Creation readiness is separated from the packet so the consultant can see what is ready and why creation is still locked.
- Trace remains operational and does not compete with the live demo path.

## No-Regression Confirmation

- Seven authorized lanes remain intact.
- Apparel & Accessories remains first-class.
- DCC toggles remain visible.
- Product-specific previews remain visible.
- Creation remains blocked.
- Trace export remains browser-local.

