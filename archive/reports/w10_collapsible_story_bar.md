# W10 Collapsible Story Bar

Generated: 2026-05-10
Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Reduce the persistent Story Bar footprint while preserving the consultant's orientation across NetSuite tabs.

## Implemented

- Added `storyBarCollapsed` active-session state.
- Added Collapse / Expand control on the Story Bar.
- Collapsed state keeps prospect, lane, proof anchor, product seed, setup readiness, page context, and draft status visible.
- Clear all remains visible in both expanded and collapsed states.
- Collapse preference persists through the active demo session and cross-tab localStorage pickup.
- Clear session resets the collapsed preference because it resets to `defaultState()`.

## No-Regression Points

- Active session still persists across tabs for up to 8 hours.
- Clear all and Clear session behavior remain intact.
- Story Bar still shows draft/create-disabled status.
- No lane, proof, toggle, packet, or write behavior changed.

## Learning

The Story Bar is valuable, but once the consultant is in Review or Run it should behave like orientation, not a large header. The compact state gives back vertical space without hiding the context.
