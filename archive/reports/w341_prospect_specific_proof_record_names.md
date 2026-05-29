# W341: Prospect-Specific Proof Record Names And Display Aliases

## Evidence Baseline

Trace reviewed:

`/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780072239583.json`

The Parkway live smoke verified:

- W339 marker visible and exported
- records imported
- Open links valid
- imported-proof-record UX active
- W144 submit/refresh/import remained healthy

## Finding

The connection path is not the issue. The remaining issue is naming quality.

The imported proof records were valid, but normal consultant output felt too generic because the item proof names collapsed toward role nouns:

- `Product Availability SKU`
- `Branch Availability / Replenishment Flow`
- `Fulfillment Support SKU`

The raw returned Product SKU had customer context, but still used generic product language:

- `Parkway Contractor Electrical Supply Product Availability SK - TRICALSU-R4WL44-61A`

## W341 Polish

W341 adds a prospect-specific proof naming helper for distribution/electrical contractor-counter demos.

When first-call notes mention concrete product/category nouns such as breakers, panels, conduit, fittings, disconnects, safety stock, wire, or replacement parts, the runner can generate safer, more readable proof names such as:

- `Parkway Breaker Availability SKU`
- `Parkway Branch Availability / Replenishment Flow`
- `Parkway Safe Substitute Fulfillment Support SKU`

The drawer display layer now preserves readable returned proof names in normal consultant Run/Build surfaces instead of flattening them to generic labels.

W341 also emits a live runner naming marker so the next smoke can prove whether the deployed runner returned the naming policy:

- `W341 prospect-specific proof naming active`

If Trace still shows `W341 runner naming marker not returned` after a fresh imported result, the drawer is current but the deployed runner did not return the W341 naming marker.

## Boundaries

- W144 submit/refresh/import unchanged
- W151/W214/W245 validation unchanged
- source lane packs unchanged
- Open-link authority unchanged
- drawer does not create records
- drawer does not add transaction writes
- no fake Open links
- runner remains the record creation authority
