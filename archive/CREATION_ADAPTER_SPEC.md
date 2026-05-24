# Creation Adapter Spec

Generated: 2026-05-09

## Status

Spec-only. No live NetSuite creation is enabled.

The drawer can build a reviewed dry-run object packet, but it cannot create records until a governed creation/write path exists and the consultant explicitly confirms creation.

## Creation Write Path Goal

Convert a reviewed setup plan into supported NetSuite records while preserving the Demo Command Center V4 setup path:

1. Customer Record.
2. Sales Order View.
3. Lane proof-anchor record.
4. Supporting proof records.

The preferred production path is the same kind of SuiteScript direct-write model used by the prior Demo Command Center, where SuiteScript writes the correct NetSuite records without an external connector. The abstraction may still be called an adapter in code, but it means a governed internal creation/write path, not necessarily a third-party connector.

Supported future write paths may include:

- SuiteScript direct write path.
- Suitelet-hosted creation path.
- RESTlet creation path.
- Safe UI-navigation path.

The first supported write path must prove one lane and one customer before broader rollout.

## Required Gates

- Supported creation/write path is available.
- Dry-run packet has been reviewed.
- Consultant explicitly confirms creation.
- Unsupported records remain draft-only.
- Created record IDs or URLs are captured in trace.
- Failure states are visible and recoverable.

## Request Contract

The creation/write request must include:

- Write path type.
- Mode: `dry_run` or `create`.
- Selected lane id.
- Demo Command Center V4 family key and scenario.
- V4 toggles: `createNewHeroItem`, `enableManufacturing`, `enableWip`.
- Customer name, website, and conversation notes.
- Ordered record list from the reviewed setup plan.

## Response Contract

The creation/write response must return:

- Status: `dry_run`, `created`, `failed`, or `unsupported`.
- Created record labels, record types, record IDs, and URLs when creation succeeds.
- Recoverable error messages when creation fails.
- A trace event named `creation_adapter_result`.

## Non-Regression Rules

- No hidden writes.
- No automatic record creation.
- No unsupported object creation.
- No proof-anchor changes.
- No fixture append.
- No new lanes.
- No creation without explicit consultant confirmation.
- No LLM authority to activate SuiteScript writes.

## First Pilot Boundary

The first live pilot should use one lane only and should start from the reviewed Georgetown Foods dry-run packet shape. Until then, all object packet work remains dry-run only.
