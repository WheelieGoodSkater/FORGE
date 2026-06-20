# W414: Naming Hardening and Executable Consultant Cockpit Review

Date: 2026-06-20

Use W413 Consultant UX Design Gate as the latest UX baseline. Keep W412 first-two-smoke review, W411 smoke candidate packet, W409 comfortable lane hardening matrix, W408 HVAC, W403 Wholesale Janitorial, W397 Building Materials, W386 source-pack readiness evidence package, and W379-W383 source-pack-ready lane baselines locked.

## Summary

W414 addresses the naming degradation seen after the recent dry/live-style runs and captures the UI/UX review needed to make FORGE executable in fewer consultant steps.

No live smoke was run. No upload or deployment was performed. No source packages were added. No adapter, completed-result import validation, or Open-link authority behavior was changed. N/LLM remains advisory-only.

The immediate hardening target was record naming and labels:

- Website/lane evidence should choose the lane and record family.
- Prospect name should be embedded into generated customer/item/proof record names.
- Conversation notes should shape ROI, competitive, and presenter scripts.
- Returned records should preserve their lane-specific labels instead of falling back to generic or stale food/manufacturing wording.

## What Degraded

Recent evidence showed the naming layer could regress into templated or mismatched labels:

- Industrial Equipment could surface proof records labeled as Food/Beverage objects, such as `Finished Food/Batch Item`, `Formula or Batch Structure`, and `Ingredient / Packaging Component`.
- Returned records could show the right customer/prospect name but the wrong proof-role label.
- The drawer could flatten returned labels back into generic role labels instead of preserving the runner's lane-specific role labels.

That is presentation-risky. A consultant cannot trust the demo if the story says Industrial Equipment but the returned proof records look like Food/Beverage.

## Scoped Fix

Runner hardening:

- `runnerLaneVocabularyPolicyV1(...)` now prioritizes confirmed lane id before broad text heuristics.
- Industrial Equipment resolves to manufacturing or WIP manufacturing labels, not food labels.
- Food/Beverage keeps food labels, but separates manufacturing-style food labels from non-MFG replenishment labels.
- Dealer Hardgoods and Apparel/Retail retain their lane-specific proof labels.
- Prospect-specific proof names now win for matrix/proof and component records across all supported modes, not only distribution.
- Returned records carry `label` through `normalizeIdbRecord(...)`, sidecar JSON, result capture, and runner return payloads.

Drawer hardening:

- `normalizeDccFinalObject(...)` preserves returned `consultantLabel`, `displayLabel`, or `label` before fallback labels.
- `dccFinalNamingResultV1(...)` reads `runnerLaneVocabularyPolicy.finalResultRoleLabels`.
- Openable returned records preserve returned labels before falling back to mode-aware labels.
- Root and FileCabinet drawer copies are kept in sync.

## Trace Review

Reviewed user-provided trace:

- `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1781706489161.json`

Observed state:

- Prospect: Herr Foods
- Selected lane: Food / Beverage CPG Manufacturing
- Product seed: Finished Good Variety Pack
- Website/category evidence: usable but still requires confirmation before ROI claims
- Runner result was still pending/polling in the trace state

This trace is not the Dorner naming regression itself; it is the current CPG/Food run evidence. The Dorner screenshot exposed the stronger naming-risk pattern: Industrial Equipment selected, but Food/Beverage proof labels shown. W414 hardens the source path that allowed that mismatch.

## UI/UX Review

An agent reviewed the consultant flow in depth. The blunt finding:

FORGE is functionally close, but the post-run experience is still split across too many tabs and support surfaces. The consultant should not have to assemble the story from Build, ROI/Competitive, Run, and Trace after records are returned.

Recommended next UX shape: one primary post-run surface, the **Demo Cockpit**.

The cockpit should show, without scrolling:

- Customer and lane.
- Build status and verified Open-link count.
- story with embedded records.
- top ROI point without scrolling.
- Competitive battlecard with one objection-handle talk track.
- Ordered Open links for the returned NetSuite records.

Everything else should be collapsed:

- Full script.
- Trace.
- Website evidence details.
- Source confidence.
- Proof stack.
- Import/recovery diagnostics.
- Admin/debug surfaces.

This is the least-step consultant motion:

1. Enter customer, website, and notes.
2. Choose only the needed toggles: new item, MFG, WIP.
3. Run FORGE.
4. Land in one cockpit with the proof story, ROI point, battlecard, and Open links.

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| Runner lane-id priority | Pass | Confirmed lane id is checked before broad distribution/food/manufacturing text heuristics. |
| Industrial labels no longer fall through to food labels | Pass | Industrial uses `Configured Equipment Item`, `Assembly / Component Readiness`, `WIP / Routing Readiness`, and `Component Supply Item`. |
| Food labels remain intentional and scoped | Pass | Food manufacturing keeps food/batch labels; non-MFG food uses replenishment/promotion support labels. |
| Prospect-specific proof names win | Pass | Matrix/proof and component records use lane/prospect-specific names before stale generated names. |
| Runner label preservation | Pass | Returned records now carry labels through sidecar, capture, and runner payloads. |
| Drawer label preservation | Pass | Drawer preserves returned labels before fallback role labels. |
| Herr Foods trace reviewed | Pass | Trace confirms Food/Beverage lane and Finished Good Variety Pack product seed. |
| Executable cockpit recommendation documented | Pass | Report defines the one primary post-run cockpit and collapsed support surfaces. |
| No live smoke/no upload boundary | Pass | W414 performed no live smoke, upload, deployment, or package mutation. |
| Authority separation preserved | Pass | Website/lane evidence, notes, N/LLM advisory, build/import proof, and Open-link authority remain separated. |

## Validation Commands

```bash
node --check "src/FileCabinet/SuiteScripts/Intelligent Demo Builder/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js"
node --check idb-drawer.user.js
node --check "src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb-drawer.user.js"
node --check archive/tools/run_w414_naming_and_executable_cockpit_review_harness.js
npm run harness:naming-and-executable-cockpit-review-w414
npm run harness:consultant-ux-design-gate-w413
```

## Verification Results

```text
node --check src/FileCabinet/SuiteScripts/Intelligent Demo Builder/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js: passed
node --check idb-drawer.user.js: passed
node --check src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb-drawer.user.js: passed
node --check archive/tools/run_w414_naming_and_executable_cockpit_review_harness.js: passed
W414 naming and executable cockpit review harness: 11/11 passed
W413 consultant UX design gate harness: 19/19 passed
```

## Recommendation

Lock W414 naming hardening before additional live runs.

Next, do one focused UX implementation block: create the post-run Demo Cockpit as the primary consultant landing surface. Do not add new lanes or run more smoke until the cockpit shows the story, Open records, top ROI point, and competitive battlecard without forcing the consultant to jump tabs.
