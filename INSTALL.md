# FORGE Install Notes

## Tampermonkey

Install `idb-drawer.user.js` as the browser userscript. The drawer appears on NetSuite pages and uses the FORGE rail/header branding.

## NetSuite Scripts

Deploy these NetSuite-side files in the target sandbox/account:

- `netsuite/idb_governed_runner_adapter_w144_suitelet.js`
- `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`

The adapter should be configured with your account-specific runner script/deployment IDs, CSV mapping, folder, subsidiary, location, work center search, and result capture folder.

## Public Placeholder Values

Replace placeholders such as:

- `https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID`
- `SCRIPT_ID`
- `DEPLOY_ID`
- account-specific folder, subsidiary, location, and saved search IDs

## Validation

Run:

```bash
npm run check
npm run validate
```

For the latest food batch completed-result import fix:

```bash
npm run harness:food-batch-completed-import-guard-w237
```
