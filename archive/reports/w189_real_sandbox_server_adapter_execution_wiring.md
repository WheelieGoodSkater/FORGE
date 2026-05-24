# W189 Real Sandbox Server Adapter Execution Wiring And RunnerTaskId Capture

Decision: real_sandbox_server_adapter_execution_wiring_ready

## Real Execution Wiring Contract

- Target adapter: W144 governed runner adapter.
- W153 fixture-only skeleton is excluded from real queue submit.
- The drawer configures the approved endpoint, sends confirmed request and operator gate, captures runnerTaskId, and imports completed results only after W151.
- W144/server-side runner owns queue submit and generated records.

## Adapter Request JSON Shape

- Method: POST
- Content-Type: application/x-www-form-urlencoded;charset=UTF-8
- Fields: custpage_idb_confirmed_build_request_json, custpage_idb_operator_queue_gate_json
- Idempotency token: idb-build-ariat-international-apparel-accessories-apparelaccessories

## Operator Setup Checklist

- Deploy the W144 governed runner adapter Suitelet in sandbox.
- Set CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, and QUEUE_SUBMIT_ENABLED true only on the sandbox adapter deployment.
- Configure runner script id, deployment id, mapping id, folder id, subsidiary id, location id, optional work center search id, and result capture folder id on the W144 deployment.
- Paste the approved W144 Suitelet endpoint into IDB Build.
- Enter the sandbox account id in the allowlist and current account fields.
- Set operator approval to approved and type QUEUE GOVERNED SANDBOX RUNNER.
- Type AUTHORIZE ONE SANDBOX ADAPTER CALL and confirm the endpoint.
- Submit once, then use Check runner result only after runnerTaskId is captured.

## Gates

| Gate | Result |
| --- | --- |
| Confirmed Build request | PASS |
| Approved W144 endpoint URL | PASS |
| Server flags true | PASS |
| Sandbox account allowlist | PASS |
| Operator approval gate | PASS |
| One-call authorization phrase | PASS |
| Idempotency token | PASS |
| One-submit limit unused | PASS |
| Rollback by disabling server flags | PASS |
| W151 completed-result import guard | PASS |

## RunnerTaskId Capture Path

- Submitted in harness: true
- Queue submitted: true
- RunnerTaskId captured: task_w189_idb-build-ariat-international-apparel-accessories-apparelaccessories
- Result capture status: pending_runner_completion
- Final generated names remain unmutated until W151 import.

## Result Polling / Import Path

- Check runner result appears only after runnerTaskId exists.
- Completed result import is still W151-gated.
- Open links stay hidden until completed result JSON imports.

## Visual Testing Decision

Blocked until completed runner result JSON is imported. No Open-link visual testing yet.

## Trace Samples

- /path/to/workspace/intelligent demo builder drawer/trace_samples/w189_real_sandbox_server_adapter_execution_wiring_trace.json

## Best Next Codex Prompt

Move through W190: Governed Runner Result Capture Polling To Completed JSON. Use the W189 real W144 server adapter execution wiring and captured runnerTaskId to implement the approved server-adapter polling path that checks result capture until completed runner result JSON is available. Keep pending and adapter-error states non-mutating, require W151-valid numeric internal ids and supported NetSuite URLs before import, preserve no drawer writes, no drawer transaction writes, no drawer-created records, no direct SuiteScript outside the approved server adapter path, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links before import. Output polling contract, completed result envelope shape, guarded harness, trace samples, W190 report, visual testing decision blocked until completed result import, and best next Codex prompt.
