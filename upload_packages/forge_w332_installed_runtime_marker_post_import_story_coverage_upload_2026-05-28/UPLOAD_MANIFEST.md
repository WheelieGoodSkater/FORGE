# FORGE W332 Upload Manifest

Package: W332 installed runtime marker and post-import story coverage
Date: 2026-05-28

## Upload

Upload only:

- `idb-drawer.user.js`

Do not upload:

- `netsuite/idb_governed_runner_adapter_w144_suitelet.js`
- `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`
- any source lane-pack files

## Required Runtime Marker

Before running the next smoke, open the Trace tab and verify this marker is visible:

`W332 post-import story polish active`

If the marker is missing, stop and do not run Build records. The installed drawer is stale or cached.

## Expected Post-Import Behavior

After a valid import:

- the old CTA `Confirm lane before opening proof records` must not appear
- the drawer should show imported-record proof guidance
- Run/navigation should use `Product SKU`, `Availability/Replenishment Flow`, and `Supporting SKU`
- Run/navigation should avoid `Hero item`, `Matrix item / proof item`, and `Component item 1`
- Open links appear only after valid returned records are imported

## Protected Boundaries

- W144 submit/refresh/import behavior unchanged
- W151/W214/W245 validation unchanged
- no drawer-created records
- no drawer transaction writes
- no fake Open links
- no source lane-pack mutation
