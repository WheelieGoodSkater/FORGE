# W405: HVAC / Mechanical Contractor Supply Fixture-First Story Proof

Date: 2026-06-02

Use W404 HVAC / Mechanical Contractor Supply Fixture-First Selection as the locked expansion baseline. Keep W403 Wholesale Janitorial readiness delta package, W402 Wholesale Janitorial source-pack readiness, W401 MetroCare second fixture proof, W400 decision gate, W399 Brightline fixture proof, W398 expansion restart, W397 Building Materials readiness delta package, W396 Building Materials source-pack readiness, W389 runtime release routing, W388 final archive handoff, W386 source-pack readiness evidence package, and W379-W383 source-pack-ready lane baselines locked.

## Summary

W405 proves the first HVAC / Mechanical Contractor Supply & Service Readiness story through a fixture-first report and harness.

No live smoke in W405. No upload or deployment was performed. No runtime upload package creation occurred. Do not create a new package in W405.

Summit Mechanical Supply is selected as fixture proof only. No source-pack mutation was made in W405. Do not add HVAC to runtime source packs in W405. This remains fixture/story proof only.

Wholesale Janitorial remains the locked source-pack-ready adjacent lane. Building Materials remains the locked packaged contractor-supply baseline. Do not mutate W403, W397, or W386 packages.

## Fixture Candidate

Name: Summit Mechanical Supply

Website: `https://www.summitmechanicalsupply.com`

Poorly created sales rep notes:

```text
Talked to branch ops person maybe Mark or Mike. They sell HVAC units, parts, filters, thermostats, duct stuff, maybe refrigerant and install materials to contractors and service companies. Biggest headache is contractors call asking if equipment or parts are available for an install or emergency repair, and the branch says yes before checking if it is actually in stock, reserved, backordered, or at another location. They use spreadsheets, maybe QuickBooks, maybe an old counter system. Need demo around contractor account, job quote or order, equipment availability, service part availability, warranty or replacement context, branch pickup or jobsite delivery, and replenishment. Competitor maybe Epicor, Ferguson, Johnstone portal, QuickBooks, spreadsheets, not sure.
```

## Fixture Story Evidence

Proof label: HVAC / Mechanical Contractor Supply & Service Readiness

Expected story:

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

Expected proof roles:

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

## ROI / Competitive Flow

Talk track: lead with the buyer risk that install and emergency repair promises break when the counter says yes before HVAC equipment, service or replacement parts, branch stock, backorder/replenishment status, warranty or replacement context, or branch pickup/jobsite delivery readiness is confirmed.

Discovery: ask which install or emergency repair promises currently require manual branch checks, portal checks, substitute approvals, backorder follow-up, warranty/replacement lookup, or delayed contractor callbacks.

Proof move: open contractor account, job quote/order, HVAC equipment availability, service/replacement part availability, branch/location stock, warranty/replacement context, backorder/replenishment status, and branch pickup/jobsite delivery readiness.

Largest value to prove: protect install/emergency repair promise confidence and margin before the contractor commitment.

Competitive watch-out: Epicor, Ferguson, Johnstone portal, QuickBooks, spreadsheets, old counter systems, and branch-by-branch calls are advisory-only unless confirmed.

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

HVAC contractor supply should not invite Manufacturing/WIP by default.

Manufacturing/WIP remains off unless explicit fabrication/manufacturing evidence exists.

Do not weaken W393 WIP best-effort diagnostics.

## Cross-Lane Validation

Validate HVAC / Mechanical Contractor Supply against:

- Building Materials
- Parts/Service
- Industrial Distribution
- Wholesale Janitorial
- Dealer Hardgoods
- Apparel/Retail
- Medical/Dental
- Food/Beverage
- Industrial Equipment
- Life Sciences

Do not leak Building Materials terms unless evidence explicitly supports them:

- lumber
- doors
- windows
- special order materials

Do not leak Wholesale Janitorial terms unless evidence explicitly supports them:

- contract replenishment
- route delivery readiness
- restroom paper
- cleaning chemicals

Do not leak Dealer Hardgoods terms unless evidence explicitly supports them:

- dealer allocation
- channel fulfillment

Do not leak Apparel/Retail terms unless evidence explicitly supports them:

- style/color/size variants
- store/ecommerce promise

Do not leak Medical/Dental terms unless evidence explicitly supports them:

- clinic supply substitutes

Do not leak Life Sciences terms unless evidence explicitly supports them:

- QA release
- lot/release readiness

Do not leak Food/Beverage terms unless evidence explicitly supports them:

- food batch

Do not leak Industrial Equipment terms unless evidence explicitly supports them:

- configured assembly
- manufacturing routing
- WIP
- work center

Do not collapse HVAC into Building Materials, Parts/Service, Industrial Distribution, or Wholesale Janitorial unless evidence explicitly supports that path.

## Authority Separation

- public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated.
- Competitive pressure remains advisory-only unless confirmed.
- N/LLM remains advisory-only.

## Boundary Preservation

- No live smoke.
- No live smoke in W405.
- No upload or deployment.
- No runtime upload package creation.
- Do not create a new package in W405.
- No package mutation.
- Do not mutate W403, W397, or W386 packages.
- No source-pack mutation.
- No source-pack mutation was made in W405.
- Do not add HVAC to runtime source packs in W405.
- This is fixture/story proof only.
- No runner, adapter, record creation, import validation, or Open-link authority changes.
- No broad abstractions.
- Do not treat W403, W397, or W386 as runtime code.
- W405 no-regression gates passed.

## Validation Commands

```bash
node --check archive/tools/run_w405_hvac_mechanical_fixture_story_proof_harness.js
npm run harness:hvac-mechanical-fixture-story-proof-w405
npm run harness:hvac-mechanical-fixture-first-selection-w404
npm run harness:wholesale-janitorial-readiness-delta-package-w403
npm run harness:wholesale-janitorial-source-pack-cleanup-w402
npm run harness:building-materials-readiness-delta-package-w397
```

## Verification Results

```text
node --check archive/tools/run_w405_hvac_mechanical_fixture_story_proof_harness.js: passed
package.json parse check: passed
W405 HVAC/Mechanical fixture story proof harness: 15/15 passed
W404 HVAC/Mechanical fixture-first selection harness: 15/15 passed
W403 Wholesale Janitorial readiness delta package harness: 13/13 passed
W402 Wholesale Janitorial source-pack cleanup harness: 16/16 passed
W397 Building Materials readiness delta package harness: 13/13 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W404 selection baseline preservation | Pass | W404 remains locked. |
| W403 package baseline preservation | Pass | W403 package remains intact. |
| W402 Wholesale Janitorial readiness preservation | Pass | Wholesale Janitorial remains ready. |
| W397 package preservation | Pass | Building Materials package remains intact. |
| No live smoke/no upload/no package creation boundary | Pass | No smoke, upload, deployment, or package creation. |
| HVAC story distinctness | Pass | HVAC-specific story is present. |
| Expected proof-role coverage | Pass | Fixture proof roles are present. |
| ROI/Competitive flow preservation | Pass | Consultant flow remains intact. |
| Run/Open-link collapse preservation | Pass | Verified-import-only posture preserved. |
| Manufacturing/WIP default-off posture | Pass | No default Manufacturing/WIP invitation. |
| Cross-lane anti-leak wording | Pass | Leak guards are present. |
| Claim safety | Pass | Baseline and advisory-only cautions preserved. |
| Confidence/source separation | Pass | Source and inference remain separated. |
| No source-pack mutation | Pass | No source-pack/runtime lane mutation. |
| No-regression gates | Pass | W405 no-regression gates passed. |

## Recommendation

Run one more fixture-first HVAC proof before source-pack mutation.

If the second fixture preserves the same job quote/order, HVAC equipment, replacement part, warranty/replacement, backorder/replenishment, and pickup/delivery readiness shape, prepare scoped HVAC source-pack readiness review next. If it collapses into Building Materials, Parts/Service, or generic Industrial Distribution, defer HVAC as a variant.
