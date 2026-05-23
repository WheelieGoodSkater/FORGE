# W134 Real Build Result URL Contract And Live Link Retest

Status: real_build_result_url_contract_ready

## Real URL Result Contract

- customer: /app/common/entity/custjob.nl?id=<real_internal_id>
- sales_order: /app/accounting/transactions/salesord.nl?id=<real_internal_id>
- hero_item: /app/common/item/item.nl?id=<real_internal_id>
- matrix_or_proof_item: /app/common/item/item.nl?id=<real_internal_id>
- component_item: /app/common/item/item.nl?id=<real_internal_id>

## Required Rules

- Each openable record must include a real numeric NetSuite internal id.
- Each openable record must include a supported NetSuite record URL.
- Preview placeholder ids must remain linkAuthority=preview_placeholder and render Link pending.
- The drawer must never create, submit, queue, or invoke SuiteScript to make a link openable.

## Live Link Retest Evidence

- Preview placeholder Open anchors: 0
- Preview placeholder Link pending count: 9
- Real URL Open anchors: 9
- Real URL statuses: Customer=verified_openable, Sales Order / demo transaction=verified_openable, Hero item=verified_openable, Matrix item / proof item=verified_openable, Component item 1=verified_openable

## Validator Gates

- PASS w134_inherits_w133_link_authority: {"w133":"verified_record_link_authority_ready"}
- PASS w134_real_url_contract_requires_internal_ids_and_supported_paths: [{"label":"Customer","name":"Ariat International Outdoor Retail Account","id":"12345","url":"/app/common/entity/custjob.nl?id=12345","status":"verified_openable","openable":true},{"label":"Sales Order / demo transaction","name":"Ariat Seasonal Footwear Availability Demo Order","id":"23456","url":"/app/accounting/transactions/salesord.nl?id=23456","status":"verified_openable","openable":true},{"label":"Hero item","name":"Ariat Terrain H2O Work Boot Hero Item","id":"34567","url":"/app/common/item/item.nl?id=34567","status":"verified_openable","openable":true},{"label":"Matrix item / proof item","name":"Ariat Core Boot Size Color Matrix","id":"45678","url":"/app/common/item/item.nl?id=45678","status":"verified_openable","openable":true},{"label":"Component item 1","name":"Ariat Brown Leather Upper Component","id":"56789","url":"/app/common/item/item.nl?id=56789","status":"verified_openable","openable":true}]
- PASS w134_preview_placeholder_visual_retest_pending: {"links":[{"label":"Customer","name":"Ariat International Outdoor Retail Account","id":"preview-customer-123","url":"/app/common/entity/custjob.nl?id=preview-customer-123","status":"preview_placeholder","openable":false},{"label":"Sales Order / demo transaction","name":"Ariat Seasonal Footwear Availability Demo Order","id":"preview-salesorder-456","url":"/app/accounting/transactions/salesord.nl?id=preview-salesorder-456","status":"preview_placeholder","openable":false},{"label":"Hero item","name":"Ariat Terrain H2O Work Boot Hero Item","id":"preview-item-789","url":"/app/common/item/item.nl?id=preview-item-789","status":"preview_placeholder","openable":false},{"label":"Matrix item / proof item","name":"Ariat Core Boot Size Color Matrix","id":"preview-matrix-790","url":"/app/common/item/item.nl?id=preview-matrix-790","status":"preview_placeholder","openable":false},{"label":"Component item 1","name":"Ariat Brown Leather Upper Component","id":"preview-component-791","url":"/app/common/item/item.nl?id=preview-component-791","status":"preview_placeholder","openable":false}],"openAnchorCount":0,"linkPendingCount":9}
- PASS w134_real_url_visual_retest_open: {"links":[{"label":"Customer","name":"Ariat International Outdoor Retail Account","id":"12345","url":"/app/common/entity/custjob.nl?id=12345","status":"verified_openable","openable":true},{"label":"Sales Order / demo transaction","name":"Ariat Seasonal Footwear Availability Demo Order","id":"23456","url":"/app/accounting/transactions/salesord.nl?id=23456","status":"verified_openable","openable":true},{"label":"Hero item","name":"Ariat Terrain H2O Work Boot Hero Item","id":"34567","url":"/app/common/item/item.nl?id=34567","status":"verified_openable","openable":true},{"label":"Matrix item / proof item","name":"Ariat Core Boot Size Color Matrix","id":"45678","url":"/app/common/item/item.nl?id=45678","status":"verified_openable","openable":true},{"label":"Component item 1","name":"Ariat Brown Leather Upper Component","id":"56789","url":"/app/common/item/item.nl?id=56789","status":"verified_openable","openable":true}],"openAnchorCount":9}
- PASS w134_build_and_run_consultant_usable:  <div class="idb-cockpit-section"> <div class="idb-card idb-accent idb-w83-dcc-handoff-operator-review idb-w114-review-handoff idb-w124-build-results"> <div class="idb-section-title">Build Results</div> <div class="idb-run-action-card idb-w114-request-summary"> <div class="idb-status-key">What the consultant requested</div> <div class="idb-strong">Ariat International</div> <div class="idb-copy">Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.</div> </div> <div class="idb-status-strip"> <div class="idb-status-cell"> <div class="idb-status-key">1. Result</div> <div class="idb-status-value">Ready to export</div> <div class="idb-copy">Final names are imported for the live demo.</div> </div> <div class="idb-status-cell"> <div class="idb-status-key">2. Demo path</div> <div class="idb-status-value">Apparel &amp; Accessories</div> <div class="idb-copy">Style-to-Availability Readiness</div> </div> <div class="idb-status-cell"> <div class="idb-status-key">3. Boundary</div> <div class="idb-status-value">Export only</div> <div class="idb-copy">The build engine owns generated records.</div> </div
- PASS w134_no_write_invocation_or_transaction_from_drawer: no drawer write/invocation signatures present
- PASS w134_state_authority_handoff_parity_and_ownership_preserved: {"schema":"idb.w92-state-authority.v1","recommendedLaneId":"apparel_accessories","recommendedLaneName":"Apparel & Accessories","recommendedProofAnchor":"Style / SKU Matrix","selectedLaneId":"apparel_accessories","selectedLaneName":"Apparel & Accessories","selectedProofAnchor":"Style / SKU Matrix","confirmedLaneId":"apparel_accessories","confirmedLaneName":"Apparel & Accessories","exportedLaneId":"apparel_accessories","exportedLaneName":"Apparel & Accessories","laneSelectionSource":"consultant_confirmed","confidenceState":"needs_confirmation","confidenceSource":"website_evidence_v1","hasRecommendedMismatch":false,"hasConfirmedMismatch":false,"handoffEligible":true,"handoffBlockers":[],"noRegression":{"websiteEvidenceOwnsIdentity":true,"notesRole":"story_only","dccOwnsObjectGeneration":true,"noSuiteScriptInvocationFromIdb":true,"noIdbTransactionWrite":true}}

## Visual NetSuite Testing

Required now: Yes.

Broader visual NetSuite testing required: Yes. A real sandbox build-engine result should be imported next to verify actual account records, not just representative real URL shapes.

## Best Next Codex Prompt

Move through W135: Internal Build Engine Real URL Handoff Pilot. Use the W134 real build result URL contract to update the internal build engine handoff/output so customer, demo transaction, hero item, matrix/proof item, and component records return real NetSuite internal ids and supported record URLs after sandbox preview/run. Do not let the drawer create records, invoke SuiteScript, or write transactions. Run an operator-only sandbox pilot with a real build-engine result JSON, import it into the drawer, and visually verify Build Results and Run show active Open links only for verified real URLs while preview placeholders remain Link pending. Preserve consultant confirmation required, state authority and handoff parity, no-submit rollback, and internal build engine ownership of generated records. Output build-engine output contract update, imported real-result JSON sample, visual link evidence, trace samples, W135 report, whether broader visual NetSuite testing is required, and the best next Codex prompt.
