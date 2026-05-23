# W218 Operator Smoke Packet Live Wording Freeze

Status: PASS (10/10)

## Frozen Wording Matrix
- Complete Non-Manufacturing Retail Availability
  - Mode: retail_availability
  - Review headline: Build results are ready.
  - Run actions: Open Customer / Open Sales Order / Open Item
  - Labels: Customer, Sales Order, Product SKU, Availability Flow, Channel Context
  - Admin/debug visible: no
- Complete Discrete Manufacturing
  - Mode: discrete_manufacturing
  - Review headline: Build results are ready.
  - Run actions: Open Customer / Open Sales Order / Open Item
  - Labels: Customer, Sales Order, Finished/Assembly Item, BOM or Assembly Structure, Component Item
  - Admin/debug visible: no
- Partial Food Batch WIP
  - Mode: food_batch_manufacturing
  - Review headline: Food batch records are ready. WIP detail was not returned.
  - Run actions: Open Customer / Open Sales Order / Open Item / Use available records / WIP detail not returned
  - Labels: Customer, Sales Order, Finished Food/Batch Item, Formula or Batch Structure, Ingredient Item, Lot Context
  - Admin/debug visible: yes

## Validation
- PASS freeze_contract_ready: operator_smoke_wording_frozen
- PASS exact_review_headlines_frozen: Build results are ready. | Build results are ready. | Food batch records are ready. WIP detail was not returned.
- PASS exact_run_actions_frozen: Open Customer / Open Sales Order / Open Item / Use available records / WIP detail not returned
- PASS exact_mode_aware_labels_frozen: Customer, Sales Order, Finished Food/Batch Item, Formula or Batch Structure, Ingredient Item, Lot Context
- PASS partial_food_wip_does_not_claim_wip_support: Food batch records are ready. WIP detail was not returned. Use the returned food batch, ingredient, formula, and lot records. Do not claim WIP detail unless those records are returned. Use available records Open Customer / Open Sales Order / Open Item / Use available records / WIP detail not returned Customer: McCormick Customer Account -> Sales Order: McCormick SO218 -> Finished Food/Batch Item: McCormick Finished Food Batch Item -> Formula or Batch Structure: McCormick Formula Batch Structure
- PASS complete_manufacturing_only_mentions_returned_bom_or_assembly: Build results are ready. Use the returned records with real Open links. Build results are ready. Open Customer / Open Sales Order / Open Item Customer: Evergreen Equipment Works Customer Account -> Sales Order: Evergreen Equipment Works SO218 -> Finished/Assembly Item: Evergreen Equipment Works Finished Good -> BOM or Assembly Structure: Evergreen Equipment Works Assembly Structure
- PASS normal_copy_hides_internal_terms: Build results are ready. Use the returned records with real Open links. Build results are ready. Open Customer / Open Sales Order / Open Item Customer: Northstar Trail Outfitters Customer Account -> Sales Order: Northstar Trail Outfitters SO218 -> Product SKU: Northstar Trail Outfitters Product Availability SKU -> Availability Flow: Northstar Trail Outfitters Dealer Replenishment Flow | Build results are ready. Use the returned records with real Open links. Build results are ready. Open Customer / Open Sales Order / Open Item Customer: Evergreen Equipment Works Customer Account -> Sales Order: Evergreen Equipment Works SO218 -> Finished/Assembly Item: Evergreen Equipment Works Finished Good -> BOM or Assembly Structure: Evergreen Equipment Works Assembly Structure | Food batch records are ready. WIP detail was not returned. Use the returned food batch, ingredient, formula, and lot records. Do not claim WIP detail unless those records are returned. Use available records Open Customer / Open Sales Order / Open Item / Use available records / WIP detail not returned Customer: McCormick Customer Account -> Sales Order: McCormick SO218 -> Finished Food/Batch Item: McCormick Finished Food Batch Item -> Formula or Batch Structure: McCormick Formula Batch Structure
- PASS admin_debug_diagnostics_remain_gated: complete_non_manufacturing:false, complete_manufacturing:false, partial_food_batch_wip:true
- PASS open_links_remain_real_only: complete_non_manufacturing:true, complete_manufacturing:true, partial_food_batch_wip:true
- PASS w214_to_w217_boundaries_preserved: {"w151ImportGuardPreserved":true,"semanticRoleMappingPreserved":true,"modeAwareNamingGuardrailsPreserved":true,"dynamicRecordDisplayPreserved":true,"consultantPartialResultLanguagePreserved":true,"operatorReadableSmokePacketPreserved":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedW144AdapterPath":true,"runnerOwnsGeneratedRecords":true,"imageLookupDisabledByDefault":true,"nllmAdvisoryOnly":true}

## Trace Samples
- trace_samples/w218_operator_smoke_packet_live_wording_freeze_trace.json
- data/w218_operator_smoke_packet_live_wording_freeze.json

## Upload Packet
- Upload/update `idb-drawer.user.js` only if deploying W218 freeze helpers.
- No W144 adapter, runner, or SuiteScript upload is required for W218.

## Visual Testing Decision
No broad visual testing was run for W218. Exact Review/Run wording and labels are frozen by harness contract.

## Best Next Codex Prompt
Move through W219: Mode-Aware Import Failure Recovery Copy. Use W218 frozen wording to add equally plain consultant/admin copy for rejected imports, invalid role/name combinations, handoff JSON, and non-openable returned records. Preserve W151, real Open links, no drawer writes, and no broad visual testing.
