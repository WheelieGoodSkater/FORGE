# W39 Account Context Resolver

Generated: 2026-05-11

Decision: COMPLETE / ACCOUNT CONTEXT GATE READY / MAIN CREATE STILL DISABLED

## What Changed

- Added a W24 pilot-only Account Context Resolver before Customer or Proof Item writes.
- Added runtime parameters:
  - `custscript_idb_default_subsidiary` required
  - `custscript_idb_default_taxschedule` required for Proof Item pilot writes
  - `custscript_idb_default_location` optional
- Customer writes now set `subsidiary` before save.
- Proof Item writes now set `subsidiary` with the same array-then-scalar fallback pattern used in DCC item creation.
- Proof Item writes also accept optional `location` and require `taxschedule` in this production demo account before the first item save.

## Why This Exists

The live W24 POST reached the real NetSuite write path and exposed account-required fields before record creation. DCC already proved the right pattern: resolve subsidiary/location/tax schedule as runtime deployment context before creating records. IDB now follows that pattern instead of letting NetSuite throw an HTML 500 for missing account configuration.

## Response Contract

If `custscript_idb_default_subsidiary` or `custscript_idb_default_taxschedule` is missing, W24 returns JSON:

```json
{
  "status": "blocked_missing_account_context",
  "accountContext": {
    "schema": "idb.account-context-resolver.v1",
    "status": "blocked_missing_account_context",
    "missingRuntimeParameters": ["custscript_idb_default_subsidiary", "custscript_idb_default_taxschedule"]
  },
  "createdRecords": []
}
```

## No Regression

- Main drawer remains no-write.
- Main Suitelet remains `CREATE_ENABLED = false`.
- W24 remains the only pilot write surface.
- Sales Order / transaction context remains disabled.
- N/LLM remains advisory-only.

## Validation

- SuiteScript harness: PASS 23/23.
- Added negative coverage for missing subsidiary context and missing Proof Item tax schedule context.
- Existing W24 and W38R Customer + Proof Item pilot coverage still passes when account context is configured.

## Next Block

W40 should adapt the fuller DCC creation rail: lookup-first updates, external ID/idempotency handling, Customer + Proof Item field defaults, and structured recoverable errors for account-specific required fields.
