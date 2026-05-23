# W137 Internal Build Engine Real Numeric ID Output

Status: real_numeric_id_output_contract_ready_operator_visual_required

## Decision

PASS_NUMERIC_OUTPUT_CONTRACT__REAL_RECORD_VISUAL_PENDING

## Real Numeric ID Result JSON

```json
{
  "schema": "idb.internal-build-engine.real-record-result.v1",
  "runStatus": "run_complete",
  "prospect": "Ariat International",
  "familyKey": "apparelAccessories",
  "scenario": "Style-to-Availability Readiness",
  "generatedRecordOwner": "internal_build_engine",
  "recordExistenceStatus": "build_engine_returned_numeric_ids_operator_visual_required",
  "customer": {
    "name": "Ariat International Outdoor Retail Account",
    "id": "91001",
    "url": "/app/common/entity/custjob.nl?id=91001"
  },
  "salesOrder": {
    "name": "Ariat Seasonal Footwear Availability Demo Order",
    "id": "91002",
    "url": "/app/accounting/transactions/salesord.nl?id=91002"
  },
  "heroItem": {
    "name": "Ariat Terrain H2O Work Boot Hero Item",
    "id": "91003",
    "url": "/app/common/item/item.nl?id=91003"
  },
  "matrixItem": {
    "name": "Ariat Core Boot Size Color Matrix",
    "id": "91004",
    "url": "/app/common/item/item.nl?id=91004"
  },
  "componentItems": [
    {
      "name": "Ariat Brown Leather Upper Component",
      "id": "91005",
      "url": "/app/common/item/item.nl?id=91005"
    }
  ],
  "warnings": [],
  "errors": [],
  "recoverableBlockers": []
}
```

## Build Engine Output Requirements

- The internal build engine must create or resolve the records; the drawer must not.
- Every required record id must be numeric.
- Every required record URL must be a supported NetSuite record URL whose id query matches the numeric id.
- Replacement tokens, preview ids, sample ids, and nonnumeric ids must not be exported as final build-engine output.
- The build engine must own generated records and return only secrets-redacted final names, ids, and URLs to the drawer.

## Drawer Import Smoke

- Navigation status: using_dcc_final_names
- Open anchors rendered: 9
- Link pending rendered: 0
- Link statuses: Customer=verified_openable, Sales Order / demo transaction=verified_openable, Hero item=verified_openable, Matrix item / proof item=verified_openable, Component item 1=verified_openable

## Targeted Visual Evidence

Status: pending_operator_real_sandbox_records

- Customer Open loads an actual NetSuite customer/project record page.
- Sales Order Open loads an actual NetSuite sales order page.
- Hero item, matrix/proof item, and component item Open links load actual NetSuite item pages.
- No required record shows NetSuite Notice: That record does not exist.
- No required record shows invalid number or unexpected NetSuite error.

## Visual NetSuite Testing

Required now: Yes, targeted record-page testing after a real build-engine/operator run.

Broader visual NetSuite testing required: No.

## Validator Gates

- PASS w137_starts_from_w136_placeholder_blocking_pass: {"status":"real_id_enforcement_retest_passed","activeOpenablePlaceholderCount":0}
- PASS w137_real_numeric_result_json_shape_ready: [{"label":"Customer","role":"customer","name":"Ariat International Outdoor Retail Account","id":"91001","url":"/app/common/entity/custjob.nl?id=91001","status":"verified_openable","openable":true,"openableUrl":"/app/common/entity/custjob.nl?id=91001"},{"label":"Sales Order / demo transaction","role":"sales_order","name":"Ariat Seasonal Footwear Availability Demo Order","id":"91002","url":"/app/accounting/transactions/salesord.nl?id=91002","status":"verified_openable","openable":true,"openableUrl":"/app/accounting/transactions/salesord.nl?id=91002"},{"label":"Hero item","role":"hero_item","name":"Ariat Terrain H2O Work Boot Hero Item","id":"91003","url":"/app/common/item/item.nl?id=91003","status":"verified_openable","openable":true,"openableUrl":"/app/common/item/item.nl?id=91003"},{"label":"Matrix item / proof item","role":"matrix_or_proof_item","name":"Ariat Core Boot Size Color Matrix","id":"91004","url":"/app/common/item/item.nl?id=91004","status":"verified_openable","openable":true,"openableUrl":"/app/common/item/item.nl?id=91004"},{"label":"Component item 1","role":"component_item","name":"Ariat Brown Leather Upper Component","id":"91005","url":"/app/common/item/item.nl?id=91005","status":"verified_openable","openable":true,"openableUrl":"/app/common/item/item.nl?id=91005"}]
- PASS w137_drawer_import_smoke_opens_numeric_supported_urls_only: {"openAnchorCount":9,"links":[{"label":"Customer","role":"customer","name":"Ariat International Outdoor Retail Account","id":"91001","url":"/app/common/entity/custjob.nl?id=91001","status":"verified_openable","openable":true,"openableUrl":"/app/common/entity/custjob.nl?id=91001"},{"label":"Sales Order / demo transaction","role":"sales_order","name":"Ariat Seasonal Footwear Availability Demo Order","id":"91002","url":"/app/accounting/transactions/salesord.nl?id=91002","status":"verified_openable","openable":true,"openableUrl":"/app/accounting/transactions/salesord.nl?id=91002"},{"label":"Hero item","role":"hero_item","name":"Ariat Terrain H2O Work Boot Hero Item","id":"91003","url":"/app/common/item/item.nl?id=91003","status":"verified_openable","openable":true,"openableUrl":"/app/common/item/item.nl?id=91003"},{"label":"Matrix item / proof item","role":"matrix_or_proof_item","name":"Ariat Core Boot Size Color Matrix","id":"91004","url":"/app/common/item/item.nl?id=91004","status":"verified_openable","openable":true,"openableUrl":"/app/common/item/item.nl?id=91004"},{"label":"Component item 1","role":"component_item","name":"Ariat Brown Leather Upper Component","id":"91005","url":"/app/common/item/item.nl?id=91005","status":"verified_openable","openable":true,"openableUrl":"/app/common/item/item.nl?id=91005"}]}
- PASS w137_build_and_run_consultant_usable_with_numeric_ids:  <div class="idb-cockpit-section"> <div class="idb-card idb-accent idb-w83-dcc-handoff-operator-review idb-w114-review-handoff idb-w124-build-results"> <div class="idb-section-title">Build Results</div> <div class="idb-run-action-card idb-w114-request-summary"> <div class="idb-status-key">What the consultant requested</div> <div class="idb-strong">Ariat International</div> <div class="idb-copy">Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.</div> </div> <div class="idb-status-strip"> <div class="idb-status-cell"> <div class="idb-status-key">1. Result</div> <div class="idb-status-value">Ready to export</div> <div class="idb-copy">Final names are imported for the live demo.</div> </div> <div class="idb-status-cell"> <div class="idb-status-key">2. Demo path</div> <div class="idb-status-value">Apparel &amp; Accessories</div> <div class="idb-copy">Style-to-Availability Readiness</div> </div> <div class="idb-status-cell"> <div class="idb-status-key">3. Boundary</div> <div class="idb-status-value">Export only</div> <div class="idb-copy">The build engine owns generated records.</div> </div
- PASS w137_targeted_visual_testing_required_not_faked: Actual NetSuite record-page visual proof requires real sandbox records from the internal build engine/operator run.
- PASS w137_no_write_invocation_or_transaction_from_drawer: no drawer write/invocation signatures present
- PASS w137_state_authority_handoff_parity_preserved: {"schema":"idb.w92-state-authority.v1","recommendedLaneId":"apparel_accessories","recommendedLaneName":"Apparel & Accessories","recommendedProofAnchor":"Style / SKU Matrix","selectedLaneId":"apparel_accessories","selectedLaneName":"Apparel & Accessories","selectedProofAnchor":"Style / SKU Matrix","confirmedLaneId":"apparel_accessories","confirmedLaneName":"Apparel & Accessories","exportedLaneId":"apparel_accessories","exportedLaneName":"Apparel & Accessories","laneSelectionSource":"consultant_confirmed","confidenceState":"needs_confirmation","confidenceSource":"website_evidence_v1","hasRecommendedMismatch":false,"hasConfirmedMismatch":false,"handoffEligible":true,"handoffBlockers":[],"noRegression":{"websiteEvidenceOwnsIdentity":true,"notesRole":"story_only","dccOwnsObjectGeneration":true,"noSuiteScriptInvocationFromIdb":true,"noIdbTransactionWrite":true}}

## Best Next Codex Prompt

Move through W137R: Review Real Numeric ID Visual Evidence. Use the operator-provided W137 final generated names JSON with actual numeric internal ids, drawer trace export, and screenshots proving Customer, demo transaction, hero item, matrix/proof item, and component Open links load actual NetSuite record pages. Grade whether every numeric id maps to an existing record, whether any URL showed invalid number, unexpected error, or “That record does not exist,” and whether Build/Run remain consultant-usable. Preserve no drawer writes, no SuiteScript invocation from the drawer, no transaction writes from the drawer, consultant confirmation required, state authority and handoff parity, no-submit rollback, and internal build engine ownership. Output graded evidence, pass/fail decision, remediation if any record is missing, W137R report, whether broader visual NetSuite testing is required, and the best next Codex prompt.
