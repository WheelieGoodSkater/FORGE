# W392: Keystone Smoke Review, Building Materials Source-Pack Readiness, and WIP Routing Safety Gate

Date: 2026-06-02

Use W391 Fixture-First Building Materials Story Proof and Cross-Lane Validation as the locked fixture-story baseline.

## Summary

W392 reviews the Keystone smoke result and the reported NetSuite Script Execution failure. No additional live smoke in W392. No upload or deployment was performed.

This block is review-first. No runner code was changed in W392. No source-pack mutation was made in W392. No package mutation was made in W392. No new drawer transaction write paths were introduced.

## Review Inputs

- Keystone trace: `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780402790781.json`
- User-reported NetSuite Script Execution error:

```text
INVALID_FLD_VALUE: You have entered an Invalid Field Value 50 for the following field: billofmaterials
```

Error stack:

- `createAndAttachRoutingIfPossible`
- `scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js:1421`
- `routing.setValue({ fieldId: 'billofmaterials', value: Number(bomId) })`

## Trace Findings

The exported drawer trace parsed successfully and confirms:

- Prospect: Keystone Building Supply.
- Drawer: 1.0.24 / W378.
- selected lane: `industrial_equipment`.
- selected story: Industrial Equipment Manufacturing / Assembly.
- website evidence: resolver-limited / low.
- advisory inference: supported / high.
- runner task was queued and result capture was pending.
- Manufacturing enabled: `T`.
- WIP enabled: `T`.
- request lane remained `industrial_equipment`.
- embedded request mode resolved as `food_batch_manufacturing`, which conflicts with the selected Industrial Equipment lane and further supports a source/toggle/mode guard review.

The trace does not include the completed runner failure payload. The user-reported Script Execution error is therefore treated as later NetSuite execution evidence tied to the queued task, not as an imported completed result.

## Three Separated Issues

### 1. Lane/story misclassification

Keystone should not default to Industrial Equipment Manufacturing.

W391 proved Keystone as Building Materials / Contractor Supply fixture-story proof. The Keystone live run instead led with Assembly, component readiness, work center, routing, and WIP status. That is a poor fit for the Keystone notes, which focus on contractor account demand, job order readiness, branch availability, special orders, substitutions, will-call pickup, jobsite delivery, and margin leakage.

### 2. Manufacturing/WIP toggle risk

Building Materials should not use Manufacturing/WIP by default.

Manufacturing/WIP toggles routed this proof into assembly and WIP routing. For Building Materials, the default should be contractor/project fulfillment with distribution-style availability, not manufacturing routing, unless a consultant explicitly confirms a true fabrication or assembly use case.

### 3. BOM routing failure path

Runner source inspection confirms `createAndAttachRoutingIfPossible(...)` sets:

```javascript
routing.setValue({ fieldId: 'billofmaterials', value: Number(bomId) });
```

The reported failure proves NetSuite rejected BOM value `50` for `manufacturingrouting.billofmaterials`.

Likely causes:

- stale or incompatible BOM id
- BOM not valid for the subsidiary/location/routing context
- BOM not attached or valid for the assembly item
- inactive or inaccessible BOM
- routing record constraints

WIP routing creation should be best-effort. If WIP routing fails after core records were created safely, the runner should capture diagnostics, surface the routing failure in manufacturing signoff and trace artifacts, and continue returning completed build results when safe. Do not hide the failure. Do not weaken completed-result import validation.

## Building Materials Source-Pack Readiness Review

No direct Building Materials source pack exists today.

W391 fixture story remains valid and distinct. Existing lanes are not safe enough as a silent host:

- Do not map Keystone temporarily to Industrial Equipment because it leaks manufacturing, assembly, WIP routing, component, and build/test language.
- Do not map Keystone temporarily to Dealer Hardgoods because it risks dealer allocation and channel fulfillment language.
- `industrial_distribution` can only be a temporary fallback with explicit confirmation, because it covers branch availability but does not own contractor job order, special order/substitution, will-call, jobsite delivery, and project fulfillment language.

industrial_distribution can only be a temporary fallback with explicit confirmation.

Conclusion: a future scoped source-pack is needed if Building Materials is going beyond fixture proof.

## Future Building Materials Source-Pack Target

- Proposed lane id: `building_materials`
- Proposed pack id: `building-materials-contractor-supply-project-fulfillment`
- Proposed label: `Building Materials Contractor Supply & Project Fulfillment`
- Likely operating mode: `distribution_replenishment` or scoped contractor/project fulfillment mode.
- Default Manufacturing/WIP: off unless explicitly confirmed by fabrication/assembly evidence.

Expected signals:

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

Expected proof roles:

- customer
- contractor_account
- job_order
- branch_item_availability
- special_order_or_substitution
- will_call_or_jobsite_delivery

Invalid / anti-leak roles:

- dealer_availability_or_replenishment_flow unless explicitly framed as contractor branch availability
- style_matrix_or_availability_flow
- work_order_or_dispatch_without_service_evidence
- technician_truck_stock_without_parts_service_evidence
- clinic_supply_substitute_without_medical_dental_evidence
- lot_release_or_qa_validation_without_life_sciences_evidence
- food_formula_or_batch_without_food_evidence
- configured_equipment_assembly_without_industrial_evidence

## Safety Decision

Recommendation: patch a targeted WIP routing safety issue next.

The W392 review should not patch runner code yet because the next change needs a focused harness around `createAndAttachRoutingIfPossible(...)`. W393 should make WIP routing best-effort:

- catch `INVALID_FLD_VALUE` and other routing set/save failures
- capture diagnostics including assembly id, BOM id, subsidiary, location, routing name, and error text
- return a structured `routingResult` with `status: "skipped_or_failed"` rather than throwing when core records are otherwise safe
- surface the failure in manufacturing signoff and trace artifacts
- continue returning completed build results when core records were created safely
- keep completed-result import validation unchanged

## Authority / Boundary Preservation

- No additional live smoke in W392.
- No upload or deployment.
- No runtime upload package creation.
- Do not mutate the W386 source-pack readiness evidence package.
- No fake Open links.
- Open-link authority remains verified-import-only.
- Do not weaken Open-link authority checks.
- Do not weaken completed-result import validation.
- completed-result import validation remains unchanged.
- N/LLM remains advisory-only.
- W386 remains readiness evidence, not runtime code.

## Validation Commands

```bash
node --check archive/tools/run_w392_keystone_smoke_wip_routing_safety_gate_harness.js
npm run harness:keystone-smoke-wip-routing-safety-gate-w392
npm run harness:building-materials-fixture-story-proof-w391
npm run harness:fixture-first-expansion-restart-w390
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
W392 Keystone smoke WIP routing safety gate harness: 14/14 passed
W391 Building Materials fixture-first story proof harness: 15/15 passed
W390 fixture-first expansion restart harness: 13/13 passed
W386 pack-ready artifact package harness: 8/8 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| Keystone trace parsed | Pass | Trace parsed and contains Keystone queued runner evidence. |
| Lane/story misclassification identified | Pass | Trace selected Industrial Equipment Manufacturing while W391 proves Building Materials. |
| Manufacturing/WIP toggle risk identified | Pass | Trace submitted Manufacturing and WIP as `T`; Building Materials should not default to this. |
| BOM routing failure path identified | Pass | Runner source sets `manufacturingrouting.billofmaterials`; user error shows BOM `50` rejected. |
| Building Materials fixture-story preservation | Pass | W391 fixture proof remains valid and distinct. |
| Source-pack readiness review | Pass | No direct Building Materials source pack exists today. |
| Existing-lane temporary-fit safety | Pass | Industrial Equipment and Dealer Hardgoods are unsafe silent hosts; Industrial Distribution is explicit-confirmation-only. |
| Expected signal and proof-role coverage | Pass | Building Materials target signals and roles are documented. |
| WIP routing safety recommendation | Pass | W393 should patch WIP routing to degrade safely with diagnostics. |
| No additional live smoke | Pass | No further live smoke was run. |
| No upload/deployment | Pass | No upload or deployment was performed. |
| No fake Open links | Pass | No fake Open links were added. |
| Completed-result import validation preservation | Pass | Validation remains unchanged. |
| Open-link authority preservation | Pass | Open-link authority remains verified-import-only. |
| No-regression gates | Pass | No runner/source-pack/package mutation was made in W392. |

## Recommendation

Patch a targeted WIP routing safety issue next.

Building Materials still needs a future scoped source-pack, but the Keystone smoke exposed a sharper operational risk: WIP routing creation can hard-fail when NetSuite rejects the BOM on `manufacturingrouting.billofmaterials`.

Next block should be W393: Targeted WIP routing best-effort failure handling and diagnostics. Do not run another Keystone live smoke until that safety patch is harnessed and reviewed.
