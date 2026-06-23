# W425 INVALID_SUB Location Guard

## Summary
W425 addresses the NetSuite regression where generated sidecar inventory item creation can fail with `INVALID_SUB` when a selected location has subsidiary restrictions incompatible with the item subsidiary.

The fix is deliberately narrow:
- create the sidecar item first with name, external id, display name, and subsidiary;
- defer body `location` assignment until post-save setup persistence;
- keep location/planning setup as visible diagnostics;
- do not weaken completed-result import validation or Open-link authority.

## Why This Matters
The Kettle Brand Snacks run showed NetSuite rejecting a location/subsidiary combination for `Outside Roasting`. That should not kill the whole build if the core records can be created safely. The cockpit should receive records when possible and mark proof quality for review when setup persistence is incomplete.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w425-filecabinet-runner-synced | PASS |
| w425-invalid-sub-detector-present | PASS |
| w425-sidecar-create-defers-body-location | PASS |
| w425-sidecar-invalid-sub-diagnostic-preserved | PASS |
| w425-setup-persistence-still-attempts-location-after-save | PASS |
| w425-setup-failure-does-not-weaken-proof-validation | PASS |
| w425-no-runner-authority-expansion | PASS |

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No source-pack, drawer, adapter, or record creation authority was expanded.
- Open links remain verified-import only.
- N/LLM remains advisory-only.

## Recommendation
Lock W425 after the harnesses pass, reinstall/deploy the updated runner, and rerun one controlled Food/Beverage case. If NetSuite still reports setup weakness, inspect the returned setup diagnostics instead of treating the build as failed proof.
