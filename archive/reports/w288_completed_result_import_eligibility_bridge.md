# W288 Completed Result Import Eligibility Bridge

## Purpose

W288 adds a behavior-preserving bridge between drawer-produced completed-result import eligibility facts and the W287 eligibility contract. The bridge is contract/testing infrastructure only; it is not wired into the Tampermonkey drawer runtime.

## Bridge Scope

The bridge validates parity for:

- Completed-result JSON presence.
- W151 validation status.
- W214 semantic guard status.
- W245 canonical normalization readiness.
- Generated record owner / governed runner ownership.
- Finish build CTA eligibility.
- Open-link preconditions.
- W218/W220 wording preservation flags.
- Admin-only raw evidence policy.

## Compared Fields

- status
- finishBuildEligible
- blocked reasons
- W151 consumed-not-replaced boundary
- W214 consumed-not-replaced boundary
- W245 consumed-not-replaced boundary
- no mutation/import/create/write/Open-link runtime boundary
- raw evidence admin/archive-only policy

## Boundaries Preserved

- The bridge cannot mutate state.
- The bridge cannot import records.
- The bridge cannot create records.
- The bridge cannot perform transaction writes.
- The bridge cannot create Open links.
- Finish build state mutation remains owned by `completedRunnerResultImportCommitOperatorFlowV1`.
- W151, W214, and W245 validation logic remain outside the bridge.
- The bridge is not imported by `idb-drawer.user.js`.
- Normal consultant UI remains unchanged and continues hiding endpoint URLs, raw JSON, task ids, schema names, stack traces, and admin diagnostics.

## Validation Summary

The W288 harness proves eligibility parity against W287 for eligible and blocked cases, W286/W285/W284/W283/W282/W281 continuity, W264 submit/refresh/import continuity, W265 retry safety, W245/W151/W214 validation continuity, returned record Open-link guardrails, fake-link blocking, hidden diagnostics, and unchanged runtime authority.
