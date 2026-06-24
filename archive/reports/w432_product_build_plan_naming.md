# W432 Product Build Plan Naming

## Summary
W432 introduces a mode-aware product build plan so runner-created names come from website product evidence before record creation.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w432-marker-updated | PASS |
| w432-runner-test-hooks-present | PASS |
| w432-kettle-product-terms-extracted | PASS |
| w432-new-item-only-uses-distribution-language | PASS |
| w432-mfg-uses-finished-good-and-components | PASS |
| w432-wip-adds-routing-and-operations | PASS |
| w432-no-beverage-leak | PASS |
| w432-nllm-advisory-mode-contract | PASS |
| w432-sidecar-mode-records-static-contract | PASS |
| w434-non-mfg-proof-support-prefers-product-plan-names | PASS |
| w435-drawer-repairs-generic-item-display-from-product-plan | PASS |
| w432-routing-consumes-product-plan-operations | PASS |

## Boundaries
- No live NetSuite smoke was run by this harness.
- W432 keeps drawer N/LLM naming advisory-only.
- W432 does not weaken W431 refresh/sidecar import.
