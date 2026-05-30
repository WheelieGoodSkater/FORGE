# W350: Consultant Note-Prefix Cleanup

## Baseline

W350 uses two live baselines:

- Border States W349 controlled live smoke: `archive/trace_samples/w349_border_states_w348_controlled_live_smoke_trace.json`
- Parkway W345 successful live smoke: `archive/trace_samples/w345_parkway_w344_successful_live_smoke_evidence_trace.json`

## Decision

Proceed to deploy W350, then run the second broader smoke.

This block is a scoped consultant-copy cleanup. It does not change runner behavior, adapter behavior, record creation behavior, completed-result validation, Open-link validation, or drawer write authority.

## Changes

- Drawer userscript version moved to `1.0.5`.
- Visible drawer marker now renders `Drawer 1.0.5 / W350`.
- Consultant copy sanitizer now strips operator-note prefixes:
  - `Buyer:`
  - `Pain:`
  - `Proof:`
  - `Value:`
  - `Competitive:`
  - `Decision criteria:`
  - `Stop:`
- The sanitizer also strips duplicated embedded labels such as `risk: Pain: ...`.
- Build request summary rows no longer add `Buyer:`, `Pain:`, `Proof:`, or `Value:` prefixes.
- ROI/details copy uses dash labels instead of colon-prefixed note labels where those details can appear in consultant surfaces.

## Gates

Pass:

- Border States Plan, Build, ROI, and Run surfaces replay without note-prefix leakage.
- Parkway Plan, Build, ROI, and Run surfaces replay without note-prefix leakage.
- Border States imported record gate remains valid.
- Parkway imported record gate remains valid.
- W346 build/import confidence separation remains visible.
- Low website evidence remains visible and honest.
- W347 deployment sync guard remains usable with the new `1.0.5 / W350` marker.

Fail:

- Any normal consultant surface shows duplicated `Buyer: Buyer`, `Pain: Pain`, `Proof: Proof`, or `Value: Value`.
- Any spoken Run script contains operator-note prefixes.
- Any Open link appears without verified imported record ids and URLs.
- Any runner, adapter, import validation, or drawer write authority behavior changes.

## No-Regression Boundaries

- W151 completed-result import guard preserved.
- W214 semantic operating-mode guard preserved.
- W245 display-ready Open-link authority preserved.
- W341 prospect-specific proof naming preserved.
- W342 visible trace marker preserved.
- W344 supporting SKU role/name fix preserved.
- W345 Parkway baseline preserved.
- W346 consultant-facing confidence separation preserved.
- W347 deployment sync discipline preserved.
- W348 smoke matrix discipline preserved.
- W349 Border States smoke evidence preserved.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.
- Runner remains the record creation authority.
- Adapter remains the approved server-side path.
- N/LLM remains advisory only.

## Deployment Recommendation

Deploy W350 before the second broader smoke.

Steps:

1. Push origin so Tampermonkey can auto-update to `1.0.5`.
2. Run `npm run suitecloud:verify-filecabinet`.
3. Run `npm run deploy:verify-sync-w347`.
4. Confirm live drawer header shows `Drawer 1.0.5 / W350`.
5. Run one adjacent distribution/electrical smoke.
6. Export trace and screenshots for W351 grading.

## Next Recommended Prompt

```text
Move through W351: Grade second broader smoke after W350 copy cleanup.

Use W350 deployed drawer as the baseline. Review the uploaded trace and screenshots from the second non-Parkway smoke. Grade record creation/import/Open-link gates, verify note-prefix cleanup stayed fixed, compare against Parkway W345 and Border States W349, and decide whether the broader matrix can continue or needs one focused patch.

Boundaries:
- No new drawer write paths.
- No transaction writes from the drawer.
- No fake Open links.
- Do not weaken W151/W214/W245 completed-result validation.
- Do not change runner or adapter behavior unless the uploaded evidence proves it is required.
- Keep N/LLM advisory only.

Deliverables:
- Evidence review report.
- Pass/fail table.
- Regression review against W151, W214, W245, W341, W342, W344, W345, W346, W347, W348, W349, and W350.
- Decision: proceed to next matrix smoke, patch one issue, or pause for UX polish.
```
