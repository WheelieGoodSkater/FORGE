# W241: Generated Userscript Contract Injection And Monolith Reduction

## Summary

W241 introduces a deterministic contract injection utility for `idb-drawer.user.js`. The canonical runtime contracts in `src/contracts/*` now produce a drawer-safe embedded snapshot with explicit begin/end markers and a stable checksum.

## Generated Snapshot

- Source: `src/contracts/*`
- Builder: `src/contracts/snapshot.js`
- Injector: `tools/inject_userscript_contract_snapshot_w241.js`
- Userscript target: `idb-drawer.user.js`
- Snapshot artifact: `data/w241_embedded_contract_snapshot.json`
- Version: `forge.contract-snapshot.w241.v1`

The generated block includes operating modes, record role aliases and labels, legacy slot mapping, import state copy, supported NetSuite URL metadata, and compatibility flags for legacy five-record and canonical `records[]` payloads.

## Drawer Diagnostics

The drawer exposes generated snapshot version, source snapshot version, checksum, and sync status through test hooks/admin diagnostics only. Normal consultant UI does not show contract diagnostics, raw JSON, or internal guard wording.

## Runtime Behavior

No visual redesign, header/logo change, or consultant copy change was made. The W240 Run pivot no-drop guard remains active so all openable imported final records can be used in Run.

## Upload Packet

If deploying W241 behavior, update `idb-drawer.user.js` in Tampermonkey only.

No W144 adapter update, runner update, or SuiteScript deployment update is required.

## Visual Testing Decision

No broad visual testing was run. W241 is covered by deterministic injection and regression harnesses.

## Best Next Codex Prompt

Move through W242: Contract-Generated Drawer Resolver Slice. Use the W241 generated snapshot to replace one embedded drawer contract consumer at a time, starting with operating mode labels and record role labels, while preserving behavior and harness coverage.
