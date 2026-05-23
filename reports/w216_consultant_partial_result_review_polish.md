# W216 Consultant-Facing Partial Result Review Polish

Status: PASS (13/13)

## Consultant-Facing Partial Result Model
- Complete imports say `Build results are ready.` and show only returned records with verified Open links.
- Partial manufacturing imports say `Core build records are ready. Manufacturing setup detail was not returned.`
- Partial WIP imports say `Core build records are ready. WIP detail was not returned.`
- Partial food batch/WIP imports say `Food batch records are ready. WIP detail was not returned.`

## Admin/Debug Separation
- Normal Review/Run copy hides W144 endpoint, runnerTaskId, raw JSON, W151, semantic guard, mode contract, mapped roles, and diagnostics.
- Admin/debug may show missing BOM/assembly structure, missing work order/WIP object, missing routing, missing work center, mapped roles, resolved mode, and confidence.

## Validation
- PASS complete_retail_review_ready_clean: Build results are ready.
- PASS complete_apparel_labels_clean: Customer, Sales Order, Style SKU, Style Matrix, Component Item
- PASS complete_discrete_manufacturing_can_name_bom_when_present: Customer: Evergreen Equipment Works Customer Account -> Sales Order: Evergreen Equipment Works SO216 -> Finished/Assembly Item: Evergreen Equipment Works Finished Good -> BOM or Assembly Structure: Evergreen Equipment Works Assembly Structure
- PASS partial_discrete_consultant_copy_honest_and_clean: Core build records are ready. Manufacturing setup detail was not returned.
- PASS partial_discrete_admin_debug_shows_diagnostics: {"missingBomOrAssemblyStructure":true,"missingWorkOrderOrWipObject":false,"missingRouting":false,"missingWorkCenter":false,"mappedRoles":["customer","sales_order","finished_or_assembly_item","component_item"],"resolvedOperatingMode":"discrete_manufacturing","modeConfidence":"high"}
- PASS complete_wip_run_can_use_wip_records: Customer: Canyon Ridge Components Customer Account -> Sales Order: Canyon Ridge Components SO216 -> Finished/Assembly Item: Canyon Ridge Components Finished Good -> BOM or Assembly Structure: Canyon Ridge Components Assembly Structure
- PASS partial_wip_admin_debug_and_run_do_not_prove_missing_wip: Core build records are ready. WIP detail was not returned.; Use available records: Customer: Canyon Ridge Components Customer Account -> Sales Order: Canyon Ridge Components SO216 -> Finished/Assembly Item: Canyon Ridge Components Finished Good -> BOM or Assembly Structure: Canyon Ridge Components Assembly Structure.
- PASS partial_food_batch_uses_food_language_only: Food batch records are ready. WIP detail was not returned.
- PASS invalid_fallback_names_remain_rejected: toggle_vocabulary_guardrail_failed; mode_record_contract_partial
- PASS handoff_json_still_rejected: This is the Build handoff JSON. It requests runner work but does not contain completed runner result records, ids, or URLs.
- PASS normal_run_copy_uses_returned_records_only_after_valid_import: Build results are ready.: Customer: Northstar Trail Outfitters Customer Account -> Sales Order: Northstar Trail Outfitters SO216 -> Product SKU: Northstar Trail Outfitters Product Availability SKU -> Availability Flow: Northstar Trail Outfitters Retail Replenishment Flow.
- PASS admin_debug_only_terms_are_hidden_when_off: normal Review/Run copy is clean
- PASS boundaries_preserved: {"noDrawerWrites":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedW144AdapterPath":true,"runnerOwnsGeneratedRecords":true,"nllmAdvisoryOnly":true,"imageLookupDisabledByDefault":true,"adminDebugDiagnosticsHiddenWhenOff":true}

## Trace Samples
- trace_samples/w216_consultant_partial_result_review_polish_trace.json
- data/w216_consultant_partial_result_review_polish.json

## Upload Packet
- Upload/update `idb-drawer.user.js` only.
- No W144 adapter, runner, or SuiteScript upload is required for W216.

## Visual Testing Decision
No broad visual testing was run or requested for W216. This is consultant/admin copy separation and display-model polish; harness regression is the correct gate.

## Best Next Codex Prompt
Move through W217: Mode-Aware Live Review Smoke Packet. Use W216 consultant-facing partial result copy to produce a targeted operator smoke packet for one complete non-manufacturing run, one complete manufacturing run, and one partial WIP/food batch run. Preserve W151, real Open links, no drawer writes, and no broad visual testing.
