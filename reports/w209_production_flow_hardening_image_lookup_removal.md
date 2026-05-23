# W209 Production Flow Hardening, Consultant Toggle Control, And Image Lookup Removal

Status: PASS_W209_PRODUCTION_FLOW_HARDENING_IMAGE_LOOKUP_REMOVAL

## Production Flow Hardening Contract
- Normal consultant flow: Customer / Prospect Name, Website, Conversation Notes, Create new item, Manufacturing, WIP, Build demo records, Run demo, Open links after records exist
- Status copy: Ready to build, Building records, Still building, Records ready, Build failed, ask admin
- Check status rule: visible_only_after_runnerTaskId_exists
- Finish build rule: visible_only_after_completed_result_is_ready

## Image Lookup Removal Contract
- Runner image lookup default: disabled
- Critical path impact: never_blocks_record_creation_sales_order_creation_item_creation_or_result_capture
- Optional future mode: admin_debug_enrichment_only

## Consultant Toggle Request Contract
- Create new item: true
- Manufacturing: true
- WIP: false

## Admin/Debug Relocation Map
- W144 endpoint and server flags: normal=hidden; admin/debug=saved configuration
- operator phrase and sandbox allowlist: normal=hidden; admin/debug=support setup only
- runnerTaskId and result-capture internals: normal=simple status only; admin/debug=diagnostics
- raw completed runner result JSON import: normal=hidden; admin/debug=fallback only
- debug handoff export and trace internals: normal=support trace only; admin/debug=full export controls
- retry/error diagnostic cards: normal=Build failed, ask admin; admin/debug=actionable diagnostics

## Regression Harness
- PASS consultant_flow_limited_to_expected_controls: ["Customer / Prospect Name","Website","Conversation Notes","Create new item","Manufacturing","WIP","Build demo records","Run demo","Open links after records exist"]
- PASS normal_build_hides_admin_debug_terms: Normal Build hides W144 and raw runner controls.
- PASS normal_trace_hides_raw_import_and_handoff: Trace normal mode stays consultant-safe.
- PASS admin_debug_retains_support_controls: Admin/debug keeps recovery controls.
- PASS toggles_are_durable_and_in_build_request: {"createNewHeroItem":true,"enableManufacturing":true,"enableWip":false,"includedInConfirmedBuildRequest":true,"confirmedBuildRequestToggles":{"createNewHeroItem":true,"enableManufacturing":true,"enableWip":false}}
- PASS check_status_only_after_runner_task: Check status appears after runner task without leaking task id.
- PASS finish_build_only_after_completed_result_ready: Finish build appears only after completed result is ready.
- PASS open_links_only_after_import: completed_runner_result_accepted
- PASS image_lookup_disabled_by_default_in_runner: Runner has image enrichment opt-in flag and default skipped status.
- PASS image_lookup_non_blocking_guarantee_recorded: {"runnerImageLookupDefault":"disabled","criticalPathImpact":"never_blocks_record_creation_sales_order_creation_item_creation_or_result_capture","optionalFutureMode":"admin_debug_enrichment_only","expectedRunnerStatus":"skipped-admin-enrichment-disabled","parameter":"custscript_v3_runner_enable_image_enrichment_or_custscript_idb_enable_image_enrichment","defaultValue":"F"}
- PASS w208_successful_path_preserved: {"w208PathPreserved":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedServerAdapterPath":true,"runnerOwnsGeneratedRecords":true,"w151ImportGuardInternal":true,"openLinksOnlyAfterRealUrls":true,"finalNamesImported":false}

## Upload Packet
- Upload idb-drawer.user.js to Tampermonkey.
- Upload scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js to the active Demo Command Center Runner V3 scheduled script file.
- Leave image enrichment parameters absent or false unless an admin intentionally enables optional enrichment later.
