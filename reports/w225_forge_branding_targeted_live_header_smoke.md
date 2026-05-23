# W225 FORGE Branding Targeted Live Header Smoke

Status: PASS (11/11)

## Targeted Live FORGE Header Smoke Packet
- Rail text: FORGE
- Rail title: Open FORGE. Drag to move the launcher.
- Header logo: embedded FORGE image present
- Header alt text: FORGE SC Demo Creation Tool
- Old visible branding: absent from live header
- Close button: present with accessible title

## Operator Summary Surface Smoke Assertions
- Copy operator summary control remains present near the operator import/status surface.
- Operator summary copied.
- Copy failed. Use export from admin/debug.
- Admin/debug diagnostics appendix toggle is hidden in normal mode and visible in admin/debug mode.

## Validation
- PASS live_rendered_shell_header_includes_forge_asset: drawer=true, assetPrefix=data:image/png;base64,
- PASS live_rendered_shell_has_forge_rail_label: text=FORGE, title=Open FORGE. Drag to move the launcher.
- PASS old_visible_branding_absent_from_live_header: 
      <div class="idb-header">
        <div class="idb-title-row">
          <div class="idb-forge-brand">
            <img class="idb-forge-logo" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABVoAAAIDCAYAAAD14aVWABbv6ElEQVR42ly9d18US9f1X9fzqu4jk8CTzzEAkweYHMhJQFDAAAhiQhBREVFBMsZz3c/v3f32WntXD+f5oz5VXV1VHaanZ/rbq9Z2ya5uF+/Ku2RPwSW78y7R3SPloksxlZhnC1WXK1ddtlhx2XJZynWXK1Vcd7Xheip1lyqUXUbWpfOaZ0qaZ0tVy6Vtueay0hZ5V6XXdUnf7lqNY+Trva7U2+fyvQOuWO9zZcnLfZL6ByUNuO5Gn+upSZ9Gr8vX+l1RlguNfleQdqWGpL5+6S/5wCD7VAeGXWVgyFUHRyUfcY3hUUnjrs58zPWOjku64fpGJ1y/pLqs62PdKNf1ybr+sRtuYGxc0g03eGPSDU5MuQFJQ5KGp25KmnIj09NuZGpaytNuTNIoktSNz9xyN25KmrntJm7NyrLkt2+78VtzblLyqdl5d3Nuzk3P3ZFc0p27bkbSzfl7zG/fv+9u311wswsLbu6+5PckX1h0s4sP3Nzikru7uOzuLa24u5LuLy9LvuzuP1hxd1YkX5G6hw/dwsqqW3z4yC2urroHq4/dg0dP3eLjJ+7B02duRdLys
- PASS close_button_accessible_in_live_header: close button title retained
- PASS image_alt_text_exact_in_live_header: FORGE SC Demo Creation Tool
- PASS operator_summary_copy_control_present: trace import/status surface has copy action
- PASS copy_summary_feedback_exact: {"buttonLabel":"Copy operator summary","successCopy":"Operator summary copied.","failureCopy":"Copy failed. Use export from admin/debug."}
- PASS admin_debug_appendix_toggle_gating_correct: normal=-1, admin=1121
- PASS normal_rendered_html_hides_forbidden_terms: normal shell and trace surfaces hide internal terms
- PASS w218_w220_w222_w223_w224_remain_unchanged: frozen success/recovery/export/copy/branding preserved
- PASS targeted_only_no_runner_suitescript_or_drawer_writes: {"w151ImportGuardPreserved":true,"semanticRoleMappingPreserved":true,"modeAwareNamingGuardrailsPreserved":true,"dynamicRecordDisplayPreserved":true,"consultantPartialResultLanguagePreserved":true,"operatorReadableSmokePacketPreserved":true,"frozenReviewRunWordingPreserved":true,"importFailureRecoveryCopyPreserved":true,"recoveryUiSurfaceWiringPreserved":true,"endToEndOperatorPacketPreserved":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedW144AdapterPath":true,"runnerOwnsGeneratedRecords":true,"imageLookupDisabledByDefault":true,"nllmAdvisoryOnly":true,"exportableOperatorSummaryPreserved":true,"noDrawerWritesIntroduced":true,"noTransactionWritesIntroduced":true,"noSuiteScriptCallsIntroduced":true}

## Trace Samples
- trace_samples/w225_forge_branding_targeted_live_header_smoke_trace.json
- data/w225_forge_branding_targeted_live_header_smoke.json

## Upload Packet
- Upload/update `idb-drawer.user.js` only if deploying through W225.
- No W144 adapter, runner, or SuiteScript upload is required for W225.

## Visual Testing Decision
No broad visual testing was run for W225. This block used a targeted live-rendered shell/header smoke only.

## Best Next Codex Prompt
Move through W226: FORGE Header Install Packet And Operator Cutover Note. Use W225 targeted live header smoke to produce the final install/update packet and compact operator cutover note for replacing the Tampermonkey drawer with the FORGE-branded script while preserving W214-W225 boundaries and no broad visual testing.
