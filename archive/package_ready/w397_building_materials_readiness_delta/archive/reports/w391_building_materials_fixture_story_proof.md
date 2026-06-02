# W391: Fixture-First Building Materials Story Proof and Cross-Lane Validation

Date: 2026-06-01

Use W390 Fixture-First Expansion Restart and Next-Lane Selection as the locked expansion-restart baseline.

## Summary

W391 proves the Building Materials / Contractor Supply story through a Keystone Building Supply fixture-first story layer.

W389 routed work back to fixture-first expansion. W390 selected Building Materials and created the story scaffold. W391 validates that scaffold against the locked lane set without adding Building Materials to runtime source packs.

No live smoke in W391. No upload or deployment was performed. No runtime upload package was created. Do not upload or deploy anything from W391.

No source-pack mutation was made in W391. Do not add Building Materials to runtime source packs in W391. This is fixture/story proof only.

Do not mutate the W386 source-pack readiness evidence package.

## Fixture Candidate

- Name: Keystone Building Supply
- Website: `https://www.keystonebuildingsupply.com`

Poorly created sales rep notes:

```text
Talked to branch manager maybe Chris or Craig. They sell lumber, doors, windows, fasteners, tools, maybe special order materials to contractors. Biggest issue is contractors ask if stuff is available for a job and the branch promises it, then finds out some pieces are missing, substituted, delayed, or at another branch. They use spreadsheets, maybe QuickBooks, maybe an old POS. Need demo around contractor account, job order, item availability, special order status, will-call or jobsite delivery, substitutions, and margin. Competitor maybe Epicor, Spruce, spreadsheets, not sure.
```

## Keystone Fixture Story Evidence

### Story Intent

Help Keystone prove contractor account demand, job order readiness, item availability by branch, special order status, will-call pickup, jobsite delivery readiness, substitutions, margin leakage, and project fulfillment confidence before the contractor commitment.

### Expected Proof Roles

| Role | Fixture Label | Fixture Open-Link Posture |
| --- | --- | --- |
| customer / contractor account | Keystone Contractor Account | `https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7901` |
| job_order | Keystone Job Order | `https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7902` |
| branch_item_availability | Keystone Branch Item Availability | `https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7903` |
| special_order_or_substitution | Keystone Special Order / Substitution Status | `https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7904` |
| will_call_or_jobsite_delivery | Keystone Will-Call / Jobsite Delivery Readiness | `https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7905` |

These are verified-looking fixture Open links for harness proof only. They are fixture proof, not live smoke, and they do not assert that live records were created.

## ROI / Competitive Flow

- Largest value to prove: protect job promise confidence and margin by proving branch availability, special order/substitution status, and delivery readiness before the contractor commitment.
- Discovery: ask which job promises currently require manual branch calls, substitutions, or delayed follow-up.
- Proof move: open contractor account, job order, branch item availability, special order/substitution status, and will-call/jobsite delivery readiness.
- Competitive watch-out: Epicor, Spruce, QuickBooks, old POS, spreadsheets, and branch-by-branch calls are advisory-only unless confirmed.
- Claim caution: measured savings require a customer baseline.

## Run Path

Run path remains numbered and clickable only when verified Open-link authority exists.

1. Contractor account
2. Job order
3. Branch item availability
4. Special order / substitution status
5. Will-call pickup or jobsite delivery readiness

If fixture records include Open links, they must use NetSuite-looking verified fixture links and remain labeled as fixture proof, not live smoke. No fake Open links.

Imported proof records remain collapsed by default. Support and receipt surfaces remain lane-consistent and collapsed. proof guardrails remain visible when expanded.

Support and receipt surfaces remain lane-consistent and collapsed by default.

## Cross-Lane Validation

Validate Building Materials against:

- Dealer Hardgoods
- Apparel/Retail
- Parts/Service
- Medical/Dental
- Food/Beverage
- Industrial Equipment
- Life Sciences

## Anti-Leak Wording

Do not default to Dealer Hardgoods terms like dealer allocation or channel fulfillment.

Do not default to Apparel/Retail terms like style/color/size variants or store/ecommerce promise.

Do not default to Parts/Service terms like technician truck stock, work order dispatch, first-time fix, or warranty exposure unless evidence supports them.

Do not default to Medical/Dental terms like clinic supply substitutes or compliance-sensitive items.

Do not default to Life Sciences terms like QA release, lot/release readiness, expiration, validation documentation, or traceability.

Do not default to Food/Beverage terms like food batch, ingredient readiness, packaging readiness, promotion ship confidence, or QA/lot readiness.

Do not default to Industrial Equipment terms like configured assembly, component lead time, build/test/inspection readiness, or engineering BOM.

Do not collapse into generic industrial distribution unless the evidence explicitly supports that path.

## Source / Confidence Separation

- Public website/category evidence supports the fixture category only.
- Messy notes shape pain, ROI, competitive framing, and run coaching.
- Advisory inference remains advisory-only.
- Build/import proof remains separate from story proof.
- Open-link authority remains verified-import-only.
- N/LLM remains advisory-only.

## Boundaries

- No live smoke in W391.
- No upload or deployment.
- No runtime upload package creation.
- No package mutation.
- Do not mutate the W386 source-pack readiness evidence package.
- No source-pack mutation.
- No new drawer transaction write paths.
- No fake Open links.
- Do not change runner, adapter, or record creation behavior.
- Do not weaken completed-result import validation.
- Do not weaken Open-link authority checks.
- No broad abstractions.
- Do not treat W386 as runtime code.

No runner, adapter, record creation, import validation, or Open-link authority changes were made.

## Validation Commands

```bash
node --check archive/tools/run_w391_building_materials_fixture_story_proof_harness.js
npm run harness:building-materials-fixture-story-proof-w391
npm run harness:fixture-first-expansion-restart-w390
npm run harness:runtime-release-decision-gate-w389
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
W391 Building Materials fixture-first story proof harness: 15/15 passed
W390 fixture-first expansion restart harness: 13/13 passed
W389 runtime release decision gate harness: 12/12 passed
W386 pack-ready artifact package harness: 8/8 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W390 expansion restart preservation | Pass | W390 remains the selected expansion-restart baseline. |
| W389 routing baseline preservation | Pass | W391 follows fixture-first expansion and does not create release artifacts. |
| W386 evidence package preservation | Pass | W386 package directory, zip, and file list remain present and untouched. |
| No runtime upload package | Pass | No runtime upload package, deployment bundle, or FileCabinet artifact was created. |
| No live smoke/no upload boundary | Pass | No live smoke, upload, or deployment occurred. |
| Building Materials story distinctness | Pass | Contractor account, job order, branch availability, special order, will-call, jobsite delivery, substitutions, margin, and project fulfillment language is explicit. |
| Expected proof-role coverage | Pass | Contractor account, job order, branch item availability, special order/substitution, and will-call/jobsite delivery roles are represented. |
| ROI/Competitive flow preservation | Pass | Largest value, discovery, proof move, competitive watch-out, and claim caution are present. |
| Run path/Open-link authority preservation | Pass | Run path is numbered and Open links remain verified fixture proof only. |
| Imported proof record collapse posture | Pass | Imported proof records remain collapsed by default. |
| Support/receipt collapse posture | Pass | Support and receipt surfaces remain collapsed and lane-consistent. |
| Cross-lane anti-leak wording | Pass | Existing lane leak terms are guarded. |
| Claim safety | Pass | Measured savings require a customer baseline. |
| Confidence/source separation | Pass | Public evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated. |
| No source-pack mutation | Pass | Building Materials is not added to runtime source packs in W391. |
| No-regression gates | Pass | No package mutation, source-pack mutation, runtime upload package, live smoke, upload/deployment, runner change, adapter change, record creation change, import validation change, Open-link authority change, drawer write path, fake Open link, or broad abstraction was introduced. |

## Recommendation

Lock Building Materials fixture-first story proof.

Next block should prepare a scoped Building Materials source-pack readiness review later, or run a second fixture-only Building Materials variant if the story needs more proof before source-pack review.

Do not install Building Materials into runtime source packs until a future block explicitly scopes that work.
