# Next 48 Hour Write And Full Release Plan

Status: w46_complete_proof_item_write_v2
Generated: 2026-05-11 19:08 ET

## Release Intent

Move Intelligent Demo Builder from a create-disabled guided companion into a controlled write-ready release path for a five-consultant pilot. The main drawer remains safe: it can guide, review, export, and prepare, but it does not create records until the governed SuiteScript write branch passes sandbox gates and explicit consultant confirmation.

The next release must feel simpler for consultants while becoming stronger underneath. A consultant should enter a NetSuite demo environment, open IDB, provide customer/prospect name, website, and conversation or SC request notes, click Run IDB, review the selected industry family, inspect the exact records and transactions that will be prepared, use ROI / Competitive to value-sell, then run the story from the drawer without losing context across NetSuite tabs.

## W41 Current Truth

The project has crossed the first meaningful execution line: the governed W24 pilot path created or updated a Customer and a Proof Item in the approved NetSuite production demo account. That is real progress, but it is not the finish line.

What is proven:

- Customer can be created or updated through the governed Suitelet path.
- Proof Item can be created or updated after Customer ID and URL exist.
- Account context matters and must be resolved before writes: subsidiary, location, and tax schedule are now first-class gates.
- Transaction context stayed blocked, which is correct.

What is not proven yet:

- Vendor attach is not in the IDB pilot write path yet.
- Planning controls are not in the IDB pilot write path yet.
- Sales Order / transaction context write is not enabled.
- The DCC runner-style setup logic has not been fully translated into the IDB write architecture.
- Five-consultant usability has not been proven against the write result workflow.

Blunt recommendation: do not expand record types yet. The next completion path should translate the proven DCC Runner/Suitelet mechanics into the IDB pilot one by one: account context, vendor attach, planning control, item setup defaults, then transaction context.

## W42 Current Truth

The DCC Runner/Suitelet review confirms that the current IDB pilot write path is real but still too thin for a consultant-ready executable prototype.

What W42 translated:

- DCC required account context first. IDB already has W39 subsidiary/location/tax schedule gates, but W43 must extend this into a reusable Account Context V2.
- DCC attached and validated a preferred vendor on proof items. IDB does not do this yet.
- DCC turned or seeded planning behavior for demo stability. IDB does not do this yet.
- DCC kept fresh hero item logic on the same vendor/planning persistence path as anchor items. IDB must not split New item into a brittle second path.
- DCC separated transaction context handoff from item setup. IDB should keep Sales Order / transaction context disabled until parent Customer and Proof Item results are stable.
- DCC preserved refresh/reset evidence. IDB needs the same compact result UX for five consultants.

Blunt recommendation: keep W42 as the new architectural source of truth and treat the older lower-section W42-W46 notes as historical. The executable path is now W43 through W52 below.

## W43 Current Truth

W43 is complete. The W24 pilot Suitelet now has a reusable Account Context Admin Resolver V2. It still requires subsidiary and tax schedule before the governed Customer + Proof Item write path can proceed, and it now also exposes optional account defaults for location, currency, terms, department, and class.

What changed:

- Missing account context returns `blocked_missing_account_context` JSON instead of a NetSuite HTML 500.
- Customer writes can safely receive optional currency, terms, department, and class defaults when configured.
- Proof Item writes can safely receive optional location, department, and class defaults while still requiring tax schedule.
- Harness coverage now proves W43 context V2 without expanding write scope.

Blunt recommendation: do not add more record types yet. W44 must port the DCC vendor attach path next because the Proof Item is not demo-useful enough until vendor/procurement setup is governed.

## W44 Current Truth

W44 is complete. The W24 pilot Suitelet now has a governed Vendor Context Resolver and vendor attach plan for the Proof Item path.

What changed:

- Vendor attach is optional by default and controlled by `custscript_idb_require_vendor_attach`.
- If vendor attach is required and no vendor can be resolved, the Suitelet returns JSON `blocked_missing_vendor_context` before any Customer or Proof Item write.
- If vendor lookup is ambiguous, the Suitelet returns JSON `blocked_ambiguous_vendor_context` before any write.
- If `custscript_idb_default_vendor` is configured, the Proof Item write attempts preferred-vendor attach and optional `custscript_idb_default_purchase_price`.
- The result contract now exposes `vendorContext` and `vendorAttachPilotPlan`.
- Transaction context remains disabled.

Blunt recommendation: W44 makes the Proof Item more procurement-realistic, but the item can still be operationally unstable if planning behavior is wrong. W45 must translate the DCC planning-control rail next: turn planning off or set planning defaults explicitly, show the choice in Review, and prove it in harness before any transaction pilot expands.

## W45 Current Truth

W45 is complete. The W24 pilot Suitelet now exposes a Planning Control Rail for the Proof Item path.

What changed:

- The Suitelet returns `planningContext` and `planningControlPlan`.
- Default policy is `stable_manual_planning`.
- Auto planning calculations are disabled by default unless explicitly configured otherwise.
- Optional replenishment method can be configured with `custscript_idb_default_replenishment_method`.
- The Proof Item write path attempts planning fields through guarded `safeSetValue` calls, so missing account fields do not become HTML 500 failures.
- Transaction context remains disabled.

Blunt recommendation: do not add Sales Order writes yet. W46 should consolidate W43 account context, W44 vendor attach, and W45 planning into a cleaner Proof Item Write V2 contract and result summary. That is the bridge from "we can create an item" to "we can create a demo-usable proof item."

## W46 Current Truth

W46 is complete. The W24 pilot Suitelet now returns a single `proofItemWriteV2` contract that pulls together the account context, vendor attach, planning rail, parent Customer result, Proof Item result, and trace requirements.

What changed:

- Proof Item result evidence now has one response key: `proofItemWriteV2`.
- The contract appears in create-disabled, runtime-blocked, account-context-blocked, vendor-context-blocked, and created/partial-failed responses.
- The contract exposes readiness gates for customer result, account context, vendor context, planning context, and transaction context.
- The contract exposes governed field groups for identity, account, procurement, planning, and trace.
- A created Proof Item now returns one clean consultant message and result contract while Sales Order / transaction context stays blocked.

Blunt recommendation: W47 should now move this evidence into the drawer. The consultant should see a compact result card that says Customer updated/created, Proof Item updated/created, Sales Order not created yet, and exactly what to verify next. Do not expand write scope until this UI is readable by a live consultant.

## Completion Architecture From Now Forward

### W42: DCC Runner/Suitelet Pattern Translation

Objective: Review the DCC Runner and Suitelet lessons and turn them into IDB write-path requirements.
Goal: Identify exactly which DCC mechanics must exist before IDB can be trusted for broader item and transaction creation.
Roles: DCC Pattern Translator Agent, SuiteScript Write Agent, Code Review Sentinel Agent.
No regression: no new writes; main Suitelet remains create-disabled; W24 remains Customer + Proof Item only.
Outputs: DCC-to-IDB mapping for subsidiary, vendor, planning controls, item defaults, runner sequencing, and reset/rollback.
Status: COMPLETE. See `data/w42_dcc_runner_suitelet_pattern_translation.json` and `reports/w42_dcc_runner_suitelet_pattern_translation.md`.

### W43: Account Context Admin Resolver V2

Objective: Extend W39 beyond subsidiary/location/tax schedule into a reusable account-context resolver.
Goal: Make required demo-account setup visible before writes, including subsidiary, location, tax schedule, currency, terms, department/class where needed, and any lane-specific defaults.
Roles: Context Architect Agent, SuiteScript Worker Agent, Regression Guard Agent.
No regression: expected config blockers return JSON, never HTML 500; no transaction writes.
Outputs: account context schema V2, deployment parameter checklist, harness coverage.
Status: COMPLETE. See `data/w43_account_context_admin_resolver_v2.json` and `reports/w43_account_context_admin_resolver_v2.md`.

### W44: Vendor Attach And Procurement Defaults

Objective: Port DCC vendor/item setup lessons into the Proof Item write path.
Goal: Proof Items can carry the right vendor relationship or vendor reference strategy when the lane requires buying, fulfillment, or procurement proof.
Roles: DCC Pattern Translator Agent, SuiteScript Item Worker Agent, Packet Contract Agent.
No regression: no silent vendor creation; vendor attach is lookup-first and blocks if ambiguous.
Outputs: vendor lookup/attach design, required fields, rollback evidence, harness fixture.
Status: COMPLETE. See `data/w44_vendor_attach_procurement_defaults.json` and `reports/w44_vendor_attach_procurement_defaults.md`.

### W45: Planning Control Rail

Objective: Add explicit planning behavior to item creation.
Goal: IDB can turn planning off or set planning defaults where DCC proved it is required for demo stability.
Roles: Supply Planning Agent, SuiteScript Item Worker Agent, Regression Guard Agent.
No regression: planning settings must be explicit in Review before write; no hidden item field changes.
Outputs: planning control contract, field map, review UI line item, harness coverage.
Status: COMPLETE. See `data/w45_planning_control_rail.json` and `reports/w45_planning_control_rail.md`.

### W46: Proof Item Write V2

Objective: Combine account context, vendor attach, and planning control into a stronger Proof Item writer.
Goal: The Proof Item is not just named correctly; it is demo-usable inside NetSuite with the minimum required operational setup.
Roles: SuiteScript Write Agent, Item Setup Agent, Validation And Evidence Agent.
No regression: Customer still writes first; Proof Item still stops if Customer fails; transaction context remains disabled.
Outputs: Proof Item V2 writer, result summary, recovery instructions.
Status: COMPLETE. See `data/w46_proof_item_write_v2.json` and `reports/w46_proof_item_write_v2.md`.

### W47: Drawer Write Result UX V2

Objective: Show live write results in the drawer as a consultant-friendly handoff.
Goal: Tester sees "Customer updated", "Proof Item created", "Sales Order not created yet", with links, next action, and reset guidance.
Roles: Consultant UX Director Agent, Pilot Evidence Lead, Accessibility Guard Agent.
No regression: drawer imports/displays evidence; it does not auto-submit writes.
Outputs: compact result card, Trace import polish, five-consultant test script.

### W48: Transaction Context Readiness Pilot

Objective: Prepare transaction context after parent Customer and Proof Item records are stable.
Goal: IDB can validate the Sales Order / demand context write plan without enabling the write by default.
Roles: Transaction Context Agent, SuiteScript Write Agent, Packet Contract Agent.
No regression: transaction write remains disabled unless a separate explicit pilot block enables it.
Outputs: transaction context field map, parent result contract, blocked/ready states.

### W49: Sales Order Context Write Pilot

Objective: Enable the first governed transaction-context write only after W48 passes.
Goal: Create/update a minimal Sales Order or transaction context tied to the Customer and Proof Item.
Roles: SuiteScript Transaction Worker Agent, Regression Guard Agent, Pilot Evidence Lead.
No regression: no transaction write without parent IDs/URLs; no automatic drawer write; no silent retry/deletion.
Outputs: transaction pilot Suitelet path, harness, rollback evidence.

### W50: Website Intelligence Release Candidate

Objective: Make website evidence strong enough for real prospect intake.
Goal: Website owns lane/package/object naming; notes own story, ROI, competitive, objections, and run coaching.
Roles: Website Intelligence Agent, N/LLM Advisory Architect Agent, Consultant UX Director Agent.
No regression: conversation notes cannot override strong website evidence into the wrong lane.
Outputs: website evidence rubric, advisory import contract, known/unknown website QA set.

### W51: Five-Consultant Test Pack

Objective: Package the product for a controlled five-consultant test by Friday, May 15, 2026.
Goal: A tester can install the drawer, run a prospect, review the packet, value-sell, execute the governed write pilot, capture evidence, and reset cleanly.
Roles: Pilot Enablement Agent, Release Packaging Agent, Validation And Evidence Agent.
No regression: pilot pack states exactly what can write and what cannot.
Outputs: install steps, test scenarios, feedback rubric, stop conditions, evidence checklist.

### W52: Release Candidate And Completion Gate

Objective: Produce the release candidate for broader usage.
Goal: IDB is productized enough for guided consultant use, with governed writes, reset, trace, and rollback evidence.
Roles: Release Conductor Agent, Code Review Sentinel Agent, UX Director Agent, SuiteScript Write Agent.
No regression: main package safety preserved; all write paths are explicit, traceable, and reversible by process.
Outputs: final upload files, version marker, README/runbook, release notes, validation report.

## Where We Are

- The drawer is now a persistent Tampermonkey NetSuite companion with active session state, cross-tab pickup, trace export, guided intake, Story Bar, Review, ROI / Competitive, Run, and Trace tabs.
- Website-first routing exists and is validated for known cases such as Vans, Gordon and Smith, and Milk-Bone, but the next release needs a stronger resolver that treats website evidence as the first authority, conversation notes as story shaping, and industry fallback as last resort.
- Review packet naming has improved from generic demo names into prospect-specific "will be" record previews, with direct rows for customer, transaction context, proof item, and supporting proof records.
- ROI and competitive content is contained in the dedicated ROI / Competitive tab, but it needs more auditability, more industry-specific NetSuite win language, and a cleaner consultant workflow.
- The SuiteScript direct-write path is scaffolded but disabled. It includes create-disabled validation, lookup/idempotency planning, small write smoke planning, partial failure and rollback evidence, and a transaction-context pilot that stays blocked until customer and proof result IDs/URLs exist.
- V15 leaves us correctly positioned: next we isolate a controlled write branch, implement minimal sandbox writes, verify trace result contracts, then graduate to transaction context only after parent records are stable.
- W27 adds the newest visual-pilot finding: a new website can route to the right lane but still produce weak object names if the package seed is not website-led. Trek Bikes is now a Dealer Hardgoods guard case with `Bicycle SKU`, `Bicycle Dealer Hardgoods`, and `dealer bicycle availability` naming. Food/Beverage terms such as ingredient and lot readiness cannot leak into Dealer Hardgoods unless the website itself proves that product context.
- W35-W37 changed the release architecture in an important way: website intelligence is now a governed pipeline, not a pile of domain exceptions. `governedWebsiteResolver` owns website/package identity, `npm run harness:website` proves 13 executable website scenarios, and `websiteEvidence` gives consultants or future N/LLM advisory a safe way to strengthen opaque websites without letting conversation notes own the lane.
- W40 changed the live pilot path from one-lane Food / Beverage only to an explicit governed allowlist for `food_beverage` and `products_cpg`. The scope is still Customer first and Proof Item second only; Sales Order / transaction context remains disabled. Review now renders from the current computed packet and no longer depends on `acceptedPacket`, which reduces lag and makes the tab reliable for live consultants.
- The next architectural push must stop adding UI surface area unless it directly helps pilot writes, evidence review, or consultant execution. The value is now in making the governed write path real, observable, recoverable, and easy enough for five consultants to trust.

## Primary Recommendations

1. Keep main create-disabled until a separate pilot branch passes sandbox write smoke, result trace, rollback evidence, and consultant confirmation tests.
2. Start writes with the smallest useful path: Customer plus proof item for one or two high-confidence lanes. Do not write transaction context until customer and proof IDs/URLs are returned.
3. Make the consultant flow one-action: edit brief, Run IDB, review packet, run the story, export/clear session. Lane cards should become secondary after Run IDB produces the recommended lane.
4. Use website evidence for lane and naming first. Use conversation notes to shape pain, top moves, ROI thesis, objections, and run coaching. Use N/LLM only as advisory enrichment, never as write authority.
5. Treat ROI / Competitive as a sales-assist workspace: concise default view, expandable audit trail, source state, value agenda, proof stack, objection handling, and "why NetSuite wins" language that stays workflow-based unless verified facts are supplied.
6. Continue a non-stop UX review loop: every implementation block should include a consultant usability pass, first-viewport compression pass, and no-noise pass.
7. Move website intelligence from lane-only to package-first: website evidence should produce lane, proof anchor, product seed, product family, demand moment, and anti-leak tags before the review packet freezes.

## Blunt Architecture Review After W37

The project is now past the "better drawer" phase. The drawer is good enough to guide intake, review, value story, run coaching, trace, and reset. More visual polish will help, but it is no longer the critical path.

The critical path is now execution trust:

- Can IDB choose the right lane and package for a prospect from website evidence? Mostly yes, with a clear limitation: arbitrary opaque websites need pasted website evidence or future N/LLM website summary. We should not try to hardcode the internet.
- Can IDB produce a reviewed packet that maps to NetSuite records? Yes, create-disabled packets and SuiteScript review plans exist.
- Can IDB safely write a tiny, useful slice in sandbox? Not yet proven in a live sandbox with record IDs/URLs returned and imported back into the drawer. That is the next real proof.
- Can consultants use it without getting buried? Better than before, but every new write feature must be presented as "what will happen / why it matters / what evidence came back", not as a wall of gates.
- Can transaction context be written next? Not yet. Customer and Proof Item parent results must be stable first. Anything else would be premature.

Hard recommendation: focus the next release around a two-record write pilot, not broad creation. Customer + Proof Item is enough to prove the full architecture: reviewed packet, SuiteScript write path, idempotency, result import, rollback evidence, and consultant confidence. Transaction context should be designed but still blocked until the pilot proves parent records.

## Hardened Current Release Path

1. W38 must be a real pilot evidence review, not more design. Use a W24 sandbox response, import it into Trace, and verify Review displays Customer + Proof Item IDs/URLs plus blocked transaction context.
2. W39 must package the exact repeatable pilot runbook: files, deployment parameters, type-to-confirm phrase, before/after evidence, result import, clear-session reset, and stop conditions.
3. W40 is complete: Products CPG is now an approved Customer + Proof Item pilot lane and Review is stabilized around a compact execution-first packet.
4. W41 should add website evidence UX compression: the optional field should stay out of the consultant's way unless IDB confidence is weak.
5. W42 should harden N/LLM website advisory as an importable JSON shape so future model output can improve website evidence without directly calling NetSuite or changing authority.
6. W43 should run five-consultant scenario QA across Food/Beverage, Dealer Hardgoods, Apparel, Products CPG, and one unknown/opaque site.
7. W44 should promote the write pilot from Food/Beverage-only to a decision: either keep it single-lane for go-live or add one second approved lane only after evidence says the SuiteScript mapping is safe.
8. W45 should package Release Candidate V3: drawer file, main create-disabled Suitelet, W24 pilot Suitelet, runbook, feedback rubric, and support triage notes.
9. W46 should be the go/no-go gate for actual consultant execution with five users.

## W27-W31 Immediate Push

### W27: Visual Pilot Website Package Rubric

Objective: fold the Trek/new-website pilot finding into visual QA and website-first package naming.
Goal: Five consultants can score Plan, Review, ROI / Competitive, Run, Trace, reset, and write readiness while Trek/new bicycle sites produce Dealer Hardgoods package names instead of generic Finished Good fallback.
Roles: Consultant UX Director Agent, Website Intelligence Agent, Validation And Evidence Agent.
No regression: main drawer and main Suitelet stay create-disabled; N/LLM advisory only; Redwood tokens remain intact.

### W28: Website Package Classifier V2

Objective: extract package, product seed, product family, demand moment, confidence, and anti-leak tags from website/domain/category evidence.
Goal: unknown or newer websites produce better record names before N/LLM is needed.
Roles: Website Intelligence Agent, N/LLM Advisory Architect Agent, Code Review Sentinel Agent.
No regression: no lane expansion, no proof-anchor changes, no DCC toggle changes.
Status: complete. The classifier now runs known domain, website category, conversation-note cue, industry fallback, then N/LLM advisory enrichment. Conversation notes drive value/story after package selection rather than owning package identity first.

### W29: N/LLM Record Naming Advisory Contract

Objective: define when N/LLM should improve record names and what it must return.
Goal: local resolver stays deterministic, while medium/low-confidence sites can ask for advisory product/package naming without write authority.
Roles: N/LLM Advisory Architect Agent, Packet Contract Agent, Validation And Evidence Agent.
No regression: N/LLM cannot approve creation, invoke SuiteScript, or change lane/proof/toggles.

### W30: Pilot Write Result UX

Objective: show W24 sandbox Customer plus Proof Item write results in a compact, consultant-readable card.
Goal: created/updated record IDs, URLs, operations, blocked dependents, and recovery actions are easy to verify without long repeated gate text.
Roles: SuiteScript Write Agent, Consultant UX Director Agent, Validation And Evidence Agent.
No regression: result UI only; main package remains create-disabled.

### W31: Transaction Context Pilot Gate

Objective: prepare the next governed Sales Order context write only after Customer and Proof Item result IDs/URLs are stable.
Goal: move toward full execution while preserving parent-result dependency, rollback evidence, and type-to-confirm controls.
Roles: SuiteScript Write Agent, Packet Contract Agent, Release Conductor Agent.
No regression: no transaction write in main; no dependent write without parent IDs/URLs.

## Assigned Roles

- Release Conductor Agent: owns sequencing, stop/go gates, context closure, and block handoffs.
- Consultant UX Director Agent: owns Redwood visual polish, guided storytelling, first-viewport hierarchy, language clarity, and five-consultant usability.
- Code Review Sentinel Agent: reviews current code before each block, flags risky coupling, duplicated logic, stale contracts, and better implementation choices.
- N/LLM Advisory Architect Agent: owns prompt contracts for website classification, product naming, ROI audit, competitive framing, exception coaching, and write preview enrichment.
- Website Intelligence Agent: owns website-first lane selection, website product naming, confidence scoring, and fallback rules.
- Story And Value Agent: owns customer pain mapping, top three moves, value agenda, ROI reasoning, competitive proof, and objection handling.
- SuiteScript Write Agent: owns the controlled SuiteScript write branch, record create/update code, lookup/idempotency, rollback labels, and result contracts.
- Packet Contract Agent: owns reviewed packet schema, write request schema, field mapping, dependency rules, and trace payload shape.
- Validation And Evidence Agent: owns validator coverage, local harness, sandbox smoke evidence, trace samples, and release reports.
- Pilot Enablement Agent: owns the five-consultant pilot script, intake checklist, demo runbook, feedback rubric, and adoption notes.
- Release Packaging Agent: owns repo hygiene, README, transfer checklist, version marker, and final release handoff.

## Non-Regression Rules

- Main package keeps `CREATE_ENABLED = false` until an explicit governed pilot branch says otherwise.
- No automatic live writes from the drawer.
- No production writes in this release window.
- No transaction write until parent customer and proof result IDs and URLs exist.
- No lane, proof-anchor, DCC toggle, or packet-order regression.
- No unsupported lane writes.
- No hidden writes, silent retry, silent deletion, or untraceable partial failure.
- N/LLM remains advisory only. It cannot approve creation, invoke SuiteScript, change lanes, change proof anchors, or modify toggles.
- Competitive claims remain workflow-based unless verified sources or user-provided facts are present.
- Active session persists across NetSuite tabs during the demo session and can be cleared with visible Clear all / Clear session controls.

## 48 Hour Block Plan

### W1: Release Baseline And Context Lock

Objective: Freeze the current safe baseline and create a restart-safe release context.
Goal: Future work can pick up without losing state or accidentally enabling writes.
Roles: Release Conductor Agent, Validation And Evidence Agent, Code Review Sentinel Agent.
Prompt: Review the current drawer, contracts, SuiteScript scaffold, reports, and validator. Produce a baseline note with current status, blockers, allowed changes, and forbidden changes. Do not enable writes.
Outputs: baseline report, validator pass, exact next branch target.
Validation: `npm run preflight`.

### W2: UX/UI Guided Flow Audit

Objective: Identify the remaining noise in Plan, Review, ROI / Competitive, Run, and Trace.
Goal: Make the first path obvious for a consultant with a new SC request.
Roles: Consultant UX Director Agent, Pilot Enablement Agent.
Prompt: Audit the current drawer as a consultant entering a new prospect. Recommend and implement only UI changes that reduce decisions, clarify next action, and make storytelling easier. Preserve all gates.
Outputs: UX findings report, interaction hierarchy, first-viewport acceptance checklist.
Validation: validator plus visual review notes.

### W3: Code Review Sentinel Pass

Objective: Review current code health before the next write work.
Goal: Find duplication, weak resolver logic, brittle state handling, and risky write-path assumptions.
Roles: Code Review Sentinel Agent, Packet Contract Agent.
Prompt: Review `idb-drawer.user.js`, SuiteScript scaffold, validator, and data contracts. List surgical recommendations and implement only low-risk structural cleanup needed for the next blocks.
Outputs: code review report, targeted cleanup if safe.
Validation: `npm run preflight`.

### W4: Website-First Intelligence V4

Objective: Harden website-first lane selection and naming.
Goal: Vans routes Apparel, Milk-Bone routes Products CPG, Gordon and Smith routes Dealer Hardgoods, and weak websites ask for review instead of guessing.
Roles: Website Intelligence Agent, N/LLM Advisory Architect Agent.
Prompt: Upgrade website scoring so website evidence outranks generic notes, conversation notes shape story after lane selection, and fallback labels are explicit. Separate website score, notes score, and fallback score so a long note cannot accidentally overpower a strong website. Add confidence reasons and "needs context" states.
Outputs: resolver contract V4, known-case tests, UI evidence copy.
Validation: validator cases for known brands and ambiguous sites.

### W5: One-Action Intake And Run IDB

Objective: Simplify the intake flow.
Goal: Consultant enters customer/prospect, website, notes, optional SC context, then clicks Run IDB. IDB picks lane, freezes the accepted lane/product seed/packet identity for the session, builds packet, and moves to Review.
Roles: Consultant UX Director Agent, Website Intelligence Agent.
Prompt: Redesign Plan intake around one primary Run IDB action. Lane selector remains available as manual override but is not the default path. Preserve session and trace events.
Outputs: streamlined intake UI, trace event updates, manual override guard.
Validation: local preview and validator.

### W6: Review Packet V4 Direct Record Preview

Objective: Replace redundant technical rows with direct create/update statements.
Goal: Every row answers: record type, proposed name, key fields, dependency, confidence, what consultant verifies, and the stable packet ID that will follow the SuiteScript handoff.
Roles: Packet Contract Agent, Consultant UX Director Agent.
Prompt: Compress Review into grouped records and transactions with direct "will create/update" language. Hide adapter details behind expansion. Show fallback only when evidence is weak.
Outputs: Review V4 UI and contract.
Validation: known prospect packets show direct names, not generic entity/memo clutter.

### W7: ROI / Competitive Value Workspace V4

Objective: Make ROI and competitive more useful and auditable.
Goal: Consultants can value-sell in one tab without hunting for the reason why.
Roles: Story And Value Agent, N/LLM Advisory Architect Agent.
Prompt: Build ROI / Competitive V4 with Why now, ROI thesis, audit basis, NetSuite proof stack, competitive contrast, objection handling, and discovery questions. Keep claims safe and source-labeled.
Outputs: value workspace UI, ROI audit schema, competitive prompt contract.
Validation: no unsupported competitor claims, no measured savings without baseline.

### W8: Run Coach V4 Guided Storytelling

Objective: Make Run more influential during the live demo.
Goal: The drawer guides open, prove, handle objection, and close value using website, notes, current page, and selected record.
Roles: Story And Value Agent, Consultant UX Director Agent.
Prompt: Upgrade Run to provide a concise presenter script, top three moves, exception handling, and value-close cue based on the prospect and lane. Keep it compact during live use.
Outputs: Run Coach V4 UI and trace payload.
Validation: Run output changes meaningfully by prospect notes and current page.

### W9: Review Tab Compression And Execution-First Flow

Objective: Rebuild Review as a short decision surface instead of a long technical scroll.
Goal: Consultant sees what will happen, why it matters, and how to proceed to Run within the first working viewport.
Roles: Consultant UX Director Agent, Packet Contract Agent, Code Review Sentinel Agent.
Prompt: Move Execution Plan Preview before the record listing. Replace Create Readiness repetition with one compact readiness strip. Show record impact as a short "what may happen" summary, then collapse the full record list behind groups and details. Keep adapter details available only on demand. Do not enable writes.
Outputs: Review compression implementation, first-viewport checklist, no-regression report.
Validation: Gordon and Smith Review opens with execution summary before record rows; create remains disabled.

### W10: Collapsible Story Bar And Persistent Mini Summary

Objective: Reduce the persistent Story Bar footprint without losing orientation.
Goal: Consultant can collapse the Story Bar, keep a mini prospect/lane/proof strip visible, and regain vertical room on Review, ROI / Competitive, Run, and Trace.
Roles: Consultant UX Director Agent, Session State Engineer Agent, Validation And Evidence Agent.
Prompt: Add Story Bar collapsed and expanded states. Persist the preference during the active demo session. The collapsed state must still show prospect, lane, proof, draft status, and Clear all. Keep the expanded detail one click away.
Outputs: collapsible Story Bar UX, session preference handling, trace-neutral state behavior.
Validation: collapse state survives tab navigation during session and Clear session resets it cleanly.

### W11: ROI / Competitive Summary-First Workspace

Objective: Make ROI / Competitive readable live.
Goal: Top of the tab shows "Most important ROI" and "Most important competitive win" in two concise cards, with audit basis and detail expandable below.
Roles: Story And Value Agent, N/LLM Advisory Architect Agent, Consultant UX Director Agent.
Prompt: Convert ROI / Competitive into summary-first content. Keep the excellent detail but collapse the long blocks under Why this ROI, Proof stack, Competitive detail, Objections, and Discovery. ROI is the lead; competitive is second. Claims remain workflow-based unless verified source facts are supplied.
Outputs: summary-first ROI / Competitive layout, expandable audit details, prompt guidance for future N/LLM enrichment.
Validation: first viewport communicates ROI and competitive win without reading long blocks.

### W12: Run Tab Live-Control-First Coach

Objective: Reorder Run around live demo behavior.
Goal: Consultant sees live controls first, then Top 3 moves, then presenter script, then optional exception/detail blocks.
Roles: Story And Value Agent, Consultant UX Director Agent, Pilot Enablement Agent.
Prompt: Put Open, Prove, Handle objection, and Close value controls at the top of Run. Show the selected control's one-line instruction and the Top 3 path immediately below. Move verbose presenter script and exception detail into expandable sections.
Outputs: live-control-first Run layout, compact top-three story card, reduced-scroll presenter script.
Validation: consultant can run a Customer Record move without scrolling past long copy.

### W13: UX Scenario QA And Five-Consultant Pilot Readiness

Objective: Validate the go-live consultant experience before shifting back to writes.
Goal: Gordon and Smith, Vans, Milk-Bone, a weak website, and a weak-notes case all produce a usable first-screen flow across Plan, Review, ROI / Competitive, Run, and Trace.
Roles: Pilot Enablement Agent, Consultant UX Director Agent, Validation And Evidence Agent, Code Review Sentinel Agent.
Prompt: Run scenario QA for the known prospects and one ambiguous case. Capture first-viewport findings, scroll-depth risks, confusing labels, and pilot-training notes. Implement only surgical UI fixes that reduce live-demo friction.
Outputs: pilot readiness report, scenario checklist, high-confidence UX fixes.
Validation: no overlap, no excessive default text, clear next action on every tab.

### W14: Write Branch Isolation And Runtime Flag Strategy

Objective: Create a controlled implementation lane for writes after UX compression is stable.
Goal: Main remains create-disabled while a pilot branch can implement direct SuiteScript writes behind explicit flags.
Roles: Release Conductor Agent, SuiteScript Write Agent, Validation And Evidence Agent.
Prompt: Define the pilot branch, write flags, runtime parameter strategy, environment restrictions, role permissions, and rollback plan. Do not enable main writes. Transaction context remains post-parent-result gated.
Outputs: branch plan, feature flag map, stop/go checklist.
Validation: branch plan references main create-disabled boundary and parent-result transaction gate.

### W15: Customer Write Pilot

Objective: Implement the first sandbox write path for Customer only.
Goal: Create or update customer using lookup-first idempotency and return record ID/URL.
Roles: SuiteScript Write Agent, Packet Contract Agent.
Prompt: Implement SuiteScript customer create/update in the pilot branch with lookup-before-write, idempotency key, field mapping, and trace result contract. Keep proof item and transaction writes blocked until customer result is stable.
Outputs: customer write code, harness scenarios, trace result sample.
Validation: local harness plus sandbox smoke plan.

### W16: Proof Item Write Pilot

Objective: Implement proof item write after customer is stable.
Goal: Create or update the lane proof item using reviewed packet data and return record ID/URL.
Roles: SuiteScript Write Agent, Website Intelligence Agent, Packet Contract Agent.
Prompt: Implement proof item create/update for approved pilot lane(s). Use website-derived product naming, DCC toggles, and reviewed fields. Block if customer result is missing.
Outputs: proof item write code and dependency guard.
Validation: harness rejects missing parent customer result.

### W17: Confirmation, Result, And Partial-Failure UX

Objective: Make write confirmation and write results safe, obvious, and recoverable.
Goal: Consultant sees exact write list, environment, type-to-confirm phrase, created/updated IDs and URLs, blocked dependents, recoverable errors, and exportable evidence.
Roles: Consultant UX Director Agent, SuiteScript Write Agent, Packet Contract Agent, Validation And Evidence Agent.
Prompt: Build the confirmation UX contract and result states for success, blocked, partial_failed, and failed. Main drawer remains disabled unless pilot gates pass. No silent retry, hidden write, or silent deletion.
Outputs: confirmation UI, result UI, trace result contract, recovery report.
Validation: create button disabled unless every pilot gate passes; partial failure scenarios show IDs/URLs and blocked dependents.

### W18: Five-Consultant Controlled Pilot Go / No-Go

Objective: Package the five-consultant controlled pilot and final release handoff.
Goal: The team knows what is ready, what remains create-disabled, what is pilot-only, and what evidence is required before broader release.
Roles: Pilot Enablement Agent, Release Packaging Agent, Release Conductor Agent, Validation And Evidence Agent.
Prompt: Assemble pilot runbook, quick start, scenario cards, feedback rubric, final go/no-go evidence, known risks, and exact next prompt. Keep transaction context pilot gated until Customer and Proof Item IDs/URLs are stable.
Outputs: pilot pack, RC V3 docs, package manifest, transfer checklist, final release handoff.
Validation: `npm run preflight`, all reports exist, write status clearly marked, Transaction context remains post-parent-result gated.

### W18A: Plan First-Viewport Action Bias

Objective: Make Plan open on guided intake, not recap.
Goal: Consultant sees Customer, Website, Conversation Notes, and Run IDB before reading the full Story Bar.
Roles: Consultant UX Director Agent, Session State Engineer Agent, Validation And Evidence Agent.
Prompt: Make the Story Bar tab-aware. On Plan, collapse the Story Bar by default after setup context exists, render a compact one-line summary, and preserve manual collapse/expand state. Do not change Review, Run, ROI / Competitive, or Trace content order unless needed for consistency.
Outputs: Plan-first viewport update, tab-aware Story Bar behavior, feedback evidence.
Validation: Plan first viewport shows Guided Intake above expanded Story Bar detail; Review still shows execution-first packet context; no create behavior changes.

### W18B: Pilot Feedback Rubric

Objective: Turn feedback into a five-consultant pilot checklist.
Goal: Capture whether consultants can set up a new prospect, run IDB, review records, value sell, and reset without confusion.
Roles: Pilot Enablement Agent, Release Conductor Agent, Consultant UX Director Agent.
Prompt: Add a pilot rubric for first viewport, story clarity, lane confidence, write-readiness clarity, reset behavior, and live-demo usefulness.
Outputs: pilot feedback rubric and screenshot checklist.
Validation: rubric includes Plan, Review, ROI / Competitive, Run, Trace, reset, and write-readiness clarity.

### W18C: Adaptive NetSuite Workspace Fit

Objective: Let NetSuite and IDB operate side by side when the drawer is expanded.
Goal: Expanded IDB reserves right-side space and the NetSuite working page auto-fits to the remaining left-side browser width.
Roles: Browser Layout Engineer Agent, Consultant UX Director Agent, NetSuite Compatibility Sentinel Agent, Validation And Evidence Agent.
Prompt: Add adaptive layout behavior that applies a reversible right-side workspace offset while IDB is open. Prefer CSS variables and body/root padding over brittle page-specific DOM edits. Preserve fixed NetSuite headers where possible, avoid horizontal clipping, and restore the original layout when the drawer closes. Include a fallback that leaves overlay mode intact if the page resists resizing.
Outputs: adaptive layout behavior, compatibility fallback, visual-test checklist.
Validation: open/close IDB on Home, Sales Order View, Customer Record, and item/inventory pages; confirm left-side content remains visible, no permanent body mutation occurs, and drawer width stays stable.

### W18D: Guided Story Polish Before Write Pilot

Objective: Polish the consultant path before actual write execution.
Goal: The consultant can move from intake to review to value to run without reading redundant blocks.
Roles: Consultant UX Director Agent, Storytelling Agent, ROI / Competitive Agent, Code Review Sentinel Agent.
Prompt: Compress repeated story text, keep the best sentence at the top of each tab, move secondary proof into expanders, and make every tab answer one live-demo question: what do I enter, what will IDB prepare, why does it matter, what do I say, or what evidence do I export?
Outputs: guided-story polish pass, redundancy reduction report, screenshot checklist.
Validation: first viewport on each tab has a clear primary action and no repeated full Story Bar unless expanded.

### W19: Governed Write Execution Pilot Branch

Objective: Move from create-disabled scaffolding to a controlled sandbox write branch.
Goal: Enable Customer and Proof Item writes only in a separate governed pilot branch with runtime flags, type-to-confirm, trace result capture, and rollback evidence.
Roles: SuiteScript Write Agent, Release Conductor Agent, Validation And Evidence Agent, NetSuite Compatibility Sentinel Agent.
Prompt: Create the pilot branch implementation path from the W15 Customer and W16 Proof Item scaffolds. Do not enable writes in the main Tampermonkey drawer. Require sandbox runtime flags, consultant confirmation, type-to-confirm phrase, reviewed packet, Customer result before Proof Item, and trace capture. Transaction context remains blocked until parent results are stable.
Outputs: write-enabled pilot branch plan, sandbox smoke procedure, trace-result evidence contract.
Validation: local harness, sandbox smoke with CREATE_ENABLED deliberately controlled in the branch only, trace result includes record IDs and URLs, and failure returns blocked or partial_failed without silent retry/deletion.

### W20: Transaction Context Execution Design

Objective: Prepare transaction context writes after Customer and Proof Item results are stable.
Goal: Sales Order View or equivalent transaction context can be created/updated only after parent records exist and are traceable.
Roles: SuiteScript Write Agent, Packet Contract Agent, Transaction Context Agent, Validation And Evidence Agent.
Prompt: Extend the write branch design for transaction context. Use parent Customer and Proof Item IDs, idempotency lookup, existing DCC transaction intent, and trace result requirements. Keep this blocked in main until W19 passes.
Outputs: transaction context execution contract, dependency harness tests, trace result fields.
Validation: harness rejects missing parent IDs, duplicate lookup blocks, trace result contract includes parentCustomerRecordId and parentProofRecordId.

### W21: Five-Consultant Executable Pilot Pack

Objective: Package the first executable pilot for a small consultant group.
Goal: Five consultants can install, run, validate, export evidence, and report feedback without ambiguity.
Roles: Pilot Enablement Agent, Release Packaging Agent, Consultant UX Director Agent, Support Triage Agent.
Prompt: Assemble install steps, scenario cards, expected screenshots, failure handling, reset guidance, write-enabled branch boundary, and feedback rubric. Make clear what is safe in main, what is pilot-branch only, and what evidence is required before broader release.
Outputs: executable pilot pack, scenario cards, install guide, go/no-go checklist.
Validation: pilot pack includes exact files, exact upload path, exact test scenarios, rollback/clear-session instructions, and go/no-go checklist.

## Immediate Next Prompt

Prompt W38: Pilot Result Evidence Review

Objective: prove the governed Customer + Proof Item write architecture with sandbox evidence, not additional theory.

Roles: SuiteScript Result Import Agent, Pilot Operations Agent, Release Conductor Agent, Packet Contract Agent, Support Triage Agent, Validation And Evidence Agent.

Boundaries:
- Do not enable main drawer writes.
- Do not enable main Suitelet writes.
- Do not write Sales Order / transaction context.
- Do not add new lanes or proof anchors.
- Do not let N/LLM invoke SuiteScript or approve creation.
- Use the W24 pilot Suitelet branch only if sandbox flags and type-to-confirm gates are explicitly configured.

Outputs:
- One W24 sandbox Customer + Proof Item response captured as evidence.
- Imported pilot result trace sample.
- Review/Trace display proof that Customer and Proof Item IDs/URLs are visible.
- Transaction context marked review-ready or blocked based only on parent result IDs/URLs.
- Updated pilot evidence report and stop/go recommendation.
- `npm run preflight` evidence.

### W29: N/LLM Record Naming Advisory Contract

Objective: Make website-grounded N/LLM naming assistance explicit and exportable without giving it write or lane authority.
Goal: Any future advisory model can propose sharper Customer, transaction, Proof Item, and supporting-proof names based on website/category evidence while conversation notes shape story, ROI, competitive, and run coaching.
Roles: N/LLM Record Naming Advisor, Website Evidence Sentinel, Packet Contract Agent, No-Regression Sentinel.
Prompt: Build the exported `recordNamingAdvisoryRequest` contract, tighten product naming prompt V2, extend the N/LLM enrichment and website product naming contracts, and validate that advisory output cannot create records, invoke SuiteScript, change lanes, change proof anchors, change DCC toggles, reorder the packet, or hide create blockers.
Outputs: `data/w29_nllm_record_naming_advisory_contract.json`, `reports/w29_nllm_record_naming_advisory_contract.md`, export payload contract, validation coverage.
Validation: `npm run preflight` must prove advisory schema, export field, prompt contract inputs/forbidden rules, website source-basis requirements, and main create-disabled boundaries.

### W30-W32: Advisory Visibility, Sandbox Handoff, And Pilot Evidence

Objective: Bridge website/N/LLM naming into the governed write pilot without making the drawer noisy or unsafe.
Goal: Review shows compact naming source and confidence; SuiteScript review packets include Customer + Proof Item handoff; pilot evidence readiness is visible and exported before any write attempt.
Roles: N/LLM Record Naming Advisor, SuiteScript Write Agent, Packet Contract Agent, Consultant UX Director Agent, Validation And Evidence Agent, No-Regression Sentinel.
Prompt: Add naming advisory visibility to Review, generate a governed sandbox handoff for Customer + Proof Item only, and expose evidence readiness gates with trace export fields. Keep transaction context blocked, keep all non-approved lanes review-only for writing, and keep main drawer/main Suitelet create-disabled.
Outputs: `data/w30_advisory_naming_visibility_review.json`, `data/w31_advisory_named_sandbox_write_handoff.json`, `data/w32_pilot_evidence_readiness_ux.json`, `reports/w30_w32_advisory_write_readiness.md`, validator coverage.
Validation: `npm run preflight` must prove naming advisory visibility, customer/proof-only handoff, SuiteScript review-packet handoff fields, pilot evidence readiness UX, and main create-disabled boundaries.

### W33: Pilot Result Import And Transaction Context Readiness

Objective: Prepare the UI to consume a real sandbox Customer + Proof Item response.
Goal: If a future sandbox write returns IDs/URLs, the drawer can display the result, mark transaction context readiness, and keep recovery evidence visible without claiming broad production readiness.
Roles: SuiteScript Write Agent, Pilot Evidence Agent, Transaction Context Agent, Support Triage Agent.
Prompt: Add a result-display contract for Customer and Proof Item IDs/URLs, blocked dependents, recoverable errors, and transaction-context readiness. Do not enable transaction context writing yet.
Outputs: result import contract, trace sample expectation, Review/Trace result state UX.
Validation: result cards render success/blocked/partial_failed states and transaction context stays blocked unless both parent result IDs and URLs exist.

### W33 Corrective: Plan Flow And Website Confidence

Objective: Fold pilot feedback into the release before result import continues.
Goal: Plan is action-first, unknown websites do not auto-commit from notes, YETI/outdoor hardgoods routes correctly, Review navigation works, and Plan actions feel lighter.
Roles: Consultant UX Director Agent, Website Evidence Sentinel, Code Review Sentinel, Performance Sentinel, Validation And Evidence Agent.
Prompt: Move Live Question before Guided Intake, add a website-unknown review gate, add YETI website-first hardgoods routing, fix accepted-packet runtime error, reduce Plan click trace payloads, and validate no creation behavior changed.
Outputs: `data/w33_plan_flow_result_readiness_corrective.json`, `reports/w33_plan_flow_result_readiness_corrective.md`, validator coverage.
Validation: preflight proves Plan order, unknown website review gate, YETI routing, accepted-packet bug removal, product CPG food-term scoping, and lightweight Plan traces.

### W34: Pilot Result Import And Transaction Context Readiness

Objective: Continue the original W33 write-readiness intent after the corrective pass.
Goal: Consume a real sandbox Customer + Proof Item response and show whether transaction context is ready without enabling transaction writes.
Roles: SuiteScript Write Agent, Pilot Evidence Agent, Transaction Context Agent, Support Triage Agent.
Prompt: Add a result-display contract for Customer and Proof Item IDs/URLs, blocked dependents, recoverable errors, and transaction-context readiness. Do not enable transaction context writing yet.
Outputs: result import contract, trace sample expectation, Review/Trace result state UX.
Validation: result cards render success/blocked/partial_failed states and transaction context stays blocked unless both parent result IDs and URLs exist.

### W35: Website Resolver Source Consolidation

Objective: Make website evidence the single source of truth for lane package, product seed, product family, and demand moment before any write expansion.
Goal: A new website should classify from website/domain/category evidence first; conversation notes should shape ROI, competitive framing, objections, and live run coaching.
Roles: Website Intelligence Architect, Context Boundary Sentinel, N/LLM Advisory Agent, Code Review Sentinel.
Prompt: Consolidate known-domain hints, website category classifiers, lane scoring, and product intelligence into a governed resolver shape. Keep N/LLM advisory-only and do not add write authority.
Outputs: consolidated website resolver contract, userscript resolver refactor plan, no-regression checks for YETI, Trek, Vans, Gordon and Smith, Milk-Bone, and unknown websites.
Validation: executable resolver checks prove website-owned product naming before notes; no lane/proof/toggle/write changes.
Status: COMPLETE / CREATE STILL DISABLED. W35 introduced `governedWebsiteResolver`, removed the duplicate website product pattern table from product intelligence, and added documented YETI contract coverage.

### W36: Executable Website Scenario Harness

Objective: Replace presence-only resolver validation with scenario-output validation.
Goal: Every `website_resolver_expectations.json` case proves expected lane, proof anchor, product seed, product family, and review-gate behavior.
Roles: QA Harness Agent, Website Evidence Sentinel, Validation And Evidence Agent.
Prompt: Build a local resolver harness or validator section that exercises known, unknown, and conflicting-site cases. Include note-conflict tests where notes mention the wrong lane.
Outputs: resolver harness, scenario report, validator coverage.
Validation: harness fails if website-first authority regresses or if notes override high-confidence website classification.
Status: COMPLETE / CREATE STILL DISABLED. W36 added `tools/run_website_resolver_harness.js`, generated a PASS trace/report for executable website scenarios, and fixed resolver precedence so exact official domains outrank generic category patterns while category classifiers beat generic secondary pattern hits.

### W37: Website Evidence Intake + N/LLM Advisory Bridge

Objective: Make unknown and opaque websites stronger without hardcoding every brand.
Goal: Add a governed website evidence input and N/LLM advisory bridge so homepage/category/product evidence can drive lane and package identity while notes drive story, ROI, competitive framing, objections, and live run coaching.
Roles: Website Intelligence Architect, N/LLM Website Evidence Advisor, Context Boundary Sentinel, Validation And Evidence Agent, No-Regression Sentinel.
Prompt: Add optional website evidence intake, include it in the website resolver source before notes, export it in N/LLM advisory requests, and extend the executable website harness with opaque-site cases. Do not enable writes or give N/LLM authority.
Outputs: `data/w37_website_evidence_nllm_advisory_bridge.json`, `reports/w37_website_evidence_nllm_advisory_bridge.md`, website evidence intake field, resolver source bridge, N/LLM advisory bridge, harness coverage.
Validation: `npm run preflight` proves known domains, category-token domains, and opaque websites with supplied evidence route correctly; notes remain story/value/run only; main create-disabled boundaries remain.
Status: COMPLETE / CREATE STILL DISABLED. W37 added `websiteEvidence`, `websiteEvidenceBridge`, N/LLM advisory bridge metadata, and opaque-site website harness cases.

### W38: Pilot Result Evidence Review

Objective: Use the W34 import surface with a real W24 pilot response from an approved NetSuite demo environment.
Goal: Imported Customer and Proof Item IDs/URLs become visible, traceable, and sufficient to mark transaction context ready for review.
Roles: SuiteScript Result Import Agent, Pilot Operations Agent, Support Triage Agent.
Prompt: Run one W24 Customer + Proof Item POST in the approved pilot deployment, import the response, capture screenshots/export, and verify blocked dependents plus recovery text.
Outputs: authenticated pilot evidence report, imported trace sample, consultant test notes.
Validation: Customer/Proof imported, transaction context write still disabled, no Sales Order record created.
Status: LOCAL CONTRACT READY / AWAITING LIVE PILOT RESPONSE / MAIN CREATE STILL DISABLED. W38 added the evidence review contract, representative response shape, and live pivot rules; do not move to W39 as complete until a fresh W24 pilot response is imported and reviewed.

### W38R: Pilot Result Recovery Patch

Objective: Patch the W24 pilot response, environment gate, or drawer import if live evidence does not match the contract.
Goal: Fix approved production demo account gating, Customer result, Proof Item parent dependency, transaction-blocking, rollback labels, recoverable errors, or import UX before pilot packaging.
Roles: SuiteScript Write Agent, SuiteScript Result Import Agent, Support Triage Agent, Validation And Evidence Agent.
Prompt: Review the live W24 response, identify the failing gate, patch only the smallest necessary SuiteScript or drawer import behavior, and rerun harness plus validator.
Status: COMPLETE / APPROVED DEMO ACCOUNT GATE READY / MAIN CREATE STILL DISABLED. W38R now explicitly allowlists `TD3021666` / `YOUR_ACCOUNT_ID.app.netsuite.com` for the W24 Customer + Proof Item pilot while unapproved production environments remain blocked and transaction writes remain disabled.
Outputs: recovery patch report, updated sample/contract if needed, preflight evidence.
Validation: no Sales Order write, no missing Customer parent for Proof Item, no hidden success state, no main create enablement.

### W39: Account Context Resolver

Objective: Resolve required NetSuite account context before any create.
Goal: The W24 pilot blocks cleanly with JSON when subsidiary context is missing, then writes Customer and Proof Item only after the account context is configured.
Roles: Context Architect, SuiteScript Worker, Regression Guard, Validation And Evidence Agent.
Prompt: Add `custscript_idb_default_subsidiary`, `custscript_idb_default_location`, and `custscript_idb_default_taxschedule` to the W24 pilot runtime contract. Require subsidiary before Customer or Proof Item writes. Keep location and tax schedule optional. Return `blocked_missing_account_context` JSON instead of NetSuite HTML 500 when context is missing. Do not touch the main create-disabled Suitelet or enable transaction writes.
Status: COMPLETE / ACCOUNT CONTEXT GATE READY / MAIN CREATE STILL DISABLED. W39 now inherits the proven DCC subsidiary-first creation pattern for Customer and Proof Item writes.
Outputs: account context resolver contract, updated W24 pilot Suitelet, harness coverage, evidence report.
Validation: missing subsidiary blocks before writes; configured subsidiary allows the existing Customer + Proof Item harness path; Sales Order / transaction context remains disabled.

### W40: DCC Creation Rail Adapter

Objective: Port the proven DCC Customer and Proof Item creation mechanics into the W24 pilot.
Goal: Customer and Proof Item writes are lookup-first, idempotent, subsidiary-aware, external-id-aware, and recoverable when account-specific fields are missing.
Roles: SuiteScript Write Agent, DCC Pattern Historian, Regression Guard, Evidence Agent.
Prompt: Adapt the DCC creation rails for Customer and Proof Item only. Preserve Customer-first then Proof Item-after-Customer sequencing. Add structured recoverable errors for required account fields. Keep Sales Order and transaction context disabled.
Outputs: DCC creation rail adapter, field-default matrix, structured error report.
Validation: no Customer write without account context, no Proof Item write without Customer ID/URL, no transaction write.

### W41: Transaction Context Write Design Gate

Objective: Prepare the next governed transaction-context write without enabling it.
Goal: Sales Order View or equivalent transaction context is ready to design only after Customer and Proof IDs/URLs exist.
Roles: Transaction Context Agent, SuiteScript Write Agent, Packet Contract Agent, Validation And Evidence Agent.
Prompt: Design the separate runtime flag, parent-result dependency check, lookup/idempotency rules, rollback evidence, and partial failure behavior for transaction context.
Outputs: transaction write design contract and blocked harness expectations.
Validation: missing parent IDs block; transaction write stays disabled until a later dedicated pilot block.

### W41: Website Evidence UX Compression

Objective: Keep website evidence powerful without making intake feel heavier.
Goal: The optional website-evidence field appears as help only when resolver confidence is low, unknown, or N/LLM advisory is recommended.
Roles: Consultant UX Director Agent, Website Intelligence Architect, Context Boundary Sentinel.
Prompt: Make website evidence progressive: hide it by default for high-confidence known websites, surface it for weak/opaque sites, and explain in one sentence what to paste. Keep Run IDB as the primary action.
Outputs: compact website evidence UX, low-confidence state copy, trace field for evidence source.
Validation: high-confidence sites do not add intake noise; weak sites show a clear evidence path; `npm run harness:website` still passes.

### W42: N/LLM Website Advisory Import Contract

Objective: Prepare future model assistance without creating a hidden integration.
Goal: IDB can accept advisory website evidence JSON that improves product/category naming but cannot write, change authority, or hide uncertainty.
Roles: N/LLM Website Evidence Advisor, Packet Contract Agent, No-Regression Sentinel, Validation And Evidence Agent.
Prompt: Define and validate an importable advisory payload with category tokens, source basis, product seed suggestion, confidence, and no-regression declaration. Keep it manual/import-only for now.
Outputs: advisory import contract, sample advisory payloads, validator coverage.
Validation: imported advisory can improve website evidence but cannot change write flags, invoke SuiteScript, or skip consultant review.

### W43: Five-Consultant Scenario QA Pass

Objective: Validate the actual pilot day-in-the-life before broadening writes.
Goal: Five consultants can run one prospect from intake to Review to ROI / Competitive to Run to Trace/reset without asking how to proceed.
Roles: Pilot Enablement Agent, Consultant UX Director Agent, Website Intelligence Architect, Validation And Evidence Agent.
Prompt: Run Food/Beverage, Dealer Hardgoods, Apparel, Products CPG, and one opaque unknown-site scenario. Score setup time, first-viewport clarity, lane confidence, record preview usefulness, value story usefulness, write-readiness clarity, and reset behavior.
Outputs: pilot QA report, prioritized UX fix list, no-go findings.
Validation: no scenario loses context; no scenario silently commits low-confidence lane; no create path appears unless explicitly gated.

### W44: Write Pilot Scope Decision

Objective: Decide whether the write pilot remains Food/Beverage-only or expands to one second lane.
Goal: Avoid broad write scope until evidence says the mapping, field behavior, and rollback story are stable.
Roles: Release Conductor Agent, SuiteScript Write Agent, Packet Contract Agent, Support Triage Agent.
Prompt: Review W38-W43 evidence and choose: keep Food/Beverage only, or add exactly one second approved lane with a separate mapping checklist. Do not add transaction writes in the same block.
Outputs: write pilot scope decision, lane eligibility matrix, stop/go recommendation.
Validation: decision cites evidence, not optimism; main package remains create-disabled.

### W45: Release Candidate V3 Packaging

Objective: Package the controlled pilot cleanly enough for five consultants.
Goal: One repo package contains the drawer, main create-disabled Suitelet, W24 pilot Suitelet, runbook, feedback rubric, and evidence checklist.
Roles: Release Packaging Agent, Pilot Enablement Agent, Release Conductor Agent, Validation And Evidence Agent.
Prompt: Build RC V3 packaging docs and exact file checklist. Separate main-safe files from sandbox-pilot-only files. Include install, upload, parameter, type-to-confirm, export, reset, and rollback instructions.
Outputs: RC V3 manifest, package checklist, pilot quick-start, support triage notes.
Validation: no ambiguity about which file goes into Tampermonkey vs File Cabinet vs sandbox pilot deployment.

### W46: Five-Consultant Go / No-Go Gate

Objective: Decide whether the tool is ready for actual consultant execution.
Goal: Give a blunt go/no-go based on harnesses, sandbox evidence, UX clarity, supportability, and write safety.
Roles: Release Conductor Agent, Consultant UX Director Agent, SuiteScript Write Agent, Support Triage Agent, Validation And Evidence Agent.
Prompt: Review all evidence and produce the go/no-go call for five consultants. List remaining known risks, exact allowed actions, blocked actions, and support escalation path.
Outputs: go/no-go report, pilot instructions, next release backlog.
Validation: `npm run preflight` passes, sandbox evidence exists if writes are in scope, and transaction context remains blocked unless separately approved.
