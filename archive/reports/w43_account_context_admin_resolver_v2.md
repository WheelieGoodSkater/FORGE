# W43 Account Context Admin Resolver V2

Decision: COMPLETE / ACCOUNT CONTEXT ADMIN V2 READY / NO NEW WRITE SCOPE

## What Changed

W43 extends the W39 account context gate into `idb.account-context-resolver.v2`. The W24 pilot Suitelet now resolves the core creation context before it attempts any governed write:

- Required: `custscript_idb_default_subsidiary`
- Required for Proof Item writes: `custscript_idb_default_taxschedule`
- Recommended: `custscript_idb_default_location`
- Optional admin defaults: `custscript_idb_default_currency`, `custscript_idb_default_terms`, `custscript_idb_default_department`, `custscript_idb_default_class`

All configured values should use NetSuite internal IDs.

## Why This Matters

The live pilot proved Customer and Proof Item writes are real, but the earlier 500 errors also proved the write path cannot assume account defaults. W43 makes those defaults explicit and traceable before the write. If required context is missing, IDB returns `blocked_missing_account_context` JSON instead of letting NetSuite throw an HTML error page.

## Write Behavior

- Customer still writes first.
- Proof Item still writes only after Customer ID and URL exist.
- Sales Order / transaction context remains disabled.
- Main Suitelet remains create-disabled.
- The drawer still does not automatically submit writes.

## Runtime Parameters

| Parameter | Status | Used For |
| --- | --- | --- |
| `custscript_idb_default_subsidiary` | Required | Customer and Proof Item creation |
| `custscript_idb_default_taxschedule` | Required for Proof Item | Inventory / item tax schedule |
| `custscript_idb_default_location` | Recommended | Proof Item default location |
| `custscript_idb_default_currency` | Optional | Customer default currency |
| `custscript_idb_default_terms` | Optional | Customer default terms |
| `custscript_idb_default_department` | Optional | Customer and Proof Item default department when available |
| `custscript_idb_default_class` | Optional | Customer and Proof Item default class when available |

## Validation

- SuiteScript harness includes W43 coverage for account-context V2 admin defaults.
- Missing subsidiary still blocks before writes.
- Missing tax schedule still blocks before Proof Item write.
- Customer plus Proof Item pilot still passes in the approved demo-account harness.
- Transaction context remains disabled.

## No Regression

- No new write scope.
- No Sales Order write.
- No automatic creation from the drawer.
- No N/LLM write authority.
- Missing required account context returns JSON.

## Next

W44: Vendor Attach And Procurement Defaults.

The blunt next move is vendor attach. DCC did not treat proof items as just names and item records; it made the proof item operational by tying it to procurement defaults. IDB needs that before the pilot is useful beyond the simplest Customer plus Item write.
