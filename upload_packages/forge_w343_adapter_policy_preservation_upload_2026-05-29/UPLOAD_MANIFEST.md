# W343 Adapter Policy Preservation Upload Manifest

## Upload

Upload these files only:

- `idb-drawer.user.js`
- `netsuite/idb_governed_runner_adapter_w144_suitelet.js`

Do not upload lane-pack source files.
Do not upload runner files for this W343 fix unless the next smoke still proves the deployed runner is stale.

## Why Adapter Is Included

The Parkway smoke proved the governed runner finished and returned real ids/URLs, but the adapter promotion path dropped `resolvedOperatingMode` and `runnerLaneVocabularyPolicy` before the drawer import guard saw the completed result.

That made a distribution result look like generic manufacturing roles:

- `finished_or_assembly_item`
- `formula_or_batch_structure`
- `component_item`

W214 correctly blocked import for Manufacturing=false.

## Required Pre-Smoke Verification

Open the FORGE Trace tab before running Build records.

Required Trace text:

- `W342 runner naming verification active`
- `Current installed block: W342 runner naming verification active`

The drawer version should be `V1.0.2` after Tampermonkey updates from GitHub or after manual install.

## Required Post-Smoke Verification

After a fresh Build records run completes and records import, Trace should show:

- completed result imported / records imported
- Open links available for real NetSuite records
- distribution roles preserved instead of manufacturing fallback roles

Ideal marker:

- `W341 prospect-specific proof naming active`

If W341 is still missing after successful import, the adapter preservation fix worked but the deployed runner still did not return the W341 naming marker.

## Protected Boundaries

- W144 submit/refresh/import flow preserved
- W151/W214/W245 validation preserved
- source lane packs unchanged
- drawer does not create records
- drawer does not add transaction writes
- no fake Open links
