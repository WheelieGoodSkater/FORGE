# FORGE Install Notes

## Tampermonkey

Install `idb-drawer.user.js` as the browser userscript. The drawer appears on NetSuite pages and uses the FORGE rail/header branding.

## NetSuite Scripts

Deploy these NetSuite-side files in the target sandbox/account:

- `netsuite/idb_governed_runner_adapter_w144_suitelet.js`
- `netsuite/runner/scai_ss_so_csv_runner_oldcore_simple_sidecar_w482.js`
- `src/Objects/customscript_scai_ss_runner_simple_w482.xml`

The adapter defaults to the W482 scheduled script and deployment:

- `customscript_scai_ss_runner_simple_w482`
- `customdeploy_scai_ss_runner_simple_w482`

The adapter should be configured with your account-specific CSV mapping, folder, subsidiary, location, work center search, and result capture folder.

## Public Placeholder Values

Replace placeholders such as:

- `https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID`
- `SCRIPT_ID`
- `DEPLOY_ID`
- account-specific folder, subsidiary, location, and saved search IDs

## Validation

Run:

```bash
npm run suitecloud:validate-w482
```

The archived historical harnesses, traces, reports, and packaging checklists are retained under `archive/` for reference.
