# W406: HVAC / Mechanical Contractor Supply Second Fixture Decision Gate

Date: 2026-06-02

Use W405 HVAC / Mechanical Contractor Supply Fixture-First Story Proof as the locked first-fixture baseline. W404 HVAC fixture-first selection remains locked. Keep W403 Wholesale Janitorial readiness delta package, W402 Wholesale Janitorial source-pack readiness, W397 Building Materials readiness delta package, W396 Building Materials source-pack readiness, W389 runtime release routing, W388 final archive handoff, W386 source-pack readiness evidence package, and W379-W383 source-pack-ready lane baselines locked.

## Summary

W406 proves a second HVAC / Mechanical Contractor Supply & Service Readiness fixture and makes the source-pack cleanup decision.

No live smoke in W406. No upload or deployment was performed. No runtime upload package creation occurred. Do not create a new package in W406.

Horizon Air & Mechanical Supply is selected as the second fixture proof. No source-pack mutation was made in W406. Do not create the source pack in W406. Do not add HVAC to runtime source packs in W406. This is second-fixture proof and decision gate only.

Wholesale Janitorial remains source-pack-ready. Building Materials remains the locked packaged contractor-supply baseline. Do not mutate W403, W397, or W386 packages.

## Second Fixture Candidate

Name: Horizon Air & Mechanical Supply

Website: `https://www.horizonairmechanicalsupply.com`

Poorly created sales rep notes:

```text
Talked to counter manager maybe Luis or Lewis. They sell HVAC equipment, condensers, air handlers, motors, belts, filters, thermostats, duct parts, refrigerant, and install supplies to contractors and service techs. Main issue is techs and installers call in for parts or equipment and the counter promises availability, then later finds out it is reserved, backordered, at another branch, needs a substitute, or has warranty/replacement rules. They use QuickBooks, spreadsheets, maybe a counter POS and vendor portals. Need demo around contractor account, job or service order, equipment availability, replacement part availability, branch stock, substitute option, warranty/replacement context, replenishment/backorder status, and pickup or jobsite delivery. Competitor maybe Ferguson, Johnstone, Epicor, QuickBooks, spreadsheets, vendor portal, not sure.
```

## Fixture Story Evidence

Proof label: HVAC / Mechanical Contractor Supply & Service Readiness

Expected story:

- contractor account demand
- job or service order readiness
- HVAC equipment availability
- replacement/service part availability
- branch/location stock
- reserved inventory risk
- substitute option
- warranty/replacement context
- backorder/replenishment status
- pickup or jobsite delivery readiness
- install/service promise confidence
- margin leakage
- refrigerant caution

Expected proof roles:

- `customer / contractor account`
- `job_or_service_order`
- `hvac_equipment_availability`
- `replacement_or_service_part`
- `branch_location_stock`
- `reserved_or_substitute_option`
- `warranty_or_replacement_context`
- `backorder_or_replenishment_status`
- `pickup_or_jobsite_delivery`

Fixture proof names:

- Horizon Contractor Account
- Horizon Job or Service Order
- Horizon HVAC Equipment Availability
- Horizon Replacement Part Availability
- Horizon Branch Stock
- Horizon Reserved Substitute Option
- Horizon Warranty Replacement Context
- Horizon Backorder Replenishment Status
- Horizon Pickup Delivery Readiness

## Two-Fixture Pattern

Summit and Horizon both preserve the HVAC contractor supply shape: contractor account, job quote/order or service order, HVAC equipment availability, replacement/service part availability, branch/location stock, warranty/replacement context, backorder/replenishment status, and pickup/jobsite delivery readiness.

The pattern does not collapse into generic item availability, branch stock, and replenishment.

## Readiness Decision

Readiness decision: `ready_for_scoped_source_pack_cleanup`

Recommended next block: scoped HVAC source-pack readiness cleanup.

Reason: Summit and Horizon both prove HVAC needs equipment availability, replacement/service part availability, branch stock, reserved/substitute context, warranty/replacement context, backorder/replenishment, pickup/jobsite delivery, and install/service promise confidence. Existing lanes are adjacent but cannot preserve the full story without leaking or flattening.

## Existing-Lane Fit Reviewed

Existing-lane fit reviewed:

- Building Materials cannot safely host HVAC without losing equipment, replacement part, and warranty/replacement specificity.
- Parts/Service cannot safely host HVAC unless the story becomes dispatch-first service operations.
- Industrial Distribution cannot safely host HVAC unless the story collapses to generic item availability and replenishment.
- Wholesale Janitorial cannot safely host HVAC because contract replenishment, recurring order, route delivery readiness, restroom paper, and cleaning chemicals are not the active HVAC story.

## Proposed Source-Pack Shape for Next Block

- proposed lane id: `hvac_mechanical_supply`
- proposed pack id: `hvac-mechanical-contractor-supply-service-readiness`
- proposed label: `HVAC Mechanical Contractor Supply & Service Readiness`
- likely operating mode: `distribution_replenishment`
- Manufacturing/WIP default: off

Required proof roles:

- `customer`
- `contractor_account`
- `job_or_service_order`
- `hvac_equipment_availability`
- `replacement_or_service_part`
- `branch_location_stock`

Optional proof roles:

- `reserved_or_substitute_option`
- `warranty_or_replacement_context`
- `backorder_or_replenishment_status`
- `pickup_or_jobsite_delivery`
- `install_service_promise_context`
- `margin_context`
- `refrigerant_or_regulated_item_caution`

## ROI / Competitive Flow

Talk track: lead with the buyer risk that install or service promises break when the counter says yes before equipment, replacement parts, branch stock, substitute options, warranty/replacement context, backorder/replenishment status, or pickup/jobsite delivery readiness is confirmed.

Discovery: ask which install or service promises currently require manual branch checks, vendor portal checks, substitute approvals, warranty/replacement lookups, backorder follow-up, or delayed contractor callbacks.

Proof move: open contractor account, job or service order, equipment availability, replacement/service part availability, branch stock, reserved/substitute option, warranty/replacement context, backorder/replenishment status, and pickup/jobsite delivery readiness.

Largest value to prove: protect install/service promise confidence and margin by proving equipment availability, replacement part availability, branch/location stock, substitute options, warranty/replacement context, backorder/replenishment status, and pickup/delivery readiness before the contractor or technician commitment.

Competitive watch-out: Ferguson, Johnstone, Epicor, QuickBooks, spreadsheets, counter POS, vendor portals, and branch-by-branch calls are advisory-only unless confirmed.

Claim caution: measured savings require a customer baseline.

No measured ROI without a customer-confirmed baseline.

## Run / Open-Link Posture

Run path remains numbered and clickable only when verified Open-link authority exists.

Fixture Open-link examples, if used later, must be real NetSuite-looking fixture links and still treated as fixture proof, not live smoke.

Imported proof records remain collapsed by default.

Support and receipt surfaces remain lane-consistent and collapsed where appropriate.

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
- Life Sciences
- Food/Beverage
- Industrial Equipment

Do not leak Building Materials terms unless evidence explicitly supports them:

- lumber
- doors
- windows
- special order materials

Do not leak Wholesale Janitorial terms unless evidence explicitly supports them:

- contract replenishment
- recurring order
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
- compliance-sensitive items

Do not leak Life Sciences terms unless evidence explicitly supports them:

- QA release
- lot/release readiness
- expiration
- validation documentation
- traceability

Do not leak Food/Beverage terms unless evidence explicitly supports them:

- food batch
- ingredient readiness
- packaging readiness

Do not leak Industrial Equipment terms unless evidence explicitly supports them:

- configured assembly
- engineering BOM
- manufacturing routing
- WIP
- work center

## Authority Separation

- public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated.
- Competitive pressure remains advisory-only unless confirmed.
- N/LLM remains advisory-only.

## Boundary Preservation

- No live smoke.
- No live smoke in W406.
- No upload or deployment.
- No runtime upload package creation.
- Do not create a new package in W406.
- No package mutation.
- Do not mutate W403, W397, or W386 packages.
- No source-pack mutation.
- No source-pack mutation was made in W406.
- Do not create the source pack in W406.
- Do not add HVAC to runtime source packs in W406.
- This is second-fixture proof and decision gate only.
- No runner, adapter, record creation, import validation, or Open-link authority changes.
- No broad abstractions.
- Do not treat W403, W397, or W386 as runtime code.
- W406 no-regression gates passed.

## Validation Commands

```bash
node --check archive/tools/run_w406_hvac_mechanical_second_fixture_decision_harness.js
npm run harness:hvac-mechanical-second-fixture-decision-w406
npm run harness:hvac-mechanical-fixture-story-proof-w405
npm run harness:hvac-mechanical-fixture-first-selection-w404
npm run harness:wholesale-janitorial-readiness-delta-package-w403
npm run harness:wholesale-janitorial-source-pack-cleanup-w402
```

## Verification Results

```text
node --check archive/tools/run_w406_hvac_mechanical_second_fixture_decision_harness.js: passed
package.json parse check: passed
W406 HVAC/Mechanical second fixture decision harness: 19/19 passed
W405 HVAC/Mechanical fixture story proof harness: 15/15 passed
W404 HVAC/Mechanical fixture-first selection harness: 15/15 passed
W403 Wholesale Janitorial readiness delta package harness: 13/13 passed
W402 Wholesale Janitorial source-pack cleanup harness: 16/16 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W405 first-fixture baseline preservation | Pass | Summit remains locked. |
| W404 selection baseline preservation | Pass | W404 remains locked. |
| W403 package baseline preservation | Pass | W403 package remains intact. |
| W402 Wholesale Janitorial readiness preservation | Pass | Wholesale Janitorial remains ready. |
| W397 package preservation | Pass | Building Materials package remains intact. |
| No live smoke/no upload/no package boundary | Pass | No smoke, upload, deployment, or package creation. |
| Second fixture story distinctness | Pass | Horizon story remains HVAC-specific. |
| Expected proof-role coverage | Pass | Fixture proof roles are present. |
| Two-fixture pattern confirmed | Pass | Summit/Horizon pattern is stable. |
| Source-pack cleanup decision documented | Pass | Decision is `ready_for_scoped_source_pack_cleanup`. |
| Existing-lane temporary-fit safety | Pass | Existing-lane variant review is explicit. |
| ROI/Competitive flow preservation | Pass | Consultant flow remains intact. |
| Run/Open-link authority preservation | Pass | Verified-import-only posture preserved. |
| Manufacturing/WIP default-off posture | Pass | No default Manufacturing/WIP invitation. |
| Cross-lane anti-leak wording | Pass | Leak guards are present. |
| Claim safety | Pass | Baseline and advisory-only cautions preserved. |
| Confidence/source separation | Pass | Source and inference remain separated. |
| No source-pack mutation | Pass | No source-pack/runtime lane mutation. |
| No-regression gates | Pass | W406 no-regression gates passed. |

## Recommendation

Prepare scoped HVAC source-pack readiness cleanup next.

Do not run live smoke unless runner, adapter, import validation, record creation, generated proof roles, upload/deploy, or Open-link authority changes.
