# W143 Governed Sandbox Queue Enablement Design Without Write Activation

Status: queue_enablement_design_ready_not_activated

## Decision

PASS_QUEUE_ENABLEMENT_DESIGNED__NOT_ACTIVATED

## Queue Enablement Design

- Queue submit authority: netsuite_suitelet_server_side_operator_only
- Drawer authority: export_request_and_import_result_only
- Current W143 action: no task submit, no record write, no transaction write
- Disabled in W143: true

Required server-side flags:

- custscript_idb_create_enabled=T
- custscript_idb_governed_sandbox_write_enabled=T
- custscript_idb_queue_submit_enabled=T

## Server-Side Parameter Contract

- custscript_idb_create_enabled: current W143 value `F`; required before queue `T`; Master server-side create switch.
- custscript_idb_governed_sandbox_write_enabled: current W143 value `F`; required before queue `T`; Sandbox write authorization switch.
- custscript_idb_queue_submit_enabled: current W143 value `F`; required before queue `T`; Scheduled runner queue-submit switch.
- custscript_idb_sandbox_account_allowlist: current W143 value `SANDBOX_ACCOUNT_ID`; required before queue `comma-separated sandbox account ids`; Prevents accidental production queueing.
- custscript_idb_runner_script_id: current W143 value `customscript_scai_so_csv_runner`; required before queue `customscript_scai_so_csv_runner`; Existing governed runner script id.
- custscript_idb_runner_deploy_id: current W143 value `customdeploy_scai_so_csv_runner`; required before queue `customdeploy_scai_so_csv_runner`; Existing governed runner deployment id.
- custscript_idb_runner_mapping_id: current W143 value `112`; required before queue `CSV import mapping id`; Sales Order CSV import mapping.
- custscript_idb_runner_folder_id: current W143 value `345`; required before queue `File Cabinet folder id`; CSV handoff file storage.
- custscript_idb_runner_subsidiary_id: current W143 value `1`; required before queue `numeric subsidiary id`; Runner transaction context.
- custscript_idb_runner_location_id: current W143 value `7`; required before queue `numeric location id`; Runner location context.
- custscript_idb_runner_wc_search_id: current W143 value ``; required before queue `optional work center saved search id`; Manufacturing/WIP support when enabled.
- custscript_idb_result_capture_folder_id: current W143 value `not_enabled_w143`; required before queue `File Cabinet folder id`; Where runner result JSON will be written or referenced.

## Idempotency And Runner Handoff

- Idempotency required: true
- Sample token: IDB-idb-build-ariat-style-ready-001-Ariat_International-apparel_accessories
- Queue submitted now: false
- Runner task id now: null

## Result-Capture Placeholder

- Status: placeholder_not_enabled
- Required before drawer import: true
- Current active Open links: 0

## Dry-Run Harness Updates

- Keep W142 as the executable dry-run proof for operator gate validation.
- Add W143 contract checks for server-side enablement switches without changing their values.
- Assert CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, and QUEUE_SUBMIT_ENABLED remain false/not active.
- Assert scheduled runner params are shaped but not submitted.
- Assert result-capture placeholder requires real ids and URLs before drawer Open links appear.
- Assert no drawer write or SuiteScript invocation signatures are introduced.

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual NetSuite testing required after queue submit enablement: Yes.
- Broader visual NetSuite testing required: No.

Reason: W143 only designs the queue enablement switch and result-capture contract. It does not submit the runner, write records, or produce real NetSuite record URLs.

## Best Next Codex Prompt

Move through W144: Governed Sandbox Queue Submit Pilot Behind Server Flags. Use the W143 queue enablement design to implement the NetSuite-side server-flagged queue submit path behind CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, QUEUE_SUBMIT_ENABLED, sandbox allowlist, operator approval, idempotency, and result-capture prerequisites. Keep the drawer export/import only and do not add drawer writes or drawer SuiteScript invocation. If flags are false, preserve the W142/W143 dry-run no-submit behavior. If flags are true in sandbox, queue the existing governed runner and return runnerTaskId plus result-capture pending status, not fake record URLs. Output queue submit adapter changes, guarded smoke harness, trace samples, W144 report, targeted visual testing decision, and best next Codex prompt.
