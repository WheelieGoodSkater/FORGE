# Next 48 Hour UX And Execution Release Plan

Generated: 2026-05-09

## Release Objective

Turn Intelligent Demo Builder from a strong guided drawer into a consultant-ready demo cockpit. A consultant should be able to enter a new SC request, customer, website, and notes, then immediately receive a lane recommendation, differentiated NetSuite story, auditable ROI logic, competitive industry framing, object/transaction preview, live run coaching, exception handling, and a governed path toward creating the exact NetSuite records and transactions.

The release target is a product-space ERP demo companion: order-to-cash, inventory, manufacturing, fulfillment, replenishment, landed cost, item readiness, and financial impact should connect as one story inside NetSuite.

## Current State Review

### What Is Working

- Drawer navigation is understandable: Plan, Review, ROI / Competitive, Run, Trace.
- Story Bar gives the consultant a persistent anchor across tabs.
- Review packet now names the planned records and transactions with customer-specific language.
- Run tab gives live actions and keeps the consultant oriented.
- Trace and clear session controls are present.
- SuiteScript write path is scaffolded but remains create-disabled.

### What Is Not Yet Good Enough

- Intake still feels like a form. The consultant enters context, then has to save, inspect, and manually confirm the proposed lane.
- The first "next action" is too generic for a rich SC request. It should become a guided "Start here" agenda with the top proof, why, and what to open.
- Competitive language is too generic. It must be industry-specific, workflow-based, and grounded in why NetSuite wins as a unified ERP for products companies.
- ROI is not auditable enough. The drawer needs a compact value claim plus an expandable "why this ROI" trail with inputs, assumptions, affected process, and confidence.
- Review still shows too much repeated metadata. Consultants need direct creation intent: "Customer will be X", "Finished good will be Y", "Sales order will be Z", "Work order/BOM/lot trace will be included because..."
- Run controls should adapt to the entered pains and the selected proof path.
- Creation is still future-state. The next two days need to carry the design to a controlled record/transaction creation path while preserving create-disabled mainline gates until pilot enablement.

## Competitive And ROI Source Basis

Use these source-grounded themes in the ROI / Competitive engine:

- NetSuite positions cloud ERP as a unified business suite with financials, CRM, ecommerce, HCM, PSA, order fulfillment, inventory, billing, invoicing, and analytics tied together in one system.
- NetSuite manufacturing positioning emphasizes a single integrated cloud solution connected to financial reports, inventory management, and outstanding orders in real time.
- NetSuite order management positioning emphasizes transparent, automated order fulfillment, customer experience, revenue, profit, cross-channel interaction, and lower integration/maintenance effort.
- NetSuite item and manufacturing records support product-space proof patterns such as inventory items, lot numbered items, work orders, BOMs, preferred stock levels, reorder points, demand, lead time, standard cost, variance, WIP, and multi-location inventory.
- Apparel proof should use matrix-item and variant language. Food / Beverage proof should use lot, expiration, ingredient, packaging, replenishment, quality, and landed-cost language.

## No Regression Rules

- Seven authorized lanes only.
- No proof-anchor changes.
- Apparel & Accessories cannot collapse into Industrial Equipment.
- No automatic live writes from the drawer.
- No LLM authority over lane contract, proof anchor, record creation, SuiteScript execution, or confirmation gates.
- ROI and competitive claims must be auditable or clearly marked as advisory.
- Competitive copy must stay workflow-based unless verified competitor facts are supplied.
- Main package keeps `CREATE_ENABLED = false` until a governed pilot branch is explicitly created.
- Record creation path remains the prior Demo Command Center-style SuiteScript direct-write model, not an external connector dependency.
- Every UX change must preserve Trace export, Clear all, active session sharing across tabs, and login/logout boundary reset.

## Agents, Tools, And Sentinels

### Release Captain Agent

Goal: keep the two-day release moving from UX overhaul to governed execution readiness.

Tools: plan docs, validator, preflight, release reports.

Sentinels:

- Stop if a block enables live writes in main.
- Stop if a lane/proof contract changes without explicit approval.
- Stop if ROI/competitive language becomes ungrounded.

### Consultant UX Director Agent

Goal: make IDB feel like a cockpit, not a long form.

Tools: drawer UI, preview HTML, screenshot review, Redwood theme review.

Responsibilities:

- Replace form-first setup with guided intake.
- Make proposed lane acceptance one obvious action.
- Make every tab answer "what do I do now?"
- Keep the first viewport useful on laptop-height NetSuite screens.

### SC Intake Intelligence Agent

Goal: convert a raw SC request into a demo brief.

Tools: LLM prompt contract, customer website signal, conversation notes, selected lane contract.

Responsibilities:

- Extract customer, website, industry, pains, objective, known competitor, decision criteria, likely products, likely operating model.
- Suggest lane and proof anchor with evidence.
- Produce fallback naming when website/context is thin.

### Industry Competitive Strategist Agent

Goal: make the ROI / Competitive tab industry-specific and useful for value selling.

Tools: source-grounded NetSuite competitive library, industry lane contract, web-grounded source snippets, optional competitor input.

Responsibilities:

- Create "Why NetSuite wins here" per lane.
- Contrast workflow outcomes, not unverifiable competitor claims.
- Generate objection handling that keeps NetSuite positioned as the unified ERP.

### ROI Audit Agent

Goal: make value claims concise in the main UI and expandable when challenged.

Tools: ROI assumption model, affected process map, confidence scoring.

Responsibilities:

- Build ROI cards with claim, driver, process impact, metric proxy, assumption, and proof step.
- Show only the crisp value line by default.
- Expand into "why this ROI" when the consultant wants the audit trail.

### Build Packet Architect Agent

Goal: turn the demo brief into direct records and transactions.

Tools: DCC object path, toggles, record mapping, SuiteScript write-path contract.

Responsibilities:

- Generate direct statements:
  - Customer will be created or updated as X.
  - Finished good/item will be X.
  - Sales order or order context will be X.
  - Manufacturing/BOM/WIP/lot/matrix support will be included when toggled.
- Keep dependencies and blockers visible but secondary.

### SuiteScript Write Path Engineer Agent

Goal: advance from create-disabled scaffold to controlled pilot implementation.

Tools: SuiteScript scaffold, harness, sandbox packet, write-path blueprint.

Responsibilities:

- Implement create/update functions behind `CREATE_ENABLED`.
- Preserve main create-disabled state until pilot branch.
- Return record IDs, URLs, partial failures, and rollback evidence.

### Validation And Evidence Agent

Goal: convert every block into proof.

Tools: `npm run preflight`, SuiteScript harness, reports, trace samples.

Responsibilities:

- Add validator rules per block.
- Keep evidence reports updated.
- Ensure screenshots and trace samples show the consultant journey.

## Two-Day Block Plan

### Day 1: UX Overhaul And Guided Storytelling

#### U1: Guided Intake Wizard

Objective: remove the save/edit/proposed-lane friction.

Build:

- Replace passive Setup Builder with a 3-step guided intake:
  1. Identify account.
  2. Capture objective and pains.
  3. Accept recommended lane and proof.
- Auto-run lane recommendation when customer, website, or notes change.
- Show "Recommended because..." with the top 3 evidence chips.
- Add one primary action: `Use this lane and build packet`.

Acceptance:

- Consultant enters Keebler + website + notes and gets an immediate Food / Beverage recommendation.
- No manual "Change lane" interaction is needed unless the consultant disagrees.
- Trace logs `lane_recommended`, `lane_accepted`, and evidence basis.

#### U2: Story-First First Viewport

Objective: make the first screen tell the consultant what story to run.

Build:

- Story Bar becomes:
  - Customer.
  - Winning industry lane.
  - Proof anchor.
  - First move.
  - Value hook.
- Move secondary state chips under a compact status row.
- Keep `Clear all` visible but less visually dominant.

Acceptance:

- First viewport answers: who, what industry, what proof, why it matters, what to do next.

#### U2.5: Run IDB Intake Resolver

Objective: make the normal consultant flow one action after intake: enter prospect, website, and notes, then run IDB to resolve the industry family and build the packet.

Build:

- Rename the primary intake action to `Run IDB`.
- Hide the manual lane wall unless the consultant explicitly clicks `Change lane manually`.
- Add resolver weighting so durable goods, hardgoods, wholesale fulfillment, surfboards, skateboards, and Gordon & Smith-style product signals route to Dealer Hardgoods & Channel Fulfillment instead of generic Industrial Distribution.
- Keep manual override available but secondary.

Acceptance:

- Consultant opens IDB, enters prospect, website, and conversation notes, then clicks `Run IDB`.
- IDB resolves the family, applies the lane, selects the first move, builds the packet, and moves to Review.
- Gordon and Smith-style durable/surf/skate hardgoods context resolves to Dealer Hardgoods & Channel Fulfillment unless the user manually overrides.
- The lane wall is not visible in the normal intake path.

#### U2.6: Website-First Family Resolver

Objective: make the website the strongest practical signal for obvious prospect families before generic operational notes can overrule the lane.

Build:

- Add a website-first hint layer for known and pattern-based sites.
- Use domain and website content cues before generic terms like inventory, fulfillment, replenishment, or availability.
- Route Vans-style footwear, apparel, skateboarding, style, size, color, and accessories signals to Apparel & Accessories.
- Route Gordon & Smith-style surf/skate hardgoods and wholesale/dealer signals to Dealer Hardgoods & Channel Fulfillment.
- Preserve manual override and trace evidence.

Acceptance:

- `www.vans.com` resolves to Apparel & Accessories.
- `gordonandsmith.com` resolves to Dealer Hardgoods & Channel Fulfillment.
- Generic inventory/fulfillment words do not overpower clear website identity.
- Branch/warehouse/transfer language can still route to Industrial Distribution when the website and notes actually support it.

#### U3: Review Packet Simplification

Objective: turn Review into a direct "what will be built" list.

Build:

- Replace redundant field-pill blocks with direct record rows:
  - Customer: `Keebler`
  - Finished good: `Keebler Cookie Variety Pack`
  - Sales order: `Keebler Promotion Shelf Readiness Demo Order`
  - Ingredient / packaging structure: `Keebler Packaged Snacks Readiness Structure`
  - Production setup: `Keebler Packaged Snacks Production Setup`
- Add "Details" expansion for fields, dependencies, confidence, and blockers.
- Add toggle impact inline: New item, MFG, WIP.

Acceptance:

- A consultant can read the Review tab in under 20 seconds and explain what IDB intends to create.

#### U4: ROI Audit Model

Objective: make ROI both simple and defensible.

Build:

- ROI card default:
  - `Value claim`
  - `Business driver`
  - `Proof step`
- Expandable audit trail:
  - Input evidence from notes.
  - Industry assumption.
  - Affected process.
  - Metric proxy.
  - Confidence.
  - "Do not claim as measured savings unless the customer confirms baseline."

Acceptance:

- ROI is crisp in live demo mode and auditable when challenged.

#### U5: Industry Competitive Review Engine

Objective: make Competitive industry-specific and useful.

Build:

- Per-lane "Why NetSuite wins" library.
- Food / Beverage themes:
  - Finished good readiness.
  - Lot/ingredient/packaging trace.
  - Inventory, order, production, quality, and finance in one path.
  - Promotion and replenishment risk.
- Apparel themes:
  - Matrix item, style, size, color, allocation, sell-through, channel availability.
- Products CPG themes:
  - Order-to-cash, inventory visibility, fulfillment, margin, and demand responsiveness.
- No named competitor claims unless competitor is entered and source is available.

Acceptance:

- ROI / Competitive tab reads like a value-selling aide, not generic marketing.

#### U6: Live Run Coach 2.0

Objective: make Run influential and pain-aware.

Build:

- Generate live run script from:
  - Customer pain.
  - Proof anchor.
  - Current NetSuite page.
  - ROI driver.
  - Known objection.
- Replace generic Open/Prove/Handle/Close text with:
  - "Open with this buyer pain."
  - "Show this NetSuite record."
  - "Pressure-test this exception."
  - "Close on financial impact."
- Add exception prompts:
  - "What if location is constrained?"
  - "What if ingredient lot is short?"
  - "What if landed cost changes margin?"
  - "What if demand spikes before promotion?"

Acceptance:

- Run tab gives a consultant something they can say out loud during the demo.

### Day 2: Record Creation Path And Production Readiness

#### U7: Creation Packet Contract V2

Objective: make the reviewed packet ready for SuiteScript writes.

Build:

- Add explicit `createIntent` per row:
  - create customer.
  - create/update item.
  - create sales order or demo order context.
  - create BOM/structure.
  - create work order or production setup when toggled.
  - create trace/result record.
- Add `idempotencyKey`.
- Add `existingRecordLookup` rules.
- Add `rollbackLabel`.

Acceptance:

- Every reviewed row maps to a SuiteScript action or a clear no-create preview.

#### U8: SuiteScript Create Pilot Branch

Objective: implement guarded Food / Beverage creation behind the existing write path.

Build:

- Create pilot branch only.
- Keep main package create-disabled.
- Implement create/update functions for Food / Beverage pilot:
  - Customer.
  - Inventory or lot-numbered item / assembly item depending toggles.
  - Sales order context.
  - Supporting custom record(s) for proof path if native record cannot be safely created.
  - Optional work order/BOM/WIP only when toggled and required fields are available.
- Return record IDs and URLs.
- Keep partial-failure handling.

Acceptance:

- Local harness proves create-disabled main and pilot-enabled branch separately.
- No non-Food / Beverage creation.

#### U9: Sandbox Smoke Evidence

Objective: prove create-disabled Suitelet gates in sandbox before any create pilot.

Build:

- Deploy current create-disabled Suitelet to sandbox.
- Capture GET blocked, missing confirmation blocked, unauthorized lane blocked, valid Food / Beverage validated/create-disabled.
- Add evidence report.

Acceptance:

- No records created.
- Trace response captured.
- Deployment can be disabled cleanly.

#### U10: Controlled Create Smoke

Objective: create a controlled Food / Beverage demo packet in sandbox only.

Build:

- Use one reviewed packet.
- Require explicit consultant/admin confirmation.
- Create records with IDB prefix or scoped naming.
- Return record IDs and URLs.
- Export trace.

Acceptance:

- Objects are created exactly once.
- Records are findable from returned URLs.
- Partial failure is recoverable.
- No other lanes are enabled.

#### U11: Productized UX QA Loop

Objective: run a continuous UX review while execution hardens.

Build:

- Screenshot review for Plan, Review, ROI / Competitive, Run, Trace.
- First viewport audit.
- Keyboard and click-path audit.
- "Consultant in a hurry" audit.
- "Buyer objection mid-demo" audit.
- "Fresh login" reset audit.
- "Multiple NetSuite tabs" continuity audit.

Acceptance:

- The drawer feels like a guided command center, not a document panel.

#### U12: Release Candidate V2

Objective: produce the next release package.

Build:

- Updated `idb-drawer.user.js`.
- Updated SuiteScript scaffold and pilot branch plan.
- Updated prompt contracts.
- Updated validator.
- Updated demo scripts:
  - Keebler Food / Beverage.
  - Vans Apparel.
  - Generic Products CPG.
- Updated repo transfer checklist.

Acceptance:

- `npm run preflight` passes.
- Visual smoke passes.
- Sandbox smoke evidence exists.
- Create path is ready for controlled pilot.

## LLM Injection Points

### Strong Uses

- Lane recommendation from customer website, notes, and SC request.
- Customer-specific product naming.
- Industry-specific ROI thesis.
- Workflow-based competitive framing.
- Objection and discovery question generation.
- Run coaching script.
- Exception scenario generation.
- Summary and handoff trace.

### Forbidden Uses

- Enabling record creation.
- Invoking SuiteScript.
- Changing proof anchors.
- Expanding authorized lanes.
- Claiming measured ROI without customer baseline.
- Making named competitor claims without sources or supplied context.

## Target UX Shape

### Plan

Purpose: intake and lane acceptance.

First action: `Use this lane and build packet`.

### Review

Purpose: confirm exactly what IDB will prepare or create.

First action: `Approve packet for run`.

### ROI / Competitive

Purpose: value sell and answer "why NetSuite".

First action: `Use value talk track`.

### Run

Purpose: guide the live demo.

First action: current best move based on page and story.

### Trace

Purpose: export evidence, clear/reset, and support handoff.

First action: `Export trace`.

## Proposed Prompt Blocks

### U1 Prompt: Guided Intake Wizard

Move the Plan tab from form-first to guided setup. Auto-generate lane recommendation while typing, show evidence chips, and provide one primary action to accept lane and build the packet. Do not change lane contracts, proof anchors, toggles, or write gates.

### U2 Prompt: Story-First First Viewport

Compress the first viewport around the customer, winning lane, proof anchor, first move, and value hook. Keep Clear all available but reduce visual dominance. Preserve trace and active session behavior.

### U3 Prompt: Review Packet Directness

Rewrite Review rows into direct "will be" build statements with details collapsed. Keep field mapping available inside details. Preserve create-disabled state.

### U4 Prompt: ROI Audit Trail

Add an auditable ROI model: claim, driver, affected process, metric proxy, assumption, confidence, and proof step. Keep default view concise and expanded detail optional.

### U5 Prompt: Industry Competitive Engine

Create per-lane NetSuite winning language grounded in official product-space ERP themes. Keep named competitor claims out unless user supplies competitor context and source basis.

### U6 Prompt: Pain-Aware Run Coach

Make Run actions generate customer-specific words the consultant can say live, including exceptions and close-on-value language.

### U7 Prompt: Creation Packet Contract V2

Upgrade the review packet into a create-ready contract with create intent, idempotency, lookup rules, dependencies, rollback labels, and trace result requirements.

### U8 Prompt: Food / Beverage Pilot Write Branch

Implement guarded Food / Beverage SuiteScript creation on a pilot branch only. Keep main create-disabled. Return IDs, URLs, partial failures, and trace evidence.

### U9 Prompt: Sandbox Smoke Evidence

Capture create-disabled sandbox Suitelet evidence before pilot writes.

### U10 Prompt: Controlled Create Smoke

Run one sandbox Food / Beverage create smoke with explicit confirmation, rollback readiness, and trace export.

### U11 Prompt: Productized UX QA Loop

Run screenshots and first-viewport audits across all tabs and fix rough edges.

### U12 Prompt: SuiteScript Create Contract Alignment

Require Creation Packet Contract V2 at the SuiteScript scaffold boundary, return create-disabled write-plan evidence with idempotency and rollback fields, and reject reviewed packets that are not implementation-ready. Do not enable live writes.

Status: Complete as create-disabled server alignment.

### U13 Prompt: Packet Handoff UX

Show a concise SuiteScript packet handoff state in Create readiness, expose an export action for the reviewed packet, and keep consultant confirmation false until a governed run-time confirmation gate exists.

Status: Complete as create-disabled packet handoff.

### U14 Prompt: Release Candidate V2

Package the next release candidate with docs, validator, demo scripts, packet handoff evidence, release manifest, and repo transfer updates.

Status: Complete as Release Candidate V2 manifest.

## Definition Of Done

- Consultant can enter a new SC request and be guided to the right lane without manual friction.
- Review shows exact records and transactions in direct language.
- ROI is value-selling ready and auditable.
- Competitive framing is industry-specific and source-grounded.
- Run tab tells the consultant what to say, what to show, what exception to handle, and how to close.
- Trace preserves evidence across tabs and resets cleanly after logout or Clear all.
- SuiteScript path can create the scoped pilot records in sandbox only after explicit confirmation.
- Main package remains create-disabled until the controlled pilot branch is approved.
- `npm run preflight` passes.
