# W413: Consultant UX Design Gate for ROI/Competitive, Run, and Build

Date: 2026-06-03

Use W412 First Two Larger-Smoke Review and UX Cleanup Plan as the locked post-smoke review baseline. Keep W411 Larger Smoke-Series Candidate Packet, W410 Larger Smoke-Series Design Gate, W409 Comfortable Lane Hardening Matrix, W408 HVAC/Mechanical readiness delta package, W403 Wholesale Janitorial readiness delta package, W397 Building Materials readiness delta package, W386 source-pack readiness evidence package, and W379-W383 source-pack-ready lane baselines locked.

## Summary

W413 implements the approved consultant-facing UX direction before the remaining larger-smoke runs.

No live smoke was run in W413. No upload or deployment was performed. No runtime package was created. Source packs, runner, adapter, record creation, completed-result import validation, and Open-link authority were not changed.

W412 findings preserved:

- RideNow Powersports returned verified Open links but selected Industrial Distribution instead of Dealer Hardgoods.
- R.E. Michel Company returned verified Open links but selected Parts & Service instead of clean HVAC/Mechanical.
- Both findings remain post-smoke review inputs; W413 fixes consultant UX presentation and does not change lane resolution or source-pack behavior.

Updated drawer marker:

- Drawer version: `1.0.25`
- UX block: `W413`

## Implemented UX Changes

### ROI / Competitive

The top ROI/Competitive surface now uses the approved Presenter Flow:

- Say first
- Ask next
- Show proof
- Value to prove
- Objection handle
- Competitive watch-out
- Claim caution

Changes made:

- Replaced first-read coaching-box labels with presenter-flow labels.
- Added a distinct Competitive watch-out row.
- Capped first-read copy so long generated talk tracks do not dominate the drawer.
- Rephrased common "demo risk" wording into buyer-risk/value language where it appears in the first-read flow.
- Kept longer value evidence, competitive prep, source confidence, proof stack, and claim guardrails collapsed.
- Preserved advisory-only and customer-baseline caution.

### Run

The Run tab keeps the W371/W408 numbered NetSuite path and verified Open-link behavior.

Changes made:

- Kept Say / Show / Close directly under the selected live control.
- Changed the visible duplicate "Selected script" block into a compact Presenter objective.
- Collapsed the duplicate full script into a closed `Full Say / Show / Close script` detail section.
- Preserved imported proof records collapsed by default.
- Preserved proof guardrails, competitive cue, and audit/support details as lower surfaces.
- Preserved real clickable Open links only when link authority is `verified_openable`.

### Build

The Live Proof CTA now uses stacked rows instead of three cramped columns.

Changes made:

- Added `idb-w413-proof-cta-rows`.
- Proof action, Safe claim, and Stop now render as horizontal stacked rows in the drawer flow.
- Each row uses compact first-read copy.
- Evidence confidence, receipt, next action, advisory state, and evidence receipt details remain visible or collapsed according to the existing support model.

## Trace-Driven Validation

Inputs:

- RideNow Powersports trace: `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780515279117.json`
- R.E. Michel Company trace: `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780515597715.json`

Validation summary:

- Both trace states render the W413 Presenter Flow.
- Both trace states preserve five verified Open links.
- Both trace states preserve resolver-limited public website evidence and advisory-supported N/LLM separation.
- Run no longer shows the same Say / Show / Close story as multiple open visible script blocks.
- Build Live Proof CTA uses the stacked-row class.

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| Approved design direction implemented | Pass | W413 harness found approved labels/classes in both userscript copies. |
| ROI/Competitive Presenter Flow readability | Pass | RideNow and R.E. Michel rendered Say first, Ask next, Show proof, Value to prove, Objection handle, Competitive watch-out, and Claim caution. |
| Say first / Ask next / Show proof presence | Pass | W413 harness verified all three labels in rendered trace-state value views. |
| Value to prove clarity | Pass | W413 harness verified the value row exists and first-read demo-risk wording is not used. |
| Competitive watch-out clarity | Pass | W413 harness verified the dedicated watch-out row and advisory-only meta copy. |
| Claim caution preservation | Pass | W413 harness verified customer-baseline and unsupported-claim caution remains. |
| Run duplicate-script cleanup | Pass | W413 harness verified Presenter objective is visible and full Say / Show / Close script is collapsed. |
| Run verified Open-link preservation | Pass | Both traces preserved five verified NetSuite Open links. |
| Build CTA stacked-row layout | Pass | W413 harness verified `idb-w413-proof-cta-rows` in rendered Build review output. |
| Imported proof records collapsed by default | Pass | W413 harness verified imported proof records remain in closed details. |
| Confidence/source separation | Pass | Both traces preserved resolver-limited / low website evidence and advisory-supported / high N/LLM state. |
| No fake Open links | Pass | All reviewed Open links are verified NetSuite URLs returned by completed build results. |
| No live smoke/no upload boundary | Pass | W413 report and harness verify no live smoke, upload, or deployment. |
| No source-pack/runner/adapter mutation | Pass | W413 scoped changes to drawer presentation, report, harness, package script, and FileCabinet mirror. |
| W412 findings preservation | Pass | W412 report remains present and W413 preserves the post-smoke findings. |
| No-regression gates | Pass | W413, W412, W411, W410, and W409 harnesses passed. |

## Validation Commands

```bash
node --check idb-drawer.user.js
node --check "src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb-drawer.user.js"
node --check archive/tools/run_w413_consultant_ux_design_gate_harness.js
npm run harness:consultant-ux-design-gate-w413
npm run harness:first-two-smoke-review-ux-cleanup-plan-w412
npm run harness:larger-smoke-candidate-packet-w411
npm run harness:larger-smoke-series-design-gate-w410
npm run harness:comfortable-lane-hardening-matrix-w409
```

## Verification Results

```text
node --check idb-drawer.user.js: passed
node --check src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb-drawer.user.js: passed
node --check archive/tools/run_w413_consultant_ux_design_gate_harness.js: passed
W413 consultant UX design gate harness: 19/19 passed
W412 first two smoke review UX cleanup plan harness: 16/16 passed
W411 larger smoke candidate packet harness: 17/17 passed
W410 larger smoke-series design gate harness: 17/17 passed
W409 comfortable lane hardening matrix harness: 17/17 passed
```

## Recommendation

Lock W413 UX patch. Install/sync Drawer 1.0.25 / W413 before the remaining smoke runs so the next traces evaluate the cleaned-up consultant experience.

Recommended remaining smoke path:

1. Replacement clean HVAC/Mechanical candidate.
2. Meridian Bioscience for Life Sciences.
3. Yost Foods for Food/Beverage.

Keep General Parts paused unless a second Parts/Service smoke is intentionally desired.
