# W179 Approved Server Adapter Result Poll Control Implementation

Generated: 2026-05-17T21:41:16.573Z

Decision: PASS_APPROVED_SERVER_ADAPTER_RESULT_POLL_CONTROL_READY__VISUAL_TESTING_BLOCKED

## Poll-Control Implementation Contract

- Visible control: Check runner result
- Request schema: idb.approved-server-adapter-result-poll-request.v1
- Hidden when no runnerTaskId: true
- Required gates: confirmed Build request, server flags, sandbox allowlist, operator approval, idempotency token, approved endpoint mode
- Mutation boundary: polling never commits state.dccFinalNamingResult; W151 import remains separate

## Guarded Harness

- PASS w179_no_task_hidden_no_request
- PASS w179_missing_prerequisites_block_request
- PASS w179_pending_poll_normalized_no_mutation
- PASS w179_completed_poll_w151_ready_no_mutation
- PASS w179_malformed_completed_rejected_by_w151
- PASS w179_adapter_error_stops_safely
- PASS w179_render_uses_build_return_action_boundary
- PASS w179_trace_samples_ready
- PASS w179_no_regression_preserved

## Trace Samples

- No task: poll_control_hidden_no_runner_task
- Missing prerequisites: poll_control_blocked_missing_prerequisites
- Pending: polling_pending
- Completed: poll_control_completed_result_ready_for_w151_import; W151 accepted=true
- Malformed completed: poll_control_completed_result_rejected_by_w151; W151 accepted=false
- Adapter error: poll_control_adapter_error_stopped

## W179 Report

The Check runner result control is now wired to a guarded approved-server-adapter poll model. No runnerTaskId keeps the control hidden. With a runnerTaskId, the poll request is constructed only after the confirmed Build request, server flags, sandbox allowlist, operator approval, idempotency token, and approved endpoint mode are present. Pending, completed, malformed completed, and adapter-error responses normalize through the existing W157-W162/W175 path without mutating final generated names.

## Visual Testing Decision

Blocked until completed runner result JSON is imported. Broader visual testing is not required.

## Best Next Codex Prompt

Move through W180: Completed Poll Result Import CTA Wiring And Operator Retest Packet. Use the W179 approved server adapter result poll control to connect completed poll responses to the W151 guarded import CTA without mutating final generated names until the completed runner result is imported. Keep pending, adapter-error, and malformed completed responses non-mutating, keep Open links hidden before import, and do not request visual testing until imported URLs exist. Output import CTA wiring contract, guarded harness, operator retest packet, trace samples, W180 report, visual testing decision blocked until import, and best next Codex prompt.
