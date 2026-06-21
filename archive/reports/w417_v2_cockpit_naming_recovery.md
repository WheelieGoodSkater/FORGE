# W417 V2 Cockpit and Naming Recovery

## Summary
W417 collapses the post-run experience back to a single consultant cockpit and restores deployable runner naming parity so N/LLM advisory naming can stay aligned with source-pack/story proof names.

## Findings
- The Herr Foods trace preserves the correct advisory boundary: N/LLM is advisory-only, website evidence provides the product seed, and notes shape story/ROI/competitive content.
- The completed screenshot showed generic returned record names because the deployable runner copy had drifted from the FileCabinet runner naming policy.
- The Run surface still showed a full support console under the cockpit; W417 collapses that into one Support / troubleshoot disclosure.

## V2 Visual
- `archive/reports/assets/w417_forge_v2_demo_cockpit.svg`

## Harness
W417 V2 cockpit and naming recovery harness: 11/11 passed.

| Gate | Result |
| --- | --- |
| w417-version-marker-advanced | PASS |
| w417-v2-mockup-exists | PASS |
| w417-root-filecabinet-drawer-synced | PASS |
| w417-runner-copies-synced | PASS |
| w417-runner-food-naming-mode-first | PASS |
| w417-cockpit-is-first-primary-run-surface | PASS |
| w417-support-troubleshoot-collapsed | PASS |
| w417-first-read-keeps-only-cockpit-essentials | PASS |
| w417-trace-preserves-nllm-advisory-boundary | PASS |
| w417-trace-shows-advisory-names-better-than-generic-runner-result | PASS |
| w417-package-script-registered | PASS |

## Recommendation
Lock W417 if the cockpit image matches the intended direction. Next implementation should harden the actual installed/update path so Tampermonkey can receive the 1.0.26 / W417 userscript and the synchronized runner package can be deployed deliberately.
