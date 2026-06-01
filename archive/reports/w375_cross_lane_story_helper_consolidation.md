# W375: Cross-Lane Story Helper Consolidation and Fixture-First Expansion Readiness Lock

Date: 2026-06-01

## Scope

W375 stayed fixture-first and harness-first. No live smoke was run.

This block consolidates the repeated consultant-facing lane rendering introduced across W365-W374. The lane definitions remain explicit and auditable, but Value and Run now use shared W375 renderers driven by the active W373 story contract.

## Baselines

- Latest expansion baseline: W374 Food/Beverage fixture-first story regression.
- Locked story-contract baseline: W373 Cross-Lane Story Framework Hardening and Collapsed Support Cleanup.
- Locked UX baseline: W371 ROI/Competitive Flow Redesign and Run Path Link Polish.
- Locked expansion baselines: W372 Medical/Dental, W370 Parts/Service, W369 Apparel/Retail.
- Locked live Dealer Hardgoods baselines: W366 Summit Outdoor Supply and W368 RidgeLine Powersports & Equipment.
- Regression baselines: W358 Graybar, W359 Fastenal, W360 MSC, W361 cockpit, W362 competitive lens, W363 Trace cleanup, W365 dealer fixture polish.

## Implementation

- Advanced the drawer marker to `Drawer 1.0.21 / W375`.
- Added shared W375 story-contract renderers:
  - `renderW375StoryContractLens(...)`
  - `renderW375StoryContractProofPath(...)`
- Replaced repeated per-lane Value lens branches with the shared active-story renderer.
- Replaced repeated per-lane Run proof-path branches with the shared active-story renderer.
- Preserved explicit lane story helpers for auditability:
  - Dealer Hardgoods
  - Apparel/Retail
  - Parts/Service
  - Medical/Dental
  - Food/Beverage
- Preserved W371 ROI/Competitive flow and Run clickable Open-link behavior.
- Preserved W373 lane-consistent collapsed support cleanup.
- Did not mutate source lane packs, runner, adapter, record creation behavior, completed-result import validation, or Open-link authority checks.

## Harness

Command:

```bash
npm run harness:cross-lane-story-helper-consolidation-w375
```

Harness file:

```text
archive/tools/run_w375_cross_lane_story_helper_consolidation_harness.js
```

Report file:

```text
archive/reports/w375_cross_lane_story_helper_consolidation.md
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| Story contract consistency | Pass | Active story scenarios expose complete proof label, path flow, risk pressure, value decision, proof move, safe claim, competitor pressure, NetSuite contrast, anti-leak terms, and no-regression flags. |
| Helper consolidation safety | Pass | Value and Run render active story lenses/proof paths through the W375 shared story renderer. |
| First-read lane distinctness | Pass | Food/Beverage, Medical/Dental, Parts/Service, Apparel/Retail, and Dealer Hardgoods remain visibly distinct. |
| Cross-lane anti-leak wording | Pass | Willow Creek does not borrow dealer, apparel, service, or clinic/dental wording; Northstar does not inherit Food/Beverage batch/QA language. |
| Collapsed support lane consistency | Pass | Willow Creek support remains lane-consistent and avoids legacy Industrial Distribution/production-routing/fashion-collection wording. |
| W371 ROI/Competitive flow preservation | Pass | Talk track, Discovery, Proof move, Largest value to prove, Objection handle, and Claim caution remain visible across scenarios. |
| W371 Run clickable Open-link preservation | Pass | Numbered Run path remains clickable only for verified Open links; no fake, empty, preview, or placeholder links introduced. |
| W374 Food/Beverage regression | Pass | Finished-good production readiness, ingredient/packaging, batch/line, QA/lot, and ship confidence remain intact. |
| Claim safety | Pass | Baseline capture and measured-savings cautions remain visible. |
| Confidence separation | Pass | Public evidence, advisory inference, build/import proof, and Open-link authority remain separated. |
| No fake Open links | Pass | Harness verifies supported NetSuite URLs and verified openable authority. |
| No-regression gates | Pass | No live smoke, no drawer writes, no transaction writes, no runner/adapter changes, no record creation behavior changes, no completed-result import validation weakening. |

Harness result: `10/10 passed`.

## Smoke-Minimizing Expansion Checklist v4

For a new fixture-first lane, a story definition must include:

- `proofLabel`
- `pathFlow`
- `riskPressure`
- `valueDecision`
- `proofMove`
- `safeClaim`
- `competitorPressure`
- `netsuiteContrast`
- `antiLeakTerms`
- `noRegression`

Fixture-only story work is enough when:

- the lane already exists in the drawer contract or can be evaluated without source-pack mutation,
- the change is consultant-facing story/UI only,
- runner/import/Open-link behavior is unchanged,
- completed-result validation is unchanged,
- the harness can prove first-read distinctness, anti-leak wording, collapsed support consistency, claim safety, and W371/W373/W374 regressions.

A second fixture is needed when:

- one messy-notes sample cannot distinguish the lane from an adjacent lane,
- the lane has two materially different operating motions,
- competitive pressure or proof language remains too generic after the first fixture.

Source lane packs may need scoped mutation only when:

- fixture-only story helpers cannot produce correct record roles, proof anchors, or labels,
- lower proof receipts contradict the active story after helper cleanup,
- report evidence identifies a specific source-pack field to change.

Live smoke is truly required only when:

- runner invocation changes,
- adapter transport changes,
- record creation behavior changes,
- completed-result import validation changes,
- Open-link authority checks change,
- source-pack mutation changes live generated records enough to create real integration risk.

## Recommendation

Lock the consolidated cross-lane story helper and continue fixture-first expansion. W375 makes a fifth lane cheaper and safer because future work can mostly author the story definition plus fixture/harness coverage before considering source-pack changes or live smoke.
