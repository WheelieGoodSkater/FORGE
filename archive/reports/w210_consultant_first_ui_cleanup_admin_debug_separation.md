# W210 Consultant-First UI Cleanup And Admin Debug Separation

Status: PASS_W210_CONSULTANT_FIRST_UI_CLEANUP

## Consultant-First UI Contract
- Normal Build mode: production_consultant_tool
- Visible normal surfaces: Customer / Prospect Name, Website, Conversation Notes, Create new item, Manufacturing, WIP, Build demo records, Check status after build starts, Finish build after records are ready, Run demo, Open links after records exist
- Hidden normal surfaces: W144 endpoint, server flags, sandbox allowlist, operator phrases, idempotency token, runnerTaskId, raw adapter status, result-capture plumbing, retry diagnostics, manual result JSON import, debug handoff export, Pilot evidence checklist

## Admin/Debug Separation Map
- Build adapter endpoint and flags: normal=hidden; admin/debug=saved setup panel
- Operator authorization and sandbox account: normal=hidden; admin/debug=support-only setup evidence
- Runner task and polling payloads: normal=simple build status; admin/debug=diagnostic cards
- Manual completed result import: normal=hidden; admin/debug=fallback recovery only
- Trace and handoff exports: normal=trace export only; admin/debug=full evidence exports
- Retry, malformed result, adapter errors: normal=Build failed, ask admin; admin/debug=actionable recovery detail
- Image enrichment: normal=disabled; admin/debug=optional future enrichment

## Implementation Changes
- Renamed normal navigation from Build handoff to Build records.
- Simplified normal Build copy to customer-facing build status and record-link readiness.
- Moved export, evidence, result JSON, retry, and adapter controls behind admin/debug setup mode.
- Kept automatic runner submit, polling, internal W151 validation, and Open-link rendering intact.
- Kept runner image lookup disabled by default through the W209 runner contract.

## Regression Harness
- PASS w210_contract_declares_consultant_first_mode: ["Customer / Prospect Name","Website","Conversation Notes","Create new item","Manufacturing","WIP","Build demo records","Check status after build starts","Finish build after records are ready","Run demo","Open links after records exist"]
- PASS normal_build_uses_production_language: Normal Build is consultant-first.
- PASS normal_build_hides_adapter_plumbing: No adapter, raw result, or operator vocabulary is visible in normal Build.
- PASS normal_trace_hides_result_import_and_debug_handoff: Trace normal mode keeps only support trace export.
- PASS normal_plan_renames_build_handoff: Plan CTA uses production language.
- PASS admin_debug_keeps_recovery_controls: Admin/debug retains diagnostics and recovery controls.
- PASS status_controls_are_stage_gated: Check and Finish are shown only at their stages.
- PASS open_links_wait_for_import: completed_runner_result_accepted
- PASS automatic_build_regression_preserved: {"automaticRunnerSubmitPreserved":true,"pollingPreserved":true,"w151ImportGuardInternal":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedServerAdapterPath":true,"runnerOwnsGeneratedRecords":true,"openLinksOnlyAfterRealUrls":true,"imageLookupDisabledByDefault":true}
- PASS no_drawer_write_boundaries_preserved: {"automaticRunnerSubmitPreserved":true,"pollingPreserved":true,"w151ImportGuardInternal":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedServerAdapterPath":true,"runnerOwnsGeneratedRecords":true,"openLinksOnlyAfterRealUrls":true,"imageLookupDisabledByDefault":true}
- PASS image_lookup_disabled_by_default: W209 image lookup removal remains in force.

## Release-Readiness Decision
- release_candidate_for_consultant_first_build_smoke

## Upload Packet
- Upload idb-drawer.user.js to Tampermonkey.
- No W144 Suitelet upload is required for W210 if the W208/W209 adapter and runner are already deployed.
- Upload scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js only if the W209 image-lookup-disabled runner has not already been uploaded.
