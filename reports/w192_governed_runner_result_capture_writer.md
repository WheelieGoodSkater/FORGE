# W192: Governed Runner Writes Real Sandbox Records And Stores Result Capture

Decision: PASS_RUNNER_RESULT_CAPTURE_WRITER_READY__AWAIT_RUNNER_CALL_SITE

## Runner Result Writer Contract
- The W192 writer is a NetSuite-side module for the governed internal runner, not the drawer.
- It accepts only completed create/resolve output with Customer, demo transaction, hero item, matrix/proof item, and component item.
- It requires numeric internal ids and supported NetSuite record URLs before saving result capture JSON.
- It writes a File Cabinet JSON capture that W191 can poll by runnerTaskId or idempotency token.

## File Naming Convention
- Pattern: idb-result-${runnerTaskId || runnerTaskId-pending}-${idempotencyToken}.json
- Example: idb-result-task_w192_ariat_001-IDB-idb-build-ariat-style-ready-001-ARIAT_INTERNATIONAL-APPAREL_ACCESSORIES.json

## Current Runner Finding
- Existing runner: /path/to/workspace/Demo Command Center V4 Master/suitelet_runtime_package_current/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js
- Remaining live call site: Wire the actual runner or a post-CSV result resolver to call writeCompletedRunnerResult only after the Sales Order internal id is resolvable.

## Guarded Harness
```json
{
  "validWriteSaved": true,
  "placeholderIdsRejected": true,
  "missingDemoTransactionRejected": true,
  "absoluteNetSuiteUrlsSupported": true,
  "w191PollReadsWrittenFile": true,
  "noDrawerWrites": true,
  "noDrawerCreatedRecords": true,
  "noActiveOpenLinksBeforeImport": true
}
```

## Visual Testing Decision
W192 creates the server-side result writer and proves W191 can read it. Visual testing starts only after the actual runner/resolver calls this writer with real sandbox IDs and IDB imports the result.

## Best Next Codex Prompt
Move through W193: Wire W192 Result Writer Into Governed Runner Completion Resolver. Use the W192 server-side result writer and W191 poll endpoint to connect the actual governed runner completion path: after the existing runner creates/resolves Customer, hero item, matrix/proof item, component item, and after the Sales Order CSV import can be resolved to a real numeric transaction internal id, call writeCompletedRunnerResult into the configured result-capture folder. Add or reuse a post-run resolver if the scheduled runner cannot synchronously know the Sales Order id. Preserve server-side-only writes, internal runner ownership, no drawer writes, W151 import guard, and no Open links before completed import. Output runner call-site changes, Sales Order resolution strategy, deployment parameters, guarded harness, trace samples, W193 report, visual testing decision, and best next Codex prompt.
