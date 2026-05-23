# W14 Write Branch Isolation And Runtime Flag Strategy

Generated: 2026-05-10
Decision: COMPLETE / MAIN CREATE STILL DISABLED

## Objective

Create a controlled implementation lane for writes after UX compression is stable.

## Implemented

- Added `data/w14_write_branch_runtime_strategy.json`.
- Added SuiteScript runtime flag strategy response with schema `idb.runtime-flag-strategy.v1`.
- Kept `CREATE_ENABLED = false` in the main SuiteScript package.
- Defined the pilot branch as sandbox-only and separate from the main Tampermonkey package.
- Preserved the transaction context gate: transaction context remains blocked until Customer and Proof Item result IDs/URLs exist.

## Runtime Flags

- `custscript_idb_enable_pilot_writes`
- `custscript_idb_allow_customer_pilot`
- `custscript_idb_sandbox_account_only`
- `custscript_idb_require_type_confirm`

## No-Regression Points

- Main create remains disabled.
- No writes can execute from the drawer.
- N/LLM remains advisory only.
- Transaction context remains post-parent-result gated.
- No silent retry, no silent deletion, and no hidden write path.

## Learning

The next write move must be branch-isolated. The main package can describe the write plan and return trace contracts, but it must not execute creates until a pilot branch and sandbox runtime flags are deliberately enabled.
