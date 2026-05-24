# W205 Upload Manifest

Upload only the files that changed for the production consultant cleanup.

## Files

- `idb-drawer.user.js`
  - Tampermonkey drawer update.
  - Normalizes imported relative NetSuite record URLs to absolute URLs before rendering Open links.
  - Hides W144 endpoint, flag, and operator submit controls from the post-import consultant Build flow.
  - Keeps admin/debug runner trace collapsed.

- `netsuite/idb_governed_runner_adapter_w144_suitelet_v2_json_errors.js`
  - NetSuite Suitelet adapter update.
  - Returns absolute NetSuite record URLs from result capture normalization, including Sales Order URLs.
  - Preserves W144 server-side ownership of queue submit and record/result capture.

## Do Not Upload For W205

- Do not replace the active v4 runner for this cleanup.
- Do not change runner deployments.
- Do not change NetSuite script parameters unless you are intentionally retesting W144 execution.

## Validation

- `npm run harness:production-consultant-flow-cleanup-w205`
- `npm run harness:import-w151-completed-result-verify-five-links-w204`
- `npm run check`
- `npm run validate`

All passed locally after this package was prepared.
