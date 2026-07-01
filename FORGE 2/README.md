# FORGE 2

FORGE 2 is intentionally isolated from the current FORGE V2.1 work.

What is wired here:

- `FileCabinet/SuiteScripts/FORGE 2/scai_ss_so_csv_runner_forge2_v1_12_13.js`
  - Exact copy of `/Users/aaronsunshine/Downloads/scai_ss_so_csv_runner (12).js`.
  - No FORGE V2.1 naming, ROI, competitive, sidecar return, or duplicate-item logic was added.
- `tampermonkey/forge2-sidecar.user.js`
  - Browser sidecar branded `FORGE 2.0`.
  - Runs on the working Command Center Suitelet URLs:
    - `script=6594&deploy=1`
    - `script=6392&deploy=1`
  - Fills the existing native page inputs and clicks the existing native page buttons.
  - Reads returned links from the working page after submit/refresh.
- `Objects/customscript_scai_forge2_runner.xml`
  - Minimal scheduled script record stub for the isolated old runner, using the exact parameter IDs that `(12).js` reads.

The first live path should use:

`https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6594&deploy=1`

