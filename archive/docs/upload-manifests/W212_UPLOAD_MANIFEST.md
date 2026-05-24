# W212 Upload Manifest

## Purpose

W212 separates IDB intelligence into four layers:

- Website/category evidence owns industry and product nouns.
- Consultant toggles own operating-model vocabulary.
- Record naming intent stays mode-aware.
- Conversation notes shape story, ROI, competitive framing, and objection handling.

This upload removes non-manufacturing naming leakage such as Finished Good, Ingredient, Production Line, BOM, Assembly, Work Order, Routing, WIP, and Manufacturing Line when Manufacturing and WIP are off.

## Upload Packet

Upload or update these two runtime files:

1. `idb-drawer.user.js`
   - Target: Tampermonkey Intelligent Demo Builder userscript.
   - Reason: Adds W212 orchestration, story/ROI/competitive separation, naming-intelligence contracts, and W212 regression hooks.

2. `scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`
   - Target: Active NetSuite V4 scheduled runner script file.
   - Reason: Updates the runner's fallback naming pack so Dealer Hardgoods with Manufacturing=false and WIP=false returns distribution/dealer-safe names.

No W144 Suitelet/adapter upload is required for W212 unless your deployed W144 file is already stale from an earlier block. W212 does not change the W144 adapter path.

## Supporting Files

These files are included for evidence and local regression, not NetSuite upload:

- `tools/run_website_grounded_story_roi_competitive_naming_w212_harness.js`
- `data/w212_website_grounded_story_roi_competitive_naming.json`
- `trace_samples/w212_website_grounded_story_roi_competitive_naming_trace.json`
- `reports/w212_website_grounded_story_roi_competitive_naming.md`
- `package.json`

## Validation

Validated locally:

- W212 orchestration harness: 10/10 PASS
- W211 naming guardrail harness: 7/7 PASS
- W208 one-click production build harness: 11/11 PASS
- W209 production flow hardening harness: 11/11 PASS
- W210 consultant-first UI cleanup harness: 11/11 PASS
- `npm run check`: PASS
- `npm run validate`: 1914/1914 PASS

## Retest Guidance

No broad visual NetSuite test is required for W212.

After upload, the next useful smoke is a normal consultant Build using a non-manufacturing Dealer Hardgoods scenario. Confirm that generated names avoid manufacturing and ingredient language while the Build/Run flow still imports real links after runner completion.
