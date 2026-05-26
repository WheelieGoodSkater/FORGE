# W296 Story Surface Update Input Bridge

Status: bridge-ready, extraction-only.

## Purpose

W296 adds a behavior-preserving bridge between drawer-produced story surface update-input facts and the W295 story surface update-input contract. It proves parity for the facts that feed W254 receipt, W255 first glance, W256 live-demo script, and W257 guided sequence after valid returned-record import.

## Bridge Module

- `src/contracts/storySurfaceUpdateInputBridge.js`
- Schema: `forge.w296.story-surface-update-input-bridge.v1`
- Governing contract: `src/contracts/storySurfaceUpdateInputs.js`

## Compared Facts

- Status, ready flag, and blocked reasons
- W245/W293 returned record input facts
- W246 lane pack and confidence facts
- W250 lane-aware label source
- Supported Open-link authority
- W254 receipt shape
- W255 first-glance shape
- W256 script shape
- W257 sequence shape
- Weak/conflicting evidence confirmation state
- N/LLM advisory-only and uncertainty-visible state
- W151/W214/W245 consumed-not-replaced boundary
- No render/copy/mutation/import/create/write/Open-link/adapter invocation boundary

## Boundaries

The bridge validates shape parity only. It does not render UI, change visible story copy, mutate state, import records, create records, write transactions, create Open links, invoke the adapter, or declare W245/W151/W214 validity.

The drawer remains self-contained. W296 does not wire the bridge into `idb-drawer.user.js` runtime and does not add runtime `require`, external dependency, bundler requirement, network dependency, or storage writes.

## Continuity

W296 preserves W295, W294, W293/W292, W264/W265, W245/W151/W214, returned record names, lane-aware labels, supported Open links, Review/Run visible copy, weak/conflicting evidence confirmation-first behavior, N/LLM advisory-only behavior, uncertainty visibility, and runtime authority.

## Next

W297 should close the W294-W296 story update-input optimization slice, map what is now contract-backed versus drawer-owned, and select the next safe story coaching runtime-shape migration without changing visible Review/Run UI.
