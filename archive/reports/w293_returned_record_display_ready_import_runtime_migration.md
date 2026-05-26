# W293 Returned Record Display-Ready Import Runtime Shape Migration

## Status

`runtime_shape_migration_ready`

## What Changed

W293 adds a drawer-local returned-record display-ready import shape helper that mirrors the W291 contract and W292 bridge fields for W245-normalized returned records.

The migrated helper is limited to pure fact assembly for:

- display-ready returned record fields
- valid / blocked display-ready statuses
- visible and hidden record partitioning
- numeric internal id authority
- supported Open-link authority
- W151 / W214 / W245 consumed-not-replaced boundaries
- no mutation / no import / no write / no UI-rendering guardrails

## What Stayed Drawer-Owned

- `canonicalImportResultNormalizationW245`
- `displayReadyRecordsFromFinalNamingW245`
- `completedRunnerResultImportCommitOperatorFlowV1`
- connected submit execution
- refresh / poll execution
- Finish build state mutation
- returned-record import mutation
- Review / Run rendering

## Runtime Authority

W293 does not create records, import records, write transactions, create Open links, render UI, call the adapter, or load contract files at runtime.

## Future Path

The next block should close the returned-record display-ready optimization slice and choose the next optimization target from the story/update boundary or broader code-review cleanup.
