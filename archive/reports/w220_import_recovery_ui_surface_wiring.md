# W220 Import Recovery UI Surface Wiring

Status: PASS (10/10)

## Rendered Surface Coverage
- blankImport
  - Surface: import_recovery_surface_ready
  - Consultant: Paste the completed build result. Use the latest completed runner result.
  - Review card: yes
  - Build card: yes
  - Admin/debug: no
- parseError
  - Surface: import_recovery_surface_ready
  - Consultant: Paste the completed build result. Use the latest completed runner result.
  - Review card: yes
  - Build card: yes
  - Admin/debug: no
- handoffJson
  - Surface: import_recovery_surface_ready
  - Consultant: Paste the completed build result. Use the latest completed runner result.
  - Review card: yes
  - Build card: yes
  - Admin/debug: no
- invalidNames
  - Surface: import_recovery_surface_ready
  - Consultant: This result does not match the selected operating mode. Use the latest completed runner result.
  - Review card: yes
  - Build card: yes
  - Admin/debug: no
- missingIds
  - Surface: import_recovery_surface_ready
  - Consultant: Ask the runner to return real NetSuite links. Use available records only after import succeeds.
  - Review card: yes
  - Build card: yes
  - Admin/debug: no
- unsupportedUrls
  - Surface: import_recovery_surface_ready
  - Consultant: Ask the runner to return real NetSuite links. Use available records only after import succeeds.
  - Review card: yes
  - Build card: yes
  - Admin/debug: no
- nonOpenable
  - Surface: import_recovery_surface_ready
  - Consultant: Ask the runner to return real NetSuite links. Use available records only after import succeeds.
  - Review card: yes
  - Build card: yes
  - Admin/debug: no
- adminInvalidNames
  - Surface: import_recovery_surface_ready
  - Consultant: This result does not match the selected operating mode. Use the latest completed runner result.
  - Review card: yes
  - Build card: yes
  - Admin/debug: yes
- successFoodPartial
  - Surface: import_recovery_surface_not_needed
  - Consultant: Paste the completed build result. Use the latest completed runner result.
  - Review card: no
  - Build card: no
  - Admin/debug: no

## Validation
- PASS blank_import_surface_shows_plain_recovery: Paste the completed build result.
- PASS parse_error_surface_shows_plain_recovery: Paste the completed build result.
- PASS handoff_json_surface_hides_raw_guard_message: Use the latest completed runner result.
- PASS invalid_role_name_surface_is_mode_plain: This result does not match the selected operating mode.
- PASS missing_ids_unsupported_urls_non_openable_request_real_links: Ask the runner to return real NetSuite links. | Ask the runner to return real NetSuite links. | Ask the runner to return real NetSuite links.
- PASS normal_failure_surfaces_hide_internal_terms_and_raw_messages: normal rendered failure surfaces are clean
- PASS no_fake_open_links_before_valid_import: no anchors or visible records on rejected imports
- PASS admin_debug_surface_shows_diagnostics_only_when_enabled: admin diagnostics hidden when off and shown when on
- PASS success_path_preserves_w218_frozen_partial_wording: partial food success wording preserved
- PASS w220_surface_model_preserves_boundaries: all no-regression flags preserved

## Trace Samples
- trace_samples/w220_import_recovery_ui_surface_wiring_trace.json
- data/w220_import_recovery_ui_surface_wiring.json

## Upload Packet
- Upload/update `idb-drawer.user.js` only if deploying W220 UI wiring.
- No W144 adapter, runner, or SuiteScript upload is required for W220.

## Visual Testing Decision
No broad visual testing was run for W220. Rendered Review/Build recovery surfaces are covered by harness assertions.

## Best Next Codex Prompt
Move through W221: End-to-End Success And Recovery Operator Packet. Combine the W218 success wording and W220 recovery surfaces into one compact operator packet for live inspection across complete, partial, and rejected import paths. Preserve W151, real Open links, no drawer writes, and no broad visual testing.
