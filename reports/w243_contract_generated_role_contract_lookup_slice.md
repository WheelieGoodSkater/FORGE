# W243: Contract-Generated Role Contract Lookup Slice

## Summary

W243 moves the next low-risk drawer contract consumers onto the generated W241 snapshot: required, expected, optional, and invalid role arrays. The operating-mode resolver still makes the same decisions, and the merged runtime contract preserves the embedded `allowedNouns` and `invalidTerms` used by existing naming guards.

## Runtime Helpers

- `roleListFromSnapshotW243`
- `operatingModeRoleContractFromSnapshotW243`
- `requiredRecordRolesFromSnapshotW243`
- `expectedRecordRolesFromSnapshotW243`
- `optionalRecordRolesFromSnapshotW243`
- `invalidRecordRolesFromSnapshotW243`

## Preserved Behavior

- `resolveBuildOperatingModeW214` mode selection is unchanged.
- W211/W214 naming guards are unchanged.
- W237 completed-result import guard is unchanged.
- Legacy five-record and canonical `records[]` completed results still import and render.
- No drawer-created records, drawer transaction writes, live runner calls, or SuiteScript calls are introduced.

## Visual Testing Decision

No broad visual testing was run. This is a runtime contract lookup slice covered by harness assertions.

## Best Next Codex Prompt

Move through W244: Contract-Generated Legacy Slot Mapping Runtime Slice. Use W243 role contract helpers to migrate safe legacy slot mapping consumers to the generated snapshot while preserving resolver decisions, import guards, W237 completed-result imports, and consultant copy.
