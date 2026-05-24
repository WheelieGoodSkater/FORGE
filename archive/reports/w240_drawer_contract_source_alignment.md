# W240: Drawer Contract Source Alignment And Dynamic Record Rendering Prep

## Summary

W240 aligns the drawer with the canonical contract source modules without introducing a full userscript build migration. It adds a canonical snapshot, drawer sync diagnostics, and a Run pivot guard so imported final records are not dropped by a fixed four-record slice.

## Contract Source Alignment

- Source of truth: `src/contracts/*`
- Installed target: `idb-drawer.user.js`
- Snapshot artifact: `data/w240_canonical_contract_snapshot.json`
- Drawer diagnostic hook: `drawerContractSourceAlignmentW240V1`

Normal consultant UI does not expose contract diagnostics. Admin/debug and harnesses can inspect sync status.

## Dynamic Record Rendering Prep

The drawer now keeps the old four-record slice for provisional preview records, but imported final records use all verified openable records for Run pivots. This preserves simple pre-build behavior while preventing valid returned manufacturing, food batch, WIP, location, routing, or work-center records from disappearing from Run.

## Compatibility

- Legacy five-record completed results remain compatible.
- Canonical `records[]` completed results remain compatible through W239/W240 normalization.
- Non-openable records remain blocked from normal Open-link surfaces.
- W218 success wording, W220 recovery wording, and W237 food batch import guard are preserved.

## Visual Testing Decision

No broad visual testing was run. W240 is a contract/rendering-prep block with harness coverage only.

## Best Next Codex Prompt

Move through W241: Generated Userscript Contract Injection And Monolith Reduction. Use W240 source alignment to introduce a repeatable build/export step that injects canonical `src/contracts` into `idb-drawer.user.js`, then remove duplicated embedded contract constants in small slices while preserving installed Tampermonkey behavior.
