# W348: Broader Smoke Matrix With Deployment Sync Preflight

## Preflight

Result: pass.

- `npm run suitecloud:verify-filecabinet` passed.
- `npm run deploy:verify-sync-w347` passed.
- Drawer root and SuiteCloud mirror hash: `a414a57df467eeea12d6beae6a178ad687cbc250b1f40665795cdc37ec077c3a`
- Adapter root and SuiteCloud mirror hash: `ed1a081a47bb8b9e5556a428244e163e20bcc7d209148445e3f7271973bd2f14`
- Runner root and SuiteCloud mirror hash: `a2a89a081252cb957ec9e65fa155565db4a424c0b612703e80fe2659bf20b226`

No live NetSuite downloads were provided for W348 hash comparison, so W347 verified repo-root-to-SuiteCloud-mirror sync only.

## Matrix Decision

W348 does not introduce a runtime patch. It turns the current evidence into a smoke matrix and identifies the next safest live test.

The broader matrix is ready, but only Parkway is a current locked pass. Crescent and Summit are useful historical live import evidence, but both predate the completed W346/W347 confirmation and had issues that later blocks fixed. Beacon Ridge remains blocked because evidence was missing.

## Smoke Matrix

| Scenario | Evidence | Grade | Gate result |
| --- | --- | --- | --- |
| Parkway Contractor Supply / Distribution Branch Availability | `archive/trace_samples/w345_parkway_w344_successful_live_smoke_evidence_trace.json` | Pass | Current locked control baseline. |
| Crescent Electric Supply / Electrical Distribution | `archive/trace_samples/w330_crescent_live_smoke_evidence_review_trace.json` | Path pass, historical story attention | Use as import-path evidence only; not current W346/W347 proof. |
| Summit Ridge Electrical Supply / Electrical Distribution | `archive/trace_samples/w338_marker_verified_electrical_story_live_smoke_review_trace.json` | Path pass, historical install-drift attention | Use as import-path evidence only; not current W346/W347 proof. |
| Beacon Ridge / Dealer-Hardgoods candidate | `archive/trace_samples/w329_review_uploaded_beacon_ridge_or_rerun_trace.json` | Blocked | Missing evidence; do not unlock broad smoke or dealer-hardgoods expansion from this. |

## Pass Gates For The Next Live Smoke

- W347 preflight passes immediately before the smoke.
- Drawer visible marker is `Drawer 1.0.4 / W346`.
- Runner completes and the drawer imports the current completed result.
- W151 accepts the completed result.
- W214 semantic operating-mode guard does not block a valid completed result.
- W245 display-ready records are present before Open links appear.
- W341/W342 naming markers remain visible or exported where required.
- W344 supporting SKU role remains `supporting_sku`.
- W346 consultant UX remains clear: build/import confidence is separate from website evidence confidence.
- Trace export and screenshots are captured before grading.

## Fail Gates

- Any Open link appears before real numeric ids and supported NetSuite URLs.
- The drawer creates records, writes transactions, or bypasses the approved adapter path.
- W347 hash guard fails.
- A current smoke does not produce a trace export.
- Historical traces are treated as current W346/W347 live proof.
- Dealer/hardgoods expansion is unlocked from Beacon Ridge without uploaded evidence.

## Regression Review

- W151: preserved; completed-result import authority remains the gate.
- W214: preserved; semantic operating-mode validation remains required.
- W245: preserved; Open links require display-ready imported records.
- W341: preserved; prospect-specific proof naming remains required for distribution proof names.
- W342: preserved; runner naming verification marker remains part of trace review.
- W344: preserved; supporting SKU role/name remains protected.
- W345: preserved; Parkway is still the locked successful live smoke baseline.
- W346: preserved; consultant-facing post-import UX remains the expected visible state.
- W347: preserved; deployment sync preflight is now required before every smoke.

## Recommendation

Proceed to one controlled live scenario before a full broader matrix.

Recommended next step: run one W347-preflighted live smoke on an adjacent distribution/electrical prospect, then upload the trace export plus screenshots. Do not patch runner or adapter first. The smallest useful next fix, if the live run fails, should be selected from the uploaded evidence only.

## Operator Steps

1. Push origin if any local commit is ahead.
2. Run `npm run suitecloud:verify-filecabinet`.
3. Run `npm run deploy:verify-sync-w347`.
4. Confirm the drawer shows `Drawer 1.0.4 / W346`.
5. Run one controlled live smoke.
6. Export trace and capture Plan, Build, ROI/Competitive, Run, and Trace screenshots.
7. Upload the trace and screenshots for W349 grading.

## Next Recommended Prompt

```text
Move through W349: Grade first W348 controlled live smoke.

Use W347 deployment preflight and W348 smoke matrix as the baseline. Review the uploaded trace export and screenshots from one controlled non-Parkway live smoke. Grade pass/fail gates, compare against Parkway W345/W346, identify whether the failure is deployment sync, import validation, runner/adapter behavior, story UX, or operator evidence. Recommend the smallest next action.

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
- Regression review against W151, W214, W245, W341, W342, W344, W345, W346, W347, and W348.
- Decision: proceed to second matrix smoke, patch one issue, or pause for UX polish.
```
