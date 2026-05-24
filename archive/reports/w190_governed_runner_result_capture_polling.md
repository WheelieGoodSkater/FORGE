# W190: Governed Runner Result Capture Polling To Completed JSON

Status: PASS

## Polling Contract
- Check runner result is hidden until runnerTaskId exists.
- Poll requests use the approved W144 server adapter result-capture path only.
- Pending and adapter-error responses do not mutate final generated names.
- Completed responses are import-ready only after W151 validates numeric ids, supported NetSuite URLs, and internal runner ownership.
- Open links remain hidden until the completed result is imported.

## Completed Result Envelope Shape
```json
{
  "schema": "idb.approved-server-adapter-result-envelope.v1",
  "status": "completed_runner_result_ready",
  "runnerTaskId": "numeric-or-task-string-from-W189",
  "resultCapture": {
    "status": "completed_result_capture_ready",
    "finalGeneratedNamesJson": "idb.completed-runner-result-json.v1"
  },
  "finalGeneratedNamesJson": {
    "schema": "idb.completed-runner-result-json.v1",
    "generatedRecordOwner": "governed_runner_internal_build_engine",
    "records": {
      "customer": {
        "internalId": "number",
        "url": "supported NetSuite record URL"
      },
      "demoTransaction": {
        "internalId": "number",
        "url": "supported NetSuite record URL"
      },
      "heroItem": {
        "internalId": "number",
        "url": "supported NetSuite record URL"
      },
      "matrixProofItem": {
        "internalId": "number",
        "url": "supported NetSuite record URL"
      },
      "componentItem": {
        "internalId": "number",
        "url": "supported NetSuite record URL"
      }
    }
  }
}
```

## Guarded Harness
```json
{
  "blocksWithoutRunnerTaskId": true,
  "constructsApprovedPollRequestWithoutSubmit": true,
  "pendingIsNonMutating": true,
  "completedIsW151ImportReadyOnly": true,
  "adapterErrorStopsSafely": true,
  "noActiveLinksBeforeImport": true
}
```

## Visual Testing Decision
Blocked until completed runner result JSON is imported. No Open-link visual testing is useful before W151 commit.

## Best Next Codex Prompt
Move through W191: Server Adapter Result Capture Endpoint Support And Completed JSON Return. Extend the W144 approved server adapter to support the W190 poll_runner_result_capture action, retrieve the governed runner result capture by runnerTaskId/idempotency token, and return either pending, adapter-error, or W151-valid completed runner result JSON with numeric internal ids and supported NetSuite URLs. Preserve no drawer writes, no drawer-created records, no direct SuiteScript outside the approved adapter path, internal runner ownership, rollback by disabling flags, and no active Open links until import. Output server endpoint changes, guarded harness, trace samples, W191 report, visual testing decision, and best next Codex prompt.
