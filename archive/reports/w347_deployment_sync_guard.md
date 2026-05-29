# W347: Deployment Sync Guard

Baseline: W346 live confirmation is locked as `Drawer 1.0.4 / W346`.

## Operator Checklist Before Every Smoke

1. Confirm the drawer visible marker in NetSuite is still `Drawer 1.0.4 / W346` until a later drawer block intentionally changes it.
2. Run `npm run suitecloud:verify-filecabinet` to refresh and syntax-check the SuiteCloud File Cabinet mirror.
3. Run `npm run deploy:verify-sync-w347` and do not smoke if any root-to-mirror hash fails.
4. Push origin after code changes so GitHub raw updates are available for Tampermonkey.
5. Use SuiteCloud Deploy Project only when a NetSuite runtime/File Cabinet file changed.
6. If NetSuite files were deployed, download the live File Cabinet files and rerun the guard with download paths.
7. Smoke only after the guard passes and the live drawer/status marker matches the expected release.

## File Update Rules

| File | Primary update path | Smoke gate |
| --- | --- | --- |
| `idb-drawer.user.js` | GitHub push updates Tampermonkey from raw URL. SuiteCloud deploy updates only the File Cabinet mirror copy. | Tampermonkey shows expected version and W347 hash guard passes. |
| `netsuite/idb_governed_runner_adapter_w144_suitelet.js` | SuiteCloud Deploy Project. | Download the NetSuite File Cabinet file and compare it with `--adapter-download`. |
| `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js` | SuiteCloud Deploy Project. | Download the NetSuite File Cabinet file and compare it with `--runner-download`. |

## Commands

Local root and SuiteCloud mirror check:

```bash
npm run deploy:verify-sync-w347
```

Optional live File Cabinet/download check:

```bash
npm run deploy:verify-sync-w347 -- \
  --drawer-download="/Users/aaronsunshine/Downloads/idb-drawer.user.js" \
  --adapter-download="/Users/aaronsunshine/Downloads/idb_governed_runner_adapter_w144_suitelet.js" \
  --runner-download="/Users/aaronsunshine/Downloads/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js"
```

## Pass/Fail Gates

- Pass: root file exists, mirror file exists, root hash equals mirror hash for drawer, adapter, and runner.
- Pass: provided downloaded NetSuite/Tampermonkey files match the repo root hash.
- Pass: drawer metadata keeps `@version 1.0.4`, GitHub raw `@updateURL`, GitHub raw `@downloadURL`, and visible marker `Drawer 1.0.4 / W346`.
- Fail: any missing file, hash mismatch, stale download, missing update URL, or wrong visible drawer marker.

## No-Regression Boundaries

- Preserve W151 import authority and no drawer transaction writes.
- Preserve W214 semantic operating-mode guardrails.
- Preserve W245 canonical import normalization.
- Preserve W341 and W342 naming marker visibility.
- Preserve W344 and W345 Parkway live smoke evidence baseline.
- Preserve W346 consultant-facing post-import UX.
- Do not change runner, adapter, record creation behavior, import validation, or drawer write authority.

## W347 Result

W347 adds deployment discipline only. It does not change any runtime write path, runner behavior, adapter behavior, record creation behavior, or completed-result import validation.

## After W347 Completes

1. Push origin.
2. Do not SuiteCloud deploy for W347 itself unless runtime files were changed in the same local batch.
3. Before the next smoke, run `npm run suitecloud:verify-filecabinet` and `npm run deploy:verify-sync-w347`.
4. If adapter or runner changed, SuiteCloud Deploy Project, download the live File Cabinet files, then run the guard with `--adapter-download` and `--runner-download`.
5. If drawer changed, push origin, confirm Tampermonkey updated to the expected version, and use `--drawer-download` only if you exported/downloaded the installed userscript or File Cabinet mirror.

## Next Recommended Prompt

```text
Move through W348: Broader smoke matrix with deployment sync preflight.

Use W347 deployment sync guard and the locked W345/W346 Parkway baseline. Before each smoke, run the SuiteCloud mirror check and W347 hash guard. Execute a broader smoke matrix across the next safest prospects or lane scenarios, capture trace exports, grade pass/fail gates, and identify the smallest next fix if any failure appears.

Boundaries:
- No new drawer write paths.
- No transaction writes from the drawer.
- No fake Open links.
- Do not weaken completed-result import validation.
- Do not change runner or adapter behavior unless a smoke failure proves it is required.
- Keep N/LLM advisory only.

Deliverables:
- Smoke matrix report with evidence files.
- Pass/fail table by prospect/lane.
- Regression review against W151, W214, W245, W341, W342, W344, W345, W346, and W347.
- Recommendation: proceed to next live scenario, patch one issue, or pause for UX polish.
```
