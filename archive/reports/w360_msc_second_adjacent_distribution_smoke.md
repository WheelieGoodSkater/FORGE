# W360: MSC Second Adjacent Distribution Smoke

## Baseline

W360 uses W358 Graybar and W359 Fastenal as paired baselines:

- Graybar: resolver-limited public read plus advisory supported/high.
- Fastenal: public-read recommended/high without optional evidence.
- MSC: public read found category signals, but stayed needs-confirmation/medium while advisory supported the lane.

Live evidence:

- Trace: `archive/trace_samples/w360_msc_second_adjacent_distribution_smoke_trace.json`
- Exported at: `2026-05-30T17:46:40.471Z`
- Visible drawer marker: `Drawer 1.0.8 / W357`
- Prospect: MSC Industrial Supply Co.
- Website: `https://www.mscdirect.com/`
- Optional website/category evidence: blank

## Critical Review

MSC passed as a smoke, but it is the clearest signal that the next block should not be another broad smoke.

The public website read was not resolver-limited. It returned runtime-resolved category evidence, but the score stayed at `0.55`, so the UI correctly held the lane at `Needs confirmation / Medium`. N/LLM advisory supported the Industrial Distribution lane, but it did not override public evidence or build/import validation. This is the correct trust behavior.

The product-story specificity is the issue:

- Website evidence found generic industrial supply/distribution/warehouse terms.
- Product seed landed as `Branch Inventory Fulfillment Position`, which is awkward for a consultant-facing SKU.
- Run script references are usable but generic: product availability, branch replenishment, substitute SKU, fulfillment.
- The story is safe, but not yet strong enough for easy expansion into new industry lanes.

This should become a UX/model specificity cleanup, not another live smoke. We now have enough evidence across three adjacent distribution cases to optimize the confidence/story layer offline.

## Pass/Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Installed version | Pass | Live header and trace show `Drawer 1.0.8 / W357`. |
| No-paste condition | Pass | `intake.websiteEvidence` is blank and `operatorSuppliedWebsiteEvidenceW355` is null. |
| Public website read | Pass with caution | Website evidence is runtime-resolved, not resolver-limited, but remains needs-confirmation/medium. |
| Advisory inference | Pass | Advisory is supported/high and visible, but remains advisory-only. |
| Build/import proof | Pass | Runner result is `completed_result_imported`; final names are imported. |
| Open-link proof | Pass | Five display-ready records have numeric IDs, verified Open authority, and NetSuite URLs. |
| Plan confidence separation | Pass | Plan separates build/import, website read, advisory, and Open links. |
| Run claim safety | Pass | Run CTA uses imported proof records and does not make ROI/write/availability claims beyond evidence. |
| No-write boundary | Pass | Trace keeps `noTransactionWritesFromIdb`, `noIdbWrites`, and no fake Open links. |

## Where We Are

We have proven three important confidence modes:

- Resolver-limited strong-company case: Graybar stays honest and uses advisory support.
- Public-read positive case: Fastenal becomes recommended/high without optional paste.
- Public-read medium case: MSC finds category evidence but stays needs-confirmation, with advisory support layered separately.

The build/import path is stable across Parkway, Border States, TriState, Graybar, Fastenal, and MSC. Open links are real after valid imports. The remaining trust work is not record creation; it is consultant-facing confidence, story specificity, and lane expansion readiness.

## Optimized Plan

1. Stop broad smoke loops for the moment.
2. Run one consolidated offline UX/model block using the locked Graybar, Fastenal, and MSC traces.
3. Fix only consultant-facing specificity and confidence language:
   - make medium public evidence explain what is missing,
   - avoid awkward product seeds like `Branch Inventory Fulfillment Position`,
   - keep advisory visibly separate from public evidence,
   - make Run scripts use source-specific product/category language when available,
   - preserve all no-write and import validation boundaries.
4. After that, run one targeted live smoke only if the harness says the UI changed enough to require confirmation.
5. Use the resulting pattern as the lane-expansion template for future industries.

## Why This Route

The major goal is trust across the story and easy expansion through more industry lanes. Repeating live smokes now would mostly produce more screenshots of the same stable build/import path. The higher leverage move is to improve how FORGE explains evidence strength and turns category signals into consultant-safe story language.

This keeps live smoke time for true integration risk and uses harnesses for copy/model polish.

## Recommendation

Do not configure hosted resolver yet and do not run another broad smoke immediately.

Proceed to W361: consolidated confidence and story-specificity polish using locked evidence. Hosted resolver remains a later infrastructure improvement if future strong sites repeatedly fall into resolver-limited or medium confidence despite obvious public evidence.

## Next Recommended Prompt

```text
Move through W361: Consolidated confidence and story-specificity polish from Graybar/Fastenal/MSC evidence.

Use W358 Graybar, W359 Fastenal, and W360 MSC as locked evidence baselines. Do not run a new live smoke unless a code change creates real integration risk. Improve the consultant-facing confidence and story layer so the drawer is trusted across resolver-limited, public-read recommended, and public-read needs-confirmation cases.

Goals:
- Make medium public website evidence explain what is strong and what is missing.
- Keep public evidence, advisory inference, build/import proof, and Open links visually separate.
- Avoid awkward consultant-facing product seeds such as Branch Inventory Fulfillment Position.
- Make Run scripts use stronger product/category language when website evidence provides it.
- Preserve W350 note-prefix cleanup and W357 advisory-only boundaries.
- Preserve all W151/W214/W245 completed-result import validation and Open-link gates.
- Prepare a lane-expansion template so future industry lanes can be added with less bespoke copy work.

Boundaries:
- No new drawer transaction write paths.
- No fake Open links.
- Do not change runner, adapter, or record creation behavior.
- Do not weaken completed-result import validation.
- Keep N/LLM advisory only.

Deliverables:
- Scoped UX/model change if needed.
- W361 report and harness using Graybar, Fastenal, and MSC locked traces.
- Pass/fail table for confidence separation, medium-evidence explanation, product/story specificity, build/import, Open links, and Run claim safety.
- Decision: one targeted live smoke, continue matrix, or begin industry lane expansion pack.
```
