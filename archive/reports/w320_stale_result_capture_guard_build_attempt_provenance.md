# W320 Stale Result Capture Guard And Build Attempt Provenance

## Root Cause Summary

The latest Tri-State live smoke submitted a fresh W144 runner task, but the result lookup could still find an older result-capture file by the deterministic idempotency token. That stale file carried the old runner vocabulary (`Machine Unit`, `Formula`, `Ingredient`) and no W320 build-attempt provenance, so the drawer judged old evidence as if it belonged to the current smoke.

## Stale Result Guard

- Each explicit `Build records` run now carries drawer-side `buildAttemptId` and `submittedAt` provenance.
- Duplicate submit safety remains scoped to the same confirmed request and existing runner task.
- W144 result polling now prefers current `runnerTaskId`, then current `buildAttemptId`, then idempotency token fallback.
- Idempotency-only result files are rejected when they do not match the current build attempt.
- Result capture now preserves `runnerTaskId`, `idempotencyToken`, `sourceRequestId`, `submittedAt`, `resolvedOperatingMode`, and `runnerLaneVocabularyPolicy` when available.

## Consultant-Safe Block State

When records return but fail W151/W214/W245 import guard, normal UI can show:

- `Records returned but blocked`
- `Review needed`
- `No Open links until fixed`

Raw task ids, endpoint details, result JSON, stack traces, and internal diagnostics stay archived/admin-only.

## Upload Files

Upload these current files for the next smoke:

- `idb-drawer.user.js`
- `netsuite/idb_governed_runner_adapter_w144_suitelet.js`
- `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`

## Guardrails

- W151/W214/W245 validation is not weakened.
- The drawer still creates no records and performs no transaction writes.
- Finish build/import authority remains drawer-owned and W151/W214/W245-gated.
- W144 remains the approved adapter path for runner execution.

## Next Smoke Instructions

Run one new distribution-only smoke after uploading the three files above. Use a fresh prospect and notes, keep Manufacturing and WIP unchecked, then confirm:

- Build records captures a new runner task.
- Refresh does not import stale idempotency-only captures.
- Completed result includes build-attempt provenance and distribution-safe vocabulary.
- Finish build appears only after W151/W214/W245-valid records.
- Open links appear only after valid import.

