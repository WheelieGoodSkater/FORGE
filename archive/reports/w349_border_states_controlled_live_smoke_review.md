# W349: Border States Controlled Live Smoke Review

## Evidence Reviewed

Trace archived:

`archive/trace_samples/w349_border_states_w348_controlled_live_smoke_trace.json`

Original operator export:

`/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780101881542.json`

Screenshots reviewed from the operator message:

- Plan
- Build
- ROI / Competitive
- Run: Open, Prove, Handle objection, Close value
- Trace

## Preflight

Result: pass.

- `npm run suitecloud:verify-filecabinet` passed.
- `npm run deploy:verify-sync-w347` passed.
- Drawer root and SuiteCloud mirror hash: `a414a57df467eeea12d6beae6a178ad687cbc250b1f40665795cdc37ec077c3a`
- Adapter root and SuiteCloud mirror hash: `ed1a081a47bb8b9e5556a428244e163e20bcc7d209148445e3f7271973bd2f14`
- Runner root and SuiteCloud mirror hash: `a2a89a081252cb957ec9e65fa155565db4a424c0b612703e80fe2659bf20b226`

## Decision

Status: pass with focused UX cleanup before second broader smoke.

Border States is a successful controlled non-Parkway live smoke. The record creation and import path should be kept. Do not patch runner, adapter, completed-result validation, or drawer write authority from this evidence.

The smallest next fix is consultant-facing copy sanitation for operator-note prefixes, because the run proved W346/W347 deployment health and the remaining visible problems are copy polish, not backend correctness.

## Pass Evidence

- Exported at: `2026-05-30T00:44:41.224Z`
- Event count: `23`
- Customer: `Border States Supply`
- Visible drawer marker exported: `Drawer 1.0.4 / W346`
- W342 marker active: `W342 runner naming verification active`
- W341 marker active: `W341 prospect-specific proof naming active`
- Resolved mode: `distribution_replenishment`
- Runner result status: `completed_result_imported`
- Result capture status: `completed_result_capture_ready`
- W151 accepted completed result: `true`
- Import ready: `true`
- Final naming status: `dcc_final_names_imported`
- Adapter readiness: `records_imported`
- W208 status: `records_ready`

Returned records:

- Customer: `Border States Supply Customer Account`, id `3222`
- Sales Order: `SO2700`, id `83829`
- Product SKU: `Border States Product Availability SKU - RIBUTION-RMBC6V-VYV`, id `5145`
- Availability/Replenishment Flow: `Border States Branch Availability / Replenishment Flow - RIBUTION-RMBC6V-VYV`, id `5146`
- Supporting SKU: `Border States Safe Substitute Fulfillment Support SKU - RIBUTION-RMBC6V-VYV`, id `5147`

Every returned record has:

- `safeToOpen: true`
- `linkAuthorityStatus: verified_openable`
- `sourceConfidence: verified_open_link`
- a numeric NetSuite internal id
- a supported `td3021666.app.netsuite.com` URL

## Critical Findings

1. The backend path is healthy. The runner completed, the adapter/result capture preserved the completed result, W151 accepted it, W245-style Open-link authority is intact, and the drawer imported all five returned records.
2. W346 deployment is live. The trace exports `Drawer 1.0.4 / W346`, and the screenshots show the same header.
3. Website evidence is honestly low. The resolver remained `local_fallback_only / fallback_ready` with `failureState: thin`; Plan correctly separates build/import confidence from website evidence confidence.
4. Consultant copy still leaks operator-note prefixes. Screenshots show repeated prefixes like `Buyer: Buyer`, `Pain: Pain`, `Proof: Proof`, and `Value: Value`; Run copy also carries `Pain:` and `Proof:` into spoken script cards.
5. Product naming is acceptable but not ideal. The proof noun is generic `Product`, which is consistent with low website evidence, but future UX should keep the low-confidence caveat clear and avoid overstating product specificity.
6. The generated suffix `RIBUTION-RMBC6V-VYV` is field-safe but visually awkward. This is not a smoke blocker because ids, roles, and links are valid; it is a later naming polish candidate.

## Pass / Fail Table

| Gate | Result | Evidence |
| --- | --- | --- |
| W347 deployment preflight | Pass | Hash guard passed before review. |
| Drawer visible marker | Pass | `Drawer 1.0.4 / W346`. |
| W151 completed-result import | Pass | `completedResultAcceptedByW151: true`. |
| W214 semantic mode guard | Pass | Valid `distribution_replenishment` result imported. |
| W245 Open-link authority | Pass | All five records have verified Open links. |
| W341 runner naming marker | Pass | Marker active, source `runner_result_capture`. |
| W342 trace marker | Pass | Marker active. |
| W344 supporting SKU role | Pass | Supporting SKU role and name preserved. |
| W345 Parkway baseline comparison | Pass | Border States matches Parkway import/link shape. |
| W346 consultant UX | Partial | Build/import confidence separation works; note-prefix leakage remains. |
| W347 sync discipline | Pass | Local mirror sync passed. |
| W348 matrix progression | Pass | First controlled non-Parkway smoke can be marked path-pass. |

## No-Regression Boundaries

- W151 completed-result import guard preserved.
- W214 semantic operating-mode guard preserved.
- W245 display-ready Open-link authority preserved.
- W341 prospect-specific proof naming preserved.
- W342 visible trace marker preserved.
- W344 supporting SKU role/name fix preserved.
- W345 Parkway baseline remains valid.
- W346 consultant-facing confidence separation preserved.
- W347 deployment sync preflight preserved.
- W348 smoke matrix discipline preserved.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.
- Runner remains the record creation authority.
- Adapter remains the approved server-side path.
- N/LLM remains advisory only.

## Recommendation

Proceed to a focused W350 consultant-copy cleanup before the second broader smoke.

Do not change runner or adapter behavior. Do not change import validation. The live path is proving out. The next best block should sanitize operator-note prefixes and tighten low-evidence copy so a successful smoke feels fully consultant-safe.

## Next Recommended Prompt

```text
Move through W350: Consultant note-prefix cleanup after Border States smoke.

Use W349 Border States and W345 Parkway as live baselines. Fix consultant-facing Plan, Build, ROI, and Run copy so operator note labels such as Buyer:, Pain:, Proof:, Value:, Competitive:, Decision criteria:, and Stop: do not appear as duplicated visible prefixes or spoken script text. Preserve build/import confidence separation, low website evidence honesty, imported proof record guidance, and all W151/W214/W245/W341/W342/W344/W345/W346/W347/W348/W349 boundaries.

Boundaries:
- No new drawer write paths.
- No transaction writes from the drawer.
- No fake Open links.
- Do not weaken completed-result import validation.
- Do not change runner, adapter, or record creation behavior.
- Keep N/LLM advisory only.

Deliverables:
- Scoped copy sanitation code change.
- W350 report.
- Harness proving Border States and Parkway post-import copy do not leak note prefixes, while preserving records/import/Open-link gates.
- Recommendation on whether to run the second broader smoke immediately after deploy.
```
