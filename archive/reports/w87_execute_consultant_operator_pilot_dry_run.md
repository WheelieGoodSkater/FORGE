# W87 Execute Consultant-To-Operator Pilot Dry Run

Generated: 2026-05-17T21:41:04.653Z

Decision: PASS / DRY_RUN_PASS_READY_FOR_REAL_USER_TEST / NO IDB SUITESCRIPT INVOCATION

## Dry-Run Result

- Prospect: Summit Trail Supply
- Website: https://www.rei.com/
- Average score: 4
- Pass: true
- Reason: Dry-run package is coherent and no-submit boundaries are intact; real human screenshot/export evidence is still required next.

## Scores

- Consultant intake clarity: 4/5 - Test data is complete enough for a consultant run.
- Scenario/lane confirmation clarity: 3/5 - Needs real drawer screenshot to prove the confirmation language is obvious.
- DCC handoff export discoverability: 4/5 - Review export card and W83 button are present.
- Suitelet form parameter parity: 4/5 - W85 script maps form params explicitly.
- DCC-owned config ownership clarity: 4/5 - Config ownership is explicit but should be checked by operator in sandbox.
- Runner preview clarity: 4/5 - Runner preview params are explicit in the handoff packet.
- No-submit/no-write safety clarity: 5/5 - No IDB submit path and no SuiteScript invocation are preserved.
- DCC object-generation ownership clarity: 5/5 - DCC ownership is repeated in W81-W86 artifacts.
- Operator confidence to proceed later under governed conditions: 4/5 - Operator script is ready; real sandbox field comparison is still needed.
- Evidence completeness: 3/5 - Template is complete, but real screenshots/exports are not captured yet.

## Remediation Before Real User Test

- Real screenshots are not captured yet. Run the W86 test manually in the drawer and capture Plan, Review, DCC handoff card, exported handoff JSON, and trace JSON. Owner: Consultant tester.
- Scenario confirmation clarity is not proven by a human yet. During the real test, note whether the consultant can confidently confirm or block within 30 seconds. Owner: Consultant UX reviewer.
- Operator field mapping has not been compared against a live DCC sandbox screen. Operator should follow W85 and mark each Suitelet/runner param as match, missing, or unclear. Owner: DCC operator.
- DCC config readiness still depends on sandbox deployment setup. Operator should record config presence only, with secrets and internal sensitive values redacted. Owner: DCC operator.

## Validator Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w87_inherits_w86_pilot_script | {"schema":"idb.w86-consultant-operator-pilot-handoff-test-script.v1","status":"consultant_operator_pilot_test_ready_no_submit"} |
| PASS | w87_simulated_intake_complete | {"schema":"idb.w87-simulated-consultant-intake.v1","source":"W86 pilot test script","prospect":"Summit Trail Supply","website":"https://www.rei.com/","salesNotesEntered":true,"scObjectiveEntered":true,"competitorEntered":true,"decisionCriteriaEntered":true,"expectedFlow":["Consultant enters sales request in IDB.","Consultant reviews Plan and Review.","Consultant confirms scenario or blocks if evidence is weak.","Consultant exports DCC handoff JSON and trace JSON.","Operator reviews exported handoff against W85 sandbox manual smoke script."]} |
| PASS | w87_handoff_exports_without_submit | {"schema":"idb.w87-simulated-dcc-handoff-export.v1","status":"simulated_export_ready_no_submit","dccHandoffJsonExported":true,"traceJsonExported":true,"suiteScriptInvokedFromIdb":false,"transactionWritesFromIdb":false,"dccRunnerMechanicsRewritten":false,"hostedResolverRequired":false,"consultantConfirmation":"required_before_real_export","expectedOperatorDecision":"manual_review_ready_if_consultant_confirms"} |
| PASS | w87_evidence_placeholders_cover_required_template | {"schema":"idb.w87-evidence-placeholders.v1","placeholders":[{"evidence":"Screenshot: IDB Plan tab after intake.","simulatedStatus":"capture_required_in_real_test","owner":"consultant"},{"evidence":"Screenshot: IDB Review tab showing DCC handoff export card.","simulatedStatus":"placeholder_generated_by_dry_run","owner":"consultant"},{"evidence":"Export: dccRunnerHandoffPacketV1 JSON.","simulatedStatus":"placeholder_generated_by_dry_run","owner":"consultant"},{"evidence":"Export: IDB trace JSON.","simulatedStatus":"placeholder_generated_by_dry_run","owner":"consultant"},{"evidence":"Screenshot/notes: DCC Suitelet sandbox field parity review.","simulatedStatus":"capture_required_in_real_test","owner":"consultant"},{"evidence":"Screenshot/notes: DCC-owned deployment config readiness, with secrets redacted.","simulatedStatus":"capture_required_in_real_test","owner":"consultant"},{"evidence":"Screenshot/notes: scheduled runner preview comparison.","simulatedStatus":"capture_required_in_real_test","owner":"consultant"},{"evidence":"Completed operator scoring rubric.","simulatedStatus":"capture_required_in_real_test","owner":"operator"},{"evidence":"Consultant notes: what felt unclear, slow, wrong, or useful.","simulatedStatus":"capture_required_in_real_test","owner":"consultant"},{"evidence":"Operator notes: what could block a governed DCC handoff.","simulatedStatus":"placeholder_generated_by_dry_run","owner":"consultant"}],"screenshotsCapturedInThisDryRun":false,"reason":"W87 is a structured dry run; real screenshots are expected in the next user/operator test."} |
| PASS | w87_scoring_passes_threshold_with_known_gaps | {"schema":"idb.w87-consultant-operator-scoring-results.v1","scale":"1-5","categories":[{"category":"Consultant intake clarity","score":4,"note":"Test data is complete enough for a consultant run."},{"category":"Scenario/lane confirmation clarity","score":3,"note":"Needs real drawer screenshot to prove the confirmation language is obvious."},{"category":"DCC handoff export discoverability","score":4,"note":"Review export card and W83 button are present."},{"category":"Suitelet form parameter parity","score":4,"note":"W85 script maps form params explicitly."},{"category":"DCC-owned config ownership clarity","score":4,"note":"Config ownership is explicit but should be checked by operator in sandbox."},{"category":"Runner preview clarity","score":4,"note":"Runner preview params are explicit in the handoff packet."},{"category":"No-submit/no-write safety clarity","score":5,"note":"No IDB submit path and no SuiteScript invocation are preserved."},{"category":"DCC object-generation ownership clarity","score":5,"note":"DCC ownership is repeated in W81-W86 artifacts."},{"category":"Operator confidence to proceed later under governed conditions","score":4,"note":"Operator script is ready; real sandbox field comparison is still needed."},{"category":"Evidence completeness","score":3,"note":"Template is complete, but real screenshots/exports are not captured yet."}],"average":4,"pass":true} |
| PASS | w87_remediation_before_real_test_present | {"schema":"idb.w87-remediation-before-real-user-test.v1","priority":[{"issue":"Real screenshots are not captured yet.","remediation":"Run the W86 test manually in the drawer and capture Plan, Review, DCC handoff card, exported handoff JSON, and trace JSON.","owner":"Consultant tester"},{"issue":"Scenario confirmation clarity is not proven by a human yet.","remediation":"During the real test, note whether the consultant can confidently confirm or block within 30 seconds.","owner":"Consultant UX reviewer"},{"issue":"Operator field mapping has not been compared against a live DCC sandbox screen.","remediation":"Operator should follow W85 and mark each Suitelet/runner param as match, missing, or unclear.","owner":"DCC operator"},{"issue":"DCC config readiness still depends on sandbox deployment setup.","remediation":"Operator should record config presence only, with secrets and internal sensitive values redacted.","owner":"DCC operator"}],"mustFixBeforeRealConsultantPilot":["Any visible IDB submit/queue action for DCC.","Any IDB SuiteScript invocation.","Any IDB transaction write path.","Any inability to export DCC handoff JSON or trace JSON."]} |
| PASS | w87_runtime_still_no_submit_path | IDB handoff remains export-only |
| PASS | w87_no_regression_boundaries_hold | {"simulated":{"schema":"idb.w87-simulated-dcc-handoff-export.v1","status":"simulated_export_ready_no_submit","dccHandoffJsonExported":true,"traceJsonExported":true,"suiteScriptInvokedFromIdb":false,"transactionWritesFromIdb":false,"dccRunnerMechanicsRewritten":false,"hostedResolverRequired":false,"consultantConfirmation":"required_before_real_export","expectedOperatorDecision":"manual_review_ready_if_consultant_confirms"},"noRegression":{"noSuiteScriptInvocationFromIdb":true,"noDccRunnerMechanicsRewrite":true,"noIdbTransactionWrites":true,"hostedResolverOptionalUntilRemoteSmokeExecuted":true,"consultantConfirmationRequired":true,"dccOwnsObjectGeneration":true}} |

## Best Next Codex Prompt

Move through W88: Real User Test Packet And Exact Test Instructions. Convert the W87 dry-run results into the exact hands-on test packet for the user: provide the specific file/version to load, the exact sales request fields to enter, the tabs/screenshots to capture, the DCC handoff JSON and trace JSON exports to attach, the operator comparison steps, scoring rubric, and stop/go decision. Preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output the real user test packet, exact test instructions, evidence intake checklist, W88 report, validator gates, and best next Codex prompt.
