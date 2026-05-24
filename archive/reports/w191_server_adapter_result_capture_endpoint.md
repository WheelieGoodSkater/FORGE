# W191: Server Adapter Result Capture Endpoint Support And Completed JSON Return

Decision: PASS_SERVER_ADAPTER_RESULT_CAPTURE_ENDPOINT_READY__COMPLETED_JSON_RETURN

## Server Endpoint Changes
- W144 now routes `custpage_idb_action=poll_runner_result_capture` separately from queue submit.
- Polling requires runnerTaskId, idempotency token, expected completed-result schema, and result-capture folder config.
- The adapter searches the configured File Cabinet result-capture folder by runnerTaskId/idempotency token.
- Missing result returns `polling_pending`; malformed/non-JSON result returns drawer-safe `adapter_error`; valid result returns completed JSON.
- The endpoint reads result files only. It does not create records or transactions.

## Completed Envelope Shape
```json
{
  "schema": "idb.approved-server-adapter-result-envelope.v1",
  "status": "completed_runner_result_ready",
  "runnerTaskId": "task_w191_ariat_001",
  "resultCapture": {
    "status": "completed_result_capture_ready",
    "finalGeneratedNamesReady": true,
    "finalGeneratedNamesJson": "idb.completed-runner-result-json.v1"
  },
  "finalGeneratedNamesJson": {
    "schema": "idb.completed-runner-result-json.v1",
    "status": "completed",
    "runStatus": "completed",
    "generatedRecordOwner": "governed_runner_internal_build_engine",
    "records": {
      "customer": {
        "type": "customer",
        "name": "Ariat International Outdoor Retail Account",
        "internalId": "91201",
        "url": "/app/common/entity/custjob.nl?id=91201"
      },
      "demoTransaction": {
        "type": "salesorder",
        "name": "Ariat Seasonal Footwear Availability Demo Order",
        "internalId": "91202",
        "url": "/app/accounting/transactions/salesord.nl?id=91202"
      },
      "heroItem": {
        "type": "inventoryitem",
        "name": "Ariat Terrain H2O Work Boot Hero Item",
        "internalId": "91203",
        "url": "/app/common/item/item.nl?id=91203"
      },
      "matrixProofItem": {
        "type": "matrixitem",
        "name": "Ariat Core Boot Size Color Matrix",
        "internalId": "91204",
        "url": "/app/common/item/item.nl?id=91204"
      },
      "componentItem": {
        "type": "inventoryitem",
        "name": "Ariat Brown Leather Upper Component",
        "internalId": "91205",
        "url": "/app/common/item/item.nl?id=91205"
      }
    },
    "demoTransaction": {
      "type": "salesorder",
      "name": "Ariat Seasonal Footwear Availability Demo Order",
      "internalId": "91202",
      "url": "/app/accounting/transactions/salesord.nl?id=91202"
    },
    "heroItem": {
      "type": "inventoryitem",
      "name": "Ariat Terrain H2O Work Boot Hero Item",
      "internalId": "91203",
      "url": "/app/common/item/item.nl?id=91203"
    },
    "matrixItem": {
      "type": "matrixitem",
      "name": "Ariat Core Boot Size Color Matrix",
      "internalId": "91204",
      "url": "/app/common/item/item.nl?id=91204"
    },
    "componentItems": [
      {
        "type": "inventoryitem",
        "name": "Ariat Brown Leather Upper Component",
        "internalId": "91205",
        "url": "/app/common/item/item.nl?id=91205"
      }
    ]
  },
  "activeOpenLinks": 0
}
```

## Guarded Harness
```json
{
  "pendingReturnsPollingPending": true,
  "completedReturnsW151ValidJson": true,
  "malformedReturnsAdapterError": true,
  "nonJsonReturnsAdapterError": true,
  "missingIdentityBlocksSafe": true,
  "noRecordWritesFromAdapterEndpoint": true
}
```

## Visual Testing Decision
W191 makes the server adapter able to return completed JSON. Visual testing waits until IDB polls the deployed endpoint and imports W151-valid URLs.

## Best Next Codex Prompt
Move through W192: Governed Runner Result Capture Writer Contract And File Output. Use W191 server adapter polling support to define and implement the governed runner result-capture writer that, after the internal runner creates or resolves Customer, demo transaction, hero item, matrix/proof item, and component item records, writes a completed result JSON file into the configured result-capture folder named with runnerTaskId/idempotency token. Preserve internal runner ownership, numeric internal ids, supported NetSuite URLs, no drawer writes, no drawer-created records, rollback by disabling server flags, and no active Open links until W151 import. Output runner result writer contract, file naming convention, guarded harness, trace samples, W192 report, visual testing decision, and best next Codex prompt.
