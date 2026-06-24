# W432 Product Build Plan Naming

## Summary
W432 introduces a mode-aware product build plan so runner-created names come from website product evidence before record creation.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w438-marker-updated | PASS |
| w432-runner-test-hooks-present | PASS |
| w432-kettle-product-terms-extracted | PASS |
| w438-siete-product-terms-extracted-without-kettle-carryover | PASS |
| w432-new-item-only-uses-distribution-language | PASS |
| w432-mfg-uses-finished-good-and-components | PASS |
| w432-wip-adds-routing-and-operations | PASS |
| w432-no-beverage-leak | PASS |
| w432-nllm-advisory-mode-contract | PASS |
| w432-sidecar-mode-records-static-contract | PASS |
| w434-non-mfg-proof-support-prefers-product-plan-names | PASS |
| w436-visible-names-strip-run-suffix | PASS |
| w436-all-visible-item-roles-use-product-plan | PASS |
| w437-stale-product-plan-does-not-repair-new-customer-to-old-product | PASS |
| w438-already-normalized-final-result-repairs-old-brand-visible-rows | PASS |
| w436-non-mfg-copy-has-no-manufacturing-language | PASS |
| w436-mfg-copy-keeps-manufacturing-language | PASS |
| w436-wip-copy-keeps-routing-language | PASS |
| w436-product-candidates-captured | PASS |
| w432-routing-consumes-product-plan-operations | PASS |

## Boundaries
- No live NetSuite smoke was run by this harness.
- W432 keeps drawer N/LLM naming advisory-only.
- W432 does not weaken W431 refresh/sidecar import.
