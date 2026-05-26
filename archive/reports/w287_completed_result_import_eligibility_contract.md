# W287 Completed Result Import Eligibility Contract

## Purpose

W287 extracts a contract shape for completed-result import eligibility. The contract explains when `Finish build` may appear, but it does not perform the Finish build mutation and is not wired into the Tampermonkey drawer runtime.

## Contract Module

- `src/contracts/completedResultImportEligibility.js`

## Eligibility Inputs

- Completed-result JSON presence.
- W151 validation status.
- W214 semantic guard status.
- W245 canonical normalization readiness.
- Generated record owner / governed runner ownership.
- Finish build CTA eligibility.
- Open-link preconditions.
- W218 success wording preservation flag.
- W220 recovery wording preservation flag.
- Admin-only raw evidence policy.

## Statuses

- `missing_completed_result`
- `w151_rejected`
- `w214_semantic_blocked`
- `w245_normalization_not_ready`
- `finish_build_eligible`
- `finish_build_blocked`

## Boundaries

- W151 validation is consumed, not replaced.
- W214 semantic guard is consumed, not replaced.
- W245 canonical normalization is consumed, not replaced.
- `completedRunnerResultImportCommitOperatorFlowV1` remains the drawer-owned state mutation boundary.
- The module cannot mutate state, import records, create records, perform transaction writes, create Open links, or declare W245-normalized records without supplied W245 facts.
- The module is extraction-only and is not imported by `idb-drawer.user.js`.

## Future Bridge Path

The future W288 bridge can compare drawer-produced import eligibility facts against `src/contracts/completedResultImportEligibility.js` without moving Finish build state mutation.
