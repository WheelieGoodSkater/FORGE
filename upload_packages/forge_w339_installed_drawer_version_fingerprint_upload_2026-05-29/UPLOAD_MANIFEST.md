# W339 Drawer-Only Upload Manifest

## Upload

Upload drawer only:

- `idb-drawer.user.js`

Do not upload runner files.
Do not upload adapter files.
Do not upload lane-pack source files.

## Required Pre-Smoke Verification

Before running another live smoke, open the FORGE Trace tab and verify W339 fingerprint before running another smoke.

Required Trace text:

- `W339 imported proof record UX active`
- `Installed drawer fingerprint: W339 imported proof record UX active`

If either line is missing, stop. Do not run Build records. The installed drawer is stale or cached.

## Copy Fingerprint

The installed drawer must contain:

- `Use imported proof records`
- `Use returned NetSuite proof records`
- `Run will use these imported proof records`
- `Imported NetSuite proof records`

The installed drawer should no longer show normal consultant copy:

- `Use final build names`
- `Use imported final generated names`
- `Run will use these final generated names`
- `Final generated NetSuite records`

## Protected Boundaries

- W144 submit/refresh/import unchanged
- W151/W214/W245 validation unchanged
- runner unchanged
- adapter unchanged
- source lane packs unchanged
- no drawer-created records
- no drawer transaction writes
- no fake Open links
