# W24 Customer + Proof Item Write Pilot

Generated: 2026-05-10

Decision: COMPLETE / PILOT BRANCH READY / MAIN CREATE STILL DISABLED

## Objective

Enable the first real sandbox write in a separate governed branch only.

## Goal

Create/update Customer first, then Proof Item only after Customer ID/URL exists.

## Roles

- SuiteScript Write Agent owns the pilot Suitelet file and Customer -> Proof Item sequence.
- Release Conductor Agent owns the main-versus-pilot branch split.
- Packet Contract Agent owns required request fields, idempotency, dependency, and rollback fields.
- Validation And Evidence Agent owns harness proof and upload go/no-go.
- Support Triage Agent owns stop conditions, partial failure, and rollback evidence.

## Implementation

- Created separate pilot file: `netsuite/suitescript/idb_suitescript_write_path_suitelet_w24_pilot.js`.
- Main file remains: `netsuite/suitescript/idb_suitescript_write_path_suitelet.js` with `CREATE_ENABLED = false`.
- Pilot file has `CREATE_ENABLED = true`.
- Both files keep `TRANSACTION_CONTEXT_ENABLED = false`.
- Harness now mocks NetSuite record create/save and verifies the W24 branch creates Customer first and Proof Item second.
- Harness verifies no transaction record is created.

## W24 Upload Boundary

Upload the W24 pilot file only to a separate NetSuite sandbox Script/Deployment:

- `netsuite/suitescript/idb_suitescript_write_path_suitelet_w24_pilot.js`

Do not replace the main create-disabled smoke Suitelet unless intentionally updating the safe smoke deployment.

## Required Runtime Parameters

- `custscript_idb_enable_pilot_writes = true`
- `custscript_idb_allow_customer_pilot = true`
- `custscript_idb_allow_proof_item_pilot = true`
- `custscript_idb_sandbox_account_only = true`
- `custscript_idb_require_type_confirm = true`

## Required Confirmation

The reviewed packet must include the exact type-to-confirm phrase returned by the runtime toggle.

For the Georgetown smoke packet:

`CREATE GEORGETOWN FOODS FOOD_BEVERAGE`

## Stop Conditions

- Main Suitelet `CREATE_ENABLED` changes to true.
- Transaction context creates or updates.
- Proof Item writes without Customer record ID and URL.
- Runtime flags are missing but writes still occur.
- Type-to-confirm phrase is missing or mismatched but writes still occur.
- Any production deployment.

## No Regression

- Main drawer and main Suitelet stay create-disabled.
- No Sales Order write yet.
- No transaction context write yet.
- No LLM write authority.
- No silent retry.
- No silent deletion.

## Next

After sandbox upload, run W24 authenticated POST smoke against the W24 pilot deployment and capture Customer/Proof Item IDs, URLs, lookup status, rollback labels, and any recoverable errors.
