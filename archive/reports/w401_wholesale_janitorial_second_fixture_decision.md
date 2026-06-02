# W401: Wholesale Janitorial Second Fixture Proof and Source-Pack Cleanup Decision

Date: 2026-06-02

Use W400 Wholesale Janitorial Source-Pack Readiness Review and Second-Fixture Decision Gate as the locked readiness baseline. Keep W399 Brightline fixture proof, W398 expansion restart, W397 Building Materials readiness delta package, W396 Building Materials readiness, W386 source-pack readiness package, and W389 runtime release routing locked.

## Summary

W401 adds the second fixture-first Wholesale Janitorial proof and updates the readiness decision.

No live smoke in W401. No upload or deployment was performed. No runtime upload package creation occurred. Do not create a new package in W401.

No source-pack mutation was made in W401. Do not create the source pack in W401. Do not add Wholesale Janitorial to runtime source packs in W401.

Brightline Facility Supply remains the first fixture baseline. W398 expansion restart remains locked. Do not mutate W397 or W386 packages.

## Second Fixture Candidate

Name: MetroCare Janitorial Supply

Website: `https://www.metrocarejanitorialsupply.com`

Poorly created sales rep notes:

```text
Talked to account manager maybe Noel or Nora. They sell restroom paper, soaps, cleaning chemicals, floor care stuff, liners, dispensers, gloves, and some safety supplies to office parks, healthcare offices, schools, and property managers. Main headache is contract customers expect the same approved items every month, but the team checks spreadsheets and route sheets to see if items are in stock, substituted, backordered, or loaded for delivery. Some customers have contracted pricing and preferred products but I didn't get the exact terms. They use QuickBooks, spreadsheets, maybe a route app. Need demo around contract account, recurring order, item availability by facility, substitute item, backorder/replenishment status, delivery route readiness, and margin. Competitor maybe QuickBooks, route app, janitorial distributor software, spreadsheets.
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

- MetroCare Contract Account
- MetroCare Recurring Order
- MetroCare Facility Item Availability
- MetroCare Preferred Substitute Item
- MetroCare Backorder Replenishment Status
- MetroCare Route Delivery Readiness

## Two-Fixture Pattern

Brightline and MetroCare both preserve the contract replenishment shape: contract customer, recurring order, facility/location availability, preferred/substitute item, backorder/replenishment, and route/delivery readiness.

The pattern does not collapse into generic customer, item availability, and replenishment.

## Readiness Decision

Readiness decision: `ready_for_scoped_source_pack_cleanup`

Recommended next block: scoped Wholesale Janitorial source-pack cleanup.

Reason: Brightline and MetroCare both prove the lane needs contract customer, recurring order, preferred/substitute item, backorder/replenishment, and route/delivery readiness language. Generic Industrial Distribution is still adjacent, but it cannot preserve the contract replenishment specificity without leaking into generic branch fulfillment.

## Proposed Source-Pack Shape for Next Block

- lane id: `wholesale_janitorial`
- pack id: `wholesale-janitorial-contract-replenishment`
- label: `Wholesale Janitorial Contract Replenishment`
- operating mode: `distribution_replenishment`
- Manufacturing/WIP default: off

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

## ROI / Competitive Flow

Talk track: lead with the buyer risk that recurring facility supply promises break when approved items, substitutions, backorders, replenishment cadence, or delivery route readiness is unclear.

Discovery: ask which recurring contract orders require manual product checks, substitute approvals, backorder follow-up, route-sheet checks, or delivery calls.

Proof move: open contract account, recurring order, facility item availability, preferred/substitute item, backorder/replenishment status, and route/delivery readiness.

Largest value to prove: protect recurring customer promise confidence and margin before the next contract shipment.

Competitive watch-out: QuickBooks, spreadsheets, route apps, old route sheets, and janitorial distributor software are advisory-only unless confirmed.

Claim caution: measured savings require a customer baseline.

Measured savings require a customer baseline.

## UX / Authority Preservation

- ROI/Competitive remains flow-based.
- Run/Open-link authority remains verified-import-only.
- Imported proof records remain collapsed by default.
- Support and receipt surfaces remain lane-consistent and collapsed.
- Competitive pressure remains advisory-only unless confirmed.
- public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated.
- N/LLM remains advisory-only.

## Manufacturing / WIP Posture

Manufacturing/WIP default: off

Wholesale Janitorial should not invite Manufacturing/WIP by default.

Do not weaken W393 WIP best-effort diagnostics.

## Cross-Lane Anti-Leak

Do not leak Building Materials, Dealer Hardgoods, Apparel/Retail, Parts/Service, Medical/Dental, Life Sciences, Food/Beverage, or Industrial Equipment wording without evidence.

Do not collapse Wholesale Janitorial into generic Industrial Distribution.

Forbidden unsupported terms:

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

## Boundary Preservation

- No live smoke.
- No live smoke in W401.
- No upload or deployment.
- No runtime upload package creation.
- Do not create a new package in W401.
- No package mutation.
- Do not mutate W397 or W386 packages.
- No source-pack mutation.
- No source-pack mutation was made in W401.
- Do not add Wholesale Janitorial to runtime source packs in W401.
- No runner, adapter, record creation, import validation, or Open-link authority changes.
- No broad abstractions.
- Do not treat W386 or W397 as runtime code.

## Validation Commands

```bash
node --check archive/tools/run_w401_wholesale_janitorial_second_fixture_decision_harness.js
npm run harness:wholesale-janitorial-second-fixture-decision-w401
npm run harness:wholesale-janitorial-source-pack-readiness-decision-w400
npm run harness:wholesale-janitorial-fixture-story-proof-w399
npm run harness:fixture-first-expansion-restart-after-building-materials-package-w398
npm run harness:building-materials-readiness-delta-package-w397
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
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
| W400 decision baseline preservation | Pass | W400 remains locked. |
| W399 Brightline baseline preservation | Pass | First fixture remains locked. |
| W398 expansion baseline preservation | Pass | W398 remains locked. |
| W397/W386 package preservation | Pass | Packages remain intact. |
| No live smoke/no upload/no package boundary | Pass | No smoke, upload, deployment, or package creation. |
| Second fixture story distinctness | Pass | MetroCare story remains contract replenishment specific. |
| Proof-role coverage | Pass | MetroCare proof roles are present. |
| Two-fixture pattern confirmed | Pass | Brightline and MetroCare preserve same lane shape. |
| Readiness decision updated | Pass | Lane is ready for scoped source-pack cleanup next. |
| ROI/Run/claim/confidence preservation | Pass | Flow and authority boundaries remain intact. |
| Manufacturing/WIP default-off posture | Pass | No default Manufacturing/WIP invitation. |
| Cross-lane anti-leak wording | Pass | Unsupported terms remain guarded. |
| No source-pack mutation | Pass | No source-pack/runtime lane mutation. |
| No-regression gates | Pass | W401 no-regression gates passed. |

## Recommendation

Prepare scoped Wholesale Janitorial source-pack cleanup next.

Do not run live smoke unless runner, adapter, import validation, record creation, generated proof roles, upload/deploy, or Open-link authority changes.
