# W165 Approved Server Adapter Harness Request/Response Handshake

Decision: PASS_HARNESS_HANDSHAKE_READY__VISUAL_TESTING_BLOCKED

## Harness Handshake Contract
- Mode: harness_only_mock_endpoint_no_live_invocation.
- Request accepted by mocked endpoint: true.
- Endpoint: https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID.
- Method: POST.
- Idempotency token: idb-build-ariat-international-apparel-accessories-apparelaccessories.
- Invocation attempted: false.
- Active Open links before import: 0.

## Request Facts
- confirmedBuildRequest: true
- operatorGate: true
- idempotencyToken: true
- sandboxAllowlistEvidence: true
- pollCursor: true
- approvedEndpoint: true

## Normalized Mock Responses
- queued: queued_pending
- polling: polling_pending
- completed: completed_result_awaiting_w151_import
- error: adapter_transport_error_drawer_safe

## Completed Result Guard
- W151 status: completed_runner_result_accepted.
- Accepted by W151: true.
- Handoff rejected: true.
- Active Open links before import: 0.

## Visual Testing Decision
Blocked. W165 is a mocked request/response handshake only. It does not invoke NetSuite, submit the runner, write records, or expose Open links.

## Validator Gates
- PASS w165_starts_from_w164_readiness: PASS_DISABLED_LIVE_TRANSPORT_READINESS_READY__VISUAL_TESTING_BLOCKED
- PASS w165_handshake_hook_ready: approved_server_adapter_harness_handshake_ready
- PASS w165_mock_endpoint_receives_constructed_request: {"requestSchema":"idb.approved-server-adapter-disabled-live-transport-request.v1","action":"submit_or_poll_build_return","endpointUrl":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID","method":"POST","idempotencyToken":"idb-build-ariat-international-apparel-accessories-apparelaccessories","confirmedRequestId":"idb-build-ariat-international-apparel-accessories-apparelaccessories","operatorDecision":"operator_approved_queue_submit","poll":{"runnerTaskId":"","resultCaptureCursor":""},"invocationAttempted":false,"activeOpenLinks":0}
- PASS w165_request_carries_required_facts: {"confirmedBuildRequest":true,"operatorGate":true,"idempotencyToken":true,"sandboxAllowlistEvidence":true,"pollCursor":true,"approvedEndpoint":true}
- PASS w165_responses_normalize_through_w157_w162: {"queued":"queued_pending","polling":"polling_pending","completed":"completed_result_awaiting_w151_import","error":"adapter_transport_error_drawer_safe"}
- PASS w165_completed_result_awaits_w151_import: {"status":"completed_runner_result_accepted","acceptedByW151":true,"handoffStatus":"handoff_packet_rejected","handoffRejected":true,"activeOpenLinksBeforeImport":0}
- PASS w165_handoff_still_rejected: {"status":"completed_runner_result_accepted","acceptedByW151":true,"handoffStatus":"handoff_packet_rejected","handoffRejected":true,"activeOpenLinksBeforeImport":0}
- PASS w165_blocked_handshake_stays_no_submit: {"idempotencyToken":"","confirmedRequestId":"","operatorDecision":"","poll":{},"invocationAttempted":false,"activeOpenLinks":0}
- PASS w165_no_live_invocation_and_no_links: {"requestSchema":"idb.approved-server-adapter-disabled-live-transport-request.v1","action":"submit_or_poll_build_return","endpointUrl":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID","method":"POST","idempotencyToken":"idb-build-ariat-international-apparel-accessories-apparelaccessories","confirmedRequestId":"idb-build-ariat-international-apparel-accessories-apparelaccessories","operatorDecision":"operator_approved_queue_submit","poll":{"runnerTaskId":"","resultCaptureCursor":""},"invocationAttempted":false,"activeOpenLinks":0}
- PASS w165_no_regression_boundaries_preserved: {"noDrawerWrites":true,"noDrawerTransactionWrites":true,"noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath":true,"consultantConfirmationRequired":true,"stateAuthorityAndHandoffParityPreserved":true,"idempotencyPreserved":true,"internalRunnerOwnership":true,"rollbackByDisablingServerFlags":true,"noActiveOpenLinksWithoutRealUrls":true,"noLiveInvocation":true}

## No Regression
- noDrawerWrites: true
- noDrawerTransactionWrites: true
- noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: true
- consultantConfirmationRequired: true
- stateAuthorityAndHandoffParityPreserved: true
- idempotencyPreserved: true
- internalRunnerOwnership: true
- rollbackByDisablingServerFlags: true
- noActiveOpenLinksWithoutRealUrls: true
- noLiveInvocation: true

## Best Next Codex Prompt
Move through W166: Approved Server Adapter Live-Disabled Transport Error And Retry Contract. Use the W165 harness-only request/response handshake to define drawer-safe retry, timeout, duplicate idempotency, adapter error, and malformed completed-result behavior while real invocation remains disabled. Prove errors and retries do not mutate final generated names, do not create active Open links, preserve W151 completed-result import guard, preserve state authority and handoff parity, and keep rollback by disabling server flags. Do not enable writes, do not invoke NetSuite live, and do not request visual testing. Output error/retry contract, guarded harness, trace samples, W166 report, visual testing decision blocked, and best next Codex prompt.
