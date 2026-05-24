# Next 24 Hour Productized Release Plan

Generated: 2026-05-09

## Executive Analysis

The drawer is much closer: it now has seven authorized lanes, product-aware preview naming, DCC toggles, a story bar, and a review packet with fields, dependencies, blockers, and create readiness.

The next issue is not raw capability. It is live-demo usefulness.

The consultant still needs:

- A fresh-session reset model that clears after NetSuite logout but stays across demo tabs.
- A more direct build packet: `Customer will be X`, `Finished Good will be Y`, `Sales Order will be Z`.
- A dedicated ROI / Competitive Review surface that is deeper than a small story bar.
- Run controls that respond to the customer notes, industry pains, objections, and competitive pressure.
- More interactive, more confidence-building UI that still respects Oracle Redwood.

The next 24 hours should productize the drawer into a demo operating cockpit that can intake a new SC request, capture customer/website/notes, generate a value-driven agenda, prepare a build packet, support objections, and keep NetSuite positioned through provable workflow advantage.

## Product Outcome

By the end of the 24-hour block, the Intelligent Demo Builder should support this flow:

1. Consultant opens NetSuite after a fresh login.
2. Drawer starts clean unless an active same-session demo is in progress.
3. Consultant enters customer, website, conversation notes, and optional SC request context.
4. Drawer recommends lane and product/record setup.
5. Consultant selects toggles: new item, manufacturing, WIP.
6. Review shows a direct record/transaction list.
7. ROI / Competitive Review gives a value-selling agenda and objection handling.
8. Run gives customer-specific moves and live talk track.
9. Trace exports a complete packet for follow-up.
10. Creation remains locked until adapter support and explicit confirmation exist.

## Critical Feedback Converted To Requirements

## Latest Run Decisions

The current drawer proves that the model can infer a lane, build a named packet, and carry the proof story. The next release must now stop behaving like a rich technical preview and start behaving like a live consultant cockpit.

Decisions:

- The active demo context is useful across tabs, but stale state after logout is not acceptable.
- The primary Review surface must be a direct creation list, not a field preview.
- Technical field IDs remain available for adapter confidence, but they are not the live consultant headline.
- ROI and competitive strategy are important enough to become a dedicated `ROI / Competitive Review` tab, not a small lower card.
- Live Run controls must become customer-aware coaching actions, not generic utility buttons.
- The UI should use stronger Redwood-aligned state color: teal for action, green for value, amber for risk, blue-gray for context, and restrained contrast for selected states.
- Competitive content can be generated from the entered context, but it must stay evidence-safe and workflow-based unless a specific competitor and verified facts are provided.

## Target Consultant Story

When a consultant receives a new SC request, the drawer should let them enter:

- Customer / prospect.
- Website.
- Conversation notes.
- Optional SC objective.
- Optional known competitor.
- Optional decision criteria.

The drawer should then produce:

- The recommended lane and proof anchor.
- The toggles to include or exclude new item, manufacturing, and WIP.
- A direct build list:
  - `Customer will be Liquid Death`
  - `Sales Order will be Liquid Death - retail beverage replenishment Demo Order`
  - `Finished Good will be Liquid Death Sparkling Water Variety 12-Pack`
  - `Ingredient / Packaging Structure will be Liquid Death Canned Beverage Readiness Structure`
- A value agenda that explains why the proof matters.
- A competitive review that helps position NetSuite without unsupported claims.
- A live run path with the top three moves and why they matter.
- A trace packet that can be exported for handoff, review, or adapter testing.

### Requirement 1: Active Demo Session Reset

Current issue: old Liquid Death context survived a fresh NetSuite login.

Target behavior:

- Keep IDB state across NetSuite tabs during the same active demo.
- Clear automatically after NetSuite logout or a fresh authenticated session.
- Keep a visible `Clear demo` or `Start new demo` button.
- Trace reset must clear setup, lane, toggles, packet, and events.

Implementation direction:

- Add a session identity detector using available NetSuite page/account/user context when possible.
- Store `sessionFingerprint` with active state.
- On drawer init, compare current fingerprint to saved fingerprint.
- If mismatch, reset state and trace.
- Keep 8-hour TTL as a backup, not the primary reset model.
- Put `Clear demo` in Story Bar or Trace utility area.

Acceptance:

- New NetSuite login starts clean.
- Multiple tabs during the same login keep the current IDB.
- Clear demo is always discoverable.
- No stale customer appears after logout/login.

### Requirement 2: Direct Build Packet Language

Current issue: the review packet is richer but too verbose and field-heavy.

Target behavior:

- Primary row copy must be direct:
  - `Customer will be Liquid Death`
  - `Sales Order will be Liquid Death - retail beverage replenishment Demo Order`
  - `Finished Good will be Liquid Death Sparkling Water Variety 12-Pack`
  - `Ingredient / Packaging Structure will be Liquid Death Canned Beverage Readiness Structure`
- Field details move behind a compact details control.
- Review shows record identity first, technical fields second.

Implementation direction:

- Add a `buildStatement` per record.
- Render build statement as the row headline.
- Collapse intended fields and dependencies by default.
- Keep source confidence and fallback reason visible as compact chips.

Acceptance:

- Consultant can scan the build packet in under 10 seconds.
- No row leads with `entity`, `memo`, or internal field IDs.
- Field-level preview remains available for confidence and adapter readiness.

### Requirement 3: ROI / Competitive Review Tab

Current issue: ROI and competitive content is visible but too shallow.

Target behavior:

- Add a fifth tab: `Value`.
- `Value` contains ROI / Competitive Review.
- The Story Bar keeps a small value headline.
- The Value tab contains the deeper sales and competitive material.

Value tab sections:

- Business pain from notes.
- ROI thesis.
- Value agenda.
- NetSuite proof path.
- Competitive contrast.
- Objection handling.
- Discovery questions.
- Close / transition line.

LLM policy:

- N/LLM can generate value and competitive framing from customer, website, notes, lane, and product signal.
- Competitive statements must remain workflow-based and avoid unsupported claims.
- If competitive input is unknown, use generic displacement framing: disconnected tools, spreadsheet handoffs, point-solution switching, fragmented demand-to-fulfillment proof.

Acceptance:

- Consultant has a clear value-selling page.
- ROI is tied to the customer's notes and lane.
- Competitive review is useful without making unverified vendor claims.
- Value tab is exportable in trace.

Required tab shape:

- `Plan`: intake, lane, toggles, and next recommended setup action.
- `Review`: direct build list and readiness status.
- `ROI / Competitive Review`: value agenda, ROI thesis, competitive proof, objections, and discovery questions.
- `Run`: live path, top three moves, and page-aware coaching.
- `Trace`: export, clear all, and evidence.

### Requirement 4: Influential Run Controls

Current issue: live controls are generic.

Target behavior:

- Run controls should respond to:
  - Customer notes.
  - Industry pains.
  - Product signal.
  - Selected lane.
  - Current NetSuite page.
  - Competitive or ROI context.

Run controls should become:

- `Open`: start the story with customer pain and proof anchor.
- `Prove`: point to the exact NetSuite object/page/action.
- `Handle objection`: respond to risk, competitor, or value skepticism.
- `Close value`: summarize outcome, ROI, and next step.

Implementation direction:

- Replace generic Redirect / Confirm / Pressure-test / Summarize labels or move them behind smarter action names.
- Generate action copy from the setup packet.
- Keep guardrails available but out of the primary path.

Acceptance:

- Run gives a customer-specific talk track.
- Controls help the consultant steer, prove, defend, and close.
- The selected action output is traceable.

### Requirement 5: More Interactive Redwood-Aligned UI

Current issue: colors are bland and the UI still feels rough.

Target behavior:

- More confident color hierarchy while staying Redwood-like.
- More interactive cards with selected states, progress, chips, and concise controls.
- Less stacked-card monotony.
- Clear primary action per tab.

Design direction:

- Use teal for primary flow.
- Use green for value/readiness.
- Use amber for risk/guardrail.
- Use blue-gray for neutral context.
- Add a compact progress rail: `Setup -> Packet -> Value -> Run -> Trace`.
- Use segmented controls and collapsible details.
- Keep text density lower in first viewport.

Acceptance:

- Consultant can identify where they are instantly.
- Value and next action are prominent.
- Review packet is scannable.
- UI does not feel like a document pasted into a drawer.

## Roles And Agents

### Release Captain

Objective: Own the 24-hour scope, release order, and stop/go.

Responsibilities:

- Keep work in the approved package.
- Sequence blocks.
- Ensure preflight remains green.
- Own final release checklist.

### Session State Engineer

Objective: Fix stale state without breaking cross-tab demo continuity.

Responsibilities:

- Session fingerprint.
- Logout/new-login detection.
- Clear demo control.
- Trace/session reset.

### Build Packet Architect

Objective: Make Review read like a direct list of what will be built.

Responsibilities:

- Direct build statements.
- Collapsed technical field details.
- Record identity hierarchy.
- Adapter-ready metadata.

### Value Strategy Agent

Objective: Build ROI and business-value story from customer context.

Responsibilities:

- ROI thesis.
- Pain-to-proof mapping.
- Value agenda.
- Executive-friendly language.
- Trace export shape.

### Competitive Strategy Agent

Objective: Give consultants safe competitive positioning.

Responsibilities:

- Workflow-based contrast.
- Objection handling.
- No unsupported competitor claims.
- NetSuite proof positioning.

### Run Coach Agent

Objective: Make live controls influential and customer-specific.

Responsibilities:

- Open / Prove / Handle objection / Close value actions.
- Customer-specific talk tracks.
- Page-aware current move.
- Guardrail-aware redirects.

### Redwood Interaction Designer

Objective: Make the UI feel productized, interactive, and consultant-friendly.

Responsibilities:

- Color hierarchy.
- Progress rail.
- Collapsible details.
- Tab layout.
- First viewport scanability.

### Validation Engineer

Objective: Lock every block with local validation.

Responsibilities:

- Validator rules.
- Report evidence.
- Trace sample shape.
- No-regression checks.

### NetSuite Creation Architect

Objective: Keep the packet aligned to eventual record creation.

Responsibilities:

- Record type model.
- Adapter payload compatibility.
- Toggle-driven object scope.
- Create blocker semantics.

## Next 24 Hour Blocks

### Block H1: Session Reset And Clear Demo

Goal: Keep state during the active demo, clear on new NetSuite login, and restore a visible clear control.

Agents: Session State Engineer, Validation Engineer.

Output:

- Session fingerprint model.
- Clear demo control in Story Bar or Trace.
- Reset trace event.
- Validator coverage.

No-regression:

- Cross-tab state remains.
- Active same-login demo is not cleared unexpectedly.
- No stale customer after logout/login.

### Block H2: Direct Build Packet

Goal: Make Review rows say exactly what will be built.

Agents: Build Packet Architect, NetSuite Creation Architect, Redwood Interaction Designer.

Output:

- `buildStatement` per record.
- Collapsed field details.
- Simplified record row hierarchy.
- Adapter metadata retained.

No-regression:

- Existing intended fields, dependencies, toggles, blockers remain in payload.
- Creation remains blocked.

### Block H3: Value Tab

Goal: Add `Value` tab for ROI / Competitive Review.

Agents: Value Strategy Agent, Competitive Strategy Agent, Redwood Interaction Designer.

Output:

- Five-tab layout: Plan, Review, Value, Run, Trace.
- Value agenda.
- ROI thesis.
- Competitive contrast.
- Objection handling.
- Discovery questions.
- Trace export fields.

No-regression:

- Value copy is customer/lane-specific.
- No unsupported competitor claims.
- Story Bar keeps concise value summary.

### Block H4: Run Coach

Goal: Replace generic live controls with customer-specific demo coaching.

Agents: Run Coach Agent, Value Strategy Agent, Competitive Strategy Agent.

Output:

- Open / Prove / Handle objection / Close value controls.
- Contextual talk track.
- Industry pain tie-in.
- Competitive objection support.

No-regression:

- Trace captures action selected.
- Guardrails remain available.
- Recommended move still works.

### Block H5: Interaction And Color Upgrade

Goal: Make the UI feel productized and interactive.

Agents: Redwood Interaction Designer, Consultant UX Council.

Output:

- Stronger semantic color tokens.
- Progress rail.
- Better selected states.
- Reduced text density.
- Collapsible technical detail.

No-regression:

- No decorative gradients/orbs.
- Cards remain 8px radius or less.
- Text remains readable on narrow drawer.

### Block H6: SC Request Intake

Goal: Support a new SC request intake, not only ad hoc notes.

Agents: Context Intelligence Agent, Value Strategy Agent, Build Packet Architect.

Output:

- Optional SC request field.
- Goal/objective field.
- Known competitor field.
- Decision criteria field.
- Pain/objective mapping.

No-regression:

- Basic customer/website/notes flow still works.
- No required field explosion for quick demos.

### Block H7: Production Readiness Pass

Goal: Make the package ready for controlled production pilot.

Agents: Release Captain, Validation Engineer.

Output:

- Updated README.
- Release checklist.
- Preflight.
- Install instructions.
- Known limitations.
- Stop/go report.

No-regression:

- Tampermonkey install remains simple.
- Live creation remains locked until adapter pilot.

### Block H8: Release Candidate Demo Script

Goal: Produce the consultant-facing demo script for the controlled pilot.

Agents: Release Captain, Run Coach Agent, Value Strategy Agent, Competitive Strategy Agent.

Output:

- One end-to-end intake example.
- One Food / Beverage example.
- One Apparel & Accessories example.
- One objection-handling example.
- One trace export review.
- One stop/go checklist.

No-regression:

- Demo script cannot require live record creation.
- Demo script cannot depend on unsupported NetSuite modules.
- Competitive positioning must stay workflow-based unless facts are provided.

## Recommended 24 Hour Sequence

1. H1 Session Reset And Clear Demo.
2. H2 Direct Build Packet.
3. H3 Value Tab.
4. H4 Run Coach.
5. H5 Interaction And Color Upgrade.
6. H6 SC Request Intake.
7. H7 Production Readiness Pass.
8. H8 Release Candidate Demo Script.

This order is intentional: state hygiene first, packet clarity second, value/sales support third, live coaching fourth, polish fifth, intake expansion sixth, release hardening last.

## 24 Hour Execution Map

### Hours 0-3: Hygiene And Reset

- Implement visible `Clear all`.
- Clear active IDB state on NetSuite login/logout boundary.
- Keep cross-tab active demo state.
- Add validator coverage.

### Hours 3-7: Direct Review Packet

- Replace field-first rows with direct `will be` statements.
- Keep field payload collapsed.
- Add confidence/source chips only where they help decision-making.

### Hours 7-11: ROI / Competitive Review

- Add dedicated value tab.
- Convert customer notes into value thesis, business pains, proof path, objections, and discovery questions.
- Add safe competitive framework.

### Hours 11-15: Run Coach

- Replace generic live controls with `Open`, `Prove`, `Handle objection`, and `Close value`.
- Generate customer-specific talk tracks.
- Tie top three moves to ROI and competitive pressure.

### Hours 15-18: UX Interaction Upgrade

- Add stronger Redwood-aligned color states.
- Add progress rail.
- Reduce first-viewport clutter.
- Add collapsible technical details.

### Hours 18-21: Creation Adapter Readiness

- Confirm packet payload maps to future create adapter.
- Keep creation locked by default.
- Validate toggles for new item, manufacturing, and WIP.

### Hours 21-24: Pilot Release Candidate

- Run preflight.
- Update README and release notes.
- Validate Food / Beverage, Apparel, and fallback scenarios.
- Produce stop/go result.

## Production Readiness Definition

Ready for controlled production pilot when:

- Fresh login starts clean.
- Same demo survives navigation and multiple NetSuite tabs.
- Clear demo works.
- Build packet is direct and scannable.
- Value tab is useful for sales and SCs.
- Run controls are customer-specific.
- Apparel does not misroute.
- Trace export includes setup, value, packet, actions, and blockers.
- Creation remains locked unless a supported adapter is explicitly enabled.
- Preflight passes.

## Current Status

Completed before this plan:

- Seven authorized lanes.
- Apparel & Accessories.
- Product-aware preview naming.
- DCC toggles.
- P3 product preview intelligence.
- P4 above-the-fold value story.
- P5 build packet metadata.
- P8 cockpit pass.
- H1 visible Clear all and NetSuite auth-boundary reset.
- H2 direct `will be` build packet rows with collapsed adapter details.
- H3 dedicated ROI / Competitive Review tab.
- H4 customer-aware Run Coach controls.
- H5 five-state interaction model with progress rail and stronger Redwood-aligned selected states.
- H6 optional SC request intake for objective, competitor, and decision criteria.
- H7 production readiness checklist and refreshed GitHub repo transfer scope.
- H8 release-candidate consultant demo script and trace sample.

Next block to execute:

- Adapter implementation planning or controlled NetSuite smoke, depending on whether the consultant visual run is complete.

Next productization objective after H1:

- Controlled NetSuite smoke is now the next acceptance gate before adapter implementation. The code is locally green, but visual confirmation in NetSuite is still required before calling it production-ready.
