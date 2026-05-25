# W264 Connected Build Submit, Runner Refresh, And Completed Import

Status: implemented

## Summary

W264 connects the saved released W144 adapter profile to the consultant Build path:

- `Build records` submits only when W262 readiness is `ready_to_build_records`.
- Submit uses the selected adapter profile endpoint with `script=6702&deploy=2`.
- The first adapter response captures `runnerTaskId`, adapter response status, result-capture status, idempotency token, and safe adapter error state.
- `Refresh build status` polls only after a captured runner task id.
- Completed result JSON is validated through W245/W151 before `Finish build` appears.
- `Finish build` imports returned display-ready records and updates Review/Run story surfaces.

## Guardrails

- No drawer-created records.
- No drawer transaction writes.
- Record creation remains owned by the approved W144/server adapter path.
- No W144 deployment update in this block.
- Fake Open links remain blocked before valid import.
- Adapter errors stop safely and do not mutate returned records.

## Motion Acceptance

The Motion-style connected-run fixture stays in the industrial distribution lane with Manufacturing and WIP off. Returned product proof records render as `Product SKU` / availability proof labels, not manufacturing labels.

## Visual Testing Decision

Targeted install smoke is recommended after updating `idb-drawer.user.js`. Broad NetSuite visual regression is not required for W264.
