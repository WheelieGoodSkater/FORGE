# W400: Wholesale Janitorial Source-Pack Readiness Review and Second-Fixture Decision Gate

Date: 2026-06-02

Use W399 Wholesale Janitorial Fixture-First Story Proof and Cross-Lane Validation as the locked fixture-story baseline. Keep W398 fixture-first expansion restart locked. Keep W397 Building Materials readiness delta package, W396 Building Materials pack-readiness, W394 Building Materials source-pack/toggle guard, W393 WIP routing diagnostics, W386 source-pack readiness package, and W389 runtime release routing locked.

## Summary

W400 reviews Wholesale Janitorial source-pack readiness and makes the second-fixture decision.

No live smoke in W400. No upload or deployment was performed. No runtime upload package creation occurred. Do not create a new package in W400.

No source-pack mutation was made in W400. Do not create the source pack in W400. Do not add Wholesale Janitorial to runtime source packs in W400.

Building Materials remains the locked ready lane baseline. W386 source-pack readiness package remains untouched. Do not mutate W397 or W386 packages.

## Readiness Decision

Readiness decision: `needs_second_fixture_first`

Recommended next block: run one more fixture-first Wholesale Janitorial proof before source-pack mutation.

Reason: Brightline proves a distinct and promising contract-replenishment story, but one fixture is not enough to decide whether Wholesale Janitorial requires a direct source pack or should remain a distribution variant. The second fixture should confirm whether contract customer, recurring order, facility/location availability, preferred/substitute item, backorder/replenishment, and route/delivery readiness remain stable outside Brightline.

## Readiness Matrix

| Decision | Status | Evidence |
| --- | --- | --- |
| `ready_for_scoped_source_pack_cleanup` | Not yet | One fixture proves story, but a second fixture should confirm the pattern. |
| `needs_second_fixture_first` | Selected | Brightline story is distinct, but source-pack mutation should wait for another fixture. |
| `treat_as_distribution_variant_for_now` | Not selected | Generic distribution cannot safely preserve contract customer, recurring order, route/delivery, and preferred/substitute item specificity yet. |
| `requires_future_live_smoke_only_if_integration_risk_changes` | Always true | Live smoke only if runner, adapter, import validation, record creation, generated proof roles, upload/deploy, or Open-link authority changes. |

## Proposed Future Source-Pack Shape

- proposed lane id: `wholesale_janitorial`
- proposed pack id: `wholesale-janitorial-contract-replenishment`
- proposed label: `Wholesale Janitorial Contract Replenishment`
- likely operating mode: `distribution_replenishment`
- Manufacturing/WIP default: off

Wholesale Janitorial should not invite Manufacturing/WIP by default.

## Source / Category Signals Reviewed

- wholesale janitorial
- facility supply
- janitorial supplies
- paper products
- cleaning chemicals
- dispensers
- trash liners
- safety supplies
- contract customer
- recurring orders
- facility locations
- route delivery
- backorders
- substitute products
- replenishment cadence

## Evidence Signals Reviewed

- contract customer demand
- recurring order readiness
- facility/location supply availability
- preferred item or contracted item context
- substitute product readiness
- backorder exposure
- route/delivery readiness
- replenishment cadence
- margin leakage
- customer promise confidence

## Proof Roles Reviewed

Required proof roles:

- `customer`
- `contract_account`
- `recurring_order`
- `facility_item_availability`

Optional proof roles:

- `preferred_or_substitute_item`
- `backorder_or_replenishment_status`
- `route_or_delivery_readiness`
- `margin_context`
- `customer_promise_context`
- `contract_pricing_context`

## Existing-Lane Fit Reviewed

Existing-lane fit reviewed: generic Industrial Distribution cannot safely host the story without losing contract customer, recurring order, route/delivery, and preferred/substitute item specificity.

Existing industrial distribution can cover customer, item availability, replenishment, and fulfillment broadly. That is not enough for the Brightline story, which needs recurring contract replenishment, preferred/substitute items, and route/delivery readiness.

A distribution variant remains possible only if the second fixture collapses back to generic customer, item availability, and replenishment.

## Anti-Leak Roles Reviewed

- `contractor_job_order_without_building_materials_evidence`
- `will_call_or_jobsite_delivery_without_building_materials_evidence`
- `dealer_allocation_or_channel_fulfillment_without_dealer_evidence`
- `style_matrix_or_size_color_variant_without_apparel_evidence`
- `technician_truck_stock_or_work_order_without_parts_service_evidence`
- `clinic_supply_or_dental_equipment_without_medical_dental_evidence`
- `lot_release_or_qa_validation_without_life_sciences_evidence`
- `food_formula_or_batch_without_food_evidence`
- `configured_equipment_assembly_or_wip_without_industrial_evidence`

Forbidden vocabulary:

- contractor job order
- will-call pickup
- jobsite delivery
- special order materials
- dealer allocation
- channel fulfillment
- style/color/size
- technician truck stock
- first-time fix
- clinic supply substitutes
- QA release
- lot/release readiness
- food batch
- configured equipment assembly
- manufacturing routing
- WIP
- work center

## UX / Authority Preservation

- ROI/Competitive remains flow-based.
- Run/Open-link authority remains verified-import-only.
- Imported proof records remain collapsed by default.
- Support and receipt surfaces remain lane-consistent and collapsed.
- Measured savings require a customer baseline.
- Competitive pressure remains advisory-only unless confirmed.
- public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated.
- N/LLM remains advisory-only.

## Manufacturing / WIP Posture

Manufacturing/WIP default: off

Wholesale Janitorial should not invite Manufacturing/WIP by default.

Do not weaken W393 WIP best-effort diagnostics.

## Boundary Preservation

- No live smoke.
- No live smoke in W400.
- No upload or deployment.
- No runtime upload package creation.
- Do not create a new package in W400.
- No package mutation.
- Do not mutate W397 or W386 packages.
- No source-pack mutation.
- No source-pack mutation was made in W400.
- Do not add Wholesale Janitorial to runtime source packs in W400.
- No runner, adapter, record creation, import validation, or Open-link authority changes.
- No broad abstractions.
- Do not treat W386 or W397 as runtime code.

## Validation Commands

```bash
node --check archive/tools/run_w400_wholesale_janitorial_source_pack_readiness_decision_harness.js
npm run harness:wholesale-janitorial-source-pack-readiness-decision-w400
npm run harness:wholesale-janitorial-fixture-story-proof-w399
npm run harness:fixture-first-expansion-restart-after-building-materials-package-w398
npm run harness:building-materials-readiness-delta-package-w397
npm run harness:building-materials-pack-readiness-w396
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
W400 Wholesale Janitorial source-pack readiness decision harness: 16/16 passed
W399 Wholesale Janitorial fixture story proof harness: 16/16 passed
W398 fixture-first expansion restart after Building Materials package harness: 15/15 passed
W397 Building Materials readiness delta package harness: 13/13 passed
W396 Building Materials pack-readiness harness: 16/16 passed
W386 pack-ready artifact package harness: 8/8 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W399 fixture baseline preservation | Pass | Brightline fixture remains locked. |
| W398 expansion baseline preservation | Pass | W398 remains locked. |
| W397 package baseline preservation | Pass | W397 package remains intact. |
| W396 Building Materials readiness preservation | Pass | Building Materials remains ready. |
| W386 package preservation | Pass | W386 package remains intact. |
| No live smoke/no upload/no package creation boundary | Pass | No smoke, upload, deployment, or package creation. |
| Source-pack readiness decision documented | Pass | Decision matrix is explicit. |
| Existing-lane fit reviewed | Pass | Distribution variant reviewed. |
| Expected proof-role coverage reviewed | Pass | Required and optional roles reviewed. |
| Anti-leak wording reviewed | Pass | Invalid roles and forbidden vocabulary reviewed. |
| Manufacturing/WIP default-off posture | Pass | Default-off posture preserved. |
| ROI/Competitive flow preservation | Pass | Flow remains consultant-ready. |
| Run/Open-link authority preservation | Pass | Verified-import-only posture preserved. |
| Claim safety | Pass | No measured ROI without baseline. |
| Confidence/source separation | Pass | Source and inference remain separated. |
| No source-pack mutation | Pass | No source-pack/runtime lane mutation. |
| No-regression gates | Pass | W400 no-regression gates passed. |

## Recommendation

Run one more fixture-first Wholesale Janitorial proof before source-pack mutation.

If the second fixture preserves the same contract replenishment shape, prepare scoped Wholesale Janitorial source-pack cleanup next. If it collapses into generic branch/distribution readiness, defer as a distribution variant.
