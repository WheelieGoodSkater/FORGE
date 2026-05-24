# W236 Runner Unique Item Names

## Diagnosis

Repeat runs for the same customer/request can hit NetSuite DUP_ITEM when generated item names are deterministic.

## Fix

- Generate a per-execution suffix in the runner.
- Apply that suffix to fresh hero item external IDs, item IDs, and display names.
- Preserve the suffix during the later naming pass.
- Apply the suffix to sidecar proof/component items returned to FORGE.
- Keep the drawer no-write boundary unchanged.

## Harness Results

- PASS w236_runner_creates_per_execution_uniqueness_token: Runner creates one short per-execution suffix for generated item names.
- PASS w236_fresh_hero_external_id_and_names_are_unique_per_run: Fresh hero creation now carries the per-run suffix through external ID, itemid, and displayname.
- PASS w236_apply_naming_keeps_suffix_after_fresh_item_create: The later naming pass no longer strips the unique suffix from generated item names.
- PASS w236_sidecar_support_items_are_unique_per_run: IDB sidecar proof and component item records also use per-run names and external IDs.
- PASS w236_sidecar_items_retry_on_netsuite_dup_item: Sidecar item creation retries with distinct item names/external IDs if NetSuite still reports DUP_ITEM.
- PASS w236_master_runner_copy_is_synced: Root runner and Demo Command Center V4 Master runner are byte-for-byte identical after the DUP_ITEM fix.
- PASS w236_no_drawer_write_boundary_changed: Fix stays inside the governed runner naming/create path and preserves drawer no-write boundaries.

Result: 7/7
