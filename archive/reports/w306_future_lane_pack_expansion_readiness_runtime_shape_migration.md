# W306 Future Lane Pack Expansion Readiness Runtime Shape Migration

Status: `runtime_shape_migration_ready`

## Summary

W306 adds a drawer-local, contract-shaped helper for future lane-pack expansion readiness fact assembly:

- `futureExpansionReadinessRuntimeShapeW306`

The helper mirrors the W304 future expansion readiness contract shape and is validated through the W305 bridge. It is self-contained inside `idb-drawer.user.js`; no runtime `require`, bundler dependency, network dependency, or storage write was added.

## What Moved Or Was Reshaped

- Future expansion readiness fact assembly/status/guardrail shape moved into a pure drawer-local helper.
- The helper assembles supplied proposal identity, source pack comparison, website/category evidence, role coverage, vocabulary coverage, story copy coverage, N/LLM limits, authoring/diff/admin/QA readiness, lane-readiness compatibility, human-review gates, and uncertainty gates.

## What Stayed Drawer/Source-Owned

- W247 authoring/review.
- W251 proposed diff.
- W252 admin review rendering.
- W255 receipt-driven QA.
- W300-W302 lane-readiness behavior.
- Source lane packs in `src/contracts/lanePacks.js`.
- Connected build submit/refresh/import.
- W245/W151/W214 validation.
- Returned-record import and Open-link authority.
- Normal consultant UI rendering.

## Guardrails

- No source pack mutation.
- No proposed pack install or auto-install.
- No lane choice or confidence change.
- No website evidence or consultant toggle override.
- No hidden uncertainty.
- No UI rendering or visible copy change.
- No record import, record creation, transaction write, Open-link creation, or adapter invocation.
- No W245/W151/W214 validity declaration.

## Visual Testing Decision

Broad visual testing is not required because W306 only adds a harness-exported runtime shape helper and does not change visible UI.
