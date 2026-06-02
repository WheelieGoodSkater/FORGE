# W390: Fixture-First Expansion Restart and Next-Lane Selection

Date: 2026-06-01

Use W389 Runtime Release Decision Gate and Next-Work Routing as the locked routing baseline.

## Summary

W390 restarts fixture-first industry expansion after the W389 decision gate.

No live smoke in W390. No upload or deployment was performed. No runtime upload package was created. The W386 package remains readiness evidence only and was not mutated.

Do not upload or deploy anything from W390.

No source-pack mutation was made in W390. No new lane was added to runtime source packs in W390.

No upload destination has been specified, so W390 follows the W389 recommendation to resume fixture-first expansion instead of creating release artifacts.

## Locked Baselines

- W389 Runtime Release Decision Gate and Next-Work Routing is the routing baseline.
- W388 Final Source-Pack Readiness Handoff and Archive Lock remains the archive baseline.
- W386 package remains the source-pack readiness evidence bundle:
  - `archive/package_ready/w386_forge_source_pack_ready_artifact/`
  - `archive/package_ready/w386_forge_source_pack_ready_artifact.zip`

## Next-Lane Selection

Recommendation: proceed with Building Materials / Contractor Supply as the next fixture-first lane.

Selected candidate:

- Lane: Building Materials / Contractor Supply & Project Fulfillment
- Fixture: Keystone Building Supply
- Website: `https://www.keystonebuildingsupply.com`

Rationale: Building Materials is adjacent to Dealer Hardgoods, Industrial Equipment, and Distribution, but distinct enough to test story separation around contractor accounts, project jobs, jobsite delivery, will-call pickup, substitutions, special orders, and margin leakage.

## Fixture Candidate

Poorly created sales rep notes:

```text
Talked to branch manager maybe Chris or Craig. They sell lumber, doors, windows, fasteners, tools, maybe special order materials to contractors. Biggest issue is contractors ask if stuff is available for a job and the branch promises it, then finds out some pieces are missing, substituted, delayed, or at another branch. They use spreadsheets, maybe QuickBooks, maybe an old POS. Need demo around contractor account, job order, item availability, special order status, will-call or jobsite delivery, substitutions, and margin. Competitor maybe Epicor, Spruce, spreadsheets, not sure.
```

## Fixture-First Story Scaffold

Fixture-first only. This is a story scaffold and readiness decision, not a source-pack install.

### Proof Label

Building Materials Contractor Supply & Project Fulfillment

### Path Flow

1. Contractor account
2. Job order
3. Branch item availability
4. Special order / substitution status
5. Will-call pickup or jobsite delivery readiness

### Risk Pressure

Contractor job promises break when branch teams quote availability before missing pieces, substitutions, special orders, or delivery readiness are confirmed.

### Value Decision

Help Keystone decide whether NetSuite can protect contractor account demand, job order readiness, item availability by branch, special order status, will-call pickup, jobsite delivery, substitutions, margin leakage, and project fulfillment confidence before the branch makes the next job promise.

### Proof Move

Open the contractor account and job order first, then prove branch item availability, special order or substitution status, and will-call/jobsite delivery readiness before discussing margin impact.

### Safe Claim

Frame ROI around reduced promise risk, fewer manual branch checks, fewer substitution surprises, and margin protection only after Keystone confirms the current baseline.

### Competitive Pressure

Likely pressure is Epicor, Spruce, QuickBooks, spreadsheets, old POS workflows, and branch-level manual checks. Treat competitor pressure as advisory-only unless confirmed.

### NetSuite Contrast

Position NetSuite as one proof path for contractor account demand, job order readiness, branch availability, special order status, substitutions, delivery readiness, and margin context instead of separate POS reports, spreadsheets, calls, and branch-by-branch checks.

## Industry Distinctness

Building Materials should use:

- contractor account demand
- job order readiness
- item availability by branch
- special order status
- will-call pickup
- jobsite delivery
- substitutions
- margin leakage
- project fulfillment confidence

Do not let Building Materials copy collapse into generic industrial distribution.

## Cross-Lane Anti-Leak Terms

Building Materials should not default to these terms unless evidence explicitly supports them:

- dealer allocation
- style/color/size variants
- technician truck stock
- clinic supply substitutes
- QA release
- lot/release readiness
- food batch
- configured assembly
- generic industrial distribution

## UX / Story Boundaries

- ROI/Competitive remains flow-based.
- Run path remains numbered and clickable only when verified Open-link authority exists.
- Imported proof records remain collapsed by default.
- Support and receipt surfaces remain lane-consistent and collapsed where appropriate.
- No fake Open links.
- Open-link authority remains verified-import-only.
- N/LLM remains advisory-only.
- Measured ROI requires a customer baseline.

## Validation Commands

```bash
node --check archive/tools/run_w390_fixture_first_expansion_restart_harness.js
npm run harness:fixture-first-expansion-restart-w390
npm run harness:runtime-release-decision-gate-w389
npm run harness:final-source-pack-readiness-handoff-w388
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
W390 fixture-first expansion restart harness: 13/13 passed
W389 runtime release decision gate harness: 12/12 passed
W388 final source-pack readiness handoff harness: 10/10 passed
W386 pack-ready artifact package harness: 8/8 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W389 routing baseline preservation | Pass | W390 follows the W389 route to resume fixture-first expansion. |
| W388 archive baseline preservation | Pass | W388 remains the archive baseline and W386 package identity is preserved. |
| W386 evidence package preservation | Pass | W386 package directory, zip, and file list remain present and untouched. |
| No runtime upload package | Pass | No runtime upload package, deployment bundle, or FileCabinet artifact was created. |
| No live smoke/no upload boundary | Pass | No live smoke, upload, or deployment occurred. |
| Next-lane selection rationale | Pass | Building Materials is selected because it is adjacent but story-distinct. |
| Building Materials industry distinctness | Pass | Contractor account, job order, branch availability, special order, will-call, jobsite delivery, substitution, margin, and project fulfillment language is explicit. |
| Cross-lane anti-leak wording | Pass | Dealer, apparel, service, medical/dental, life sciences, food, industrial-equipment, and generic distribution leak terms are guarded. |
| Fixture-first validation posture | Pass | W390 creates a story scaffold and readiness decision only. |
| ROI/Run UX boundary preservation | Pass | ROI flow, numbered Run path, verified Open links only, collapsed proof records, and collapsed support surfaces remain the expected UX posture. |
| Open-link authority preservation | Pass | Open-link authority remains verified-import-only and no fake Open links are introduced. |
| Claim safety | Pass | Measured ROI requires a customer baseline. |
| Confidence separation | Pass | N/LLM remains advisory-only and evidence remains separated from inference. |
| No-regression gates | Pass | No package mutation, source-pack mutation, lane addition, live smoke, upload/deployment, runner change, adapter change, record creation change, import validation change, or Open-link authority change was introduced. |

## Recommendation

Proceed with Building Materials / Contractor Supply as the next fixture-first lane.

Next block should create a fixture-first Building Materials harness using Keystone Building Supply, then validate story distinctness against Dealer Hardgoods, Industrial Equipment, Apparel/Retail, Parts/Service, Medical/Dental, Food/Beverage, and Life Sciences.

No package mutation. No source-pack mutation. No runner, adapter, record creation, import validation, or Open-link authority changes were made.
