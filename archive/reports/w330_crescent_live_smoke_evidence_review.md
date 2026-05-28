# W330: Crescent Live Smoke Evidence Review

## Decision

Status: `live_writeback_keep_story_needs_attention`

Connection decision: `keep`

Story / proof surface decision: `needs_attention_before_dealer_hardgoods`

Dealer / Hardgoods unlock: `no_go_until_post_import_story_label_cleanup`

The uploaded Crescent Electric Supply smoke evidence proves the protected FORGE writeback path is working: submit captured a runnerTaskId, the current completed result was imported, returned NetSuite records have numeric ids and supported Open links, and Open links are shown after valid import.

The run should not yet unlock Dealer / Hardgoods expansion because the consultant-facing story/proof surface still has post-import polish issues:

- The proof CTA still says `Confirm lane before opening proof records` after records are already imported and openable.
- Some Run/navigation layers still show generic legacy labels such as `Hero item`, `Matrix item / proof item`, and `Component item 1` instead of the W322/W245 consultant labels.
- Trace layers still contain legacy raw labels such as `Finished/Assembly Item` and `Formula or Batch Structure`; these did not appear prominently in the screenshots, but they remain a vocabulary-safety risk.
- Story copy is useful and claim-safe, but still somewhat generic around `Inventory / Fulfillment` instead of consistently saying contractor counter availability, branch transfer/replenishment, callbacks, and supplier portal pressure.

## Evidence Reviewed

Trace: `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1779996482573.json`

Screenshots reviewed from the user message:

- Plan tab classification for Crescent Electric Supply.
- Build results with imported returned records.
- ROI / Competitive consultant value coach.
- Run tab Open / Prove / Handle objection story controls.
- Trace tab showing `Records Imported`.

## Live Path Findings

- Customer: `Crescent Electric Supply`
- Website: `https://www.crescentelectric.com/`
- Selected lane: `Industrial Distribution & Branch Fulfillment`
- Runner task captured: yes.
- Imported Sales Order: `SO2691`
- Returned records imported: yes.
- Open links supported: yes.
- W151/W214/W245 import acceptance: yes, based on imported final records and verified Open-link authority.
- Drawer-created records: no evidence introduced.
- Drawer transaction writes: no evidence introduced.

## Returned Records Reviewed

- Customer: `Crescent Electric Supply Customer Account`, id `2422`, Open link present.
- Sales Order: `SO2691`, id `82829`, Open link present.
- Product SKU: `Crescent Electric Supply Product Availability SKU - DISTRIBU-PVLPIZ-IVH`, id `4145`, Open link present.
- Availability / Replenishment Flow: `Branch Availability / Replenishment Flow - Crescent Electric - DISTRIBU-PVLPIZ-IVH`, id `4146`, Open link present.
- Supporting SKU: `Crescent Electric Supply Fulfillment Support SKU - DISTRIBU-PVLPIZ-IVH`, id `4147`, Open link present.

## Story Quality Findings

What worked:

- Buyer problem is grounded in contractor counter availability.
- Proof path is distribution-safe and uses branch availability / replenishment.
- Objection handling is claim-safe.
- ROI framing stays baseline-first.
- Competitive contrast references spreadsheets, manual inventory reports, QuickBooks, warehouse tools, Odoo, and Microsoft Dynamics 365 without over-claiming.
- N/LLM remains advisory-only.

Needs attention:

- Once records are imported, the proof CTA should shift from lane confirmation to `Use imported records to prove the path`.
- Run controls should prefer consultant labels over legacy labels.
- Electrical story shaping should mention contractor counter, branch transfer, replenishment, supplier portals, callbacks, and margin-safe substitutes more consistently.

## Next Block

Select W331 as a focused post-import story/proof label polish block before Dealer / Hardgoods expansion.

W331 should not touch W144 submit/refresh/import, W151/W214/W245 validation, source lane packs, record creation authority, or Open-link authority.
