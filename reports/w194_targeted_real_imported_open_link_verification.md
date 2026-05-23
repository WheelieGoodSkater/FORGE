# W194 Targeted Real Imported Open-Link Verification From W193

Decision: PASS_TARGETED_VERIFICATION_PACKET_READY_CURRENT_RUN_BLOCKED

## Current Run Evidence Review

- Current screenshot state: blocked_before_server_adapter
- Runner task captured: no
- Completed runner result imported: no
- Open links visible: no
- Targeted link test now: blocked

## Targeted Records After W193 Import

| Record | Name | Internal ID | Expected Path | Status |
| --- | --- | --- | --- | --- |
| Customer | Ariat International Outdoor Retail Account | 91201 | /app/common/entity/custjob.nl | Ready after import |
| Demo transaction | Ariat Seasonal Footwear Availability Demo Order | 91202 | /app/accounting/transactions/salesord.nl | Ready after import |
| Hero item | Ariat Terrain H2O Work Boot Hero Item | 91203 | /app/common/item/item.nl | Ready after import |
| Matrix/proof item | Ariat Core Boot Size Color Matrix | 91204 | /app/common/item/item.nl | Ready after import |
| Component item | Ariat Brown Leather Upper Component | 91205 | /app/common/item/item.nl | Ready after import |

## Exact Operator Steps

| Step | Action | Pass Criteria | Screenshot |
| --- | --- | --- | --- |
| 1 | Open IDB Build after the completed runner result import. | Build shows final generated names imported; The final generated NetSuite records card shows Customer, demo transaction, hero item, matrix/proof item, and component item; Each row shows Open, not Link pending | Yes |
| 2 | Click Customer Open. | URL path includes /app/common/entity/custjob.nl; URL id equals 91201; The page is an actual NetSuite record page for Ariat International Outdoor Retail Account; The page is not Notice, Error, Invalid number, or record-does-not-exist | Yes |
| 3 | Click Demo transaction Open. | URL path includes /app/accounting/transactions/salesord.nl; URL id equals 91202; The page is an actual NetSuite record page for Ariat Seasonal Footwear Availability Demo Order; The page is not Notice, Error, Invalid number, or record-does-not-exist | Yes |
| 4 | Click Hero item Open. | URL path includes /app/common/item/item.nl; URL id equals 91203; The page is an actual NetSuite record page for Ariat Terrain H2O Work Boot Hero Item; The page is not Notice, Error, Invalid number, or record-does-not-exist | Yes |
| 5 | Click Matrix/proof item Open. | URL path includes /app/common/item/item.nl; URL id equals 91204; The page is an actual NetSuite record page for Ariat Core Boot Size Color Matrix; The page is not Notice, Error, Invalid number, or record-does-not-exist | Yes |
| 6 | Click Component item Open. | URL path includes /app/common/item/item.nl; URL id equals 91205; The page is an actual NetSuite record page for Ariat Brown Leather Upper Component; The page is not Notice, Error, Invalid number, or record-does-not-exist | Yes |

## Screenshots Needed

| Screenshot | Must Show | Required |
| --- | --- | --- |
| IDB Build imported records card | Build tab; Final generated names imported; All five imported records; Open visible for each record | Required |
| Customer record landing page | NetSuite URL bar; URL id 91201; Ariat International Outdoor Retail Account; No Notice or Error page | Required |
| Demo transaction record landing page | NetSuite URL bar; URL id 91202; Ariat Seasonal Footwear Availability Demo Order; No Notice or Error page | Required |
| Hero item record landing page | NetSuite URL bar; URL id 91203; Ariat Terrain H2O Work Boot Hero Item; No Notice or Error page | Required |
| Matrix/proof item record landing page | NetSuite URL bar; URL id 91204; Ariat Core Boot Size Color Matrix; No Notice or Error page | Required |
| Component item record landing page | NetSuite URL bar; URL id 91205; Ariat Brown Leather Upper Component; No Notice or Error page | Required |
| IDB Run imported navigation pivots | Run tab; Imported final names used in the script or navigation pivots | Optional |

## Pass / Fail Evidence Review

Pass only when all five Open links land on actual record pages. Fail any Notice, Error, Invalid number, record-does-not-exist, placeholder id, wrong record path, or URL id mismatch.

## Visual Testing Decision

Targeted-only after imported URLs exist. The current run is blocked because Build is still before server adapter execution and no completed runner result has been imported. Broader visual NetSuite testing remains blocked/not required.

## Best Next Codex Prompt

Move through W195: Server Adapter Call Activation Or Result Import Recovery. Use the W194 finding that the current run is blocked before server adapter and has no imported URLs. Focus only on getting the approved server adapter call to execute or importing a real W151-valid completed runner result JSON from W191/W192. Do not request Open-link visual testing until Build shows imported final names and five active Open links. Preserve no drawer writes, no drawer transaction writes, no drawer-created records, no direct SuiteScript outside the approved server adapter path, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output activation/recovery steps, exact operator inputs, trace samples, W195 report, and the next production-readiness prompt.
