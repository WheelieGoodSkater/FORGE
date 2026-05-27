# W318 Runner Lane Vocabulary Reconciliation

## Goal
Stop fixing runner vocabulary one prospect at a time. The runner now consumes the confirmed build request and derives a lane vocabulary policy from the selected lane, operating mode, toggles, and W151/W214/W245 validation contract.

## Codex-Optimized Agent Plan
- Runner contract agent: derive allowed/blocked vocabulary from `resultValidationExpectations.recordContract`, selected lane, operating mode, and toggles.
- Runner mutation agent: apply that policy inside the SuiteScript runner at both naming selection and final result-capture item creation.
- Drawer guard agent: keep W151/W214/W245 strict; bad completed results stay blocked rather than being accepted.
- Smoke analyst agent: use the Summit Electrical Supply trace as regression evidence without saving Summit as a special case.

## What Changed
- `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`
  - Reads `custscript_v3_runner_idb_request_json`.
  - Adds `runnerLaneVocabularyPolicyV1`.
  - Makes distribution/no-manufacturing/no-WIP choose distribution-safe names.
  - Prevents sidecar result capture from reintroducing `Formula / Availability Context` and `Ingredient / Packaging Component` for distribution runs.
- `netsuite/idb_governed_runner_adapter_w144_suitelet.js`
  - Maps legacy `matrixProofItem` and `componentItem` slots to distribution-safe canonical roles when `resolvedOperatingMode` is `distribution_replenishment`.

## Guardrails
- No drawer-created records.
- No drawer transaction writes.
- No W144 deployment update in this repo block.
- No consultant UI exposure of endpoint, raw JSON, task ids, schemas, stack traces, or internal policy objects.
- Strict import validation stays in W151/W214/W245.
- The runner policy is contract-based, not prospect-example based.

## Validation
- W318 harness covers Summit bad-result evidence, corrected distribution-safe output, runner policy wiring, adapter canonicalization, hidden diagnostics, and W264-W317 continuity registration.
