# FORGE W336 Upload Manifest

Date: 2026-05-28

## Upload This File Only

- `idb-drawer.user.js`

## Do Not Upload Or Change

- Do not upload W144 adapter files.
- Do not upload runner files.
- Do not change `src/contracts/lanePacks.js`.
- Do not enable drawer-created records.
- Do not add drawer transaction writes.

## Runtime Marker To Verify

The Trace tab should still show:

- `W332 post-import story polish active`

W336 keeps that installed-runtime marker and polishes the post-import story/readability layer above it.

## Expected W336 Behavior

- Post-import proof CTA headline is short:
  - `Open Product SKU, then prove branch availability.`
- CTA columns are compact:
  - Proof action: `Open Product SKU; prove branch availability.`
  - Safe claim: `Use imported records; confirm lane and ROI.`
  - Stop: `No ROI, write, creation, or availability claim beyond evidence.`
- Evidence receipt uses:
  - `Industrial Distribution & Branch Fulfillment / Low`
- Normal consultant Run/proof surfaces prefer aliases:
  - Product SKU
  - Branch Availability / Replenishment Flow
  - Fulfillment Support SKU
- ROI / Competitive should use note-specific electrical pressure when present:
  - supplier portals
  - transfer spreadsheets
  - text threads
  - branch inventory checks
  - manual counter promise tracking
- Generic competitor fallback should not appear when better note-specific pressure exists.

## Protected Boundaries

- W144 submit/refresh/import unchanged.
- W151/W214/W245 validation unchanged.
- Returned record names, ids, and supported Open links preserved.
- Open links still appear only after valid import.
- No source-pack mutation.
- No runner or adapter changes.
- No fake Open links.
- No drawer-created records or drawer transaction writes.
