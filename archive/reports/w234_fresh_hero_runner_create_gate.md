# W234 Fresh Hero Runner Create Gate

Generated: 2026-05-24T21:45:53.280Z

## Diagnosis
The W144 adapter now correctly passes Create new item to the DCC runner. The runner still had an old pre-create guard that rejected fresh hero mode when no hero item id was passed, even though the runner owns a createFreshHeroItem path.

## Fix Contract
- Create new item true may enter fresh hero mode without custscript_v3_runner_hero_item.
- When no passed or inferred hero item exists, the runner uses handshakeAction fresh-mode-runner-create.
- The runner-owned getOrCreateFreshHeroItem path creates the fresh inventory item.
- Fresh item creation avoids forcing body location and falls back when copied anchor subsidiary/location restrictions are incompatible.
- FORGE and W144 still do not create drawer records or transaction writes.

## Results
- PASS w234_primary_runner_does_not_throw_before_create
- PASS w234_primary_runner_uses_runner_create_handshake
- PASS w234_primary_runner_fresh_mode_reaches_create_path
- PASS w234_primary_runner_has_subsidiary_location_save_fallbacks
- PASS w234_primary_runner_scheduled_script_shape_preserved
- PASS w234_dcc_master_runner_does_not_throw_before_create
- PASS w234_dcc_master_runner_uses_runner_create_handshake
- PASS w234_dcc_master_runner_fresh_mode_reaches_create_path
- PASS w234_dcc_master_runner_has_subsidiary_location_save_fallbacks
- PASS w234_dcc_master_runner_scheduled_script_shape_preserved
