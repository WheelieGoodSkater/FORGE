# H7 Production Readiness Pass

Generated: 2026-05-09

Decision: COMPLETE - READY FOR CONTROLLED PILOT SMOKE

## Objective

Move the drawer from feature blocks into a release-candidate package that can be copied into GitHub, installed in Tampermonkey, and visually smoked in NetSuite by a consultant.

## Completed

- Added `RELEASE_CANDIDATE_CHECKLIST.md`.
- Updated repo transfer scope for the current productized package.
- Kept `idb-drawer.user.js` as the only Tampermonkey install artifact.
- Kept `npm run preflight` as the local release gate.
- Preserved all no-regression boundaries:
  - Seven authorized lanes only.
  - Apparel & Accessories remains explicit.
  - No live NetSuite record creation.
  - No unsupported modules exposed.
  - No automatic lane switch.
  - No unverified competitor claims.
  - Trace remains local and exportable.

## Required Pilot Smoke

1. Install `idb-drawer.user.js`.
2. Confirm the IDB rail appears in NetSuite.
3. Run Food / Beverage CPG Manufacturing setup.
4. Run Apparel & Accessories setup.
5. Confirm Review direct build rows.
6. Confirm ROI / Competitive Review content.
7. Confirm Run Coach actions.
8. Export trace.
9. Clear all.
10. Log out and back in to confirm stale state clears.

## Production Gate

This package is not a full production release until:

- A consultant visually confirms NetSuite behavior.
- The creation adapter is implemented and tested separately.
- Create remains locked behind adapter availability and explicit consultant confirmation.

## Next Block

H8 provides the release-candidate demo script and example traces for the controlled pilot.
