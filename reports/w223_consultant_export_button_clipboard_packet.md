# W223 Consultant Export Button And Clipboard Packet Wiring

Status: PASS (8/8)

## Copy/Export Action Model
- Button: Copy operator summary
- Success: Operator summary copied.
- Failure: Copy failed. Use export from admin/debug.
- Diagnostics appendix in normal export: no
- Diagnostics appendix in admin/debug explicit export: yes

## UI Copy Freeze
- Copy operator summary
- Operator summary copied.
- Copy failed. Use export from admin/debug.

## Validation
- PASS copy_export_model_returns_w222_normal_export_text: 1521 copied row chars
- PASS export_content_includes_required_summary_sections: {"summaryTitle":true,"generatedTimestamp":true,"caseCounts":true,"compactCaseRows":true,"noRegressionBoundarySummary":true,"visualTestingDecision":true}
- PASS normal_copy_hides_forbidden_internal_terms: IDB Import Operator Summary
Generated: 2026-05-24T20:44:54.329Z
Cases: 7 | Ready: 2 | Partial: 1 | Recovery: 4

Complete Non-Manufacturing Import | Ready | retail_availability | Build results are ready. | Open Customer / Open Sales Order / Open Item | Customer, Sales Order, Product SKU, Availability Flow, Channel Context | Hidden
Complete Manufacturing Import | Ready | discrete_manufacturing | Build results are ready. | Open Customer / Open Sales Order / Open Item | Customer, Sales Order, Finished/Assembly Item, BOM or Assembly Structure, Component Item | Hidden
Partial Food Batch WIP Import | Partial | food_batch_manufacturing | Food batch records are ready. WIP detail was not returned. | Open Customer / Open Sales Order / Open Item / Use available records / WIP detail not returned | Customer, Sales Order, Finished Food/Batch Item, Formula or Batch Structure, Ingredient Item, Lot Context | Hidden
Blank Import Recovery | Recovery | retail_availability | Paste the completed build result. | Use the latest completed runner result. | No Open links yet | Hidden
Handoff JSON Recovery | Recovery | retail_availability | Paste the completed build result. | Use the latest completed runner result. | No Open links yet | Hidden
Invalid Role/Name Recovery | Recovery | distribution_replenishment | This result does not match the selected operating mode. | Use the latest completed runner result. | No Open links yet | Hidden
Missing ID / Unsupported URL Recovery | Recovery | retail_availability | Ask the runner to return real NetSuite links. | Use available records only after import succeeds. | No Open links yet | Available

No-regression boundary summary:
Import guard preserved, Role mapping preserved, Mode-aware naming preserved, Dynamic record display preserved, Frozen success and recovery wording preserved, No drawer-created records, No drawer transaction writes, Runner owns generated records, Image lookup disabled by default, N/LLM advisory only

Visual testing decision: No broad visual testing for W222; export copy is frozen by harness contract.
- PASS admin_debug_appendix_excluded_unless_explicitly_requested: normal=false, blocked=false, admin=true
- PASS ui_labels_and_status_copy_are_exact: {"buttonLabel":"Copy operator summary","successCopy":"Operator summary copied.","failureCopy":"Copy failed. Use export from admin/debug."}
- PASS no_drawer_writes_or_suitescript_calls_introduced: {"w151ImportGuardPreserved":true,"semanticRoleMappingPreserved":true,"modeAwareNamingGuardrailsPreserved":true,"dynamicRecordDisplayPreserved":true,"consultantPartialResultLanguagePreserved":true,"operatorReadableSmokePacketPreserved":true,"frozenReviewRunWordingPreserved":true,"importFailureRecoveryCopyPreserved":true,"recoveryUiSurfaceWiringPreserved":true,"endToEndOperatorPacketPreserved":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedW144AdapterPath":true,"runnerOwnsGeneratedRecords":true,"imageLookupDisabledByDefault":true,"nllmAdvisoryOnly":true,"exportableOperatorSummaryPreserved":true,"noDrawerWritesIntroduced":true,"noTransactionWritesIntroduced":true,"noSuiteScriptCallsIntroduced":true}
- PASS w218_success_and_w220_recovery_wording_unchanged: frozen success and recovery copy present
- PASS normal_rendered_trace_copy_hides_internal_terms: 
      <div class="idb-card">
        <div class="idb-section-title">Trace actions only</div>
        <div class="idb-copy">Export trace evidence for support. Normal Build starts the saved build path and brings back final links automatically.</div>
        <div class="idb-chip-row">
          <span class="idb-chip idb-open">0 events</span>
          <span class="idb-chip idb-open">Dry run only</span>
          <span class="idb-chip idb-open">Stop Missing Context</span>
          <span class="idb-chip idb-open">Not connected</span>
        </div>
        <div class="idb-actions">
          
          <button class="idb-secondary" data-idb-copy-operator-summary>Copy operator summary</button>
          <button class="idb-primary" data-idb-export>Export trace</button>
          <button class="

## Trace Samples
- trace_samples/w223_consultant_export_button_clipboard_packet_trace.json
- data/w223_consultant_export_button_clipboard_packet.json

## Upload Packet
- Upload/update `idb-drawer.user.js` only if deploying W223 copy/export wiring.
- No W144 adapter, runner, or SuiteScript upload is required for W223.

## Visual Testing Decision
No broad visual testing was run for W223. Clipboard/export behavior is covered by the W223 harness and W222 fixture copy freeze.

## Best Next Codex Prompt
Move through W224: Operator Summary Export Live Surface Polish. Use W223 copy/export wiring to polish the live drawer placement, state feedback, and admin/debug appendix toggle for the operator summary while preserving frozen W218/W220/W222 copy, W151, real Open links, no drawer writes, and no broad visual testing.
