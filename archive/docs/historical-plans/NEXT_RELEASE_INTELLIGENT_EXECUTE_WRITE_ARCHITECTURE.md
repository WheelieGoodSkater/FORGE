# Next Release Intelligent Execute/Write Architecture

Generated: 2026-05-09

Status: planning_ready_create_disabled

## Current State Review

The current drawer is materially stronger than the early version:

- The consultant can enter customer/prospect, website, and conversation notes.
- IDB can recommend a lane and build a reviewed packet.
- Review shows exact planned records and transactions.
- ROI / Competitive is separated into its own tab.
- Run gives a guided story with Open, Prove, Handle objection, and Close value.
- Trace exports the demo evidence and a SuiteScript review packet.
- SuiteScript scaffold validates Creation Packet Contract V2.
- Live creation is still locked, as intended.

The next release needs to become more intelligent before it becomes more powerful. The biggest jump is to make the website the primary classification and naming signal, then use conversation notes to shape the story, ROI, competitive positioning, exceptions, and live run script. Record creation should begin with a small, controlled, explicitly confirmed write path after the packet proves stable.

## Release Objective

Build IDB into a website-first, story-aware, SuiteScript-governed demo builder that can:

1. Read the prospect website signal as the primary lane/family classifier.
2. Use conversation notes as the pain/story/ROI/competitive driver.
3. Generate customer-specific record and transaction previews.
4. Produce a validated SuiteScript review packet with idempotency, lookup, dependencies, rollback labels, and trace requirements.
5. Execute a small controlled write path in sandbox only after explicit consultant confirmation.
6. Preserve a consultant-friendly guided experience throughout Plan, Review, ROI / Competitive, Run, and Trace.

## Assumptions

- Website URL is the highest-authority external signal for lane selection and product naming.
- Conversation notes are the highest-authority internal signal for story, pain, ROI, objections, and competitive framing.
- If website extraction is unavailable, IDB falls back to local domain hints, industry keywords, and conversation notes.
- N/LLM can classify, summarize, enrich names, generate story copy, and explain confidence, but it cannot approve creation or change hard contracts.
- SuiteScript direct-write remains the correct creation path because the earlier Demo Command Center created records through NetSuite-side SuiteScript without a separate connector.
- The first enabled write should be intentionally small: one lane, one sandbox, one explicit confirmation, trace required, rollback ready.

## Non-Regression Contract

- No automatic live writes from the drawer.
- No production writes in this release.
- No hidden SuiteScript submission.
- No write without explicit consultant confirmation.
- No lane/proof-anchor/DCC-toggle/order changes outside an approved block.
- No unsupported industry/module rendering.
- No LLM authority to approve writes, invent competitor facts, or override SuiteScript gates.
- Website-first classification must not weaken Apparel & Accessories, Dealer Hardgoods, Food / Beverage, or Products CPG boundaries.
- Trace must capture classification evidence, N/LLM prompts/responses, packet approval, SuiteScript request, SuiteScript response, record IDs, URLs, and recoverable errors.

## Target Experience

### Plan

The first view should feel simple:

- Prospect/customer
- Website
- Conversation notes
- Optional SC request context collapsed behind "More context"
- Primary action: `Run IDB`

After `Run IDB`, IDB should:

- Inspect website signal first.
- Recommend the lane with confidence and evidence.
- Name the core records using the website/product signal.
- Use notes to frame the value story.
- Move the consultant to Review when the packet is ready.

### Review

Review should answer:

- Customer will be X.
- Transaction will be Y.
- Proof item will be Z.
- Supporting records will be A/B/C.
- These fields are expected to be populated.
- These dependencies must exist first.
- These toggles influenced the packet.
- This is blocked from writing until confirmed.

### ROI / Competitive

ROI / Competitive should be a value-selling cockpit:

- Why this problem matters.
- What business process is affected.
- What metric proxy is being used.
- What assumption is being made.
- What NetSuite proof path demonstrates.
- Where a competitor or point solution usually creates friction.
- What to say if the buyer challenges the claim.

Named competitor claims require supplied context or web-cited source basis. Without that, keep the framing workflow-based and safe.

### Run

Run should guide the live demo moment:

- What to say now.
- What to show on this page.
- What exception to be ready for.
- What decision to land.
- What next move to take.

The script should be driven by conversation notes and current NetSuite page context, not generic lane copy.

### Trace

Trace should become the operational audit trail:

- Classification evidence.
- Website signal summary.
- Conversation-note pain summary.
- N/LLM advisory packets.
- Reviewed create packet.
- SuiteScript review packet.
- SuiteScript result, when enabled in sandbox.
- Clear session controls.

## Architecture

### Client Drawer

Responsibilities:

- Collect consultant inputs.
- Run website-first classification.
- Render lane evidence and confidence.
- Generate local fallback previews.
- Call optional advisory N/LLM enrichment service when available.
- Build reviewed packet and SuiteScript review packet.
- Present create readiness and confirmation gates.
- Export trace and packet.
- Never create records directly.

### Website Intelligence Layer

Responsibilities:

- Normalize domain and URL.
- Match known brand/domain hints.
- Extract available page metadata when allowed.
- Build website evidence:
  - brand category
  - product category
  - channel type
  - manufacturing/distribution/apparel/food/dealer signals
  - product naming seeds
- Return confidence with evidence.

### N/LLM Advisory Layer

Responsibilities:

- Classify lane from website evidence and notes.
- Generate product/item names from website and business signal.
- Summarize pain from conversation notes.
- Generate ROI thesis and audit trail.
- Generate competitive workflow framing.
- Generate Run script.
- Explain confidence and fallback reason.

Forbidden:

- Approve record creation.
- Invoke SuiteScript.
- Change proof anchors.
- Change authorized lane list.
- Claim measured ROI without customer baseline.
- Make sourced competitor claims without source basis.

### Packet Builder

Responsibilities:

- Merge lane contract, website evidence, conversation notes, DCC toggles, and N/LLM enrichment.
- Generate Creation Packet Contract V2.
- Generate SuiteScript review packet.
- Validate:
  - exact record order
  - idempotency keys
  - lookup rules
  - dependencies
  - rollback labels
  - trace requirements
  - write path type

### SuiteScript Write Path

Responsibilities:

- Receive reviewed packet.
- Validate method, JSON, mode, lane, proof, records, contract, confirmation, and environment.
- In create-disabled mode: return blocked/validated evidence only.
- In pilot branch: create/update only the approved pilot scope.
- Return trace result with IDs, URLs, operations, recoverable errors, and partial-failure status.

### Release Control Plane

Responsibilities:

- Keep main package create-disabled.
- Create a pilot branch for controlled sandbox writes.
- Validate with harness before deployment.
- Require rollback and trace evidence before enabling any write.
- Promote only after screenshots, harness, smoke, and user acceptance.

## Agent Roles

### 1. Web Signal Agent

Goal: make website the primary lane and naming signal.

Inputs:

- prospect/customer
- website
- page metadata
- known domain hints
- conversation notes as secondary signal

Outputs:

- recommended lane
- confidence
- evidence chips
- product naming seeds
- fallback reason

### 2. Lane Arbitration Agent

Goal: choose the correct authorized lane without drift.

Inputs:

- Web Signal Agent output
- conversation notes
- lane contract
- website resolver expectations

Outputs:

- selected lane
- runner confidence
- manual override explanation
- no-regression evidence

### 3. Object Naming Agent

Goal: name records and transactions like the prospect’s actual business.

Inputs:

- website product terms
- customer brand
- lane proof anchor
- DCC toggles
- conversation pain

Outputs:

- customer record name
- sales order/demo transaction name
- proof item name
- supporting record names
- fallback names with reasons

### 4. Story Intelligence Agent

Goal: use conversation notes to drive the demo story.

Inputs:

- conversation notes
- SC objective
- current page
- selected lane
- proof anchor

Outputs:

- pain summary
- top three moves
- run script
- exception set
- decision to land

### 5. ROI Audit Agent

Goal: make ROI useful and auditable without invented math.

Inputs:

- pain summary
- industry family
- affected process
- proof path
- optional customer baseline

Outputs:

- ROI thesis
- driver
- metric proxy
- assumption
- confidence
- proof step
- "do not claim measured savings" guard

### 6. Competitive Strategy Agent

Goal: make NetSuite win language industry-specific and safe.

Inputs:

- lane
- website signal
- optional competitor
- conversation objections
- official/source-backed context when web is used

Outputs:

- NetSuite proof path
- competitor-safe contrast
- workflow fragmentation risk
- objection handling
- required source basis

### 7. Packet Contract Agent

Goal: make every reviewed record implementation-ready.

Inputs:

- record preview
- DCC toggles
- SuiteScript write-path contract

Outputs:

- create intent
- idempotency key
- lookup rule
- dependencies
- rollback label
- trace result requirement

### 8. SuiteScript Write Agent

Goal: create/update the controlled pilot records in sandbox only.

Inputs:

- reviewed SuiteScript packet
- explicit consultant confirmation
- sandbox deployment

Outputs:

- created/updated record IDs
- URLs
- operations
- partial-failure status
- recoverable errors
- rollback evidence

### 9. UX Director Agent

Goal: make the consultant flow easy during a live demo.

Inputs:

- screenshots
- first-viewport audit
- consultant friction notes

Outputs:

- reduced noise
- clearer CTAs
- collapsed advanced details
- stronger page hierarchy
- Redwood-aligned color improvements

### 10. Validation And Release Agent

Goal: preserve green preflight and release evidence.

Inputs:

- all changed files
- harness output
- validator output
- screenshots/smoke notes

Outputs:

- validation report
- release checklist
- transfer checklist
- stop/go recommendation

## Next 18 Block Moves

### V1: Website Signal Contract

Objective: define the exact website evidence model that powers lane selection and naming.

Agent roles: Web Signal Agent, Lane Arbitration Agent, Validation And Release Agent.

Deliverables:

- `data/website_signal_contract.json`
- website evidence shape
- resolver confidence scoring rules
- validator coverage for Milk-Bone, Vans, Gordon & Smith, Keebler, Liquid Death

No-regression:

- no new lanes
- no proof-anchor changes
- no write-path changes

### V2: Website-First Resolver Upgrade

Objective: make website signal outrank generic conversation-note terms when selecting lane.

Agent roles: Web Signal Agent, Lane Arbitration Agent.

Deliverables:

- resolver score update
- evidence chips for domain/category/product
- conflict rule: website primary, notes secondary
- fallback reason when website is weak

No-regression:

- Vans must stay Apparel & Accessories.
- Gordon & Smith must stay Dealer Hardgoods & Channel Fulfillment.
- Milk-Bone/Keebler should route Products CPG or Food / Beverage based on product/manufacturing signal.

### V3: Website Product Naming Engine

Objective: use website/product signal to name proof items and transactions.

Status: Complete as website product naming source visibility and packet evidence.

Agent roles: Object Naming Agent, Web Signal Agent.

Deliverables:

- product naming seeds
- proof item naming pattern
- transaction naming pattern
- supporting record naming pattern
- source/fallback labels in Review

No-regression:

- no generic fallback unless website evidence is weak
- no unsupported product categories

### V4: N/LLM Advisory Prompt Contract V2

Objective: define prompt inputs/outputs for classification, naming, ROI, competitive, and run script.

Status: Complete as advisory-only prompt contract V2.

Agent roles: Story Intelligence Agent, ROI Audit Agent, Competitive Strategy Agent, Packet Contract Agent.

Deliverables:

- `data/llm_prompt_contracts_v2.json`
- prompt schemas
- expected JSON outputs
- no-authority clauses
- trace payload requirements

No-regression:

- LLM cannot enable writes.
- LLM cannot change lane contracts.

### V5: Conversation Pain Story Mapper

Objective: use conversation notes to produce pain, objective, objection, and decision criteria.

Status: Complete as structured `conversationPainStoryModel` and `data/conversation_pain_story_contract.json`.

Agent roles: Story Intelligence Agent.

Deliverables:

- pain extractor
- top-three-moves generator
- exception set
- decision-to-land model

No-regression:

- if notes are thin, show confidence low and ask for more context.

### V6: ROI Audit V3

Objective: make ROI more prominent, auditable, and expandable.

Status: Complete as `roiAuditV3Model` with baseline-needed, audit trail, source basis, and no measured savings claim.

Agent roles: ROI Audit Agent, UX Director Agent.

Deliverables:

- ROI headline
- driver
- process affected
- metric proxy
- assumption
- proof step
- confidence
- expanded audit detail

No-regression:

- no measured savings claim without baseline.

### V7: Competitive Intelligence V3

Objective: make competitive framing industry-specific and optional web/source-backed.

Status: Complete as `competitiveIntelligenceV3Model` with source state, verified state, source basis, and competitor-safe contrast.

Agent roles: Competitive Strategy Agent, Web Signal Agent.

Deliverables:

- industry win themes
- competitor-safe contrast
- source basis field
- "verified vs unsupplied" state
- objection copy

No-regression:

- no named competitor factual claims without source basis.

### V8: Review Packet Redesign V3

Objective: make Review a direct implementation checklist, not a wall of text.

Status: Complete as packet readiness summary, direct `Will create/update` rows, grouped core/supporting sections, source badges, and collapsed technical details.

Agent roles: UX Director Agent, Packet Contract Agent.

Deliverables:

- grouped core/supporting sections
- direct "will create/update" rows
- source/fallback badges
- collapsed technical details
- packet readiness summary

No-regression:

- creation remains disabled.

### V9: Run Coach V3

Objective: make Run deeply context-aware from website, notes, and current page.

Status: Complete as `runCoachV3Model` and `data/run_coach_v3_contract.json`.

Agent roles: Story Intelligence Agent, UX Director Agent.

Deliverables:

- current page cue
- website-specific proof phrase
- pain-specific exception
- close-on-value cue
- action trace payload

No-regression:

- no generic lane-only copy when website and notes exist.

### V10: Create Confirmation UX Blueprint

Objective: design the explicit confirmation gate before any write.

Status: Complete as disabled `createConfirmationBlueprint` and `data/create_confirmation_ux_blueprint.json`.

Agent roles: UX Director Agent, SuiteScript Write Agent, Validation And Release Agent.

Deliverables:

- confirmation modal/spec
- record list confirmation
- environment indicator
- type-to-confirm phrase
- disabled state for main package

No-regression:

- no live writes enabled in main.

### V11: SuiteScript Pilot Write Branch Plan

Objective: define the first tiny write-capable branch.

Status: Complete as sandbox-only Food / Beverage branch plan in `data/suitescript_pilot_write_branch_plan.json`; main remains create-disabled.

Agent roles: SuiteScript Write Agent, Packet Contract Agent.

Deliverables:

- branch name
- sandbox-only scope
- first lane
- first records
- CREATE_ENABLED branch guard
- rollback plan

No-regression:

- main stays create-disabled.
- pilot cannot write outside approved lane/sandbox.

### V12: SuiteScript Lookup And Idempotency Implementation

Objective: implement lookup-first behavior before create/update.

Status: Complete as lookup-first write-plan metadata, duplicate idempotency rejection, duplicate lookup rejection, and `data/suitescript_lookup_idempotency_contract.json`.

Agent roles: SuiteScript Write Agent.

Deliverables:

- lookup functions
- idempotency handling
- duplicate detection
- skipped/updated/created statuses

No-regression:

- no duplicate customer/item if lookup matches.

### V13: SuiteScript Small Write Smoke

Objective: create one small controlled sandbox write path.

Status: Complete as create-disabled small-write smoke plan for Food / Beverage Customer Record plus Finished Good in `data/small_write_smoke_contract.json`.

Agent roles: SuiteScript Write Agent, Validation And Release Agent.

Deliverables:

- explicit confirmation required
- customer create/update
- one proof item create/update or link
- trace result
- record URLs

No-regression:

- no transaction creation until customer/proof path is stable.

### V14: Partial Failure And Rollback Evidence

Objective: harden failure behavior before adding more record types.

Status: Complete as SuiteScript `partialFailurePolicy`, per-row `rollbackEvidence`, dependent-write stop metadata, harness coverage, and `data/partial_failure_rollback_contract.json`.

Agent roles: SuiteScript Write Agent, Validation And Release Agent.

Deliverables:

- partial_failed contract
- recoverable error display
- rollback labels
- record ID capture
- stop dependent writes on parent failure

No-regression:

- no silent retry
- no silent deletion

### V15: Transaction Context Write Pilot

Objective: add a controlled sales-order context/write step after customer/proof are stable.

Status: Complete as SuiteScript `transactionContextPilotPlan`, per-row `transactionPilotStatus`, harness coverage, and `data/transaction_context_pilot_contract.json`.

Agent roles: SuiteScript Write Agent, Packet Contract Agent.

Deliverables:

- transaction lookup/creation rule
- customer dependency
- proof item dependency
- trace result

No-regression:

- no transaction write without customer and proof result.

### V16: Consultant UX Smoke And Screenshot QA

Objective: run the full consultant flow across Plan, Review, ROI / Competitive, Run, and Trace.

Agent roles: UX Director Agent, Validation And Release Agent.

Deliverables:

- screenshot set
- first viewport audit
- label cleanup
- CTA hierarchy improvements
- mobile/desktop drawer checks

No-regression:

- no text overflow
- no hidden clear/session controls

### V17: Release Candidate V3 Package

Objective: package the website-first and pilot-write-ready release.

Agent roles: Validation And Release Agent.

Deliverables:

- release manifest V3
- updated README
- updated transfer checklist
- updated release checklist
- preflight report

No-regression:

- main create-disabled unless pilot branch is explicitly selected.

### V18: Controlled Pilot Go/No-Go

Objective: decide whether the small write feature is ready for sandbox pilot use.

Agent roles: all agents.

Deliverables:

- go/no-go report
- pilot demo script
- rollback checklist
- known limitations
- next production-readiness backlog

No-regression:

- no production release without sandbox pilot evidence.

## Recommended Immediate Next Block

Start with V1 and V2 together:

**Prompt V1-V2: Website Signal Contract And Website-First Resolver Upgrade**

Goal: make the website the primary truth source for lane selection and product naming seeds. Update the resolver so the website drives lane/family first, conversation notes drive story second, and the drawer explains confidence clearly. Keep creation disabled and preserve all lane/proof/toggle/order contracts.

Success criteria:

- Milk-Bone resolves from website/product signal instead of generic Products CPG fallback when food/manufacturing evidence is stronger.
- Vans stays Apparel & Accessories.
- Gordon & Smith stays Dealer Hardgoods & Channel Fulfillment.
- Keebler/Liquid Death remain food/beverage-aware.
- Review rows carry website-derived naming seeds.
- `npm run preflight` passes.
