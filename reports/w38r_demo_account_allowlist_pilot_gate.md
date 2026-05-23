# W38R Demo Account Allowlist Pilot Gate

Decision: COMPLETE / APPROVED DEMO ACCOUNT GATE READY / MAIN CREATE STILL DISABLED

## Blunt Finding

The W38 live response proved the W24 pilot branch was configured correctly, but it blocked because the NetSuite demo account reports `environment: PRODUCTION`. That is expected for consultant demo accounts. Keeping a sandbox-only gate would block the real operating model, so the architecture pivots to an explicitly allowlisted production demo account gate.

## What Changed

- The W24 pilot Suitelet now treats `custscript_idb_sandbox_account_only` as the approved pilot environment gate.
- Sandbox still passes.
- The production demo account `TD3021666` / `YOUR_ACCOUNT_ID.app.netsuite.com` now passes when all other write gates pass.
- Unapproved production accounts still block.
- Customer remains first.
- Proof Item still requires Customer ID and URL.
- Sales Order / transaction context remains disabled.

## What Did Not Change

- Main drawer does not create records.
- Main Suitelet remains `CREATE_ENABLED = false`.
- W24 pilot file is still separate from the main Suitelet.
- Type-to-confirm is still required.
- Runtime flags are still required.
- Creation Packet Contract V2 is still required.
- N/LLM remains advisory-only.
- No silent retry or silent deletion.

## Required Retest

Upload the updated `netsuite/suitescript/idb_suitescript_write_path_suitelet_w24_pilot.js` to the same W24 Script record, keep all five deployment parameters checked, and rerun the exact same POST.

Pass condition:

- `status` is `created` or `partial_failed`.
- Customer result includes `recordId` and `url`.
- Proof Item result either includes `recordId`, `url`, and `parentCustomerRecordId`, or fails with a recoverable NetSuite required-field error.
- Transaction context remains blocked and no Sales Order is created.

Fail condition:

- Unapproved production environment writes.
- Proof Item writes without Customer result.
- Sales Order writes.
- Response hides rollback or recoverable error fields.

## Recommendation

Proceed with the same Georgetown W38 POST after uploading the updated W24 pilot Suitelet. If Customer creates and Proof Item fails on required item fields, that is the right next W38R evidence and we patch only the item-field defaults.
