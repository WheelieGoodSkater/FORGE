# W351: Second Broader Smoke After W350 Copy Cleanup

## Baseline

W351 reviews the TriState Electrical Supply smoke captured after W350 was deployed:

- Trace: `archive/trace_samples/w351_tristate_second_broader_smoke_after_w350_trace.json`
- Installed drawer marker: `Drawer 1.0.5 / W350`
- Comparison baselines:
  - Parkway W345 successful live smoke
  - Border States W349 controlled live smoke
  - W350 consultant note-prefix cleanup

## Decision

Proceed to the next matrix smoke.

TriState is a pass for the current broader-smoke objective. The build/import path completed, returned records were imported, Open links are verified, W341/W342 markers are active, and the W350 consultant copy cleanup held across Plan, Build, ROI, and Run.

The remaining risk is not a blocker: website evidence is still low and correctly presented as needing confirmation. That is expected for this test and should remain visible before ROI or competitive claims.

## Evidence Summary

| Gate | Result | Evidence |
| --- | --- | --- |
| Deployment marker | Pass | Trace and screenshots show `Drawer 1.0.5 / W350`. |
| Event capture | Pass | Trace exported `2026-05-30T01:38:48.886Z` with 35 events. |
| Prospect/lane | Pass | TriState Electrical Supply, Industrial Distribution & Branch Fulfillment. |
| Runner naming | Pass | W341 prospect-specific proof naming active. |
| Current block marker | Pass | W342 runner naming verification active. |
| Completed-result import | Pass | `completed_result_imported`; W151 accepted; import ready. |
| Final naming import | Pass | `dcc_final_names_imported`; final names imported. |
| Open-link authority | Pass | Five display-ready records have numeric ids, NetSuite URLs, `safeToOpen`, and `verified_openable`. |
| Website evidence honesty | Pass | Website confidence remains `needs_confirmation` / low and separated from build/import confidence. |
| W350 note-prefix cleanup | Pass | Normal consultant surfaces do not show `Buyer:`, `Pain:`, `Proof:`, `Value:`, `Competitive:`, `Decision criteria:`, or `Stop:` as operator labels. |
| Drawer write boundary | Pass | Trace no-regression flags preserve no IDB writes and no transaction writes. |

## Returned Proof Records

- Customer: TriState Electrical Supply Customer Account, internal id `3322`
- Sales Order: SO2701, internal id `83929`
- Hero item: TriState Product Availability SKU - RIALDIST-ROGO48-PSW, internal id `5245`
- Availability/Replenishment Flow: TriState Branch Availability / Replenishment Flow - RIALDIST-ROGO48-PSW, internal id `5246`
- Supporting SKU: TriState Safe Substitute Fulfillment Support SKU - RIALDIST-ROGO48-PSW, internal id `5247`

## Critical Notes

- The operator-note labels still exist inside raw intake, runner params, preview packets, and trace internals. That is acceptable and useful for auditability.
- The consultant-facing rendered surfaces are clean. W350 correctly sanitizes the visible Plan, Build, ROI, and Run surfaces.
- The screenshots show a good post-import state: Plan says build/import is verified, Build says records are ready, ROI keeps website uncertainty visible, and Run uses imported proof records.
- The visible `STOP` label inside the proof CTA remains a product guardrail label, not an operator-note prefix leak. It is acceptable because it says what not to claim.

## Regression Review

- W151 completed-result import guard preserved.
- W214 semantic operating-mode guard preserved.
- W245 display-ready Open-link authority preserved.
- W341 prospect-specific proof naming preserved.
- W342 current trace marker preserved.
- W344 supporting SKU role/name behavior preserved.
- W345 Parkway pass remains the primary live baseline.
- W346 build/import confidence separation preserved.
- W347 deployment sync discipline preserved.
- W348 broader smoke discipline preserved.
- W349 Border States evidence remains valid.
- W350 note-prefix cleanup preserved.
- No new drawer write paths.
- No drawer transaction writes.
- No fake Open links.
- Runner and adapter behavior unchanged.
- N/LLM remains advisory only.

## Recommendation

Run one more adjacent matrix smoke before changing code again. The next smoke should test a nearby but slightly different distribution scenario, preferably one with stronger website evidence so we can validate the website confidence model in a better-evidence case.

Suggested next target:

- Name: Summit Industrial Supply
- Website: `https://www.summit.com/`
- Notes focus: industrial distributor with branch availability, replenishment timing, substitute products, and customer promise confidence.

## Next Recommended Prompt

```text
Move through W352: Third broader smoke with stronger website evidence.

Use W351 TriState, W349 Border States, and W345 Parkway as live baselines. Review the next uploaded trace and screenshots from a distribution smoke with stronger website evidence. Grade build/import/Open-link gates, verify website confidence separation, confirm W350 note-prefix cleanup still holds, and decide whether the broader smoke matrix is stable enough for a small release checkpoint.

Boundaries:
- No new drawer write paths.
- No transaction writes from the drawer.
- No fake Open links.
- Do not weaken W151/W214/W245 completed-result validation.
- Do not change runner or adapter behavior unless uploaded evidence proves it is required.
- Keep N/LLM advisory only.

Deliverables:
- Evidence review report.
- Pass/fail table.
- Regression review against W151, W214, W245, W341, W342, W344, W345, W346, W347, W348, W349, W350, and W351.
- Decision: continue matrix, patch one issue, or cut a small release checkpoint.
```
