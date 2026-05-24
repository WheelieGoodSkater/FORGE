# W217 Upload Manifest

## Scope
- Work block: W217 Mode-Aware Live Review Smoke Packet.
- Primary script: `idb-drawer.user.js`.
- Harness: `tools/run_mode_aware_live_review_smoke_packet_w217_harness.js`.
- Report: `reports/w217_mode_aware_live_review_smoke_packet.md`.
- Trace: `trace_samples/w217_mode_aware_live_review_smoke_packet_trace.json`.
- Data artifact: `data/w217_mode_aware_live_review_smoke_packet.json`.

## Upload Decision
- Upload/update the Tampermonkey drawer script: `idb-drawer.user.js`.
- No W144 adapter upload is needed.
- No runner upload is needed.
- No SuiteScript upload is needed for W217.
- No image lookup enablement is included.

## Smoke Packet Cases
- Complete non-manufacturing import.
- Complete manufacturing import.
- Partial food batch/WIP import.

## Preserved Boundaries
- W151 import guard remains active.
- W214 operating-mode resolver remains authoritative.
- W215 semantic runner role mapping remains authoritative.
- W216 consultant-facing partial result copy remains authoritative.
- Open links appear only after valid completed import with numeric internal ids and supported NetSuite URLs.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved W144 adapter path.
- Runner owns generated records.
- N/LLM remains advisory only.

## Consultant/Admin Separation
- Normal consultant copy hides W144 endpoint, runnerTaskId, raw JSON, W151 language, semantic guard/mode contract wording, and internal role arrays.
- Admin/debug can show resolved mode, confidence, mapped roles, and missing manufacturing/WIP details.

## Validation
- `npm run harness:mode-aware-live-review-smoke-w217` -> PASS 9/9.
- `npm run harness:consultant-partial-result-review-w216` -> PASS 13/13.
- `npm run harness:runner-output-role-mapping-w215` -> PASS 14/14.
- `npm run harness:operating-mode-resolver-w214` -> PASS 13/13.
- `npm run check` -> PASS.
- `npm run validate` -> PASS 1914/1914.

## Visual Testing Decision
- No broad visual testing was run for W217.
- This block produces a targeted operator-readable smoke packet and harness-backed Review/Run assertions.
