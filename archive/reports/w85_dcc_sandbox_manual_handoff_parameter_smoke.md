# W85 DCC Sandbox Manual Handoff Parameter Smoke

Generated: 2026-05-17T21:41:04.455Z

Decision: PASS / SANDBOX MANUAL PARAMETER SMOKE READY / NO IDB SUITESCRIPT INVOCATION

## Manual Sandbox Smoke Script

1. Open the Demo Command Center Suitelet in sandbox.
   - Expected: Operator is in sandbox DCC surface, not an IDB-triggered SuiteScript flow.
   - Evidence: Screenshot of Suitelet URL/header with sandbox context.
2. Compare Suitelet form fields to handoff suiteletEntryPayload.
   - Expected: Prospect, website, notes, create-new-hero, manufacturing, WIP, eval mode, and action mode match the packet.
   - Evidence: Screenshot or notes showing field-by-field parity.
3. Verify DCC-owned deployment config readiness.
   - Expected: Subsidiary, location, runner script/deploy IDs, CSV mapping/folder, SO saved search, and WO saved search remain DCC deployment/config values.
   - Evidence: Operator checklist marking DCC config present; no IDB-provided account config IDs.
4. Compare runner preview params.
   - Expected: Runner preview maps prospect, website, notes, generated agenda/extid placeholders, mapping/folder/subsidiary placeholders, location, WIP/MFG flags, hero mode, hero item placeholder, and WC search.
   - Evidence: Screenshot or copied preview showing scheduled runner params.
5. Verify review-only/no-submit behavior.
   - Expected: This smoke stops before DCC submit/queue. No IDB code calls SuiteScript and no runner task is created by IDB.
   - Evidence: No task ID, no submit click, no newly created transaction from this smoke.
6. Verify DCC object-generation ownership.
   - Expected: DCC remains responsible for item names, assemblies, BOMs, locations, planning controls, routing/WIP, and CSV/Sales Order mechanics.
   - Evidence: Operator notes confirming DCC mechanics are unchanged and not duplicated inside IDB.
7. Record sandbox smoke decision.
   - Expected: Operator marks go only if params are clear, config readiness is understood, and the process remains manual/review-only.
   - Evidence: Completed go/no-go checklist and any screenshots.

## Expected Evidence Captures

- Confirmed dccRunnerHandoffPacketV1 JSON export.
- DCC Suitelet sandbox page screenshot before submit.
- Suitelet form field parity notes or screenshot.
- DCC-owned deployment config readiness checklist.
- Scheduled runner preview params screenshot or copied preview.
- Operator note confirming no IDB SuiteScript invocation.
- Operator note confirming no transaction writes.
- Operator note confirming DCC owns item, assembly, BOM, location, planning, routing/WIP, and CSV/Sales Order mechanics.

## Go / No-Go

Current decision: `ready_for_manual_sandbox_parameter_smoke_no_submit`

Go if:
- Confirmed handoff packet maps cleanly to DCC Suitelet form fields.
- DCC-owned config params are understood and present or clearly marked as required.
- Runner preview params are clear and remain DCC-owned.
- No IDB SuiteScript invocation occurs.
- No IDB transaction write path occurs.
- Operator can explain what DCC will build in under 60 seconds.

No-go if:
- Operator cannot tell which fields to enter/check in DCC.
- Any IDB path submits SuiteScript or creates/queues records.
- DCC-owned config ownership is ambiguous.
- Runner preview implies IDB owns queue mechanics.
- DCC object-generation mechanics appear rewritten or bypassed.

## Artifacts

- Smoke script: `trace_samples/w85_sandbox_manual_handoff_smoke_script.json`
- Evidence checklist: `trace_samples/w85_expected_evidence_captures.json`
- Go/no-go: `trace_samples/w85_sandbox_manual_handoff_go_no_go.json`

## Validator Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w85_inherits_w84_confirmed_packet | {"w84":"idb.w84-dcc-operator-dry-run-handoff-smoke.v1","decision":"eligible_for_manual_dcc_suitelet_review_only"} |
| PASS | w85_source_packet_confirmed_review_only | {"status":"ready_for_dcc_suitelet_submission_review","mode":"review_only_no_submit"} |
| PASS | w85_suitelet_form_parity_complete | [{"packetParam":"custpage_prospect","packetValue":"Ariat International","operatorCheck":"Compare DCC Suitelet field for custpage_prospect"},{"packetParam":"custpage_website","packetValue":"https://www.ariat.com/","operatorCheck":"Compare DCC Suitelet field for custpage_website"},{"packetParam":"custpage_notes","packetValue":"Buyer needs style, size, and channel availability readiness before a seasonal launch.","operatorCheck":"Compare DCC Suitelet field for custpage_notes"},{"packetParam":"custpage_newhero","packetValue":"T","operatorCheck":"Compare DCC Suitelet field for custpage_newhero"},{"packetParam":"custpage_enablemfg","packetValue":"F","operatorCheck":"Compare DCC Suitelet field for custpage_enablemfg"},{"packetParam":"custpage_enablewip","packetValue":"F","operatorCheck":"Compare DCC Suitelet field for custpage_enablewip"},{"packetParam":"custpage_evalmode","packetValue":"review_only","operatorCheck":"Compare DCC Suitelet field for custpage_evalmode"},{"packetParam":"custpage_actionmode","packetValue":"","operatorCheck":"Compare DCC Suitelet field for custpage_actionmode"}] |
| PASS | w85_runner_preview_parity_complete | [{"packetParam":"custscript_v3_runner_prospect","packetValue":"Ariat International","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_prospect"},{"packetParam":"custscript_v3_runner_website","packetValue":"https://www.ariat.com/","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_website"},{"packetParam":"custscript_v3_runner_notes","packetValue":"style size channel availability seasonal launch","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_notes"},{"packetParam":"custscript_v3_runner_agenda","packetValue":"generated_by_dcc_suitelet","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_agenda"},{"packetParam":"custscript_v3_runner_extid","packetValue":"generated_by_dcc_suitelet","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_extid"},{"packetParam":"custscript_v3_runner_mapping","packetValue":"dcc_config_required","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_mapping"},{"packetParam":"custscript_v3_runner_folder","packetValue":"dcc_config_required","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_folder"},{"packetParam":"custscript_v3_runner_subsidiary","packetValue":"dcc_config_required","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_subsidiary"},{"packetParam":"custscript_v3_runner_location","packetValue":"dcc_config_optional","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_location"},{"packetParam":"custscript_v3_runner_enable_wip","packetValue":"F","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_enable_wip"},{"packetParam":"custscript_v3_runner_enable_mfg","packetValue":"F","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_enable_mfg"},{"packetParam":"custscript_v3_runner_create_new_hero","packetValue":"T","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_create_new_hero"},{"packetParam":"custscript_v3_runner_hero_item","packetValue":"generated_by_dcc_suitelet_fresh_hero","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_hero_item"},{"packetParam":"custscript_v3_runner_wc_search","packetValue":"dcc_config_optional","operatorCheck":"Compare scheduled runner preview for custscript_v3_runner_wc_search"}] |
| PASS | w85_dcc_owned_config_readiness_present | [{"configParam":"custscriptv3_reset_subsidiary","owner":"Demo Command Center deployment/config","operatorCheck":"Confirm present in DCC setup; IDB must not provide or overwrite."},{"configParam":"custscript_v3_reset_location","owner":"Demo Command Center deployment/config","operatorCheck":"Confirm present in DCC setup; IDB must not provide or overwrite."},{"configParam":"custscript_v3_runner_script_id","owner":"Demo Command Center deployment/config","operatorCheck":"Confirm present in DCC setup; IDB must not provide or overwrite."},{"configParam":"custscript_v3_runner_deploy_id","owner":"Demo Command Center deployment/config","operatorCheck":"Confirm present in DCC setup; IDB must not provide or overwrite."},{"configParam":"custscript_csv_mapping_id","owner":"Demo Command Center deployment/config","operatorCheck":"Confirm present in DCC setup; IDB must not provide or overwrite."},{"configParam":"custscript_csv_folder_id","owner":"Demo Command Center deployment/config","operatorCheck":"Confirm present in DCC setup; IDB must not provide or overwrite."},{"configParam":"custscript_so_savedsearch_id","owner":"Demo Command Center deployment/config","operatorCheck":"Confirm present in DCC setup; IDB must not provide or overwrite."},{"configParam":"custscript_wo_savedsearch_id","owner":"Demo Command Center deployment/config","operatorCheck":"Confirm present in DCC setup; IDB must not provide or overwrite."}] |
| PASS | w85_expected_evidence_captures_complete | {"schema":"idb.w85-expected-evidence-captures.v1","requiredCaptures":["Confirmed dccRunnerHandoffPacketV1 JSON export.","DCC Suitelet sandbox page screenshot before submit.","Suitelet form field parity notes or screenshot.","DCC-owned deployment config readiness checklist.","Scheduled runner preview params screenshot or copied preview.","Operator note confirming no IDB SuiteScript invocation.","Operator note confirming no transaction writes.","Operator note confirming DCC owns item, assembly, BOM, location, planning, routing/WIP, and CSV/Sales Order mechanics."],"optionalCaptures":["Screenshot of blocked/no-submit state.","Screenshot of DCC config page with sensitive values redacted.","Operator notes on confusing field names or missing labels."],"noSecretRules":["Do not paste tokens, script deployment secrets, or account credentials into traces or reports.","Redact internal IDs if the screenshot will leave the sandbox team.","Record presence/absence of config, not secret values."]} |
| PASS | w85_go_no_go_preserves_no_submit | {"schema":"idb.w85-dcc-sandbox-manual-handoff-go-no-go.v1","goIf":["Confirmed handoff packet maps cleanly to DCC Suitelet form fields.","DCC-owned config params are understood and present or clearly marked as required.","Runner preview params are clear and remain DCC-owned.","No IDB SuiteScript invocation occurs.","No IDB transaction write path occurs.","Operator can explain what DCC will build in under 60 seconds."],"noGoIf":["Operator cannot tell which fields to enter/check in DCC.","Any IDB path submits SuiteScript or creates/queues records.","DCC-owned config ownership is ambiguous.","Runner preview implies IDB owns queue mechanics.","DCC object-generation mechanics appear rewritten or bypassed."],"currentDecision":"ready_for_manual_sandbox_parameter_smoke_no_submit"} |
| PASS | w85_runtime_still_no_submit_path | IDB handoff remains export-only |
| PASS | w85_dcc_object_generation_ownership_explicit | [{"step":"Open the Demo Command Center Suitelet in sandbox.","expected":"Operator is in sandbox DCC surface, not an IDB-triggered SuiteScript flow.","evidence":"Screenshot of Suitelet URL/header with sandbox context."},{"step":"Compare Suitelet form fields to handoff suiteletEntryPayload.","expected":"Prospect, website, notes, create-new-hero, manufacturing, WIP, eval mode, and action mode match the packet.","evidence":"Screenshot or notes showing field-by-field parity."},{"step":"Verify DCC-owned deployment config readiness.","expected":"Subsidiary, location, runner script/deploy IDs, CSV mapping/folder, SO saved search, and WO saved search remain DCC deployment/config values.","evidence":"Operator checklist marking DCC config present; no IDB-provided account config IDs."},{"step":"Compare runner preview params.","expected":"Runner preview maps prospect, website, notes, generated agenda/extid placeholders, mapping/folder/subsidiary placeholders, location, WIP/MFG flags, hero mode, hero item placeholder, and WC search.","evidence":"Screenshot or copied preview showing scheduled runner params."},{"step":"Verify review-only/no-submit behavior.","expected":"This smoke stops before DCC submit/queue. No IDB code calls SuiteScript and no runner task is created by IDB.","evidence":"No task ID, no submit click, no newly created transaction from this smoke."},{"step":"Verify DCC object-generation ownership.","expected":"DCC remains responsible for item names, assemblies, BOMs, locations, planning controls, routing/WIP, and CSV/Sales Order mechanics.","evidence":"Operator notes confirming DCC mechanics are unchanged and not duplicated inside IDB."},{"step":"Record sandbox smoke decision.","expected":"Operator marks go only if params are clear, config readiness is understood, and the process remains manual/review-only.","evidence":"Completed go/no-go checklist and any screenshots."}] |

## Best Next Codex Prompt

Move through W86: Consultant-To-Operator Pilot Handoff Test Script. Package the IDB-to-DCC flow into a real consultant test: consultant enters a realistic sales request in IDB, confirms the scenario, exports the DCC handoff packet, and an operator uses the W85 sandbox manual smoke script to compare fields without IDB invoking SuiteScript. Include test data, consultant instructions, operator instructions, screenshot/evidence checklist, scoring rubric, stop/go criteria, and no-regression gates. Preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of item names, assemblies, BOMs, locations, planning, routing/WIP, and CSV/Sales Order mechanics. Output pilot test script, evidence packet template, W86 report, validator gates, and best next Codex prompt.
