# W265 Live Adapter Smoke Evidence And Retry Safety

## Summary

W265 adds a controlled evidence packet for the first live adapter smoke shape review. It captures actual submit and refresh response aliases, normalizes runner task/result fields, and keeps raw response evidence archived/admin-only.

## Scope

- Released W144 profile remains the only approved connected build target.
- The harness does not perform a live network call.
- Record creation remains server-owned through the approved adapter path.
- No drawer-created records, drawer transaction writes, or W144 deployment updates are introduced.

## Consultant Copy

Normal UI stays compact:

- Build submitted
- Refresh build status
- Still building
- Records ready
- Finish build
- Build stopped safely, ask admin

Normal UI must not expose endpoint, raw JSON, runner task ids, stack traces, schema names, or admin diagnostics.

## Response Shape Coverage

- Submit aliases: `task.id`, `runnerTask.id`, `runnerTaskId`, `runner_task_id`, `taskId`, `queueTaskId`.
- Refresh aliases: pending, completed, malformed/error.
- Completed payload aliases: `finalGeneratedNamesJson`, `resultCapture.finalGeneratedNamesJson`, `completedResultJson`, `generatedNamesJson`, `finalNamesJson`.

## Retry Safety

- Duplicate submit uses the existing captured build and refresh status path; it does not create a second build.
- Retry after adapter error requires a new explicit consultant/admin action.
- Refresh can repeat while pending.
- Finish build is allowed only after a W151-valid completed result.

## Validation

- W265 harness validates actual/fixture aliases, pending refresh, completed result gating, malformed/error recovery, duplicate-submit safety, adapter-error retry gating, W264 continuity, and no-write guardrails.
