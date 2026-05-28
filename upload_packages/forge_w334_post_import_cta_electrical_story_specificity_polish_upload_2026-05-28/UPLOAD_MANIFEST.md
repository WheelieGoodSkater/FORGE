# FORGE W334 Upload Manifest

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

W334 keeps that installed-runtime marker and adds story/CTA polish on top of the verified marker path.

## Expected W334 Behavior

- Post-import proof CTA is compact and mobile-readable.
- Old post-import CTA text `Confirm lane before opening proof records` stays absent after valid import.
- Run/navigation surfaces prefer consultant aliases:
  - Product SKU
  - Availability/Replenishment Flow
  - Supporting SKU
- Normal consultant surfaces avoid:
  - Hero item
  - Matrix item / proof item
  - Component item 1
  - Finished/Assembly
  - Formula
  - Work Order
  - Routing
  - WIP
- Electrical distribution story language should use notes-specific pressure when present:
  - supplier portals
  - transfer spreadsheets
  - text threads
  - branch inventory checks
  - manual counter promise tracking
- Open links still appear only after valid returned records are imported.

## Protected Boundaries

- W144 submit/refresh/import unchanged.
- W151/W214/W245 validation unchanged.
- Returned record names, ids, and supported Open links preserved.
- No source-pack mutation.
- No fake Open links.
- No drawer-created records or drawer transaction writes.
