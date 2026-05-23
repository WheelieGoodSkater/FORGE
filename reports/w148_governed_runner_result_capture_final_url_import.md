# W148 Governed Runner Result Capture And Final URL Import

Status: final_urls_imported_after_result_capture_validation

## Decision

PASS_RESULT_CAPTURE_VALIDATED__FINAL_URLS_IMPORTED

## Result-Capture Contract

- Source runner task id: task_w147_real_sandbox_001
- Required records: customer, demoTransaction, heroItem, matrixProofItem, componentItem
- Import target: state.dccFinalNamingResult
- Import authority: names_and_urls_only
- Drawer write authority: none
- Record existence proof: not_claimed_until_targeted_visual_record_page_landing

Rejected when:

- runner task is pending
- any required record is missing
- any internal id is non-numeric
- any URL path is unsupported
- any URL id does not match the internal id
- any URL contains preview or replacement tokens

## Final Generated Names JSON

- Customer: Ariat International Outdoor Retail Account (91201) /app/common/entity/custjob.nl?id=91201
- Demo transaction: Ariat Seasonal Footwear Availability Demo Order (91202) /app/accounting/transactions/salesord.nl?id=91202
- Hero item: Ariat Terrain H2O Work Boot Hero Item (91203) /app/common/item/item.nl?id=91203
- Matrix/proof item: Ariat Core Boot Size Color Matrix (91204) /app/common/item/item.nl?id=91204
- Component item: Ariat Brown Leather Upper Component (91205) /app/common/item/item.nl?id=91205

## Import Evidence

- Pending capture valid: false
- Malformed capture valid: false
- Complete capture valid: true
- Final names imported: true
- Navigation status: using_dcc_final_names
- Build uses imported names: true
- Run uses imported names: true
- Active Open anchors: 9
- Link pending labels: 0

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual testing required for record-page landing: Yes, next.
- Broader visual NetSuite testing required: No.

Reason: W148 validates and imports numeric ids plus supported URLs into IDB. A narrow visual open-link test is the next proof that those URLs land on actual NetSuite record pages rather than Notice/Error pages.

## Trace Samples

- Data: /path/to/workspace/intelligent demo builder drawer/data/w148_governed_runner_result_capture_final_url_import.json
- Trace: /path/to/workspace/intelligent demo builder drawer/trace_samples/w148_governed_runner_result_capture_final_url_import_trace.json

## Best Next Codex Prompt

Move through W149: Targeted Final URL Open-Link Visual Verification. Use the W148 final generated names JSON imported from governed runner result capture to perform only the narrow visual NetSuite test needed now: click Customer, demo transaction, hero item, matrix/proof item, and component item Open links and prove each lands on an actual record page, not a Notice/Error/placeholder page. Do not create records from the drawer, do not invoke SuiteScript from the drawer, and do not create transactions from the drawer. Preserve consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output targeted visual evidence, record page landing checklist, trace samples, W149 report, broader visual testing decision, and best next Codex prompt.
