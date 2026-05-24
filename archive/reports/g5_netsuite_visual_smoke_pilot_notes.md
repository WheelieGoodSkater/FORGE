# G5 NetSuite Visual Smoke And Pilot Notes

Generated: 2026-05-09

Decision: READY FOR AUTHENTICATED NETSUITE PILOT SMOKE

## Scope

This block prepares the controlled NetSuite smoke pass. It does not claim the authenticated NetSuite smoke has already been completed from Codex.

## Required Smoke Paths

### Food / Beverage

- Enter customer: Georgetown Foods or Liquid Death.
- Enter a real-looking website.
- Enter notes about ingredient readiness, packaging timing, replenishment, or promotion risk.
- Expected lane: Food / Beverage CPG Manufacturing.
- Expected proof anchor: Finished Good.
- Expected records: Customer Record, Sales Order View, Finished Good, Ingredient / Packaging Structure, Packaging & Line Details, Production Setup.
- Expected create state: blocked / dry-run only.

### Apparel & Accessories

- Enter customer: Vans.
- Enter a real-looking website.
- Enter notes about style/SKU readiness, allocation, seasonal launch, channel availability, or size/color variants.
- Expected lane: Apparel & Accessories.
- Expected proof anchor: Style / SKU Matrix.
- Expected records: Customer Record, Sales Order View, Style / SKU Matrix, Size / Color Variants, Allocation / Replenishment, Channel Availability.
- Expected regression guard: apparel must not route to Industrial Equipment Manufacturing.
- Expected create state: blocked / dry-run only.

## UX Smoke Checklist

- IDB rail appears and does not block NetSuite help or navigation controls.
- Plan, Review, ROI / Competitive, Run, and Trace tabs are visible.
- Story Bar remains compact.
- Clear all is visible.
- Review shows direct `will be` statements.
- ROI / Competitive is contained to its own tab.
- Run stays action-oriented and does not repeat the value packet.
- Trace exports setup, review packet, ROI / Competitive, execution plan preview, and bridge request.

## Session Hygiene Checklist

- Same active setup is visible across NetSuite tabs during the session.
- Clear all resets the active prospect.
- Login/logout boundary clears stale prospect context.
- Trace can be exported before reset.

## Stop Conditions

- Create records button is enabled.
- Apparel routes to Industrial Equipment Manufacturing.
- Proof anchor changes unexpectedly.
- ROI / Competitive copy appears on every tab.
- NetSuite controls are blocked.
- Trace export fails.

## Next

After this smoke passes in the authenticated account, proceed to a controlled SuiteScript direct-write implementation plan using the G6 skeleton.
