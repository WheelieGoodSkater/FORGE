# W395: Building Materials Second Fixture Regression and Smoke-Minimizing Confidence Lock

Date: 2026-06-02

Use W394 Building Materials Source-Pack Readiness and Manufacturing/WIP Toggle Guard Cleanup as the locked Building Materials source-pack baseline. Keep W393 WIP routing best-effort diagnostics, W391 Keystone Building Materials fixture proof, W390 fixture-first expansion restart, W389 routing, and W386 source-pack readiness evidence package locked.

## Summary

W395 adds a second Building Materials fixture-only validation pass. No live smoke in W395. No upload or deployment was performed.

Keystone remains the first Building Materials fixture baseline. W395 adds Cedar Valley Contractor Supply as the second contractor/project fulfillment example so Building Materials does not depend on one Keystone-shaped story.

The second fixture exposed a lower-surface generic-story leak in the shared ROI/Competitive support surfaces. W395 adds a scoped Building Materials story contract branch in `idb-drawer.user.js` so the W373/W375 shared renderer has contractor/project fulfillment wording instead of falling back to generic inventory, distribution, manufacturing, or cross-lane support copy.

## Fixture Candidate

Name: Cedar Valley Contractor Supply

Website: `https://www.cedarvalleycontractorsupply.com`

Poorly created sales rep notes:

```text
Talked to inside sales lead maybe Morgan. They sell lumber packs, decking, drywall, doors, windows, fasteners, tools, and special order materials for remodelers and small contractors. Biggest headache is a contractor asks whether a job can be picked up Friday or delivered to the jobsite, then the counter finds out one branch is short, a substitute is needed, or the special order date moved. They use an old POS, spreadsheets, and branch phone calls. Need demo around contractor account, job order, branch item availability, special order status, substitution options, will-call pickup, jobsite delivery, and margin leakage. Competitor maybe Epicor, Spruce, old POS, QuickBooks, not sure.
```

## Expected Building Materials Story

- contractor account demand
- job order readiness
- branch item availability
- special order status
- substitution options
- will-call pickup
- jobsite delivery readiness
- margin leakage
- project fulfillment confidence

## Expected Proof Roles

- `customer`
- `contractor_account`
- `job_order`
- `branch_item_availability`
- `special_order_or_substitution`
- `will_call_or_jobsite_delivery`

## ROI / Competitive Framing

Talk track: lead with the buyer risk that contractors are promised job material readiness before branch availability, substitutions, special-order dates, or jobsite delivery are verified.

Discovery: ask which job promises currently require branch calls, substitute approvals, special-order follow-up, or delayed will-call/jobsite delivery updates.

Proof move: open contractor account, job order, branch item availability, special-order/substitution status, and will-call/jobsite delivery readiness.

Largest value to prove: protect project promise confidence and margin by proving branch availability, special-order/substitution status, and delivery readiness before the contractor commitment.

Competitive watch-out: Epicor, Spruce, QuickBooks, old POS, spreadsheets, and branch-by-branch calls remain advisory-only unless confirmed.

Claim caution: measured savings require a customer baseline before they can be claimed.

## W394 Toggle Guard Preservation

The Cedar Valley fixture is Building Materials contractor/project fulfillment evidence, not manufacturing evidence. Manufacturing/WIP remains suppressed even if stale UI or runner params try to force both toggles on.

True manufacturing evidence still remains allowed. If Building Materials evidence explicitly includes fabrication, assembly, production routing, work center, WIP, build/test, inspection, or configured equipment assembly, the handoff can preserve Manufacturing/WIP.

## Cross-Lane Anti-Leak Posture

Do not let Building Materials leak Dealer Hardgoods, Apparel/Retail, Parts/Service, Medical/Dental, Life Sciences, Food/Beverage, or Industrial Equipment wording without evidence.

Specifically avoid unsupported:

- dealer allocation
- channel fulfillment
- style/color/size
- store/ecommerce promise
- technician truck stock
- first-time fix
- clinic supply substitutes
- QA release
- lot/release readiness
- validation documentation
- food batch
- ingredient readiness
- configured equipment assembly
- manufacturing routing
- WIP
- work center

## Boundary Preservation

- No live smoke in W395.
- No upload or deployment.
- No runtime upload package creation.
- W386 source-pack readiness evidence package was not mutated.
- W393 WIP routing best-effort diagnostics remain locked.
- No source-pack mutation was required in W395.
- A scoped Building Materials shared-story contract branch was added to `idb-drawer.user.js`.
- No runner, adapter, record creation, source-pack, import validation, or Open-link authority changes were made.
- No fake Open links.
- Open-link authority remains verified-import-only.
- completed-result import validation was not changed.
- N/LLM remains advisory-only.
- public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated.
- fixture Open links remain fixture proof, not live smoke.

## Validation Commands

```bash
node --check archive/tools/run_w395_building_materials_second_fixture_regression_harness.js
node --check idb-drawer.user.js
npm run harness:building-materials-second-fixture-regression-w395
npm run harness:building-materials-source-pack-toggle-guard-w394
npm run harness:wip-routing-best-effort-diagnostics-w393
npm run harness:building-materials-fixture-story-proof-w391
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
node --check archive/tools/run_w395_building_materials_second_fixture_regression_harness.js: passed
node --check idb-drawer.user.js: passed
package.json parse check: passed
W395 Building Materials second fixture regression harness: 17/17 passed
W394 Building Materials source-pack toggle guard harness: 18/18 passed
W393 WIP routing best-effort diagnostics harness: 15/15 passed
W391 Building Materials fixture-first story proof harness: 15/15 passed
W386 pack-ready artifact package harness: 8/8 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W394 source-pack/toggle guard preservation | Pass | W394 remains locked. |
| W393 runner safety preservation | Pass | WIP routing best-effort diagnostics remain locked. |
| W391 Keystone fixture preservation | Pass | First Building Materials fixture remains locked. |
| Second fixture story distinctness | Pass | Cedar Valley reads as Building Materials contractor/project fulfillment. |
| Source-pack resolution | Pass | Cedar Valley evidence resolves to `building-materials-contractor-supply-project-fulfillment`. |
| Expected proof-role coverage | Pass | Contractor account, job order, branch availability, special order/substitution, and will-call/jobsite delivery are present. |
| ROI/Competitive flow preservation | Pass | Talk track, discovery, proof move, largest value, objection handle, and claim caution remain visible. |
| Run path/Open-link collapse preservation | Pass | Numbered path and fixture Open links remain authority-separated. |
| Manufacturing/WIP suppression preservation | Pass | Forced toggles stay off without explicit manufacturing evidence. |
| True manufacturing evidence still allowed | Pass | Explicit manufacturing evidence can still preserve Manufacturing/WIP. |
| Cross-lane anti-leak wording | Pass | Building Materials shared-story branch keeps unsupported cross-lane terms out. |
| Claim safety and confidence separation | Pass | No measured ROI or unsupported competitor claims. |
| No source-pack/runner mutation needed | Pass | W395 patched only the root shared-story branch; no source-pack or runner change was needed. |
| W386 package preservation | Pass | W386 package remains untouched. |
| No live smoke / no upload boundary | Pass | No live smoke, upload, or deployment. |
| No-regression gates | Pass | W395 no-regression gates passed. |

## Recommendation

Lock Building Materials as second-fixture source-pack-ready and move to either:

- a scoped Building Materials pack-readiness note, if we want to include it in the next readiness package, or
- resume fixture-first expansion into another adjacent lane.

Do not run another Building Materials live smoke unless a runtime upload/deploy occurs or runner/import/Open-link behavior changes.
