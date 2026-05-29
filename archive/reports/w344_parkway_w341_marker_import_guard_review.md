# W344: Parkway W341 Marker Import Guard Review

## Trace Reviewed

`/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780092135325.json`

## Decision

The W343 adapter fix is live and the W341 runner marker is now live.

The run still failed import because the drawer normalized the returned `supporting_sku` record from the legacy `componentItems` slot back into `component_item`, then W214 applied the Manufacturing=false component-name rejection.

## Evidence

- W341 marker: `W341 prospect-specific proof naming active`
- Proof noun: `Breaker`
- Resolved mode: `distribution_replenishment`
- Runner policy preserved: yes
- Result capture completed: yes
- Real ids and URLs returned: yes
- Import accepted: no

Returned proof records:

- `Parkway Breaker Availability SKU - ALDISTRI-RGTLR4-FH0`
- `Parkway Branch Availability / Replenishment Flow - ALDISTRI-RGTLR4-FH0`
- `Fulfillment Support SKU - Parkway Contractor Supply Component - ALDISTRI-RGTLR4-FH0`

## Root Cause

The completed result correctly carried canonical role `supporting_sku`, but the drawer import normalizer hardcoded all legacy `componentItems` entries to `component_item`.

That erased the distribution-safe role before W214 semantic validation.

## Fix Applied

- Drawer now preserves `supporting_sku` and `ingredient_or_component_item` roles when normalizing legacy component slots.
- Drawer version bumped to `1.0.3` for Tampermonkey auto-update.
- Runner now directly uses the W341 `componentItemName` policy name for distribution support items, so future records should be named like `Parkway Safe Substitute Fulfillment Support SKU`.

## Boundaries

- W151/W214/W245 import guard remains active
- W144 adapter path unchanged
- no drawer-created records
- no drawer transaction writes
- no fake Open links
- runner remains record creation authority

## Next Block

Move through W345: Upload W344 Drawer And Runner Role/Name Fix Then Rerun Parkway Smoke. Update Tampermonkey to drawer `1.0.3`, upload the runner with distribution support-item policy naming, rerun Parkway, and verify import succeeds with Open links plus W341 marker active. Preserve W151/W214/W245 validation, no drawer-created records, no transaction writes, no fake Open links, and W144 adapter behavior. Output fresh trace review, imported-record pass/fail, returned proof names, Open-link status, and next release decision.
