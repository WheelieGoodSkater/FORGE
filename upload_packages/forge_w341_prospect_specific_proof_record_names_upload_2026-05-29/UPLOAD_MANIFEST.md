# W341 Upload Manifest

## Upload

Upload these files only:

- `idb-drawer.user.js`
- `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`

Do not upload adapter files.
Do not upload lane-pack source files.

## Why Runner Is Included

Actual NetSuite item names are created by the governed runner. W341 updates runner-owned distribution/electrical naming so future generated proof records can use prospect-specific readable nouns from first-call notes.

Expected future proof names should feel like:

- `Parkway Breaker Availability SKU`
- `Parkway Branch Availability / Replenishment Flow`
- `Parkway Safe Substitute Fulfillment Support SKU`

## Required Pre-Smoke Verification

Open the FORGE Trace tab before running Build records.

Required Trace text:

- `W339 imported proof record UX active`
- `Installed drawer fingerprint: W339 imported proof record UX active`

If W339 is missing, stop and do not run Build records.

## Protected Boundaries

- W144 submit/refresh/import unchanged
- W151/W214/W245 validation unchanged
- adapter unchanged
- source lane packs unchanged
- drawer does not create records
- drawer does not add transaction writes
- no fake Open links
