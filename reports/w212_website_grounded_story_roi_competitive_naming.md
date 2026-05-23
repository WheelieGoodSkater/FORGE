# W212 Website-Grounded Story, ROI, Competitive, And Naming Orchestration Report

Status: PASS (10/10)

## Orchestration Contract
- Website/category evidence controls industry, category, product nouns, and naming seeds.
- Consultant toggles control operating-model vocabulary.
- Record naming intent is derived from website evidence plus toggle mode.
- Conversation notes control story, ROI, competitive framing, and objections only.

## Harness Results
- PASS four_orchestration_layers_present: websiteCategoryEvidence, toggleAwareOperatingModel, recordNamingIntent, storyRoiCompetitiveCoaching
- PASS website_controls_naming_nouns: website_evidence_plus_toggle_mode_only
- PASS toggles_control_operating_vocabulary: {"authority":"consultant_toggles_control_operating_model_vocabulary","modeKey":"dealer_hardgoods","enableManufacturing":false,"enableWip":false,"createNewHeroItem":true,"allowedVocabulary":["dealer availability","channel demand","allocation","replenishment","order promise","fulfillment readiness"],"forbiddenUnlessManufacturing":["ingredient","recipe","BOM","routing","work order","finished good"],"w211Contract":"idb.toggle-aware-naming-vocabulary-contract.w211.v1"}
- PASS notes_control_story_roi_competitive_only: ["pain","business risk","buyer urgency","ROI framing","competitive contrast","objection handling"]
- PASS summit_non_mfg_names_are_dealer_distribution_safe: {"customerName":"Summit Outdoor Supply Customer Account","heroItemName":"Summit Outdoor Supply Channel Availability SKU","matrixProofItemName":"Summit Outdoor Supply Dealer Replenishment Flow","componentItemName":"Summit Outdoor Supply Allocation Support SKU","salesOrderName":"Summit Outdoor Supply Seasonal Availability Order","namingBasis":"dealer hardgoods website/category evidence plus non-manufacturing toggles"}
- PASS ariat_names_are_apparel_style_matrix_safe: {"customerName":"Ariat International Customer Account","heroItemName":"Ariat International Style SKU","matrixProofItemName":"Ariat International Omnichannel Availability Flow","componentItemName":"Ariat International Size / Color Variant","salesOrderName":"Ariat International Seasonal Style Availability Order","namingBasis":"apparel website/category evidence plus style matrix proof path"}
- PASS w151_rejects_forbidden_completed_result: Paste completed governed runner result JSON with numeric internal ids and supported NetSuite URLs. Naming blocked: Hero item: Summit Outdoor Supply Finished Good, Matrix item / proof item: Summit Outdoor Supply Production Line, Component item 1: Summit Outdoor Supply Ingredient Blend. Mode contract blocked: Hero item: finished good is not compatible with dealer_hardgoods_replenishment., Matrix item / proof item: production line is not compatible with dealer_hardgoods_replenishment., Component item 1: ingredient is not compatible with dealer_hardgoods_replenishment., Component item 1: ingredient blend is not compatible with dealer_hardgoods_replenishment..
- PASS w151_accepts_mode_valid_completed_results: completed_runner_result_accepted; completed_runner_result_accepted
- PASS nllm_is_advisory_only: {"websiteGrounded":true,"toggleAware":true,"nllmAdvisoryOnly":true,"noRecordCreationAuthority":true,"noToggleOverride":true,"unsupportedClaimBlock":true}
- PASS runner_hardgoods_fallback_prefers_dealer_terms: runner hardgoods naming terms present

## Visual Testing Decision
No broad visual testing required for W212. Use harness regression first; next live run can be a normal consultant smoke only after upload.