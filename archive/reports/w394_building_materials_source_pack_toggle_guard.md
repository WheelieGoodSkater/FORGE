# W394: Building Materials Source-Pack Readiness and Manufacturing/WIP Toggle Guard Cleanup

Date: 2026-06-02

Use W393 Targeted WIP Routing Best-Effort Failure Handling and Diagnostics as the locked runner-safety baseline.

## Summary

W394 adds a scoped Building Materials source pack and tightens drawer-side Manufacturing/WIP toggle guard behavior for Building Materials / Contractor Supply evidence. No live smoke in W394. No upload or deployment was performed.

W392 remains preserved as historical review evidence: the Keystone smoke showed that Keystone-style evidence should not silently fall into Industrial Equipment Manufacturing, Dealer Hardgoods, or generic Industrial Distribution. W394 acts on W392's recommendation by giving Building Materials a direct source-pack and runtime lane target.

## Source-Pack Readiness Result

Added source pack:

- lane id: `building_materials`
- pack id: `building-materials-contractor-supply-project-fulfillment`
- label: `Building Materials Contractor Supply & Project Fulfillment`
- operating mode: `distribution_replenishment`
- Manufacturing/WIP default: off

Updated files:

- `src/contracts/lanePacks.js`
- `idb-drawer.user.js`
- `src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb-drawer.user.js`

The pack covers:

- building materials
- lumber
- doors
- windows
- fasteners
- tools
- contractor supply
- special order materials
- branch availability
- jobsite delivery
- will-call pickup
- substitutions
- project fulfillment
- margin leakage

Required proof roles:

- `customer`
- `contractor_account`
- `job_order`
- `branch_item_availability`

Optional proof roles:

- `special_order_or_substitution`
- `will_call_or_jobsite_delivery`
- `margin_context`
- `project_fulfillment_context`
- `branch_transfer_context`
- `contractor_promise_context`

## Toggle Guard Cleanup

Building Materials now defaults to non-manufacturing contractor/project fulfillment.

The drawer setup contract includes:

```javascript
dccToggles: { createNewHeroItem: true, enableManufacturing: false, enableWip: false }
```

The drawer also suppresses Manufacturing/WIP for `building_materials` when the evidence does not explicitly support fabrication, assembly, shop work, production routing, work center, WIP, build/test, inspection, or configured equipment assembly.

This protects Keystone-style notes such as lumber, doors, windows, fasteners, special orders, branch availability, will-call pickup, jobsite delivery, substitutions, and margin from turning into Industrial Equipment Manufacturing or WIP routing.

True manufacturing evidence is still allowed. If Building Materials evidence explicitly includes fabrication, assembly, production routing, work center, WIP, build/test, inspection, or configured equipment assembly, the handoff can still preserve Manufacturing/WIP toggles.

## Classification / Resolution Behavior

Keystone-style evidence now resolves to:

```text
building-materials-contractor-supply-project-fulfillment
```

Keystone-style evidence no longer needs a silent Industrial Equipment, Dealer Hardgoods, or generic Industrial Distribution fallback.

The drawer now includes:

- a Building Materials lane in the consultant lane list
- a Building Materials functional setup contract
- a Building Materials website/domain hint for `keystonebuildingsupply.com`
- a Building Materials website/category classifier
- the Building Materials embedded lane pack
- a W394 resolver-limited recommendation guard so Keystone-style contractor/project fulfillment evidence does not remain pinned to Industrial Distribution or Industrial Equipment

## Claim Safety

The Building Materials story is grounded in contractor account demand, job order readiness, branch item availability, special order/substitution status, will-call pickup, jobsite delivery, project fulfillment confidence, and margin leakage.

The pack blocks unsupported terms unless evidence explicitly supports them:

- dealer allocation
- channel fulfillment
- style/color/size
- store/ecommerce promise
- technician truck stock
- first-time fix
- clinic supply substitutes
- QA release
- lot/release readiness
- validation documentation
- food batch
- ingredient readiness
- configured equipment assembly
- manufacturing routing
- WIP
- work center

Measured ROI remains baseline-required. Competitive pressure such as Epicor, Spruce, QuickBooks, old POS, spreadsheets, or branch calls remains advisory-only unless confirmed.

## Boundary Preservation

- No live smoke in W394.
- No upload or deployment.
- No runtime upload package creation.
- W386 source-pack readiness evidence package was not mutated.
- W393 WIP routing best-effort diagnostics were preserved.
- No runner, adapter, or record creation behavior was changed.
- No fake Open links.
- Open-link authority remains verified-import-only.
- completed-result import validation was not changed.
- N/LLM remains advisory-only.
- W386 remains readiness evidence, not runtime code.

## Validation Commands

```bash
node --check "src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb-drawer.user.js"
node --check archive/tools/run_w394_building_materials_source_pack_toggle_guard_harness.js
npm run harness:building-materials-source-pack-toggle-guard-w394
npm run harness:wip-routing-best-effort-diagnostics-w393
npm run harness:building-materials-fixture-story-proof-w391
npm run harness:fixture-first-expansion-restart-w390
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
node --check idb-drawer.user.js: passed
node --check src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb-drawer.user.js: passed
node --check archive/tools/run_w394_building_materials_source_pack_toggle_guard_harness.js: passed
package.json parse check: passed
W394 Building Materials source-pack toggle guard harness: 18/18 passed
W393 WIP routing best-effort diagnostics harness: 15/15 passed
W391 Building Materials fixture-first story proof harness: 15/15 passed
W390 fixture-first expansion restart harness: 13/13 passed
W386 pack-ready artifact package harness: 8/8 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W393 runner safety baseline preservation | Pass | W393 remains locked; WIP routing best-effort diagnostics were not weakened. |
| W392 Keystone smoke review preservation | Pass | W392 remains preserved as historical review evidence. |
| W391 Building Materials fixture-story preservation | Pass | Keystone story terms remain contractor/project fulfillment specific. |
| Building Materials source-pack readiness | Pass | Direct Building Materials source pack added. |
| Building Materials source-pack validation | Pass | `validateLanePack(...)` accepts the pack. |
| Keystone-style evidence resolution safety | Pass | Keystone-style evidence resolves to Building Materials. |
| Existing-lane fallback safety | Pass | Silent Industrial Equipment, Dealer Hardgoods, and generic Industrial Distribution fallback is no longer needed. |
| Drawer suggested-lane routing | Pass | Keystone-style evidence prefers Building Materials under the W394 contractor/project fulfillment guard. |
| Manufacturing/WIP default-off guard | Pass | Building Materials handoff defaults Manufacturing/WIP off. |
| True manufacturing evidence still allowed | Pass | Explicit fabrication/assembly/WIP evidence can still preserve Manufacturing/WIP. |
| Consultant story surface safety | Pass | No measured ROI or unsupported competitor claim is introduced. |
| ROI/Competitive claim safety | Pass | Baseline-required ROI caution remains intact. |
| Open-link authority preservation | Pass | No Open-link authority behavior changed. |
| Completed-result import validation preservation | Pass | Import validation was not changed. |
| W386 package preservation | Pass | W386 package was not mutated. |
| No fake Open links | Pass | No links were added. |
| No live smoke / no upload boundary | Pass | No live smoke, upload, or deployment was performed. |
| No-regression gates | Pass | no-regression gates passed. |

## Recommendation

Lock Building Materials source-pack readiness and Manufacturing/WIP toggle guard cleanup.

Next block should continue fixture-first expansion or prepare a second Building Materials fixture variant if we want more confidence before any future live validation. Do not run another Keystone smoke unless the patched runner/drawer is explicitly uploaded/deployed and one focused integration validation is intentionally authorized.
