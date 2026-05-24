# V14 Partial Failure And Rollback Evidence

Decision: COMPLETE / MAIN CREATE STILL DISABLED

Generated: 2026-05-10

## Objective

Harden failure behavior before adding transaction writes or additional record types.

## Implemented

- Added `partialFailurePolicy` to SuiteScript responses.
- Added `rollbackEvidence` to every write-plan row.
- Added `parentDependencies` and `stopIfParentFailed` metadata to write-plan rows.
- Added `partialFailureSimulation` to validated SuiteScript responses.
- Expanded harness coverage to verify the partial-failure contract while `CREATE_ENABLED = false`.

## Partial Failed Contract

The SuiteScript path now reserves `partial_failed` for the future case where a parent record succeeds and a later dependent write fails.

Required evidence:

- completed records before failure
- blocked dependent writes
- rollback labels
- record IDs
- URLs
- recoverable errors
- recovery instruction

## Rollback Rules

- No silent retry.
- No silent deletion.
- Stop dependent writes when a parent dependency fails.
- Surface rollback labels and trace placeholders before enabling writes.
- Transaction creation remains blocked until Customer Record and Finished Good are stable.

## Harness Evidence

The harness now validates:

- `partialFailurePolicy.status === partial_failed`
- `noSilentRetry === true`
- `noSilentDeletion === true`
- `partialFailureSimulation.statusIfDependentFailsAfterParentSuccess === partial_failed`
- completed-before-failure placeholders exist
- dependent writes are blocked
- every write-plan row carries rollback evidence

## No-Regression Evidence

- `CREATE_ENABLED` remains false.
- No live write function executes.
- No transaction creation is enabled.
- The main package remains a create-disabled review and validation path.
