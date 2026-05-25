# W284 Connected Build Response Shape Bridge

## Purpose

W284 adds a behavior-preserving bridge between drawer-produced W265 submit/refresh response-shape outputs and the W283 connected build response-shape contract. The bridge is contract/testing infrastructure only; it is not wired into the Tampermonkey drawer runtime.

## Bridge Scope

The bridge validates parity for:

- Submit response shape.
- Pending refresh response shape.
- Completed refresh response shape.
- Malformed/error refresh response shape.

For each shape it compares:

- status
- phase
- runnerTaskId
- idempotency token
- result capture status
- finalGeneratedNamesJson location
- finalGeneratedNamesJson readiness
- adapter-safe error copy
- normal consultant copy
- normalized transport status
- raw evidence admin/archive-only policy
- guardrails requiring W245/W151 validation

## Boundaries Preserved

- The bridge cannot declare a completed result import-valid.
- W151 still owns completed-result import validity.
- W214 still owns semantic operating-mode result validation.
- W245 still owns canonical returned-record normalization.
- W264 still owns connected submit/refresh/import execution.
- W265 retry safety remains unchanged.
- The bridge is not imported by `idb-drawer.user.js`.
- Normal consultant UI remains unchanged and continues hiding endpoint URLs, raw JSON, task ids, schema names, stack traces, and admin diagnostics.
- No drawer-created records or drawer transaction writes are introduced.

## Validation Summary

The W284 harness proves bridge parity against W265 drawer outputs, W283 contract output, W282 boundary inventory, W281 adapter migration, W264 submit/refresh/import continuity, W265 retry safety, W245/W151/W214 validation, returned record Open-link guardrails, fake-link blocking, hidden diagnostics, and unchanged runtime authority.
