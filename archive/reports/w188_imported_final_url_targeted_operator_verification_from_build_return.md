# W188 Imported Final URL Targeted Operator Verification Packet From Build Return

Decision: imported_final_url_targeted_operator_verification_ready

## Exact Operator Steps

| Step | Action | Pass Criteria |
| --- | --- | --- |
| 1 | Open IDB Build after the completed runner result import. | Build shows final generated names imported; The final generated NetSuite records card shows Customer, demo transaction, hero item, matrix/proof item, and component item; Each row shows Open, not Link pending |
| 2 | Click Customer Open. | URL path includes /app/common/entity/custjob.nl; URL id equals 501234; The page is an actual NetSuite record page for Ariat International Outdoor Retail Account; The page is not Notice, Error, Invalid number, or record-does-not-exist |
| 3 | Click Demo transaction Open. | URL path includes /app/accounting/transactions/salesord.nl; URL id equals 601234; The page is an actual NetSuite record page for Ariat Seasonal Footwear Availability Demo Order; The page is not Notice, Error, Invalid number, or record-does-not-exist |
| 4 | Click Hero item Open. | URL path includes /app/common/item/item.nl; URL id equals 701234; The page is an actual NetSuite record page for Ariat Terrain H2O Work Boot Hero Item; The page is not Notice, Error, Invalid number, or record-does-not-exist |
| 5 | Click Matrix/proof item Open. | URL path includes /app/common/item/item.nl; URL id equals 701235; The page is an actual NetSuite record page for Ariat Core Boot Size Color Matrix; The page is not Notice, Error, Invalid number, or record-does-not-exist |
| 6 | Click Component item Open. | URL path includes /app/common/item/item.nl; URL id equals 701236; The page is an actual NetSuite record page for Ariat Brown Leather Upper Component; The page is not Notice, Error, Invalid number, or record-does-not-exist |

## Screenshots Needed

| Screenshot | Must Show | Required |
| --- | --- | --- |
| IDB Build imported records card | Build tab; Final generated names imported; All five imported records; Open visible for each record | Required |
| Customer record landing page | NetSuite URL bar; URL id 501234; Ariat International Outdoor Retail Account; No Notice or Error page | Required |
| Demo transaction record landing page | NetSuite URL bar; URL id 601234; Ariat Seasonal Footwear Availability Demo Order; No Notice or Error page | Required |
| Hero item record landing page | NetSuite URL bar; URL id 701234; Ariat Terrain H2O Work Boot Hero Item; No Notice or Error page | Required |
| Matrix/proof item record landing page | NetSuite URL bar; URL id 701235; Ariat Core Boot Size Color Matrix; No Notice or Error page | Required |
| Component item record landing page | NetSuite URL bar; URL id 701236; Ariat Brown Leather Upper Component; No Notice or Error page | Required |
| IDB Run imported navigation pivots | Run tab; Imported final names used in the script or navigation pivots | Optional |

## Guarded Harness

| Gate | Result |
| --- | --- |
| Packet ready after W187 import | PASS |
| Requires W151-valid numeric ids and supported URLs | PASS |
| Covers five targeted records | PASS |
| Exact operator steps ready | PASS |
| Screenshot list ready | PASS |
| Fail criteria ready | PASS |
| Blocked without W187 import | PASS |
| Broader visual testing blocked | PASS |
| No-regression boundaries preserved | PASS |

## Visual Testing Decision

Targeted-only: click Customer, demo transaction, hero item, matrix/proof item, and component item Open links. Broader visual NetSuite testing remains blocked.

## Trace Samples

- /path/to/workspace/intelligent demo builder drawer/trace_samples/w188_imported_final_url_targeted_operator_verification_from_build_return_trace.json

## Best Next Codex Prompt

Move through W189: Targeted Open-Link Visual Evidence Intake And Pass/Fail Review. Use the W188 targeted operator verification packet and uploaded screenshots/trace evidence to review whether Customer, demo transaction, hero item, matrix/proof item, and component item Open links landed on actual NetSuite record pages. Mark pass only if each page is not Notice/Error/placeholder and shows numeric-id supported NetSuite URL plus record identity. Preserve no drawer writes, no drawer transaction writes, no drawer-created records, no SuiteScript invocation outside approved server adapter path, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no broader visual testing. Output evidence review, pass/fail table, trace samples, W189 report, broader visual testing decision, and best next Codex prompt.
