# FORGE W337 Upload Manifest

Date: 2026-05-29

## Upload This File

- `idb-drawer.user.js`

## Do Not Upload In This Block

- Runner SuiteScript files
- W144 adapter Suitelet files
- `src/contracts/lanePacks.js`
- Any source lane pack mutation

## Expected Runtime Marker

- `W332 post-import story polish active`

## Expected W337 Visible Changes

- Build and Run use imported proof-record language instead of final generated-name language.
- Run final navigation says `Use imported proof records`.
- Build navigation says the live story uses imported proof records.
- Collapsed story sections are labeled:
  - `Say this live: open, prove, close`
  - `Guided demo sequence: frame, open, prove`
  - `Evidence receipt: confidence and proof source`
- Normal consultant labels prefer:
  - Product SKU
  - Branch Availability / Replenishment Flow
  - Fulfillment Support SKU

## Protected Boundaries

- W144 submit/refresh/import unchanged.
- W151/W214/W245 validation unchanged.
- Open links still appear only after valid import.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.
- Runner and adapter unchanged.
