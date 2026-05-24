# Intelligent Demo Builder Release Candidate Checklist

Generated: 2026-05-09

Decision: READY FOR CONTROLLED PILOT AFTER NETSUITE VISUAL SMOKE

## Release Candidate Scope

This package is a Tampermonkey right-side NetSuite companion drawer. It is ready for a controlled pilot when local preflight is green and the consultant confirms the visual smoke path in NetSuite.

Included:

- Seven authorized V5 lanes, including Apparel & Accessories.
- Active demo session shared across NetSuite tabs.
- Visible `Clear all` reset.
- Customer, website, and conversation notes intake.
- Optional SC request context: objective, known competitor, and decision criteria.
- Direct Review build packet using `will be` statements.
- Dedicated ROI / Competitive Review tab.
- Customer-aware Run Coach actions.
- Trace export with dry-run object packet, value review, enrichment request, and adapter bridge request.
- SuiteScript review packet export with Creation Packet Contract V2, `consultantConfirmed: false`, and create-disabled handoff evidence.
- Release Candidate V2 manifest at `data/release_candidate_v2_manifest.json`.

Not included:

- Live NetSuite record creation.
- Unsupported module rendering.
- Unverified competitor claims.
- Automatic lane switching.

## Required Local Checks

Run from this folder:

```bash
npm run preflight
```

Required result:

- `node --check idb-drawer.user.js` passes.
- `node --check tools/validate_drawer_project.js` passes.
- Validator result is `PASS`.
- `validation_report.md` is regenerated.

## Required NetSuite Smoke

1. Install `idb-drawer.user.js` in Tampermonkey.
2. Open a NetSuite authenticated page.
3. Confirm the `IDB` rail appears and does not block NetSuite controls.
4. Open the drawer.
5. Confirm tabs show: Plan, Review, ROI / Competitive, Run, Trace.
6. Enter a Food / Beverage customer, website, notes, optional SC objective, optional competitor, and decision criteria.
7. Save setup.
8. Confirm Review uses direct `will be` build rows.
9. Confirm ROI / Competitive has ROI thesis, competitive review, objections, and discovery questions.
10. Confirm Run shows Open, Prove, Handle objection, and Close value.
11. Export trace.
12. Export packet and confirm the payload is for SuiteScript review only with `consultantConfirmed: false`.
13. Click `Clear all` and confirm the next prospect starts clean.
14. Log out and back in, then confirm stale prospect context is gone.

## Food / Beverage Expected Result

- Lane: Food / Beverage CPG Manufacturing.
- Proof anchor: Finished Good.
- Records: Customer, Sales Order, Finished Good, Ingredient / Packaging Structure, Packaging & Line Details, Production Setup.
- Creation: blocked / dry-run only.

## Apparel Expected Result

- Lane: Apparel & Accessories.
- Proof anchor: Style / SKU Matrix.
- Records: Customer, Sales Order, Style / SKU Matrix, Size / Color Variants, Allocation / Replenishment, Channel Availability.
- Creation: blocked / dry-run only.
- Regression guard: apparel must not fall into Industrial Equipment Manufacturing.

## Stop / Go

GO when:

- Local preflight passes.
- Food / Beverage smoke passes.
- Apparel smoke passes.
- Trace export includes `roiCompetitiveReview`.
- Trace export includes `suiteScriptReviewPacket`.
- Packet export includes `idb.creation-packet.v2` and `consultantConfirmed: false`.
- Clear all and login/logout reset both work.
- Creation remains disabled.

STOP when:

- Any lane proof anchor changes unexpectedly.
- Apparel routes to industrial equipment.
- Any create button becomes active without adapter support.
- Competitor copy makes unverified factual claims.
- Trace export fails.
- NetSuite navigation or help controls are blocked.
