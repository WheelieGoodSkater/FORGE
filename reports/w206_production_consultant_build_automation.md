# W206 Production Consultant Intake And Build Automation Simplification

Status: PASS_W206_PRODUCTION_CONSULTANT_BUILD_AUTOMATION_READY

## Production Consultant Flow Contract
- Visible inputs: Customer / Prospect Name, Website, Conversation Notes
- Visible toggles: Create new hero item, Manufacturing, WIP
- Admin/debug config is saved and hidden from normal consultant workflow.
- Build calls the approved W144 adapter only through saved config and production build mode.
- Poll/import remains guarded by W151 before any Open links appear.

## Regression Harness
- PASS w206_consultant_inputs_are_only_name_website_notes: {"requiredVisibleInputs":["Customer / Prospect Name","Website","Conversation Notes"],"simpleBuildToggles":["Create new hero item","Manufacturing","WIP"],"normalWorkflowShowsAdapterFields":false,"normalWorkflowShowsOperatorPhrases":false,"normalWorkflowShowsRunnerPlumbing":false}
- PASS w206_simple_build_toggles_are_preserved: ["Create new hero item","Manufacturing","WIP"]
- PASS w206_confirmed_request_generated_from_simplified_intake: ["customer","demoTransaction","heroItem","matrixProofItem","componentItem"]
- PASS w206_saved_admin_config_gates_submit_without_visible_fields: 
      <div class="idb-cockpit-section">
        
      <div class="idb-card idb-accent idb-w83-dcc-handoff-operator-review idb-w114-review-handoff idb-w124-build-results">
        <div class="idb-section-title">Build Demo Records</div>
        <div class="idb-run-action-card idb-w114-request-summary">
          <div class="idb-status-key">What the consultant requested</div>
          <div class="idb-strong">Ariat International</div>
          <ul class="idb-tight-list">
            <li>Buyer: Buyer needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches.</li><li>Pain: Ariat International needs one trusted view before the customer promise is made.</li><li>Proof: Prove Style / SKU Matrix readiness with Core Boot and Apparel Style Matrix.</li><li>Value: Frame ROI as reduced risk around Style / SKU Matrix readiness; capture the current baseline before claiming savings.</li>
          </ul>
        </div>
        <div cl
- PASS w206_normal_consultant_flow_hides_runner_plumbing: W144 endpoint and phrases are hidden unless setup edit mode is enabled.
- PASS w206_pending_runner_shows_check_result_not_open_links: production_build_waiting_for_result_capture
- PASS w206_imported_result_opens_only_after_w151_guard: {"verified_openable":5}
- PASS w206_no_regression_boundaries_preserved: {"noDrawerWrites":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectDrawerSuiteScriptOutsideApprovedAdapterPath":true,"runnerOwnershipPreserved":true,"w151ImportGuardPreserved":true,"absoluteNetSuiteUrlsRequired":true,"noActiveOpenLinksBeforeCompletedResultImport":true,"handoffJsonStillRejectedByFinalImport":true}

## Release Readiness Checklist
- Consultant workflow only asks for customer/prospect name, website, conversation notes, and simple toggles.
- Approved W144 endpoint, flags, sandbox account, operator approval, idempotency, and runner plumbing are admin/debug saved config.
- Build submits only through the approved server adapter path when production build mode is enabled.
- Runner owns Customer, Sales Order, item, manufacturing, and WIP record creation.
- IDB imports only W151-valid completed runner result JSON.
- Open links render only after real NetSuite URLs are imported.
