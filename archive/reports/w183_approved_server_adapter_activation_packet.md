# W183 Approved Server Adapter Activation Packet And One-Call Readiness

Generated: 2026-05-17T21:41:17.038Z

Decision: PASS_APPROVED_SERVER_ADAPTER_ACTIVATION_PACKET_READY__NO_SUBMIT__VISUAL_TESTING_BLOCKED

## Activation Packet

- Endpoint: https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=customscript_idb_governed_runner_adapter&deploy=customdeploy_idb_governed_runner_adapter
- Server flags: {"CREATE_ENABLED":true,"GOVERNED_SANDBOX_WRITE_ENABLED":true,"QUEUE_SUBMIT_ENABLED":true}
- Sandbox allowlist: {"sandboxOnly":true,"currentSandboxAccount":"SANDBOX_ACCOUNT_ID","sandboxAccountAllowlist":["SANDBOX_ACCOUNT_ID"],"currentAccountAllowed":true}
- Operator approval: operator_approved_queue_submit
- Idempotency token: idb-w183-ariat-international-one-call-001
- One-submit limit: 1
- Rollback flags: CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, QUEUE_SUBMIT_ENABLED

## Expected First Response

The first approved server adapter response must be runnerTaskId plus pending result capture or adapter error. It must not return fake record URLs or mutate final generated names.

## Result-Capture Polling Handoff

- Runner task source: approved_server_adapter_response
- Next control after runnerTaskId: check_runner_result
- Completed result gate: W151_completed_runner_result_import_guard
- Import policy: do_not_mutate_final_names_until_w151_valid_import

## Guarded Harness

- PASS w183_blocked_without_prereqs_no_request
- PASS w183_ready_only_with_all_activation_prereqs
- PASS w183_endpoint_configured
- PASS w183_server_flags_confirmed
- PASS w183_sandbox_allowlist_confirmed
- PASS w183_operator_approval_captured
- PASS w183_idempotency_token_generated
- PASS w183_one_submit_limit_enforced
- PASS w183_rollback_flags_ready
- PASS w183_first_response_task_or_error_not_urls
- PASS w183_result_capture_polling_handoff_ready
- PASS w183_no_final_name_mutation
- PASS w183_no_open_links_before_import
- PASS w183_visual_testing_blocked

## W183 Report

W183 converts the W182 no-call evidence into an exact activation packet for the next Build-owned server adapter step. The packet is ready in harness, but W183 does not submit, does not create records, does not invoke SuiteScript from the drawer, and does not expose Open links. W151 remains the only import authority for completed runner result JSON.

## Visual Testing Decision

Blocked. No Open-link visual testing until completed runner result JSON is imported.

## Best Next Codex Prompt

Move through W184: Explicit One-Call Server Adapter Authorization And Submission Gate. Use the W183 activation packet to add the final execution gate for exactly one approved sandbox server adapter call from Build. Require the operator phrase AUTHORIZE ONE SANDBOX ADAPTER CALL, confirmed endpoint, server flags true, sandbox allowlist, operator approval, idempotency token, one-submit limit, rollback flags, and W151 import guard. Default remains no-submit; only if explicitly authorized should the approved server adapter be called once, returning runnerTaskId plus pending result capture or adapter error, not record URLs. Do not create records from the drawer, do not invoke SuiteScript outside the approved server adapter path, do not mutate final names, and do not request Open-link visual testing until completed runner result JSON is imported. Output authorization/submission gate, guarded harness, trace samples, W184 report, visual testing decision blocked, and best next Codex prompt.
