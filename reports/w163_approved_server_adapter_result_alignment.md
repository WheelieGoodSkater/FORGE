# W163 Approved Server Adapter Result Contract Alignment

Decision: PASS_SERVER_ADAPTER_RESULT_ALIGNMENT_READY__VISUAL_TESTING_BLOCKED

## Server Adapter Result Alignment Contract
- Starts from W162: PASS_FIXTURE_IMPORT_COMMIT_READY__VISUAL_TESTING_BLOCKED.
- Invocation mode: disabled_by_default_contract_only.
- Queued normalizes to: queued_pending.
- Polling normalizes to: polling_pending.
- Completed normalizes to: completed_result_awaiting_w151_import.
- Error normalizes to: adapter_transport_error_drawer_safe.
- Completed guard: completed_runner_result_accepted.
- Completed commit status: fixture_import_commit_ready.
- Openable after commit: 9.
- Error recovery status: adapter_transport_error_drawer_safe.
- Active Open links before import: 0.

## Guarded Harness
- Envelopes normalize to expected states: true.
- Completed result requires W151 before commit: true.
- Completed result requires numeric ids and URLs: true.
- Handoff JSON remains rejected: true.
- Error envelope drawer-safe: true.
- Invocation disabled by default: true.

## Visual Testing Decision
Blocked. W163 aligns the approved server adapter response contract only. Real invocation and visual NetSuite testing remain blocked.

## Validator Gates
- PASS w163_starts_from_w162_import_commit: PASS_FIXTURE_IMPORT_COMMIT_READY__VISUAL_TESTING_BLOCKED
- PASS w163_alignment_hook_ready: approved_server_adapter_result_contract_aligned
- PASS w163_envelopes_normalize_to_expected_states: {"queued":"queued_pending","polling":"polling_pending","completed":"completed_result_awaiting_w151_import","error":"adapter_transport_error_drawer_safe"}
- PASS w163_completed_result_requires_w151_before_commit: {"guardStatus":"completed_runner_result_accepted","acceptedByW151":true,"generatedRecordOwner":"governed_runner_internal_build_engine","internalRunnerOwnership":true,"commitStatus":"fixture_import_commit_ready","commitAllowed":true,"finalNamesImportedAfterCommit":true,"openableAfterCommit":9}
- PASS w163_completed_result_requires_numeric_ids_and_urls: {"beforeImportSummary":{"missing_url":7},"afterImportSummary":{"verified_openable":5},"activeOpenLinksBeforeImport":0,"openableAfterCommit":9,"noActiveOpenLinksBeforeImport":true,"noActiveOpenLinksWithoutRealUrls":true}
- PASS w163_handoff_json_still_rejected: {"handoffStatus":"handoff_packet_rejected","handoffRejected":true}
- PASS w163_error_envelope_drawer_safe: {"status":"adapter_transport_error_drawer_safe","drawerSafe":true,"next":"rollback_by_disabling_server_flags_or_retry_after_adapter_review"}
- PASS w163_no_open_links_before_import_and_invocation_disabled: {"activeOpenLinksBeforeImport":0,"invocationMode":"disabled_by_default_contract_only"}
- PASS w163_no_regression_boundaries_preserved: {"noDrawerWrites":true,"noDrawerTransactionWrites":true,"noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath":true,"consultantConfirmationRequired":true,"stateAuthorityAndHandoffParityPreserved":true,"internalRunnerOwnership":true,"rollbackByDisablingServerFlags":true,"w151CompletedResultImportGuardPreserved":true,"noActiveOpenLinksWithoutRealUrls":true,"noActiveOpenLinksBeforeImport":true}

## No Regression
- noDrawerWrites: true
- noDrawerTransactionWrites: true
- noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: true
- consultantConfirmationRequired: true
- stateAuthorityAndHandoffParityPreserved: true
- internalRunnerOwnership: true
- rollbackByDisablingServerFlags: true
- w151CompletedResultImportGuardPreserved: true
- noActiveOpenLinksWithoutRealUrls: true
- noActiveOpenLinksBeforeImport: true

## Best Next Codex Prompt
Move through W164: Approved Server Adapter Disabled Live Transport Readiness. Use the W163 aligned server adapter result contract to wire the disabled-by-default live transport readiness path for the approved NetSuite server adapter endpoint, without enabling writes or real invocation. Prove IDB can construct the request only when the confirmed Build request, server flags, sandbox allowlist, operator approval, idempotency token, and approved endpoint mode are present; otherwise it remains no-submit. Preserve queued, polling, completed, and error response normalization into the W157-W162 path, no drawer writes, no drawer transaction writes, no drawer SuiteScript invocation outside the approved server adapter path, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Do not request visual testing. Output disabled live transport readiness contract, guarded harness, trace samples, W164 report, visual testing decision blocked, and best next Codex prompt.
