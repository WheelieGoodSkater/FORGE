# W365: Dealer Hardgoods Fixture-Only Lane Polish

W365 uses W364 as the baseline and stays fixture-only. No live smoke was run. The change is scoped to the consultant-facing story layer and model copy so Dealer Hardgoods & Channel Fulfillment can reuse the current imported proof record spine without pretending the NetSuite records were created for a new lane.

## What Changed

- Drawer marker advances to `Drawer 1.0.12 / W365`.
- Dealer Hardgoods now speaks in dealer/channel terms: SKU availability, allocation position, replenishment timing, supplier lead-time exposure, and channel fulfillment confidence.
- Run adds a compact `Dealer/channel proof path` card when the selected lane is Dealer Hardgoods.
- Value adds a `Dealer/channel lens` card so the consultant has a distinct value frame without crowding the W361 cockpit.
- Competitive advisory now prefers dealer/channel alternatives: dealer portals, supplier portals, allocation spreadsheets, inventory add-ons, QuickBooks plus spreadsheets, and Odoo.
- Existing imported records, Open links, build/import confidence, public/advisory evidence separation, W361 Run cockpit, W362 competitive lens, and W363 Trace cleanup remain in place.

## Fixture Proof

The harness adapts the locked Graybar, Fastenal, and MSC traces at the story layer only:

| Fixture | Result | Evidence |
| --- | --- | --- |
| Graybar locked trace | Pass | Dealer/channel copy renders while imported Open links remain verified. |
| Fastenal locked trace | Pass | Public/advisory confidence remains separate from story-layer dealer polish. |
| MSC locked trace | Pass | Needs-confirmation public read and advisory support remain visible; dealer copy does not alter import validation. |

## Pass / Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Runtime marker | Pass | `Drawer 1.0.12 / W365` appears from the current source. |
| Fixture-only story layer | Pass | `dealerHardgoodsStoryPolishW365` reports `storyLayerOnly`, no drawer writes, no transaction writes, no fake Open links, and unchanged completed-result validation. |
| Dealer/channel specificity | Pass | Run and Value surfaces mention allocation, supplier lead-time risk, replenishment, and channel fulfillment. |
| Imported proof spine | Pass | Locked traces keep verified imported records and Open-link authority. |
| Confidence separation | Pass | Public evidence, advisory inference, build/import proof, and Open links remain separate. |
| W361/W362/W363 no-regression | Pass | Run cockpit, competitive lens, and operator Trace cleanup remain present. |

## Boundaries

- No new drawer transaction write paths.
- No fake Open links.
- No runner, adapter, record creation, or import validation behavior changed.
- No completed-result validation weakening.
- N/LLM remains advisory only.
- Dealer Hardgoods remains fixture-only until a targeted live dealer/channel smoke is intentionally run.

## Recommendation

Run one targeted live dealer/channel smoke only if the team wants evidence that the story-layer dealer lane feels right against real NetSuite pages. The safest next live candidate is a dealer/channel hardgoods prospect with public evidence around products, dealers/channels, replenishment, and supplier lead-time pressure. If speed matters more, continue fixture lane-pack work for Apparel & Accessories before returning to live smoke.

## Next Prompt Block

Move through W366: Targeted dealer/channel live smoke readiness.

Use W365 as the fixture-only baseline. Do not run live smoke until the operator confirms the deployment marker is current. Prepare a single dealer/channel hardgoods smoke candidate, run W347 deployment sync guard, and verify only focused surfaces: Plan confidence, Website Read, Build/Open links, Run dealer/channel proof path, Value dealer/channel lens, and Trace operator evidence.

Boundaries:
- No new drawer transaction write paths.
- No fake Open links.
- Do not change runner, adapter, or record creation behavior.
- Do not weaken completed-result import validation.
- Keep N/LLM advisory only.

Deliverables:
- Targeted dealer/channel smoke candidate and run notes.
- Pass/fail table for dealer/channel specificity, build/import proof, Open links, advisory/public evidence separation, and Run claim safety.
- Recommendation: lock Dealer Hardgoods for broader lane expansion, patch one UX issue, or stay fixture-only.
