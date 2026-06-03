# W407: HVAC / Mechanical Contractor Supply Source-Pack Readiness Cleanup

Date: 2026-06-02

Use W406 HVAC / Mechanical Contractor Supply Second Fixture Decision Gate as the locked two-fixture readiness baseline. Keep W405 Summit first HVAC fixture proof, W404 HVAC fixture-first selection, W403 Wholesale Janitorial readiness delta package, W402 Wholesale Janitorial source-pack readiness, W397 Building Materials readiness delta package, W396 Building Materials source-pack readiness, W389 runtime release routing, W388 final archive handoff, W386 source-pack readiness evidence package, and W379-W383 source-pack-ready lane baselines locked.

## Summary

W407 adds the scoped HVAC / Mechanical Contractor Supply source pack after W405 Summit and W406 Horizon proved a stable HVAC lane shape.

No live smoke in W407. No upload or deployment was performed. No runtime upload package creation occurred. No package was created or mutated.

W403, W397, and W386 packages were not mutated. Do not mutate W403, W397, or W386 packages.

No runner, adapter, record creation, import validation, or Open-link authority changes were made.

HVAC readiness status: `ready_now`

## Source-Pack Identity

- lane id: `hvac_mechanical_supply`
- pack id: `hvac-mechanical-contractor-supply-service-readiness`
- label: `HVAC Mechanical Contractor Supply & Service Readiness`
- operating mode: `distribution_replenishment`
- Manufacturing/WIP default: off

HVAC contractor supply should not invite Manufacturing/WIP by default.

## Fixture Baselines

Summit Mechanical Supply remains the first fixture baseline.

Horizon Air & Mechanical Supply remains the second fixture baseline.

Together, Summit and Horizon prove that HVAC is not a one-off story. The lane can handle contractor account demand, job quote or service order readiness, HVAC equipment availability, replacement/service parts, branch/location stock, reserved inventory risk, substitute options, warranty/replacement context, backorder/replenishment status, pickup or jobsite delivery readiness, install/service promise confidence, margin leakage, and refrigerant caution.

W404 remains preserved as the selection baseline.

## Website / Category Signals

- HVAC supply
- mechanical supply
- HVAC equipment
- condensers
- air handlers
- motors
- belts
- filters
- thermostats
- duct parts
- refrigerant
- install supplies
- contractor supply
- service techs
- counter sales
- branch stock
- vendor portals
- replacement parts
- warranty replacement
- backorders
- replenishment
- pickup
- jobsite delivery

## Evidence Signals

- contractor account demand
- job quote readiness
- job or service order readiness
- HVAC equipment availability
- replacement/service part availability
- branch/location stock
- reserved inventory risk
- substitute option
- warranty/replacement context
- backorder/replenishment status
- pickup/jobsite delivery readiness
- install/service promise confidence
- margin leakage
- refrigerant caution

## Required Proof Roles

Required proof roles:

- `customer`
- `contractor_account`
- `job_or_service_order`
- `hvac_equipment_availability`
- `replacement_or_service_part`
- `branch_location_stock`

## Optional Proof Roles

Optional proof roles:

- `reserved_or_substitute_option`
- `warranty_or_replacement_context`
- `backorder_or_replenishment_status`
- `pickup_or_jobsite_delivery`
- `install_service_promise_context`
- `margin_context`
- `refrigerant_or_regulated_item_caution`

## Invalid / Anti-Leak Roles

- `building_materials_job_order_without_hvac_evidence`
- `wholesale_janitorial_contract_replenishment_without_janitorial_evidence`
- `dealer_allocation_or_channel_fulfillment_without_dealer_evidence`
- `style_matrix_or_store_ecommerce_without_retail_evidence`
- `dispatch_work_order_or_truck_stock_without_parts_service_evidence`
- `clinic_supply_substitute_without_medical_dental_evidence`
- `lot_release_or_qa_validation_without_life_sciences_evidence`
- `food_formula_or_batch_without_food_evidence`
- `configured_equipment_assembly_without_industrial_evidence`
- `manufacturing_routing_or_wip_without_explicit_manufacturing_evidence`

Forbidden vocabulary unless evidence explicitly supports it:

- lumber
- doors
- windows
- special order materials
- contract replenishment
- recurring order
- route delivery readiness
- restroom paper
- cleaning chemicals
- dealer allocation
- channel fulfillment
- style/color/size
- store/ecommerce promise
- clinic supply substitutes
- QA release
- lot/release readiness
- validation documentation
- traceability
- food batch
- ingredient readiness
- packaging readiness
- configured equipment assembly
- engineering BOM
- manufacturing routing
- WIP
- work center

## Resolution Safety

Summit evidence resolves to `hvac-mechanical-contractor-supply-service-readiness`.

Horizon evidence resolves to `hvac-mechanical-contractor-supply-service-readiness`.

Weak or generic equipment evidence does not resolve as HVAC.

Building Materials is not used for HVAC evidence.

Parts/Service is not used for HVAC evidence.

Generic Industrial Distribution remains adjacent but is not selected for Summit or Horizon evidence.

## Consultant Story Surface

The source pack produces a safe consultant story without measured ROI claims.

Proof move: open the contractor account, job or service order, HVAC equipment availability, replacement or service part, branch/location stock, reserved or substitute option, warranty or replacement context, backorder or replenishment status, and pickup or jobsite delivery readiness before the contractor or technician commitment is made.

Largest value to prove: protect install or service promise confidence and margin by proving HVAC equipment availability, replacement part availability, branch stock, substitute options, warranty context, replenishment status, and pickup or delivery readiness before the contractor commitment.

Competitive pressure remains advisory-only unless confirmed. Ferguson, Johnstone, Epicor, QuickBooks, spreadsheets, counter POS, vendor portals, and branch-by-branch calls remain watch-outs, not unsupported feature claims.

Measured savings require a customer baseline.

## UX / Authority Preservation

- ROI/Competitive remains flow-based.
- Run/Open-link authority remains verified-import-only.
- Imported proof records remain collapsed by default.
- Support and receipt surfaces remain lane-consistent and collapsed.
- public website/category evidence resolves pack confidence.
- messy notes shape pain, ROI, objections, and run coaching.
- N/LLM remains advisory-only.
- Open links remain verified-import-only.
- No fake Open links.

## Manufacturing / WIP Posture

Manufacturing/WIP default: off

HVAC contractor supply should not invite Manufacturing/WIP by default.

Do not weaken W393 WIP best-effort diagnostics.

## Readiness Matrix

| Lane | Status | Evidence | Notes |
| --- | --- | --- | --- |
| HVAC / Mechanical Contractor Supply & Service Readiness | `ready_now` | W404, W405, W406, W407 | Direct source pack now covers the two-fixture pattern. |
| Wholesale Janitorial / Contract Replenishment | `ready_now` | W399-W403 | Locked ready adjacent lane. |
| Building Materials / Contractor Supply & Project Fulfillment | `ready_now` | W391, W394, W395, W396, W397 | Locked ready baseline. |
| Existing source-pack-ready lanes | `ready_now` | W379-W383 | No changes in W407. |

Other readiness states:

- `ready_with_fixture_only_proof`: no longer applies to HVAC after W407.
- `needs_scoped_source_pack_cleanup`: no longer applies to HVAC after W407 unless a future harness finds drift.
- `requires_future_live_smoke_only_if_integration_risk_changes`: live smoke only if upload/deploy, runner, adapter, record creation, import validation, generated proof roles, or Open-link authority changes.

## Boundary Preservation

- No live smoke in W407.
- No upload or deployment.
- No runtime upload package creation.
- No package creation or package mutation.
- W403, W397, and W386 packages were not mutated.
- No fake Open links.
- No new drawer transaction write paths.
- No runner, adapter, record creation, import validation, or Open-link authority changes.
- completed-result import validation was not changed.
- Keep N/LLM advisory only.
- No broad source-pack abstractions.
- Do not flatten lane-specific language into generic coaching.
- Do not treat W403, W397, or W386 as runtime code.
- W407 no-regression gates passed.

## Validation Commands

```bash
node --check archive/tools/run_w407_hvac_mechanical_source_pack_cleanup_harness.js
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json parsed')"
npm run harness:hvac-mechanical-source-pack-cleanup-w407
npm run harness:hvac-mechanical-second-fixture-decision-w406
npm run harness:hvac-mechanical-fixture-story-proof-w405
npm run harness:hvac-mechanical-fixture-first-selection-w404
npm run harness:wholesale-janitorial-readiness-delta-package-w403
npm run harness:wholesale-janitorial-source-pack-cleanup-w402
```

## Verification Results

```text
node --check archive/tools/run_w407_hvac_mechanical_source_pack_cleanup_harness.js: passed
package.json parse check: passed
W407 HVAC/Mechanical source-pack cleanup harness: 16/16 passed
W406 HVAC/Mechanical second fixture decision harness: 19/19 passed
W405 HVAC/Mechanical fixture story proof harness: 15/15 passed
W404 HVAC/Mechanical fixture-first selection harness: 15/15 passed
W403 Wholesale Janitorial readiness delta package harness: 13/13 passed
W402 Wholesale Janitorial source-pack cleanup harness: 16/16 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W406 two-fixture baseline preservation | Pass | W406 remains locked. |
| W405 Summit baseline preservation | Pass | First fixture remains locked. |
| W404 selection baseline preservation | Pass | Selection remains locked. |
| HVAC source-pack presence | Pass | `hvac-mechanical-contractor-supply-service-readiness` exists and validates. |
| Website/category signal coverage | Pass | HVAC supply, equipment, parts, stock, warranty, replenishment, pickup, and delivery signals are covered. |
| Evidence signal coverage | Pass | Two-fixture evidence terms are covered. |
| Required proof-role coverage | Pass | Required roles are covered. |
| Optional proof-role visibility | Pass | Optional roles are visible and HVAC-shaped. |
| Invalid/anti-leak role coverage | Pass | Invalid roles and forbidden vocabulary are covered. |
| Lane-pack validation | Pass | `validateLanePack(...)` accepts the new pack and all packs. |
| Lane-pack resolution safety | Pass | Summit and Horizon resolve; weak generic equipment evidence does not. |
| Consultant story surface safety | Pass | Story surface avoids measured ROI and keeps baseline-required caution. |
| Manufacturing/WIP default-off posture | Pass | Pack uses `distribution_replenishment` and does not invite Manufacturing/WIP. |
| W393 WIP diagnostics preservation | Pass | WIP best-effort diagnostics are not weakened. |
| ROI/Run behavior preservation | Pass | Flow and verified-import-only Open-link boundaries are preserved. |
| Open-link authority preservation | Pass | Verified-import-only posture preserved. |
| Claim safety | Pass | Baseline-required caution preserved. |
| Confidence/source separation | Pass | Website, notes, advisory, import proof, and Open-link authority remain separated. |
| No fake Open links | Pass | No fake links added. |
| No live smoke/no upload boundary | Pass | No smoke, upload, deployment, or package creation. |
| W403/W397/W386 package preservation | Pass | Packages remain intact. |
| No-regression gates | Pass | W407 no-regression gates passed. |

## Recommendation

Lock HVAC source-pack readiness and prepare a small readiness delta package next.

Do not run live smoke unless runner, adapter, import validation, record creation, generated proof roles, upload/deploy, or Open-link authority changes.
