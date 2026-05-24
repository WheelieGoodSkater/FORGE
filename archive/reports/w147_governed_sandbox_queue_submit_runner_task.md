# W147 Governed Sandbox Queue Submit Enablement And RunnerTaskId Capture

Status: runner_task_id_captured_result_capture_pending

## Decision

PASS_RUNNER_TASK_ID_CAPTURED__RESULT_CAPTURE_PENDING

## Enablement Evidence

- Adapter source: /path/to/workspace/intelligent demo builder drawer/netsuite/idb_governed_runner_adapter_w144_suitelet.js
- Script id: customscript_idb_governed_runner_adapter
- Deployment id: customdeploy_idb_governed_runner_adapter_sb
- Sandbox allowlist: SANDBOX_ACCOUNT_ID
- CREATE_ENABLED: true
- GOVERNED_SANDBOX_WRITE_ENABLED: true
- QUEUE_SUBMIT_ENABLED: true
- Operator decision: operator_approved_queue_submit
- Type-to-confirm: QUEUE GOVERNED SANDBOX RUNNER

## RunnerTaskId Evidence

- Queue submitted: true
- Runner task id: task_w147_real_sandbox_001
- Result capture status: pending_runner_completion
- Final generated names ready: false
- Active Open links: 0
- Generated record URLs returned: false
- Idempotency token: IDB-idb-build-ariat-style-ready-001-ARIAT_INTERNATIONAL-APPAREL_ACCESSORIES

## Rollback

- Set custscript_idb_queue_submit_enabled, custscript_idb_governed_sandbox_write_enabled, and custscript_idb_create_enabled back to false.
- Drawer rollback required: false

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual testing required after result-capture URLs: Yes.
- Broader visual NetSuite testing required: No.

Reason: W147 captures the governed runner task id and pending result-capture status only. Record-link visual testing waits until result capture returns real numeric ids and supported NetSuite URLs.

## Trace Samples

- Data: /path/to/workspace/intelligent demo builder drawer/data/w147_governed_sandbox_queue_submit_runner_task.json
- Trace: /path/to/workspace/intelligent demo builder drawer/trace_samples/w147_governed_sandbox_queue_submit_runner_task_trace.json

## Best Next Codex Prompt

Move through W148: Governed Runner Result Capture And Final URL Import. Use the W147 real runnerTaskId evidence to poll or import the governed runner result capture, require Customer, demo transaction, hero item, matrix/proof item, and component item to return real numeric internal ids plus supported NetSuite URLs, then import only those final generated names and URLs into IDB. Do not create records from the drawer and do not return fake record URLs. Preserve no drawer writes, no SuiteScript invocation from the drawer, no drawer transaction writes, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output result-capture contract, final generated names JSON, import evidence, trace samples, W148 report, visual testing decision, and best next Codex prompt.
