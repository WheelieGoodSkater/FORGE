# W228 Post-Install FORGE Operator Acceptance Packet

Status: PASS (8/8)

## Expected Installed Script
- idb-drawer.user.js

## Operator Acceptance Checklist
- FORGE rail button appears.
- FORGE rail label is not clipped.
- Drawer opens.
- Larger responsive FORGE header logo appears.
- Logo scales without overlapping the close button on a narrower window.
- Close button works.
- Copy operator summary appears in the Trace/import-status surface.

## Acceptance Outcomes
- Accept: All visible checks pass.
- Accept with visual follow-up: The drawer works and the FORGE surface is usable, but minor spacing polish is desired.
- Block install: A required FORGE surface, close control, or copy-summary control is missing or unusable.

## Block Conditions
- Rail label clipped.
- Header logo missing.
- Close button inaccessible.
- Old visible header text appears.
- Operator summary copy control missing.

## Normal Acceptance Note
```text
After installing the Tampermonkey drawer script, use this checklist to confirm the FORGE drawer is ready.
If every visible check passes, accept the install.
If the drawer works but spacing needs polish, accept with visual follow-up.
If a required control or FORGE brand element is missing, block the install.
```

## Install Exclusions
- No W144 adapter update.
- No runner update.
- No SuiteScript deployment update.
- No image lookup change.

## Validation
- PASS acceptance_checklist_compact_and_complete: FORGE rail button appears. | FORGE rail label is not clipped. | Drawer opens. | Larger responsive FORGE header logo appears. | Logo scales without overlapping the close button on a narrower window. | Close button works. | Copy operator summary appears in the Trace/import-status surface.
- PASS acceptance_outcomes_present: Accept | Accept with visual follow-up | Block install
- PASS block_conditions_cover_required_failures: Rail label clipped. | Header logo missing. | Close button inaccessible. | Old visible header text appears. | Operator summary copy control missing.
- PASS normal_acceptance_note_hides_forbidden_internal_terms: After installing the Tampermonkey drawer script, use this checklist to confirm the FORGE drawer is ready.
If every visible check passes, accept the install.
If the drawer works but spacing needs polish, accept with visual follow-up.
If a required control or FORGE brand element is missing, block the install.
- PASS w226_responsive_logo_sizing_remains_unchanged: width: min(420px, calc(100% - 72px))
- PASS w227_final_install_packet_remains_unchanged: {"runOnlyIfOperatorWantsLiveVisualConfirmationAfterInstall":true,"noBroadVisualTesting":true,"noNetSuiteRecordOpenLinkTesting":true,"noRunnerInvocation":true,"noSuiteScriptInvocation":true}
- PASS install_exclusions_remain_explicit: {"noW144AdapterUpdate":true,"noRunnerUpdate":true,"noSuiteScriptDeploymentUpdate":true,"noImageLookupChange":true}
- PASS w214_to_w227_boundaries_preserved: {"w151ImportGuardPreserved":true,"semanticRoleMappingPreserved":true,"modeAwareNamingGuardrailsPreserved":true,"dynamicRecordDisplayPreserved":true,"consultantPartialResultLanguagePreserved":true,"operatorReadableSmokePacketPreserved":true,"frozenReviewRunWordingPreserved":true,"importFailureRecoveryCopyPreserved":true,"recoveryUiSurfaceWiringPreserved":true,"endToEndOperatorPacketPreserved":true,"exportableOperatorSummaryPreserved":true,"consultantCopyExportActionPreserved":true,"forgeBrandingPreserved":true,"targetedLiveHeaderSmokePreserved":true,"forgeRailFontFitCorrectionPreserved":true,"responsiveForgeHeaderLogoPolishPreserved":true,"installCutoverPacketPreserved":true,"finalInstallPacketPreserved":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedW144AdapterPath":true,"runnerOwnsGeneratedRecords":true,"imageLookupDisabledByDefault":true,"nllmAdvisoryOnly":true}

## Trace Samples
- trace_samples/w228_post_install_forge_operator_acceptance_trace.json
- data/w228_post_install_forge_operator_acceptance_packet.json

## Visual Testing Decision
No broad visual testing for W228. Use the post-install checklist for targeted operator acceptance only.

## Best Next Codex Prompt
Move through W229: FORGE Post-Install Operator Evidence Intake. Use W228 acceptance checklist to capture the operator result after install, classify accept / accept with visual follow-up / block install, and route only targeted follow-up work while preserving all W214-W228 no-write/import boundaries.
