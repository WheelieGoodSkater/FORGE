# W244: Contract-Generated Legacy Slot Mapping Runtime Slice

## Summary

W244 moves safe legacy five-record slot mapping onto the generated W241 contract snapshot. Legacy payload slots such as `demoTransaction`, `heroItem`, `matrixProofItem`, and `componentItem` can now be interpreted through snapshot-backed canonical roles, including mode-aware aliases where available.

## Runtime Helpers

- `canonicalRoleFromSnapshotW244`
- `legacySlotModeAwareRoleFromSnapshotW244`
- `legacySlotsForCanonicalRoleFromSnapshotW244`
- `canonicalRoleToLegacySlotFallbackW244`
- `legacyRecordByCanonicalRoleW244`

## Preserved Behavior

- Legacy five-record completed results still import.
- Canonical `records[]` completed results still import.
- W151-style numeric id and supported URL guard remains enforced.
- W211/W214 naming guards are unchanged.
- W237 food batch completed-result import guard is unchanged.
- No drawer-created records, drawer transaction writes, live runner calls, or SuiteScript calls are introduced.

## Visual Testing Decision

No broad visual testing was run. This is a runtime mapping slice covered by harness assertions.

## Best Next Codex Prompt

Move through W245: Canonical Naming Vocabulary Contract Extraction. Move mode `allowedNouns`, `invalidTerms`, and naming vocabulary from embedded drawer constants into `src/contracts`, regenerate the userscript snapshot, and keep W211/W214 guards on fallback until the vocabulary contract is proven.
