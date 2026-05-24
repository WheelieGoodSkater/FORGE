# W158 Approved Server Adapter Dry-Run Fixture Poll Cycle

Decision: PASS_DRY_RUN_POLL_CYCLE_READY__VISUAL_TESTING_BLOCKED

## Dry-Run Poll-Cycle Contract
- Mode: harness_only_no_submit.
- Request constructed by approved boundary: true.
- Runner task fixture: fixture_w158_idb-build-ariat-international-apparel-accessories-apparelaccessories_001.
- Sequence: false_flag_no_submit -> queued_pending -> polling_pending -> polling_pending -> completed_result_awaiting_w151_import -> adapter_transport_error_drawer_safe.
- Completed result owner: W151 completed runner result import guard.

## Guarded Harness
- All responses keep activeOpenLinks=0: true.
- Completed step awaits W151 import: true.
- Error recovery drawer-safe: true.
- Drawer names not mutated: true.

## Visual Testing Decision
Blocked. W158 models a harness-only dry-run poll cycle. Completed runner output still waits for W151 import before IDB can show links.

## Validator Gates
- PASS w158_starts_from_w157_response_normalization_ready: PASS_RESPONSE_NORMALIZATION_READY__VISUAL_TESTING_BLOCKED
- PASS w158_poll_cycle_hook_and_ui_ready: 
      <div class="idb-cockpit-section">
        
      <div class="idb-card idb-accent idb-w83-dcc-handoff-operator-review idb-w114-review-handoff idb-w124-build-results">
        <div class="idb-section-title">Build Handoff</div>
        <div class="idb-run-action-card idb-w114-request-summary">
          <div class="idb-status-key">What the consultant requested</div>
          <div class="idb-strong">Ariat International</div>
          <div class="idb-copy">Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.</div>
        </div>
        <div class="idb-status-strip">
          <div class="idb-
- PASS w158_cycle_sequence_covers_no_submit_queue_poll_complete_error: ["false_flag_no_submit","queued_pending","polling_pending","polling_pending","completed_result_awaiting_w151_import","adapter_transport_error_drawer_safe"]
- PASS w158_cycle_uses_idempotent_runner_task_fixture: fixture_w158_idb-build-ariat-international-apparel-accessories-apparelaccessories_001
- PASS w158_repeated_polling_remains_pending_no_links: [{"schema":"idb.integrated-build-approved-server-adapter-response-normalization.v1","status":"polling_pending","label":"Polling: result pending","message":"Polling is still waiting for governed runner result capture.","rawStatus":"poll_response_pending","queueSubmitted":true,"runnerTaskId":"fixture_w158_idb-build-ariat-international-apparel-accessories-apparelaccessories_001","resultCaptureStatus":"pending_runner_completion","pollAttempted":true,"finalGeneratedNamesJsonReady":false,"finalGeneratedNamesJson":null,"importGuard":"W151 completed runner result JSON guard owns final generated names import before drawer navigation links become active.","activeOpenLinks":0,"visualTestingBlocked":true,"noRegression":{"noDrawerWrites":true,"noDrawerTransactionWrites":true,"noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath":true,"noActiveOpenLinksWithoutRealUrls":true,"internalRunnerOwnership":true,"rollbackByDisablingServerFlags":true}},{"schema":"idb.integrated-build-approved-server-adapter-response-normalization.v1","status":"polling_pending","label":"Polling: result pending","message":"Polling is still waiting for governed runner result capture.","rawStatus":"poll_response_pending","queueSubmitted":true,"runnerTaskId":"fixture_w158_idb-build-ariat-international-apparel-accessories-apparelaccessories_001","resultCaptureStatus":"pending_runner_completion","pollAttempted":true,"finalGeneratedNamesJsonReady":false,"finalGeneratedNamesJson":null,"importGuard":"W151 completed runner result JSON guard owns final generated names import before drawer navigation links become active.","activeOpenLinks":0,"visualTestingBlocked":true,"noRegression":{"noDrawerWrites":true,"noDrawerTransactionWrites":true,"noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath":true,"noActiveOpenLinksWithoutRealUrls":true,"internalRunnerOwnership":true,"rollbackByDisablingServerFlags":true}}]
- PASS w158_completed_result_awaits_w151_import_no_mutation: {"schema":"idb.integrated-build-approved-server-adapter-response-normalization.v1","status":"completed_result_awaiting_w151_import","label":"Completed result waiting for import","message":"Completed runner result JSON is present, but W151 import guard must validate it before Open links appear.","rawStatus":"completed_runner_result_ready","queueSubmitted":true,"runnerTaskId":"fixture_w158_idb-build-ariat-international-apparel-accessories-apparelaccessories_001","resultCaptureStatus":"completed_result_capture_ready","pollAttempted":true,"finalGeneratedNamesJsonReady":true,"finalGeneratedNamesJson":{"schema":"idb.completed-runner-result-json.v1","status":"completed","generatedRecordOwner":"governed_runner_internal_build_engine","records":{"customer":{"type":"customer","name":"Ariat International Outdoor Retail Account","internalId":501234,"url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=501234"},"demoTransaction":{"type":"salesorder","name":"Ariat Seasonal Footwear Availability Demo Order","internalId":601234,"url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234"},"heroItem":{"type":"inventoryitem","name":"Ariat Terrain H2O Work Boot Hero Item","internalId":701234,"url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234"},"matrixProofItem":{"type":"matrixitem","name":"Ariat Core Boot Size Color Matrix","internalId":701235,"url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235"},"componentItem":{"type":"inventoryitem","name":"Ariat Brown Leather Upper Component","internalId":701236,"url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236"}}},"importGuard":"W151 completed runner result JSON guard owns final generated names import before drawer navigation links become active.","activeOpenLinks":0,"visualTestingBlocked":true,"noRegression":{"noDrawerWrites":true,"noDrawerTransactionWrites":true,"noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath":true,"noActiveOpenLinksWithoutRealUrls":true,"internalRunnerOwnership":true,"rollbackByDisablingServerFlags":true}}
- PASS w158_error_recovery_drawer_safe: {"schema":"idb.integrated-build-approved-server-adapter-response-normalization.v1","status":"adapter_transport_error_drawer_safe","label":"Adapter response error","message":"The adapter response reported an error. The drawer keeps generated names and Open links unchanged.","rawStatus":"adapter_error","queueSubmitted":false,"runnerTaskId":"fixture_w158_idb-build-ariat-international-apparel-accessories-apparelaccessories_001","resultCaptureStatus":"adapter_error","pollAttempted":true,"finalGeneratedNamesJsonReady":false,"finalGeneratedNamesJson":null,"importGuard":"W151 completed runner result JSON guard owns final generated names import before drawer navigation links become active.","activeOpenLinks":0,"visualTestingBlocked":true,"noRegression":{"noDrawerWrites":true,"noDrawerTransactionWrites":true,"noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath":true,"noActiveOpenLinksWithoutRealUrls":true,"internalRunnerOwnership":true,"rollbackByDisablingServerFlags":true}}
- PASS w158_visual_testing_blocked_and_no_regression: {"noDrawerWrites":true,"noDrawerTransactionWrites":true,"noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath":true,"consultantConfirmationRequired":true,"stateAuthorityAndHandoffParityPreserved":true,"idempotencyPreserved":true,"internalRunnerOwnership":true,"rollbackByDisablingServerFlags":true,"noActiveOpenLinksWithoutRealUrls":true}

## No Regression
- noDrawerWrites: true
- noDrawerTransactionWrites: true
- noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: true
- consultantConfirmationRequired: true
- stateAuthorityAndHandoffParityPreserved: true
- idempotencyPreserved: true
- internalRunnerOwnership: true
- rollbackByDisablingServerFlags: true
- noActiveOpenLinksWithoutRealUrls: true

## Best Next Codex Prompt
Move through W159: Integrated Build Harness State Machine And Result Import Handoff. Use the W158 dry-run poll-cycle contract to promote the harness-only Build states into a single drawer state machine: blocked, no-submit, queued, polling, completed-awaiting-W151-import, imported, and error-recoverable. Keep real invocation disabled by default, do not enable real writes, do not create records from the drawer, do not invoke SuiteScript from the drawer outside the approved server adapter path, and do not request visual testing. Preserve W151 completed-result import guard, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output Build state-machine contract, guarded harness, trace samples, W159 report, visual testing decision blocked, and best next Codex prompt.
