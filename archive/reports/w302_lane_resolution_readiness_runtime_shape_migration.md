# W302 Lane Resolution Readiness Runtime Shape Migration

Status: `runtime_shape_migration_ready`

W302 adds drawer-local, contract-shaped lane-resolution readiness fact assembly in `idb-drawer.user.js` through `laneResolutionReadinessRuntimeShapeW302`.

The helper mirrors the W300 lane-resolution readiness contract and remains field-compatible with the W301 bridge for ready, needs-confirmation, missing-website-evidence, hidden-uncertainty, and not-ready cases.

What moved or was reshaped:

- Pure lane-resolution readiness fact assembly.
- Pure status and blocked-reason shape.
- Pure guardrail shape for N/LLM advisory-only, uncertainty visibility, W250 label readiness, and future lane-pack expansion safety.

What stayed drawer-owned:

- `resolveLanePackFromEvidenceW246` remains the lane choice and confidence boundary.
- `websiteEvidenceBridge` and `ensureWebsiteEvidenceRuntime` remain the website evidence collection/runtime boundary.
- `nllmAdvisoryPayloadForLanePackW246` remains the advisory payload boundary.
- `consultantStorySurfaceFromLanePackW247` remains the story surface creation boundary.
- `lanePackAwareRecordLabelW250` remains the lane-aware label boundary.
- W245/W151/W214 validation, returned-record import, Open-link authority, connected submit/refresh/import, endpoint behavior, dataset switching, and record creation authority remain unchanged.

Why the migration is safe:

- The helper consumes supplied facts only.
- It cannot choose lanes, change confidence, override website evidence, override toggles, hide uncertainty, render UI, change visible copy, mutate state, import or create records, write transactions, create Open links, invoke the adapter, or declare W245/W151/W214 validity.
- The userscript remains self-contained with no runtime `require`, external dependency, bundler dependency, network dependency, or storage write for contract loading.

Visual testing decision: not required. W302 adds a parity helper and archived harness/report/trace only; visible UI is unchanged.
