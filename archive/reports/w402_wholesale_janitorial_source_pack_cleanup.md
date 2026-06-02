# W402: Wholesale Janitorial Source-Pack Readiness Cleanup

Date: 2026-06-02

Use W401 Wholesale Janitorial Second Fixture Proof and Source-Pack Cleanup Decision as the locked two-fixture readiness baseline. Keep W400 Wholesale Janitorial Source-Pack Readiness Review, W399 Brightline fixture proof, W398 expansion restart, W397 Building Materials readiness delta package, W396 Building Materials source-pack readiness, W389 runtime release routing, W388 final archive handoff, W386 source-pack readiness evidence package, and W379-W383 source-pack-ready lane baselines locked.

## Summary

W402 adds the scoped Wholesale Janitorial source pack after the W399 Brightline fixture and W401 MetroCare second fixture proved a stable contract replenishment lane shape.

No live smoke in W402. No upload or deployment was performed. No runtime upload package creation occurred. No package was created or mutated.

W400 remains preserved as the historical second-fixture decision gate.

W397 and W386 packages were not mutated. Do not mutate W397 or W386 packages.

No runner, adapter, record creation, import validation, or Open-link authority changes were made.

Wholesale Janitorial readiness status: `ready_now`

## Source-Pack Identity

- lane id: `wholesale_janitorial`
- pack id: `wholesale-janitorial-contract-replenishment`
- label: `Wholesale Janitorial Contract Replenishment`
- operating mode: `distribution_replenishment`
- Manufacturing/WIP default: off

Wholesale Janitorial should not invite Manufacturing/WIP by default.

## Fixture Baselines

Brightline Facility Supply remains the first fixture baseline.

MetroCare Janitorial Supply remains the second fixture baseline.

Together, Brightline and MetroCare prove that Wholesale Janitorial is not a one-off story. The lane can handle janitorial supply, facility supply, contract customer demand, recurring orders, approved or preferred items, substitutes, backorders, replenishment cadence, route delivery, delivery readiness, margin leakage, and customer promise confidence.

## Website / Category Signals

- janitorial supply
- facility supply
- facility maintenance
- restroom paper
- soaps
- cleaning chemicals
- floor care
- liners
- dispensers
- gloves
- safety supplies
- property management
- schools
- healthcare offices
- contract replenishment
- recurring order
- route delivery
- substitute product
- backorder
- replenishment cadence
- contracted pricing
- preferred items

## Evidence Signals

- contract customer demand
- recurring order readiness
- facility/location supply availability
- preferred item or contracted item context
- substitute product readiness
- backorder exposure
- replenishment cadence
- route/delivery readiness
- margin leakage
- customer promise confidence
- contracted pricing context

## Required Proof Roles

Required proof roles:

- `customer`
- `contract_account`
- `recurring_order`
- `facility_item_availability`

## Optional Proof Roles

Optional proof roles:

- `preferred_or_substitute_item`
- `backorder_or_replenishment_status`
- `route_or_delivery_readiness`
- `margin_context`
- `customer_promise_context`
- `contract_pricing_context`

## Invalid / Anti-Leak Roles

- `contractor_job_order_without_building_materials_evidence`
- `will_call_or_jobsite_delivery_without_building_materials_evidence`
- `dealer_availability_or_channel_fulfillment_without_dealer_evidence`
- `style_matrix_or_store_ecommerce_without_retail_evidence`
- `work_order_or_dispatch_without_parts_service_evidence`
- `clinic_supply_substitute_without_medical_dental_evidence`
- `lot_release_or_qa_validation_without_life_sciences_evidence`
- `food_formula_or_batch_without_food_evidence`
- `configured_equipment_assembly_without_industrial_evidence`
- `manufacturing_routing_or_wip_without_explicit_manufacturing_evidence`

Forbidden vocabulary unless evidence explicitly supports it:

- contractor job order
- will-call pickup
- jobsite delivery
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
- traceability
- food batch
- ingredient readiness
- configured equipment assembly
- manufacturing routing
- WIP
- work center

## Resolution Safety

Brightline evidence resolves to `wholesale-janitorial-contract-replenishment`.

MetroCare evidence resolves to `wholesale-janitorial-contract-replenishment`.

Weak or generic supply evidence does not resolve as Wholesale Janitorial.

Generic Industrial Distribution remains adjacent but is not selected for Brightline or MetroCare evidence.

Building Materials is not used for Wholesale Janitorial evidence.

## Consultant Story Surface

The source pack produces a safe consultant story without measured ROI claims.

Proof move: open the contract account, recurring order, facility item availability, preferred or substitute item, backorder or replenishment status, and route or delivery readiness before the recurring customer promise is made.

Largest value to prove: protect recurring customer promise confidence and margin by proving facility availability, substitute readiness, backorder exposure, replenishment cadence, and delivery readiness before the next contract shipment.

Competitive pressure remains advisory-only unless confirmed. QuickBooks, spreadsheets, route sheets, route apps, and janitorial distributor software remain watch-outs, not unsupported feature claims.

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

Wholesale Janitorial should not invite Manufacturing/WIP by default.

Do not weaken W393 WIP best-effort diagnostics.

## Readiness Matrix

| Lane | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Wholesale Janitorial / Contract Replenishment | `ready_now` | W399, W400, W401, W402 | Direct source pack now covers the two-fixture pattern. |
| Building Materials / Contractor Supply & Project Fulfillment | `ready_now` | W391, W394, W395, W396, W397 | Locked ready baseline. |
| Existing source-pack-ready lanes | `ready_now` | W379-W383 | No changes in W402. |

Other readiness states:

- `ready_with_fixture_only_proof`: no longer applies to Wholesale Janitorial after W402.
- `needs_scoped_source_pack_cleanup`: no longer applies to Wholesale Janitorial after W402 unless a future harness finds drift.
- `requires_future_live_smoke_only_if_integration_risk_changes`: live smoke only if upload/deploy, runner, adapter, record creation, import validation, generated proof roles, or Open-link authority changes.

## Boundary Preservation

- No live smoke in W402.
- No upload or deployment.
- No runtime upload package creation.
- No package creation or package mutation.
- W397 and W386 packages were not mutated.
- No fake Open links.
- No new drawer transaction write paths.
- No runner, adapter, record creation, import validation, or Open-link authority changes.
- completed-result import validation was not changed.
- Keep N/LLM advisory only.
- No broad source-pack abstractions.
- Do not flatten lane-specific language into generic coaching.
- Do not treat W386 or W397 as runtime code.
- W402 no-regression gates passed.

## Validation Commands

```bash
node --check archive/tools/run_w402_wholesale_janitorial_source_pack_cleanup_harness.js
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json parsed')"
npm run harness:wholesale-janitorial-source-pack-cleanup-w402
npm run harness:wholesale-janitorial-second-fixture-decision-w401
npm run harness:wholesale-janitorial-source-pack-readiness-decision-w400
npm run harness:wholesale-janitorial-fixture-story-proof-w399
npm run harness:fixture-first-expansion-restart-after-building-materials-package-w398
npm run harness:building-materials-readiness-delta-package-w397
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
node --check archive/tools/run_w402_wholesale_janitorial_source_pack_cleanup_harness.js: passed
package.json parse check: passed
W402 Wholesale Janitorial source-pack cleanup harness: 16/16 passed
W401 Wholesale Janitorial second fixture decision harness: 15/15 passed
W400 Wholesale Janitorial source-pack readiness decision harness: 16/16 passed
W399 Wholesale Janitorial fixture story proof harness: 16/16 passed
W398 fixture-first expansion restart after Building Materials package harness: 15/15 passed
W397 Building Materials readiness delta package harness: 13/13 passed
W386 pack-ready artifact package harness: 8/8 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W401 two-fixture baseline preservation | Pass | W401 remains locked with MetroCare and `ready_for_scoped_source_pack_cleanup`. |
| W399 Brightline baseline preservation | Pass | First fixture remains locked. |
| Wholesale Janitorial source-pack presence | Pass | `wholesale-janitorial-contract-replenishment` exists and validates. |
| Website/category signal coverage | Pass | Janitorial, facility, recurring order, route delivery, preferred item, backorder, and replenishment signals are covered. |
| Evidence signal coverage | Pass | Contract demand, recurring readiness, facility availability, substitutes, backorders, route readiness, margin, and promise confidence are covered. |
| Required proof-role coverage | Pass | Required roles are covered. |
| Optional proof-role visibility | Pass | Optional roles are visible and contract-shaped. |
| Invalid/anti-leak role coverage | Pass | Cross-lane invalid roles are present. |
| Lane-pack validation | Pass | `validateLanePack(...)` accepts the new pack and all packs. |
| Lane-pack resolution safety | Pass | Brightline and MetroCare resolve; weak generic supply evidence does not. |
| Consultant story surface safety | Pass | Story surface avoids measured ROI and keeps baseline-required caution. |
| Manufacturing/WIP default-off posture | Pass | Pack uses `distribution_replenishment` and does not invite Manufacturing/WIP. |
| W393 WIP diagnostics preservation | Pass | WIP best-effort diagnostics are not weakened. |
| ROI/Run behavior preservation | Pass | Flow and verified-import-only Open-link boundaries are preserved. |
| Open-link authority preservation | Pass | Verified-import-only posture preserved. |
| Claim safety | Pass | Baseline-required caution preserved. |
| Confidence/source separation | Pass | Website, notes, advisory, import proof, and Open-link authority remain separated. |
| No fake Open links | Pass | No fake links added. |
| No live smoke/no upload boundary | Pass | No smoke, upload, deployment, or package creation. |
| W397/W386 package preservation | Pass | Packages remain intact. |
| No-regression gates | Pass | W402 no-regression gates passed. |

## Recommendation

Lock Wholesale Janitorial source-pack readiness and prepare a small readiness delta package next.

Do not run live smoke unless runner, adapter, import validation, record creation, generated proof roles, upload/deploy, or Open-link authority changes.
