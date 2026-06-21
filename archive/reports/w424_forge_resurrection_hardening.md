# W424 FORGE Resurrection Hardening

## Summary
W424 restores the executable consultant path after the Cape Cod regression:
- website evidence owns lane and product identity;
- notes shape story, ROI, and competitive handling only;
- N/LLM remains advisory-only;
- Food/Beverage naming is toggle-aware;
- generated sidecar proof items run item setup diagnostics;
- the cockpit shows proof needs review when returned records are not demo-clean.

## Cape Cod Regression Finding
The W423 run selected the correct broad Food/Beverage lane, but generic names and uneven item setup made the proof feel templated. W424 adds a generic product candidate extractor from visible product names, product-card text, image alt text, headings, links, and category evidence. It does not hardcode Cape Cod.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w424-version-marker-advanced | PASS |
| w424-filecabinet-copies-synced | PASS |
| w424-website-product-name-candidates-extracted-generically | PASS |
| w424-website-first-food-beverage-lane-preserved | PASS |
| w424-confirmed-request-carries-product-authority | PASS |
| w424-notes-story-only-boundary-preserved | PASS |
| w424-runner-food-mfg-off-prefers-replenishment-not-formula | PASS |
| w424-runner-food-mfg-on-still-supports-formula-batch | PASS |
| w424-sidecar-items-use-location-and-setup-diagnostics | PASS |
| w424-clone-planning-trace-does-not-count-as-copy | PASS |
| w424-cockpit-gates-generic-names-as-review | PASS |
| w424-no-live-smoke-or-upload-boundary | PASS |

## Verification Commands
```bash
node --check idb-drawer.user.js
node --check "src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb-drawer.user.js"
node --check netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js
node --check "src/FileCabinet/SuiteScripts/Intelligent Demo Builder/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js"
node --check archive/tools/run_w424_forge_resurrection_hardening_harness.js
npm run harness:forge-resurrection-hardening-w424
npm run harness:consultant-ux-design-gate-w413
npm run harness:one-click-build-records-w419
npm run harness:optional-work-order-warning-w420
npm run harness:w144-endpoint-repair-w421
npm run harness:default-toggles-food-routing-naming-w422
npm run harness:website-first-unknown-domain-w423
```

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No release/readiness package was mutated.
- No fake Open links were introduced.
- Completed-result import validation and Open-link authority remain intact.

## Recommendation
Lock W424 if the harness passes, then rerun one controlled Cape Cod-style Food/Beverage smoke. If setup diagnostics still mark proof weak, patch the specific runner setup field rather than adding more UI or lanes.
