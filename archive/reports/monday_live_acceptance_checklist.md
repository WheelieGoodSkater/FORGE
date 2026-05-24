# Monday Live Acceptance Checklist

Generated: 2026-05-09

Prompt: M4 - Monday Live Acceptance

Decision: READY FOR LIVE NETSUITE SMOKE. Final GO requires consultant visual confirmation in NetSuite.

## Required Smoke Path

1. Install `idb-drawer.user.js` in Tampermonkey.
2. Open the Georgetown NetSuite account page.
3. Confirm the `IDB` rail appears away from the NetSuite help widget.
4. Open the drawer.
5. Confirm Plan shows compact setup and selected lane.
6. Confirm Review shows the draft object path and creation guard.
7. Confirm Run shows one recommended move and live controls.
8. Confirm Trace exports JSON with dry-run packet.

## Georgetown Foods Expected Result

- Lane: Food / Beverage CPG Manufacturing.
- Proof anchor: Finished Good.
- DCC family: `foodManufacturing`.
- Records: Customer Record, Sales Order View, Finished Good, Ingredient / Packaging Structure, Packaging & Line Details, Production Setup.
- Creation: blocked / dry-run only.

## Alternate Lane Smoke

Run one alternate lane check before Monday GO:

- Products CPG should preserve Sales Order View as primary proof.
- Industrial Distribution should preserve Inventory / Fulfillment as primary proof.
- Dealer Hardgoods should preserve Product / SKU as primary proof.

## Stop / Go

GO when:

- Preflight passes.
- NetSuite visual smoke passes Plan, Review, Run, and Trace.
- Georgetown Foods still lands in Food / Beverage with Finished Good.
- Trace export works.

STOP when:

- Any proof anchor changes.
- Any create path becomes active without adapter support.
- Drawer blocks NetSuite navigation or help controls.
- Trace export fails.
