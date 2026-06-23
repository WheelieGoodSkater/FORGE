# W423 Website-First Unknown Domain Validation

## Summary
W423 removes the need for a one-off Herr's rescue pattern by validating the actual intended authority order on an unknown snack-company domain:
- Website/category evidence chooses the lane and product family.
- Conversation notes augment pain, ROI, competitive framing, objections, and run coaching.
- N/LLM remains advisory-only and cannot override website evidence, toggles, writes, or Open-link authority.

## Validation Scenario
- Prospect: North Valley Snacks test run two.
- Website: https://www.northvalleysnacks.com.
- Website evidence: chips, pretzels, popcorn, packaged snacks, seasonal flavors, retailers, case pack.
- Bad runtime candidate: Parts/Service wins the raw candidate list.
- Expected result: Food/Beverage from website/category evidence.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w423-version-marker-advanced | PASS |
| w423-filecabinet-drawer-synced | PASS |
| w423-unknown-domain-website-category-chooses-lane | PASS |
| w423-bad-runtime-candidate-cannot-override-website-category | PASS |
| w423-notes-augment-story-only | PASS |
| w423-default-build-toggles-remain-user-intent-only | PASS |
| w423-first-read-does-not-leak-parts-service | PASS |
| w423-nllm-advisory-boundary-preserved | PASS |
| w423-runner-naming-still-canonicalizes-test-suffixes | PASS |
| w423-package-script-registered | PASS |

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No source package or release package was mutated.
- No fake Open links were created.
- Completed-result import validation and Open-link authority remain intact.

## Recommendation
Install/deploy `1.0.35 / W427`, clear drawer state, and run one test using an unlisted-but-clear website category. The expected behavior is website-first lane choice, product-specific naming when website product names exist, notes-only value/story enrichment, and all build toggles off until the consultant chooses them.
