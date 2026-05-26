# W308 Review-Only Candidate Industry Pack Proposal Packet

Status: `review_only_candidate_packet_ready`

## Summary

W308 creates the first review-only candidate industry/sub-industry pack proposal packet using the W307 authoring plan.

Candidate:

- Electrical Components Distributor
- Base comparison target: `industrial-distributor`
- Proposed pack id: `electrical-components-distributor`
- Source pack file: `src/contracts/lanePacks.js`

This packet is not source truth, is not installable, and is not wired into drawer runtime.

## Candidate Evidence

The candidate is distribution-adjacent and reuses the industrial distributor base lane:

- Website/category evidence: electrical components, wire, cable, switchgear, branch availability.
- Matched signals: supplier lead time, replenishment, project fulfillment.
- Website authority remains required before any source change.

## Proposed Roles

Required:

- `customer`
- `sales_order`
- `branch_or_product_sku`
- `replenishment_or_availability_flow`

Optional:

- `supporting_sku`
- `supplier_lead_time_context`
- `location_planning_context`

Invalid:

- `formula_or_batch_structure`
- `work_order_or_wip_object`
- `style_matrix_or_availability_flow`

## Proposed Vocabulary

Allowed:

- branch availability
- supplier lead time
- project fulfillment
- replenishment
- component SKU

Forbidden:

- ingredient batch
- style matrix
- production routing
- measured ROI
- guaranteed savings

## Draft Story Copy

Proof move:

- Open the electrical component SKU and prove branch availability, supplier timing, and replenishment confidence for the project promise.

Story anchor:

- The buyer needs confidence that project-critical components can be promised from the right location.

ROI-safe so-what:

- Protect service levels and margin by catching supplier and branch exceptions before project fulfillment misses.

Competitive contrast:

- NetSuite connects order promise, branch inventory, and replenishment action without a separate lookup path.

## Review Expectations

- W247 authoring/review: required before source change.
- W251 proposed diff review: required before source change.
- W252 admin-safe review: review-only, hidden from normal consultant UI, no install action.
- W255 receipt-driven QA: required before source change.
- W304-W306 readiness: required before source change.
- Human code review: required before mutating `src/contracts/lanePacks.js`.
- Post-install smoke: required if a reviewed pack lands later.

## Acceptance Packet

Decision: `review_only_ready`

- Non-installable: true.
- Source truth: false.
- Runtime wired: false.
- Auto-install: false.
- Source pack mutation: false.
- N/LLM authority: advisory only.
- Uncertainty: visible.
- Weak/conflicting evidence: confirmation-first.

## Guardrails

- No source pack mutation.
- No proposed pack install or auto-install.
- No lane choice or confidence change.
- No website evidence or consultant toggle override.
- No hidden uncertainty.
- No UI rendering or visible copy change.
- No connected build change.
- No returned-record import change.
- No record creation, transaction write, Open-link creation, or adapter invocation.
- No W245/W151/W214 validity declaration.

## Visual Testing Decision

Broad visual testing is not required because W308 is an archived review-only candidate packet with no runtime or UI change.
