# W82 DCC Runner Handoff Packet And Suitelet Parameter Map

Decision: PASS / DCC PARAMETER MAP READY / REVIEW ONLY / NO SUITESCRIPT INVOCATION FROM IDB

## Objective

Take `buildPacketV1` and map it to the exact Demo Command Center Suitelet and scheduled runner parameters while preserving DCC ownership of item names, assemblies, BOMs, locations, planning controls, routing/WIP, and CSV/Sales Order mechanics.

## Suitelet Entry Params

| IDB Field | DCC Param | Required |
| --- | --- | --- |
| identity.prospect | custpage_prospect | yes |
| identity.website | custpage_website | no |
| consultantInputs.conversationNotes | custpage_notes | yes |
| dccRunnerInputs.createNewHeroItem | custpage_newhero | yes |
| dccRunnerInputs.enableManufacturing | custpage_enablemfg | yes |
| dccRunnerInputs.enableWip | custpage_enablewip | yes |
| writeMode | custpage_evalmode | no |
| dccGenerated.extId | custpage_extid | no |
| dccGenerated.agenda | custpage_agenda | no |
| dccGenerated.runnerTaskId | custpage_runnertaskid | no |
| dccGenerated.notesFileId | custpage_notesfileid | no |
| handoffAction | custpage_actionmode | no |

## DCC-Owned Config Params

- `custscriptv3_reset_subsidiary`
- `custscript_v3_reset_location`
- `custscript_v3_runner_script_id`
- `custscript_v3_runner_deploy_id`
- `custscript_csv_mapping_id`
- `custscript_csv_folder_id`
- `custscript_so_savedsearch_id`
- `custscript_wo_savedsearch_id`

## Scheduled Runner Params

| IDB Field / DCC-Owned Source | Runner Param |
| --- | --- |
| identity.prospect | custscript_v3_runner_prospect |
| identity.website | custscript_v3_runner_website |
| dccRunnerInputs.signalText | custscript_v3_runner_notes |
| dccGenerated.agenda | custscript_v3_runner_agenda |
| dccGenerated.extId | custscript_v3_runner_extid |
| dccConfig.soMappingId | custscript_v3_runner_mapping |
| dccConfig.soFolderId | custscript_v3_runner_folder |
| dccConfig.subsidiaryId | custscript_v3_runner_subsidiary |
| dccConfig.locationId | custscript_v3_runner_location |
| dccRunnerInputs.enableWip | custscript_v3_runner_enable_wip |
| dccRunnerInputs.enableManufacturing | custscript_v3_runner_enable_mfg |
| dccRunnerInputs.createNewHeroItem | custscript_v3_runner_create_new_hero |
| dccGenerated.heroItemId | custscript_v3_runner_hero_item |
| dccConfig.woSavedSearchId | custscript_v3_runner_wc_search |

## Blocked Example

`blocked_until_confirmed_handoff`: consultant confirmation is missing, so IDB may show preview guidance but must not submit to DCC.

## Confirmed Example

`ready_for_dcc_suitelet_submission_review`: consultant has confirmed the packet, but DCC Suitelet config and governed operator submission still own execution.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w82_inherits_w81_bridge | {"schema":"idb.w81-idb-dcc-build-packet-bridge.v1","status":"build_packet_bridge_ready_review_only"} |
| PASS | w82_runtime_contains_function_dccrunnerparametermapv1 | function dccRunnerParameterMapV1 |
| PASS | w82_runtime_contains_function_dccrunnerhandoffpacketv1 | function dccRunnerHandoffPacketV1 |
| PASS | w82_runtime_contains_custpage_prospect | custpage_prospect |
| PASS | w82_runtime_contains_custpage_website | custpage_website |
| PASS | w82_runtime_contains_custpage_notes | custpage_notes |
| PASS | w82_runtime_contains_custpage_newhero | custpage_newhero |
| PASS | w82_runtime_contains_custpage_enablemfg | custpage_enablemfg |
| PASS | w82_runtime_contains_custpage_enablewip | custpage_enablewip |
| PASS | w82_runtime_contains_custscript_v3_runner_prospect | custscript_v3_runner_prospect |
| PASS | w82_runtime_contains_custscript_v3_runner_mapping | custscript_v3_runner_mapping |
| PASS | w82_runtime_contains_custscript_v3_runner_folder | custscript_v3_runner_folder |
| PASS | w82_runtime_contains_custscript_v3_runner_subsidiary | custscript_v3_runner_subsidiary |
| PASS | w82_runtime_contains_custscript_v3_runner_enable_mfg | custscript_v3_runner_enable_mfg |
| PASS | w82_runtime_contains_custscript_v3_runner_create_new_hero | custscript_v3_runner_create_new_hero |
| PASS | w82_runtime_contains_custscript_v3_runner_hero_item | custscript_v3_runner_hero_item |
| PASS | w82_runtime_contains_dccrunnerhandoffpacketv1_dccrunnerhandoffpacketv1 | dccRunnerHandoffPacketV1: dccRunnerHandoffPacketV1 |
| PASS | w82_suitelet_entry_param_map_complete | [{"idbField":"identity.prospect","dccParam":"custpage_prospect","required":true},{"idbField":"identity.website","dccParam":"custpage_website","required":false},{"idbField":"consultantInputs.conversationNotes","dccParam":"custpage_notes","required":true},{"idbField":"dccRunnerInputs.createNewHeroItem","dccParam":"custpage_newhero","required":true},{"idbField":"dccRunnerInputs.enableManufacturing","dccParam":"custpage_enablemfg","required":true},{"idbField":"dccRunnerInputs.enableWip","dccParam":"custpage_enablewip","required":true},{"idbField":"writeMode","dccParam":"custpage_evalmode","required":false},{"idbField":"dccGenerated.extId","dccParam":"custpage_extid","required":false},{"idbField":"dccGenerated.agenda","dccParam":"custpage_agenda","required":false},{"idbField":"dccGenerated.runnerTaskId","dccParam":"custpage_runnertaskid","required":false},{"idbField":"dccGenerated.notesFileId","dccParam":"custpage_notesfileid","required":false},{"idbField":"handoffAction","dccParam":"custpage_actionmode","required":false}] |
| PASS | w82_runner_param_map_complete | [{"idbField":"identity.prospect","dccParam":"custscript_v3_runner_prospect"},{"idbField":"identity.website","dccParam":"custscript_v3_runner_website"},{"idbField":"dccRunnerInputs.signalText","dccParam":"custscript_v3_runner_notes"},{"idbField":"dccGenerated.agenda","dccParam":"custscript_v3_runner_agenda"},{"idbField":"dccGenerated.extId","dccParam":"custscript_v3_runner_extid"},{"idbField":"dccConfig.soMappingId","dccParam":"custscript_v3_runner_mapping"},{"idbField":"dccConfig.soFolderId","dccParam":"custscript_v3_runner_folder"},{"idbField":"dccConfig.subsidiaryId","dccParam":"custscript_v3_runner_subsidiary"},{"idbField":"dccConfig.locationId","dccParam":"custscript_v3_runner_location"},{"idbField":"dccRunnerInputs.enableWip","dccParam":"custscript_v3_runner_enable_wip"},{"idbField":"dccRunnerInputs.enableManufacturing","dccParam":"custscript_v3_runner_enable_mfg"},{"idbField":"dccRunnerInputs.createNewHeroItem","dccParam":"custscript_v3_runner_create_new_hero"},{"idbField":"dccGenerated.heroItemId","dccParam":"custscript_v3_runner_hero_item"},{"idbField":"dccConfig.woSavedSearchId","dccParam":"custscript_v3_runner_wc_search"}] |
| PASS | w82_dcc_config_params_marked_dcc_owned | ["custscriptv3_reset_subsidiary","custscript_v3_reset_location","custscript_v3_runner_script_id","custscript_v3_runner_deploy_id","custscript_csv_mapping_id","custscript_csv_folder_id","custscript_so_savedsearch_id","custscript_wo_savedsearch_id"] |
| PASS | w82_blocked_confirmed_examples_keep_no_invoke | {"blocked":"blocked_until_confirmed_handoff","confirmed":"ready_for_dcc_suitelet_submission_review"} |
| PASS | w82_no_regression_boundaries_present | no regression runtime flags |

## No Regression

- DCC owns item, assembly, BOM, location, planning, routing/WIP, and CSV/Sales Order mechanics.
- DCC runner mechanics are not rewritten.
- IDB does not invoke SuiteScript.
- IDB transaction writes remain disabled.
- Hosted resolver remains optional until `remoteSmokeExecuted=true`.
- Consultant confirmation remains required before handoff eligibility.

## Best Next Codex Prompt

```text
Move through W83: DCC Handoff Export And Operator Review UX. Add a review-only DCC handoff export from the drawer using dccRunnerHandoffPacketV1, with a compact Review card showing blocked/confirmed status, exact Suitelet form params, DCC-owned config params, scheduled runner preview params, and operator checklist. Do not invoke SuiteScript, do not rewrite DCC runner mechanics, do not enable IDB transaction writes, keep hosted resolver optional until remoteSmokeExecuted=true, and require consultant confirmation before any handoff is eligible. Output export payload, UI summary, blocked/confirmed trace samples, W83 report, validator gates, and best next Codex prompt.
```
