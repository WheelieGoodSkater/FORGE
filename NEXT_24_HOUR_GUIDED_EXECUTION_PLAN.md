# Next 24 Hour Guided Execution Plan

Generated: 2026-05-09

## Objective

Move Intelligent Demo Builder from a strong release candidate into a guided execution cockpit: the consultant enters a new SC request, IDB creates a clean story path, the Review tab shows exactly what will be built, ROI / Competitive stays contained in its own tab, and Run guides the consultant from entry to execution without clutter.

## Current Findings From Latest Run

- The drawer is now usable, but ROI / Competitive appeared on every page through the Story Bar and created repetition.
- The ROI / Competitive tab needed clearer instructions for when and how to use it.
- Run should guide live storytelling without repeating the ROI thesis.
- Review is much stronger now because the packet says what each record will be.
- Apparel & Accessories is routing correctly and should remain guarded from industrial fallback.

## No Regression Guardrails

- Seven authorized lanes only.
- Apparel & Accessories cannot fall into Industrial Equipment Manufacturing.
- No proof-anchor changes.
- No automatic lane switching.
- No live NetSuite writes until a governed creation/write path and explicit consultant confirmation exist.
- The creation/write path may be the same SuiteScript direct-write model used by the prior Demo Command Center; it does not require an external connector.
- ROI / Competitive content stays inside the ROI / Competitive tab except for a navigation button.
- Story Bar stays compact: customer, lane, proof, next move, state, and clear control.
- Run stays execution-focused: open, prove, handle objection, close next step.
- Competitor copy remains workflow-based unless verified facts are supplied.
- Trace export must preserve setup, direct build packet, value review, run actions, and adapter bridge evidence.

## Roles

### Release Captain

Goal: Keep the next 24 hours focused on release quality and acceptance gates.

Responsibilities:

- Sequence blocks.
- Protect no-regression rules.
- Decide stop/go after NetSuite visual smoke.

### UX Story Lead

Goal: Make the drawer feel like a guided consultant cockpit, not a document.

Responsibilities:

- Keep each tab purpose-specific.
- Remove duplicate value copy outside ROI / Competitive.
- Keep first viewport scannable.
- Shape the guided journey from Plan to Trace.

### LLM Orchestration Architect

Goal: Define where LLM adds value without taking over authority.

Responsibilities:

- Generate customer-aware product names.
- Draft value and competitive talk tracks.
- Suggest objections and discovery questions.
- Produce execution plan previews.
- Never override lane contract, proof anchor, or creation guard.

### NetSuite Functional Architect

Goal: Keep the build packet aligned with what will eventually be created.

Responsibilities:

- Maintain record/transaction intent.
- Preserve DCC toggle behavior.
- Guard creation/write-path readiness.
- Preserve the previous SuiteScript direct-write record creation model as the preferred production path once the gates are met.

### Competitive And ROI Strategist

Goal: Make ROI / Competitive useful to sales without overclaiming.

Responsibilities:

- Keep competitive framing safe.
- Tie ROI to stated pain and decision criteria.
- Give consultants concise language for value selling.

### Validation Engineer

Goal: Turn every architecture decision into a validator rule or smoke step.

Responsibilities:

- Maintain `npm run preflight`.
- Add evidence reports.
- Keep release checklist current.

## Blocks

### Block G1: ROI / Competitive Containment

Goal: Keep ROI / Competitive content only in its dedicated tab.

Outputs:

- Story Bar has no ROI or competitive cards.
- Run has no repeated ROI thesis.
- ROI / Competitive tab explains when to use it.

LLM injection:

- Draft tab-specific ROI and competitive talk tracks from customer, website, notes, objective, competitor, and decision criteria.

Acceptance:

- Consultant can scan Plan, Review, Run, and Trace without seeing repeated ROI/competitive copy.

### Block G2: Guided Story From Intake To Execution

Goal: Make the path feel like a guided demo flow.

Outputs:

- Plan captures context.
- Review shows build list.
- ROI / Competitive supports value selling.
- Run gives live execution moves.
- Trace exports evidence.

LLM injection:

- Generate the next best story step based on current tab, selected move, page context, and notes.

Acceptance:

- Consultant always knows what to do next.

### Block G3: Execution Plan Preview

Goal: Add a plain-language execution plan before any creation/write path can create records.

Outputs:

- "What IDB will prepare" summary.
- "What consultant should verify" checklist.
- "What the governed write path would create later" locked preview.

LLM injection:

- Convert direct build packet into a concise execution plan.

Acceptance:

- No hidden create path.
- Every record has a clear purpose and dependency.

### Block G4: LLM Boundaries And Prompt Contracts

Goal: Define prompt contracts for productized LLM behavior.

Outputs:

- Lane selection prompt contract.
- Product naming prompt contract.
- ROI / Competitive prompt contract.
- Run coach prompt contract.
- Execution plan preview prompt contract.
- Creation/write-path preview prompt contract.
- SuiteScript direct-write authority note: IDB can use the prior SuiteScript-style record creation path later, but the LLM cannot activate it, authorize it, or bypass consultant confirmation.

LLM injection:

- All LLM outputs must include source basis, confidence, fallback, and no-regression declaration.

Acceptance:

- LLM can enrich but cannot authorize creation, invoke the SuiteScript direct-write path, or change lane authority.
- Prompt contracts are documented in `LLM_PROMPT_CONTRACTS.md` and `data/llm_prompt_contracts.json`.

### Block G5: NetSuite Visual Smoke And Pilot Notes

Goal: Validate the release candidate in real NetSuite.

Outputs:

- Food / Beverage smoke notes.
- Apparel smoke notes.
- Trace export review.
- Clear all and login/logout reset review.

Acceptance:

- Controlled pilot can proceed.

Status:

- Local smoke packet is ready.
- Live authenticated NetSuite smoke must be completed by the consultant in the account before claiming production go.
- Evidence is documented in `reports/g5_netsuite_visual_smoke_pilot_notes.md`.

### Block G6: SuiteScript Direct Write Path Mapping

Goal: Turn the reviewed packet into a SuiteScript direct-write skeleton that matches the prior Demo Command Center record creation model without enabling live writes yet.

Outputs:

- SuiteScript direct-write path contract.
- Record creation sequence mapped from the dry-run packet.
- Gate list for reviewed packet, enabled write path, consultant confirmation, and trace result.
- Failure and rollback expectations.

LLM injection:

- LLM may suggest record names, field assumptions, and value copy before write-path execution.
- LLM may not invoke SuiteScript, authorize creation, or modify the write-path gates.

Acceptance:

- Creation remains disabled in the drawer.
- Future SuiteScript direct-write implementation has a clear request and response shape.
- The path preserves DCC V4 toggles, lane proof anchors, and object sequence.

### Block G7: SuiteScript Write-Path Implementation Blueprint

Goal: Turn the G6 create-disabled skeleton into an implementation-ready blueprint for the NetSuite-side SuiteScript path.

Outputs:

- SuiteScript entry point shape.
- Record-type mapping by lane and role.
- Field mapping from reviewed packet to NetSuite records.
- Create/update rules.
- Error and partial-failure handling.
- Trace result contract with record IDs, URLs, and recoverable errors.

LLM injection:

- LLM remains advisory for names, field assumptions, ROI/competitive language, and execution summaries.
- LLM cannot invoke SuiteScript, authorize creation, alter gates, or change packet order.

Acceptance:

- Blueprint is documented in `SUITESCRIPT_WRITE_PATH_IMPLEMENTATION_BLUEPRINT.md`.
- Contract is represented in `data/suitescript_write_path_contract.json`.
- Evidence is documented in `reports/g7_suitescript_write_path_blueprint.md`.
- Creation remains disabled in the drawer.

### Block G8: Create-Ready Review UX

Goal: Make the Review tab clearly explain creation readiness without enabling creation.

Outputs:

- Create-readiness model in the userscript.
- Gate checklist for packet reviewed, SuiteScript write path, consultant confirmation, and traceable result.
- Future SuiteScript create preview that shows what would be written later.
- Disabled create button preserved.

LLM injection:

- LLM may enrich the preview names and execution summary before review.
- LLM cannot mark gates ready, enable create, or remove blockers.

Acceptance:

- Review tab shows the future create path and missing gates plainly.
- Create remains disabled.
- Consultant can continue to Run without interpreting create as available.

### Block G9: SuiteScript Write Path Implementation Package

Goal: Package the G7 blueprint into a concrete create-disabled NetSuite-side Suitelet scaffold.

Outputs:

- SuiteScript scaffold at `netsuite/suitescript/idb_suitescript_write_path_suitelet.js`.
- Package runbook at `SUITESCRIPT_WRITE_PATH_PACKAGE.md`.
- Validation for POST, JSON body, write path type, consultant confirmation, packet mode, lane, and records.
- Dry write-plan mapping by lane and role.
- Create disabled by default.

LLM injection:

- LLM may continue to enrich the reviewed packet before it reaches SuiteScript.
- LLM cannot call the Suitelet, flip `CREATE_ENABLED`, or authorize creation.

Acceptance:

- SuiteScript package exists and is create-disabled.
- The drawer still does not write records.
- Validator enforces package and create-disabled state.

### Block G10: One-Lane Food / Beverage Controlled Create Pilot Plan

Goal: Define the first controlled create pilot before any write enablement.

Outputs:

- Food / Beverage pilot plan.
- Pilot contract JSON.
- Exact record scope.
- Required gates.
- Stop conditions.
- Rollback/recovery runbook.

LLM injection:

- LLM may enrich Food / Beverage names and value context before packet review.
- LLM cannot approve pilot execution, enable writes, or expand the pilot to other lanes.

Acceptance:

- Pilot is Food / Beverage only.
- `CREATE_ENABLED` remains false.
- Pilot cannot proceed without trace, confirmation, and rollback readiness.

### Block G11: Controlled Enablement Checklist

Goal: Define the go/no-go checklist before any future branch can enable SuiteScript writes.

Outputs:

- Controlled enablement checklist.
- Checklist contract JSON.
- Required harness scenarios.
- Stop conditions for accidental enablement.

LLM injection:

- LLM may summarize checklist status.
- LLM cannot approve enablement or flip create state.

Acceptance:

- `CREATE_ENABLED` remains false.
- First pilot remains Food / Beverage only.
- Enablement is blocked without smoke, reviewed packet, harness pass, rollback runbook, confirmation UX, trace capture, and pilot branch.

### Block G12: SuiteScript Harness Dry Run

Goal: Prove the Suitelet scaffold gates locally without NetSuite writes.

Outputs:

- Local Node harness for the Suitelet scaffold.
- PASS report for non-POST, missing confirmation, unauthorized lane, and valid Food / Beverage create-disabled packet.
- Trace sample for harness results.

LLM injection:

- None in harness execution.

Acceptance:

- Harness passes.
- Valid Food / Beverage packet returns `validated` with `createEnabled: false`.
- Invalid gates return `blocked`.
- No NetSuite calls or record writes occur.

### Block G13: Controlled One-Lane Enablement Branch Plan

Goal: Define the future pilot branch boundary before any write enablement.

Outputs:

- Controlled branch plan.
- Branch contract JSON.
- Allowed pilot branch changes.
- Forbidden pilot branch changes.
- Branch go and exit criteria.

LLM injection:

- LLM may summarize branch readiness.
- LLM cannot approve branch creation, enable writes, or expand the pilot.

Acceptance:

- Main package remains create-disabled.
- Pilot branch is Food / Beverage only.
- Drawer remains non-writing.
- Rollback owner and trace verification are required before pilot execution.

### Block G14: Sandbox Deployment Packet For Create-Disabled Suitelet

Goal: Prepare the create-disabled Suitelet for sandbox connectivity and gate smoke without enabling record creation.

Outputs:

- Sandbox deployment packet.
- Sandbox-only JSON contract.
- Expected smoke responses for non-POST, missing confirmation, unauthorized lane, and reviewed Food / Beverage packet.
- Stop conditions and rollback steps.

LLM injection:

- None in deployment execution.
- LLM may summarize captured evidence after smoke, but cannot approve writes, enable creation, alter lanes, or invoke SuiteScript.

Acceptance:

- `CREATE_ENABLED` remains false.
- Deployment target is NetSuite sandbox only.
- No records are created.
- Valid reviewed Food / Beverage payload returns `validated` with `createEnabled: false`.
- Blocked cases remain blocked.
- Trace response is captured for the next evidence block.

## Context Closure

If the next session starts cold, resume from:

- Package folder: `/path/to/workspace/intelligent demo builder drawer`
- Install file: `idb-drawer.user.js`
- Current gate: sandbox smoke evidence capture for the create-disabled Suitelet.
- Current validator: `npm run preflight`
- Current target: guided execution cockpit with ROI / Competitive contained to its tab.

## Next Recommended Move

Run Block G15 next. G1-G14 are complete at the architecture/package layer: ROI / Competitive is contained to its tab, the drawer has a guided step from Plan through Trace, Review includes execution and create-readiness previews, LLM prompt contracts preserve SuiteScript direct-write boundaries, the NetSuite pilot smoke packet is ready, the governed SuiteScript direct-write path has an implementation-ready blueprint, a create-disabled Suitelet package exists, the first Food / Beverage controlled create pilot is scoped, the Suitelet harness passes locally, the future pilot branch boundary is defined without enabling writes, and the sandbox deployment packet is ready for create-disabled Suitelet smoke.
