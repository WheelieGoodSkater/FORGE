# W404: HVAC / Mechanical Contractor Supply Fixture-First Selection

Date: 2026-06-02

Use W403 Wholesale Janitorial Readiness Delta Package as the locked packaging baseline. Keep W402 Wholesale Janitorial source-pack readiness, W401 MetroCare second fixture proof, W400 decision gate, W399 Brightline fixture proof, W398 expansion restart, W397 Building Materials readiness delta package, W396 Building Materials source-pack readiness, W389 runtime release routing, W388 final archive handoff, W386 source-pack readiness evidence package, and W379-W383 source-pack-ready lane baselines locked.

## Summary

W404 restarts fixture-first expansion after W403 packaged the Wholesale Janitorial readiness delta.

No live smoke in W404. No upload or deployment was performed. No runtime upload package creation occurred. Do not create a new package in W404.

Wholesale Janitorial remains source-pack-ready and package-ready as readiness evidence. W404 therefore selects the next adjacent fixture-first lane without mutating source packs or runtime behavior.

Do not mutate the W403 Wholesale Janitorial readiness delta package. Do not mutate the W397 Building Materials readiness delta package. Do not mutate the W386 source-pack readiness evidence package.

## Selected Lane

Recommendation: proceed with HVAC / Mechanical Contractor Supply & Service Readiness as the next fixture-first lane.

Rationale: HVAC / Mechanical Contractor Supply is adjacent to Building Materials, Parts/Service, Industrial Distribution, and contractor supply, but distinct around job quote/order readiness, HVAC equipment availability, service or replacement parts, warranty or replacement context, branch pickup, jobsite delivery, and install/emergency repair promise confidence.

This lane is useful because it tests the boundary between contractor supply and service parts without defaulting to Building Materials, Parts/Service dispatch, generic distribution, or Wholesale Janitorial contract replenishment.

## Fixture Candidate

Name: Summit Mechanical Supply

Website: `https://www.summitmechanicalsupply.com`

Poorly created sales rep notes:

```text
Talked to branch ops person maybe Mark or Mike. They sell HVAC units, parts, filters, thermostats, duct stuff, maybe refrigerant and install materials to contractors and service companies. Biggest headache is contractors call asking if equipment or parts are available for an install or emergency repair, and the branch says yes before checking if it is actually in stock, reserved, backordered, or at another location. They use spreadsheets, maybe QuickBooks, maybe an old counter system. Need demo around contractor account, job quote or order, equipment availability, service part availability, warranty or replacement context, branch pickup or jobsite delivery, and replenishment. Competitor maybe Epicor, Ferguson, Johnstone portal, QuickBooks, spreadsheets, not sure.
```

## Fixture-First Story Scaffold

Fixture-first only. This is a lane selection and story scaffold, not a source-pack install.

### Proof Label

HVAC / Mechanical Contractor Supply & Service Readiness

### Path Flow

1. Contractor account
2. Job quote or order
3. HVAC equipment availability
4. Service or replacement part availability
5. Branch/location stock
6. Backorder or replenishment status
7. Warranty or replacement context
8. Branch pickup or jobsite delivery readiness

### Expected Story

- contractor account demand
- job quote/order readiness
- HVAC equipment availability
- service/replacement part availability
- branch/location stock
- backorder/replenishment status
- warranty or replacement context
- branch pickup
- jobsite delivery
- install/emergency repair promise confidence
- margin leakage
- refrigerant caution

### Expected Proof Roles

- `customer / contractor account`
- `job_quote_or_order`
- `hvac_equipment_availability`
- `service_or_replacement_part`
- `branch_location_stock`
- `backorder_or_replenishment_status`
- `warranty_or_replacement_context`
- `branch_pickup_or_jobsite_delivery`

Fixture proof names:

- Summit Mechanical Contractor Account
- Summit Mechanical Job Quote
- Summit HVAC Equipment Availability
- Summit Replacement Part Availability
- Summit Branch Stock
- Summit Backorder Replenishment Status
- Summit Warranty Replacement Context
- Summit Pickup Delivery Readiness

### Risk Pressure

Install or emergency repair promises break when the contractor hears "yes" before equipment, replacement parts, branch stock, replenishment timing, warranty/replacement context, or branch pickup/jobsite delivery readiness is confirmed.

### Value Decision

Help Summit decide whether NetSuite can protect contractor promise confidence and margin by proving equipment availability, replacement part availability, stock position, backorder/replenishment status, warranty/replacement context, and delivery readiness before the install or emergency repair commitment.

### Proof Move

Open the contractor account and job quote/order, then prove HVAC equipment availability, service or replacement part availability, branch/location stock, backorder or replenishment status, warranty or replacement context, and branch pickup or jobsite delivery readiness.

### Safe Claim

Frame ROI around reduced install promise risk, fewer manual branch checks, fewer substitution surprises, fewer backorder follow-ups, fewer emergency repair misses, and margin protection only after Summit confirms the current baseline.

### Competitive Pressure

Likely pressure is Epicor, Ferguson, Johnstone portal, QuickBooks, spreadsheets, old counter systems, and branch calls. Competitive pressure remains advisory-only unless confirmed.

### NetSuite Contrast

Position NetSuite as one proof path for contractor account demand, job quote/order readiness, HVAC equipment availability, service or replacement part availability, stock position, warranty/replacement context, replenishment status, and pickup/delivery readiness instead of separate spreadsheets, portals, counter-system lookups, QuickBooks, and manual calls.

## ROI / Competitive Framing

Largest value to prove: protect install/emergency repair promise confidence and margin by proving HVAC equipment availability, service or replacement part availability, stock position, warranty/replacement context, backorder/replenishment status, and pickup/delivery readiness before the contractor commitment.

Discovery: ask which install or emergency repair promises currently require manual branch checks, portal checks, substitute approvals, backorder follow-up, or delayed contractor callbacks.

Proof move: open contractor account, job quote/order, HVAC equipment availability, service/replacement part availability, branch/location stock, warranty/replacement context, backorder/replenishment status, and branch pickup/jobsite delivery readiness.

Competitive watch-out: Epicor, Ferguson, Johnstone portal, QuickBooks, spreadsheets, old counter system, and branch-by-branch calls are advisory-only unless confirmed.

Claim caution: measured savings require a customer baseline.

## Cross-Lane Anti-Leak Terms

Do not default to Building Materials terms unless evidence explicitly supports them:

- lumber
- doors
- windows
- special order materials

Do not default to Wholesale Janitorial terms unless evidence explicitly supports them:

- contract replenishment
- route delivery readiness
- restroom paper
- cleaning chemicals

Do not default to other lane terms unless evidence explicitly supports them:

- dealer allocation
- channel fulfillment
- style/color/size variants
- store/ecommerce promise
- clinic supply substitutes
- QA release
- lot/release readiness
- food batch
- configured assembly
- manufacturing routing
- WIP
- work center

Do not collapse HVAC into Building Materials, Parts/Service, Industrial Distribution, or Wholesale Janitorial unless evidence explicitly supports that path.

## UX / Story Boundaries

- ROI/Competitive remains flow-based.
- Run path remains numbered and clickable only when verified Open-link authority exists.
- Imported proof records remain collapsed by default.
- Support and receipt surfaces remain lane-consistent and collapsed where appropriate.
- Open-link authority remains verified-import-only.
- No fake Open links.
- Manufacturing/WIP should remain off unless explicit fabrication/manufacturing evidence exists.
- HVAC contractor supply should not invite Manufacturing/WIP by default.
- Do not weaken W393 WIP best-effort diagnostics.
- Competitive pressure remains advisory-only unless confirmed.
- N/LLM remains advisory-only.
- public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated.

## Boundary Preservation

- No live smoke.
- No live smoke in W404.
- No upload or deployment.
- No runtime upload package creation.
- Do not create a new package in W404.
- No package mutation.
- No source-pack mutation.
- No source-pack mutation was made in W404.
- Do not add HVAC to runtime source packs in W404.
- This is fixture/story scaffold only.
- No runner, adapter, record creation, import validation, or Open-link authority changes.
- No broad abstractions.
- W403 package remains readiness evidence only.
- W397 package remains readiness evidence only.
- W386 package remains readiness evidence only.
- W404 no-regression gates passed.

## Validation Commands

```bash
node --check archive/tools/run_w404_hvac_mechanical_fixture_first_selection_harness.js
npm run harness:hvac-mechanical-fixture-first-selection-w404
npm run harness:wholesale-janitorial-readiness-delta-package-w403
npm run harness:wholesale-janitorial-source-pack-cleanup-w402
npm run harness:building-materials-readiness-delta-package-w397
```

## Verification Results

```text
node --check archive/tools/run_w404_hvac_mechanical_fixture_first_selection_harness.js: passed
package.json parse check: passed
W404 HVAC/Mechanical fixture-first selection harness: 15/15 passed
W403 Wholesale Janitorial readiness delta package harness: 13/13 passed
W402 Wholesale Janitorial source-pack cleanup harness: 16/16 passed
W397 Building Materials readiness delta package harness: 13/13 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W403 package baseline preservation | Pass | W403 package remains intact. |
| W402 Wholesale Janitorial readiness preservation | Pass | Wholesale Janitorial remains ready. |
| W397 package preservation | Pass | Building Materials package remains intact. |
| No live smoke/no upload/no package creation boundary | Pass | No smoke, upload, deployment, or package creation. |
| Next-lane selection rationale | Pass | HVAC selected and justified. |
| HVAC industry distinctness | Pass | HVAC-specific story is present. |
| Expected proof-role coverage | Pass | Fixture proof roles are present. |
| Cross-lane anti-leak wording | Pass | Leak guards are present. |
| ROI/Competitive flow preservation | Pass | Consultant flow remains intact. |
| Run/Open-link authority preservation | Pass | Verified-import-only posture preserved. |
| Manufacturing/WIP default-off posture | Pass | No default Manufacturing/WIP invitation. |
| Claim safety | Pass | Baseline and advisory-only cautions preserved. |
| Confidence/source separation | Pass | Source and inference remain separated. |
| No source-pack mutation | Pass | No source-pack/runtime lane mutation. |
| No-regression gates | Pass | W404 no-regression gates passed. |

## Recommendation

Proceed with HVAC / Mechanical Contractor Supply & Service Readiness as the next fixture-first lane.

Next block should create a W405 fixture-first story proof using Summit Mechanical Supply, then validate story distinctness against Building Materials, Parts/Service, Industrial Distribution, Wholesale Janitorial, Dealer Hardgoods, Apparel/Retail, Medical/Dental, Food/Beverage, Industrial Equipment, and Life Sciences.
