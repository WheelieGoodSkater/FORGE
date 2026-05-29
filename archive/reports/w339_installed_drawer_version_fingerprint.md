# W339: Installed Drawer Version Fingerprint And W337 UX Verification Package

## Decision

W338 Summit Ridge is a keep for writeback, import validation, returned records, and Open links. It is needs attention for installed drawer UX proof because the live screenshots still showed old final-generated-name copy while the repo source and W337 upload package rendered imported-proof-record copy.

## Root Cause Guardrail

The W332 marker proved post-import story polish continuity, but it did not prove the W337 imported-proof-record UX was installed. W339 adds a current-version fingerprint that must be visible in Trace before the next live story-quality judgment.

## Installed Fingerprint

- Marker id: `W339_IMPORTED_PROOF_RECORD_UX`
- Marker: `W339 imported proof record UX active`
- Build label: `W337/W339 imported-proof-record UX`
- Continuity marker: `W332 post-import story polish active`
- Trace line: `Installed drawer fingerprint: W339 imported proof record UX active`

## Copy Fingerprint

The installed drawer must prove these normal consultant UX strings are present:

- `Use imported proof records`
- `Use returned NetSuite proof records`
- `Run will use these imported proof records`
- `Imported NetSuite proof records`

The current rendered Build/Run surfaces must not show:

- `Use final build names`
- `Use imported final generated names`
- `Run will use these final generated names`
- `Final generated NetSuite records`

## Upload Package

Package path:

`upload_packages/forge_w339_installed_drawer_version_fingerprint_upload_2026-05-29.zip`

Upload drawer only. Do not upload runner, adapter, or lane-pack files. Before the next smoke, open Trace and confirm:

- `W339 imported proof record UX active`
- `Installed drawer fingerprint: W339 imported proof record UX active`

If W339 is not visible, stop and do not run another build.

## Protected Boundaries

- W144 submit/refresh/import unchanged
- W151/W214/W245 validation unchanged
- runner unchanged
- adapter unchanged
- source lane packs unchanged
- no drawer-created records
- no drawer transaction writes
- no fake Open links
