# W229 FORGE Post-Install Operator Evidence Intake

Status: PASS (8/8)

## Expected Installed Script
- idb-drawer.user.js

## Operator Evidence Fields
- Rail button visible
- Rail label not clipped
- Drawer opens
- Larger FORGE header logo visible
- Logo does not overlap close button on narrower window
- Close button works
- Copy operator summary visible in Trace/import-status surface
- Optional screenshot/reference note (optional)

## Acceptance Classification Model
- Accept: All required evidence fields pass and no block condition is present.
- Accept with visual follow-up: Core drawer controls work, but rail label fit or responsive logo spacing needs minor polish.
- Block install: A required FORGE brand element, close control, drawer open action, or copy-summary control is missing or unusable.

## Targeted Follow-Up Routing
- Rail label fit polish: Rail label clipped.
- Header logo sizing polish: Logo overlaps the close button or needs spacing polish.
- Close-button accessibility fix: Close button inaccessible.
- Copy-summary placement fix: Operator summary copy control missing.
- Old-branding removal fix: Old visible header text appears.

## Block Conditions
- Rail label clipped.
- Header logo missing.
- Close button inaccessible.
- Old visible header text appears.
- Operator summary copy control missing.

## Normal Evidence Intake Copy
```text
Record the post-install FORGE checks after updating the Tampermonkey drawer script.
Classify the result as accept, accept with visual follow-up, or block install.
Route only the specific rail, header, close-button, copy-summary, or old-branding follow-up that the evidence supports.
```

## Install Exclusions
- No W144 adapter update.
- No runner update.
- No SuiteScript deployment update.
- No image lookup change.

## Validation
- PASS evidence_fields_match_w228_acceptance_checks: railButtonVisible:FORGE rail button appears. | railLabelNotClipped:FORGE rail label is not clipped. | drawerOpens:Drawer opens. | largerForgeHeaderLogoVisible:Larger responsive FORGE header logo appears. | logoDoesNotOverlapCloseButtonOnNarrowerWindow:Logo scales without overlapping the close button on a narrower window. | closeButtonWorks:Close button works. | copyOperatorSummaryVisibleInTraceImportStatusSurface:Copy operator summary appears in the Trace/import-status surface. | optionalScreenshotOrReferenceNote:optional
- PASS classification_rules_present: {"accepted":"accept","visualFollowUp":"accept_with_visual_follow_up","blocked":"block_install"}
- PASS block_conditions_match_w228: Rail label clipped. | Header logo missing. | Close button inaccessible. | Old visible header text appears. | Operator summary copy control missing.
- PASS targeted_follow_up_routing_is_limited_to_surface_fixes: Rail label fit polish | Header logo sizing polish | Close-button accessibility fix | Copy-summary placement fix | Old-branding removal fix
- PASS normal_evidence_intake_copy_hides_forbidden_internal_terms: Record the post-install FORGE checks after updating the Tampermonkey drawer script.
Classify the result as accept, accept with visual follow-up, or block install.
Route only the specific rail, header, close-button, copy-summary, or old-branding follow-up that the evidence supports.
- PASS w228_acceptance_packet_remains_unchanged: post_install_acceptance_packet_ready
- PASS install_exclusions_remain_explicit: {"noW144AdapterUpdate":true,"noRunnerUpdate":true,"noSuiteScriptDeploymentUpdate":true,"noImageLookupChange":true}
- PASS w214_to_w228_boundaries_preserved: {"w151ImportGuardPreserved":true,"semanticRoleMappingPreserved":true,"modeAwareNamingGuardrailsPreserved":true,"dynamicRecordDisplayPreserved":true,"consultantPartialResultLanguagePreserved":true,"operatorReadableSmokePacketPreserved":true,"frozenReviewRunWordingPreserved":true,"importFailureRecoveryCopyPreserved":true,"recoveryUiSurfaceWiringPreserved":true,"endToEndOperatorPacketPreserved":true,"exportableOperatorSummaryPreserved":true,"consultantCopyExportActionPreserved":true,"forgeBrandingPreserved":true,"targetedLiveHeaderSmokePreserved":true,"forgeRailFontFitCorrectionPreserved":true,"responsiveForgeHeaderLogoPolishPreserved":true,"installCutoverPacketPreserved":true,"finalInstallPacketPreserved":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedW144AdapterPath":true,"runnerOwnsGeneratedRecords":true,"imageLookupDisabledByDefault":true,"nllmAdvisoryOnly":true,"postInstallAcceptancePacketPreserved":true}

## Trace Samples
- trace_samples/w229_forge_post_install_operator_evidence_intake_trace.json
- data/w229_forge_post_install_operator_evidence_intake_packet.json

## Visual Testing Decision
No broad visual testing for W229. Evidence intake records targeted post-install operator observations only.

## Best Next Codex Prompt
Move through W230: FORGE Post-Install Evidence Review And Targeted Fix Gate. Use W229 operator evidence intake to review any supplied post-install evidence, decide accept / accept with visual follow-up / block install, and only open a targeted fix block when the evidence names a specific FORGE rail, header, close-button, copy-summary, or old-branding issue.
