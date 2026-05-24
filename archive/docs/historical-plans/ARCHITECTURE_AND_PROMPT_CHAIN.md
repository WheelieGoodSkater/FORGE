# Intelligent Demo Builder Drawer Architecture

Generated: 2026-05-09

## Objective

Move the consultant experience from a single Suitelet-centered command surface into a Tampermonkey-powered right-side drawer that can travel across NetSuite pages. The drawer keeps the V5 objective intact: reduce prep time, strengthen confidence, preserve authorized-lane authority, and help consultants redirect or confirm the story during a live workflow.

The next architecture arc extends this from guidance into draft functional setup planning. The drawer should convert customer, website, and conversation notes into a reviewable object plan, then eventually create supported NetSuite records only through an explicit creation adapter and consultant confirmation. See `FUNCTIONAL_SETUP_ARCHITECTURE.md`.

## V1 Decisions

- Host: Tampermonkey userscript.
- Scope: all NetSuite pages.
- Data source: existing V5 lane contract, bundled locally for v1.
- Traceability: exportable JSON from browser-local interaction state.
- Visual language: production-realistic Oracle Redwood-inspired neutral shell.
- Functional assets: hidden until supported.
- Product identity: `Intelligent Demo Builder`.
- V1 trace depth: lane selected, page context, selected move, guardrails viewed, export timestamp.

## Architecture

1. `idb-drawer.user.js`
   - Tampermonkey install artifact.
   - Injects a right-side drawer into NetSuite pages.
   - Bundles the authorized-lane contract for offline reliability.
   - Stores state in `localStorage`.
   - Exports trace JSON.

2. `data/v5_lane_contracts.json`
   - Portable V5 authorized-lane contract.
   - Apparel & Accessories is explicitly authorized.
   - No proof-anchor changes.
   - Unsupported future modules stay hidden.

3. `data/functional_setup_contract.json`
   - Draft-only object setup contract.
   - Defines lane-specific customer, transaction, item/proof-anchor, and supporting-record templates.
   - Live creation remains disabled until a supported adapter exists.

4. `data/creation_adapter_contract.json`
   - Spec-only adapter request and response contract.
   - Requires supported adapter, reviewed dry-run packet, explicit consultant confirmation, and traceable result.
   - Keeps live creation disabled by default.

5. `preview/local_preview.html`
   - Local visual harness for fast review outside NetSuite.
   - Uses the same injected drawer script shape.

6. `tools/validate_drawer_project.js`
   - Local non-regression validator.
   - Confirms seven authorized lanes, neutral naming, no forbidden production terms, trace export, and NetSuite match scope.

7. `UX_STREAMLINING_PLAN.md`
   - Current drawer UX review.
   - Defines the next blocking UX objectives before feature expansion.
   - Locks first-viewport compression and Plan / Review / Run / Trace state flow.

8. `CREATION_ADAPTER_SPEC.md`
   - Spec-only creation gate for future Suitelet, RESTlet, or safe UI-navigation execution.

9. `MONDAY_LIVE_RELEASE_PLAN.md`
   - Controlled Monday release target, roles, workstreams, prompt structure, stop/go gates, and full release arc.

## Roles

- Product Architect: owns the lane contract, non-regression boundaries, and product identity.
- UX Lead: owns Redwood-inspired drawer layout, scan hierarchy, and consultant flow.
- Tampermonkey Engineer: owns script injection, storage, page detection, and export behavior.
- NetSuite Object Architect: owns lane-specific object setup templates and dependency maps.
- Creation Adapter Engineer: owns future Suitelet, RESTlet, or safe UI-navigation creation adapters.
- Validation Engineer: owns local validators and no-regression checks.
- Consultant Reviewer: runs real NetSuite smoke checks and confirms story usefulness.

## Step Sequence

1. Build the drawer shell and V5 contract bundle.
2. Add local preview and trace export.
3. Validate non-regression and production language.
4. Smoke inside NetSuite with one ready lane and one guarded/review lane.
5. Run authorized-lane visual parity only after the drawer shell is stable.
6. Add optional functional assets only after the authorized-lane drawer is accepted.
7. Compress the drawer UX before adding live creation adapters or larger object-template surfaces.

## Non-Regression Marks

Every next prompt must preserve:

- No unapproved industries.
- No resolver changes.
- No runner changes.
- No proof-anchor changes.
- No fixture append.
- No automatic lane switch.
- No automatic record creation.
- No hidden live writes.
- No certification or growth-gap language.
- Keep authorized-lane authority.
- Keep operating spine fallback concept.
- Keep images optional for proof readiness.
- Keep unsupported functional assets hidden until explicitly supported.

## Codex Prompt Chain

### Prompt 1: Drawer Shell Build

Goal: Build the first Tampermonkey right-side drawer using the V5 authorized-lane contract and Redwood-inspired production styling.

Boundaries: Work only inside `intelligent demo builder drawer`; no V5 Suitelet edits; no resolver or runner changes; no unapproved industries; no proof-anchor changes; no unsupported modules visible.

Output: userscript, local preview, trace export skeleton, validator, validation results.

### Prompt 2: NetSuite Page-Aware Context

Goal: Make the drawer recognize common NetSuite page context and suggest the best current move without changing lane authority.

Boundaries: No fragile hard dependency on NetSuite DOM structure; page detection must degrade gracefully; no source order changes; no proof-anchor changes.

Output: page detection map, current move recommendation, trace event map, validator update.

### Prompt 3: Consultant Storytelling Controls

Goal: Add compact controls for redirect, confirm, pressure-test, and summarize so consultants can use the drawer live.

Boundaries: No new lanes; no certification/gap language; no unsupported modules visible; export-only trace.

Output: action model, UX copy map, trace export sample, visual proof.

### Prompt 4: Six-Lane Drawer Parity

Goal: Verify all six lanes render with consistent drawer vocabulary, proof anchors, moves, and guardrails.

Boundaries: No lane authority changes; no proof-anchor changes; no fixture append.

Output: six-lane visual parity report, mismatches, validator results.

### Prompt 5: Consultant Acceptance Run

Goal: Run the drawer through consultant-ready acceptance using one ready lane, one guarded lane, and one ambiguous intake.

Boundaries: No architecture expansion during acceptance.

Output: acceptance checklist, trace files, final install instructions, stop/go decision.

### Prompt 6: Readiness Closure

Goal: Keep the drawer package ready for handoff by preserving install instructions, generated reports, trace samples, and validator coverage.

Boundaries: No new functional scope; no lane authority changes; no proof-anchor changes; no unsupported modules visible.

Output: README status, validation report, six-lane parity report, consultant acceptance report, trace sample, and local preview check.

### Prompt 7: Functional Setup Architecture

Goal: Lock the next arc: convert customer, website, and conversation notes into a reviewable object setup plan that can later create supported NetSuite records.

Boundaries: Draft-only until a creation adapter exists; no hidden writes; no new lanes; no proof-anchor changes; no automatic lane switch; no automatic record creation.

Output: functional setup architecture, object setup contract, role map, goal-based prompt chain, context-aware pickup contract, trace review.

### Prompt 8: UX Streamlining Gate

Goal: Turn the now-long drawer into a compact consultant cockpit before expanding creation or object-template work.

Boundaries: Preserve customer intake, setup plan, six-lane authority, proof anchors, live controls, guardrails, and trace export; no live record creation; no creation adapter implementation.

Output: Plan / Review / Run / Trace state model, compact first viewport, collapsed detail sections, updated validator coverage, and visual preview.

Status: Complete. The drawer now defaults to compact state navigation and moves object review, run controls, and trace into separate states.

### Prompt 9: Creation Adapter Spec

Goal: Define the future adapter interface without enabling live writes.

Boundaries: Spec-only; no live creation; no hidden writes; all writes require supported adapter and explicit consultant confirmation.

Output: adapter contract, request/response shape, dry-run requirements, trace result event.

Status: Complete as spec-only.

### Prompt 10: Dry-Run Object Packet

Goal: Produce the Georgetown Foods dry-run setup packet from the current trace and inherited Demo Command Center V4 object path.

Boundaries: No live creation; preserve Food / Beverage proof anchor as `Finished Good`; use `foodManufacturing`; no unsupported object creation.

Output: dry-run JSON packet, markdown review packet, stop/go decision.

Status: Complete for review-only packet.

### Prompt 11: Monday Live Release Plan

Goal: Move from the current working drawer into a controlled Monday live release plan and conceptual full release roadmap.

Boundaries: Planning and guardrails only; no live writes; no scope expansion beyond six lanes; keep Redwood UX and execution hardening as parallel release gates.

Output: Monday release plan, role map, workstreams, prompt blocks, no-regression guards, Monday stop/go, and full release arc.

Status: Complete. See `MONDAY_LIVE_RELEASE_PLAN.md`.

### Prompt 12: Surgical Visual-Test Policy And Launcher Entry

Goal: Keep the drawer demo-safe by making the launcher movable on the right edge, while avoiding repeated NetSuite visual tests unless the consultant workflow visibly changes.

Boundaries: No drawer writes; no SuiteScript invocation from the drawer; no transaction writes from the drawer; consultant confirmation remains required; website supports identity and naming; notes drive story and value; the internal build engine owns generated records; final generated-name import behavior remains intact.

Output: right-edge launcher snap positions, persisted launcher preference, keyboard/focus controls, duplicate launcher guard, visual QA checklist, and W124-W133 surgical architecture plan.

Visual testing policy: use harness-first validation by default. Require hands-on NetSuite visual testing only when Plan, Build/Results, ROI/Competitive, Run, Trace, launcher entry, generated-name navigation, or governed sandbox invocation materially changes. Skip visual testing for contract-only, trace-only, validator-only, and internal schema work.

Status: Complete for W123. W124 is the next visible consultant-workflow block and should include a visual NetSuite retest after implementation.

## Current Non-Regression Notes After W124

These notes govern W125 and later blocks. They capture the current product decision after the Build tab reset, launcher cleanup, final-name import path, and latest hands-on feedback.

### Consultant Flow

- Do not add another required click to the sales-request flow unless it protects a real write boundary.
- The target flow is:
  1. Enter the sales request.
  2. Use one primary `Save & prepare brief` action.
  3. Confirm the recommended demo path.
  4. Run, export handoff, or import build results.
- `Save request` should not remain a competing primary action when `Prepare brief` is required. Use autosave or a quiet `Save draft` fallback.
- The consultant should not need to click separate save, prepare, confirm, build, and run actions just to reach useful guidance.
- Confirmation remains required before handoff or future governed execution. Compression must not remove the consultant confirmation gate.

### Build And Evidence Boundary

- The Build tab owns consultant-facing handoff and results.
- Before final generated names are imported, Build shows a compact Build Handoff checkpoint only.
- After final generated names are imported, Build becomes Build Results and shows the real generated NetSuite records, names, links, warnings, and navigation pivots.
- Trace should become evidence-only: export handoff, import final generated names if still needed there, export trace, clear session, and pilot evidence checklist.
- Do not let Trace compete with Build as the main consultant workflow. Technical details stay collapsed or internal.
- Do not merge Build and Trace until Build can fully own handoff/results and Trace can remain an evidence utility without weakening export/reset behavior.

### Run Story And Value Guidance

- Run chips must be distinct, not four versions of the same script.
- `Open` frames buyer pain and why the demo matters.
- `Prove` shows the NetSuite proof path tied to the selected demo path.
- `Handle objection` prepares competitive/FUD response and returns to the operational risk.
- `Close value` lands the decision, baseline metric, and next step.
- Remove consultant-facing `low context` language. If the current NetSuite page is generic, guide the consultant where to start instead.
- Run scripts must tie back to prospect pain, value outcome, quantifiable baseline, and next decision.
- If final generated names are imported, Run must prefer those names and links for navigation pivots.

### Competitive And ROI

- Notes, business pain, decision criteria, timeline, and competitor/incumbent drive value story.
- Website supports identity, industry family, and naming context; it must not block value coaching when notes are strong.
- If a named competitor exists, use it carefully and avoid unsupported claims.
- If no named competitor exists, infer likely buying alternatives by lane and label them as likely alternatives, not known facts.
- Spreadsheet/manual-workflow incumbents should prepare for pressure from spreadsheets, QuickBooks, Odoo, Microsoft Dynamics, SAP Business One, Shopify-plus-app stacks, or niche vertical tools only when appropriate to the lane and prospect type.
- NetSuite contrast should always be framed around connected operating flow, proof path, financial impact, and reduced workflow risk.

### Naming And Generated Records

- The internal build engine owns final generated item names, components, assemblies, BOMs, locations, planning, routing/WIP, CSV, and Sales Order mechanics.
- IDB/drawer provisional labels must never be presented as final generated names.
- Final generated names become authoritative only after an imported build result.
- Build Results and Run pivots must clearly distinguish pre-import provisional guidance from post-import final generated names.

### Write And Invocation Boundaries

- No drawer writes.
- No SuiteScript invocation from the drawer.
- No transaction writes from the drawer.
- Hosted resolver remains optional until `remoteSmokeExecuted=true`.
- Future execution into NetSuite requires a dedicated governed pilot block with explicit operator/consultant approval, type-to-confirm or equivalent, trace coverage, and rollback/no-submit behavior.
- Existing state authority rules remain intact: visible lane, selected lane, confirmed lane, exported lane, selected pack, scenario, and final-name import state cannot disagree.

### Visual Testing Policy

- Keep harness-first validation by default.
- Require hands-on NetSuite visual testing only when the visible consultant workflow materially changes.
- W125 will require visual testing because Plan intake and the primary action flow change.
- Contract-only, copy-only, trace-only, validator-only, and internal schema blocks should not require NetSuite visual testing unless they alter the visible consultant path.
