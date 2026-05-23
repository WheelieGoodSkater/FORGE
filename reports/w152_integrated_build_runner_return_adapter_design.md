# W152 Integrated Build Runner Return Adapter Design

Decision: PASS_INTEGRATED_BUILD_RETURN_DESIGN_READY__VISUAL_TESTING_BLOCKED

## Integrated Build-Return Architecture
- IDB remains the consultant-facing product.
- Build prepares the confirmed request and idempotency token.
- The approved server-side adapter owns any SuiteScript invocation or runner queue submit.
- The governed runner/internal build engine owns generated records.
- The drawer imports completed runner result JSON only after W151 guard acceptance.

## Server Adapter API Contract
- Request schema: idb.integrated-build-runner-request.v1
- Required flags: CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, QUEUE_SUBMIT_ENABLED, sandbox allowlist, operator approval, idempotency.
- False flags return queueSubmitted=false, runnerTaskId=null, resultCapture=not_started_no_submit.
- Queued runs return runnerTaskId plus pending result capture, never fake URLs.
- Completed capture must include numeric ids and supported NetSuite URLs for Customer, demo transaction, hero item, matrix/proof item, and component item.

## Polling / Result-Capture State Machine
- not_started: visual=blocked, openLinks=0
- blocked_by_flags_false: visual=blocked, openLinks=0
- ready_to_submit: visual=blocked, openLinks=0
- queued: visual=blocked, openLinks=0
- polling: visual=blocked, openLinks=0
- completed_result_available: visual=targeted_visual_can_start_after_import, openLinks=after accepted import only
- failed_or_timeout: visual=blocked, openLinks=0
- rolled_back_flags_disabled: visual=blocked, openLinks=0

## Smoke Harness
- flagsFalseNoSubmit: confirmed build request plus operator gate, all queue/write flags false
- flagsTrueQueuedPending: confirmed build request plus operator gate, flags true, no result yet
- completedCaptureImport: completed result capture from governed runner

## Visual Testing Decision
Blocked. W152 is an integration design. Do not request visual testing until Build is implemented to call the server adapter and receive completed runner result JSON.

## Validator Gates
- PASS w152_uses_w151_as_entry_condition: {"visualNetSuiteTestingRequiredNow":false,"visualTestingBlocked":true,"blockedUntil":"Build triggers governed runner execution and completed runner result returns to IDB.","broaderVisualTestingRequired":false}
- PASS w152_api_contract_requires_server_flags_and_operator_gate: {"CREATE_ENABLED":true,"GOVERNED_SANDBOX_WRITE_ENABLED":true,"QUEUE_SUBMIT_ENABLED":true,"SANDBOX_ACCOUNT_ALLOWLIST":["SANDBOX_ACCOUNT_ID"]}
- PASS w152_state_machine_blocks_visual_until_completed_import: [{"state":"not_started","drawerOpenLinks":0,"visualTesting":"blocked"},{"state":"blocked_by_flags_false","drawerOpenLinks":0,"visualTesting":"blocked"},{"state":"ready_to_submit","drawerOpenLinks":0,"visualTesting":"blocked"},{"state":"queued","runnerTaskIdRequired":true,"resultCapture":"pending_runner_completion","drawerOpenLinks":0,"visualTesting":"blocked"},{"state":"polling","runnerTaskIdRequired":true,"resultCapture":"pending_runner_completion","drawerOpenLinks":0,"visualTesting":"blocked"},{"state":"completed_result_available","requiredImportGuard":"W151","drawerOpenLinks":"after accepted import only","visualTesting":"targeted_visual_can_start_after_import"},{"state":"failed_or_timeout","drawerOpenLinks":0,"visualTesting":"blocked"},{"state":"rolled_back_flags_disabled","drawerOpenLinks":0,"visualTesting":"blocked"}]
- PASS w152_false_flag_and_queued_states_return_no_open_links: {"falseFlag":{"queueSubmitted":false,"runnerTaskId":null,"resultCapture":"not_started_no_submit","finalGeneratedNamesJson":null,"activeOpenLinks":0},"queued":{"queueSubmitted":true,"runnerTaskId":"task_w152_example_001","resultCapture":"pending_runner_completion","finalGeneratedNamesJson":null,"activeOpenLinks":0}}
- PASS w152_completed_result_shape_uses_numeric_ids_and_supported_urls: [{"id":"91201","url":"/app/common/entity/custjob.nl?id=91201"},{"id":"91202","url":"/app/accounting/transactions/salesord.nl?id=91202"},{"id":"91203","url":"/app/common/item/item.nl?id=91203"},{"id":"91204","url":"/app/common/item/item.nl?id=91204"},{"id":"91205","url":"/app/common/item/item.nl?id=91205"}]
- PASS w152_reuses_prior_runner_contracts_without_visual_request: {"w139":"idb_governed_runner_integration_contract_ready","w144":"queue_submit_pilot_ready_behind_server_flags","runnerTaskId":"task_w147_real_sandbox_001"}
- PASS w152_no_regression_boundaries_preserved: {"noDrawerWrites":true,"noDrawerSuiteScriptInvocation":true,"noDrawerTransactionWrites":true,"consultantConfirmationRequired":true,"stateAuthorityPreserved":true,"handoffParityPreserved":true,"idempotencyPreserved":true,"internalRunnerOwnership":true,"rollbackByDisablingServerFlags":true,"noActiveOpenLinksWithoutRealUrls":true}

## No Regression
- noDrawerWrites: true
- noDrawerSuiteScriptInvocation: true
- noDrawerTransactionWrites: true
- consultantConfirmationRequired: true
- stateAuthorityPreserved: true
- handoffParityPreserved: true
- idempotencyPreserved: true
- internalRunnerOwnership: true
- rollbackByDisablingServerFlags: true
- noActiveOpenLinksWithoutRealUrls: true

## Best Next Codex Prompt
Move through W153: Integrated Build Runner Return Adapter Skeleton. Implement the non-writing drawer-side adapter client boundary and NetSuite-side server adapter skeleton for the W152 integrated Build runner return path. Build should prepare the confirmed build request, idempotency token, and operator gate payload, but keep invocation disabled unless the approved server adapter endpoint and server flags are present. The server adapter skeleton should return false-flag no-submit and queued/pending fixture responses only; do not enable writes yet. Do not request visual testing. Preserve no drawer writes, no drawer SuiteScript invocation, no drawer transaction writes, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, W151 completed-result import guard, and no active Open links without real URLs. Output adapter skeleton changes, dry-run smoke harness, trace samples, W153 report, visual testing decision blocked, and best next Codex prompt.
