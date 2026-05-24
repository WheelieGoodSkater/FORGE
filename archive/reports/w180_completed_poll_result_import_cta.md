# W180 Completed Poll Result Import CTA Wiring And Operator Retest Packet

Generated: 2026-05-17T21:41:16.685Z

Decision: PASS_COMPLETED_POLL_RESULT_IMPORT_CTA_READY__VISUAL_TESTING_BLOCKED

## Import CTA Wiring Contract

- CTA: Import completed runner result
- Appears only after: approved server adapter poll returns completed result; W151 accepts numeric internal ids; W151 accepts supported NetSuite URLs; generatedRecordOwner is governed_runner_internal_build_engine
- Remains blocked for: pending poll response; adapter error; malformed completed result; missing runnerTaskId; Build handoff JSON
- Mutation boundary: CTA readiness does not mutate state.dccFinalNamingResult; import commit remains the separate action.

## Guarded Harness

- PASS w180_pending_does_not_enable_import
- PASS w180_adapter_error_does_not_enable_import
- PASS w180_malformed_completed_rejected
- PASS w180_no_task_does_not_enable_import
- PASS w180_completed_enables_import_cta_only
- PASS w180_commit_preview_ready_but_not_applied
- PASS w180_operator_retest_packet_ready
- PASS w180_trace_samples_ready
- PASS w180_no_regression_preserved

## Operator Retest Packet

Do not run NetSuite Open-link visual testing yet.

1. Open IDB Build tab.
2. Confirm Check runner result is visible only after runnerTaskId exists.
3. Click Check runner result.
4. For pending result: verify Import completed runner result is not enabled and Open links remain hidden.
5. For adapter error: verify the drawer stops safely and asks for operator evidence.
6. For malformed completed result: verify W151 rejects it and Open links remain hidden.
7. For completed W151-valid result: verify Import completed runner result appears.
8. Do not click or screenshot NetSuite record Open links until after the completed result is imported.

Screenshots to send back:
- Build tab with runnerTaskId captured and Check runner result visible.
- Build tab after completed poll with Import completed runner result visible.
- Any error or malformed-result message if the poll does not complete cleanly.

Not needed yet:
- Customer record page screenshot
- Sales Order page screenshot
- Item record page screenshots
- Broad visual regression sweep

## Trace Samples

- Pending: completed_poll_result_import_cta_blocked
- Completed: completed_poll_result_import_cta_ready
- Malformed completed: completed_poll_result_import_cta_blocked
- Adapter error: completed_poll_result_import_cta_blocked
- No task: completed_poll_result_import_cta_blocked

## W180 Report

Completed poll responses now connect to a W151-owned import CTA. Pending, adapter-error, missing-task, and malformed completed responses keep final generated names unchanged and keep Open links hidden. A W151-valid completed response makes the import CTA ready and previews the W176 commit path, but the state is not mutated until the operator import action.

## Visual Testing Decision

Blocked until completed runner result JSON is imported. Broader visual testing is not required.

## Best Next Codex Prompt

Move through W181: Completed Runner Result Import Commit Operator Flow. Use the W180 completed poll result import CTA to commit final generated names into IDB only after the operator chooses the W151-validated completed runner result import. Keep pending, adapter-error, malformed completed, and handoff JSON non-mutating; after commit, Build and Run may show imported names and verified Open links. Do not create records from the drawer and do not invoke SuiteScript outside the approved server adapter path. Output import commit operator flow, guarded harness, trace samples, W181 report, visual testing decision targeted-only after imported URLs exist, and best next Codex prompt.
