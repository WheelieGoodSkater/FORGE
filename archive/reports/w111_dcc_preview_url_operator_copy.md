# W111 DCC Preview URL Builder And Operator Copy

Generated: 2026-05-17T21:41:06.684Z

Decision: PASS / PREVIEW URL OPERATOR COPY READY / COPY ONLY / NO SUBMIT

## Objective

Format DCC Suitelet preview URL/query parameters from `dccRunnerHandoffPacketV1` so an operator can manually compare the preview in Demo Command Center without IDB navigating, invoking SuiteScript, submitting, queueing, or writing.

## Operator Instructions

- Export the handoff JSON first.
- Copy the preview URL text or parameter text from the drawer.
- Open the build preview manually in the sandbox.
- Paste or compare preview-only params against the build preview fields.
- Do not submit, queue, invoke SuiteScript, or write from the drawer.
- Paste operator comparison notes back into the evidence intake.

## Ready Example

- Status: `ready_preview_copy_only`
- Mode: `copy_only_no_navigation_no_submit`
- Preview URL text is present.
- Query params are present.
- Copy-safe parameter text is present.

## Blocked Example

`blocked_preview_copy_only`: Consultant has not confirmed the working lane, scenario pack, product naming, and build mode., confirmed_lane_matches_selected_lane, exported_lane_matches_confirmed_lane, blocked_until_confirmed_handoff

## Validator Gates

| Status | Gate | Detail |
| --- | --- | --- |
| PASS | w111_runtime_preview_url_copy_present | dccPreviewUrlOperatorCopyV1 runtime and hook |
| PASS | w111_ready_copy_formats_preview_url_and_query_params | {"status":"ready_preview_copy_only","previewUrlText":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=customscript_dcc_preview&deploy=customdeploy_dcc_preview&custpage_prospect=Ariat%20International&custpage_we"} |
| PASS | w111_copy_only_no_navigation_or_submit | {"navigate":false,"open":false,"submit":false,"invoke":false} |
| PASS | w111_blocked_example_blocks_without_confirmation | {"status":"blocked_preview_copy_only","reasons":["Consultant has not confirmed the working lane, scenario pack, product naming, and build mode.","confirmed_lane_matches_selected_lane","exported_lane_matches_confirmed_lane","blocked_until_confirmed_handoff"],"action":"Resolve state authority, parity, and consultant confirmation before operator preview copy is considered ready."} |
| PASS | w111_operator_instructions_complete | ["Export the handoff JSON first.","Copy the preview URL text or parameter text from the drawer.","Open the build preview manually in the sandbox.","Paste or compare preview-only params against the build preview fields.","Do not submit, queue, invoke SuiteScript, or write from the drawer.","Paste operator comparison notes back into the evidence intake."] |
| PASS | w111_review_ui_copy_present | 
      <div class="idb-cockpit-section">
        
      <div class="idb-card idb-accent idb-w83-dcc-handoff-operator-review idb-w114-review-handoff idb-w124-build-results">
        <div class="idb-section-title">Build Handoff</div>
        <div class="idb-run-action-card idb-w114-request-summary">
          <div class="idb-status-key">What the consultant requested</div>
          <div class="idb-strong">Ariat International</div>
          <div class="idb-copy">Prepare a concise proof path for st |
| PASS | w111_trace_coverage_present | trace export and handoff export trace include preview URL copy |
| PASS | w111_no_regression_boundaries_preserved | {"w110ParityLockPreserved":true,"w92StateAuthorityPreserved":true,"w105W107PreviewOnlyApprovalPreserved":true,"noIdbWrites":true,"noSuiteScriptInvocationFromIdb":true,"noTransactionWrites":true,"hostedResolverOptionalUntilRemoteSmokeExecuted":true,"notesStoryOnly":true,"consultantConfirmationRequired":true,"dccOwnsObjectGeneration":true} |

## No Regression

- W110 parity lock preserved.
- W92 state authority preserved.
- W105-W107 preview-only approval preserved.
- No IDB writes.
- No SuiteScript invocation from IDB.
- No transaction writes.
- Hosted resolver remains optional until `remoteSmokeExecuted=true`.
- Notes remain story-only.
- Consultant confirmation remains required.
- DCC owns object generation.

## Best Next Codex Prompt

```text
Move through W112: Operator Preview Retest After Copy Helper. Produce the exact hands-on operator retest for the latest IDB drawer using W111 preview URL/operator copy: file to upload, sales request fields, expected Review copy-helper screenshot, DCC handoff JSON, trace JSON, manual DCC Suitelet preview comparison steps, operator evidence fields to paste back into IDB, scoring rubric, and stop/go criteria. Preserve W110 parity lock, W92 state authority, W105-W107 preview-only approval behavior, no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output test packet, validator gates, W112 report, and best next Codex prompt.
```
