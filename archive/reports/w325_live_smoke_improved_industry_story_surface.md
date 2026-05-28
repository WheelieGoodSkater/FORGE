# W325: Live Smoke Test Improved Industry Story Surface

## Live Smoke Status

Status: `ready_for_user_live_smoke`

Decision: `needs_attention_pending_user_trace`

FORGE is ready for one controlled live smoke using the W324 electrical/contractor-counter story surface. This packet does not claim the live run has already happened. It defines the exact use case, evidence to capture, and acceptance criteria so the uploaded trace and screenshots can be reviewed against the protected W321-W324 baselines.

## Fresh Use Case

Customer: Beacon Ridge Electrical Supply

Website: `https://www.graybar.com`

Path: Distribution / Branch Availability Control

Toggles:

- Create new item: enabled
- Manufacturing: disabled
- WIP: disabled

Sales-call notes:

First call with the VP of Sales, branch operations manager, and contractor counter lead. Their contractors call in from job sites asking whether panels, breakers, conduit, fittings, and replacement parts are available today. The counter team checks branch inventory, transfer availability, supplier portals, and text threads before promising the order. They are under pressure from Epicor Eclipse reports, supplier portal lookups, and spreadsheet-based branch transfer tracking. They want a demo that proves whether the rep can trust the product availability story, see a branch transfer or replenishment path, and protect margin when an urgent contractor order needs an alternate. Website/category evidence should be treated as helpful but still confirmation-first before making ROI or competitive claims.

## Expected Returned Record Labels

- Customer
- Sales Order
- Product SKU
- Branch Availability / Replenishment Flow
- Fulfillment Support SKU

Open links must appear only after W151/W214/W245 accepts the completed result and Finish build imports returned records.

## Expected Story Behavior

- Buyer problem: contractor counter teams need to prove availability before promising the job.
- Proof move: open Product SKU, then show Branch Availability / Replenishment Flow and Fulfillment Support SKU.
- Objection response: answer “how do we avoid another callback?” by using returned records and asking which alternate, branch transfer, or supplier ETA must be trusted.
- Competitive contrast: Eclipse reports, supplier portals, spreadsheets, and texts versus one NetSuite proof path.
- ROI-safe framing: fewer callbacks, faster counter decisions, and margin protection only after baseline confirmation.
- No-claim caution: no guaranteed delivery, measured ROI, manufacturing, WIP, write actions, or source-pack truth.
- Weak-evidence behavior: keep website/category confirmation visible before ROI or competitive claims.

## Evidence To Capture

- Trace JSON exported from FORGE after the smoke.
- Build tab screenshot after submit/refresh.
- Build results screenshot after records import.
- Review tab screenshot showing the story surface.
- Run tab screenshot showing record Open links and live story guidance.
- NetSuite execution log screenshot only if runner/adapter behavior needs review.

## Guardrails

- W321 live writeback baseline remains frozen.
- W322 distribution labels remain frozen.
- W324 electrical story shaping remains the active story baseline.
- W144 submit/refresh/import unchanged.
- W151/W214/W245 validation unchanged.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.
- No source lane-pack mutation.
