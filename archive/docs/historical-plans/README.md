# Intelligent Demo Builder Drawer

The Intelligent Demo Builder is a Tampermonkey right-side drawer for NetSuite. It carries the hardened V5 proof model with the consultant during the demo so they can capture customer context, confirm the lane, inspect the proof path, redirect the story, and export a lightweight trace.

## Files

- `idb-drawer.user.js` - install this in Tampermonkey.
- `data/v5_lane_contracts.json` - portable authorized-lane V5 contract.
- `data/functional_setup_contract.json` - draft-only object setup contract for future record creation.
- `data/creation_adapter_contract.json` - spec-only creation adapter contract; no live writes enabled.
- `data/nllm_enrichment_contract.json` - review-only N/LLM enrichment contract.
- `data/adapter_bridge_contract.json` - dry-run-to-create bridge contract; create remains blocked.
- `data/llm_prompt_contracts.json` - G4 prompt contracts for lane selection, naming, ROI/competitive, run coaching, execution preview, and creation write-path preview.
- `data/suitescript_write_path_contract.json` - G6 create-disabled SuiteScript direct-write path contract.
- `data/food_beverage_controlled_create_pilot.json` - G10 one-lane Food / Beverage controlled create pilot contract.
- `data/controlled_enablement_checklist.json` - G11 controlled enablement checklist contract.
- `data/controlled_enablement_branch_plan.json` - G13 controlled one-lane enablement branch contract.
- `data/sandbox_deployment_packet.json` - G14 sandbox-only deployment contract for the create-disabled Suitelet.
- `data/creation_packet_contract_v2.json` - U7 reviewed packet create-intent contract for the future SuiteScript write path.
- `data/website_signal_contract.json` - V1 website-first signal authority and product naming contract.
- `data/website_product_naming_contract.json` - V3 product naming evidence contract for website-derived names and N/LLM fallback.
- `data/website_resolver_expectations.json` - U8 website-first resolver expectations for common prospect cases.
- `data/llm_prompt_contracts_v2.json` - V4 N/LLM advisory prompt contracts for website, naming, story, ROI, competitive, and write-path preview.
- `data/conversation_pain_story_contract.json` - V5 conversation-note story mapper contract.
- `data/roi_competitive_v3_contract.json` - V6-V7 auditable ROI and competitive framing contract.
- `data/review_packet_redesign_v3_contract.json` - V8 direct Review packet checklist contract.
- `data/run_coach_v3_contract.json` - V9 website/notes/page-aware Run Coach contract.
- `data/create_confirmation_ux_blueprint.json` - V10 disabled create confirmation UX blueprint.
- `data/suitescript_pilot_write_branch_plan.json` - V11 sandbox-only pilot write branch plan.
- `data/suitescript_lookup_idempotency_contract.json` - V12 lookup-first and idempotency contract for the SuiteScript path.
- `data/small_write_smoke_contract.json` - V13 small sandbox write smoke contract for customer plus proof item.
- `data/partial_failure_rollback_contract.json` - V14 partial-failure and rollback evidence contract.
- `data/transaction_context_pilot_contract.json` - V15 transaction context pilot contract for Sales Order View after customer/proof stability.
- `preview/local_preview.html` - local visual preview.
- `tools/validate_drawer_project.js` - local project validator.
- `ARCHITECTURE_AND_PROMPT_CHAIN.md` - architecture, roles, prompt chain, and non-regression rules.
- `FUNCTIONAL_SETUP_ARCHITECTURE.md` - staged plan for setup planning, object review, creation adapters, and demo run packets.
- `CREATION_ADAPTER_SPEC.md` - adapter gates, request/response shape, and no-regression rules.
- `UX_STREAMLINING_PLAN.md` - blocking UX plan for compact consultant workflow before the next feature layer.
- `MONDAY_LIVE_RELEASE_PLAN.md` - release plan from current state through Monday live use and conceptual full release.
- `FULL_RELEASE_ARCHITECTURE.md` - conceptual release ladder after Monday controlled live use.
- `ACTIVE_SESSION_AND_OBJECT_GENERATION_PLAN.md` - active demo session, clear-session UX, and prospect-based object naming plan.
- `VISUAL_VALUE_AND_ENRICHED_PREVIEW_ARCHITECTURE.md` - next architecture block for Redwood color, ROI/competitive framing, and enriched object previews.
- `PRODUCTIZED_CREATION_AND_CONSULTANT_UX_ARCHITECTURE.md` - deep productized architecture for creation, toggles, apparel lane, ROI/competitive prominence, and consultant UX.
- `NEXT_24_HOUR_PRODUCTIZED_RELEASE_PLAN.md` - next 24-hour release skeleton for session reset, direct build packet, ROI/competitive review, run coaching, UI polish, SC intake, and production readiness.
- `NEXT_24_HOUR_GUIDED_EXECUTION_PLAN.md` - next architecture plan for ROI/competitive containment, guided story flow, LLM injection, and execution planning.
- `NEXT_48_HOUR_UX_EXECUTION_RELEASE_PLAN.md` - next two-day release plan for UX overhaul, guided intake, industry competitive/ROI, run coaching, and governed creation.
- `NEXT_RELEASE_INTELLIGENT_EXECUTE_WRITE_ARCHITECTURE.md` - next-release architecture for website-first intelligence, N/LLM advisory enrichment, and controlled SuiteScript execute/write progression.
- `NEXT_48_HOUR_WRITE_AND_FULL_RELEASE_PLAN.md` - W1-W18 plan for UX-led five-consultant pilot readiness, controlled SuiteScript write progression, and full-release handoff.
- `LLM_PROMPT_CONTRACTS.md` - productized LLM boundaries, prompt contracts, and SuiteScript direct-write authority rules.
- `SUITESCRIPT_DIRECT_WRITE_PATH_PLAN.md` - SuiteScript direct-write creation skeleton that preserves the prior DCC record-writing model.
- `SUITESCRIPT_WRITE_PATH_IMPLEMENTATION_BLUEPRINT.md` - G7 implementation-ready SuiteScript entry point, record mapping, field mapping, create/update, error, and trace blueprint.
- `SUITESCRIPT_WRITE_PATH_PACKAGE.md` - G9 create-disabled SuiteScript implementation package runbook.
- `FOOD_BEVERAGE_CONTROLLED_CREATE_PILOT_PLAN.md` - G10 one-lane Food / Beverage pilot gates, stop conditions, and rollback runbook.
- `CONTROLLED_ENABLEMENT_CHECKLIST.md` - G11 go/no-go checklist before any future write enablement.
- `CONTROLLED_ENABLEMENT_BRANCH_PLAN.md` - G13 controlled pilot branch plan and boundaries.
- `SANDBOX_DEPLOYMENT_PACKET.md` - G14 sandbox deployment packet for create-disabled Suitelet smoke.
- `netsuite/suitescript/idb_suitescript_write_path_suitelet.js` - create-disabled Suitelet scaffold for the future NetSuite-side write path.
- `tools/run_suitescript_write_path_harness.js` - G12 local Suitelet harness with mocked NetSuite modules.
- `RELEASE_CANDIDATE_CHECKLIST.md` - controlled pilot stop/go checklist for NetSuite visual smoke.
- `reports/six_lane_parity_report.md` - generated six-lane parity evidence.
- `reports/consultant_acceptance_run.md` - generated consultant acceptance checklist and stop/go notes.
- `reports/georgetown_foods_trace_review.md` - trace review for the first customer-intake lane-selection run.
- `reports/georgetown_foods_dry_run_object_packet.md` - dry-run object packet for Georgetown Foods.
- `reports/redwood_ux_tightening_notes.md` - M1 UX tightening evidence and remaining M2 notes.
- `reports/review_run_story_hardening.md` - M2 Review/Run hardening evidence.
- `reports/creation_execution_guard.md` - M3 creation guard evidence.
- `reports/monday_live_acceptance_checklist.md` - M4 Monday acceptance checklist.
- `reports/current_run_findings_next_steps.md` - latest run findings, session-state decision, and value-lens next steps.
- `reports/nllm_enrichment_contract.md` - M10 enrichment contract evidence.
- `reports/adapter_bridge_plan.md` - M11 adapter bridge evidence.
- `reports/visual_value_enriched_preview_implementation.md` - M12-M16 implementation evidence for color, value, previews, bridge guard, and release-candidate validation.
- `reports/p3_p4_product_preview_value_story.md` - P3-P4 evidence for product-specific preview intelligence and above-the-fold value story.
- `reports/p5_review_packet_productization.md` - P5 evidence for review packet build order, record types, fields, dependencies, toggle impact, and blockers.
- `reports/p8_consultant_ux_redesign.md` - P8 evidence for Story Bar, Setup Builder, Build Packet, Live Run, and Create Readiness cockpit layout.
- `reports/h1_h2_session_reset_direct_build_packet.md` - H1-H2 evidence for visible Clear all, auth-boundary reset, and direct `will be` build packet rows.
- `reports/h3_h4_value_run_coach.md` - H3-H4 evidence for dedicated ROI / Competitive Review and customer-aware live run coaching.
- `reports/h5_h6_interaction_sc_intake.md` - H5-H6 evidence for progress rail, stronger interaction states, and optional SC request intake.
- `reports/h7_production_readiness_pass.md` - H7 evidence for release-candidate packaging and production readiness gates.
- `reports/h8_release_candidate_demo_script.md` - H8 consultant pilot script for Food / Beverage, Apparel, objections, trace, and reset.
- `reports/roi_competitive_containment_and_guided_execution.md` - latest UX findings, ROI/competitive containment, and guided execution evidence.
- `reports/g1_g2_guided_story_execution.md` - G1-G2 evidence for ROI/competitive containment and guided tab-to-tab story execution.
- `reports/g3_execution_plan_preview.md` - G3 evidence for the Review execution plan preview and locked adapter-create summary.
- `reports/g4_llm_prompt_contracts.md` - G4 evidence for LLM prompt contracts and SuiteScript direct-write boundary.
- `reports/g5_netsuite_visual_smoke_pilot_notes.md` - G5 authenticated NetSuite pilot smoke packet.
- `reports/g6_suitescript_write_path_mapping.md` - G6 SuiteScript direct-write mapping evidence.
- `reports/g7_suitescript_write_path_blueprint.md` - G7 SuiteScript write-path implementation blueprint evidence.
- `reports/g8_create_ready_review_ux.md` - G8 create-readiness Review UX evidence.
- `reports/g9_suitescript_write_path_package.md` - G9 create-disabled SuiteScript package evidence.
- `reports/g10_food_beverage_controlled_create_pilot.md` - G10 Food / Beverage controlled create pilot evidence.
- `reports/g12_suitescript_harness_results.md` - G12 local SuiteScript harness PASS report.
- `reports/g13_controlled_enablement_branch_plan.md` - G13 controlled branch plan evidence.
- `reports/g14_sandbox_deployment_packet.md` - G14 sandbox deployment packet evidence.
- `reports/u1_u2_guided_intake_story_viewport.md` - U1-U2 evidence for guided intake and story-first first viewport.
- `reports/u2_5_run_idb_intake_resolver.md` - U2.5 evidence for one-action Run IDB intake resolution and hardgoods routing.
- `reports/u2_6_website_first_family_resolver.md` - U2.6 evidence for website-first family routing for Vans/Apparel and Gordon & Smith/Hardgoods.
- `reports/u3_u4_review_packet_roi_audit.md` - U3-U4 evidence for direct Review packet rows and auditable ROI.
- `reports/u5_u6_industry_competitive_run_coach.md` - U5-U6 evidence for industry-specific competitive framing and pain-aware Run coaching.
- `reports/u7_u8_creation_contract_resolver_hardening.md` - U7-U8 evidence for creation packet contract and resolver expectations.
- `reports/u9_u10_review_compression_value_v2.md` - U9-U10 evidence for compressed Review grouping and ROI / Competitive V2 proof stack.
- `reports/u11_run_coach_v2.md` - U11 evidence for page-aware presenter script, decision landing, and traceable run coaching.
- `reports/v1_v2_website_signal_resolver_upgrade.md` - V1-V2 evidence for website-first lane selection and product naming seeds.
- `reports/v3_v4_website_product_naming_llm_contract.md` - V3-V4 evidence for product naming source visibility and N/LLM prompt contract V2.
- `reports/v5_v8_story_roi_competitive_review_redesign.md` - V5-V8 evidence for story mapping, ROI audit, competitive intelligence, and Review redesign.
- `reports/v9_v11_run_confirm_pilot_branch.md` - V9-V11 evidence for Run Coach V3, create confirmation UX, and sandbox pilot branch planning.
- `reports/v11_v13_lookup_idempotency_small_write_smoke.md` - V11-V13 evidence for lookup/idempotency and small-write smoke planning.
- `reports/v14_partial_failure_rollback_evidence.md` - V14 evidence for partial failure, rollback labels, dependent-write stop rules, and no silent retry/deletion.
- `reports/v15_transaction_context_write_pilot.md` - V15 evidence for guarded Sales Order context pilot planning.
- `reports/w1_release_baseline_context_lock.md` - W1 baseline lock for the write/full-release workstream.
- `reports/w2_ux_guided_flow_audit.md` - W2 consultant guided-flow audit and first Plan-page noise reduction.
- `reports/w3_code_review_sentinel_pass.md` - W3 code review sentinel findings and future-block restructuring notes.
- `reports/w4_website_first_intelligence_v4.md` - W4 website-first segmented scoring and lane confidence evidence.
- `reports/w5_one_action_intake_run_idb.md` - W5 one-action Run IDB packet-freeze evidence.
- `reports/w6_review_packet_v4_direct_record_preview.md` - W6 stable packet identity and Review packet V4 evidence.
- `reports/w7_roi_competitive_value_workspace_v4.md` - W7 auditable ROI / Competitive value workspace evidence.
- `reports/w8_run_coach_v4_guided_storytelling.md` - W8 Run Coach V4 guided storytelling evidence.
- `reports/w9_w18_ux_first_write_replan.md` - W9-W18 replan that moves Review compression, collapsible Story Bar, summary-first ROI / Competitive, and live-control-first Run ahead of write implementation.
- `reports/w9_review_compression_execution_first.md` - W9 evidence for execution-first Review, collapsed record list, and compact create readiness.
- `reports/w10_collapsible_story_bar.md` - W10 evidence for collapsible Story Bar and active-session persistence.
- `reports/w11_roi_competitive_summary_first.md` - W11 evidence for summary-first ROI / Competitive with expandable audit and proof detail.
- `reports/w12_run_live_control_first.md` - W12 evidence for live-control-first Run tab, Top 3 path, and expandable script detail.
- `reports/w13_ux_scenario_qa_pilot_readiness.md` - W13 scenario QA for Gordon and Smith, Vans, Milk-Bone, weak website, weak notes, and five-consultant pilot readiness.
- `reports/w14_write_branch_runtime_strategy.md` - W14 evidence for branch isolation, runtime flags, and parent-result transaction gate.
- `reports/w15_customer_write_pilot.md` - W15 evidence for Customer-only SuiteScript write pilot shape while main create remains disabled.
- `reports/w16_proof_item_write_pilot.md` - W16 evidence for Proof Item write pilot shape gated behind Customer result while main create remains disabled.
- `reports/w17_confirmation_result_ux.md` - W17 evidence for confirmation, result states, and partial-failure UX while main create remains disabled.
- `reports/w18a_plan_first_viewport_action_bias.md` - W18A evidence for Plan-first guided intake and tab-aware Story Bar collapse.
- `reports/w18b_five_consultant_pilot_feedback_rubric.md` - W18B five-consultant pilot feedback rubric.
- `reports/w18c_adaptive_netsuite_workspace_fit.md` - W18C evidence for side-by-side NetSuite workspace fit with overlay fallback.
- `reports/w18d_guided_story_polish_before_write_pilot.md` - W18D evidence for one-question-per-tab guided story polish.
- `reports/w19_w21_write_execution_pilot_pack.md` - W19-W21 evidence for governed write pilot branch, transaction context parent-result gating, and five-consultant executable pilot pack.
- `reports/w22_governed_pilot_branch_toggle.md` - W22 evidence for sandbox-only governed pilot branch toggle path.
- `reports/w23_sandbox_suitelet_deployment_smoke.md` - W23 sandbox Suitelet deployment smoke runbook and evidence requirements.
- `reports/w23_authenticated_sandbox_smoke_evidence.md` - W23 authenticated NetSuite GET/POST smoke evidence showing validated create-disabled response.
- `reports/w24_customer_proof_item_write_pilot.md` - W24 evidence for the separate sandbox pilot branch that writes Customer first, then Proof Item, while main create remains disabled.
- `reports/w25_redwood_token_ux_alignment.md` - W25 evidence for Redwood token, density, focus, reduced-motion, and forced-colors UI alignment.
- `reports/w26_redwood_netsuite_component_coverage.md` - W26 evidence for NetSuite Redwood component coverage, status tokens, card/action hierarchy, and scanability polish.
- `reports/w40_multi_lane_pilot_scope_review_stabilizer.md` - W40 evidence for Products CPG pilot scope and Review-tab stabilization.
- `data/w14_write_branch_runtime_strategy.json` - W14 runtime flag and branch isolation contract.
- `data/w15_customer_write_pilot_contract.json` - W15 Customer write pilot contract.
- `data/w16_proof_item_write_pilot_contract.json` - W16 Proof Item write pilot contract.
- `data/w17_confirmation_result_ux_contract.json` - W17 confirmation/result UX contract.
- `data/w19_governed_write_execution_pilot_branch.json` - W19 governed write execution pilot branch contract.
- `data/w20_transaction_context_execution_design.json` - W20 transaction context execution design contract.
- `data/w21_five_consultant_executable_pilot_pack.json` - W21 five-consultant executable pilot pack contract.
- `data/w22_governed_pilot_branch_toggle.json` - W22 branch/runtime toggle contract for sandbox-only Customer and Proof Item writes.
- `data/w23_sandbox_suitelet_deployment_smoke.json` - W23 create-disabled sandbox Suitelet smoke contract.
- `data/w24_customer_proof_item_write_pilot.json` - W24 governed sandbox pilot contract for Customer plus Proof Item writes only.
- `data/w25_redwood_token_ux_alignment.json` - W25 Redwood token UX alignment contract.
- `data/w26_redwood_netsuite_component_coverage.json` - W26 NetSuite Redwood component coverage contract.
- `data/w40_multi_lane_pilot_scope_review_stabilizer.json` - W40 multi-lane pilot scope and Review stabilizer contract.
- `netsuite/suitescript/idb_suitescript_write_path_suitelet_w24_pilot.js` - W24 separate sandbox pilot Suitelet; do not use as the main create-disabled Suitelet.
- `trace_samples/w23_sandbox_smoke_reviewed_packet.json` - W23 reviewed POST smoke packet.
- `trace_samples/consultant_acceptance_trace_sample.json` - generated acceptance trace sample.
- `trace_samples/georgetown_foods_dry_run_packet.json` - exportable dry-run object packet sample.
- `trace_samples/h8_release_candidate_trace_sample.json` - release-candidate trace sample with ROI / Competitive and adapter bridge evidence.
- `package.json` - local validation scripts for the GitHub repo.
- `REPO_TRANSFER_CHECKLIST.md` - copy scope and first-commit checklist.

## Install

1. Open Tampermonkey.
2. Create a new script.
3. Paste the contents of `idb-drawer.user.js`.
4. Save.
5. Open any NetSuite page.
6. Click the `IDB` rail button on the right side.

## Validate

From this folder:

```bash
node tools/validate_drawer_project.js
```

The validator writes the current validation report, six-lane parity report, consultant acceptance run, and trace sample.

For a full repo preflight:

```bash
npm run preflight
```

## GitHub Transfer

Copy only the contents of this folder into the new GitHub repository root. Do not copy parent `Playground` files. After copying, run `npm run preflight`, then commit the package.

## Current Block Status

- Prompt 1: drawer shell, preview, trace export skeleton, and validator are complete.
- Prompt 2: page-aware context and current move recommendation are complete.
- Prompt 3: live storytelling controls for redirect, confirm, pressure-test, and summarize are complete.
- Prompt 4: six-lane parity report is generated by the validator.
- Prompt 5: consultant acceptance checklist and trace sample are generated by the validator.
- Prompt 6: customer, website, and conversation-note intake is available in the drawer and stays browser-local.
- Prompt 7 / A: draft-only setup planning is complete and inherits the Demo Command Center V4 customer/order/proof path.
- Prompt 8 / C: UX streamlining is implemented with Plan / Review / Run / Trace states and compact first-viewport summary.
- Prompt D: creation adapter is documented as spec-only; live writes remain disabled.
- Prompt E: Georgetown Foods dry-run object packet is generated for review-only setup.
- Prompt M1: Redwood UX tightening is complete in the userscript; next work is Review/Run story hardening, creation execution guard, and Monday acceptance.
- Prompt M2: Review and Run story hardening is complete.
- Prompt M3: Creation execution guard is complete with no live writes enabled.
- Prompt M4: Monday live acceptance checklist is ready for NetSuite smoke.
- Prompt M5: Conceptual full release architecture is complete.
- Prompt M10: N/LLM enrichment contract is complete as review-only.
- Prompt M11: Adapter dry-run-to-create bridge is complete as create-blocked.
- Prompt M12-M16: Redwood color, compact ROI/competitive context, N/LLM object previews, adapter payload hardening, and local release-candidate validation are complete.
- Productized Creation Arc: Apparel & Accessories lane, setup toggles, product-aware preview naming, and the next P1-P9 architecture are in place.
- Prompt P3-P4: product-specific preview intelligence and above-the-fold ROI/competitive value story are complete.
- Prompt P5: Review packet productization is complete as review-only build packet.
- Prompt P8: Consultant UX redesign is complete for the current drawer cockpit pass.
- Prompt H1: visible Clear all control and NetSuite login/logout boundary reset are in place for active demo hygiene.
- Prompt H2: Review packet now leads with direct `will be` record/transaction statements and keeps adapter details collapsed.
- Prompt H3: dedicated `ROI / Competitive` tab is complete with ROI thesis, value agenda, safe competitive framing, objections, and discovery questions.
- Prompt H4: live controls are now customer-aware coaching actions: Open, Prove, Handle objection, and Close value.
- Prompt H5: interaction and color upgrade is complete with five-state navigation and progress rail.
- Prompt H6: optional SC request intake is complete for objective, known competitor, and decision criteria.
- Prompt H7: production readiness pass is complete with a release-candidate checklist and refreshed repo transfer scope.
- Prompt H8: release-candidate demo script is complete for controlled consultant pilot smoke.
- Guided Execution Update: ROI / Competitive is contained to its dedicated tab, Run is execution-focused, and the next 24-hour LLM-guided execution plan is documented.
- Guided G1-G2: guided step card is complete across Plan, Review, ROI / Competitive, Run, and Trace.
- Guided G3: Review now includes an execution plan preview for what IDB will prepare, what the consultant should verify, and what the governed write path would create later.
- Guided G4: LLM prompt contracts are complete and preserve the prior SuiteScript direct-write model as a governed future creation path without external connector dependency.
- Guided G5: authenticated NetSuite pilot smoke packet is ready for Food / Beverage, Apparel & Accessories, trace, clear-all, and login/logout checks.
- Guided G6: SuiteScript direct-write path is mapped as a create-disabled skeleton for the future production writer.
- Guided G7: SuiteScript write-path implementation blueprint is complete with entry point, record mapping, field mapping, create/update rules, partial-failure handling, and trace result contract.
- Guided G8: Review now shows create-readiness gates and a future SuiteScript create preview while keeping create disabled.
- Guided G9: create-disabled SuiteScript Suitelet scaffold and package runbook are complete for the future NetSuite-side write path.
- Guided G10: Food / Beverage controlled create pilot is scoped with exact records, gates, stop conditions, and rollback runbook while create remains disabled.
- Guided G11: controlled enablement checklist is complete and blocks write enablement without smoke, harness, rollback, confirmation UX, trace, and pilot branch readiness.
- Guided G12: local SuiteScript harness is complete and passes blocked/validated scenarios with create disabled.
- Guided G13: controlled one-lane enablement branch plan is complete for a future Food / Beverage pilot branch while main remains create-disabled.
- Guided G14: sandbox deployment packet is complete for create-disabled Suitelet connectivity and gate smoke.
- Next 48 Hour UX Execution Release: plan is defined for guided intake, direct review statements, auditable ROI, industry competitive framing, pain-aware run coaching, and controlled SuiteScript creation readiness.
- U1-U2: guided intake now recommends and accepts the lane in one action, then moves the consultant to Review; Story Bar now leads with the value hook and compact status row.
- U2.5: normal intake now runs through a single `Run IDB` action, hides the lane wall unless manually requested, and routes Gordon & Smith-style hardgoods context to Dealer Hardgoods & Channel Fulfillment.
- U2.6: website-first resolver now routes Vans-style footwear/apparel/skateboarding signals to Apparel & Accessories before generic inventory/fulfillment terms can overpower it.
- U3-U4: Review rows now lead with direct build statements and ROI includes an expandable audit trail.
- U5-U6: ROI / Competitive now uses lane-specific NetSuite win themes, and Run now includes pain-aware action coaching plus likely exceptions.
- U7-U8: Review packet now carries Creation Packet Contract V2 fields and website resolver expectations are documented for key prospect families.
- U9-U10: Review is grouped into Core build and Supporting proof, while ROI / Competitive now includes a talk-track lead and NetSuite proof stack.
- U11: Run Coach V2 now gives the consultant Say, Show, Exception, and Close guidance with traceable live action payloads.
- U12: SuiteScript create contract alignment is complete; the server scaffold now requires Creation Packet Contract V2 while staying create-disabled.
- U13-U14: Create readiness now exports a SuiteScript review packet and Release Candidate V2 manifest while keeping consultant confirmation false and creation disabled.
- Next Intelligent Execute/Write Release: website-first lane selection, customer-specific naming, conversation-note story intelligence, auditable ROI, competitive framing, and controlled SuiteScript pilot write architecture are planned across 18 blocks.
- V1-V2: website signal contract and website-first resolver upgrade are complete; website now drives lane and naming before conversation notes shape story and value.
- V3-V4: website product naming is visible and traceable, and N/LLM prompt contract V2 is ready for advisory enrichment.
- V5-V8: conversation notes now drive a structured story mapper, ROI is auditable, competitive framing has source state, and Review is a direct create/update checklist.
- V9-V11: Run Coach V3 now uses page, website, notes, and value context; create confirmation UX is blueprinted but disabled; the first write-capable branch is scoped to sandbox-only Food / Beverage customer/proof records.
- V11-V13: SuiteScript now returns lookup-first/idempotency write-plan metadata and a blocked small-write smoke plan for Food / Beverage Customer Record plus Finished Good; main remains create-disabled.
- V14: SuiteScript now returns partial-failure policy, rollback evidence per row, and dependent-write stop metadata while keeping main create-disabled.
- V15: SuiteScript now returns a blocked transaction context pilot plan that requires Customer Record and Finished Good result IDs/URLs before any Sales Order context write can proceed.
- W9-W13: Review is execution-first, Story Bar is collapsible, ROI / Competitive is summary-first, Run is live-control-first, and weak/unknown lane signals now require stronger context or manual override before IDB builds the packet.
- W14-W18D: Write branch runtime strategy, Customer-only pilot path, Customer-gated Proof Item pilot path, confirmation/result UX, Plan-first guided intake, five-consultant pilot rubric, adaptive NetSuite workspace fit, and one-question-per-tab guided story polish are defined, harnessed or validated, and returned as create-disabled plans in the main package.
- W19-W21: Governed write pilot branch, parent-result-aware transaction context design, and five-consultant executable pilot pack are defined, harnessed, and still blocked in the main create-disabled package.
- W22: Branch/runtime toggle path now blocks before any future pilot write unless the separate pilot branch has compile flag, runtime flags, approved environment gate, and exact type-to-confirm phrase.
- W23: Create-disabled sandbox Suitelet smoke packet is ready with exact upload files, expected blocked/validated responses, and evidence capture requirements.
- W23 Evidence: Authenticated sandbox POST smoke returned `validated`, `createEnabled: false`, `createdRecords: []`, and a create-disabled write plan for Customer, Sales Order View, and Finished Good.
- W27: Visual pilot rubric is complete and Trek/new-website findings are folded into website-first package naming; `trekbikes.com` now resolves to Dealer Hardgoods with `Bicycle SKU` naming instead of generic Finished Good or food/beverage wording.
- W28: Website Package Classifier V2 is complete; unknown/new websites now use website/domain/category signals for package and record naming before conversation notes shape ROI, competitive, objections, and run coaching.
- W29: N/LLM Record Naming Advisory Contract is complete; exported trace payloads now include `recordNamingAdvisoryRequest` so an advisory model can propose sharper website-grounded record names without write authority, lane authority, proof-anchor changes, DCC toggle changes, packet-order changes, or hidden create permission.
- W30-W32: Review now shows compact naming advisory visibility, SuiteScript review packets carry a governed Customer + Proof Item pilot handoff, and Trace exports pilot evidence readiness while main creation remains disabled.
- W33: Plan flow corrective is complete; Live Question now leads Plan, unknown local websites require review before lane commitment, YETI routes to Dealer Hardgoods outdoor hardgoods naming, Run IDB review navigation bug is fixed, and Plan click traces are lighter.
- W34: Pilot result import is complete; Trace can manually import a SuiteScript Customer + Proof Item pilot result, Review shows compact imported evidence, and transaction context becomes review-ready only when parent IDs/URLs exist while writes remain disabled.
- W35: Website resolver source consolidation is complete; known-domain and category signals now flow through `governedWebsiteResolver`, product naming consumes that resolver first, and notes are explicitly kept for story, ROI, competitive, objections, and run coaching.
- W36: Executable website resolver harness is complete; `npm run harness:website` now proves website-first scenarios for lane, proof anchor, and product signal, and hardens known-domain pattern matching so generic pattern hits cannot masquerade as official website authority.
- W37: Website evidence intake and N/LLM advisory bridge are complete; optional homepage/category/product evidence now strengthens unknown-site lane and naming resolution, and the website harness now proves 13 scenarios while keeping N/LLM advisory-only.
- W38: Pilot result evidence review is locally ready; representative evidence shape and pivot rules are documented, but live write evidence is not claimed until an authenticated W24 pilot response is imported.
- W38R: The production demo account gate is corrected for consultant reality: `TD3021666` / `YOUR_ACCOUNT_ID.app.netsuite.com` is explicitly allowlisted for the W24 Customer + Proof Item pilot while unapproved production accounts and transaction writes remain blocked.
- W39: The W24 pilot now resolves account context before any write. `custscript_idb_default_subsidiary` is required; `custscript_idb_default_location` and `custscript_idb_default_taxschedule` are optional. Missing context returns JSON `blocked_missing_account_context` instead of NetSuite HTML 500.
- W50: True Website Intelligence Foundation is complete; `websiteEvidenceV1` now defines URL normalization, homepage/discovered-page fetch strategy, extracted evidence fields, source URLs, confidence states, blocked/thin/unavailable/ambiguous/timeout failure states, and a no-write resolver endpoint architecture for production website identification.
- W51: Intelligence Classifier V1 is complete; `websiteClassifierV1` now turns structured website evidence into cited lane, proof anchor, product seed, product family, and demand moment recommendations, with competing candidates and confirmation prompts for ambiguous or weak evidence while keeping notes downstream.
- W52: End-Goal Intelligence Test Harness is complete; the unknown-site corpus now has human-labeled expected outcomes, correct-or-honest scoring, false-confident-wrong limits, unsupported-claim checks, evidence coverage scoring, and required real/synthetic site mix coverage.
- W53: Consultant Evidence UX is complete; Plan and Review now show `What IDB saw`, `Why this classification`, confidence/uncertainty, competing candidates, and missing-evidence confirmation prompts, with the same evidence UX model included in trace exports.
- W54: Grounded ROI / Competitive Intelligence is complete; the value tab now shows website-evidence-grounded ROI and competitive summaries, source/confidence state, `Why this ROI`, `Why NetSuite`, and an unsupported-claim blocker for source-limited or unverified claims.
- W55: Five-Consultant Intelligence Pilot Pack is complete; install/use steps, consultant script, unknown-site mix, scorecard rubric, evidence checklist, stop/go criteria, and a virtual consultant run are packaged for real pilot testing.
- W56: Consultant UX Compression is complete; Plan, Review, ROI / Competitive, Run, and Trace now lead with answer-first 30-second summaries while keeping audit detail available in expandable sections.
- W57: Website Evidence Resolver is complete; a no-write live adapter now normalizes URLs, fetches homepage plus discovered same-site pages, extracts `websiteEvidenceV1`, returns blocked/thin/unavailable/ambiguous/timeout failure states, and stays out of SuiteScript/write authority.
- W58: Real Unknown-Site Corpus is complete; human-labeled real URL seeds and synthetic failure cases now evaluate resolver plus classifier behavior for correct-or-honest scoring, evidence coverage, false-confident-wrong limits, unsupported-claim blockers, and required site mix.
- W59: Confidence Calibration And Live Fetch Drift is complete; recommended thresholds, ambiguity margins, source-limited drift downgrades, false-confident-wrong guardrails, and pre-pilot confirmation rules are now validated against W58 baseline plus approved live-observation samples.
- W60: Website Evidence Runtime Integration is complete; drawer state now carries `websiteEvidenceV1`, Plan/Review/trace consume runtime website evidence before notes, and Ariat-style apparel/footwear identity is website-owned.
- W61: Evidence Extraction Upgrade is complete; Ariat, Uline, McMaster, Home Depot, and Thermo Fisher weak-site cases now have stronger website-owned extraction signals and regression tests proving notes do not own identity.
- W62: Resolver Service Contract And Threat Model is complete; `websiteResolverServiceV1` now has a no-write request/response contract, URL safety policy, SSRF/redirect/timeout/page-limit controls, failure-state matrix, cache-ready response shape, trace requirements, validator gates, and a best next Codex prompt for W63.
- W63: Local Resolver Service Prototype is complete; `websiteResolverServiceV1` now has a local no-write endpoint/service module with URL normalization, SSRF/redirect/content-type/timeout/page-limit safety, homepage plus secondary-page extraction, cache-ready responses, deterministic failure samples, validator gates, and a best next Codex prompt for W64.
- W64: Drawer To Resolver Service Adapter is complete; the drawer can call `websiteResolverServiceV1` through a no-write async adapter, keeps local fallback explicit and feature-flagged, shows resolver mode/status/failure states in Plan and Review evidence UX, and validates that service evidence cannot write, invoke SuiteScript, let notes own identity, or guess on blocked/thin/unavailable/timeout states.
- W65: Approved Live Resolver Smoke And Drift Gate is complete; approved public-site live fetch ran through the no-write resolver path and stayed honest with zero false-confident-wrong and zero unsupported claims, but live extraction is not production-ready yet because no approved site reached recommended confidence and evidence coverage was only 0.5.
- W66: Live Extraction Gap Closure And Resolver Tuning is complete; Trek live extraction now resolves to recommended Dealer Hardgoods / Bicycle SKU from website evidence, while Patagonia and Grainger remain thin and Lincoln Electric remains blocked without confident guesses.
- W67: Resolver Production Readiness And Hosted Endpoint Plan is complete; the hosted no-write endpoint plan now covers auth/CORS, cache, rate limits, observability, retry/manual-evidence fallback, domain policy, rollout toggles, rollback, and go/no-go while explicitly remaining plan-ready but not production-go.
- W68: Staging Resolver Endpoint Smoke Pack is complete; staging smoke now has environment variables, health check expectations, auth/CORS cases, cache validation, approved live-site smoke command, failure samples, manual-evidence fallback samples, observability checklist, pilot toggles, validator gates, and a W69 hosted endpoint implementation prompt.
- W69: Hosted Resolver Staging Endpoint Implementation is complete; the local staging endpoint wrapper now provides health, POST resolve, strict auth/CORS, NetSuite cookie/auth rejection, write-payload rejection, in-memory cache, rate limits, redacted observability, local server mode, and validator-gated no-write behavior.
- W70: Drawer Hosted Resolver Endpoint Toggle Smoke is complete; the drawer now supports endpoint, token-header, hosted-only fallback, rollback, Plan/Review resolver status, failure-state UX, and trace coverage against the local staging resolver without changing write authority.
- W71: Local End-To-End Hosted Resolver Pilot Smoke is complete; the local staging resolver HTTP server and drawer hosted-toggle path now run together through real localhost HTTP for recommended, blocked, thin, unavailable, timeout, cache-hit, rollback, Plan/Review/Trace coverage, and no-write gates.
- W72: Hosted Resolver Remote Deployment Readiness Gate is complete; remote staging now has an environment/secret/CORS/deployment readiness plan, opt-in remote smoke command pack, cache/observability checks, rollback switch, pilot go/no-go, and validator gates while remaining not deployed until a real remote URL and secrets are configured.
- W73: Remote Hosted Resolver Smoke Execution is blocked honestly; no remote staging URL or resolver secrets are configured in this workspace, so remote smoke was not executed or simulated, and pilot remains no-go until W73R runs against a real hosted endpoint.
- W73R: Execute Remote Hosted Resolver Smoke With Config now has a first-class execution harness. In this workspace the configured remote endpoint env vars are still absent, so W73R records a hard no-go instead of downgrading to local smoke or fabricated hosted results.
- W74: Remote Resolver Pilot Toggle Decision keeps hosted resolver consultant pilot traffic disabled because W73R did not execute against a real remote endpoint. The output is a no-go decision plus the exact remediation checklist required before any hosted-only consultant smoke can run.
- W75: Hosted Resolver Configuration Remediation Pack defines the exact endpoint env setup, secret handling, CORS origins, deployment owners, W73R rerun command pack, no-secret trace rules, and pilot unlock criteria. Hosted resolver pilot traffic remains disabled until W76 proves the real remote endpoint.
- W76: Hosted Resolver Configured Remote Execution reruns W73R as the configured remote execution gate. In this workspace the required remote env is still absent, so remote smoke remains unexecuted and hosted resolver pilot traffic remains no-go.
- W76R: Apply Hosted Resolver Env And Rerun Remote Execution records that the real hosted endpoint URL, token, approved origin, blocked origin, and opt-in were not available to apply. The harness reruns W76, keeps hosted resolver pilot traffic disabled, and outputs the operator handoff needed before a true rerun.
- W77: Remote Endpoint Provisioning And Secrets Handoff defines the secret-safe operator handoff for the real hosted resolver URL, token, approved NetSuite origin, blocked negative-test origin, and smoke opt-in. It stores no secrets and keeps hosted resolver pilot traffic disabled until W76R proves `remoteSmokeExecuted=true`.
- W78: Secret-Safe Remote Smoke Operator Runbook converts the W77 handoff into an operator-ready shell setup, command order, expected pass/fail outputs, no-secret handling rules, rollback steps, and pilot unlock decision tree. Hosted resolver pilot traffic remains disabled until the runbook is executed with real secrets and W76R passes remotely.
- Functional Setup Arc: live NetSuite record creation remains disabled until a governed creation/write path and explicit consultant confirmation exist.

## V1 Boundaries

- Seven authorized V5 lanes only, including Apparel & Accessories.
- No resolver or runner change.
- No proof-anchor change.
- No fixture append.
- No unsupported functional assets shown.
- No automatic lane switch or automatic record creation.
- Future creation can use the prior SuiteScript direct-write pattern; no external connector is required, but all review and confirmation gates still apply.
- Trace is active-session scoped and exportable JSON.
- Setup state is shared across NetSuite tabs for the active demo session, expires after 8 hours, resets on NetSuite login/logout boundary pages, and can be reset with `Clear all`.
- Planned object names use the prospect/customer name and remain draft-only until governed creation/write path approval.
- Enriched object previews may improve names, intended updates, field assumptions, ROI, and competitive copy, but remain advisory and review-only.
- Setup toggles for new item, manufacturing, and WIP must stay visible before any creation flow.
