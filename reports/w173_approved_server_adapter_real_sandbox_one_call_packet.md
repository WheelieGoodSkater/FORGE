# W173 Approved Server Adapter Real Sandbox One-Call Execution Packet

Generated: 2026-05-17T21:41:15.654Z

Decision: PASS_REAL_SANDBOX_ONE_CALL_PACKET_READY__EXECUTION_DISABLED__VISUAL_TESTING_BLOCKED

## Real Sandbox Execution Packet

- Endpoint: POST https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID
- Server flags: CREATE_ENABLED=true, GOVERNED_SANDBOX_WRITE_ENABLED=true, QUEUE_SUBMIT_ENABLED=true
- Sandbox allowlist: SANDBOX_ACCOUNT_ID
- Operator phrase: AUTHORIZE ONE SANDBOX ADAPTER CALL
- Idempotency token: idb-build-ariat-international-apparel-accessories-apparelaccessories
- One-submit limit: 1
- Rollback flags: CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, QUEUE_SUBMIT_ENABLED
- Expected success: queued_pending, returning runnerTaskId, resultCapture.status=pending_runner_completion
- Expected adapter error: adapter_transport_error_drawer_safe
- W151 import guard: completed runner result JSON only; handoff JSON rejected; numeric ids and supported NetSuite URLs required.

## Guarded Preflight Harness

| Gate | Result |
| --- | --- |
| startsFromW172 | PASS |
| packetHookReady | PASS |
| packetReady | PASS |
| endpointReady | PASS |
| serverFlagsTrue | PASS |
| sandboxAllowlistReady | PASS |
| operatorPhraseReady | PASS |
| idempotencyReady | PASS |
| oneSubmitReady | PASS |
| rollbackReady | PASS |
| expectedOutcomesReady | PASS |
| w151ImportGuardReady | PASS |
| blockedCasesDoNotRequest | PASS |
| executionDisabled | PASS |
| noMutationOrLinks | PASS |

## Blocked Cases

- Missing endpoint: real_sandbox_one_call_packet_blocked; request sent = false.
- Missing flags: real_sandbox_one_call_packet_blocked; request sent = false.
- Missing phrase: real_sandbox_one_call_packet_blocked; request sent = false.

## Visual Testing Decision

W173 prepares the real sandbox one-call packet only. Visual testing stays blocked until the governed runner returns completed result JSON to IDB.

## Best Next Codex Prompt

```text
Move through W174: Explicitly Authorized Sandbox Adapter One-Call Execution. Use the W173 real sandbox one-call execution packet to perform exactly one approved sandbox server adapter call only if the user explicitly authorizes execution in that block with the required phrase and endpoint/flag confirmation. Submit once, capture runnerTaskId or adapter error, keep final generated names unchanged until W151 completed result import, preserve rollback by disabling server flags, and do not request visual testing until a real governed runner result returns to IDB. Output execution evidence, runnerTaskId or adapter error evidence, trace samples, W174 report, visual testing decision blocked until runner result returns, and best next Codex prompt.
```
