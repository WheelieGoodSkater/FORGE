# Monday Live Release Plan

Generated: 2026-05-09

Target live date: Monday, 2026-05-11

## Release Intent

Ship the Intelligent Demo Builder drawer as a live consultant assistant for NetSuite on Monday. The Monday release should feel clean, Redwood-aligned, and useful in a real demo while keeping record creation gated behind explicit review, adapter support, and consultant confirmation.

This is not a broad platform release yet. It is a controlled live release of the drawer experience, setup planning, dry-run object packet, and guarded creation architecture.

## Current Findings

What improved:

- Navigation is better with `Plan`, `Review`, `Run`, and `Trace`.
- Storytelling is clearer because the consultant can move from setup to review to execution.
- The first summary panel gives customer, website, lane, proof, and next action.
- Review now shows the Demo Command Center V4 setup path: Customer Record, Sales Order View, Finished Good, and supporting proof records.
- Dry-run state is clear: `dry_run_only`, `not_connected`, and `go_for_review_only`.
- Latest run confirms Review and Run are becoming more usable as a live cockpit.

What still needs work before Monday:

- The Plan state still becomes tall when setup is in edit mode, especially with conversation notes and repeated setup summary.
- The top header consumes meaningful vertical space inside a narrow drawer.
- Review rows are readable but should become denser and more actionable.
- Run still stacks recommended move, moves, live controls, and guardrails, which may require scrolling during a live demo.
- Redwood styling is close but should be more disciplined: quieter header, tighter spacing, clear primary/secondary action hierarchy, and fewer large text blocks.
- Inner execution needs hardening before any create flow is exposed: object packet validation, adapter capability checks, confirmation gate, failure model, and trace capture.
- State must be scoped to the active browser session. The last run should not persist after logout or a new browser session.
- Value/ROI and competitive framing should be available during Run, but only as compact lane-specific guidance.
- The companion should gain more restrained Redwood color so state and priority are easier to scan without feeling off-theme.
- Planned records should show richer N/LLM-powered previews of intended updates instead of generic deterministic names alone.

## Monday Release Definition

Monday release is ready when:

- Consultants can install the Tampermonkey script and run it on NetSuite.
- The drawer opens reliably without blocking NetSuite content or help widgets.
- The default flow is understandable in under 30 seconds.
- Customer, website, and notes drive a lane suggestion without automatically switching lanes.
- Review shows the inherited Demo Command Center V4 object path clearly.
- Run gives one obvious next move and preserves redirect, confirm, pressure-test, and summarize.
- Trace export captures setup, selected lane, review packet, run action, and page context.
- No live record creation is possible unless the supported adapter gate is explicitly enabled in a later controlled pilot.

## Roles

- Product Architect: owns Monday scope, release gates, and no-regression boundaries.
- UX Lead: owns Redwood alignment, first-viewport compression, scan hierarchy, and consultant adoption.
- Storytelling Lead: owns the live demo flow from customer context to proof path to recommended move.
- NetSuite Object Architect: owns object path parity with Demo Command Center V4 and record dependency assumptions.
- Creation Adapter Engineer: owns adapter capability checks, confirmation gate, request/response shape, and failure model.
- Tampermonkey Engineer: owns drawer state, local storage, NetSuite injection, event wiring, and export behavior.
- Validation Engineer: owns preflight, visual smoke checklist, trace checks, and no-regression coverage.
- Consultant Reviewer: runs live NetSuite acceptance with Georgetown Foods and one alternate lane.
- Release Captain: owns final package, GitHub copy, Tampermonkey upload instructions, and Monday stop/go.

## Workstreams

### Workstream 1: Redwood UX Tightening

Goal: Make the drawer feel like a quiet NetSuite companion rather than a large side document.

Objectives:

- Reduce header height and visual weight.
- Make tabs smaller and sticky.
- Convert saved setup into compact read mode by default.
- Hide repeated setup summary unless expanded.
- Tighten record rows and chip spacing.
- Make the primary action visually dominant in each state.
- Keep cards at 8px radius or less.

Done when:

- Plan first viewport shows summary, compact setup, lane/proof, and primary action without unnecessary repeat text.
- Review can show the object path with less vertical scrolling.
- Run can expose next move and core controls without making the consultant hunt.

### Workstream 2: Consultant Story Flow

Goal: Make the drawer guide the consultant through a clear live story.

Objectives:

- Plan answers: who is the customer, what context do we know, what lane is suggested?
- Review answers: what will be prepared, what is missing, what stays draft-only?
- Run answers: what do I do now, what proof am I showing, what guardrail protects the story?
- Trace answers: what happened, what can I export, what can I hand off?

Done when:

- Each state has exactly one obvious primary action.
- Secondary actions are present but visually quieter.
- Wording avoids instructional clutter and repeated summaries.

### Workstream 3: Execution And Creation Hardening

Goal: Prepare the inner workings for record creation without exposing unsafe live writes.

Objectives:

- Validate dry-run object packet against the creation adapter contract.
- Add adapter capability state: `not_connected`, `available`, `unsupported`, `failed`.
- Add a confirmation gate model for future creation.
- Require reviewed packet before create mode can be considered.
- Capture adapter results in trace as `creation_adapter_result`.
- Keep unsupported records draft-only.

Done when:

- The drawer can prove what it would create.
- The adapter spec can reject incomplete or unsupported creation requests.
- Live creation remains impossible until the adapter state is supported and explicitly confirmed.

### Workstream 4: Monday Validation

Goal: Make release confidence visible and repeatable.

Objectives:

- Preflight remains green.
- Visual smoke test covers Plan, Review, Run, Trace.
- Georgetown Foods remains Food / Beverage with `Finished Good`.
- Alternate lane smoke test proves no lane-specific regression.
- Trace export includes dry-run packet.
- GitHub package includes only repo-ready files.

Done when:

- `npm run preflight` passes.
- Monday release checklist is complete.
- Consultant reviewer gives GO for controlled live use.

### Workstream 5: Active Session And Value Story

Goal: Preserve the current IDB run across NetSuite tabs during the active demo while giving the consultant a compact value and competitive lens.

Objectives:

- Use active-session state and trace with expiry instead of indefinite setup persistence.
- Share the active IDB context across NetSuite tabs.
- Give consultants a clear session reset control.
- Clear legacy local state from earlier runs.
- Keep trace export available for the active session.
- Add one compact ROI line and one competitive line to Run.
- Avoid long value-prop blocks that create live-demo clutter.

Done when:

- New NetSuite tabs can pick up the current IDB run.
- The active session remembers the current drawer state until expiry or clear.
- Clear session resets setup, lane choice, review packet, and trace.
- Run includes value/competitive context without pushing controls out of reach.

### Workstream 6: Prospect-Based Object Generation

Goal: Generate reviewable object names and future adapter payload context from prospect/customer, lane, and DCC V4 object path.

Objectives:

- Name planned records using the prospect/customer entered by the consultant.
- Keep names deterministic and reviewable before any N/LLM enrichment.
- Use DCC V4 object path and lane proof anchor as the authority.
- Prepare a future N/LLM enrichment contract for descriptions and field assumptions.
- Keep all generation draft-only until adapter support and confirmation exist.

Done when:

- Review shows planned record names.
- Dry-run packet includes planned names.
- Validator confirms object naming remains draft-only and lane-safe.

## Prompt Structure

### Prompt M1: Redwood UX Tightening

Goal: Compress the current drawer UI for Monday live use while preserving Plan / Review / Run / Trace.

Boundaries: No new lanes; no proof-anchor changes; no creation adapter implementation; no automatic lane switch; no automatic record creation.

Output: tighter userscript UI, reduced repeated setup text, compact saved setup state, updated validator checks, visual smoke notes.

Status: Complete in the userscript and validator. See `reports/redwood_ux_tightening_notes.md`.

### Prompt M2: Review And Run Story Hardening

Goal: Make Review and Run consultant-ready by improving object-plan scanability and one-primary-action storytelling.

Boundaries: Preserve the Demo Command Center V4 object path; keep dry-run only; no unsupported records visible as creatable.

Output: denser review rows, clearer missing-context/stop-go display, stronger Run primary action, guardrails collapsed or compacted, trace events preserved.

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

### Prompt M12: Redwood Color Accent System

Goal: Add restrained Redwood-aligned color depth to active state, setup readiness, review status, and guardrails.

Boundaries: Semantic accents only; no gradients or decorative backgrounds; no layout expansion; no lane or proof-anchor change.

Output: color tokens, active tab/action styling, status accents, visual smoke notes, validator coverage.

Status: Complete. See `reports/visual_value_enriched_preview_implementation.md`.

### Prompt M13: Compact Value And Competitive Story

Goal: Bring ROI and competitive positioning into Review and Run without making the consultant sift through long copy.

Boundaries: Two short value lines by default; lane-specific and customer-aware; no unsupported competitive claims; no marketing block.

Output: compact value lens, packet value sentence, trace fields, validator coverage.

Status: Complete. See `reports/visual_value_enriched_preview_implementation.md`.

### Prompt M14: N/LLM Object Preview Renderer

Goal: Show reviewable previews of intended object updates, including proposed name, intended update, field assumptions, and demo use.

Boundaries: Advisory-only; deterministic planned names remain as fallback; no automatic create; no lane or proof-anchor override.

Output: enriched Review rows, preview fallback behavior, trace payload fields, validator coverage.

Status: Complete. See `reports/visual_value_enriched_preview_implementation.md`.

### Prompt M15: Enriched Adapter Payload Guard

Goal: Carry enriched object previews into the dry-run-to-create bridge while keeping creation blocked.

Boundaries: Create remains disabled without supported adapter, reviewed packet, and explicit consultant confirmation.

Output: enriched bridge payload shape, adapter compatibility notes, rejection states, validation coverage.

Status: Complete. See `reports/visual_value_enriched_preview_implementation.md`.

### Prompt M16: Monday Release Candidate Smoke

Goal: Validate the complete visual, value, preview, active-session, trace, and no-regression experience in NetSuite.

Boundaries: Acceptance only; no expansion during smoke; stop on visual, storage, trace, lane, or guard regression.

Output: release-candidate report, stop/go decision, install artifact confirmation.

Status: Complete locally. Live NetSuite visual smoke remains the final human acceptance step. See `reports/visual_value_enriched_preview_implementation.md`.

### Prompt M7: Live NetSuite Visual Acceptance

Goal: Run Plan, Review, Run, and Trace in NetSuite with the current drawer and confirm the UI is clean enough for Monday live use.

Boundaries: Acceptance only; no feature expansion during smoke; stop if state persistence, trace export, layout, or proof anchor behavior regresses.

Output: visual acceptance notes and Monday GO / STOP decision.

Status: Pending live NetSuite smoke.

## No-Regression And Context Guards

Every prompt must preserve:

- Seven authorized lanes only, including Apparel & Accessories.
- No proof-anchor changes.
- No resolver or runner changes.
- No fixture append.
- No hidden live writes.
- No automatic lane switch.
- No automatic record creation.
- No unsupported object creation.
- No certification, growth-gap, old-design, reset-engine, or regression-comparison language.
- Georgetown Foods remains Food / Beverage CPG Manufacturing with `Finished Good`.
- Demo Command Center V4 object path remains the authority for setup planning.
- Trace export remains browser-local and functional.
- Drawer state and trace use an active demo session with expiry and a clear session control.
- Current IDB context must be available across NetSuite tabs during the active demo.
- Planned object names must be prospect/customer-based, reviewable, and draft-only.
- Enriched object previews must remain advisory, reviewable, and subordinate to deterministic DCC V4 planned records.
- Value/ROI and competitive framing stay prominent, compact, and lane-specific.
- Tampermonkey install remains the delivery path for Monday.

Every pickup must start with:

1. `README.md`
2. `MONDAY_LIVE_RELEASE_PLAN.md`
3. `UX_STREAMLINING_PLAN.md`
4. `FUNCTIONAL_SETUP_ARCHITECTURE.md`
5. `CREATION_ADAPTER_SPEC.md`
6. `data/functional_setup_contract.json`
7. `data/creation_adapter_contract.json`
8. `idb-drawer.user.js`
9. latest `validation_report.md`

Then run:

```bash
npm run preflight
```

## Monday Stop / Go

GO when:

- UI is compact enough for live use.
- Plan / Review / Run / Trace are visually distinct and easy to explain.
- Setup and dry-run object packet work for Georgetown Foods.
- At least one alternate lane still passes lane/proof/move validation.
- Trace export works.
- Preflight passes.

STOP when:

- Any lane proof anchor changes.
- Any live creation path appears without a supported adapter and confirmation gate.
- The drawer blocks key NetSuite UI.
- Setup notes can switch lanes automatically without consultant confirmation.
- The package fails preflight.

## Full Release Arc

### Phase 1: Monday Controlled Live

Tampermonkey drawer, setup intake, lane selection, review-only object path, run controls, and trace export.

### Phase 2: Creation Adapter Pilot

One lane, one customer, one supported adapter, explicit confirmation, record links captured, rollback notes captured.

### Phase 3: Authorized-Lane Creation Expansion

Expand adapter support across all seven authorized lanes only after each lane passes dry-run and pilot validation.

### Phase 4: Consultant Enablement

Add lightweight training examples, accepted use cases, failure guidance, and trace review workflow.

### Phase 5: Governed Full Release

Ship supported adapter creation, multi-lane validation, packaged repo release, versioned artifacts, and release notes.
