# W22 Governed Pilot Branch Toggle

Generated: 2026-05-10

Decision: COMPLETE / MAIN CREATE STILL DISABLED

## Objective

Create the exact branch/runtime toggle path for enabling Customer and Proof Item writes in sandbox only.

## Goal

Main package stays create-disabled. A separate governed pilot branch can only proceed when the compile flag, sandbox runtime flags, reviewed packet, consultant confirmation, and type-to-confirm phrase all pass.

## Roles

- SuiteScript Write Agent owns the runtime gate and branch-only execution sequence.
- Release Conductor Agent owns the separation between main and pilot branch.
- NetSuite Compatibility Sentinel Agent owns sandbox-only, no transaction writes, and no silent retry/deletion.
- Validation And Evidence Agent owns harness and validator proof.

## Toggle Path

1. Main package remains `CREATE_ENABLED = false`.
2. A separate governed pilot branch may deliberately set `CREATE_ENABLED = true`.
3. Pilot branch must run in NetSuite sandbox.
4. Pilot branch must set:
   - `custscript_idb_enable_pilot_writes`
   - `custscript_idb_allow_customer_pilot`
   - `custscript_idb_allow_proof_item_pilot`
   - `custscript_idb_sandbox_account_only`
   - `custscript_idb_require_type_confirm`
5. Reviewed packet must include `consultantConfirmed: true`.
6. Reviewed packet must include the exact `typeToConfirmPhrase` returned by the SuiteScript runtime toggle.
7. W22 still excludes transaction context writes.

## Implementation

- Added `governedPilotRuntimeToggle`.
- Added runtime parameter checks through `runtime.getCurrentScript().getParameter`.
- Added sandbox runtime check through `runtime.envType`.
- Added hard stop before `executeCustomerWritePilot` and `executeProofItemWritePilot`.
- Added proof item runtime flag `custscript_idb_allow_proof_item_pilot`.

## Validation

- Main package returns the W22 toggle as `blocked_main_create_disabled`.
- Harness simulates a forced pilot branch and confirms missing runtime flags block before any write.
- Harness simulates production with all runtime flags true and confirms sandbox gate still blocks before any write.

## No Regression

- No live writes in the main drawer.
- No automatic creation.
- No transaction write in W22.
- No lane, proof, DCC toggle, or packet-order change.
- LLM remains advisory only.
- No silent retry and no silent deletion.
