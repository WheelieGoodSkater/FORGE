# W422 Default Toggles, Food Routing, and Naming Hardening

## Summary
W421 repaired the W144 endpoint, but the Herr's W421 run proved a separate product regression: known packaged-food website evidence could still render a Parts/Service cockpit, default setup toggles could start checked from lane contracts, and generated names could preserve test/run phrasing such as "W421 times two."

W422 restores the intended authority order:
- Website/domain/category evidence chooses lane and naming family.
- Conversation notes shape ROI, competitive, objections, and run coaching only.
- User-selected toggles are explicit intent; no toggles start checked.
- NetSuite proof names are canonicalized before runner record creation.

## Scoped Changes
- Advanced drawer to `1.0.31 / W422`.
- Set every lane setup contract toggle default to off.
- Added `herrs.com` and packaged snack signals as Food/Beverage website authority.
- Added a W422 known-food-domain guard when runtime resolver evidence is weak or contradictory.
- Added Herr Foods/test-suffix canonicalization in runner naming.
- Added food-safe non-manufacturing proof names so Food/Beverage with Manufacturing off does not become Replacement Part / Parts & Service.
- Preserved the W421 released W144 endpoint repair path.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w422-version-marker-advanced | PASS |
| w422-filecabinet-drawer-synced | PASS |
| w422-functional-setup-toggles-default-off | PASS |
| w422-build-packets-start-with-all-toggles-off | PASS |
| w422-herrs-known-domain-overrides-bad-runtime-candidate | PASS |
| w422-herrs-one-click-recommendation-is-food-beverage | PASS |
| w422-herrs-build-request-has-user-intent-toggles-off | PASS |
| w422-herrs-first-read-does-not-leak-parts-service | PASS |
| w422-shared-lane-pack-resolves-herrs-as-food-beverage | PASS |
| w422-runner-naming-sanitizes-test-suffixes | PASS |
| w422-drawer-display-naming-sanitizes-test-suffixes | PASS |
| w422-runner-food-nonmfg-names-avoid-service-parts | PASS |
| w422-lane-pack-herrs-domain-and-food-terms-present | PASS |
| w422-open-link-and-import-authority-preserved | PASS |
| w422-w421-endpoint-repair-preserved | PASS |
| w422-package-script-registered | PASS |

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No source package or release package was mutated.
- No runner transaction behavior changed beyond record naming text.
- Completed-result import validation and Open-link authority remain intact.
- N/LLM remains advisory-only.

## Recommendation
Install/deploy `1.0.31 / W422`, clear the current drawer session, and rerun Herr Foods with no toggles checked unless the use case truly needs a new item, Manufacturing, or WIP. The expected first-read cockpit should be Food/Beverage / packaged snacks, not Parts & Service.
