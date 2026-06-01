# W373: Cross-Lane Story Framework Hardening and Collapsed Support Cleanup

Date: 2026-06-01

## Scope

W373 stayed fixture-first and harness-first. No live smoke was run.

This block hardens the expansion story framework after W369-W372 by adding a shared cross-lane story contract and cleaning up lower collapsed support surfaces that could still expose legacy generic lane-pack wording. The first-read W371 ROI/Competitive flow and W371 Run clickable path behavior remain locked.

## Baselines

- Latest expansion baseline: W372 Medical/Dental fixture-first story and ROI/Run UX regression lock.
- Locked UX baseline: W371 Consultant ROI/Competitive Flow Redesign and Run Path Link Polish.
- Locked lane baselines: W370 Parts/Service, W369 Apparel/Retail, W368 Dealer Hardgoods Run visual-flow patch, W367 cockpit density.
- Live Dealer Hardgoods proof baselines: W366 Summit Outdoor Supply and W368 RidgeLine Powersports & Equipment.
- Regression baselines: W358 Graybar, W359 Fastenal, W360 MSC, W361 cockpit, W362 competitive lens, W363 Trace cleanup, W365 dealer fixture polish.
- UX review evidence: W371 Bayview review trace from the user-provided W369 example.

## Implementation

- Advanced the drawer marker to `Drawer 1.0.19 / W373`.
- Added `crossLaneStoryPolishContractW373(...)` as the shared lane-story shape for active lane stories:
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
- Added W373 no-regression flags for story-contract use, collapsed-support cleanup only, no source lane-pack mutation, no drawer writes, no transaction writes, and no fake Open links.
- Routed the W373 story contract into:
  - `valueReviewPacket(...)`
  - collapsed Review proof receipt/story surface
  - collapsed Run proof guardrails/evidence receipt
  - lower Run guardrail chips
  - test hooks
- Added lane-consistent support copy cleanup that suppresses confusing legacy support language while preserving uncertainty, proof guardrails, source confidence, advisory-only status, and Open-link authority.
- Did not mutate runner, adapter, record creation, completed-result import validation, or source lane packs.

## Harness

Command:

```bash
npm run harness:cross-lane-story-framework-support-cleanup-w373
```

Harness file:

```text
archive/tools/run_w373_cross_lane_story_framework_support_cleanup_harness.js
```

Report file:

```text
archive/reports/w373_cross_lane_story_framework_support_cleanup.md
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| Story contract consistency | Pass | Active Dealer Hardgoods, Apparel/Retail, Parts/Service, and Medical/Dental scenarios expose complete W373 contract fields with no missing fields. |
| First-read lane distinctness | Pass | Northstar remains clinic/dental; Bayview remains work order/service parts; Harbor remains style/size/color retail; Summit/RidgeLine preserve dealer/channel language. |
| Collapsed support lane consistency | Pass | Northstar collapsed proof guardrails/evidence receipt now shows lane-consistent support and avoids Industrial Distribution, production routing, ingredient batch, fashion collection, dealer allocation, apparel, and field-service leakage. |
| Anti-leak wording | Pass | Parts/Service, Apparel/Retail, Medical/Dental, and Dealer Hardgoods first-read surfaces do not borrow each other's lane terms without evidence. |
| W371 ROI/Competitive flow preservation | Pass | Talk track, Discovery, Proof move, Largest value to prove, Objection handle, and Claim caution remain visible across all harness scenarios. |
| W371 Run clickable Open-link preservation | Pass | Numbered path steps remain clickable only with verified Open-link authority; no empty, preview, placeholder, or fake links were introduced. |
| Claim safety | Pass | Baseline capture and measured-savings cautions remain visible; no unsupported ROI or competitor feature claims were added. |
| Confidence separation | Pass | Public evidence, N/LLM advisory status, build/import proof, and Open-link authority remain separated. |
| No fake Open links | Pass | Harness verifies imported records use supported NetSuite URLs and verified openable authority. |
| No-regression gates | Pass | No drawer writes, transaction writes, runner/adapter changes, completed-result import validation weakening, or source lane-pack mutation. |

Harness result: `9/9 passed`.

## Smoke-Minimizing Note

W373 confirms the expansion path can continue fixture-first. Live smoke is not needed for story wording, collapsed support cleanup, ROI/Competitive layout, Run layout, or cross-lane anti-leak checks when the runner/import/Open-link integration contract is unchanged.

Use live smoke only when one of these changes:

- runner invocation or adapter transport behavior
- completed-result import validation
- Open-link authority validation
- record creation behavior
- source pack mutation that changes live generated records enough to create real integration risk

## Recommendation

Lock the W373 cross-lane story framework and resume fixture-first lane expansion. The next block can add another lane or harden the story framework further, but no live smoke is warranted unless a real runner/import/Open-link integration risk is introduced.
