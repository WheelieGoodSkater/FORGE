# W170 Approved Server Adapter Sandbox Live Transport Operator Unlock Packet

Decision: PASS_SANDBOX_UNLOCK_PACKET_READY__LIVE_DISABLED__VISUAL_TESTING_BLOCKED

## Operator Unlock Packet
- Endpoint URL: https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID.
- CREATE_ENABLED: true.
- GOVERNED_SANDBOX_WRITE_ENABLED: true.
- QUEUE_SUBMIT_ENABLED: true.
- Sandbox allowlist: SANDBOX_ACCOUNT_ID.
- Operator decision: operator_approved_queue_submit.
- Idempotency token: idb-build-ariat-international-apparel-accessories-apparelaccessories.
- One-submit max attempts: 1.
- Polling max attempts: 8.
- Poll interval ms: 1500.

## Retry And Rollback
- Timeout retry: retry_same_idempotency_token.
- Duplicate idempotency: continue_poll_existing_runner_task.
- Adapter error: stop_and_require_operator_evidence.
- Rollback flags: CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, QUEUE_SUBMIT_ENABLED.

## W151 Import Guard
- Accepts only completed runner result JSON: true.
- Rejects handoff JSON: true.
- Requires numeric internal ids: true.
- Requires supported NetSuite URLs: true.
- Active Open links before import: 0.

## Invocation Decision
- Live request sent: false.
- Transport invoked: false.
- Queue submitted: false.
- Explicit authorization present: false.

## Trace Samples
- w170_readiness_gate_ready: ready=true; liveRequestSent=false; queueSubmitted=false; activeOpenLinks=0
- w170_endpoint_url_present: ready=true; liveRequestSent=false; queueSubmitted=false; activeOpenLinks=0
- w170_deployment_flags_true: ready=true; liveRequestSent=false; queueSubmitted=false; activeOpenLinks=0
- w170_sandbox_allowlist_ready: ready=true; liveRequestSent=false; queueSubmitted=false; activeOpenLinks=0
- w170_operator_approval_ready: ready=true; liveRequestSent=false; queueSubmitted=false; activeOpenLinks=0
- w170_idempotency_token_ready: ready=true; liveRequestSent=false; queueSubmitted=false; activeOpenLinks=0
- w170_one_submit_limit_ready: ready=true; liveRequestSent=false; queueSubmitted=false; activeOpenLinks=0
- w170_polling_limit_ready: ready=true; liveRequestSent=false; queueSubmitted=false; activeOpenLinks=0
- w170_retry_rollback_ready: ready=true; liveRequestSent=false; queueSubmitted=false; activeOpenLinks=0
- w170_w151_import_guard_ready: ready=true; liveRequestSent=false; queueSubmitted=false; activeOpenLinks=0

## Visual Testing Decision
Blocked. W170 prepares the sandbox operator unlock packet only. Visual testing stays blocked until a real runner result returns to IDB.

## Validator Gates
- PASS w170_starts_from_w169_readiness_gate: PASS_LIVE_TRANSPORT_READINESS_GATE_READY__NO_REQUEST_SENT__VISUAL_TESTING_BLOCKED
- PASS w170_unlock_hook_ready: sandbox_operator_unlock_packet_ready_live_disabled
- PASS w170_endpoint_flags_allowlist_operator_idempotency_ready: {"schema":"idb.approved-server-adapter-sandbox-live-transport-operator-unlock-packet.v1","mode":"sandbox_operator_unlock_packet_live_disabled_by_default","endpointUrl":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID","deploymentFlags":{"CREATE_ENABLED":true,"GOVERNED_SANDBOX_WRITE_ENABLED":true,"QUEUE_SUBMIT_ENABLED":true},"sandboxAllowlistEvidence":{"accountAllowlist":["SANDBOX_ACCOUNT_ID"],"currentAccountAllowed":true,"sandboxOnly":true},"operatorApprovalEvidence":{"operatorName":"Operator QA","reviewedAt":"2026-05-16T23:00:00.000Z","reviewDecision":"operator_approved_queue_submit","typeToConfirm":"QUEUE GOVERNED SANDBOX RUNNER","confirmedSandboxAccount":true,"confirmedNoSubmit":true,"notes":"Unlock packet only. Do not invoke live transport in W170."},"idempotencyToken":"idb-build-ariat-international-apparel-accessories-apparelaccessories","retryRollbackPlan":{"timeoutRetry":"retry_same_idempotency_token","duplicateIdempotency":"continue_poll_existing_runner_task","adapterError":"stop_and_require_operator_evidence","rollback":{"owner":"server_deployment_flags","action":"disable_server_flags_before_any_retry","flagsToDisable":["CREATE_ENABLED","GOVERNED_SANDBOX_WRITE_ENABLED","QUEUE_SUBMIT_ENABLED"]}},"oneSubmitLimit":{"maxQueueSubmitAttempts":1,"duplicateIdempotencyBehavior":"poll_existing_runner_task","secondSubmitBehavior":"blocked_duplicate_submit"},"pollingLimit":{"maxPollAttempts":8,"pollIntervalMs":1500,"timeoutBehavior":"retry_same_idempotency_until_limit_then_stop"},"w151ResultImportGuard":{"required":true,"acceptsOnlyCompletedRunnerResultJson":true,"rejectsHandoffJson":true,"requiresNumericInternalIds":true,"requiresSupportedNetSuiteUrls":true,"activeOpenLinksBeforeImport":0},"authorization":{"explicitLiveAuthorization":false,"requiredPhrase":"AUTHORIZE ONE SANDBOX ADAPTER CALL","providedPhrase":"","liveInvocationStillDisabled":true}}
- PASS w170_one_submit_polling_rollback_w151_ready: {"oneSubmit":{"maxQueueSubmitAttempts":1,"duplicateIdempotencyBehavior":"poll_existing_runner_task","secondSubmitBehavior":"blocked_duplicate_submit"},"polling":{"maxPollAttempts":8,"pollIntervalMs":1500,"timeoutBehavior":"retry_same_idempotency_until_limit_then_stop"},"rollback":{"timeoutRetry":"retry_same_idempotency_token","duplicateIdempotency":"continue_poll_existing_runner_task","adapterError":"stop_and_require_operator_evidence","rollback":{"owner":"server_deployment_flags","action":"disable_server_flags_before_any_retry","flagsToDisable":["CREATE_ENABLED","GOVERNED_SANDBOX_WRITE_ENABLED","QUEUE_SUBMIT_ENABLED"]}},"w151":{"required":true,"acceptsOnlyCompletedRunnerResultJson":true,"rejectsHandoffJson":true,"requiresNumericInternalIds":true,"requiresSupportedNetSuiteUrls":true,"activeOpenLinksBeforeImport":0}}
- PASS w170_missing_operator_approval_blocks: [{"id":"readiness_gate_ready","ready":false,"evidence":"live_transport_go_gate_blocked_no_request_sent"},{"id":"endpoint_url_present","ready":true,"evidence":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID"},{"id":"deployment_flags_true","ready":true,"evidence":{"CREATE_ENABLED":true,"GOVERNED_SANDBOX_WRITE_ENABLED":true,"QUEUE_SUBMIT_ENABLED":true}},{"id":"sandbox_allowlist_ready","ready":true,"evidence":{"accountAllowlist":["SANDBOX_ACCOUNT_ID"],"currentAccountAllowed":true,"sandboxOnly":true}},{"id":"operator_approval_ready","ready":false,"evidence":{"operatorName":"Operator QA","reviewedAt":"2026-05-16T23:00:00.000Z","reviewDecision":"operator_review_not_started","typeToConfirm":"","confirmedSandboxAccount":true,"confirmedNoSubmit":true,"notes":"Unlock packet only. Do not invoke live transport in W170."}},{"id":"idempotency_token_ready","ready":true,"evidence":"w166_idempotency_token"},{"id":"one_submit_limit_ready","ready":true,"evidence":{"maxQueueSubmitAttempts":1,"duplicateIdempotencyBehavior":"poll_existing_runner_task","secondSubmitBehavior":"blocked_duplicate_submit"}},{"id":"polling_limit_ready","ready":true,"evidence":{"maxPollAttempts":8,"pollIntervalMs":1500,"timeoutBehavior":"retry_same_idempotency_until_limit_then_stop"}},{"id":"retry_rollback_ready","ready":true,"evidence":{"timeoutRetry":"retry_same_idempotency_token","duplicateIdempotency":"continue_poll_existing_runner_task","adapterError":"stop_and_require_operator_evidence","rollback":{"owner":"server_deployment_flags","action":"disable_server_flags_before_any_retry","flagsToDisable":["CREATE_ENABLED","GOVERNED_SANDBOX_WRITE_ENABLED","QUEUE_SUBMIT_ENABLED"]}}},{"id":"w151_import_guard_ready","ready":true,"evidence":{"required":true,"acceptsOnlyCompletedRunnerResultJson":true,"rejectsHandoffJson":true,"requiresNumericInternalIds":true,"requiresSupportedNetSuiteUrls":true,"activeOpenLinksBeforeImport":0}}]
- PASS w170_explicit_authorization_still_no_invoke: {"liveRequestSent":false,"transportInvoked":false,"queueSubmitted":false,"reason":"Authorization phrase is present, but W170 still does not invoke; a later explicit execution block owns the call."}
- PASS w170_no_names_or_links_mutated: {"finalGeneratedNamesBefore":"","finalGeneratedNamesAfter":"","finalGeneratedNamesUnchanged":true,"activeOpenLinks":0,"writesAttempted":false}
- PASS w170_trace_samples_ready: [{"event":"w170_readiness_gate_ready","gate":"readiness_gate_ready","ready":true,"evidence":"live_transport_go_gate_ready_no_request_sent","liveRequestSent":false,"queueSubmitted":false,"activeOpenLinks":0,"mutatesFinalGeneratedNames":false},{"event":"w170_endpoint_url_present","gate":"endpoint_url_present","ready":true,"evidence":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID","liveRequestSent":false,"queueSubmitted":false,"activeOpenLinks":0,"mutatesFinalGeneratedNames":false},{"event":"w170_deployment_flags_true","gate":"deployment_flags_true","ready":true,"evidence":{"CREATE_ENABLED":true,"GOVERNED_SANDBOX_WRITE_ENABLED":true,"QUEUE_SUBMIT_ENABLED":true},"liveRequestSent":false,"queueSubmitted":false,"activeOpenLinks":0,"mutatesFinalGeneratedNames":false},{"event":"w170_sandbox_allowlist_ready","gate":"sandbox_allowlist_ready","ready":true,"evidence":{"accountAllowlist":["SANDBOX_ACCOUNT_ID"],"currentAccountAllowed":true,"sandboxOnly":true},"liveRequestSent":false,"queueSubmitted":false,"activeOpenLinks":0,"mutatesFinalGeneratedNames":false},{"event":"w170_operator_approval_ready","gate":"operator_approval_ready","ready":true,"evidence":{"operatorName":"Operator QA","reviewedAt":"2026-05-16T23:00:00.000Z","reviewDecision":"operator_approved_queue_submit","typeToConfirm":"QUEUE GOVERNED SANDBOX RUNNER","confirmedSandboxAccount":true,"confirmedNoSubmit":true,"notes":"Unlock packet only. Do not invoke live transport in W170."},"liveRequestSent":false,"queueSubmitted":false,"activeOpenLinks":0,"mutatesFinalGeneratedNames":false},{"event":"w170_idempotency_token_ready","gate":"idempotency_token_ready","ready":true,"evidence":"idb-build-ariat-international-apparel-accessories-apparelaccessories","liveRequestSent":false,"queueSubmitted":false,"activeOpenLinks":0,"mutatesFinalGeneratedNames":false},{"event":"w170_one_submit_limit_ready","gate":"one_submit_limit_ready","ready":true,"evidence":{"maxQueueSubmitAttempts":1,"duplicateIdempotencyBehavior":"poll_existing_runner_task","secondSubmitBehavior":"blocked_duplicate_submit"},"liveRequestSent":false,"queueSubmitted":false,"activeOpenLinks":0,"mutatesFinalGeneratedNames":false},{"event":"w170_polling_limit_ready","gate":"polling_limit_ready","ready":true,"evidence":{"maxPollAttempts":8,"pollIntervalMs":1500,"timeoutBehavior":"retry_same_idempotency_until_limit_then_stop"},"liveRequestSent":false,"queueSubmitted":false,"activeOpenLinks":0,"mutatesFinalGeneratedNames":false},{"event":"w170_retry_rollback_ready","gate":"retry_rollback_ready","ready":true,"evidence":{"timeoutRetry":"retry_same_idempotency_token","duplicateIdempotency":"continue_poll_existing_runner_task","adapterError":"stop_and_require_operator_evidence","rollback":{"owner":"server_deployment_flags","action":"disable_server_flags_before_any_retry","flagsToDisable":["CREATE_ENABLED","GOVERNED_SANDBOX_WRITE_ENABLED","QUEUE_SUBMIT_ENABLED"]}},"liveRequestSent":false,"queueSubmitted":false,"activeOpenLinks":0,"mutatesFinalGeneratedNames":false},{"event":"w170_w151_import_guard_ready","gate":"w151_import_guard_ready","ready":true,"evidence":{"required":true,"acceptsOnlyCompletedRunnerResultJson":true,"rejectsHandoffJson":true,"requiresNumericInternalIds":true,"requiresSupportedNetSuiteUrls":true,"activeOpenLinksBeforeImport":0},"liveRequestSent":false,"queueSubmitted":false,"activeOpenLinks":0,"mutatesFinalGeneratedNames":false}]
- PASS w170_visual_testing_blocked: W170 prepares the sandbox operator unlock packet only. Visual testing stays blocked until a real runner result returns to IDB.
- PASS w170_no_regression_boundaries_preserved: {"noDrawerWrites":true,"noDrawerTransactionWrites":true,"noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath":true,"consultantConfirmationRequired":true,"stateAuthorityAndHandoffParityPreserved":true,"idempotencyPreserved":true,"internalRunnerOwnership":true,"rollbackByDisablingServerFlags":true,"w151CompletedResultImportGuardPreserved":true,"oneSubmitLimit":true,"noActiveOpenLinksWithoutRealUrls":true,"noLiveInvocation":true}

## No Regression
- noDrawerWrites: true
- noDrawerTransactionWrites: true
- noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: true
- consultantConfirmationRequired: true
- stateAuthorityAndHandoffParityPreserved: true
- idempotencyPreserved: true
- internalRunnerOwnership: true
- rollbackByDisablingServerFlags: true
- w151CompletedResultImportGuardPreserved: true
- oneSubmitLimit: true
- noActiveOpenLinksWithoutRealUrls: true
- noLiveInvocation: true

## Best Next Codex Prompt
Move through W171: Approved Server Adapter Explicit Sandbox One-Call Authorization Gate. Use the W170 sandbox operator unlock packet to add the final explicit authorization gate for one sandbox approved server adapter call, requiring the operator phrase AUTHORIZE ONE SANDBOX ADAPTER CALL, endpoint confirmation, server flags true, sandbox allowlist, idempotency token, one-submit limit, rollback flags, and W151 import guard. Keep the default path no-submit and do not perform the live call unless the user explicitly authorizes execution in that block. Do not request visual testing. Output authorization gate contract, guarded harness, trace samples, W171 report, visual testing decision blocked until runner result returns, and best next Codex prompt.
