# W344 Drawer And Runner Supporting SKU Fix Upload Manifest

## Upload

Upload/deploy these files:

- `idb-drawer.user.js`
- `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`

Do not upload the W144 adapter for this W344 fix. W343 adapter preservation is already verified live.
Do not upload source lane-pack files.

## Why Drawer Is Included

The latest Parkway trace proved the completed result now carries:

- `resolvedOperatingMode: distribution_replenishment`
- `runnerLaneVocabularyPolicy`
- `W341 prospect-specific proof naming active`
- canonical role `supporting_sku`

The drawer still blocked import because it normalized legacy `componentItems` into `component_item`, erasing the distribution-safe `supporting_sku` role before W214 validation.

## Why Runner Is Included

W341 marker is active, but the returned support item still contained the old fallback word `Component`.

The runner now uses the W341 distribution `componentItemName` policy directly, so future support records should use:

- `Parkway Safe Substitute Fulfillment Support SKU`

## Required Pre-Smoke Verification

Tampermonkey drawer version:

- `1.0.3`

Trace before Build:

- `W342 runner naming verification active`

Runner download/hash should match this package after upload.

## Required Post-Smoke Verification

After a fresh Parkway Build records run:

- W341 marker remains active
- completed result imports
- Open links appear
- support record role remains `supporting_sku`
- support record name does not include generic `Component`

## Protected Boundaries

- W151/W214/W245 import guard remains active
- W144 adapter behavior unchanged
- drawer does not create records
- drawer does not add transaction writes
- no fake Open links
