# W177 Imported URL Targeted Open-Link Verification Packet

Generated: 2026-05-17T21:41:16.299Z

Decision: PASS_IMPORTED_URL_TARGETED_OPEN_LINK_VERIFICATION_PACKET_READY__TARGETED_ONLY

## Targeted Verification Packet

- Source: W176 completed runner result import commit
- Targeted records: 5
- Targeted only: true
- Broader visual testing required: false
- Drawer creates records: false
- Drawer invokes SuiteScript: false

## Exact Operator Steps

1. Confirm IDB Build shows Build results imported and Open links for the final generated records.
2. Click Customer Open and capture a screenshot showing URL bar plus the record page identity.
3. Click Demo transaction Open and capture a screenshot showing URL bar plus the record page identity.
4. Click Hero item Open and capture a screenshot showing URL bar plus the record page identity.
5. Click Matrix/proof item Open and capture a screenshot showing URL bar plus the record page identity.
6. Click Component item Open and capture a screenshot showing URL bar plus the record page identity.
7. Stop and report immediately if any page shows Notice, Error, Invalid number, record does not exist, or a mismatched id.
8. Do not test broader NetSuite UI behavior in this block.

## Records To Verify

- Customer: Ariat International Outdoor Retail Account / id=501234 / https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=501234
- Demo transaction: Ariat Seasonal Footwear Availability Demo Order / id=601234 / https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234
- Hero item: Ariat Terrain H2O Work Boot Hero Item / id=701234 / https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234
- Matrix/proof item: Ariat Core Boot Size Color Matrix / id=701235 / https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235
- Component item: Ariat Brown Leather Upper Component / id=701236 / https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236

## Screenshot Requirements

- Customer: w177-customer-501234.png; must show NetSuite URL bar, record page identity, record name or numeric internal id, no Notice/Error banner
- Demo transaction: w177-sales_order-601234.png; must show NetSuite URL bar, record page identity, record name or numeric internal id, no Notice/Error banner
- Hero item: w177-hero_item-701234.png; must show NetSuite URL bar, record page identity, record name or numeric internal id, no Notice/Error banner
- Matrix/proof item: w177-matrix_or_proof_item-701235.png; must show NetSuite URL bar, record page identity, record name or numeric internal id, no Notice/Error banner
- Component item: w177-component_item-701236.png; must show NetSuite URL bar, record page identity, record name or numeric internal id, no Notice/Error banner

## Guarded Harness

| Gate | Result |
| --- | --- |
| startsFromW176 | PASS |
| packetHookReady | PASS |
| targetedPacketReady | PASS |
| coversFiveRequiredRecords | PASS |
| allRecordsHaveNumericIdsAndSupportedUrls | PASS |
| operatorStepsReady | PASS |
| pendingAndAdapterErrorNoMutationPreserved | PASS |
| broaderVisualTestingBlocked | PASS |
| traceSamplesReady | PASS |

## Visual Testing Decision

Targeted Open-link verification is ready. Broader NetSuite visual testing remains blocked.

## Trace Samples

- Data: /path/to/workspace/intelligent demo builder drawer/data/w177_imported_url_targeted_open_link_verification_packet.json
- Trace: /path/to/workspace/intelligent demo builder drawer/trace_samples/w177_imported_url_targeted_open_link_verification_packet_trace.json

## Best Next Codex Prompt

```text
Move through W178: Targeted Open-Link Evidence Intake And Record Landing Go/No-Go. Use the W177 targeted verification packet and the operator-provided screenshots or notes for Customer, demo transaction, hero item, matrix/proof item, and component item Open links. Mark each link as actual_record_page_verified only if the landed NetSuite page is not Notice/Error/Invalid number and shows the matching record name or numeric internal id. If all five pass, mark imported runner URLs record-landing verified; if any fail, keep final names imported but block record-existence readiness and route remediation to runner result capture. Preserve no drawer writes, no drawer SuiteScript invocation outside the approved server adapter path, no drawer transaction writes, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output W178 evidence intake report, go/no-go decision, trace samples, broader visual testing decision, and best next Codex prompt.
```
