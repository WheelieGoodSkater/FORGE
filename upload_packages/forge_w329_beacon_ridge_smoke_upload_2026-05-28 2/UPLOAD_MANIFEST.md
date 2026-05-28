# FORGE W329 Beacon Ridge Smoke Upload Package

Created: 2026-05-28

## Upload These Files

1. `idb-drawer.user.js`
   - Upload/update in Tampermonkey.
   - Purpose: current FORGE drawer with protected writeback baseline, W322 distribution labels, and W324 electrical story shaping.

2. `idb_governed_runner_adapter_w144_suitelet.js`
   - Upload to the released W144 governed runner adapter Suitelet.
   - Purpose: submit/refresh/import bridge, current-result matching, stale result guard, and Open-link authority.

3. `scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`
   - Upload to the Demo Command Center Runner V3 scheduled script.
   - Purpose: governed NetSuite record creation and result-capture writer.

## Do Not Upload Or Change

- Do not upload archive harness files.
- Do not mutate `src/contracts/lanePacks.js`.
- Do not install proposed packs.
- Do not create records from the drawer.
- Do not add drawer transaction writes.
- Do not add fake Open links.

## Smoke Goal

Run one clean Beacon Ridge / electrical distribution smoke and upload the resulting FORGE trace JSON plus screenshots so W325 can be reviewed as keep / needs-attention / rollback before Dealer / Hardgoods expansion.
