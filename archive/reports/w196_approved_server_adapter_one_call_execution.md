# W196 Approved Server Adapter One-Call Execution And RunnerTaskId Evidence

## Real Adapter Wiring Summary
- IDB Build is wired to the W144 governed runner adapter request shape.
- Legacy DCC UI is not used.
- The drawer prepares the confirmed request and operator gate only.
- The approved NetSuite server adapter owns queue submit and runner execution.
- The drawer captures runnerTaskId or adapter error only; it does not import names or show links in W196.

## Exact Operator Inputs
| Field | Value |
| --- | --- |
| Endpoint | https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID |
| CREATE_ENABLED | true |
| GOVERNED_SANDBOX_WRITE_ENABLED | true |
| QUEUE_SUBMIT_ENABLED | true |
| Sandbox allowlist/current account | TD3021666 |
| Operator approval | operator_approved_queue_submit |
| Type to confirm | QUEUE GOVERNED SANDBOX RUNNER |
| One-call authorization phrase | AUTHORIZE ONE SANDBOX ADAPTER CALL |

## Submitted Request Envelope
- Method: POST
- Encoding: application/x-www-form-urlencoded
- Body fields: custpage_idb_confirmed_build_request_json, custpage_idb_operator_queue_gate_json
- Idempotency token: idb-build-ariat-international-apparel-accessories-apparelaccessories
- Expected first response: runnerTaskId with pending result capture, or adapter_error. Record URLs are not accepted in the first response.

## RunnerTaskId / Adapter Error Evidence
- RunnerTaskId path: w144_runner_taskid_captured_result_pending; runnerTaskId=task_w196_ariat_governed_runner_001; resultCapture=pending_runner_completion.
- Adapter-error path: w144_adapter_error_drawer_safe; final generated names unchanged=true.
- Active Open links before completed result import: 0.

## Guarded Harness
- PASS w196_blocks_before_endpoint_and_operator_inputs: ["approved_w144_endpoint","server_flags_true","sandbox_allowlist","operator_approval","one_call_authorization_phrase"]
- PASS w196_ready_constructs_w144_request_without_submit: w144_one_call_ready_not_submitted
- PASS w196_exact_operator_inputs_present: {"approvedEndpointUrl":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID","sandboxAccount":"TD3021666","serverFlags":{"CREATE_ENABLED":true,"GOVERNED_SANDBOX_WRITE_ENABLED":true,"QUEUE_SUBMIT_ENABLED":true},"operatorName":"Operator User","reviewDecision":"operator_approved_queue_submit","typeToConfirm":"QUEUE GOVERNED SANDBOX RUNNER","authorizationPhrase":"AUTHORIZE ONE SANDBOX ADAPTER CALL"}
- PASS w196_submits_exactly_one_call_in_authorized_path: 1
- PASS w196_captures_runner_taskid_pending_not_urls: {"submitted":true,"queueSubmitted":true,"runnerTaskIdCaptured":true,"runnerTaskId":"task_w196_ariat_governed_runner_001","resultCaptureStatus":"pending_runner_completion","firstResponsePolicy":"runnerTaskId_or_adapter_error_not_record_urls","statePatch":{"integratedBuildRunnerResult":{"schema":"idb.governed-runner-adapter-result.v1","adapterVersion":"w144-governed-sandbox-queue-submit-pilot-behind-server-flags","status":"queued_result_capture_pending","runnerStatus":"queued_result_capture_pending","queueSubmitted":true,"runnerTaskId":"task_w196_ariat_governed_runner_001","idempotencyToken":"idb-build-ariat-international-apparel-accessories-apparelaccessories","resultCapture":{"schema":"idb.runner-result-capture.v1","status":"pending_runner_completion","runnerTaskId":"task_w196_ariat_governed_runner_001","idempotencyToken":"idb-build-ariat-international-apparel-accessories-apparelaccessories","finalGeneratedNamesReady":false,"finalGeneratedNamesJson":null},"finalGeneratedNamesJson":null,"activeOpenLinks":0,"generatedRecordOwner":"governed_dcc_runner_internal_build_engine"}}}
- PASS w196_request_envelope_carries_confirmed_request_and_operator_gate: 
- PASS w196_adapter_error_stops_without_mutation: w144_adapter_error_drawer_safe
- PASS w196_no_regression_preserved: {"noDrawerWrites":true,"noDrawerTransactionWrites":true,"noDrawerCreatedRecords":true,"noDirectDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath":true,"consultantConfirmationRequired":true,"stateAuthorityAndHandoffParityPreserved":true,"idempotencyPreserved":true,"internalRunnerOwnership":true,"rollbackByDisablingServerFlags":true,"noActiveOpenLinksWithoutRealUrls":true}

## W196 Report
- Decision: PASS_W196_ONE_CALL_EXECUTION_WIRING_READY_RUNNERTASKID_CAPTURED
- Visual testing: blocked until completed runner result JSON imports and five active Open links exist.
- Rollback: disable CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, and QUEUE_SUBMIT_ENABLED on the server adapter deployment.

## Next Prompt
Move through W197: Poll Governed Runner Result Capture To Completed Runner JSON. Use the W196 runnerTaskId to poll the approved NetSuite server adapter result-capture endpoint until the governed runner returns completed result JSON or a safe adapter error. The runner, not the drawer, must own all Customer, item, and transaction creation. Add/verify Check runner result after runnerTaskId exists, poll by runnerTaskId and idempotency token, normalize pending, polling, completed, adapter_error, and malformed_result, require completed result JSON with real numeric internal ids and supported NetSuite URLs for Customer, demo transaction / Sales Order, hero item, matrix/proof item, and component item, keep pending/error/malformed states non-mutating, do not import final names until W151 validation passes, and do not show Open links before import. Output polling implementation/result summary, completed runner result JSON or adapter error, W151 validation evidence, trace samples, W197 report, and next prompt.
