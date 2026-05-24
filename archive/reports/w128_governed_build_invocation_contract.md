# W128 Governed Build Invocation Contract And Sandbox Preview Bridge

Status: governed_build_invocation_contract_ready

Decision: PASS / GOVERNED BUILD INVOCATION CONTRACT READY

## Invocation Contract

- Source: drawer_exported_build_handoff
- Executor: internal_build_engine
- Default mode: sandbox_preview_no_submit
- Generated record owner: internal_build_engine
- Drawer writes: disabled
- Drawer SuiteScript invocation: disabled
- Drawer transaction writes: disabled

## Required Gates

- sales_request_complete: prospect, website, business pain, requested proof, decision criteria, timeline, competitor, and website evidence are present
- demo_path_confirmed: consultant confirmed the selected lane, proof anchor, and demo path
- handoff_exported: build handoff JSON export exists with exported lane, scenario, source request, and state authority
- operator_review_ready: operator has the exported handoff, trace sample, sandbox preview params, and no-submit instructions
- no_state_mismatch: recommended, selected, confirmed, and exported lane/proof path are aligned

## Sandbox Preview / Run Parameters

- Schema: idb.internal-build-engine.preview-run-params.v1
- Mode: sandbox_preview_no_submit
- Prospect: Ariat International
- Family/scenario: apparelAccessories / Style-to-Availability Readiness
- Submit allowed: false
- Record writes allowed: false
- Transaction writes allowed: false

## No-Submit Rollback

- previewCancel: Close the sandbox preview/run without submitting; keep the drawer session and exported handoff unchanged.
- operatorReject: Mark operator review as rejected, preserve the handoff and trace files, and return to Build without importing final names.
- stateMismatch: Block preview/run, correct the drawer state authority mismatch, re-confirm the demo path, and export a new handoff.
- partialEngineFailure: Internal build engine returns preview_failed with no created record ownership claim and no final generated names import.
- drawerRollback: Drawer clears only imported result state when the consultant chooses Clear final generated names; it never deletes or rolls back NetSuite records.

## Result JSON Expected Shape

- Schema: idb.internal-build-engine.result.v1
- Allowed statuses: preview_complete, preview_failed, operator_rejected, state_mismatch_blocked
- Required top-level fields: schema, status, runId, runMode, sourceHandoffId, prospect, familyKey, scenario, generated, displayObjects, warnings, errors, ownership, rollback, importHandoff

## Final Generated Names Import Handoff

- Source: internal_build_engine_result_json
- Target drawer state: dccFinalNamingResult
- Import mode: result JSON only
- Drawer follow-up writes: disabled

## Visual NetSuite Testing

- Required now: No. W128 defines and validates the invocation contract, parameter shape, rollback rules, and import handoff only. There is no visible NetSuite UI change and no live sandbox submission.

## Validator Gates

- PASS: w128_invocation_contract_ready - idb.w128-governed-build-invocation-contract.v1
- PASS: w128_required_readiness_gates_present - ["sales_request_complete","demo_path_confirmed","handoff_exported","operator_review_ready","no_state_mismatch"]
- PASS: w128_sandbox_preview_run_params_shape_ready - {"submitAllowed":false,"recordWritesAllowed":false,"transactionWritesAllowed":false,"suiteScriptInvocationFromDrawerAllowed":false,"operatorReviewRequired":true,"noSubmitRollbackRequired":true}
- PASS: w128_no_submit_rollback_defined - {"previewCancel":"Close the sandbox preview/run without submitting; keep the drawer session and exported handoff unchanged.","operatorReject":"Mark operator review as rejected, preserve the handoff and trace files, and return to Build without importing final names.","stateMismatch":"Block preview/run, correct the drawer state authority mismatch, re-confirm the demo path, and export a new handoff.","partialEngineFailure":"Internal build engine returns preview_failed with no created record ownership claim and no final generated names import.","drawerRollback":"Drawer clears only imported result state when the consultant chooses Clear final generated names; it never deletes or rolls back NetSuite records."}
- PASS: w128_result_json_shape_ready - ["schema","status","runId","runMode","sourceHandoffId","prospect","familyKey","scenario","generated","displayObjects","warnings","errors","ownership","rollback","importHandoff"]
- PASS: w128_final_generated_names_import_handoff_ready - {"source":"internal_build_engine_result_json","targetDrawerStateKey":"dccFinalNamingResult","acceptedImportSchema":"idb.dcc-final-naming-result.v1","importOnly":true,"drawerCanMarkRecordsCreated":false,"drawerCanSubmitFollowupWrites":false,"requiredImportChecks":["status is preview_complete","prospect matches confirmed handoff","familyKey and scenario match confirmed handoff","displayObjects include customer and at least one proof object","ownership.generatedRecordsOwnedBy is internal_build_engine","ownership.drawerCreatedRecords is false"]}
- PASS: w128_no_drawer_writes - drawer source has no direct write or post invocation
- PASS: w128_no_suitescript_invocation_from_drawer - {"contractName":"confirmedBuildHandoffToInternalBuildEnginePreviewRunV1","sourceSurface":"drawer_exported_build_handoff","executorSurface":"internal_build_engine","defaultMode":"sandbox_preview_no_submit","drawerMayInvokeSuiteScript":false,"drawerMayWriteRecords":false,"drawerMayCreateTransactions":false,"consultantConfirmationRequired":true,"generatedRecordOwner":"internal_build_engine","importBackToDrawer":"final_generated_names_import_only"}
- PASS: w128_no_transaction_writes_from_drawer - {"submitAllowed":false,"recordWritesAllowed":false,"transactionWritesAllowed":false,"suiteScriptInvocationFromDrawerAllowed":false,"operatorReviewRequired":true,"noSubmitRollbackRequired":true}
- PASS: w128_consultant_confirmation_required - {"contractName":"confirmedBuildHandoffToInternalBuildEnginePreviewRunV1","sourceSurface":"drawer_exported_build_handoff","executorSurface":"internal_build_engine","defaultMode":"sandbox_preview_no_submit","drawerMayInvokeSuiteScript":false,"drawerMayWriteRecords":false,"drawerMayCreateTransactions":false,"consultantConfirmationRequired":true,"generatedRecordOwner":"internal_build_engine","importBackToDrawer":"final_generated_names_import_only"}
- PASS: w128_state_authority_and_handoff_parity_preserved - {"recommendedLaneId":"apparel_accessories","selectedLaneId":"apparel_accessories","confirmedLaneId":"apparel_accessories","exportedLaneId":"apparel_accessories","hasRecommendedMismatch":false,"hasConfirmedMismatch":false}
- PASS: w128_internal_build_engine_owns_generated_records - {"generatedRecordsOwnedBy":"internal_build_engine","drawerCreatedRecords":false,"drawerInvokedSuiteScript":false,"drawerCreatedTransactions":false}
- PASS: w128_operator_runbook_ready - ["Confirm the sales request is complete in Plan.","Confirm the demo path is consultant-confirmed and not merely recommended.","Export the Build handoff JSON from the drawer.","Export the Trace JSON from the drawer.","Compare recommended, selected, confirmed, and exported lane/proof values.","Prepare sandbox preview/run params using the W128 parameter shape.","Run preview through the internal build engine only; do not submit from the drawer.","If any mismatch appears, stop and re-export after consultant confirmation.","If preview completes, return the result JSON for final generated names import.","Import final generated names into the drawer as result JSON only."]
- PASS: w128_visual_testing_not_required - false

## Best Next Codex Prompt

Move through W129: Sandbox Preview Operator Smoke. Execute the W128 governed preview/run smoke as an operator-only sandbox preview path using the confirmed handoff and W128 parameter shape. Do not enable drawer writes, do not invoke SuiteScript from the drawer, and do not create transactions from the drawer. Compare the internal build engine preview result against the confirmed handoff, return final generated names JSON, prove no-submit rollback behavior, preserve state authority and handoff parity, and output operator evidence, trace samples, smoke report, whether visual NetSuite testing is required, and the best next Codex prompt.
