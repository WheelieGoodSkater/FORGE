# W178 Build Return Poll/Refresh Control And No-Result Operator Evidence Intake

Generated: 2026-05-17T21:41:16.438Z

Decision: PASS_BUILD_RETURN_POLL_REFRESH_CONTROL_READY__VISUAL_TESTING_BLOCKED

## No-Result Evidence Review

- Operator trace available: true
- Handoff available: true
- Final naming status: not_imported
- Navigation status: using_provisional_preview_names
- Handoff schema: idb.dcc-runner-handoff-packet.v1
- Handoff mode: review_only_no_submit
- Finding: handoff_only_no_runner_task_no_completed_result_no_links

## Build-Return Poll/Refresh UX Contract

- No runnerTaskId: no Check runner result control.
- Server adapter ready: Start approved adapter call can appear, but remains disabled until one-call authorization.
- One-call authorized: Start approved adapter call can be enabled for the approved server adapter path.
- Runner task captured: Check runner result is visible and enabled.
- Completed W151-valid result: Import completed runner result is visible and enabled.
- Imported final names: targeted Open-link test can resume; broader visual testing stays blocked.

## Visible Controls By Stage

- noServerAdapterCallMade: none
- serverAdapterReady: start_approved_adapter_call
- oneCallSubmitAuthorized: start_approved_adapter_call
- runnerTaskCaptured: check_runner_result
- pollCheckAvailable: check_runner_result
- completedRunnerResultReadyToImport: import_completed_runner_result
- importedUrlsReadyForTargetedLinkTesting: targeted_open_link_test
- adapterErrorStop: collect_adapter_error_evidence

## Guarded Harness

| Gate | Result |
| --- | --- |
| noResultEvidenceShowsHandoffOnly | PASS |
| noPollControlBeforeRunnerTask | PASS |
| serverAdapterAndAuthorizationSeparated | PASS |
| checkRunnerVisibleOnlyAfterRunnerTask | PASS |
| importBlockedUntilW151CompletedResult | PASS |
| targetedLinksOnlyAfterImport | PASS |
| adapterErrorStopsSafely | PASS |
| renderSurfaceIncludesBuildReturnControls | PASS |
| traceSamplesReady | PASS |

## Visual Testing Decision

Visual testing remains blocked until completed runner result JSON is imported. After import, only targeted Open-link verification may resume.

## Trace Samples

- Data: /path/to/workspace/intelligent demo builder drawer/data/w178_build_return_poll_refresh_control.json
- Trace: /path/to/workspace/intelligent demo builder drawer/trace_samples/w178_build_return_poll_refresh_control_trace.json

## Best Next Codex Prompt

```text
Move through W179: Approved Server Adapter Result Poll Control Implementation. Use the W178 Build-return poll/refresh control contract to wire the visible Check runner result control to the approved server adapter polling path, still behind server flags, sandbox allowlist, operator approval, idempotency, and approved endpoint mode. Keep the drawer from creating records or invoking SuiteScript outside the approved server adapter path. If no runnerTaskId exists, the control remains hidden. If runnerTaskId exists, the control polls result capture and normalizes pending, completed, and adapter-error responses. Completed results must remain blocked from final-name mutation until W151 validates numeric ids and supported NetSuite URLs. Preserve no drawer writes, no drawer transaction writes, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output poll-control implementation contract, guarded harness, trace samples, W179 report, visual testing decision blocked until completed result import, and best next Codex prompt.
```
