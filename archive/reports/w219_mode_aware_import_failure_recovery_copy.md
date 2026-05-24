# W219 Mode-Aware Import Failure Recovery Copy

Status: PASS (11/11)

## Consultant/Admin Recovery Copy Matrix
- handoff
  - Mode: retail_availability
  - Consultant: Paste the completed build result. Use the latest completed runner result.
  - Admin/debug visible: no
  - Failure types: handoffJsonRejected
- invalidMetroline
  - Mode: distribution_replenishment
  - Consultant: This result does not match the selected operating mode. Use the latest completed runner result.
  - Admin/debug visible: no
  - Failure types: invalidRoleOrNameCombination, manufacturingReturnedWhenManufacturingFalse
- northstarMfgTerms
  - Mode: retail_availability
  - Consultant: This result does not match the selected operating mode. Use the latest completed runner result.
  - Admin/debug visible: no
  - Failure types: invalidRoleOrNameCombination, manufacturingReturnedWhenManufacturingFalse
- mccormickFallback
  - Mode: food_batch_manufacturing
  - Consultant: This result does not match the selected operating mode. Use the latest completed runner result.
  - Admin/debug visible: no
  - Failure types: invalidRoleOrNameCombination, wipMissingWhenWipTrue, foodVocabularyWithoutFoodAuthority
- missingIds
  - Mode: retail_availability
  - Consultant: Ask the runner to return real NetSuite links. Use available records only after import succeeds.
  - Admin/debug visible: no
  - Failure types: missingNumericIds, nonOpenableReturnedRecords
- unsupportedUrls
  - Mode: retail_availability
  - Consultant: Ask the runner to return real NetSuite links. Use available records only after import succeeds.
  - Admin/debug visible: no
  - Failure types: unsupportedUrls, nonOpenableReturnedRecords
- partialWipAdmin
  - Mode: wip_manufacturing
  - Consultant: This result does not match the selected operating mode. Use the latest completed runner result.
  - Admin/debug visible: yes
  - Failure types: wipMissingWhenWipTrue
- invalidAdmin
  - Mode: distribution_replenishment
  - Consultant: This result does not match the selected operating mode. Use the latest completed runner result.
  - Admin/debug visible: yes
  - Failure types: invalidRoleOrNameCombination

## Validation
- PASS handoff_json_recovery_copy_is_plain: Paste the completed build result. Use the latest completed runner result.
- PASS invalid_distribution_manufacturing_fallback_names_rejected_plainly: This result does not match the selected operating mode.
- PASS northstar_manufacturing_terms_rejected_when_manufacturing_false: {"handoffJsonRejected":false,"invalidRoleOrNameCombination":true,"manufacturingReturnedWhenManufacturingFalse":true,"wipMissingWhenWipTrue":false,"foodVocabularyWithoutFoodAuthority":false,"missingNumericIds":false,"unsupportedUrls":false,"nonOpenableReturnedRecords":false}
- PASS mccormick_apparel_industrial_fallback_rejected: This result does not match the selected operating mode.
- PASS missing_numeric_ids_request_real_links: Ask the runner to return real NetSuite links.
- PASS unsupported_urls_request_real_links: Ask the runner to return real NetSuite links.
- PASS partial_wip_admin_detail_visible_only_when_enabled: {"validationStatus":"completed_runner_result_accepted","rejectedRoles":[],"rejectedNames":[],"missingIds":[],"unsupportedUrls":[],"resolvedOperatingMode":"wip_manufacturing","selectedToggles":{"schema":"idb.w214-selected-build-toggles.v1","createNewHeroItem":true,"enableManufacturing":true,"enableWip":true,"selectedLaneId":"dealer_hardgoods"},"mappedRoles":["customer","sales_order","finished_or_assembly_item","bom_or_assembly_structure","bom_or_assembly_structure","bom_or_assembly_structure","component_item"],"guardMessage":"Completed runner result JSON accepted. Final names and verified URLs can be imported."}
- PASS admin_debug_details_include_rejected_roles_names_and_mode: {"validationStatus":"toggle_vocabulary_guardrail_failed","rejectedRoles":["hero_item","matrix_or_proof_item"],"rejectedNames":["Metroline Parts Supply Finished Good"],"missingIds":[],"unsupportedUrls":[],"resolvedOperatingMode":"distribution_replenishment","selectedToggles":{"schema":"idb.w214-selected-build-toggles.v1","createNewHeroItem":true,"enableManufacturing":false,"enableWip":false,"selectedLaneId":"industrial_distribution"},"mappedRoles":["customer","sales_order","branch_or_product_sku","replenishment_or_availability_flow"],"guardMessage":"Paste completed governed runner result JSON with numeric internal ids and supported NetSuite URLs. Naming blocked: Hero item: Metroline Parts Supply Finished Good. Mode contract blocked: Hero item: finished good is not compatible with distribution_replenishment., Matrix item / proof item: frame welding is not compatible with distribution_replenishment.."}
- PASS normal_consultant_copy_hides_internal_terms_for_all_failures: Paste the completed build result. Use the latest completed runner result. | This result does not match the selected operating mode. Use the latest completed runner result. | This result does not match the selected operating mode. Use the latest completed runner result. | This result does not match the selected operating mode. Use the latest completed runner result. | Ask the runner to return real NetSuite links. Use available records only after import succeeds. | Ask the runner to return real NetSuite links. Use available records only after import succeeds. | This result does not match the selected operating mode. Use the latest completed runner result. | This result does not match the selected operating mode. Use the latest completed runner result.
- PASS no_fake_open_links_before_valid_import: no visible Open records for rejected imports
- PASS w214_to_w218_boundaries_preserved: all no-regression flags preserved

## Trace Samples
- trace_samples/w219_mode_aware_import_failure_recovery_copy_trace.json
- data/w219_mode_aware_import_failure_recovery_copy.json

## Upload Packet
- Upload/update `idb-drawer.user.js` only if deploying W219 recovery helpers.
- No W144 adapter, runner, or SuiteScript upload is required for W219.

## Visual Testing Decision
No broad visual testing was run for W219. Recovery copy and admin/debug separation are covered by harness assertions.

## Best Next Codex Prompt
Move through W220: Import Recovery UI Surface Wiring. Use W219 recovery copy to wire the normal Review/Build import failure surfaces to the plain recovery actions while preserving admin/debug-only diagnostics, W218 frozen success wording, W151, real Open links, no drawer writes, and no broad visual testing.
