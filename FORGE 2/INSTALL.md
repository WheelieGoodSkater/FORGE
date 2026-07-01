# FORGE 2 setup steps

## 1. Working live page

Use the proven Command Center page:

`https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6594&deploy=1`

The FORGE 2.0 sidecar is scoped to that page and the older visible `script=6392&deploy=1` page.

## 2. Tampermonkey sidecar

Install or update:

`FORGE 2/tampermonkey/forge2-sidecar.user.js`

After install, reload the scriptlet page. The right-side drawer should show `FORGE 2.0`.

## 3. Runner

The runner copy is:

`FORGE 2/FileCabinet/SuiteScripts/FORGE 2/scai_ss_so_csv_runner_forge2_v1_12_13.js`

It is an exact copy of the attached `(12).js` runner.

## 4. SuiteCloud deploy mirror

Deployable copies were mirrored into:

- `src/FileCabinet/SuiteScripts/FORGE 2/scai_ss_so_csv_runner_forge2_v1_12_13.js`
- `src/Objects/customscript_scai_forge2_runner.xml`

Use the object only if creating a separate scheduled script record is still desired. If script `6594` already owns the old runner params, reuse that working record instead.

## 5. Verify

Run:

`node "FORGE 2/tools/verify_forge2.js"`

