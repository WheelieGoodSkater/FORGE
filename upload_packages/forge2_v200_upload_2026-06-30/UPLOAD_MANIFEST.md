# FORGE 2.0 upload package

Package date: 2026-06-30

## Files

- `forge2-sidecar.user.js`
  - Install/update in Tampermonkey.
  - Disable the old FORGE sidecar first if it overlaps the same NetSuite scriptlet page.
- `scai_ss_so_csv_runner_forge2_v1_12_13.js`
  - Exact copy of the attached `(12).js` runner.
  - FileCabinet target: `/SuiteScripts/FORGE 2/scai_ss_so_csv_runner_forge2_v1_12_13.js`
- `customscript_scai_forge2_runner.xml`
  - Optional separate scheduled-script record stub for the copied old runner.
  - Prefer reusing the existing working `script=6594&deploy=1` Command Center route unless a separate scheduled runner record is explicitly needed.

## Live URL

`https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6594&deploy=1`

## Install order

1. Disable the old Tampermonkey FORGE sidecar.
2. Install or update `forge2-sidecar.user.js` in Tampermonkey.
3. Reload the `script=6594&deploy=1` page.
4. Confirm the visible right-side drawer says `FORGE 2.0`.
5. Run one build through the sidecar. It should fill and click the native working Command Center page.

