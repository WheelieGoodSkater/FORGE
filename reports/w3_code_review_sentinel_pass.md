# W3 Code Review Sentinel Pass

Generated: 2026-05-10

Decision: COMPLETE / FUTURE BLOCKS RESTRUCTURED / CREATE STILL DISABLED

## Objective

Review current code health before the next write work and identify the structural choices that should shape W4-W18.

## Scope Reviewed

- `idb-drawer.user.js`
- `netsuite/suitescript/idb_suitescript_write_path_suitelet.js`
- `tools/validate_drawer_project.js`
- Current data contracts for website, creation packet, SuiteScript write path, ROI / Competitive, run coach, and transaction context.

## Findings

### 1. Website scoring is working, but too much of the authority lives in drawer code

The current resolver has useful website-first hints and known-case routing, but the scoring is still partly embedded in `laneSignalScore` as regex boosts and penalties. That is acceptable for the current release candidate, but it will become hard to govern as more prospects and lanes are added.

Recommendation: W4 should move more of the resolver authority into a data-backed website signal model with explicit confidence, conflict, and fallback states.

### 2. Conversation notes can still create competing signals

The intended hierarchy is website first, conversation notes second, industry fallback last. The implementation mostly supports this, but `intakeText` combines customer, website, notes, SC objective, competitor, and decision criteria into one source. That means a long note can still create a strong competing signal.

Recommendation: W4 should score website, notes, and fallback separately, then explain the winning source. If website is strong, notes should shape story and ROI, not override lane.

### 3. The creation packet ID is render-time generated

`creationPacketContract` currently builds `packetId` with `Date.now()`. Because Review can re-render, the packet ID is not stable enough for the future write path.

Recommendation: W6 or W12 should freeze packet identity when Run IDB builds the reviewed packet, then reuse that ID through Review, confirmation, SuiteScript request, and trace result.

### 4. SuiteScript write path remains correctly blocked

The SuiteScript scaffold has `CREATE_ENABLED = false`, validates Creation Packet Contract V2, blocks missing consultant confirmation, blocks unsupported lanes, blocks duplicate idempotency and lookup targets, and keeps transaction context blocked without customer/proof results.

Recommendation: W9 should keep main untouched and define a pilot branch flag strategy. W10 should add real customer lookup/create/update only inside that controlled branch.

### 5. Transaction context gate is correctly conservative

The transaction context pilot remains blocked until customer and proof result IDs and URLs exist. This is the right dependency shape.

Recommendation: Do not advance transaction writes until W10-W11 return traceable parent results.

### 6. Validator is strong but mostly regex-contract based

The validator is useful for preserving no-regression boundaries, but W4-W8 need scenario-level assertions that prove the consultant flow and resolver decisions, not only source-text presence.

Recommendation: Add scenario fixtures for website-first routing, Review packet naming, ROI audit, Run Coach, and create readiness before write enablement.

## Safe Cleanup Decision

No code cleanup was applied in W3. The low-risk W2 UI cleanup already removed the duplicate Plan-page instruction. W3 intentionally avoids behavior changes so the next blocks can address structure in order.

## Future Block Restructure

- W4 must separate website score, notes score, and fallback score.
- W5 must freeze Run IDB as the moment the working lane, product seed, and packet identity are accepted.
- W6 must use the frozen packet ID in Review rows and SuiteScript handoff.
- W7 must keep ROI claims auditable and source-labeled.
- W8 must use notes and page context for run coaching, not lane authority changes.
- W9 must create branch isolation and write flags before implementation.
- W10-W11 must return parent record IDs and URLs before W14 can advance transaction context.

## No-Regression Confirmation

- Main create remains disabled.
- No write path was enabled.
- No lane, proof anchor, DCC toggle, or packet order changed.
- N/LLM remains advisory only.

