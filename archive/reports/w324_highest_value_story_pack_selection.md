# W324: Highest-Value Industry Story Pack Selection

## Selection

Selected pack: `electrical-components-distributor-review-only`

Selected fixture: `metrovolt-electrical-components-counter-sales`

Source baseline: W323 first-call differentiation fixtures and scoring model.

## Why This Pack

Electrical Components Distribution / Contractor Counter Sales is the highest-value implementation candidate because it improves the live story for the same proven distribution writeback path without mutating `src/contracts/lanePacks.js`. The buyer problem is specific, common, and demoable: counter teams need to prove contractor-critical availability, alternates, branch transfer, and supplier ETA confidence before promising the job.

The selected pack reuses the W322 distribution-safe record roles:

- Customer
- Sales Order
- Product SKU
- Branch Availability / Replenishment Flow
- Fulfillment Support SKU

## Expected Live Story Improvement

The live Review/Run story should sound less generic and more like a first-call follow-up for an electrical distributor:

- Buyer problem summary names contractor counter promise risk.
- Proof move opens the Product SKU and ties it to branch transfer, replenishment, and fulfillment support.
- Objection response answers callback risk without claiming guaranteed delivery.
- Competitive contrast names Eclipse reports, supplier portals, Excel sheets, and customer texts.
- ROI-safe framing stays at risk reduction: fewer callbacks, faster counter decisions, and margin protection after the baseline is confirmed.
- No-claim caution blocks measured ROI, guaranteed delivery, manufacturing/WIP, write actions, and source-pack truth.
- Weak-evidence behavior keeps the electrical pack review-only until website/category evidence is confirmed.

## Risks

- Electrical terminology could imply a source lane pack exists. Guardrail: the story marks the pack as review-only and does not mutate `src/contracts/lanePacks.js`.
- Better story copy could accidentally look like stronger evidence. Guardrail: weak-evidence confirmation remains visible and N/LLM stays advisory-only.
- Record labels could leak legacy manufacturing vocabulary from generic item roles. Guardrail: W322 labels stay frozen and map distribution proof records to Product SKU, Branch Availability / Replenishment Flow, and Fulfillment Support SKU.

## Rollback Boundary

Rollback is limited to the W324 story-shaping overlay in `idb-drawer.user.js` and the W324 archive/harness files. The W321 writeback baseline, W322 distribution vocabulary baseline, W151/W214/W245 validation, W144 submit/refresh/import, Open-link authority, and `src/contracts/lanePacks.js` are outside the rollback scope and were not changed.

## Guardrails

- W321 live writeback baseline remains frozen.
- W322 distribution vocabulary/story polish remains frozen.
- No source lane-pack mutation.
- No proposed pack installation.
- No lane-resolution behavior change.
- No W144 submit/refresh/import change.
- No W151/W214/W245 validation change.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.
