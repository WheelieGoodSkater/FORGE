# W116 DCC Final Naming Result Contract And Import Path

Decision: PASS / dcc_final_naming_import_path_ready

## What Changed
- Added dccFinalNamingResultV1 as the import-only contract for real DCC generated names after preview/run.
- Review now separates IDB provisional preview labels from imported DCC final names.
- Run can use imported final object names as navigation/script pivot targets.
- Trace captures the imported result and redacts secret-like fields.

## Contract Summary
- Schema: idb.dcc-final-naming-result.v1
- Sample status: dcc_final_names_imported
- Sample final-name count: 11

## Validator Gates
- PASS w116_contract_runtime_present: idb.dcc-final-naming-result.v1
- PASS w116_review_separates_provisional_before_import:  <div class="idb-cockpit-section"> <div class="idb-card idb-accent idb-w83-dcc-handoff-operator-review idb-w114-review-handoff idb-w124-build-results"> <div class="idb-section-title">Build Handoff</div> <div class="idb-run-action-card idb-w114-request-summary"> <div class="idb-status-key">What the consultant requested</div> <div class="idb-strong">Ariat International</div> <div class="idb-copy">Show a concise NetSuite proof path for style/SKU readiness, size/color availability, replenishment timing, and customer promise.</div> </div> <div class="idb-status-strip"> <div class="idb-status-cell"> <div class="idb-status-key">1. Ready?</div> <div class="idb-status-value">Ready to export</div> <div class="idb-copy">Consultant confirmed the lane and pack.</div> </div> <div class="idb-status-cell"> <div class="idb-status-key">2. Demo path</div> <div class="idb-status-value">Apparel &amp; Accessories</div> <div class="idb-copy">Style-to-Availability Readiness</div> </div> <div class="idb-status-cell"> <div class="idb-status-key">3. Boundary</div> <div class="idb-status-value">Export only</div> <div class="idb-copy">The build engine owns generated records.</div> </div> </div> <div class="idb
- PASS w116_import_maps_dcc_final_fields: {
  "schema": "idb.dcc-final-naming-result.v1",
  "status": "dcc_final_names_imported",
  "displayStatus": "Final generated names imported",
  "importedAt": "2026-05-17T21:41:07.267Z",
  "source": "dcc_result_import_only",
  "finalNamesImported": true,
  "runStatus": "preview_complete",
  "prospect": "Ariat International",
  "scenario": "Style-to-Availability Readiness",
  "familyKey": "apparelAccessories",
  "generated": {
    "extId": "DCC-ARIAT-STYLE-READY-001",
    "agenda": "Ariat seasonal style readiness proof"
  },
  "displayObjects": [
    {
      "role": "customer",
      "label": "Customer",
      "name": "Ariat International Demo Account",
      "internalName": "",
      "id": "321",
      "url": "/app/common/entity/custjob.nl?id=321",
      "source": "dcc_final"
    },
    {
      "role": "sales_order",
      "label": "Sales Order / demo transaction",
      "name": "SO-Ariat-Fall-Launch-ATP-Readiness",
      "internalName": "",
      "id": "654",
      "url": "/app/accounting/transactions/salesord.nl?id=654",
      "source": "dcc_final"
    },
    {
      "role": "hero_item",
      "label": "Hero item",
      "name": "Ariat Heritage Boot - Demo Hero SKU",
      "internalName": "",
      "id": "987",
      "url": "/app/common/item/item.nl?id=987",
      "source": "dcc_final"
    },
    {
      "role": "matrix_or_proof_item",
      "label": "Matrix item / proof item",
      "name": "Ariat Heritage Boot Matrix - Width Size Color",
      "internalName": "",
      "id": "988",
      "url": "/app/common/item/item.nl?id=988",
      "source": "dcc_final"
    },
    {
  
- PASS w116_review_uses_final_names_after_import:  <div class="idb-cockpit-section"> <div class="idb-card idb-accent idb-w83-dcc-handoff-operator-review idb-w114-review-handoff idb-w124-build-results"> <div class="idb-section-title">Build Results</div> <div class="idb-run-action-card idb-w114-request-summary"> <div class="idb-status-key">What the consultant requested</div> <div class="idb-strong">Ariat International</div> <div class="idb-copy">Show a concise NetSuite proof path for style/SKU readiness, size/color availability, replenishment timing, and customer promise.</div> </div> <div class="idb-status-strip"> <div class="idb-status-cell"> <div class="idb-status-key">1. Result</div> <div class="idb-status-value">Ready to export</div> <div class="idb-copy">Final names are imported for the live demo.</div> </div> <div class="idb-status-cell"> <div class="idb-status-key">2. Demo path</div> <div class="idb-status-value">Apparel &amp; Accessories</div> <div class="idb-copy">Style-to-Availability Readiness</div> </div> <div class="idb-status-cell"> <div class="idb-status-key">3. Boundary</div> <div class="idb-status-value">Export only</div> <div class="idb-copy">The build engine owns generated records.</div> </div> </div> <div class="idb-chip-row"> <span class="idb-chip idb-ready">confirmed</span> <span class="idb-chip idb-ready">Build results imported</span> <span class="idb-mini-chip">Export lane: Apparel &amp; Accessories</span> <span class="idb-mini-chip">Final generated names imported</span> </div> <div class="idb-run-action-card idb-w154-build-return-status"> <div class="idb-status-key">Integrated Build runner return</div> <div class="idb-strong">Completed result imported</div> <div class="idb-copy">Completed runner result JSON has passed the W151 import guard. Open links remain governed by real URL authority.</div>
- PASS w116_run_navigation_uses_imported_final_names:  <div class="idb-card idb-accent idb-w97-run-selector"> <div class="idb-section-title">Live controls</div> <div class="idb-run-selector-chips" role="group" aria-label="Live script mode"> <button class="idb-action-chip " data-idb-action="open" aria-pressed="false" title="Open with buyer pain and set the NetSuite proof path." > Open </button> <button class="idb-action-chip idb-selected" data-idb-action="prove" aria-pressed="true" title="Show the proof record and connect it to the business outcome." > Prove </button> <button class="idb-action-chip " data-idb-action="handle_objection" aria-pressed="false" title="Handle risk, exception, or competitive doubt without leaving the proof path." > Handle objection </button> <button class="idb-action-chip " data-idb-action="close_value" aria-pressed="false" title="Close on the operational decision and financial impact." > Close value </button> </div> <div class="idb-run-action-card"> <div class="idb-status-key">Selected script</div> <div class="idb-strong">Prove the NetSuite path</div> <div class="idb-copy">Use Ariat International Demo Account to prove Style / SKU Matrix against the stated pain: Seasonal footwear and apparel launches are risky because style, size, color, replenishment timing, and channel availability are.... Tie the proof to Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing or distribution language. and show how NetSuite keeps the decision in one operating path.</div> </div> <div class="idb-run-action-card idb-w116-final-navigation"> <div class="id
- PASS w116_trace_import_ui_and_secret_redaction: {"dccFinalNamingResultV1":{"schema":"idb.dcc-final-naming-result.v1","status":"dcc_final_names_imported","displayStatus":"Final generated names imported","importedAt":"2026-05-17T21:41:07.267Z","source":"dcc_result_import_only","finalNamesImported":true,"runStatus":"preview_complete","prospect":"Ariat International","scenario":"Style-to-Availability Readiness","familyKey":"apparelAccessories","generated":{"extId":"DCC-ARIAT-STYLE-READY-001","agenda":"Ariat seasonal style readiness proof"},"displayObjects":[{"role":"customer","label":"Customer","name":"Ariat International Demo Account","internalName":"","id":"321","url":"/app/common/entity/custjob.nl?id=321","source":"dcc_final"},{"role":"sales_order","label":"Sales Order / demo transaction","name":"SO-Ariat-Fall-Launch-ATP-Readiness","internalName":"","id":"654","url":"/app/accounting/transactions/salesord.nl?id=654","source":"dcc_final"},{"role":"hero_item","label":"Hero item","name":"Ariat Heritage Boot - Demo Hero SKU","internalName":"","id":"987","url":"/app/common/item/item.nl?id=987","source":"dcc_final"},{"role":"matrix_or_proof_item","label":"Matrix item / proof item","name":"Ariat Heritage Boot Matrix - Width Size Color","
- PASS w116_state_authority_and_handoff_parity_preserved: {"authority":{"schema":"idb.w92-state-authority.v1","recommendedLaneId":"apparel_accessories","recommendedLaneName":"Apparel & Accessories","recommendedProofAnchor":"Style / SKU Matrix","selectedLaneId":"apparel_accessories","selectedLaneName":"Apparel & Accessories","selectedProofAnchor":"Style / SKU Matrix","confirmedLaneId":"apparel_accessories","confirmedLaneName":"Apparel & Accessories","exportedLaneId":"apparel_accessories","exportedLaneName":"Apparel & Accessories","laneSelectionSource":"consultant_confirmed","confidenceState":"needs_confirmation","confidenceSource":"website_evidence_v1","hasRecommendedMismatch":false,"hasConfirmedMismatch":false,"handoffEligible":true,"handoffBlockers":[],"noRegression":{"websiteEvidenceOwnsIdentity":true,"notesRole":"story_only","dccOwnsObjectGeneration":true,"noSuiteScriptInvocationFromIdb":true,"noIdbTransactionWrite":true}},"parity":"parity_locked","selectedPack":"apparelAccessories"}
- PASS w116_no_regression_boundaries_present: {"importOnly":true,"noIdbWrites":true,"noSuiteScriptInvocationFromIdb":true,"noTransactionWritesFromIdb":true,"dccOwnsObjectGeneration":true,"provisionalNamesCannotBeMarkedFinal":true,"w92StateAuthorityPreserved":true,"w110HandoffParityPreserved":true}

## No Regression
- w92StateAuthorityPreserved: true
- w110ParityLockPreserved: true
- noIdbWrites: true
- noSuiteScriptInvocationFromIdb: true
- noTransactionWritesFromIdb: true
- hostedResolverOptionalUntilRemoteSmokeExecuted: true
- consultantConfirmationRequired: true
- dccOwnsObjectGeneration: true
- idbCannotMarkProvisionalNamesAsFinal: true

## Best Next Codex Prompt
Move through W117: DCC Result Export Shape And Final Naming Smoke Pack. Define and test the exact Demo Command Center result JSON shape that an operator will export or paste back into IDB after DCC preview/run, then produce a sample result for apparel, CPG, dealer/distributor, manufacturing-heavy, and ambiguous cases. Verify IDB shows provisional names before import, DCC final names after import, Run uses imported final names for navigation/script pivots, Trace redacts secrets, and no IDB writes/SuiteScript invocation/transaction writes occur. Preserve W92/W110 state authority and DCC handoff parity, consultant confirmation required, hosted resolver optional until remoteSmokeExecuted=true, and DCC ownership of object generation. Output result-shape contract samples, import smoke results, validator gates, W117 report, and best next Codex prompt.
