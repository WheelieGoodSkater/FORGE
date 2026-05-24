# W218 Upload Manifest

## Scope
- Work block: W218 Operator Smoke Packet Live Wording Freeze.
- Primary script: `idb-drawer.user.js`.
- Harness: `tools/run_operator_smoke_packet_live_wording_freeze_w218_harness.js`.
- Report: `reports/w218_operator_smoke_packet_live_wording_freeze.md`.
- Trace: `trace_samples/w218_operator_smoke_packet_live_wording_freeze_trace.json`.
- Data artifact: `data/w218_operator_smoke_packet_live_wording_freeze.json`.

## Upload Decision
- Upload/update the Tampermonkey drawer script: `idb-drawer.user.js`.
- No W144 adapter upload is needed.
- No runner upload is needed.
- No SuiteScript upload is needed for W218.
- No image lookup enablement is included.

## Frozen Review Headlines
- Complete non-manufacturing: `Build results are ready.`
- Complete manufacturing: `Build results are ready.`
- Partial food batch/WIP: `Food batch records are ready. WIP detail was not returned.`

## Frozen Run Actions
- Complete non-manufacturing: `Open Customer` / `Open Sales Order` / `Open Item`.
- Complete manufacturing: `Open Customer` / `Open Sales Order` / `Open Item`.
- Partial food batch/WIP: `Open Customer` / `Open Sales Order` / `Open Item` / `Use available records` / `WIP detail not returned`.

## Frozen Labels
- Complete non-manufacturing: Customer, Sales Order, Product SKU, Availability Flow, Channel Context.
- Complete manufacturing: Customer, Sales Order, Finished/Assembly Item, BOM or Assembly Structure, Component Item.
- Partial food batch/WIP: Customer, Sales Order, Finished Food/Batch Item, Formula or Batch Structure, Ingredient Item, Lot Context.

## Preserved Boundaries
- W151 import guard remains active.
- W214 operating-mode resolver remains authoritative.
- W215 semantic runner role mapping remains authoritative.
- W216 consultant-facing partial result copy remains authoritative.
- W217 operator-readable smoke packet remains available.
- Open links appear only after valid completed import with numeric internal ids and supported NetSuite URLs.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved W144 adapter path.
- Runner owns generated records.
- N/LLM remains advisory only.

## Validation
- `npm run harness:operator-smoke-wording-freeze-w218` -> PASS 10/10.
- `npm run harness:mode-aware-live-review-smoke-w217` -> PASS 9/9.
- `npm run harness:consultant-partial-result-review-w216` -> PASS 13/13.
- `npm run harness:runner-output-role-mapping-w215` -> PASS 14/14.
- `npm run harness:operating-mode-resolver-w214` -> PASS 13/13.
- `npm run check` -> PASS.
- `npm run validate` -> PASS 1914/1914.

## Visual Testing Decision
- No broad visual testing was run for W218.
- Exact Review/Run wording and labels are frozen by harness contract.
