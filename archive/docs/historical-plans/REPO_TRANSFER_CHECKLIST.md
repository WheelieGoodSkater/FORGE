# Repo Transfer Checklist

## Copy Scope

Copy only the contents of this folder into the GitHub repository root. Do not copy parent `Playground` files.

Required root files:

- `.gitignore`
- `idb-drawer.user.js`
- `package.json`
- `README.md`
- `REPO_TRANSFER_CHECKLIST.md`
- `RELEASE_CANDIDATE_CHECKLIST.md`
- `validation_report.md`
- `ARCHITECTURE_AND_PROMPT_CHAIN.md`
- `FUNCTIONAL_SETUP_ARCHITECTURE.md`
- `CREATION_ADAPTER_SPEC.md`
- `UX_STREAMLINING_PLAN.md`
- `MONDAY_LIVE_RELEASE_PLAN.md`
- `FULL_RELEASE_ARCHITECTURE.md`
- `ACTIVE_SESSION_AND_OBJECT_GENERATION_PLAN.md`
- `VISUAL_VALUE_AND_ENRICHED_PREVIEW_ARCHITECTURE.md`
- `PRODUCTIZED_CREATION_AND_CONSULTANT_UX_ARCHITECTURE.md`
- `NEXT_24_HOUR_PRODUCTIZED_RELEASE_PLAN.md`
- `NEXT_24_HOUR_GUIDED_EXECUTION_PLAN.md`
- `NEXT_48_HOUR_UX_EXECUTION_RELEASE_PLAN.md`
- `NEXT_RELEASE_INTELLIGENT_EXECUTE_WRITE_ARCHITECTURE.md`
- `NEXT_48_HOUR_WRITE_AND_FULL_RELEASE_PLAN.md`
- `SANDBOX_DEPLOYMENT_PACKET.md`

Required folders:

- `data/`
- `preview/`
- `reports/`
- `tools/`
- `trace_samples/`

Do not copy:

- Parent `Playground` files.
- `.DS_Store`.
- `node_modules/`.
- Zip files.
- `.env` files.

## First Repo Commands

```bash
npm run preflight
git status --short
git add .
git commit -m "Initial Intelligent Demo Builder drawer release candidate"
```

## Required Green State

- `npm run check` passes.
- `npm run validate` passes.
- `validation_report.md` says `Decision: PASS`.
- `reports/six_lane_parity_report.md` says `Decision: PASS`.
- `reports/consultant_acceptance_run.md` says `Decision: GO for real NetSuite smoke check`.
- `RELEASE_CANDIDATE_CHECKLIST.md` says `READY FOR CONTROLLED PILOT AFTER NETSUITE VISUAL SMOKE`.
- `reports/g5_netsuite_visual_smoke_pilot_notes.md` says `READY FOR AUTHENTICATED NETSUITE PILOT SMOKE`.
- `reports/g6_suitescript_write_path_mapping.md` says `COMPLETE AS CREATE-DISABLED SKELETON`.
- `reports/g7_suitescript_write_path_blueprint.md` says `COMPLETE AS IMPLEMENTATION BLUEPRINT / CREATE DISABLED`.
- `reports/g8_create_ready_review_ux.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/g9_suitescript_write_path_package.md` says `COMPLETE AS CREATE-DISABLED PACKAGE`.
- `reports/g10_food_beverage_controlled_create_pilot.md` says `COMPLETE AS PILOT PLAN / CREATE STILL DISABLED`.
- `reports/g12_suitescript_harness_results.md` says `Decision: PASS`.
- `reports/g13_controlled_enablement_branch_plan.md` says `COMPLETE AS BRANCH PLAN / CREATE STILL DISABLED`.
- `reports/g14_sandbox_deployment_packet.md` says `COMPLETE AS SANDBOX DEPLOYMENT PACKET / CREATE STILL DISABLED`.
- `reports/u1_u2_guided_intake_story_viewport.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/u2_5_run_idb_intake_resolver.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/u2_6_website_first_family_resolver.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/u3_u4_review_packet_roi_audit.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/u5_u6_industry_competitive_run_coach.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/u7_u8_creation_contract_resolver_hardening.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/u9_u10_review_compression_value_v2.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/u11_run_coach_v2.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/u12_suitescript_create_contract_alignment.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/u13_u14_packet_handoff_release_candidate.md` says `COMPLETE / CREATE STILL DISABLED`.
- `data/release_candidate_v2_manifest.json` says `release_candidate_v2_ready_create_disabled`.
- `NEXT_RELEASE_INTELLIGENT_EXECUTE_WRITE_ARCHITECTURE.md` says `planning_ready_create_disabled`.
- `reports/v1_v2_website_signal_resolver_upgrade.md` says `COMPLETE / CREATE STILL DISABLED`.
- `data/website_signal_contract.json` says `website_first_ready_create_disabled`.
- `reports/v3_v4_website_product_naming_llm_contract.md` says `COMPLETE / CREATE STILL DISABLED`.
- `data/website_product_naming_contract.json` says `website_product_naming_ready_create_disabled`.
- `data/llm_prompt_contracts_v2.json` says `advisory_prompt_contract_ready_create_disabled`.
- `reports/v5_v8_story_roi_competitive_review_redesign.md` says `COMPLETE / CREATE STILL DISABLED`.
- `data/conversation_pain_story_contract.json` says `story_mapper_ready_create_disabled`.
- `data/roi_competitive_v3_contract.json` says `roi_competitive_ready_create_disabled`.
- `data/review_packet_redesign_v3_contract.json` says `review_packet_redesign_ready_create_disabled`.
- `reports/v9_v11_run_confirm_pilot_branch.md` says `COMPLETE / MAIN CREATE STILL DISABLED`.
- `data/run_coach_v3_contract.json` says `run_coach_v3_ready_create_disabled`.
- `data/create_confirmation_ux_blueprint.json` says `disabled_in_main_package`.
- `data/suitescript_pilot_write_branch_plan.json` says `pilot_branch_plan_ready_main_create_disabled`.
- `reports/v11_v13_lookup_idempotency_small_write_smoke.md` says `COMPLETE / MAIN CREATE STILL DISABLED`.
- `data/suitescript_lookup_idempotency_contract.json` says `lookup_idempotency_ready_create_disabled`.
- `data/small_write_smoke_contract.json` says `small_write_smoke_ready_create_disabled`.
- `reports/v14_partial_failure_rollback_evidence.md` says `COMPLETE / MAIN CREATE STILL DISABLED`.
- `data/partial_failure_rollback_contract.json` says `partial_failure_rollback_ready_create_disabled`.
- `reports/v15_transaction_context_write_pilot.md` says `COMPLETE / MAIN CREATE STILL DISABLED`.
- `data/transaction_context_pilot_contract.json` says `transaction_context_pilot_ready_create_disabled`.
- `NEXT_48_HOUR_WRITE_AND_FULL_RELEASE_PLAN.md` says `planning_ready_main_create_disabled`.
- `reports/w1_release_baseline_context_lock.md` says `COMPLETE / MAIN CREATE STILL DISABLED`.
- `reports/w2_ux_guided_flow_audit.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w3_code_review_sentinel_pass.md` says `COMPLETE / FUTURE BLOCKS RESTRUCTURED / CREATE STILL DISABLED`.
- `reports/w4_website_first_intelligence_v4.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w5_one_action_intake_run_idb.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w6_review_packet_v4_direct_record_preview.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w7_roi_competitive_value_workspace_v4.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w8_run_coach_v4_guided_storytelling.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w9_w18_ux_first_write_replan.md` says `COMPLETE / PLAN UPDATED / CREATE STILL DISABLED`.
- `reports/w9_review_compression_execution_first.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w10_collapsible_story_bar.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w11_roi_competitive_summary_first.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w12_run_live_control_first.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w13_ux_scenario_qa_pilot_readiness.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w14_write_branch_runtime_strategy.md` says `COMPLETE / MAIN CREATE STILL DISABLED`.
- `reports/w15_customer_write_pilot.md` says `COMPLETE / MAIN CREATE STILL DISABLED`.
- `reports/w16_proof_item_write_pilot.md` says `COMPLETE / MAIN CREATE STILL DISABLED`.
- `reports/w17_confirmation_result_ux.md` says `COMPLETE / MAIN CREATE STILL DISABLED`.
- `reports/w18a_plan_first_viewport_action_bias.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w18b_five_consultant_pilot_feedback_rubric.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w18c_adaptive_netsuite_workspace_fit.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w18d_guided_story_polish_before_write_pilot.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w19_w21_write_execution_pilot_pack.md` says `COMPLETE / MAIN CREATE STILL DISABLED`.
- `reports/w22_governed_pilot_branch_toggle.md` says `COMPLETE / MAIN CREATE STILL DISABLED`.
- `reports/w23_sandbox_suitelet_deployment_smoke.md` says `COMPLETE / READY FOR SANDBOX SMOKE / CREATE STILL DISABLED`.
- `reports/w23_authenticated_sandbox_smoke_evidence.md` says `PASS / CREATE STILL DISABLED`.
- `reports/w24_customer_proof_item_write_pilot.md` says `COMPLETE / PILOT BRANCH READY / MAIN CREATE STILL DISABLED`.
- `reports/w25_redwood_token_ux_alignment.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w26_redwood_netsuite_component_coverage.md` says `COMPLETE / CREATE STILL DISABLED`.
- `reports/w40_multi_lane_pilot_scope_review_stabilizer.md` says `COMPLETE / PRODUCTS CPG PILOT SCOPE READY / REVIEW STABILIZED`.
- `data/w14_write_branch_runtime_strategy.json` says `runtime_strategy_ready_main_create_disabled`.
- `data/w15_customer_write_pilot_contract.json` says `customer_write_pilot_ready_create_disabled`.
- `data/w16_proof_item_write_pilot_contract.json` says `proof_item_write_pilot_ready_create_disabled`.
- `data/w17_confirmation_result_ux_contract.json` says `confirmation_result_ux_ready_create_disabled`.
- `data/w19_governed_write_execution_pilot_branch.json` says `pilot_branch_ready_create_disabled`.
- `data/w20_transaction_context_execution_design.json` says `transaction_context_design_ready_blocked_in_main`.
- `data/w21_five_consultant_executable_pilot_pack.json` says `pilot_pack_ready_create_disabled`.
- `data/w22_governed_pilot_branch_toggle.json` says `toggle_path_ready_main_create_disabled`.
- `data/w23_sandbox_suitelet_deployment_smoke.json` says `sandbox_smoke_ready_create_disabled`.
- `data/w24_customer_proof_item_write_pilot.json` says `pilot_branch_ready_for_sandbox_upload`.
- `data/w25_redwood_token_ux_alignment.json` says `complete_create_still_disabled`.
- `data/w26_redwood_netsuite_component_coverage.json` says `complete_create_still_disabled`.
- `data/w40_multi_lane_pilot_scope_review_stabilizer.json` says `complete_multi_lane_scope_and_review_stabilized`.
- `trace_samples/w23_sandbox_smoke_reviewed_packet.json` contains a reviewed create-disabled POST smoke packet.

## Boundaries To Preserve

- Seven authorized V5 lanes only, including Apparel & Accessories.
- No resolver or runner changes.
- No proof-anchor changes.
- No fixture append.
- No unsupported functional assets visible.
- W24 pilot file can only be uploaded to a separate NetSuite approved pilot Script/Deployment.
- Main Suitelet remains create-disabled.
- No Sales Order or transaction-context write yet.
- W40 pilot scope allows only Customer + Proof Item for `food_beverage` and `products_cpg`.
- No certification, growth-gap, Open Old Design, Run Demo Reset, or Regression Comparison language.
- No automatic lane switch.
- No live NetSuite record creation until a governed creation/write path and explicit consultant confirmation exist.
- Future creation can use the prior SuiteScript direct-write pattern without an external connector, but only after review, confirmation, and trace gates are met.
- Sandbox Suitelet deployment remains smoke-only with `CREATE_ENABLED = false` until a separate governed pilot branch enables writes.
- SuiteScript scaffold must reject reviewed packets without Creation Packet Contract V2 idempotency, rollback, dependency, and trace-result fields.
- SuiteScript review packet export must keep `consultantConfirmed: false` until a controlled run-time confirmation gate exists.
- Proof Item write must remain blocked until a traceable Customer result ID and URL exist.
- Confirmation/result UX must show the exact write list, pilot gate summary, result states, and recovery evidence before any future write can be enabled.
- Plan first viewport must prioritize Guided Intake before expanded Story Bar recap.
- Five-consultant pilot feedback must score Plan, Review, ROI / Competitive, Run, Trace, reset, and write-readiness clarity.
- Adaptive workspace fit must be reversible and must fall back to overlay mode on narrow or incompatible pages.
- Guided story should keep one clear live-demo question per tab and avoid repeated full Story Bar content outside Review.
- W19-W21 write pilot contracts must remain approved-branch-only, parent-result gated, and five-consultant-packaged before any broader execution.
- W22 governed pilot toggle must block before any Customer or Proof Item write unless a separate pilot branch has CREATE_ENABLED true, all approved runtime flags true, an approved environment gate, and the exact type-to-confirm phrase.
- W23 sandbox Suitelet smoke must upload the main `CREATE_ENABLED = false` Suitelet only; any record creation, production deployment, or returned record ID is a stop condition.
- Website signal must remain the primary lane and naming authority before conversation notes shape story, ROI, and competitive framing.
- W27 website package rules must prevent cross-lane naming leakage: Trek/new bicycle hardgoods should use Dealer Hardgoods, `Bicycle SKU`, and dealer availability language, not Finished Good or ingredient/lot readiness fallback.
- W28 website package classifier must keep ordered authority: known website, website category, conversation-note cue, industry fallback, then N/LLM advisory enrichment. Notes must not own package identity before website evidence.
- W29 N/LLM Record Naming Advisory must remain exported as advisory only with `writeAuthority: none`; it may propose sharper record names from website evidence but cannot create records, invoke SuiteScript, change lane/proof/toggles, reorder the packet, or hide create blockers.
- W30-W32 must keep advisory naming visible but non-authoritative, govern Customer + Proof Item handoff as pilot-branch-only, and require evidence/trace readiness before any future write. Transaction context remains blocked until Customer and Proof Item IDs/URLs exist.
- W33 Plan flow must keep Live Question above Guided Intake, block unknown website auto-commit from notes alone, preserve YETI/outdoor hardgoods website routing, and avoid heavy Plan-click trace payloads.
- W34 pilot result import must stay manual/evidence-only: no drawer-side SuiteScript invocation, no automatic creation, no accepted transaction created record, and transaction context remains write-disabled even when Customer and Proof Item IDs/URLs are imported.
- W35 website resolver consolidation must keep `governedWebsiteResolver` as the website-owned source for lane/package/product identity; do not reintroduce duplicate website product pattern tables in `productIntelligence`, and do not let notes own product/package naming.
- W36 executable website resolver harness must stay in `npm run preflight`; it must fail if expected website-first lane/proof/product signals regress, if notes own product identity, or if a generic pattern match is treated like a known official domain.
- W37 website evidence bridge must keep `websiteEvidence` optional, review-only, and ahead of notes for lane/package classification; N/LLM may summarize public website evidence but cannot approve writes, invoke SuiteScript, change packet authority, or hide blockers.
- W38 pilot evidence review must not be marked live-complete without a fresh authenticated W24 pilot response. Representative samples can validate import shape only; they are not proof that NetSuite records were created or updated.
- W38R approved demo account gate must keep `TD3021666` / `YOUR_ACCOUNT_ID.app.netsuite.com` explicit, block unapproved production accounts, and keep transaction writes disabled.
- W39 account context resolver must block before Customer or Proof Item writes unless `custscript_idb_default_subsidiary` is configured. `custscript_idb_default_location` and `custscript_idb_default_taxschedule` remain optional write enrichments, and missing context must return JSON instead of an HTML 500.
- N/LLM prompt contract V2 must remain advisory only and cannot approve creation, invoke SuiteScript, change lanes, change proof anchors, or change DCC toggles.
- Competitive framing stays workflow-based unless verified facts are provided.
