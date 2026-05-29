# W342 / W341 Upload Manifest

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

- `W342 runner naming verification active`
- `Current installed block: W342 runner naming verification active`
- Before a new W341 runner result is returned, Trace may show `W341 runner naming marker not returned`.

If W342 is missing, stop and do not run Build records.

Older drawer markers such as W332/W339 are no longer normal Trace chips. They may remain in hidden/export support context only.

## Required Post-Smoke Verification

After a fresh Build records run completes and records import, Trace should show:

- `W341 prospect-specific proof naming active`

If the drawer still shows `W341 runner naming marker not returned` after a fresh imported result, the drawer is current but the deployed runner did not return the W341 naming marker.

## Protected Boundaries

- W144 submit/refresh/import unchanged
- W151/W214/W245 validation unchanged
- adapter unchanged
- source lane packs unchanged
- drawer does not create records
- drawer does not add transaction writes
- no fake Open links
