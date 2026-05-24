# U12 SuiteScript Create Contract Alignment

Generated: 2026-05-09

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Turn the drawer Creation Packet Contract V2 into a server-validated SuiteScript input contract while preserving the current create-disabled package.

## What Changed

- Added `data/suitescript_create_contract_alignment.json` as the alignment contract between the reviewed drawer packet and NetSuite Suitelet scaffold.
- Updated the Suitelet scaffold to require Creation Packet Contract V2 before a reviewed create packet can validate.
- Added server validation for:
  - `idb.creation-packet.v2`
  - `creationAllowed: false`
  - matching record counts
  - required per-record create intent, idempotency, lookup, dependency, rollback, and trace fields
  - unique idempotency keys
- Updated the dry write plan to echo the create contract fields back with `recordId: null`, `url: null`, and `recoverableErrors: []`.
- Updated the SuiteScript harness to send a V2 contract and reject packets that omit it.

## Boundaries Preserved

- `CREATE_ENABLED = false` remains unchanged.
- No `record.create` path was added.
- No record persistence path was added.
- No drawer-side direct write path was added.
- LLM remains advisory only.
- Lane, proof anchor, DCC toggles, and packet order remain unchanged.

## Trace Result Contract

Future enabled branches must return `suitescript_write_path_result` with:

- `sequence`
- `label`
- `recordType`
- `recordId`
- `url`
- `operation`
- `recoverableErrors`
- `idempotencyKey`
- `rollbackLabel`

## Consultant Impact

Review can stay productized and direct: the consultant sees what IDB intends to prepare, while the backend now has enough structure to validate the same exact packet before any controlled create pilot happens.

## Next Recommended Block

U13 should focus on UI evidence and packet handoff: show a concise "Ready for SuiteScript review" state in the Create Readiness area, expose the packet export cleanly, and keep the actual create button disabled until a separate controlled pilot branch is approved.
