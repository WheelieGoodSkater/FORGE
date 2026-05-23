# W17 UI Feedback Findings For Next Blocks

Decision: CAPTURED FOR NEXT GROUPING / CREATE STILL DISABLED

## Reviewed Feedback

The current Plan, Review, ROI / Competitive, Run, and Trace screens are directionally stronger. Review is now closer to the right shape because it starts with execution context and packet validation instead of forcing the consultant through every record detail immediately.

The Plan tab still asks the consultant to read the Story Bar before the action they came for. On first entry, the consultant's job is not to review the story summary; it is to capture the prospect, website, SC context, and pain notes, then run IDB. The Story Bar is useful, but on Plan it should be collapsed by default once the drawer has enough setup context.

The expanded drawer also needs to reserve browser space instead of simply covering NetSuite. When IDB is open, the native NetSuite page should auto-fit to the remaining left-side width so the consultant can keep working in NetSuite while referencing IDB. This should feel like a companion workspace, not a modal overlay.

## Findings

- Plan tab first viewport is still too recap-heavy because the expanded Story Bar consumes the prime area.
- Guided Intake should be the first actionable surface on Plan.
- Story Bar works better on Review, Run, ROI / Competitive, and Trace because those tabs depend on context recall.
- Collapse behavior should be tab-aware, not a one-size global setting.
- Review is improved because Execution Plan Preview comes before Build Packet.
- ROI / Competitive has strong content, but its best live value is summary-first with expanders for detail.
- Run is cleaner with Live Controls first, but it should keep the Story Bar available as context without making the consultant scroll to act.
- Trace is acceptable because it is naturally a handoff/reset screen.
- Expanded IDB currently risks hiding the right side of NetSuite instead of resizing the usable workspace.
- Left-side NetSuite auto-fit should be optically stable: no horizontal jump, no broken fixed headers, and no permanent layout mutation after closing IDB.

## Recommendations For Next Grouping

1. Make Plan Story Bar collapsed by default when the customer, website, or notes exist.
2. Keep Story Bar expanded by default on Review unless the consultant manually collapses it.
3. Preserve manual collapse state after the consultant chooses it.
4. Promote Guided Intake to the first major Plan card.
5. Add a compact one-line Story Bar stub on Plan: customer, lane, proof, status.
6. Keep `Clear all` visible in the compact Story Bar stub.
7. Keep Review execution-first: Execution Plan Preview, then Build Packet, then Write Confirmation and Result.
8. In W18 pilot packaging, include a scenario rubric that asks consultants whether the Plan first viewport feels action-first.
9. Add an adaptive browser layout mode that reserves space for the drawer while open.
10. Add a safe fallback for NetSuite pages that cannot tolerate body resizing.
11. Restore the original page layout completely when IDB closes or session clears.

## Next Block Adjustments

### W18A: Plan First-Viewport Action Bias

Objective: Make Plan open on guided intake, not recap.
Goal: Consultant sees Customer, Website, Conversation Notes, and Run IDB before reading the full Story Bar.
Roles: Consultant UX Director Agent, Session State Engineer Agent, Validation And Evidence Agent.
Prompt: Make the Story Bar tab-aware. On Plan, collapse the Story Bar by default after setup context exists, render a compact one-line summary, and preserve manual collapse/expand state. Do not change Review, Run, ROI / Competitive, or Trace content order unless needed for consistency.
Validation: Plan first viewport shows Guided Intake above expanded Story Bar detail; Review still shows execution-first packet context; no create behavior changes.

### W18B: Pilot Feedback Rubric

Objective: Turn feedback into a five-consultant pilot checklist.
Goal: Capture whether consultants can set up a new prospect, run IDB, review records, value sell, and reset without confusion.
Roles: Pilot Enablement Agent, Release Conductor Agent, Consultant UX Director Agent.
Prompt: Add a pilot rubric for first viewport, story clarity, lane confidence, write-readiness clarity, reset behavior, and live-demo usefulness.
Validation: rubric includes Plan, Review, ROI / Competitive, Run, Trace, and reset.

### W18C: Adaptive NetSuite Workspace Fit

Objective: Let NetSuite and IDB operate side by side when the drawer is expanded.
Goal: Expanded IDB reserves right-side space and the NetSuite working page auto-fits to the remaining left-side browser width.
Roles: Browser Layout Engineer Agent, Consultant UX Director Agent, NetSuite Compatibility Sentinel Agent, Validation And Evidence Agent.
Prompt: Add adaptive layout behavior that applies a reversible right-side workspace offset while IDB is open. Prefer CSS variables and body/root padding over brittle page-specific DOM edits. Preserve fixed NetSuite headers where possible, avoid horizontal clipping, and restore the original layout when the drawer closes. Include a fallback that leaves overlay mode intact if the page resists resizing.
Validation: open/close IDB on Home, Sales Order View, Customer Record, and item/inventory pages; confirm left-side content remains visible, no permanent body mutation occurs, and drawer width stays stable.

### W18D: Guided Story Polish Before Write Pilot

Objective: Polish the consultant path before actual write execution.
Goal: The consultant can move from intake to review to value to run without reading redundant blocks.
Roles: Consultant UX Director Agent, Storytelling Agent, ROI / Competitive Agent, Code Review Sentinel Agent.
Prompt: Compress repeated story text, keep the best sentence at the top of each tab, move secondary proof into expanders, and make every tab answer one live-demo question: what do I enter, what will IDB prepare, why does it matter, what do I say, or what evidence do I export?
Validation: first viewport on each tab has a clear primary action and no repeated full Story Bar unless expanded.

### W19: Governed Write Execution Pilot Branch

Objective: Move from create-disabled scaffolding to a controlled sandbox write branch.
Goal: Enable Customer and Proof Item writes only in a separate governed pilot branch with runtime flags, type-to-confirm, trace result capture, and rollback evidence.
Roles: SuiteScript Write Agent, Release Conductor Agent, Validation And Evidence Agent, NetSuite Compatibility Sentinel Agent.
Prompt: Create the pilot branch implementation path from the W15 Customer and W16 Proof Item scaffolds. Do not enable writes in the main Tampermonkey drawer. Require sandbox runtime flags, consultant confirmation, type-to-confirm phrase, reviewed packet, Customer result before Proof Item, and trace capture. Transaction context remains blocked until parent results are stable.
Validation: local harness, sandbox smoke with CREATE_ENABLED deliberately controlled in the branch only, trace result includes record IDs and URLs, and failure returns blocked or partial_failed without silent retry/deletion.

### W20: Transaction Context Execution Design

Objective: Prepare transaction context writes after Customer and Proof Item results are stable.
Goal: Sales Order View or equivalent transaction context can be created/updated only after parent records exist and are traceable.
Roles: SuiteScript Write Agent, Packet Contract Agent, Transaction Context Agent, Validation And Evidence Agent.
Prompt: Extend the write branch design for transaction context. Use parent Customer and Proof Item IDs, idempotency lookup, existing DCC transaction intent, and trace result requirements. Keep this blocked in main until W19 passes.
Validation: harness rejects missing parent IDs, duplicate lookup blocks, trace result contract includes parentCustomerRecordId and parentProofRecordId.

### W21: Five-Consultant Executable Pilot Pack

Objective: Package the first executable pilot for a small consultant group.
Goal: Five consultants can install, run, validate, export evidence, and report feedback without ambiguity.
Roles: Pilot Enablement Agent, Release Packaging Agent, Consultant UX Director Agent, Support Triage Agent.
Prompt: Assemble install steps, scenario cards, expected screenshots, failure handling, reset guidance, write-enabled branch boundary, and feedback rubric. Make clear what is safe in main, what is pilot-branch only, and what evidence is required before broader release.
Validation: pilot pack includes exact files, exact upload path, exact test scenarios, rollback/clear-session instructions, and go/no-go checklist.

## No Regression

- No live writes.
- No automatic creation.
- No lane/proof/toggle changes.
- No N/LLM approval authority.
- Keep website-first lane and naming authority.
- Keep transaction context gated until Customer and Proof Item result IDs and URLs exist.
- Any adaptive layout behavior must be reversible and must not permanently mutate NetSuite page layout.
