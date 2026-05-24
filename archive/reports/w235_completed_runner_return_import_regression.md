# W235 Completed Runner Return Import Regression

## Diagnosis

The supplied trace shows the runner task was submitted and later polled, but the drawer state kept an empty placeholder resultCapture with null records while the UI moved into a completed/bring-back-records state.

## Fix Contract

- Preserve the adapter poll resultCapture on the drawer state.
- Require an actual completed result object before declaring completed-result readiness.
- Commit top-level final generated names only after W151 accepts numeric IDs, supported NetSuite URLs, and runner ownership.
- Route completed-but-rejected payloads to simple consultant failure copy and admin/debug diagnostics instead of an endless Bring back records loop.
- Preserve no drawer-created records, no drawer transaction writes, and no direct SuiteScript outside W144.

## Harness Results

- PASS w235_normalization_preserves_raw_result_capture: normalizeApprovedServerAdapterTransportResponseV1 now carries the adapter resultCapture forward instead of dropping it.
- PASS w235_ready_detection_requires_actual_completed_payload: FORGE no longer treats finalGeneratedNamesJsonReady text/status flags as record-link evidence.
- PASS w235_state_patch_preserves_invalid_payload_for_admin_debug: A completed-but-rejected poll response is retained with W151 diagnostics while top-level Open-link import stays blocked.
- PASS w235_check_status_import_uses_poll_normalized_payload: Check status now keeps the poll payload and traces the exact import status.
- PASS w235_rejected_completed_payload_routes_to_admin_safe_failure_copy: Completed payloads that fail the import guard stop the normal consultant loop instead of asking for repeated Bring back records clicks.
- PASS w235_no_open_links_before_valid_import_preserved: Top-level finalGeneratedNamesJson is committed only after W151-valid IDs, URLs, and runner owner.

Result: 6/6
