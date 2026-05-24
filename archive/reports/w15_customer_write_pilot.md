# W15 Customer Write Pilot

Generated: 2026-05-10
Decision: COMPLETE / MAIN CREATE STILL DISABLED

## Objective

Implement the first guarded SuiteScript write path shape for Customer only while keeping the main package create-disabled.

## Implemented

- Added `data/w15_customer_write_pilot_contract.json`.
- Added SuiteScript customer pilot plan response with schema `idb.customer-write-pilot.v1`.
- Added guarded Customer-only execution function behind `CREATE_ENABLED`.
- Added lookup-first customer search by company name and website.
- Added create/update customer field mapping.
- Added trace result requirements for record ID, URL, operation, lookup status, rollback label, and recoverable errors.
- Updated harness with a W14/W15 scenario that confirms runtime flags and Customer pilot plan are returned while create remains disabled.

## Customer Fields

- `companyname` from reviewed packet `customer.name`.
- `url` from reviewed packet `customer.website`.
- `comments` from reviewed packet `customer.notes`.
- `custentity_idb_packet_id` from `trace.packetId` when the custom field exists.
- `custentity_idb_lane` from `selectedLaneId` when the custom field exists.
- `custentity_idb_proof_anchor` from `proofAnchor` when the custom field exists.

## No-Regression Points

- `CREATE_ENABLED` remains false.
- Customer pilot is blocked in the main package.
- Proof item write is still W16.
- Transaction context write is still blocked until Customer and Proof Item parent results exist.
- No automatic creation from Tampermonkey.
- No silent retry or deletion.

## Learning

The first useful write step is Customer only. It gives the SuiteScript path a real lookup/idempotency shape without taking on proof item dependencies or transaction context too early.
