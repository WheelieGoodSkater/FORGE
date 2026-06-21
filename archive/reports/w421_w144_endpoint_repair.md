# W421 W144 Endpoint Repair

## Summary
The latest Herr Foods trace did not submit the approved server adapter call. It blocked before record creation with `blockedReasons: ["approved_w144_endpoint"]` because saved admin config had a blank `endpointUrl`.

W421 makes the released W144 endpoint repair explicit and persistent before one-click submit.

## Evidence
- Trace reviewed: `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1781970457051.json`.
- Trace failure: `w189_w144_submit_blocked` / `approved_w144_endpoint`.
- Saved endpoint before repair: `(blank)`.
- Endpoint after repair: `https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2`.
- Submit preflight after repair: `ready`.

## Boundaries
- No runner behavior changed in W421.
- No source-pack change.
- No adapter contract change.
- No completed-result import validation change.
- No fake Open links.
- W144 remains the only approved server adapter path.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w421-version-marker-advanced | PASS |
| w421-filecabinet-drawer-synced | PASS |
| w421-latest-trace-had-blank-endpoint | PASS |
| w421-saved-config-repairs-released-endpoint | PASS |
| w421-preflight-ready-after-endpoint-repair | PASS |
| w421-submit-path-persists-endpoint-repair | PASS |
| w421-import-and-open-link-authority-preserved | PASS |
| w421-package-script-registered | PASS |

## Recommendation
Install/deploy `1.0.30 / W421`, then rerun Herr Foods. First confirm the drawer header says `Drawer 1.0.30 / W421`. If it does not, the browser is still running an older userscript and the smoke result is not valid for this fix.
