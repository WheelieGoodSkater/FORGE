# W84 DCC Operator Dry-Run Handoff Smoke

Generated: 2026-05-17T21:41:04.355Z

Decision: PASS / OPERATOR DRY-RUN READY / REVIEW ONLY / NO IDB SUITESCRIPT INVOCATION

## Dry-Run Checklist

1. Verify exported packet schema and status.
   - Pass: Schema is idb.dcc-runner-handoff-packet.v1 and status is either blocked_until_confirmed_handoff or ready_for_dcc_suitelet_submission_review.
   - Stop if: Schema is missing, status is unknown, or executionMode is not review_only_no_submit.
2. Verify consultant confirmation gate.
   - Pass: Blocked packet keeps custpage_actionmode=previewbrief; confirmed packet clears custpage_actionmode but still remains review-only from IDB.
   - Stop if: Unconfirmed packet is marked ready, or confirmed packet implies IDB submitted SuiteScript.
3. Verify exact Suitelet form params.
   - Pass: custpage_prospect, custpage_website, custpage_notes, custpage_newhero, custpage_enablemfg, custpage_enablewip, custpage_evalmode, and custpage_actionmode are present.
   - Stop if: Any required form param is missing or has unsupported write intent.
4. Verify DCC-owned config params.
   - Pass: DCC deployment owns subsidiary, location, runner script/deploy IDs, CSV mapping/folder, and saved searches.
   - Stop if: IDB attempts to provide or overwrite account config IDs.
5. Verify scheduled runner preview params.
   - Pass: Runner preview shows prospect, website, notes, generated agenda/extid placeholders, DCC config placeholders, manufacturing/WIP flags, hero mode, and optional WC search.
   - Stop if: Preview implies IDB owns runner queue mechanics or generated object creation.
6. Verify DCC object generation ownership.
   - Pass: DCC remains owner of item names, assemblies, BOMs, locations, planning controls, routing/WIP, CSV/Sales Order mechanics, agenda, extid, notes file, and runner task.
   - Stop if: IDB rewrites DCC runner mechanics or creates transaction context.
7. Operator dry-run decision.
   - Pass: Blocked packet stops at preview/no-submit. Confirmed packet is eligible only for manual governed DCC Suitelet review by an operator.
   - Stop if: Any path tries to invoke SuiteScript from IDB or enable transaction writes.

## Samples

- Blocked packet sample: `trace_samples/w84_operator_dry_run_blocked_packet_sample.json`
- Confirmed packet sample: `trace_samples/w84_operator_dry_run_confirmed_packet_sample.json`
- Operator checklist JSON: `trace_samples/w84_operator_dry_run_checklist.json`

## No-Regression Boundaries

- IDB does not invoke SuiteScript.
- IDB does not rewrite DCC runner mechanics.
- IDB does not enable transaction writes.
- Hosted resolver remains optional until remoteSmokeExecuted=true.
- DCC owns item names, assemblies, BOMs, locations, planning, routing/WIP, CSV/Sales Order mechanics, and runner queue/task behavior.

## Validator Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w84_inherits_w83_export_contract | {"schema":"idb.w83-dcc-handoff-export-operator-review-ux.v1","status":"dcc_handoff_export_operator_review_ready"} |
| PASS | w84_blocked_sample_stops_before_submit | {"status":"blocked_until_confirmed_handoff","actionmode":"previewbrief"} |
| PASS | w84_confirmed_sample_review_only_not_submitted | {"status":"ready_for_dcc_suitelet_submission_review","invocation":false} |
| PASS | w84_required_suitelet_form_params_present | {"custpage_prospect":"Ariat International","custpage_website":"https://www.ariat.com/","custpage_notes":"Buyer needs style, size, and channel availability readiness before a seasonal launch.","custpage_newhero":"T","custpage_enablemfg":"F","custpage_enablewip":"F","custpage_evalmode":"review_only","custpage_actionmode":""} |
| PASS | w84_required_runner_preview_params_present | {"custscript_v3_runner_prospect":"Ariat International","custscript_v3_runner_website":"https://www.ariat.com/","custscript_v3_runner_notes":"style size channel availability seasonal launch","custscript_v3_runner_agenda":"generated_by_dcc_suitelet","custscript_v3_runner_extid":"generated_by_dcc_suitelet","custscript_v3_runner_mapping":"dcc_config_required","custscript_v3_runner_folder":"dcc_config_required","custscript_v3_runner_subsidiary":"dcc_config_required","custscript_v3_runner_location":"dcc_config_optional","custscript_v3_runner_enable_wip":"F","custscript_v3_runner_enable_mfg":"F","custscript_v3_runner_create_new_hero":"T","custscript_v3_runner_hero_item":"generated_by_dcc_suitelet_fresh_hero","custscript_v3_runner_wc_search":"dcc_config_optional"} |
| PASS | w84_dcc_config_params_owned_by_dcc | ["custscriptv3_reset_subsidiary","custscript_v3_reset_location","custscript_v3_runner_script_id","custscript_v3_runner_deploy_id","custscript_csv_mapping_id","custscript_csv_folder_id","custscript_so_savedsearch_id","custscript_wo_savedsearch_id"] |
| PASS | w84_runtime_still_export_only | export function has no fetch call |
| PASS | w84_no_regression_flags_hold | {"noSuiteScriptInvocationFromIdb":true,"noDccRunnerMechanicsRewrite":true,"noIdbTransactionWrites":true,"hostedResolverOptionalUntilRemoteSmokeExecuted":true,"consultantConfirmationRequiredBeforeEligible":true} |
| PASS | w84_dcc_ownership_explicit | ["item names","assembly names","BOM and BOM revision names","inventory locations","planning controls","routing/WIP setup","CSV/Sales Order mechanics","runner queue/task submission","agenda/extid/notes file generation"] |
| PASS | w84_operator_steps_cover_blocked_and_confirmed | [{"step":"Verify exported packet schema and status.","passCriteria":"Schema is idb.dcc-runner-handoff-packet.v1 and status is either blocked_until_confirmed_handoff or ready_for_dcc_suitelet_submission_review.","stopIf":"Schema is missing, status is unknown, or executionMode is not review_only_no_submit."},{"step":"Verify consultant confirmation gate.","passCriteria":"Blocked packet keeps custpage_actionmode=previewbrief; confirmed packet clears custpage_actionmode but still remains review-only from IDB.","stopIf":"Unconfirmed packet is marked ready, or confirmed packet implies IDB submitted SuiteScript."},{"step":"Verify exact Suitelet form params.","passCriteria":"custpage_prospect, custpage_website, custpage_notes, custpage_newhero, custpage_enablemfg, custpage_enablewip, custpage_evalmode, and custpage_actionmode are present.","stopIf":"Any required form param is missing or has unsupported write intent."},{"step":"Verify DCC-owned config params.","passCriteria":"DCC deployment owns subsidiary, location, runner script/deploy IDs, CSV mapping/folder, and saved searches.","stopIf":"IDB attempts to provide or overwrite account config IDs."},{"step":"Verify scheduled runner preview params.","passCriteria":"Runner preview shows prospect, website, notes, generated agenda/extid placeholders, DCC config placeholders, manufacturing/WIP flags, hero mode, and optional WC search.","stopIf":"Preview implies IDB owns runner queue mechanics or generated object creation."},{"step":"Verify DCC object generation ownership.","passCriteria":"DCC remains owner of item names, assemblies, BOMs, locations, planning controls, routing/WIP, CSV/Sales Order mechanics, agenda, extid, notes file, and runner task.","stopIf":"IDB rewrites DCC runner mechanics or creates transaction context."},{"step":"Operator dry-run decision.","passCriteria":"Blocked packet stops at preview/no-submit. Confirmed packet is eligible only for manual governed DCC Suitelet review by an operator.","stopIf":"Any path tries to invoke SuiteScript from IDB or enable transaction writes."}] |

## Best Next Codex Prompt

Move through W85: DCC Sandbox Manual Handoff Parameter Smoke. Use the W84 confirmed dccRunnerHandoffPacketV1 sample to create a manual sandbox smoke script for an operator to compare IDB handoff fields against the Demo Command Center Suitelet fields and runner preview without IDB invoking SuiteScript. Verify form-param parity, DCC-owned deployment config readiness, runner queue ownership, review-only/no-submit behavior, and DCC ownership of item names, assemblies, BOMs, locations, planning, routing/WIP, and CSV/Sales Order mechanics. Preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, and consultant confirmation required. Output sandbox smoke script, expected evidence captures, go/no-go criteria, W85 report, validator gates, and best next Codex prompt.
