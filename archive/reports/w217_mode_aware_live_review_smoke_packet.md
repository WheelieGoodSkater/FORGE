# W217 Mode-Aware Live Review Smoke Packet

Status: PASS (9/9)

## Smoke Cases
- Complete Non-Manufacturing Retail Availability
  - Mode: retail_availability
  - Headline: Build results are ready.
  - Run: Open Customer / Open Sales Order / Open Item
  - Labels: Customer, Sales Order, Product SKU, Availability/Replenishment Flow, Channel/Location Context
  - Openable records: 5
  - Admin/debug visible: no
- Complete Discrete Manufacturing
  - Mode: discrete_manufacturing
  - Headline: Build results are ready.
  - Run: Open Customer / Open Sales Order / Open Item
  - Labels: Customer, Sales Order, Finished/Assembly Item, BOM or Assembly Structure, Component Item
  - Openable records: 5
  - Admin/debug visible: no
- Partial Food Batch WIP
  - Mode: food_batch_manufacturing
  - Headline: Food batch records are ready. WIP detail was not returned.
  - Run: Open Customer / Open Sales Order / Open Item / Use available records / WIP detail not returned
  - Labels: Customer, Sales Order, Finished Food/Batch Item, Formula or Batch Structure, Ingredient Item, Lot Context
  - Openable records: 6
  - Admin/debug visible: yes

## Validation
- PASS packet_has_three_representative_cases: complete_non_manufacturing, complete_manufacturing, partial_food_batch_wip
- PASS complete_non_manufacturing_case_is_operator_readable: retail_availability: Build results are ready.
- PASS complete_manufacturing_case_has_mode_aware_labels: Customer, Sales Order, Finished/Assembly Item, BOM or Assembly Structure, Component Item
- PASS partial_food_batch_wip_case_is_honest_and_debuggable: Food batch records are ready. WIP detail was not returned.; Customer, Sales Order, Finished Food/Batch Item, Formula or Batch Structure, Ingredient Item, Lot Context
- PASS normal_consultant_copy_hides_internal_terms: Build results are ready. Use the returned records with real Open links. Build results are ready. Open Customer / Open Sales Order / Open Item Customer: Northstar Trail Outfitters Customer Account -> Sales Order: Northstar Trail Outfitters SO217 -> Product SKU: Northstar Trail Outfitters Product Availability SKU -> Availability/Replenishment Flow: Northstar Trail Outfitters Dealer Replenishment Flow | Build results are ready. Use the returned records with real Open links. Build results are ready. Open Customer / Open Sales Order / Open Item Customer: Evergreen Equipment Works Customer Account -> Sales Order: Evergreen Equipment Works SO217 -> Finished/Assembly Item: Evergreen Equipment Works Finished Good -> BOM or Assembly Structure: Evergreen Equipment Works Assembly Structure | Food batch records are ready. WIP detail was not returned. Use the returned food batch, ingredient, formula, and lot records. Do not claim WIP detail unless those records are returned. Use available records Open Customer / Open Sales Order / Open Item / Use available records / WIP detail not returned Customer: McCormick Customer Account -> Sales Order: McCormick SO217 -> Finished Food/Batch Item: McCormick Finished Food Batch Item -> Formula or Batch Structure: McCormick Formula Batch Structure
- PASS admin_debug_is_only_visible_for_expected_partial_case: complete_non_manufacturing:false, complete_manufacturing:false, partial_food_batch_wip:true
- PASS run_next_steps_are_concise_and_record_backed: Open Customer / Open Sales Order / Open Item / Use available records / WIP detail not returned
- PASS visible_records_are_openable_only: complete_non_manufacturing:5, complete_manufacturing:5, partial_food_batch_wip:6
- PASS w214_w215_w216_boundaries_preserved: {"w151ImportGuardPreserved":true,"semanticRoleMappingPreserved":true,"modeAwareNamingGuardrailsPreserved":true,"dynamicRecordDisplayPreserved":true,"consultantPartialResultLanguagePreserved":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedW144AdapterPath":true,"runnerOwnsGeneratedRecords":true,"imageLookupDisabledByDefault":true,"nllmAdvisoryOnly":true}

## Operator-Readable Trace Samples
- trace_samples/w217_mode_aware_live_review_smoke_packet_trace.json
- data/w217_mode_aware_live_review_smoke_packet.json

## Upload Packet
- Upload/update `idb-drawer.user.js` only if deploying W217 script helpers.
- No W144 adapter, runner, or SuiteScript upload is required for W217.

## Visual Testing Decision
No broad visual testing was run for W217. This block produces a targeted operator smoke packet and harness assertions for Review/Run copy, Open-link eligibility, and admin/debug separation.

## Best Next Codex Prompt
Move through W218: Operator Smoke Packet Live Wording Freeze. Use W217 smoke cases to freeze the exact Review/Run labels and copy for the representative complete non-manufacturing, complete manufacturing, and partial food/WIP import paths. Preserve W151, real Open links, no drawer writes, and no broad visual testing.
