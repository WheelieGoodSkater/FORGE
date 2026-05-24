# W201 Report: Governed Runner Completed Result Writer For Active V4 Runner

Status: PASS

## Runner Result Writer Changes

- Patched the active v4 sandbox runner to read the configured result capture folder.
- Added server-side Customer, demo Sales Order, matrix/proof item, and component item resolution for IDB result-capture mode.
- Added completed runner result JSON writer with W151 numeric id and supported URL validation.
- Kept drawer writes disabled; the drawer only polls/imports the completed result JSON.

## Completed Runner Result JSON Contract

- Schema: `idb.completed-runner-result-json.v1`.
- Required owner: `governed_runner_internal_build_engine`.
- Required records: Customer, demo transaction/Sales Order, hero item, matrix/proof item, component item.
- Required per record: name, numeric internal id, supported NetSuite URL.

## Result Capture File Naming / Lookup Contract

- File name: `idb_completed_runner_result_<idempotencyToken>_<timestamp>.json`.
- Folder: configured result capture folder.
- Lookup: W144/W190 polling searches by `runnerTaskId` or `idempotencyToken`; the file name includes the idempotency token.

## Harness And Trace Samples

- PASS: runner reads configured result capture folder - The active v4 runner can receive the W144 result capture folder parameter.
- PASS: runner writes W151 completed result capture - Completed result JSON uses the schema and ownership metadata IDB imports.
- PASS: runner creates/resolves all required IDB records server-side - Customer, Sales Order, hero item, matrix/proof item, and component item are runner-owned.
- PASS: completed result contains numeric ids and supported NetSuite URLs - The writer validates numeric internalId values and supported record URL paths.
- PASS: result capture file is discoverable by W144 polling - File names contain the idempotency token so W144/W190 polling can find them.
- PASS: legacy DCC CSV import remains isolated from IDB result capture mode - Legacy CSV import still runs when result capture mode is not configured.
- PASS: drawer remains non-writing - The drawer/adapter polling path imports result JSON only; record creation stays in the scheduled runner.
- PASS: package exposes W201 harness - The regression harness is runnable by name.

## Visual Testing Decision

Blocked until the patched runner is uploaded, one W144 submit completes, and IDB imports the completed result JSON.

## Best Next Codex Prompt

Move through W202: Upload Active V4 Runner Result Writer And Poll Completed Result. Upload the patched scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js, run one approved W144 submit, use Check runner result to retrieve the completed result JSON, import it into IDB, then only if five Open links appear perform targeted link verification.
