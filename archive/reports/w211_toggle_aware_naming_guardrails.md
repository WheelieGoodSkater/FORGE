# W211 Toggle-Aware Naming Guardrails Report

Status: PASS (7/7)

## Contract
- Website/category evidence owns industry and product nouns.
- Build toggles own operating-model vocabulary.
- Conversation notes shape story, ROI, competitive framing, and objections only.
- Manufacturing and ingredient terms are blocked when Manufacturing=false and WIP=false.

## Harness Results
- PASS summit_forbidden_terms_rejected: Paste completed governed runner result JSON with numeric internal ids and supported NetSuite URLs. Naming blocked: Hero item: Summit Outdoor Supply Finished Good, Matrix item / proof item: Summit Outdoor Supply Production Line, Component item 1: Summit Outdoor Supply Ingredient Blend. Mode contract blocked: Hero item: finished good is not compatible with dealer_hardgoods_replenishment., Matrix item / proof item: production line is not compatible with dealer_hardgoods_replenishment., Component item 1: ingredient is not compatible with dealer_hardgoods_replenishment., Component item 1: ingredient blend is not compatible with dealer_hardgoods_replenishment..
- PASS summit_allowed_terms_accepted: Completed runner result JSON accepted. Final names and verified URLs can be imported.
- PASS w151_still_requires_numeric_ids_and_urls: completed_runner_result_accepted
- PASS runner_guardrail_function_present: runner contains applyToggleAwareNamingGuardrails
- PASS runner_no_missing_opts_manufacturing_default: missing opts no longer imply manufacturing enabled
- PASS runner_logs_guardrail_rewrites: runner logs mode-aware rewrites
- PASS w211_contract_exposed: mode_aware_completed_result_accepted