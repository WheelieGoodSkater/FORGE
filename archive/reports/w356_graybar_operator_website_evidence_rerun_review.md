# W356: Graybar Operator Website Evidence Rerun Review

## Baseline

W356 reviews the two live Graybar runs after W355 was installed.

- No supplied website evidence trace: `archive/trace_samples/w356_graybar_no_supplied_website_evidence_trace.json`
- Supplied website evidence trace: `archive/trace_samples/w356_graybar_supplied_website_evidence_trace.json`
- Live marker in both traces: `Drawer 1.0.7 / W355`
- Prospect: Graybar Electric
- Website: `https://www.graybar.com/`

## Critical Finding

W355 behaved correctly, but the product direction needs to change before the next broad smoke.

The supplied-evidence run proves the mechanism: when strong public website/category text is present, FORGE can classify Graybar as recommended/high and derive electrical distribution product language. But this should not become the normal operator workflow. A consultant should not have to paste a website summary into a separate field for a known public site.

The next block should use N/LLM as an advisory bridge and improve the website-evidence model so FORGE can show stronger confidence from available URL/domain/category/product signals without pretending advisory inference is the same thing as fetched public website evidence.

## Run Comparison

| Gate | No supplied evidence | Supplied evidence |
| --- | --- | --- |
| Live drawer marker | Pass: `Drawer 1.0.7 / W355` | Pass: `Drawer 1.0.7 / W355` |
| Website resolver mode | `local_fallback_only / thin` | `local_fallback_only / fallback_ready` with operator supplied evidence |
| Website read UX | Pass: resolver-limited, not website-weak | Pass: recommended/high |
| Build/import gate | Pass: `completed_result_imported` with W151 accepted | Not graded: session was cleared; this run validates evidence only |
| Open-link authority | Pass: five real NetSuite links verified openable | Not graded: no imported records in the supplied-evidence trace |
| W341 runner naming | Pass: prospect-specific naming active | Not returned because no build/import result was present |
| W350 note-prefix cleanup | Pass | Pass |
| No-write boundaries | Pass | Pass |

## Evidence Details

No supplied evidence:

- Exported at: `2026-05-30T15:38:06.440Z`
- Events: `3`
- Build/import status: `completed_result_imported`
- Final naming status: `dcc_final_names_imported`
- Returned records: customer, sales order, product SKU, availability/replenishment flow, supporting SKU
- Website read: resolver-limited
- Failure state: `thin`

Supplied evidence:

- Exported at: `2026-05-30T15:42:21.726Z`
- Events: `26`
- Website read: recommended/high
- Product seed: Electrical Product Availability SKU
- Product family: Electrical Distribution Branch Fulfillment
- Demand moment: branch availability and fulfillment confidence
- Important caveat: this is not a completed build/import smoke because the active session was cleared and no runner result was imported in the second trace.

## Visual Findings

Focus future screenshots only on decision-critical surfaces:

- Plan confidence card: build/import status, website read status, next action.
- Website Read card/details: source type, resolver mode, N/LLM advisory status, and why confidence changed.
- Build result card: imported records and Open-link authority.
- Run proof CTA: whether the live script uses imported proof records and keeps claims safe.

Do not keep looping through full-page screenshots unless the issue is visual layout, overflow, or consultant-facing copy.

Current W355 visual gaps:

- The optional website/category evidence field is too manual for normal use.
- The supplied-evidence details still expose technical resolver language (`local_fallback_only / fallback_ready`) next to a recommended result, which is accurate but visually confusing.
- The UI needs a third confidence concept: `Website evidence`, `N/LLM advisory inference`, and `Build/import proof`. Right now strong advisory evidence can look too much like confirmed website evidence.

## Code Findings For Next Block

Relevant surfaces:

- `websiteEvidenceUxModel(state, lane)` in `idb-drawer.user.js`
- `operatorSuppliedWebsiteEvidenceReadinessW355(intake, domain)` in `idb-drawer.user.js`
- `localWebsiteEvidenceV1FromState(state)` in `idb-drawer.user.js`
- `renderPlanView(state, lane, page, recommendation)` in `idb-drawer.user.js`

The next implementation should not remove W355. Keep it as a diagnostic fallback. But normal confidence should not require the optional field.

Needed model split:

- Fetched public evidence: actual resolver or hosted website read.
- Operator supplied evidence: W355 diagnostic fallback.
- N/LLM advisory inference: can strengthen lane/story confidence and suggest likely public category, but remains advisory.
- Build/import proof: governed NetSuite returned records and Open links, never replaced by website confidence.

## Decision

Do not resume broad smoke matrix yet.

Move next into a small W357 model/UX block that removes the false choice between `resolver-limited low` and `operator-pasted high`. The better path is an advisory website-confidence tier that uses N/LLM and available domain/category/product signals while keeping public evidence honesty intact.

## Next Recommended Prompt

```text
Move through W357: N/LLM-assisted website confidence without operator paste dependency.

Use W356 Graybar paired traces as the baseline. Preserve W355 operator-supplied evidence as an advanced diagnostic fallback, but build the normal path so FORGE can use available website URL/domain, resolver hints, product/category language, and N/LLM advisory signals to produce a clearer confidence state without requiring a separate pasted website summary.

Goals:
- Add a distinct advisory confidence tier for N/LLM-assisted website/category inference.
- Keep fetched public website evidence separate from advisory inference.
- Keep resolver-limited labeling when there is no fetched or advisory evidence strong enough.
- Do not let notes alone produce confirmed website confidence.
- Do not let website or advisory confidence override build/import/Open-link validation.
- Make the Plan and Website Read visuals show the difference between public evidence, advisory inference, and build/import proof.
- Keep W355 optional website/category evidence available only as a diagnostic/advanced fallback, not the primary consultant path.

Visual requirements:
- Plan confidence card should show build/import confidence and website/advisory confidence as separate chips.
- Website Read card should avoid scary technical resolver terms in the primary line; put resolver details behind an evidence details disclosure.
- Run surfaces should keep claim-safe copy: advisory inference can guide talk track, but not ROI claims or fake proof.
- Limit screenshots to Plan confidence, Website Read details, Build result/Open links, and Run proof CTA.

Boundaries:
- No new drawer transaction write paths.
- No fake Open links.
- Do not change runner, adapter, or record creation behavior.
- Do not weaken completed-result import validation.
- Keep N/LLM advisory only.

Deliverables:
- Scoped model/UX change for advisory website confidence.
- W357 report and harness.
- Graybar proof that no-paste flow becomes clearer without pretending public fetch succeeded.
- Regression proof for Parkway, Border States, TriState, and W355 supplied-evidence fallback.
- Recommendation on whether to resume broader smoke matrix or configure hosted resolver next.
```
