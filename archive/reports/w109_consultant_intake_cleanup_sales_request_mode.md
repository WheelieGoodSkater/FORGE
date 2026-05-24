# W109 Consultant Intake Cleanup And Sales Request Mode

Decision: PASS / SALES REQUEST MODE READY / NO WRITE AUTHORITY

## What Changed
- Plan intake now leads with Prospect, Website, Business pain, Requested proof, and Decision criteria.
- Timeline / urgency, Competitor / incumbent, and optional website/category evidence are captured as supporting context.
- Prepare Brief remains required before IDB treats recommendations or DCC handoff as ready.
- Website is positioned as identity/naming support; notes and request context drive value story, ROI, competitive framing, objections, and run guidance.

## Validator Gates
| Status | Gate | Detail |
| --- | --- | --- |
| PASS | w109_runtime_sales_request_model_present | consultantSalesRequestModeV1 exposed |
| PASS | w109_plan_intake_is_sales_request_facing |  <div class="idb-cockpit-section"> <div class="idb-card idb-accent idb-w56-plan-summary"> <div class="idb-section-title">30-second plan</div> <div class="idb-status-key">Prospect</div> <div class="idb-strong">Ariat International</div> <div  |
| PASS | w109_internal_audit_labels_removed_from_default_intake |  <div class="idb-cockpit-section"> <div class="idb-card idb-accent idb-w56-plan-summary"> <div class="idb-section-title">30-second plan</div> <div class="idb-status-key">Prospect</div> <div class="idb-strong">Ariat International</div> <div  |
| PASS | w109_prepare_brief_required_before_recommendation_ready | {"empty":{"schema":"idb.w109-consultant-sales-request-mode.v1","status":"sales_request_incomplete","prepareBriefRequired":true,"canPrepareBrief":false,"fields":[{"id":"customer","label":"Prospect","role":"identity","required":true,"captured |
| PASS | w109_website_supports_identity_notes_drive_value | {"websiteRole":"Website supports identity, category, naming, product family, and demo path.","notesRole":"Business pain, requested proof, decision criteria, timeline, and competitor context drive ROI, competitive framing, objections, and ru |
| PASS | w109_prepared_summary_is_compact_and_consultant_facing |  <div class="idb-cockpit-section"> <div class="idb-card idb-accent idb-w56-plan-summary"> <div class="idb-section-title">30-second plan</div> <div class="idb-status-key">Prospect</div> <div class="idb-strong">Ariat International</div> <div  |
| PASS | w109_trace_export_coverage_present | trace export and hooks include W109 model |
| PASS | w109_no_regression_preserved | {"w92StateAuthorityPreserved":true,"noIdbWrites":true,"noSuiteScriptInvocationFromIdb":true,"noTransactionWrites":true,"hostedResolverOptionalUntilRemoteSmokeExecuted":true,"consultantConfirmationRequired":true,"dccOwnsObjectGeneration":tru |

## Best Next Codex Prompt
Move through W110: DCC Handoff Packet Parity Lock. Build validator coverage proving every IDB dccRunnerHandoffPacketV1 field maps exactly to Demo Command Center Suitelet form params, DCC-owned config params, and scheduled runner preview params across apparel, CPG, distributor/dealer, manufacturing-heavy, and ambiguous cases. Block export when confirmed lane, selected pack, exported lane, scenario, family key, manufacturing/WIP flags, location/planning intent, or review-only mode disagree. Do not rewrite DCC runner mechanics and do not invoke SuiteScript. Preserve no IDB writes, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, W92 state authority, W105-W107 preview-only approval behavior, and DCC ownership of object generation. Output parity matrix, blocked/confirmed samples, validator gates, W110 report, and best next Codex prompt.
