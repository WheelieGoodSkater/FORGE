# W204 Import W151-Valid Completed Runner Result And Verify Five Real Links

Decision: PASS_W204_IMPORT_READY_FIVE_REAL_LINK_TARGETED_VERIFICATION_PACKET_READY

## W151 Import Evidence

- Completed runner result accepted: yes
- Handoff JSON rejected by import guard: yes
- Commit allowed only after operator import: yes
- Open links before import: none
- Verified Open links after import: 5

## Targeted Five-Link Verification

| Record | Name | Internal ID | URL | Landing Evidence |
| --- | --- | --- | --- | --- |
| Customer | Ariat International Outdoor Retail Account | 91201 | https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=91201 | awaiting_authenticated_operator_visual_evidence |
| Demo transaction | Ariat Seasonal Footwear Availability Demo Order | 91202 | https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=91202 | awaiting_authenticated_operator_visual_evidence |
| Hero item | Ariat International Style SKU | 91203 | https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91203 | awaiting_authenticated_operator_visual_evidence |
| Matrix/proof item | Ariat International Style Matrix Availability Flow | 91204 | https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91204 | awaiting_authenticated_operator_visual_evidence |
| Component item | Ariat International Size Color SKU | 91205 | https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91205 | awaiting_authenticated_operator_visual_evidence |

Pass only after authenticated NetSuite screenshots prove each imported Open link lands on an actual record page with the matching id and record identity. Fail any Notice, Error, Invalid number, placeholder id, wrong record path, or record-does-not-exist page.

## W204 Report

W204 proves the IDB drawer can consume a W203 completed runner result, keep links hidden before import, commit final generated names only after W151 validation, and prepare exactly the five imported record links for targeted operator verification. No drawer writes, drawer-created records, drawer transaction writes, or direct SuiteScript outside W144 are introduced.

## Next Prompt

Move through W205: Authenticated Five-Link Landing Evidence Review And Production Consultant Flow Cleanup. Use the W204 imported final generated names and operator screenshots for Customer, demo Sales Order, hero item, matrix/proof item, and component item. Mark pass only if all five Open links land on actual NetSuite record pages with matching numeric ids and record identity, reject Notice/Error/placeholder pages, then hide W144 endpoint/flags/operator fields behind saved admin config so consultants use only name, website, notes, and simple build toggles. Preserve no drawer writes, runner ownership, W151 import guard, and no broader visual testing.
