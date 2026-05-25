# W272 Live Evidence And Signoff Packet Contract

Status: complete

## Summary

W272 adds a focused review-only contract module at `src/contracts/liveEvidencePackets.js` for the live evidence and release signoff packet family.

The module mirrors stable shapes from:

- W260 install-ready release packet
- W261 post-install smoke evidence capture and release signoff
- W266 controlled live build run evidence packet
- W267 screenshot/Open-link reconciliation and signoff
- W268 installed-drawer evidence intake and V1.0.0 release keep packet

## Contract Helpers

- Shared statuses: `ready_to_keep`, `needs_attention`, `rollback_recommended`
- Shared review-only policy: no external upload, network call, tracking call, local storage write, install action, or runtime dependency
- Packet shape matcher for W260/W261/W266/W267/W268 review-only artifacts
- Live-run decision helper
- Screenshot/Open-link signoff helper
- Open-link verification capture helper
- Post-install release signoff helper

## Behavior Boundary

Runtime behavior unchanged. `idb-drawer.user.js` still owns the current consultant UI and connected build flow. The new module is a parity-backed extraction point only.

## Guardrails

- Raw live evidence stays archived/admin-only.
- Normal consultant UI stays free of endpoints, raw JSON, task ids, schema names, stack traces, and admin diagnostics.
- No drawer-created records are introduced.
- No drawer transaction writes are introduced.
- Connected build behavior remains W144/server-adapter-only.
- W264 imports only W151-valid completed results.
- W271 adapter profile/readiness contract remains available.

## Validation

- W272 harness added at `archive/tools/run_w272_live_evidence_signoff_contract_harness.js`.
- Harness uses W270 shared archived fixture utilities.
- Harness validates W260/W261/W266/W267/W268 shape parity, decision statuses, review-only policy, W271 availability, W264 continuity, hidden raw evidence, and no runtime authority changes.
