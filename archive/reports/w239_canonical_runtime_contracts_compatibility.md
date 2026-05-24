# W239: Canonical Runtime Contracts And Compatibility Layer

## Summary

W239 introduces real source modules for the FORGE runtime contracts and adds a conservative W144 compatibility bridge. The live path remains compatible with legacy five-record completed results while newer canonical `records[]` payloads can be normalized into the same import surface.

## Contract Modules

- `src/contracts/operatingModes.js` defines the seven canonical operating modes and mode-specific record contracts.
- `src/contracts/recordRoles.js` defines role aliases, labels, legacy slot mapping, and mode-specific role aliases.
- `src/contracts/importStates.js` defines the Build/import lifecycle copy and frozen success/recovery wording.
- `src/contracts/netSuiteLinks.js` centralizes numeric internal id and supported NetSuite URL checks.
- `src/contracts/runnerResultCompatibility.js` normalizes legacy five-record results and canonical `records[]` results into canonical role records.

## Compatibility Layer

The W144 adapter now:

- accepts either legacy `requiredRecords` or canonical `requiredRecordRoles`;
- carries a `canonicalRuntimeContract` marker in the runner request context;
- accepts canonical `records[]` completed results when present;
- preserves legacy fields for the current drawer and runner path;
- adds `canonicalRecords` metadata for future dynamic rendering;
- keeps numeric internal id and supported NetSuite URL validation intact.

## Drawer Update Summary

The Tampermonkey drawer still carries embedded W214-W237 contract constants so the installed script path remains stable. W239 creates the source-of-truth modules first and proves compatibility before a later generated-userscript extraction step. This avoids changing the live drawer load model while the runner/import path is still being stabilized.

## W144 Update Summary

W144 remains backward compatible. Existing successful food batch imports can continue returning the legacy five-record object shape. If a governed runner begins returning canonical `records[]`, W144 can normalize those records into the same legacy fields while preserving the canonical role array.

## Visual Testing Decision

No broad visual testing was run for W239. This block changes contracts and import compatibility only.

## Recommended Next Step

W240 should remove the remaining duplicated drawer contract constants by introducing a build/export step that injects `src/contracts` into the Tampermonkey userscript, then update Run/Review rendering to consume canonical records without slicing away mode-specific records.
