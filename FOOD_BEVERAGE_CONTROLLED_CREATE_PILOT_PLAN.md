# Food / Beverage Controlled Create Pilot Plan

Generated: 2026-05-09

## Objective

Define the first controlled create pilot for the SuiteScript direct-write path without enabling writes yet.

The pilot is limited to Food / Beverage CPG Manufacturing because it is the strongest current proof path and maps cleanly to the prior Demo Command Center flow: customer, sales order context, finished good, ingredient/packaging structure, packaging/line details, and production setup.

## Pilot Boundary

- Lane: Food / Beverage CPG Manufacturing.
- Lane id: `food_beverage`.
- Proof anchor: Finished Good.
- Write path: `suitescript_direct_write`.
- Current state: pilot plan only / create disabled.
- Suitelet state: `CREATE_ENABLED = false`.

## Required Pilot Packet

The pilot packet must include:

- Customer: Georgetown Foods, Liquid Death, or another reviewed Food / Beverage prospect.
- Website: required.
- Conversation notes: must include ingredient readiness, packaging timing, replenishment, promotion risk, finished-good availability, or line continuity.
- DCC family key: `foodManufacturing`.
- Scenario: Promotion-Driven Food Manufacturing.
- Toggles: new item on, manufacturing on, WIP off unless explicitly reviewed.

## Records In Scope

1. Customer Record.
2. Sales Order View.
3. Finished Good.
4. Ingredient / Packaging Structure.
5. Packaging & Line Details.
6. Production Setup.

## Required Gates

- Authenticated NetSuite session.
- Food / Beverage lane selected.
- Finished Good proof anchor confirmed.
- Reviewed dry-run packet.
- `CREATE_ENABLED` deliberately enabled in a pilot branch only.
- Explicit consultant confirmation.
- Traceable creation result.
- Rollback runbook ready.

## Stop Conditions

STOP if:

- lane is not `food_beverage`.
- proof anchor is not Finished Good.
- record order changes.
- `createNewHeroItem` is false without reviewed existing item context.
- `enableManufacturing` is false for the Food / Beverage pilot.
- consultant confirmation is missing.
- trace cannot capture created record IDs and URLs.
- partial failure cannot identify created records.

## Rollback / Recovery Runbook

- Export trace before create.
- After each write, append created record type, id, url, sequence, and operation to trace.
- If customer creation succeeds and transaction fails, return `partial_failed` and stop.
- If proof anchor creation succeeds and supporting proof fails, return `partial_failed` and stop dependent writes.
- Do not silently delete records.
- Provide created IDs for manual review or cleanup.
- Do not retry writes without adding retry details to trace.

## Success Criteria

- Only Food / Beverage records are created.
- Customer, Sales Order View, Finished Good, and supporting proof records return IDs or explicit skipped reasons.
- Trace includes `suitescript_write_path_result`.
- Create remains unavailable for all non-pilot lanes.

## No-Regression Closure

G10 does not enable writes. It defines the pilot conditions required before a future G11 enablement block can safely touch `CREATE_ENABLED`.
