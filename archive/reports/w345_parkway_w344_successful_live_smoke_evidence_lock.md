# W345: Parkway W344 Successful Live Smoke Evidence Lock

## Trace Reviewed

`archive/trace_samples/w345_parkway_w344_successful_live_smoke_evidence_trace.json`

Original operator export:

`/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780094538434.json`

Exported at: `2026-05-29T22:42:18.105Z`

## Decision

Pass.

This is the first locked Parkway W344 live smoke where the governed runner completed, the drawer accepted the completed result, final NetSuite proof records imported, W341 prospect-specific proof names survived the adapter and drawer import path, and W245 Open-link authority marked the returned records safe to open.

W346 consultant UX cleanup should proceed before broader smoke testing. The record build path is working, but the consultant-facing surfaces still have confusing version/status and copy issues that could make a successful run look less trustworthy than it is.

## Pass Evidence

- Trace event count: `24`
- Product trace label: `V1.0.0`
- Installed current block marker: `W342 runner naming verification active`
- Runner naming marker: `W341 prospect-specific proof naming active`
- Proof noun: `Breaker`
- Resolved operating mode: `distribution_replenishment`
- Adapter readiness: `records_imported`
- W208 status: `records_ready`
- Integrated build result status: `completed_result_imported`
- Result capture status: `completed_result_capture_ready`
- W151 guard accepted completed result: `true`
- Import ready: `true`
- Final naming status: `dcc_final_names_imported`
- Import timestamp: `2026-05-29T22:39:53.523Z`

Returned proof records:

- Customer: `Parkway Contractor Supply Customer Account` (`customer`, id `3122`)
- Sales Order: `SO2699` (`salesorder`, id `83529`)
- Product SKU: `Parkway Breaker Availability SKU - ALDISTRI-RHZSSP-NXY` (`inventoryitem`, id `5045`)
- Branch Availability / Replenishment Flow: `Parkway Branch Availability / Replenishment Flow - ALDISTRI-RHZSSP-NXY` (`inventoryitem`, id `5046`)
- Supporting SKU: `Parkway Safe Substitute Fulfillment Support SKU - ALDISTRI-RHZSSP-NXY` (`inventoryitem`, id `5047`)

Every returned display-ready record has:

- `safeToOpen: true`
- `linkAuthorityStatus: verified_openable`
- `sourceConfidence: verified_open_link`
- a numeric NetSuite internal id
- a supported `td3021666.app.netsuite.com` URL

## Critical Findings

The build path is good enough to advance. The weak points are now clarity and deployment discipline, not record creation or import.

1. Runtime label drift remains. The exported product label and drawer header still show `V1.0.0`, while Tampermonkey is installed at `1.0.3` and the active logic includes W344.
2. Plan state still says website/category confirmation is needed even after records are imported. That is honest about website evidence, but it should be visually separated from build/import confidence.
3. Consultant text still leaks internal note labels such as `Business Pain / Request Notes`.
4. ROI and run copy should say `website confidence: low` separately from `build/import confidence: verified`.
5. `runnerLaneVocabularyPolicy.source` is `runner_fallback` even though the run carried a confirmed build request. This is not blocking, but W346/W347 should make the source wording less misleading.

## Pass / Fail Gates For Future Parkway Smokes

Pass only if all are true:

- W342 current installed block marker is active.
- W341 runner marker is active and names the proof noun `Breaker`.
- Runner result status reaches `completed_result_imported`.
- Result capture status reaches `completed_result_capture_ready`.
- W151 accepts the completed result.
- Final naming status reaches `dcc_final_names_imported`.
- Returned records include customer, sales order, product SKU, availability/replenishment flow, and supporting SKU.
- Supporting SKU keeps the `supporting_sku` role and does not regress to generic `component_item`.
- All visible Open links are backed by verified numeric NetSuite ids and supported NetSuite URLs.
- Drawer does not create records, does not write transactions, and does not show fake links.

Fail if any are true:

- The drawer shows Open links before real ids and URLs are imported.
- Any distribution run without Manufacturing/WIP returns manufacturing-only labels such as `assembly`, `finished good`, `component`, `work order`, `routing`, or `WIP` as the proof vocabulary.
- W151 rejects the completed result.
- W214 semantic guard blocks import.
- W245 display-ready records are missing `safeToOpen: true`.
- The runner creates records but the drawer cannot import the final links.

## No-Regression Boundaries

- Preserve W151 completed-result import guard.
- Preserve W214 semantic operating-mode guard.
- Preserve W245 display-ready Open-link authority.
- Preserve W341 prospect-specific proof naming.
- Preserve W342 visible trace marker.
- Preserve W344 supporting SKU role/name fix.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.
- Runner remains the record creation authority.
- Adapter remains the only approved server-side invocation path.
- N/LLM remains advisory only.

## Recommendation

Move to W346 before broader smoke testing.

Reason: Parkway now proves the core runner/import path. The next highest-risk area is operator trust: version/status drift and mixed confidence language can make a successful run feel uncertain. Clean that UX before spending more live runs on a broader smoke matrix.

## Next Block

Move through W346: Consultant-facing post-import UX cleanup. Align visible version/status markers with the installed drawer runtime, separate website confidence from build/import confidence, remove internal note labels from live copy, clean ROI/run wording, and keep every W151/W214/W245/W341/W342/W344 guardrail intact. Do not add new write paths, do not change runner creation behavior unless evidence requires it, and do not weaken Open-link validation.
