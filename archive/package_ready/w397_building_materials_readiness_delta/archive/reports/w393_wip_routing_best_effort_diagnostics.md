# W393: Targeted WIP Routing Best-Effort Failure Handling and Diagnostics

Date: 2026-06-02

Use W392 Keystone Smoke Review, Building Materials Source-Pack Readiness, and WIP Routing Safety Gate as the locked safety-review baseline.

## Summary

W393 patches the narrow WIP routing hard-failure path identified by the Keystone smoke review. No live smoke in W393. No upload or deployment was performed.

The runner now treats manufacturing routing creation/update as best-effort. If NetSuite rejects the BOM or another routing field during `createAndAttachRoutingIfPossible(...)`, the helper returns a structured `failed_best_effort` routing result instead of throwing and hard-failing the whole run.

This patch does not hide the failure. It captures diagnostics, keeps `routingId` null, marks routing as not attached, and surfaces the routing failure in manufacturing signoff.

## Root Cause Review

The Keystone smoke ran with Manufacturing and WIP enabled and later failed in NetSuite Script Execution:

```text
INVALID_FLD_VALUE: You have entered an Invalid Field Value 50 for the following field: billofmaterials
```

The failing operation was:

```javascript
routing.setValue({ fieldId: 'billofmaterials', value: Number(bomId) })
```

W392 confirmed the trace itself only contained queued/pending runner state. The NetSuite Script Execution error is therefore later execution evidence from the queued task, not a completed imported result.

Likely causes remain:

- stale or incompatible BOM id
- BOM not valid for the subsidiary/location/routing context
- BOM not attached or valid for the assembly item
- inactive or inaccessible BOM
- routing record constraints

## Patched Failure Behavior

Patched runner files:

- `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`
- `src/FileCabinet/SuiteScripts/Intelligent Demo Builder/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`

The routing helper now tracks the active failure stage and catches routing create/update/save errors around the routing record path.

Important stages include:

- `load_existing_routing`
- `create_routing`
- `set_subsidiary`
- `set_billofmaterials`
- `set_location`
- `set_name`
- `add_routing_step`
- `commit_routing_step`
- `save_routing`

When a routing failure occurs, the helper returns:

```javascript
{
  status: 'failed_best_effort',
  decision: 'failed_best_effort',
  routingId: null,
  attachResult: 'not-attached-routing-failed',
  routingFailure: { ...diagnostics },
  diagnostics: { ...diagnostics }
}
```

Successful routing behavior is preserved and still returns a real `routingId`.

## Diagnostics Captured

The best-effort failure result captures:

- `failureStage`
- `errorName`
- `errorMessage`
- `assemblyId`
- `bomId`
- `subsidiaryId`
- `locationId`
- `routingId`
- `existingRoutingId`
- `routingName`
- `wipRequested`
- `coreRecordsCreatedSafely`
- `recommendedOperatorNextStep`

For the Keystone-style failure, the expected failure stage is `set_billofmaterials`.

## Manufacturing Signoff Behavior

Manufacturing signoff now includes:

- `routingStatus`
- `routingFailure`
- `routingDiagnostics`

If WIP was requested and routing failed, signoff should not imply routing is ready. `signoffReady` remains false because `routingId` is null. The operator summary now shows a clear routing failure state such as:

```text
Routing=failed-best-effort at set_billofmaterials: You have entered an Invalid Field Value...
```

If WIP was not requested, no new routing warning noise is introduced.

If routing succeeds, existing successful behavior remains unchanged.

## Boundary Preservation

- No live smoke in W393.
- No upload or deployment.
- No runtime upload package creation.
- W386 source-pack readiness evidence package was not mutated.
- No Building Materials source-pack mutation was made.
- No source-pack mutation was made in W393.
- No new drawer transaction write paths.
- No fake Open links.
- Open-link authority remains verified-import-only.
- Do not weaken completed-result import validation.
- completed-result import validation was not changed.
- N/LLM remains advisory-only.
- Do not treat W386 as runtime code.
- No core item, BOM, work-order, runner adapter, or import behavior was changed.

## Validation Commands

```bash
node --check netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js
node --check "src/FileCabinet/SuiteScripts/Intelligent Demo Builder/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js"
node --check archive/tools/run_w393_wip_routing_best_effort_diagnostics_harness.js
npm run harness:wip-routing-best-effort-diagnostics-w393
npm run harness:keystone-smoke-wip-routing-safety-gate-w392
npm run harness:building-materials-fixture-story-proof-w391
npm run harness:fixture-first-expansion-restart-w390
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
W393 WIP routing best-effort diagnostics harness: 15/15 passed
W392 Keystone smoke WIP routing safety gate harness: 14/14 passed
W391 Building Materials fixture-first story proof harness: 15/15 passed
W390 fixture-first expansion restart harness: 13/13 passed
W386 pack-ready artifact package harness: 8/8 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W392 safety baseline preservation | Pass | W392 remains the locked safety review baseline. |
| Routing helper failure containment | Pass | `createAndAttachRoutingIfPossible(...)` now returns `failed_best_effort` on routing create/update/save failure. |
| BOM invalid field failure handled | Pass | `set_billofmaterials` is tracked as a failure stage and is inside the guarded routing path. |
| Routing diagnostics captured | Pass | Required diagnostic fields are returned in `routingFailure` and `diagnostics`. |
| Manufacturing signoff surfaces routing failure | Pass | Signoff includes `routingStatus`, `routingFailure`, and `routingDiagnostics`; `signoffReady` remains false when WIP routing fails. |
| Completed-result import validation preservation | Pass | Import validation code was not changed or weakened. |
| Open-link authority preservation | Pass | Open-link behavior was not changed. |
| Core record behavior unchanged | Pass | Patch is limited to WIP routing failure handling after core manufacturing setup. |
| W391 Building Materials fixture-story preservation | Pass | No Building Materials source-pack mutation was made. |
| W386 package preservation | Pass | W386 source-pack readiness evidence package was not mutated. |
| No source-pack mutation | Pass | No source packs were added or changed. |
| No live smoke / no upload boundary | Pass | No live smoke, upload, or deployment was performed. |
| No fake Open links | Pass | No links were added. |
| No-regression gates | Pass | no-regression gates passed. |

## Recommendation

Lock WIP routing safety patch and then prepare Building Materials source-pack readiness review.

Do not run another Keystone smoke until an explicit upload/deployment path is chosen and the patched runner is intentionally deployed. The next fixture/harness block can safely return to Building Materials source-pack readiness and toggle guard cleanup.
