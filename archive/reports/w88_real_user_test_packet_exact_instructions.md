# W88 Real User Test Packet And Exact Test Instructions

Generated: 2026-05-17T21:41:04.753Z

Decision: PASS / REAL USER TEST PACKET READY / NO IDB SUITESCRIPT INVOCATION

## File To Load

- File: /path/to/workspace/intelligent demo builder drawer/idb-drawer.user.js
- SHA-256: 30f73ccc903fffc59a6210f064153b7382c6a77b517332f64212a2ff13d3f2ec
- Modified: 2026-05-17T17:48:39.947Z

## Exact Sales Request Fields

- Customer: Summit Trail Supply
- Website: https://www.rei.com/
- Conversation notes: Outdoor gear retailer expanding seasonal private-label assortment. Buyer needs confidence in style/color availability, replenishment timing, store/channel allocation, and customer promise before summer launch. Current spreadsheet process is slow and inventory availability differs by channel. Decision team wants a concise proof path, not a broad manufacturing demo.
- SC objective: Prepare a concise proof story showing how NetSuite can support seasonal assortment readiness, inventory availability, replenishment, allocation, and channel promise without forcing the prospect into manufacturing language.
- Known competitor: Current spreadsheets and disconnected inventory tools
- Decision criteria: Clear path from customer/prospect context to item assortment readiness, allocation/replenishment, and Sales Order/customer promise impact.

## Screenshots To Capture

- Plan tab after intake.
- Review tab top summary.
- Review DCC build packet bridge.
- Review DCC handoff export card with form/config/runner sections.
- Trace tab before export.
- DCC Suitelet sandbox comparison screen, if operator opens it for manual review.

## Exports To Attach

- idb-dcc-runner-handoff-packet-*.json
- intelligent-demo-builder-trace-*.json

## Operator Comparison Steps

- Open the exported DCC handoff JSON.
- Compare suiteletEntryPayload to DCC Suitelet form fields.
- Confirm DCC-owned config params are present/understood, without recording secrets.
- Compare scheduledRunnerPreview to DCC runner preview expectations.
- Confirm no IDB SuiteScript invocation and no IDB transaction writes.
- Confirm DCC owns item names, assemblies, BOMs, locations, planning, routing/WIP, CSV/Sales Order mechanics, and runner queue behavior.

## Stop / Go

- Run now decision: go_for_user_hands_on_test_no_submit
- After-test rule: Proceed to W89 only if evidence exports are attached, no submit/write path appears, average score is at least 4.0, and no category is below 3.

## Validator Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w88_inherits_w87_ready_for_real_test | {"schema":"idb.w87-execute-consultant-operator-pilot-dry-run.v1","status":"dry_run_pass_ready_for_real_user_test"} |
| PASS | w88_file_to_load_exists_and_hash_present | {"label":"Tampermonkey userscript","absolutePath":"/path/to/workspace/intelligent demo builder drawer/idb-drawer.user.js","sha256":"30f73ccc903fffc59a6210f064153b7382c6a77b517332f64212a2ff13d3f2ec","modifiedAt":"2026-05-17T17:48:39.947Z","loadInstruction":"Open Tampermonkey, replace the current Intelligent Demo Builder userscript with this file contents, then save and refresh NetSuite sandbox."} |
| PASS | w88_exact_sales_request_fields_complete | {"customer":"Summit Trail Supply","website":"https://www.rei.com/","conversationNotes":"Outdoor gear retailer expanding seasonal private-label assortment. Buyer needs confidence in style/color availability, replenishment timing, store/channel allocation, and customer promise before summer launch. Current spreadsheet process is slow and inventory availability differs by channel. Decision team wants a concise proof path, not a broad manufacturing demo.","scObjective":"Prepare a concise proof story showing how NetSuite can support seasonal assortment readiness, inventory availability, replenishment, allocation, and channel promise without forcing the prospect into manufacturing language.","knownCompetitor":"Current spreadsheets and disconnected inventory tools","decisionCriteria":"Clear path from customer/prospect context to item assortment readiness, allocation/replenishment, and Sales Order/customer promise impact.","bantMeddicc":{"budget":"Budget not confirmed; discovery should quantify manual planning and inventory availability pain.","authority":"VP Operations plus merchandising lead likely influence decision.","need":"Need is seasonal assortment readiness and channel inventory promise.","timeline":"Wants directional fit within 30 days before deeper process demo.","metrics":"Reduce assortment planning effort and avoid missed customer promise during seasonal launch.","economicBuyer":"VP Operations / CFO not yet confirmed.","decisionProcess":"Initial SC proof, then stakeholder review.","decisionCriteria":"Fast evidence that NetSuite can connect item/variant readiness, replenishment, and customer promise.","paperProcess":"Unknown.","identifyPain":"Spreadsheet-driven inventory and channel promise disconnects.","champion":"Operations manager requested the proof."}} |
| PASS | w88_screenshots_and_exports_specified | {"screenshots":["Plan tab after intake.","Review tab top summary.","Review DCC build packet bridge.","Review DCC handoff export card with form/config/runner sections.","Trace tab before export.","DCC Suitelet sandbox comparison screen, if operator opens it for manual review."],"exports":["idb-dcc-runner-handoff-packet-*.json","intelligent-demo-builder-trace-*.json"]} |
| PASS | w88_operator_steps_and_rubric_present | {"operator":["Open the exported DCC handoff JSON.","Compare suiteletEntryPayload to DCC Suitelet form fields.","Confirm DCC-owned config params are present/understood, without recording secrets.","Compare scheduledRunnerPreview to DCC runner preview expectations.","Confirm no IDB SuiteScript invocation and no IDB transaction writes.","Confirm DCC owns item names, assemblies, BOMs, locations, planning, routing/WIP, CSV/Sales Order mechanics, and runner queue behavior."],"rubric":["Consultant intake clarity","Scenario/lane confirmation clarity","DCC handoff export discoverability","Suitelet form parameter parity","DCC-owned config ownership clarity","Runner preview clarity","No-submit/no-write safety clarity","DCC object-generation ownership clarity","Operator confidence to proceed later under governed conditions","Evidence completeness"]} |
| PASS | w88_stop_go_preserves_boundaries | {"schema":"idb.w88-real-user-test-stop-go.v1","scoreBeforeRealRun":4,"runNowDecision":"go_for_user_hands_on_test_no_submit","goIf":["Average score is at least 4.0.","No category scores below 3.","No IDB SuiteScript invocation or transaction write occurs.","Operator can map handoff to DCC Suitelet in under 5 minutes.","DCC object-generation ownership remains clear."],"noGoIf":["Any IDB path submits SuiteScript or creates/queues records.","Consultant cannot confirm scenario confidently.","Operator cannot map required params to DCC fields.","DCC-owned config ownership is unclear.","Evidence packet is missing handoff JSON or trace JSON.","Any visible IDB submit/queue action for DCC.","Any IDB SuiteScript invocation.","Any IDB transaction write path.","Any inability to export DCC handoff JSON or trace JSON."],"afterUserTestDecisionRule":"Proceed to W89 only if evidence exports are attached, no submit/write path appears, average score is at least 4.0, and no category is below 3."} |
| PASS | w88_runtime_still_no_submit_path | IDB handoff remains export-only |
| PASS | w88_no_regression_boundaries_hold | {"noSuiteScriptInvocationFromIdb":true,"noDccRunnerMechanicsRewrite":true,"noIdbTransactionWrites":true,"hostedResolverOptionalUntilRemoteSmokeExecuted":true,"consultantConfirmationRequired":true,"dccOwnsObjectGeneration":true} |

## Best Next Codex Prompt

Move through W89: Review Real User Test Evidence And Decide Pilot Readiness. Use the user-provided W88 screenshots, DCC handoff JSON, trace JSON, consultant notes, operator comparison notes, and scoring rubric to grade the real hands-on test. Identify UX gaps, field-mapping gaps, website/intake gaps, DCC handoff risks, and exact remediation. Decide go/no-go for a broader consultant pilot. Preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output graded results, remediation plan, pilot readiness decision, W89 report, validator gates, and best next Codex prompt.
