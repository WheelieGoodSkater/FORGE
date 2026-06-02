# W399: Wholesale Janitorial Fixture-First Story Proof and Cross-Lane Validation

Date: 2026-06-02

Use W398 Fixture-First Expansion Restart After Building Materials Packaging as the locked expansion baseline. Keep W397 Building Materials readiness delta package, W396 Building Materials pack-readiness, W394 Building Materials source-pack/toggle guard, W393 WIP routing diagnostics, W386 source-pack readiness package, and W389 runtime release routing locked.

## Summary

W399 proves the Wholesale Janitorial & Facility Supply / Contract Replenishment story through a fixture-first report and harness.

No live smoke in W399. No upload or deployment was performed. No runtime upload package creation occurred. Do not create a new package in W399.

Brightline Facility Supply is selected as fixture proof only. No source-pack mutation was made in W399. Do not add Wholesale Janitorial to runtime source packs in W399. This remains fixture/story proof only.

Building Materials remains the locked ready lane baseline. W386 source-pack readiness package remains untouched. Do not mutate W397 or W386 packages.

## Fixture Candidate

Name: Brightline Facility Supply

Website: `https://www.brightlinefacilitysupply.com`

Poorly created sales rep notes:

```text
Talked to sales ops person maybe Elena or Elaine. They sell janitorial supplies, paper products, cleaning chemicals, dispensers, trash liners, maybe safety stuff to offices, schools, property managers, and small facility groups. Big issue is customers expect recurring orders to just show up but they don't always know if product is in stock, substituted, backordered, or on the right delivery route. Some contracts have preferred items or pricing but I didn't get details. They use spreadsheets, QuickBooks maybe, old route sheets, and a lot of calls. Need demo around contract customer, recurring order, item availability, substitute product, backorder status, delivery readiness, and margin. Competitor maybe QuickBooks, spreadsheets, route app, maybe janitorial distributor software, not sure.
```

## Fixture Story Evidence

Proof label: Wholesale Janitorial Contract Replenishment

Expected story:

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

Expected proof roles:

- `customer / contract account`
- `recurring_order`
- `facility_item_availability`
- `preferred_or_substitute_item`
- `backorder_or_replenishment_status`
- `route_or_delivery_readiness`

Fixture proof names:

- Brightline Contract Account
- Brightline Recurring Order
- Brightline Facility Item Availability
- Brightline Preferred Substitute Item
- Brightline Backorder Replenishment Status
- Brightline Route Delivery Readiness

## ROI / Competitive Flow

Talk track: lead with the buyer risk that recurring facility supply promises break when item availability, substitutions, backorders, replenishment cadence, or delivery route readiness is unclear.

Discovery: ask which recurring orders require manual product checks, substitute approvals, backorder follow-up, route-sheet checks, or delivery calls.

Proof move: open contract customer, recurring order, facility item availability, preferred/substitute item, backorder/replenishment status, and route/delivery readiness.

Largest value to prove: protect recurring customer promise confidence and margin before the next contract shipment.

Competitive watch-out: QuickBooks, spreadsheets, old route sheets, route apps, and janitorial distributor software are advisory-only unless confirmed.

Claim caution: measured savings require a customer baseline.

No measured ROI without a customer-confirmed baseline.

## Run / Open-Link Posture

Run path remains numbered and clickable only when verified Open-link authority exists.

Fixture Open-link examples, if used later, must be real NetSuite-looking fixture links and still treated as fixture proof, not live smoke.

fixture Open links remain fixture proof, not live smoke.

Imported proof records remain collapsed by default.

Support and receipt surfaces remain lane-consistent and collapsed where appropriate.

Support and receipt surfaces remain lane-consistent and collapsed.

Open-link authority remains verified-import-only.

No fake Open links.

## Manufacturing / WIP Posture

Wholesale Janitorial should not invite Manufacturing/WIP by default.

Manufacturing/WIP remains off unless explicit fabrication/manufacturing evidence exists.

Do not weaken W393 WIP best-effort diagnostics.

## Cross-Lane Validation

Validate Wholesale Janitorial against:

- Building Materials
- Dealer Hardgoods
- Apparel/Retail
- Parts/Service
- Medical/Dental
- Food/Beverage
- Industrial Equipment
- Life Sciences
- generic Industrial Distribution

Do not leak Building Materials terms unless evidence explicitly supports them:

- contractor job order
- will-call pickup
- jobsite delivery
- special order materials
- lumber
- doors
- windows
- branch job promise
- project fulfillment

Do not leak Dealer Hardgoods terms unless evidence explicitly supports them:

- dealer allocation
- supplier portals
- channel fulfillment
- dealer/channel promise

Do not leak Apparel/Retail terms unless evidence explicitly supports them:

- style/color/size variants
- seasonal assortment
- store/ecommerce promise
- transfer risk

Do not leak Parts/Service terms unless evidence explicitly supports them:

- technician truck stock
- work order dispatch
- first-time fix
- installed equipment
- warranty exposure
- emergency response

Do not leak Medical/Dental terms unless evidence explicitly supports them:

- clinic supply substitutes
- dental equipment
- compliance-sensitive items

Do not leak Life Sciences terms unless evidence explicitly supports them:

- QA release
- lot/release readiness
- expiration
- validation documentation
- traceability
- regulated shipment

Do not leak Food/Beverage terms unless evidence explicitly supports them:

- food batch
- ingredient readiness
- packaging readiness
- QA/lot readiness
- finished-good readiness
- promotion ship confidence

Do not leak Industrial Equipment terms unless evidence explicitly supports them:

- configured assembly
- component lead time
- build/test/inspection readiness
- engineering BOM
- manufacturing routing
- WIP
- work center
- assembly readiness

Do not collapse into generic industrial distribution unless evidence explicitly supports that path.

## Authority Separation

- public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated.
- Competitive pressure remains advisory-only unless confirmed.
- N/LLM remains advisory-only.

## Boundary Preservation

- No live smoke.
- No live smoke in W399.
- No upload or deployment.
- No runtime upload package creation.
- Do not create a new package in W399.
- No package mutation.
- Do not mutate W397 or W386 packages.
- No source-pack mutation.
- No source-pack mutation was made in W399.
- Do not add Wholesale Janitorial to runtime source packs in W399.
- No runner, adapter, record creation, import validation, or Open-link authority changes.
- No broad abstractions.
- Do not treat W386 or W397 as runtime code.

## Validation Commands

```bash
node --check archive/tools/run_w399_wholesale_janitorial_fixture_story_proof_harness.js
npm run harness:wholesale-janitorial-fixture-story-proof-w399
npm run harness:fixture-first-expansion-restart-after-building-materials-package-w398
npm run harness:building-materials-readiness-delta-package-w397
npm run harness:building-materials-pack-readiness-w396
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
W399 Wholesale Janitorial fixture story proof harness: 16/16 passed
W398 fixture-first expansion restart after Building Materials package harness: 15/15 passed
W397 Building Materials readiness delta package harness: 13/13 passed
W396 Building Materials pack-readiness harness: 16/16 passed
W386 pack-ready artifact package harness: 8/8 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W398 expansion baseline preservation | Pass | W398 remains locked. |
| W397 package baseline preservation | Pass | W397 package remains intact. |
| W396 Building Materials readiness preservation | Pass | Building Materials remains ready. |
| W386 package preservation | Pass | W386 package remains intact. |
| No live smoke/no upload/no package creation boundary | Pass | No smoke, upload, deployment, or package creation. |
| Wholesale Janitorial story distinctness | Pass | Brightline story remains contract replenishment specific. |
| Expected proof-role coverage | Pass | Brightline proof roles are present. |
| ROI/Competitive flow preservation | Pass | Flow remains consultant-ready. |
| Run path/Open-link authority preservation | Pass | Verified-import-only posture preserved. |
| Imported proof record collapse posture | Pass | Imported proof records remain collapsed by default. |
| Support/receipt collapse posture | Pass | Support surfaces remain collapsed/lane-consistent. |
| Manufacturing/WIP default-off posture | Pass | Manufacturing/WIP remains off by default. |
| Cross-lane anti-leak wording | Pass | All comparison lanes are guarded. |
| Claim safety | Pass | No measured ROI without customer baseline. |
| Confidence/source separation | Pass | Source and inference remain separated. |
| No source-pack mutation | Pass | No source-pack/runtime lane mutation. |
| No-regression gates | Pass | W399 no-regression gates passed. |

## Recommendation

Lock Wholesale Janitorial fixture-first story and prepare a scoped source-pack readiness review later.

If the harness exposes generic distribution overlap, patch one story wording or fixture-proof issue before source-pack work.
