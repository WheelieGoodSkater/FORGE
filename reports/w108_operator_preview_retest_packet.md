# W108 Operator Preview Retest Packet And Go/No-Go

Decision: PASS / ONE REAL OPERATOR PREVIEW RETEST READY / USER AND OPERATOR FEEDBACK REQUIRED

## File To Upload
- /path/to/workspace/intelligent demo builder drawer/idb-drawer.user.js
- SHA-256: 30f73ccc903fffc59a6210f064153b7382c6a77b517332f64212a2ff13d3f2ec
- Modified: 2026-05-17T17:48:39.947Z

## Sales Request Fields
- Prospect: Ariat International
- Website: https://www.ariat.com/
- Conversation notes: Buyer says seasonal boot and apparel launches are hard to coordinate because style, size, color, replenishment timing, and channel availability live in separate spreadsheets and order views. They need a concise proof path that shows customer promise confidence before demand shifts close to launch.
- SC objective: Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise for a seasonal boot and apparel launch.
- Competitor/incumbent: Spreadsheets, disconnected inventory reports, and existing order tools. They are also comparing broader ERP options.
- Decision criteria: Must show a clear path from customer record to order/proof context; must connect style/SKU matrix, size/color availability, channel availability, replenishment timing, and customer promise.
- Timeline/urgency: Internal proof review needed within 2-4 weeks.

## Required Screenshots
- Plan first viewport
- Review first viewport
- ROI / Competitive first viewport
- Run first viewport after trying selector chips
- Trace first viewport

## Required Exports
- idb-dcc-runner-handoff-packet-*.json
- intelligent-demo-builder-trace-*.json after consultant flow
- intelligent-demo-builder-trace-*.json after operator evidence intake

## Operator Preview Steps
1. In IDB Review, export idb-dcc-runner-handoff-packet-*.json.
2. In IDB Trace, export intelligent-demo-builder-trace-*.json.
3. Open the Demo Command Center Suitelet manually in the sandbox. Do not open it from IDB.
4. Compare the DCC handoff suiteletEntryPayload to the Suitelet form params.
5. Compare the DCC-owned config param list to the DCC deployment/config surface. Record only match/missing/unclear, not secret values.
6. Compare scheduledRunnerPreview params to the DCC runner preview. Do not click submit, queue, or write.
7. Return to IDB Review and paste operator evidence into the Operator evidence intake.
8. Mark preview approved only when Suitelet params, DCC config, runner preview, handoff filename, trace filename, and notes are captured.
9. If anything is missing or unclear, reject preview and capture the exact remediation note.

## Operator Evidence To Paste Back Into IDB
- operatorName: Operator reviewer name.
- suiteletParamReview: Suitelet form params comparison result.
- dccOwnedConfigReview: DCC-owned config comparison result. Do not paste secrets.
- runnerPreviewReview: Scheduled runner preview comparison result.
- handoffPacketFilename: idb-dcc-runner-handoff-packet-*.json.
- traceFilename: intelligent-demo-builder-trace-*.json.
- notes: What matched, what was missing, and what is unclear.
- approvalStatus: Mark preview approved or reject preview in IDB.

## Stop / Go
- Go to W109 only after screenshots, DCC handoff JSON, trace JSON, and operator evidence are captured.
- No-go if there is a lane/pack mismatch, missing export, missing operator evidence, duplicate drawer, or any apparent submit/write path.

## Validator Gates
| Status | Gate | Detail |
| --- | --- | --- |
| PASS | w108_inherits_w104_w107_preview_only_chain | {"w104InvocationReadiness":"dcc_invocation_readiness_defined_review_only","w105OperatorApprovalModel":"operator_approval_model_ready_preview_only","w106SandboxPreviewBridge":"sandbox_preview_bridge_ready_manual_no_submit","w107OperatorEvidenceIntake":"operator |
| PASS | w108_file_to_upload_hash_present | {"absolutePath":"/path/to/workspace/intelligent demo builder drawer/idb-drawer.user.js","sha256":"30f73ccc903fffc59a6210f064153b7382c6a77b517332f64212a2ff13d3f2ec","modifiedAt":"2026-05-17T17:48:39.947Z","tampermonkeyName":"Intelligent D |
| PASS | w108_sales_request_realistic_complete | {"prospect":"Ariat International","website":"https://www.ariat.com/","conversationNotes":"Buyer says seasonal boot and apparel launches are hard to coordinate because style, size, color, replenishment timing, and channel availability live in separate spreadshe |
| PASS | w108_screenshots_cover_all_tabs | ["plan","review","roiCompetitive","run","trace"] |
| PASS | w108_operator_manual_preview_steps_no_submit | In IDB Review, export idb-dcc-runner-handoff-packet-*.json. / In IDB Trace, export intelligent-demo-builder-trace-*.json. / Open the Demo Command Center Suitelet manually in the sandbox. Do not open it from IDB. / Compare the DCC handoff suiteletEntryPayload t |
| PASS | w108_operator_evidence_fields_match_w107 | ["operatorName","suiteletParamReview","dccOwnedConfigReview","runnerPreviewReview","handoffPacketFilename","traceFilename","notes","approvalStatus"] |
| PASS | w108_required_exports_and_final_trace_present | ["idb-dcc-runner-handoff-packet-*.json","intelligent-demo-builder-trace-*.json after consultant flow","intelligent-demo-builder-trace-*.json after operator evidence intake"] |
| PASS | w108_scoring_and_stop_go_ready | {"schema":"idb.w108-operator-preview-scoring-rubric.v1","scale":"1-5","passingAverage":4,"noCategoryBelow":3,"categories":["One active drawer / no duplicate button","Intake and Plan are understandable in under 30 seconds","Lane, confirmed lane, DCC pack, and e |
| PASS | w108_runtime_still_no_submit_path | export-only runtime with operator evidence intake |
| PASS | w108_no_regression_boundaries_preserved | {"noIdbWrites":true,"noSuiteScriptInvocationFromIdb":true,"noTransactionWrites":true,"hostedResolverOptionalUntilRemoteSmokeExecuted":true,"notesStoryOnly":true,"consultantConfirmationRequired":true,"w92StateAuthorityPreserved":true,"w105W106W107PreviewOnlyBeh |

## Best Next Codex Prompt
Move through W109: Consultant Intake Cleanup And Sales Request Mode. Redesign Plan intake so a consultant enters a sales request surgically: prospect, website, business pain, requested proof, decision criteria, timeline/urgency, competitor/incumbent, and optional website/category evidence. Replace internal pack IDs with consultant-facing labels, reduce chips and audit language, require a clear Prepare Brief action before recommendations are treated as ready, and make website evidence supportive for identity/naming while notes drive value story. Preserve W92 state authority, W96-W98 compression, DCC handoff boundaries, no IDB writes, no SuiteScript invocation, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output cleaned intake UI, trace coverage, validator gates, W109 report, and best next Codex prompt.
