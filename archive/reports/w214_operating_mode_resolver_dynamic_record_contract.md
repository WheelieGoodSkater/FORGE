# W214 Operating Mode Resolver And Dynamic Record Contract

Status: PASS (14/14)

## Operating Mode Resolver Contract
- Resolve one Build Operating Mode before naming, request creation, result import, Run coaching, ROI, or competitive story.
- Website/domain/category evidence controls industry, category, and product nouns.
- Consultant toggles control operating-model vocabulary: Manufacturing=false blocks manufacturing semantics, Manufacturing=true allows only mode-supported manufacturing semantics, and WIP=true requires WIP detail or an explicit partial-result state.
- Conversation notes shape pain, story, ROI, objection handling, and competitive framing only.

## Dynamic Record Contract
- Non-manufacturing modes no longer require the legacy component item role to import a valid completed result.
- Manufacturing modes may display more than five records when BOM, assembly, work order, routing, or work center records exist.
- Missing manufacturing or WIP details are exposed as partial-result/admin-debug warnings, not consultant-facing false completion copy.

## Validation
- PASS northstar_resolves_retail_or_dealer_non_mfg: retail_availability
- PASS northstar_rejects_manufacturing_names: Paste completed governed runner result JSON with numeric internal ids and supported NetSuite URLs. Naming blocked: Hero item: Northstar Trail Outfitters Finished Good, Matrix item / proof item: Northstar Trail Outfitters Assembly. Mode contract blocked: Hero item: finished good is not compatible with retail_availability., Matrix item / proof item: assembly is not compatible with retail_availability., Component item 1: component a is not compatible with retail_availability., Component item 1: Generic component naming is manufacturing vocabulary when Manufacturing=false..
- PASS harbor_resolves_apparel_and_accepts_style_matrix: apparel_style_matrix; completed_runner_result_accepted
- PASS metroline_resolves_distribution_or_dealer_and_rejects_assembly_language: distribution_replenishment; Paste completed governed runner result JSON with numeric internal ids and supported NetSuite URLs. Naming blocked: Hero item: Metroline Parts Supply Finished Good, Matrix item / proof item: Metroline Parts Supply Controlled Assembly Execution. Mode contract blocked: Hero item: finished good is not compatible with distribution_replenishment., Matrix item / proof item: assembly is not compatible with distribution_replenishment., Matrix item / proof item: controlled assembly execution is not compatible with distribution_replenishment., Component item 1: frame welding is not compatible with distribution_replenishment..
- PASS evergreen_resolves_discrete_and_marks_missing_manufacturing_records_partial: discrete_manufacturing; mode_record_contract_partial
- PASS evergreen_rejects_apparel_style_only_names_when_manufacturing_selected: Paste completed governed runner result JSON with numeric internal ids and supported NetSuite URLs. Mode contract blocked: Hero item: style sku is not compatible with discrete_manufacturing., Matrix item / proof item: omnichannel availability flow is not compatible with discrete_manufacturing., Manufacturing result: Manufacturing=true requires manufacturing-compatible returned records before import is treated as complete..
- PASS canyon_resolves_wip_and_requires_wip_detail: wip_manufacturing; good=completed_runner_result_accepted; bad=mode_record_contract_partial
- PASS mccormick_resolves_food_batch_and_rejects_apparel_fallback: food_batch_manufacturing; Paste completed governed runner result JSON with numeric internal ids and supported NetSuite URLs. Mode contract blocked: Hero item: style sku is not compatible with food_batch_manufacturing., Matrix item / proof item: omnichannel availability flow is not compatible with food_batch_manufacturing., Component item 1: core style is not compatible with food_batch_manufacturing., WIP result: WIP=true requires a work order, routing, work center, WIP object, or explicit partial-result state..
- PASS yerba_madre_resolves_food_batch_from_website_and_rejects_hardgoods_fallback: food_batch_manufacturing; Paste completed governed runner result JSON with numeric internal ids and supported NetSuite URLs. Mode contract blocked: Hero item: style sku is not compatible with food_batch_manufacturing., Matrix item / proof item: omnichannel availability flow is not compatible with food_batch_manufacturing., WIP result: WIP=true requires a work order, routing, work center, WIP object, or explicit partial-result state..
- PASS confirmed_build_request_contains_w214_contract_fields: {"resolvedOperatingMode":"food_batch_manufacturing","requiredRecordRoles":["customer","sales_order","finished_food_or_batch_item","ingredient_or_component_item"]}
- PASS notes_shape_story_not_naming_authority: {"websiteControlsIndustryCategoryAndProductNouns":true,"togglesControlOperatingModelVocabulary":true,"notesControlPainStoryRoiObjectionsOnly":true,"nllmAdvisoryOnly":true,"domain":"grainger.com","evidence":["known domain grainger.com -> distribution_replenishment","known domain controls non-manufacturing operating mode"]}
- PASS nllm_remains_advisory_only: {"oneClickBuildPreserved":true,"savedW144AdminConfigPreserved":true,"resultPollingPreserved":true,"w151ImportGuardPreserved":true,"noDrawerWrites":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedW144AdapterPath":true,"runnerOwnsGeneratedRecords":true,"noOpenLinksBeforeValidImport":true,"imageLookupDisabledByDefault":true}
- PASS normal_consultant_ui_remains_simple: consultantWorkflow hides W144 endpoint, runnerTaskId, raw JSON, W151 language, and admin diagnostics
- PASS production_path_boundaries_preserved: one-click Build, W144 config, polling, W151, runner ownership, and image lookup boundary remain intact

## Trace Samples
- trace_samples/w214_operating_mode_resolver_dynamic_record_contract_trace.json
- data/w214_operating_mode_resolver_dynamic_record_contract.json

## Upload Packet
- Upload/update `idb-drawer.user.js` only.
- No W144 adapter, runner, or SuiteScript upload is required for W214.

## Visual Testing Decision
No broad visual testing was run or requested for W214. Harness/regression-first validation is sufficient because this block changes resolver contracts, request JSON, import validation, and admin/debug display modeling rather than layout.

## Best Next Codex Prompt
Move through W215: Runner Output Role Mapping And Partial Result Import UX. Use W214 mode contracts to align the governed runner result JSON roles with IDB dynamic record display, preserve W151 import guard, and add targeted consultant/admin copy for partial manufacturing and WIP results without broad visual testing.
