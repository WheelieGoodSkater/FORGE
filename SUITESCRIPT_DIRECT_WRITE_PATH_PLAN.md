# SuiteScript Direct Write Path Plan

Generated: 2026-05-09

## Objective

Define the production creation skeleton for Intelligent Demo Builder so it can eventually write the same type of NetSuite records the prior SuiteScript/Demo Command Center created, without requiring an external connector and without enabling writes inside the current drawer.

## Decision

The preferred creation path is `suitescript_direct_write`.

This means a governed SuiteScript path inside NetSuite receives the reviewed IDB packet and writes the correct customer, transaction context, proof anchor, and supporting proof records. The Tampermonkey drawer remains the consultant cockpit and review surface; SuiteScript remains the record-writing authority.

## Roles

### SuiteScript Write Path Owner

Goal: Implement the NetSuite-side write logic once the packet contract is approved.

Responsibilities:

- Preserve the previous Demo Command Center creation pattern.
- Map IDB records to NetSuite record types.
- Return created IDs, URLs, and recoverable errors.
- Never write records without an explicit create request and consultant confirmation.

### Packet Authority Owner

Goal: Keep the reviewed IDB packet as the source of truth.

Responsibilities:

- Require customer, website, notes, lane, proof anchor, toggles, and ordered records.
- Preserve DCC V4 toggle behavior for new item, manufacturing, and WIP.
- Keep LLM enrichment advisory until reviewed.

### Gatekeeper

Goal: Prevent accidental writes.

Responsibilities:

- Enforce `createEnabledByDefault: false`.
- Require reviewed packet.
- Require enabled SuiteScript write path.
- Require explicit consultant confirmation.
- Capture traceable results.

## Creation Sequence

1. Customer Record: create or update the prospect/customer context.
2. Sales Order View: create or prepare the demo transaction context tied to the customer.
3. Proof Anchor: create or update the lane proof object, such as Finished Good or Style / SKU Matrix.
4. Supporting Proof Records: create supporting records driven by the lane and toggles.

## Gated Request Shape

The future request must include:

- `writePathType: suitescript_direct_write`
- `mode: create`
- selected lane id
- DCC family key and scenario
- DCC toggles
- customer, website, and conversation notes
- ordered reviewed record list
- consultant confirmation state

## Response Shape

The future response must include:

- status: blocked, validated, created, partial_failed, or failed
- created record labels
- record types
- record IDs
- URLs
- recoverable errors
- trace event: `suitescript_write_path_result`

## LLM Boundary

LLM may enrich names, field assumptions, ROI language, competitive framing, and the execution preview before the request is reviewed. LLM cannot invoke SuiteScript direct write, authorize creation, remove blockers, change proof anchors, or create unsupported objects.

## G7 Implementation Blueprint Link

The implementation-ready G7 blueprint is documented in `SUITESCRIPT_WRITE_PATH_IMPLEMENTATION_BLUEPRINT.md` and structured in `data/suitescript_write_path_contract.json`.

G7 adds:

- SuiteScript entry point shape.
- Lane and role record-type mapping.
- Field mapping.
- Create/update rules.
- Error and partial-failure handling.
- Trace result contract.

## No-Regression Closure

G6/G7 do not enable live writes. They give the next implementation block a precise SuiteScript direct-write skeleton while preserving authorized lanes, DCC toggles, proof anchors, explicit confirmation, and traceability.
