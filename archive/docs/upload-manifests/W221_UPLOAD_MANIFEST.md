# W221 Upload Manifest

## Scope
- Work block: W221 End-to-End Success And Recovery Operator Packet.
- Primary script: `idb-drawer.user.js`.
- Harness: `tools/run_end_to_end_success_recovery_operator_packet_w221_harness.js`.
- Report: `reports/w221_end_to_end_success_recovery_operator_packet.md`.
- Trace: `trace_samples/w221_end_to_end_success_recovery_operator_packet_trace.json`.
- Data artifact: `data/w221_end_to_end_success_recovery_operator_packet.json`.

## Upload Decision
- Upload/update the Tampermonkey drawer script: `idb-drawer.user.js`.
- No W144 adapter upload is needed.
- No runner upload is needed.
- No SuiteScript upload is needed for W221.
- No image lookup enablement is included.

## Operator Packet Coverage
- Complete non-manufacturing import.
- Complete manufacturing import.
- Partial food batch/WIP import.
- Blank import recovery.
- Handoff JSON recovery.
- Invalid role/name recovery.
- Missing id / unsupported URL recovery.

## Preserved Boundaries
- W151 import guard remains active.
- W214 operating-mode resolver remains authoritative.
- W215 semantic runner role mapping remains authoritative.
- W216 consultant-facing partial result copy remains authoritative.
- W217 operator-readable smoke packet remains available.
- W218 frozen Review/Run wording remains preserved.
- W219 import failure recovery copy remains preserved.
- W220 recovery UI surface wiring remains preserved.
- Open links appear only after valid completed import with numeric internal ids and supported NetSuite URLs.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved W144 adapter path.
- Runner owns generated records.
- N/LLM remains advisory only.

## Validation
- `npm run harness:end-to-end-operator-packet-w221` -> PASS 9/9.
- `npm run harness:import-recovery-ui-wiring-w220` -> PASS 10/10.
- `npm run harness:import-failure-recovery-copy-w219` -> PASS 11/11.
- `npm run harness:operator-smoke-wording-freeze-w218` -> PASS 10/10.
- `npm run harness:mode-aware-live-review-smoke-w217` -> PASS 9/9.
- `npm run harness:consultant-partial-result-review-w216` -> PASS 13/13.
- `npm run harness:runner-output-role-mapping-w215` -> PASS 14/14.
- `npm run harness:operating-mode-resolver-w214` -> PASS 13/13.
- `npm run check` -> PASS.
- `npm run validate` -> PASS 1914/1914.

## Visual Testing Decision
- No broad visual testing was run for W221.
- The end-to-end operator packet is covered by harness assertions across success, partial, and recovery paths.
