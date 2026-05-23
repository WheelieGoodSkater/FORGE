# W135 Real Record Existence Evidence Review

Status: blocked_real_records_not_provided

## Decision

FAIL_REAL_RECORD_EXISTENCE__PLACEHOLDER_IDS_IMPORTED

## Evidence Finding

- Build and Run rendered imported names.
- Customer Open reached NetSuite, but NetSuite returned: Invalid number REPLACE_REAL_CUSTOMER_ID.
- The imported final generated names JSON still contained replacement tokens, not real internal ids.
- Record existence is not proven.

## Corrected Link Authority

- Customer: Ariat International Outdoor Retail Account / REPLACE_REAL_CUSTOMER_ID / trace=verified_openable / corrected=preview_placeholder
- Sales Order / demo transaction: Ariat Seasonal Footwear Availability Demo Order / REPLACE_REAL_SALES_ORDER_ID / trace=verified_openable / corrected=preview_placeholder
- Hero item: Ariat Terrain H2O Work Boot Hero Item / REPLACE_REAL_HERO_ITEM_ID / trace=verified_openable / corrected=preview_placeholder
- Matrix item / proof item: Ariat Core Boot Size Color Matrix / REPLACE_REAL_MATRIX_ITEM_ID / trace=verified_openable / corrected=preview_placeholder
- Component item 1: Ariat Brown Leather Upper Component / REPLACE_REAL_COMPONENT_ITEM_ID / trace=verified_openable / corrected=preview_placeholder

## Remediation

- Tightened drawer link authority so REPLACE_REAL_* and similar unresolved tokens cannot render active Open links.
- Require numeric NetSuite internal id both in the record id field and URL id query before verified_openable.
- Rerun W135 only after the internal build engine returns actual numeric internal ids for the required records.

## Best Next Codex Prompt

Move through W136: Real ID Enforcement Retest And Build Engine Output Fix. Use the W135 evidence showing REPLACE_REAL_* placeholder ids were imported and incorrectly appeared as Open before the link authority hardening. Verify the drawer now renders unresolved replacement ids as Link pending or Needs real URL, then update the internal build engine/operator output path so final generated names JSON contains actual numeric NetSuite internal ids and supported URLs for Customer, demo transaction, hero item, matrix/proof item, and component records. Preserve no drawer writes, no SuiteScript invocation from the drawer, no transaction writes from the drawer, consultant confirmation required, state authority and handoff parity, no-submit rollback, and internal build engine ownership. Output corrected import smoke, real build-engine output requirements, trace samples, W136 report, whether targeted visual NetSuite testing is required, and the best next Codex prompt.
