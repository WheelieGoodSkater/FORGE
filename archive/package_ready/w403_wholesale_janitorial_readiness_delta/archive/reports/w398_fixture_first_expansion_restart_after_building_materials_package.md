# W398: Fixture-First Expansion Restart After Building Materials Packaging

Date: 2026-06-02

Use W397 Post-W386 Building Materials Readiness Delta Package as the locked packaging baseline. Keep W396 Building Materials pack-readiness, W395 second Building Materials fixture, W394 Building Materials source-pack/toggle guard, W393 WIP routing diagnostics, W391 Keystone fixture proof, W386 source-pack readiness package, and W389 runtime release routing locked.

## Summary

W398 restarts fixture-first expansion after W397 packaged the Building Materials readiness delta.

No live smoke in W398. No upload or deployment was performed. No runtime upload package creation occurred. Do not create a new package in W398.

Building Materials is now source-pack-ready and package-ready as readiness evidence. W398 therefore selects the next adjacent fixture-first lane without mutating source packs or runtime behavior.

Do not mutate the W397 Building Materials readiness delta package. Do not mutate the W386 source-pack readiness evidence package.

## Selected Lane

Recommendation: proceed with Wholesale Janitorial & Facility Supply / Contract Replenishment as the next fixture-first lane.

Rationale: this lane is adjacent to distribution, building materials, dealer/channel, and retail, but distinct around contract customers, recurring supply demand, facility locations, replenishment cadence, substitutions, backorders, route/delivery readiness, and margin leakage. Wholesale Janitorial should not invite Manufacturing/WIP by default.

## Fixture Candidate

Name: Brightline Facility Supply

Website: `https://www.brightlinefacilitysupply.com`

Poorly created sales rep notes:

```text
Talked to sales ops person maybe Elena or Elaine. They sell janitorial supplies, paper products, cleaning chemicals, dispensers, trash liners, maybe safety stuff to offices, schools, property managers, and small facility groups. Big issue is customers expect recurring orders to just show up but they don't always know if product is in stock, substituted, backordered, or on the right delivery route. Some contracts have preferred items or pricing but I didn't get details. They use spreadsheets, QuickBooks maybe, old route sheets, and a lot of calls. Need demo around contract customer, recurring order, item availability, substitute product, backorder status, delivery readiness, and margin. Competitor maybe QuickBooks, spreadsheets, route app, maybe janitorial distributor software, not sure.
```

## Fixture-First Story Scaffold

Fixture-first only. This is a lane selection and story scaffold, not a source-pack install.

### Proof Label

Wholesale Janitorial Contract Replenishment

### Path Flow

1. Contract customer
2. Recurring order
3. Facility item availability
4. Preferred or substitute item
5. Backorder or replenishment status
6. Route or delivery readiness

### Expected Story

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

### Expected Proof Roles

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

### Risk Pressure

Recurring contract promises break when a facility customer expects paper, chemical, dispenser, liner, or safety supply replenishment, but availability, substitution, backorder, replenishment cadence, or delivery route readiness is unclear.

### Value Decision

Help Brightline decide whether NetSuite can protect recurring customer promise confidence and margin by proving item availability, preferred/substitute item context, backorder or replenishment status, and route/delivery readiness before the next contract shipment.

### Proof Move

Open the contract customer and recurring order, then prove facility item availability, preferred/substitute item, backorder or replenishment status, and route/delivery readiness.

### Safe Claim

Frame ROI around reduced recurring promise risk, fewer manual product checks, fewer substitution surprises, fewer backorder follow-ups, and margin protection only after Brightline confirms the current baseline.

### Competitive Pressure

Likely pressure is QuickBooks, spreadsheets, old route sheets, route apps, janitorial distributor software, and manual calls. Competitive pressure remains advisory-only unless confirmed.

### NetSuite Contrast

Position NetSuite as one proof path for contract customer demand, recurring order readiness, facility item availability, preferred/substitute item status, backorder or replenishment status, route/delivery readiness, and margin context instead of separate spreadsheets, route sheets, QuickBooks, and manual calls.

## ROI / Competitive Framing

Largest value to prove: protect recurring customer promise confidence and margin by proving item availability, substitution/backorder status, replenishment cadence, and delivery readiness before the next contract shipment.

Discovery: ask which recurring orders require manual product checks, substitute approvals, backorder follow-up, or route/delivery calls.

Proof move: open contract customer, recurring order, item availability, preferred/substitute item, backorder/replenishment status, and route/delivery readiness.

Competitive watch-out: QuickBooks, spreadsheets, old route sheets, route apps, and janitorial distributor software are advisory-only unless confirmed.

Claim caution: measured savings require a customer baseline.

## Cross-Lane Anti-Leak Terms

Do not default to Building Materials terms unless evidence explicitly supports them:

- contractor job order
- will-call pickup
- jobsite delivery
- special order materials
- lumber
- doors
- windows

Do not default to other lane terms unless evidence explicitly supports them:

- dealer allocation
- channel fulfillment
- style/color/size variants
- technician truck stock
- first-time fix
- clinic supply substitutes
- QA release
- lot/release readiness
- food batch
- configured assembly
- manufacturing routing
- WIP

Do not collapse Wholesale Janitorial into generic industrial distribution unless the evidence explicitly supports that path.

## UX / Story Boundaries

- ROI/Competitive remains flow-based.
- Run path remains numbered and clickable only when verified Open-link authority exists.
- Imported proof records remain collapsed by default.
- Support and receipt surfaces remain lane-consistent and collapsed where appropriate.
- Open-link authority remains verified-import-only.
- No fake Open links.
- Manufacturing/WIP should remain off unless explicit fabrication/manufacturing evidence exists.
- N/LLM remains advisory-only.
- public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated.

## Boundary Preservation

- No live smoke.
- No live smoke in W398.
- No upload or deployment.
- No runtime upload package creation.
- No package mutation.
- No source-pack mutation.
- No source-pack mutation was made in W398.
- No runner, adapter, record creation, import validation, or Open-link authority changes.
- No broad abstractions.
- W397 package remains readiness evidence only.
- W386 package remains readiness evidence only.

## Validation Commands

```bash
node --check archive/tools/run_w398_fixture_first_expansion_restart_after_building_materials_package_harness.js
npm run harness:fixture-first-expansion-restart-after-building-materials-package-w398
npm run harness:building-materials-readiness-delta-package-w397
npm run harness:building-materials-pack-readiness-w396
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
W398 fixture-first expansion restart after Building Materials package harness: 15/15 passed
W397 Building Materials readiness delta package harness: 13/13 passed
W396 Building Materials pack-readiness harness: 16/16 passed
W386 pack-ready artifact package harness: 8/8 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W397 package baseline preservation | Pass | W397 package remains intact. |
| W396 Building Materials readiness preservation | Pass | Building Materials remains `ready_now`. |
| W386 package preservation | Pass | W386 package remains intact. |
| No live smoke/no upload/no package creation boundary | Pass | No live smoke, upload, deployment, or package creation. |
| Next-lane selection rationale | Pass | Wholesale Janitorial selected and justified. |
| Wholesale Janitorial industry distinctness | Pass | Contract replenishment story is distinct. |
| Expected proof-role coverage | Pass | Fixture proof roles are present. |
| Cross-lane anti-leak wording | Pass | Building Materials and other lane leaks are guarded. |
| ROI/Competitive flow preservation | Pass | Flow remains consultant-ready. |
| Run/Open-link authority preservation | Pass | Verified-import-only Open-link posture preserved. |
| Manufacturing/WIP default-off posture | Pass | No default Manufacturing/WIP invitation. |
| Claim safety | Pass | Baseline and advisory-only cautions preserved. |
| Confidence/source separation | Pass | Source and inference remain separated. |
| No source-pack mutation unless justified | Pass | No source-pack mutation in W398. |
| No-regression gates | Pass | W398 no-regression gates passed. |

## Recommendation

Proceed with Wholesale Janitorial & Facility Supply / Contract Replenishment as the next fixture-first lane.

Next block should create a W399 fixture-first story proof using Brightline Facility Supply, then validate story distinctness against Building Materials, Dealer Hardgoods, Apparel/Retail, Parts/Service, Medical/Dental, Food/Beverage, Industrial Equipment, Life Sciences, and generic distribution.
