# G6 SuiteScript Direct Write Path Mapping

Generated: 2026-05-09

Decision: COMPLETE AS CREATE-DISABLED SKELETON

## What Changed

- Added `SUITESCRIPT_DIRECT_WRITE_PATH_PLAN.md`.
- Added `data/suitescript_write_path_contract.json`.
- Mapped the future write path to `suitescript_direct_write`.
- Preserved the prior Demo Command Center idea that SuiteScript can write records directly without an external connector.
- Kept live creation disabled.

## Creation Sequence

1. Customer Record.
2. Sales Order View.
3. Lane proof anchor.
4. Supporting proof records.

## Required Gates

- Authenticated NetSuite session.
- Reviewed dry-run packet.
- Supported SuiteScript write path.
- Explicit consultant confirmation.
- Traceable creation result.

## No-Regression Notes

- No hidden writes.
- No create without consultant confirmation.
- No proof-anchor changes.
- No unsupported object creation.
- LLM cannot invoke the write path.
