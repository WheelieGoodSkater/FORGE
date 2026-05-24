# W145 Sandbox Deployment Packet For Server-Flagged Queue Submit Pilot

Status: sandbox_deployment_packet_ready_default_flags_false

## Decision

PASS_SANDBOX_DEPLOYMENT_PACKET_READY__DEFAULT_FLAGS_FALSE

## Deployment Packet

- Adapter source: /path/to/workspace/intelligent demo builder drawer/netsuite/idb_governed_runner_adapter_w144_suitelet.js
- Script type: Suitelet
- Script id: customscript_idb_governed_runner_adapter
- Deployment id: customdeploy_idb_governed_runner_adapter_sb
- Audience: administrator_or_operator_role_only
- Default CREATE_ENABLED: false
- Default GOVERNED_SANDBOX_WRITE_ENABLED: false
- Default QUEUE_SUBMIT_ENABLED: false

## Script And Deployment Parameters

- custscript_idb_create_enabled: checkbox; default=false; requiredForSubmit=true
- custscript_idb_governed_sandbox_write_enabled: checkbox; default=false; requiredForSubmit=true
- custscript_idb_queue_submit_enabled: checkbox; default=false; requiredForSubmit=true
- custscript_idb_sandbox_account_allowlist: free-form text; default=SANDBOX_ACCOUNT_ID; requiredForSubmit=true
- custscript_idb_runner_script_id: free-form text; default=customscript_scai_so_csv_runner; requiredForSubmit=true
- custscript_idb_runner_deploy_id: free-form text; default=customdeploy_scai_so_csv_runner; requiredForSubmit=true
- custscript_idb_runner_mapping_id: free-form text; default=112; requiredForSubmit=true
- custscript_idb_runner_folder_id: free-form text; default=345; requiredForSubmit=true
- custscript_idb_runner_subsidiary_id: free-form text; default=1; requiredForSubmit=true
- custscript_idb_runner_location_id: free-form text; default=7; requiredForSubmit=true
- custscript_idb_runner_wc_search_id: free-form text; default=; requiredForSubmit=false
- custscript_idb_result_capture_folder_id: free-form text; default=678; requiredForSubmit=true

## Upload Checklist

- Upload netsuite/idb_governed_runner_adapter_w144_suitelet.js to the sandbox File Cabinet.
- Create or update the Suitelet script record using script id customscript_idb_governed_runner_adapter.
- Create or update sandbox deployment customdeploy_idb_governed_runner_adapter_sb for administrator/operator access only.
- Add all W145 script/deployment parameters exactly as listed in requiredScriptParameters.
- Set CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, and QUEUE_SUBMIT_ENABLED to false by default.
- Set the sandbox account allowlist to the current sandbox account only.
- Set runner script/deployment ids to the existing governed runner, not to a drawer script.
- Set mapping, folder, subsidiary, location, optional work center search, and result capture folder parameters.
- Run the first smoke with the approved operator gate while flags remain false.
- Confirm the response has queueSubmitted=false, runnerTaskId=null, resultCapture not_started_no_submit, and zero active Open links.

## Operator Test Data

- Confirmed request schema: idb.confirmed-build-request.v1
- Prospect: Ariat International
- Approved gate decision: operator_approved_queue_submit
- Type-to-confirm: QUEUE GOVERNED SANDBOX RUNNER
- Negative gate decision: dry_run_reviewed_no_submit

## Rollback Plan

- Immediately set custscript_idb_queue_submit_enabled to false.
- Set custscript_idb_governed_sandbox_write_enabled to false.
- Set custscript_idb_create_enabled to false.
- If needed, inactivate customdeploy_idb_governed_runner_adapter_sb.
- Do not modify the IDB drawer because it remains export/import only.
- Capture the adapter response, NetSuite execution log, runner task status, idempotency token, and operator gate JSON.
- Keep imported drawer names as Link pending unless result capture later returns real numeric ids and supported URLs.

## Targeted Visual Test Plan

- Visual NetSuite testing required now: No.
- Start condition: Only start after the deployed adapter returns queueSubmitted=true and a real non-placeholder runnerTaskId.
- Broader visual NetSuite testing required: No.

- Open the NetSuite scheduled script/task status for the returned runnerTaskId.
- Verify the task belongs to the governed runner/internal build engine, not the drawer.
- Wait for result capture to return final generated names with numeric internal ids and supported NetSuite URLs.
- Import the result JSON into IDB Trace > Final generated names import.
- Confirm Build and Run show active Open only for records with real URLs.
- Click Customer, demo transaction, hero item, matrix/proof item, and component Open links.
- Confirm each link lands on an actual NetSuite record page and not a Notice, Error, placeholder id, or unsupported path.

## Trace Samples

- Data: /path/to/workspace/intelligent demo builder drawer/data/w145_sandbox_deployment_packet_queue_submit_pilot.json
- Trace: /path/to/workspace/intelligent demo builder drawer/trace_samples/w145_sandbox_deployment_packet_queue_submit_pilot_trace.json

## Best Next Codex Prompt

Move through W146: Sandbox Upload And Flags-False Deployment Smoke. Use the W145 deployment packet to upload/deploy the W144 NetSuite-side adapter with all write/queue flags false, then run an operator dry-run smoke proving the adapter accepts the confirmed IDB request and operator evidence but returns queueSubmitted=false, runnerTaskId=null, resultCapture not_started_no_submit, and no active Open links. Do not enable writes or queue submit yet. Preserve no drawer writes, no SuiteScript invocation from the drawer, no drawer transaction writes, consultant confirmation, state authority and handoff parity, no-submit rollback, internal runner ownership, sandbox allowlist, idempotency, and no active Open links without real URLs. Output flags-false deployment evidence, operator test data, trace samples, W146 report, visual testing decision, and best next Codex prompt.
