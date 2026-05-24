# Active Session And Object Generation Plan

Generated: 2026-05-09

## Decision

The drawer should preserve the current IDB run across NetSuite navigation and multiple tabs during a live consultant session. It should not permanently preserve stale customer context after the demo window has passed.

The correct model is an active demo session:

- Shared across NetSuite tabs.
- Time-bounded.
- Manually clearable.
- Exportable through Trace.

## Current Implementation

- Active drawer state and trace use browser `localStorage` with an 8-hour expiry.
- Earlier durable storage keys are cleared on drawer load.
- Trace includes a `Clear session` control.
- Clearing the session resets setup, lane choice, review packet, and trace.
- State changes can propagate across open tabs through the browser storage event.

## Why Not Pure Session Storage

`sessionStorage` works inside one tab but does not reliably support the consultant workflow where they open multiple NetSuite tabs. Consultants need to keep the same IDB context while navigating customers, sales orders, items, and Suitelets.

## Clear Session UX

The `Trace` state owns session reset because it is an operational utility action.

The control should remain visible enough to use between prospects, but it should not compete with Plan, Review, or Run.

## Object Generation Direction

The next creation path should generate reviewable object names before any adapter writes records.

Naming rule:

- Customer record uses the entered prospect/customer name.
- Transaction record uses `{Customer} - {Proof Anchor} Demo Order`.
- Proof and supporting records use `{Customer} - {Record Label}`.

Example for Georgetown Foods / Food Beverage:

- Georgetown Foods
- Georgetown Foods - Finished Good Demo Order
- Georgetown Foods - Finished Good
- Georgetown Foods - Ingredient / Packaging Structure
- Georgetown Foods - Packaging & Line Details
- Georgetown Foods - Production Setup

This is deterministic and reviewable. A future N/LLM enhancement can enrich descriptions, assumptions, and field values, but should not replace the guardrails:

- No automatic creation.
- No unsupported object creation.
- No proof-anchor changes.
- All generated names visible before adapter use.

## Next Architecture Layer

The next object-generation layer should move the Review screen from generic planned names into enriched previews.

For each planned record, the drawer should show:

- Proposed display name.
- Intended update.
- Field assumptions.
- Demo use.
- Review flags.

This enrichment should be driven by the entered customer, website, conversation notes, selected lane, proof anchor, DCC V4 object path, ROI lens, and competitive lens. It remains advisory and review-only until a supported adapter and explicit consultant confirmation exist.

## Next Prompt Blocks

### Prompt M8: Active Session Across Tabs

Goal: Preserve the current IDB run across NetSuite tabs and navigation while making reset explicit.

Boundaries:

- No indefinite persistence.
- No hidden session reset.
- No automatic lane switch.
- No live record creation.

Output:

- Active session storage with expiry.
- Clear session control.
- Cross-tab state pickup.
- Validator coverage.

Status: Complete.

### Prompt M9: Prospect-Based Object Naming

Goal: Generate reviewable draft object names from prospect/customer, lane, proof anchor, and record role.

Boundaries:

- Draft-only.
- Deterministic naming first.
- N/LLM enrichment can be added later only as reviewable text.
- No creation adapter writes.

Output:

- Planned names in setup plan.
- Planned names in dry-run packet.
- Validator coverage.

Status: Complete.

### Prompt M10: N/LLM Enrichment Contract

Goal: Define a future enrichment layer that can produce better descriptions, field assumptions, and demo-ready object context from customer website and notes.

Boundaries:

- Enrichment is advisory and reviewable.
- It cannot change lane authority.
- It cannot create records.
- It cannot remove required DCC V4 fields.

Output:

- Enrichment request/response contract.
- Review UI placement.
- Trace schema update.

Status: Complete. See `data/nllm_enrichment_contract.json` and `reports/nllm_enrichment_contract.md`.

### Prompt M11: Adapter Dry-Run To Create Bridge

Goal: Turn the named dry-run packet into a supported adapter request once live creation is approved.

Boundaries:

- Requires supported adapter.
- Requires reviewed packet.
- Requires explicit consultant confirmation.
- One lane and one customer first.

Output:

- Adapter payload builder.
- Pre-create confirmation model.
- Failure model.
- Created-record trace capture.

Status: Complete as bridge-ready / create-blocked. See `data/adapter_bridge_contract.json` and `reports/adapter_bridge_plan.md`.

### Prompt M12-M16: Visual Value And Enriched Preview Architecture

Goal: Add Redwood color depth, compact ROI/competitive framing, and N/LLM-powered object previews while keeping DCC V4 authority intact.

Boundaries:

- Enrichment is advisory only.
- Deterministic planned names remain as fallback.
- No lane override.
- No proof-anchor override.
- No automatic creation.
- No hidden writes.

Output:

- Visual/value architecture skeleton.
- Prompt blocks M12-M16.
- No-regression guards for enriched object previews.

Status: Complete. See `reports/visual_value_enriched_preview_implementation.md`.
