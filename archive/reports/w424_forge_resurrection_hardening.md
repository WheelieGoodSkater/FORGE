# W429 Website-Grounded N/LLM Naming Validation

## Summary
W429 validates the product naming path after the Cape Cod regression:
- website evidence owns lane and product identity;
- notes shape story, ROI, and competitive handling only;
- N/LLM remains advisory-only;
- N/LLM naming must use website product candidates when present;
- generic Product SKU / Finished Good fallback names are blocked instead of treated as demo-ready;
- Food/Beverage naming is toggle-aware;
- generated sidecar proof items run item setup diagnostics;
- the cockpit shows proof needs review when returned records are not demo-clean.

## Cape Cod Regression Finding
The W423 run selected the correct broad Food/Beverage lane, but generic names and uneven item setup made the proof feel templated. W424 added a generic product candidate extractor from visible product names, product-card text, image alt text, headings, links, and category evidence. W429 adds an advisory-response validator that accepts product names like Lemon Herb Butter Chips and blocks generic Product SKU / Finished Good fallback output.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w429-version-marker-advanced | PASS |
| w424-filecabinet-copies-synced | PASS |
| w424-website-product-name-candidates-extracted-generically | PASS |
| w424-website-first-food-beverage-lane-preserved | PASS |
| w424-confirmed-request-carries-product-authority | PASS |
| w429-nllm-request-carries-website-product-candidates | PASS |
| w429-nllm-grounded-product-name-accepted | PASS |
| w429-nllm-generic-finished-good-name-blocked | PASS |
| w424-notes-story-only-boundary-preserved | PASS |
| w424-runner-food-mfg-off-prefers-replenishment-not-formula | PASS |
| w424-runner-food-mfg-on-still-supports-formula-batch | PASS |
| w424-sidecar-items-use-location-and-setup-diagnostics | PASS |
| w424-clone-planning-trace-does-not-count-as-copy | PASS |
| w424-cockpit-gates-generic-names-as-review | PASS |
| w424-no-live-smoke-or-upload-boundary | PASS |

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No release/readiness package was mutated.
- No fake Open links were introduced.
- Completed-result import validation and Open-link authority remain intact.

## Recommendation
Lock W429 if the harness passes, reinstall Drawer 1.0.37 / W429, then rerun one controlled Cape Cod-style Food/Beverage smoke. If N/LLM returns generic product names, treat that as blocked and collect better website product evidence rather than continuing the run.
