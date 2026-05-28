# W334: Post-Import Proof CTA Compression And Electrical Story Specificity Polish

## Live Evidence Baseline

Trace reviewed: `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780006822962.json`

Customer: Harborline Electrical Supply

Decision: `keep_needs_story_polish`

## What Worked

- W332 installed marker was visible and exported: `W332 post-import story polish active`.
- Build writeback succeeded through the protected W144 path.
- Runner task id was captured for the current attempt.
- Completed result imported through W151/W214/W245.
- Returned records had numeric ids and supported NetSuite Open links.
- The old post-import CTA `Confirm lane before opening proof records` was absent.
- Normal Run surfaces used consultant labels instead of raw legacy labels.

## Returned Records Reviewed

- Customer: Harborline Electrical Supply Customer Account, id `2622`
- Sales Order: SO2693, id `83029`
- Product SKU: Harborline Electrical Supply Product Availability SKU - DUSTRIAL-Q1WVLT-Y8O, id `4345`
- Availability/Replenishment Flow: Branch Availability / Replenishment Flow - Harborline Electri - DUSTRIAL-Q1WVLT-Y8O, id `4346`
- Supporting SKU: Fulfillment Support SKU - Harborline Electrical Supply Compon - DUSTRIAL-Q1WVLT-Y8O, id `4347`

## Remaining Issues Fixed In W334

- The post-import proof CTA had correct intent but too much text for the drawer's three-column mobile layout.
- Electrical distribution story copy needed to lean harder into the first-call notes: contractor counter, branch inventory checks, supplier portals, transfer spreadsheets, text threads, urgent substitutes, and margin-safe alternates.
- Run/navigation needed display aliases for truncated or internal-looking returned record names while preserving raw NetSuite names, ids, and Open links.
- ROI/Competitive should prefer note-specific pressure instead of generic QuickBooks/Odoo/Microsoft fallback when the notes name better current-workflow pressure.
- Close-value script copy could produce double punctuation.

## Guardrails

- W144 submit/refresh/import unchanged.
- W151/W214/W245 validation unchanged.
- `src/contracts/lanePacks.js` unchanged.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.
