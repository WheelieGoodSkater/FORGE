# W208 One-Click Production Build Automation And Hidden Admin Config

Status: PASS_W208_ONE_CLICK_PRODUCTION_BUILD_AUTOMATION
Release decision: release_ready_for_one_click_production_build_pilot

## One-Click Production Build Contract
- Consultant inputs: Customer / Prospect Name, Website, Conversation Notes
- Consultant toggles: Create new item, Manufacturing, WIP
- Primary action: Build demo records
- Visible statuses: Ready to build, Building records, Still building, Records ready, Build needs admin setup, Build failed, ask admin
- Admin/debug configuration is hidden from normal consultant flow.

## Implementation Changes
- Normal Build renders consultant-safe Build demo records, Check status, and Finish build controls.
- Normal Trace hides debug handoff export and manual completed-result import.
- Admin/debug mode keeps endpoint, flags, operator gate, submit, and manual import fallback surfaces.
- The existing W144 submit, W190 polling, and W151 import path remains the record-return authority.

## Regression Harness
- PASS normal_build_surface_has_only_consultant_controls: Ready Build surface exposes one button and hides adapter details.
- PASS fresh_session_uses_hidden_saved_admin_config: ready_to_build
- PASS normal_build_surface_shows_simple_toggles: Normal Build includes consultant build toggles.
- PASS normal_trace_hides_handoff_and_manual_import: Trace normal mode is support evidence only.
- PASS admin_debug_keeps_fallback_controls: Admin/debug mode retains endpoint, submit, and manual import fallback.
- PASS w208_model_has_consultant_safe_statuses: ["Ready to build","Building records","Still building","Records ready","Build needs admin setup","Build failed, ask admin"]
- PASS building_state_shows_check_status_without_raw_runner_task: still_building
- PASS completed_status_only_without_payload_waits_for_links: records_waiting_for_links
- PASS run_blocks_provisional_live_record_script_until_links_import: Run waits for imported links before live record coaching.
- PASS completed_state_finishes_build_before_links: records_ready_to_finish
- PASS w151_guard_still_accepts_only_completed_result: completed_runner_result_accepted
- PASS imported_build_and_run_show_real_open_links: {"verified_openable":5}
- PASS boundaries_preserved: {"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedServerAdapterPath":true,"approvedServerAdapterOwnsInvocation":true,"runnerOwnsGeneratedRecords":true,"w151ImportGuardPreservedInternally":true,"openLinksOnlyAfterRealUrls":true,"handoffJsonRejectedAsResultImport":true,"existingW144W190W151PathPreserved":true}

## Boundaries
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved server adapter path.
- Runner owns generated records.
- Open links appear only after real numeric ids and supported NetSuite URLs exist.
