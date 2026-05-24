# W44 Vendor Attach And Procurement Defaults

Decision: COMPLETE / VENDOR ATTACH GUARD READY / NO TRANSACTION WRITE

## What Changed

W44 ports the DCC vendor/procurement lesson into the governed W24 pilot Suitelet. The Proof Item write path can now resolve a vendor context, attach a preferred vendor when configured, and carry an optional purchase price.

This is still not broad creation. The main Suitelet stays create-disabled, the drawer does not auto-write, and Sales Order / transaction context remains disabled.

## Runtime Parameters

- `custscript_idb_default_vendor` - optional vendor internal id used for governed preferred-vendor attach.
- `custscript_idb_require_vendor_attach` - optional checkbox; when true, W24 blocks before any write unless a vendor is resolved.
- `custscript_idb_default_purchase_price` - optional purchase price for proof-item procurement context.

W44 inherits the W43 account context parameters:

- `custscript_idb_default_subsidiary`
- `custscript_idb_default_location`
- `custscript_idb_default_taxschedule`
- `custscript_idb_default_currency`
- `custscript_idb_default_terms`
- `custscript_idb_default_department`
- `custscript_idb_default_class`

## Guardrails

- No silent vendor creation.
- If vendor attach is required and no vendor is configured or resolved, return JSON `blocked_missing_vendor_context` before any write.
- If vendor lookup is ambiguous, return JSON `blocked_ambiguous_vendor_context` before any write.
- Customer still writes first.
- Proof Item still requires Customer ID and URL before it writes.
- Transaction context remains disabled.

## Evidence Added

- `idb.vendor-context-resolver.v1`
- `vendorAttachPilotPlan`
- Harness scenario: required vendor attach blocks before any write.
- Harness scenario: configured vendor attach completes Customer + Proof Item only.

## Blunt Finding

This makes the Proof Item more credible for procurement demos, but it is not enough by itself. The next gap is planning control. DCC taught us that item planning behavior can make or break demo stability, especially when the item participates in replenishment, allocation, or inventory promise. W45 should make planning behavior explicit and reviewable before any future transaction-context write.

## Next Block

W45: Planning Control Rail
