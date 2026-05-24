# FORGE Repo-Ready Handoff

Date: 2026-05-24

Workspace:

- `/Users/aaronsunshine/Documents/Playground/FORGE-repo-ready`

GitHub repository:

- `https://github.com/WheelieGoodSkater/FORGE`

## Current State

FORGE is a Tampermonkey-based NetSuite companion drawer for consultant-led demo creation. The current package is repo-ready and public-scrubbed for GitHub. It includes the runnable drawer, FORGE branding assets, canonical runtime contract source modules, NetSuite adapter/runner files, archived planning evidence, trace samples, reports, and validation harnesses.

The repo is intentionally not just a one-file Tampermonkey package. It includes historical contract artifacts and harnesses so future work can validate changes without re-learning the long W214-W244 path.

## Main Runtime Files

- `idb-drawer.user.js`
  - Tampermonkey drawer script to install/update.
  - Current drawer includes FORGE branding, completed-result import, real Open-link guardrails, W214-W244 operating-mode / record-role contract work, and W244 legacy slot mapping helpers.

- `assets/FORGE.png`
  - Original FORGE logo asset.

- `assets/forge-header-logo-cropped.png`
  - Cropped drawer header logo asset.

- `src/contracts/operatingModes.js`
- `src/contracts/recordRoles.js`
- `src/contracts/importStates.js`
- `src/contracts/netSuiteLinks.js`
- `src/contracts/runnerResultCompatibility.js`
- `src/contracts/snapshot.js`
  - Canonical runtime contract source modules introduced so the drawer, W144 adapter, and runner can converge on the same mode/role/link language.

- `netsuite/idb_governed_runner_adapter_w144_suitelet.js`
  - Approved W144 adapter path.
  - Do not bypass this path from the drawer.

- `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`
  - Current governed runner package included for continuity.

## Current Validation Commands

Run from `/Users/aaronsunshine/Documents/Playground/FORGE-repo-ready`:

```bash
npm run harness:contract-generated-legacy-slot-mapping-w244
npm run check
npm run validate
```

Current expected result:

- W244 harness passes `10/10`.
- `check` passes syntax checks for drawer, W144 adapter, runner, contract modules, and W244 harness.
- `validate` currently aliases `check`.

## Latest Completed Work

Latest completed block:

- W244: Contract-Generated Legacy Slot Mapping Runtime Slice

What changed:

- Added drawer-safe generated snapshot helpers for legacy slot to canonical role lookup.
- Added canonical role to legacy slot fallback helper.
- Updated safe result normalization consumers so legacy five-record payloads can map through generated contract data where practical.
- Preserved canonical `records[]` import behavior.
- Preserved W151-style numeric id and supported NetSuite URL rules.
- Preserved no fake Open links before valid import.
- Preserved normal consultant UI hiding of diagnostics.

Important W244 helper names in `idb-drawer.user.js`:

- `canonicalRoleFromSnapshotW244`
- `legacySlotModeAwareRoleFromSnapshotW244`
- `legacySlotsForCanonicalRoleFromSnapshotW244`
- `canonicalRoleToLegacySlotFallbackW244`
- `legacyRecordByCanonicalRoleW244`

W244 harness:

- `archive/tools/run_w244_contract_generated_legacy_slot_mapping_slice_harness.js`

W244 artifacts:

- `archive/data/w244_contract_generated_legacy_slot_mapping_slice.json`
- `archive/reports/w244_contract_generated_legacy_slot_mapping_slice.md`
- `archive/trace_samples/w244_contract_generated_legacy_slot_mapping_slice_trace.json`

## Non-Negotiable Boundaries

Preserve these unless a future prompt explicitly changes them:

- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved W144 adapter path.
- Runner owns generated records.
- Image lookup disabled by default.
- N/LLM remains advisory only.
- Normal consultant UI must not show raw JSON, internal diagnostics, W144 endpoint, runner task ids, W151 language, semantic guard wording, mode contract wording, internal role arrays, stack traces, or raw guard messages.
- Open links appear only after valid completed import with numeric internal ids and supported NetSuite URLs.
- W218 frozen success wording and W220 recovery wording should remain stable unless intentionally revised.
- Do not run broad visual testing unless explicitly requested.
- Do not invoke the live runner unless explicitly requested.
- Do not update W144 deployment unless an install packet explicitly calls for it.

## Recent Product Lessons

- Website evidence should remain the primary naming authority.
- Toggles control operating-model vocabulary.
- Conversation notes should shape consultant story, ROI, objections, and run coaching, but should not override website/toggle naming authority.
- Food/ingredient/batch language requires food/batch/ingredient evidence or strong notes plus Manufacturing enabled.
- Manufacturing and WIP claims must stay honest: if records are missing, show partial/admin-debug warnings rather than pretending full support exists.
- The drawer must bring back completed runner names and real links into Build/Run once the runner returns a valid completed result.

## Recommended Next Block

```text
Move through W245: Canonical Import Result Normalization Slice.

Use W244 legacy slot mapping helpers to migrate the next safe import-result normalization consumers to canonical records[] handling, while preserving legacy five-record imports, completed-result links, W237 food batch behavior, W218/W220 frozen copy, W144 compatibility, and no drawer writes.

Goal:
Make imported runner results flow through one normalized display-ready record collection before Build/Run rendering, without changing resolver decisions, naming guards, runner behavior, W144 deployment, consultant copy, or visual layout.

Build:
- Add a drawer-safe import result normalization helper that accepts:
  - legacy five-record completed result objects
  - canonical records[] completed results
  - mixed runner payloads with legacy top-level aliases
- Normalize into display-ready records with:
  - canonical role
  - legacy display role where existing UI expects it
  - record name
  - NetSuite record type
  - numeric internal id
  - supported Open URL
  - link authority status
- Use W244 helpers for safe slot/role interpretation.
- Keep existing W237 completed-result import guard behavior unchanged.
- Keep fake Open links blocked before valid import.
- Keep non-openable records hidden from normal consultant UI.
- Do not change consultant copy except where needed to remove stale generic placeholder wording after a valid import.

Validation:
- Add W245 harness covering:
  - legacy completed result normalizes into display-ready records
  - canonical records[] completed result normalizes into display-ready records
  - W237 food batch completed result still returns names and Open links
  - Build and Run use imported record names after valid import
  - no fake Open links appear before valid import
  - normal UI hides diagnostics
- Run only:
  - W245 harness
  - W244 harness
  - check
  - validate

Do not run broad visual testing.
Do not invoke the runner live.
Do not update W144 deployment.

Output:
- Canonical import result normalization helper.
- Display-ready record collection model.
- W245 regression harness.
- Trace samples.
- W245 report.
- Upload packet if needed.
- Visual testing decision.
- Best next Codex prompt.
```

## Install Note

For Tampermonkey install/update, use:

- `idb-drawer.user.js`

Do not update the W144 adapter, runner, SuiteScript deployment, or image lookup settings unless a future install packet explicitly says to.

