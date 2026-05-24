# W23 Suitelet Upload Define Callback Fix

Generated: 2026-05-10

Decision: COMPLETE / CREATE STILL DISABLED

## Error

NetSuite upload failed with `SUITESCRIPT_API_UNAVAILABLE_IN_DEFINE` because the Suitelet touched SuiteScript API module constants inside the `define` callback at evaluation time.

## Fix

Changed the top-level lane record type map from `record.Type.*` module constants to plain NetSuite record type IDs:

- `customer`
- `salesorder`
- `inventoryitem`
- `assemblyitem`
- `lotnumberedinventoryitem`

Request-time functions may still call SuiteScript APIs when NetSuite actually invokes the Suitelet, but upload/evaluation no longer touches API module properties while building constants.

## No Regression

- `CREATE_ENABLED` remains false.
- No write path is enabled.
- No lane, proof, packet, toggle, or record order changed.
- W23 remains a create-disabled sandbox smoke.
