# W237 Food Batch Completed Result Import Guard

## Diagnosis

The supplied FORGE trace contains a completed runner result with numeric NetSuite internal IDs and supported URLs. The drawer rejected it with `toggle_vocabulary_guardrail_failed` because W211 validated the returned names without reading the confirmed build request toggles that were sent to the runner.

## Fix

- Read `custscript_v3_runner_idb_request_json` from the saved runner params during W211 import validation.
- Preserve Manufacturing=true for the completed food batch result import guard.
- Accept Liquid Death food batch records with Finished Good, Production Line, and Ingredient Blend names when the resolved mode is `food_batch_manufacturing`.
- Revalidate saved completed-result state on drawer load so an already-returned runner result can recover after the fixed userscript is installed.
- Keep the same vocabulary rejected when Manufacturing=false or the path is non-manufacturing.
- Preserve no drawer-created records, no drawer transaction writes, and no direct SuiteScript outside W144.

## Harness Results

- PASS w237_liquid_death_food_batch_completed_result_imports: Liquid Death completed runner result with Finished Good, Production Line, and Ingredient Blend imports when the confirmed request resolved food batch manufacturing with Manufacturing=true.
- PASS w237_food_manufacturing_names_still_block_when_manufacturing_false: The same manufacturing vocabulary remains rejected when the confirmed request says Manufacturing=false.
- PASS w237_distribution_fallback_names_remain_rejected: Distribution/non-manufacturing paths still reject Finished Good, Production Line, and Ingredient Blend naming.
- PASS w237_confirmed_request_toggles_feed_w211_guard: W211 naming guard now reads the saved confirmed build request JSON used to submit the runner.
- PASS w237_saved_rejected_trace_revalidates_and_imports_after_fix: The latest exported FORGE state with a stale rejected completed result is repaired into imported final records by the current guard.
- PASS w237_draw_repair_hook_registered: Draw/load path revalidates a saved completed result so old rejected UI state can recover after the fixed userscript is installed.

Result: 6/6
