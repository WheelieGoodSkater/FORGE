# W151 Runner Result JSON Import Guard, Missing-Result UX, And No-Visual-Testing Until Integrated Build Return

Status: runner_result_import_guard_and_missing_result_ux_ready

## Decision

PASS_IMPORT_GUARD_READY__VISUAL_TESTING_BLOCKED_UNTIL_INTEGRATED_BUILD_RETURN

## Import Guard Contract

- Accepts only: completed_governed_runner_result_json
- Drawer authority: import_names_and_urls_only

Rejected:

- Build handoff packets
- blank or non-object JSON
- payloads missing required Customer, demo transaction, hero item, matrix/proof item, or component item
- payloads without numeric internal ids
- payloads with unsupported NetSuite URL paths
- payloads where URL id does not match internal id
- payloads without completed runner status

## Guard Evidence

- Handoff packet: handoff_packet_rejected
- Completed runner result: completed_runner_result_accepted
- ID mismatch: completed_runner_result_required

## Missing-Result UX Copy

- Build: Visual link testing is blocked until Build triggers the governed runner, result capture returns completed runner result JSON, and IDB imports real numeric ids plus supported NetSuite URLs.
- Trace: Paste completed governed runner result JSON only. Do not paste the Build handoff JSON.
- Button: Import runner result

## Integrated Build-Return Readiness

Status: not_ready_handoff_only

- Build action calls the approved server-side adapter only after consultant confirmation and server flags.
- Server-side adapter owns SuiteScript invocation and runner queue submit.
- IDB captures runnerTaskId without generating records itself.
- IDB polls or imports result capture from the server-side path.
- Completed runner result JSON imports final names, numeric ids, and supported URLs into IDB.
- Only then do Open links and targeted visual testing become available.

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Visual testing blocked: Yes.
- Blocked until: Build triggers governed runner execution and completed runner result returns to IDB.

## Best Next Codex Prompt

Move through W152: Integrated Build Runner Return Adapter Design. Use W151 to move past handoff-only testing and design the integrated Build path where the consultant-confirmed Build action calls the approved server-side adapter behind CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, QUEUE_SUBMIT_ENABLED, sandbox allowlist, operator approval, and idempotency. The server-side adapter, not the drawer, invokes/queues the governed runner, captures runnerTaskId, polls or retrieves completed result capture, and returns completed runner result JSON to IDB for final generated names import. Do not request visual testing yet. Preserve no drawer writes, no drawer SuiteScript invocation, no drawer transaction writes, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output integrated Build-return architecture, server adapter API contract, polling/result-capture state machine, smoke harness, trace samples, W152 report, visual testing decision blocked until implementation, and best next Codex prompt.
