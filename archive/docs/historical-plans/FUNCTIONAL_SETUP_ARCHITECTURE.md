# Functional Setup Architecture

Generated: 2026-05-09

## Trace Review

Source run: `intelligent-demo-builder-trace-1778344929240.json`

The Georgetown Foods test confirmed the current drawer can:

- Capture customer, website, and conversation notes.
- Detect Food / Beverage CPG Manufacturing from ingredient, packaging, line continuity, finished goods, and replenishment language.
- Apply the selected lane only after consultant confirmation.
- Preserve the Food / Beverage proof anchor as `Finished Good`.
- Export setup, lane, action, and page-context trace events.

The remaining product gap is functional setup: the drawer should not only recommend a lane, it should prepare and eventually create the NetSuite objects and records needed to run the demo.

## UX Review From Current Drawer

The current drawer now proves the functional path, but it is getting too long for live consultant use. The screenshot review shows that Demo setup, Setup plan, Operating lane, Proof path, Today's moves, Live Controls, Guardrails, and Trace all remain visible at once. That creates scroll pressure and repeated context.

The next implementation must treat UX as a blocking objective, not polish. Before adding creation adapters or larger object templates, the drawer needs a tighter consultant cockpit model:

- First viewport: current page, compact setup summary, selected lane/proof anchor, recommended next action, and one primary action.
- Details on demand: setup records, dependencies, lane grid, guardrails, and trace utilities should move behind state tabs or disclosures.
- Stateful flow: `Plan`, `Review`, `Run`, and `Trace`.
- No loss of authority: six lanes, proof anchors, draft-only setup plan, guardrails, and trace export must remain available.

See `UX_STREAMLINING_PLAN.md` for the blocking objectives and first-viewport rules.

## Monday Live Plan

The current target is a controlled Monday live release on 2026-05-11. The next work must balance consultant-facing UX and inner execution hardening:

- UX remains a blocking adoption surface.
- Redwood alignment must be tightened before broader release.
- Creation work must stay behind adapter capability, review, and confirmation gates.
- Georgetown Foods remains the current reference run for Food / Beverage setup and dry-run object planning.

See `MONDAY_LIVE_RELEASE_PLAN.md` for roles, workstreams, prompt structure, Monday stop/go rules, and the full release arc.

## Objective

Evolve the drawer from lane guidance into a consultant-controlled demo setup cockpit that can convert customer context into a safe, reviewable NetSuite setup plan, then create supported records only after explicit consultant confirmation.

The setup plan must inherit Demo Command Center V4 behavior first. The drawer is not authorized to invent a new setup object model until it can reproduce the existing V4 contract: prospect, notes, mode, toggles, story contract, proof labels, and the same customer/order/hero proof path.

## Demo Command Center V4 Inheritance

Canonical source files:

- `production_validation_fixture.schema.json`
- `production_validation_fixtures_v4_0_0.json`
- `play_selector.js`

Inherited fixture inputs:

- Prospect company.
- Prospect website.
- Conversation notes.
- Mode: `Balanced`, `Conservative`, or `Aggressive`.
- Toggles: `createNewHeroItem`, `enableManufacturing`, `enableWip`.

Inherited story contract fields:

- `familyKey`
- `scenario`
- `surfacePathLabel`
- `lanePosture`
- `primaryProof`
- `runtimeProofAnchor`
- `proofLabels`
- `validateLive`
- `holdBack`
- `challengeCue`
- `routeKey`
- `routeSource`

Inherited setup path:

1. Customer Record.
2. Sales Order View.
3. Hero/proof record matching the lane proof anchor.
4. Supporting proof labels from the V4 story contract.

The drawer must plan these same objects first. New object types can only be added later as explicitly supported extensions.

## Architecture Arc

### Stage 1: Intake To Setup Plan

Input:

- Customer name.
- Website.
- Conversation notes.
- Current NetSuite page context.
- Selected or suggested lane.

Output:

- Lane recommendation with evidence signals.
- Demo setup summary.
- Required record plan.
- Missing-context checklist.
- Safe next action.

Execution mode:

- Browser-local only.
- No NetSuite record creation.
- Trace export includes setup plan.

### Stage 2: Reviewable Object Plan

Input:

- Confirmed lane.
- Confirmed customer.
- Website and notes.
- Lane-specific object template.

Output:

- Draft objects and records grouped by purpose.
- Object dependencies.
- Field assumptions.
- Consultant review flags.
- Create/skip decision per object.

Execution mode:

- Draft-only inside drawer.
- No live writes.
- All object names and fields are visible before creation.

### Stage 3: Supported Creation Adapter

Input:

- Reviewed setup plan.
- Creation adapter availability.
- Consultant confirmation.

Output:

- Created NetSuite records or direct navigation targets.
- Record IDs or URLs captured in trace.
- Failure and rollback notes.

Execution mode:

- Creation is disabled by default.
- Live creation requires an explicit adapter and a visible confirmation.
- Unsupported records remain draft-only.

### Stage 4: Demo Run Packet

Input:

- Created records.
- Selected lane.
- Selected move path.
- Consultant notes.

Output:

- Demo run checklist.
- Record links.
- Proof path.
- Guardrails.
- Exportable setup and trace packet.

Execution mode:

- Browser-local packet.
- Exportable JSON.

## Object Setup Contract

Every lane can define:

- `dccFamilyKey`: inherited V4 family key.
- `dccScenario`: inherited V4 scenario.
- `dccToggles`: inherited V4 setup toggles.
- `recordsToPlan`: the V4 record/proof-label path.
- `customerRecord`: account/customer fields and customer story.
- `transactionRecord`: sales order or equivalent proof transaction.
- `heroRecord`: finished good, assembly, SKU, lot/release, inventory/fulfillment, or sales-order proof anchor.
- `supportingRecords`: V4 supporting proof labels.
- `requiredProofAnchor`: must match the existing lane proof anchor.
- `unsupportedRecords`: visible as draft-only or hidden until supported.

No object setup contract may introduce a new lane or change a proof anchor.

## Roles

- Product Architect: owns the staged creation arc, lane authority, and object setup contract.
- NetSuite Object Architect: maps each lane to supported NetSuite object templates and dependencies.
- UX Lead: keeps the consultant flow compact, reviewable, and adoption-friendly.
- Tampermonkey Engineer: owns drawer state, local planning, trace export, and safe UI wiring.
- Creation Adapter Engineer: owns any future Suitelet, RESTlet, or UI-navigation adapter that creates records.
- Validation Engineer: owns no-regression checks, dry-run evidence, and trace schema coverage.
- Consultant Reviewer: validates that setup plans match real discovery notes and produce useful demo runs.

## Consultant UX Principles

- Setup comes first, but stays compact.
- Use progressive disclosure: show setup summary first, expand object details only when needed.
- Never auto-create records from notes.
- Let consultants apply a suggested lane, then review records before creating anything.
- Keep six-lane selection visible but not visually dominant after the lane is chosen.
- Replace repeated explanatory prose with concise status, action, and evidence labels.
- Separate `Plan`, `Review`, `Run`, and `Trace` states until a creation adapter exists.
- Every visible action should answer one question: what happens next?
- Treat drawer length as a blocking adoption risk.
- Keep the first viewport focused on setup status, selected lane/proof anchor, and recommended next action.
- Move trace and system utilities behind an explicit utility state.

## No-Regression Rules

- Six existing lanes only.
- No proof-anchor changes.
- No resolver or runner changes.
- No fixture append.
- No unsupported object creation.
- No hidden live writes.
- No automatic lane switch.
- No automatic record creation.
- No certification, growth-gap, old-design, reset-engine, or regression-comparison language.
- Existing trace export must continue to work.
- Existing Tampermonkey install path must continue to work.
- Drawer state and trace must support an active demo session across NetSuite tabs with expiry and explicit clear.
- ROI and competitive context must stay compact, lane-specific, and non-marketing-heavy.
- Planned object names must use the prospect/customer name and remain reviewable before any adapter creation.

## Context-Aware Pickup Contract

Every future Codex pickup must start by reading:

1. `README.md`
2. `MONDAY_LIVE_RELEASE_PLAN.md`
3. `ARCHITECTURE_AND_PROMPT_CHAIN.md`
4. `FUNCTIONAL_SETUP_ARCHITECTURE.md`
5. `UX_STREAMLINING_PLAN.md`
6. `CREATION_ADAPTER_SPEC.md`
7. `data/v5_lane_contracts.json`
8. `data/functional_setup_contract.json`
9. `data/creation_adapter_contract.json`
10. `idb-drawer.user.js`
11. latest `validation_report.md`

Then run:

```bash
npm run preflight
```

If preflight fails, fix validation before expanding features.

## Goal-Based Prompt Chain

### Prompt A: Setup Plan Generator

Goal: Convert customer, website, notes, selected lane, and page context into a browser-local setup plan.

Boundaries: Draft-only; no live NetSuite record creation; no proof-anchor changes; no new lanes.

Output: setup plan model, missing-context checklist, trace event coverage, validator update.

Status: Complete in v0.1.1. The drawer now renders a draft setup plan using the inherited Demo Command Center V4 setup contract: DCC family/scenario, V4 toggles, Customer Record, Sales Order View, proof-anchor record, supporting proof labels, missing-context checklist, and safe next action.

### Prompt C: Consultant Review UX - First Viewport Compression

Goal: Streamline the drawer into `Plan`, `Review`, `Run`, and `Trace` states with compact consultant controls and a first viewport that shows setup status, selected lane/proof anchor, recommended next action, and one primary action.

Boundaries: Keep current six-lane authority visible; do not bury proof anchors; no in-app instructional clutter; no live NetSuite record creation; no creation adapter implementation.

Output: revised drawer layout, state controls, compact setup summary, collapsed lane/object/trace details, visual preview, validator coverage.

Status: Complete in v0.1.1. The drawer now uses Plan / Review / Run / Trace states, a compact first-viewport summary, compressed lane selection, review-only setup plan, and utility trace view.

### Prompt B: Lane Object Templates

Goal: Add lane-specific object templates for customer, transaction, item/proof anchor, and supporting records.

Boundaries: Use Demo Command Center V4 templates first; supported templates only; unsupported records must be marked draft-only or hidden; no fixture append.

Output: `data/functional_setup_contract.json`, object-plan renderer, parity validation.

### Prompt D: Creation Adapter Spec

Goal: Define the creation adapter interface for future Suitelet, RESTlet, or safe UI-navigation execution.

Boundaries: Spec-only unless a supported adapter exists; no hidden writes; all writes require confirmation.

Output: adapter contract, dry-run payload, error model, trace schema.

Status: Complete as spec-only. See `CREATION_ADAPTER_SPEC.md` and `data/creation_adapter_contract.json`. Live creation remains disabled.

### Prompt E: Dry-Run Object Packet

Goal: Produce a dry-run packet from the Georgetown Foods trace that shows what records would be created.

Boundaries: No live creation; no unsupported record claims; preserve Food / Beverage proof anchor as `Finished Good`; use the V4 Food / Beverage `foodManufacturing` setup path.

Output: dry-run setup packet, object dependency map, stop/go decision.

Status: Complete for Georgetown Foods review-only packet. See `reports/georgetown_foods_dry_run_object_packet.md` and `trace_samples/georgetown_foods_dry_run_packet.json`.

### Prompt F: Live Creation Pilot

Goal: Create supported records for one selected lane only after adapter confirmation and consultant approval.

Boundaries: One lane; one customer; explicit confirmation; record IDs captured; rollback notes captured.

Output: live creation report, record links, trace export, validator results.

### Prompt M1: Redwood UX Tightening

Goal: Compress the current drawer UI for Monday live use while preserving Plan / Review / Run / Trace.

Boundaries: No new lanes; no proof-anchor changes; no creation adapter implementation; no automatic lane switch; no automatic record creation.

Output: tighter userscript UI, reduced repeated setup text, compact saved setup state, updated validator checks, visual smoke notes.

Status: Complete. The drawer now has a slimmer Redwood-aligned header, tighter tabs/cards/chips, compact summary grid, reduced setup repetition, compact saved setup state, and validator-visible UX evidence.

### Prompt M2: Review And Run Story Hardening

Goal: Make Review and Run consultant-ready by improving object-plan scanability and one-primary-action storytelling.

Boundaries: Preserve the Demo Command Center V4 object path; keep dry-run only; no unsupported records visible as creatable.

Output: denser review rows, clearer missing-context/stop-go display, stronger Run primary action, compact guardrails, trace events preserved.

Status: Complete. See `reports/review_run_story_hardening.md`.

### Prompt M3: Creation Execution Guard

Goal: Harden the future creation path without enabling live writes.

Boundaries: Spec and dry-run validation only; no NetSuite writes; no record creation button unless disabled behind unsupported adapter state.

Output: adapter capability model, packet validation, confirmation gate model, failure states, validator coverage.

Status: Complete. See `reports/creation_execution_guard.md`.

### Prompt M4: Monday Live Acceptance

Goal: Run a Monday readiness pass across install, UI, lane selection, setup review, run controls, and trace export.

Boundaries: Acceptance only after preflight; no feature expansion during acceptance.

Output: Monday release checklist, pass/fail notes, install artifact confirmation, stop/go recommendation.

Status: Ready for live NetSuite smoke. See `reports/monday_live_acceptance_checklist.md`.

### Prompt M5: Conceptual Full Release Architecture

Goal: Extend the Monday live release into a full release roadmap.

Boundaries: Preserve six-lane authority; live creation only after adapter pilot; new object types only after V4 parity is proven.

Output: post-Monday phases for adapter pilot, creation proof, multi-lane rollout, governance, and consultant training.

Status: Complete. See `FULL_RELEASE_ARCHITECTURE.md`.

### Prompt M6: Session State And Value Lens Guard

Goal: Keep drawer memory alive for the active demo session and add compact ROI/competitive context to the live Run story.

Boundaries: No indefinite local setup persistence; no automatic lane switch; no live record creation; no proof-anchor changes; no expanded marketing copy.

Output: session-scoped state and trace, legacy local storage cleanup, lane-specific value lens, validator coverage.

Status: Complete. See `reports/current_run_findings_next_steps.md`.

### Prompt M8: Active Session Across Tabs

Goal: Preserve the current IDB run across NetSuite tabs and navigation while making reset explicit.

Boundaries: No indefinite persistence; no hidden session reset; no automatic lane switch; no live record creation.

Output: active session storage with expiry, clear session control, cross-tab state pickup, validator coverage.

Status: Complete. See `ACTIVE_SESSION_AND_OBJECT_GENERATION_PLAN.md`.

### Prompt M9: Prospect-Based Object Naming

Goal: Generate reviewable draft object names from prospect/customer, lane, proof anchor, and record role.

Boundaries: Draft-only; deterministic naming first; N/LLM enrichment later only as reviewable text; no creation adapter writes.

Output: planned names in setup plan, planned names in dry-run packet, validator coverage.

Status: Complete. See `ACTIVE_SESSION_AND_OBJECT_GENERATION_PLAN.md`.

### Prompt M10: N/LLM Enrichment Contract

Goal: Define a future enrichment layer that can produce better descriptions, field assumptions, and demo-ready object context from customer website and notes.

Boundaries: Enrichment is advisory and reviewable; it cannot change lane authority; it cannot create records; it cannot remove required DCC V4 fields.

Output: enrichment request/response contract, review UI placement, trace schema update.

Status: Complete as review-only contract. See `data/nllm_enrichment_contract.json` and `reports/nllm_enrichment_contract.md`.

### Prompt M11: Adapter Dry-Run To Create Bridge

Goal: Turn the named dry-run packet into a supported adapter request once live creation is approved.

Boundaries: Requires supported adapter, reviewed packet, explicit consultant confirmation, one lane and one customer first.

Output: adapter payload builder, pre-create confirmation model, failure model, created-record trace capture.

Status: Complete as bridge-ready / create-blocked. See `data/adapter_bridge_contract.json` and `reports/adapter_bridge_plan.md`.

### Prompt M7: Live NetSuite Visual Acceptance

Goal: Run Plan, Review, Run, and Trace in NetSuite with the current drawer and confirm the UI is clean enough for Monday live use.

Boundaries: Acceptance only; no feature expansion during smoke; stop if state persistence, trace export, layout, or proof anchor behavior regresses.

Output: visual acceptance notes and Monday GO / STOP decision.

Status: Pending live NetSuite smoke.
