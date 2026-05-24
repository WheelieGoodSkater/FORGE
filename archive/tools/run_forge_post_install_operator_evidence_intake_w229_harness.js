const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const w228DataPath = path.join(root, 'data', 'w228_post_install_forge_operator_acceptance_packet.json');
const dataPath = path.join(root, 'data', 'w229_forge_post_install_operator_evidence_intake_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w229_forge_post_install_operator_evidence_intake_trace.json');
const reportPath = path.join(root, 'reports', 'w229_forge_post_install_operator_evidence_intake.md');

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function classifyEvidence(evidence) {
  if (
    evidence.oldVisibleHeaderTextAppears ||
    !evidence.railButtonVisible ||
    !evidence.drawerOpens ||
    !evidence.closeButtonWorks ||
    !evidence.copyOperatorSummaryVisibleInTraceImportStatusSurface ||
    evidence.headerLogoMissing ||
    evidence.closeButtonInaccessible ||
    evidence.operatorSummaryCopyControlMissing
  ) {
    return 'block_install';
  }
  if (!evidence.railLabelNotClipped || !evidence.logoDoesNotOverlapCloseButtonOnNarrowerWindow) {
    return 'accept_with_visual_follow_up';
  }
  return 'accept';
}

function main() {
  const w228 = JSON.parse(fs.readFileSync(w228DataPath, 'utf8'));
  const acceptancePacket = w228.acceptancePacket;
  const forbiddenPattern = /(W144 endpoint|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|stack traces|raw guard messages)/i;
  const evidenceFields = [
    { id: 'railButtonVisible', label: 'Rail button visible', acceptanceCheck: 'FORGE rail button appears.' },
    { id: 'railLabelNotClipped', label: 'Rail label not clipped', acceptanceCheck: 'FORGE rail label is not clipped.' },
    { id: 'drawerOpens', label: 'Drawer opens', acceptanceCheck: 'Drawer opens.' },
    { id: 'largerForgeHeaderLogoVisible', label: 'Larger FORGE header logo visible', acceptanceCheck: 'Larger responsive FORGE header logo appears.' },
    { id: 'logoDoesNotOverlapCloseButtonOnNarrowerWindow', label: 'Logo does not overlap close button on narrower window', acceptanceCheck: 'Logo scales without overlapping the close button on a narrower window.' },
    { id: 'closeButtonWorks', label: 'Close button works', acceptanceCheck: 'Close button works.' },
    { id: 'copyOperatorSummaryVisibleInTraceImportStatusSurface', label: 'Copy operator summary visible in Trace/import-status surface', acceptanceCheck: 'Copy operator summary appears in the Trace/import-status surface.' },
    { id: 'optionalScreenshotOrReferenceNote', label: 'Optional screenshot/reference note', optional: true }
  ];
  const classificationRules = [
    {
      id: 'accept',
      label: 'Accept',
      when: 'All required evidence fields pass and no block condition is present.'
    },
    {
      id: 'accept_with_visual_follow_up',
      label: 'Accept with visual follow-up',
      when: 'Core drawer controls work, but rail label fit or responsive logo spacing needs minor polish.'
    },
    {
      id: 'block_install',
      label: 'Block install',
      when: 'A required FORGE brand element, close control, drawer open action, or copy-summary control is missing or unusable.'
    }
  ];
  const blockConditions = acceptancePacket.blockConditions.slice();
  const targetedFollowUpRouting = [
    { id: 'rail_label_fit_polish', label: 'Rail label fit polish', trigger: 'Rail label clipped.' },
    { id: 'header_logo_sizing_polish', label: 'Header logo sizing polish', trigger: 'Logo overlaps the close button or needs spacing polish.' },
    { id: 'close_button_accessibility_fix', label: 'Close-button accessibility fix', trigger: 'Close button inaccessible.' },
    { id: 'copy_summary_placement_fix', label: 'Copy-summary placement fix', trigger: 'Operator summary copy control missing.' },
    { id: 'old_branding_removal_fix', label: 'Old-branding removal fix', trigger: 'Old visible header text appears.' }
  ];
  const sampleEvidence = {
    accepted: {
      railButtonVisible: true,
      railLabelNotClipped: true,
      drawerOpens: true,
      largerForgeHeaderLogoVisible: true,
      logoDoesNotOverlapCloseButtonOnNarrowerWindow: true,
      closeButtonWorks: true,
      copyOperatorSummaryVisibleInTraceImportStatusSurface: true,
      optionalScreenshotOrReferenceNote: ''
    },
    visualFollowUp: {
      railButtonVisible: true,
      railLabelNotClipped: false,
      drawerOpens: true,
      largerForgeHeaderLogoVisible: true,
      logoDoesNotOverlapCloseButtonOnNarrowerWindow: true,
      closeButtonWorks: true,
      copyOperatorSummaryVisibleInTraceImportStatusSurface: true,
      optionalScreenshotOrReferenceNote: 'Rail label needs a fit check.'
    },
    blocked: {
      railButtonVisible: true,
      railLabelNotClipped: true,
      drawerOpens: true,
      largerForgeHeaderLogoVisible: false,
      logoDoesNotOverlapCloseButtonOnNarrowerWindow: true,
      closeButtonWorks: true,
      copyOperatorSummaryVisibleInTraceImportStatusSurface: true,
      headerLogoMissing: true,
      optionalScreenshotOrReferenceNote: 'Header logo did not render.'
    }
  };
  const normalEvidenceIntakeCopy = [
    'Record the post-install FORGE checks after updating the Tampermonkey drawer script.',
    'Classify the result as accept, accept with visual follow-up, or block install.',
    'Route only the specific rail, header, close-button, copy-summary, or old-branding follow-up that the evidence supports.'
  ].join('\n');
  const installExclusions = {
    noW144AdapterUpdate: true,
    noRunnerUpdate: true,
    noSuiteScriptDeploymentUpdate: true,
    noImageLookupChange: true
  };
  const noRegressionBoundarySummary = Object.assign({}, acceptancePacket.noRegressionBoundarySummary, {
    postInstallAcceptancePacketPreserved: true
  });
  const visualTestingDecision = 'No broad visual testing for W229. Evidence intake records targeted post-install operator observations only.';
  const evidenceIntakePacket = {
    schema: 'idb.w229-forge-post-install-operator-evidence-intake.v1',
    status: 'post_install_operator_evidence_intake_ready',
    expectedInstalledScript: 'idb-drawer.user.js',
    evidenceFields,
    classificationRules,
    blockConditions,
    targetedFollowUpRouting,
    sampleClassifications: {
      accepted: classifyEvidence(sampleEvidence.accepted),
      visualFollowUp: classifyEvidence(sampleEvidence.visualFollowUp),
      blocked: classifyEvidence(sampleEvidence.blocked)
    },
    sampleEvidence,
    normalEvidenceIntakeCopy,
    normalEvidenceIntakeCopyHidesForbiddenTerms: !forbiddenPattern.test(normalEvidenceIntakeCopy),
    installExclusions,
    noRegressionBoundarySummary,
    visualTestingDecision
  };
  const results = [];

  assertCase(results, 'evidence_fields_match_w228_acceptance_checks',
    evidenceFields.length === 8 &&
      acceptancePacket.acceptanceChecks.every((check) => evidenceFields.some((field) => field.acceptanceCheck === check)) &&
      evidenceFields.some((field) => field.id === 'optionalScreenshotOrReferenceNote' && field.optional === true),
    evidenceFields.map((field) => `${field.id}:${field.acceptanceCheck || 'optional'}`).join(' | '));
  assertCase(results, 'classification_rules_present',
    classificationRules.map((item) => item.id).join(',') === 'accept,accept_with_visual_follow_up,block_install' &&
      evidenceIntakePacket.sampleClassifications.accepted === 'accept' &&
      evidenceIntakePacket.sampleClassifications.visualFollowUp === 'accept_with_visual_follow_up' &&
      evidenceIntakePacket.sampleClassifications.blocked === 'block_install',
    JSON.stringify(evidenceIntakePacket.sampleClassifications));
  assertCase(results, 'block_conditions_match_w228',
    JSON.stringify(blockConditions) === JSON.stringify(acceptancePacket.blockConditions),
    blockConditions.join(' | '));
  assertCase(results, 'targeted_follow_up_routing_is_limited_to_surface_fixes',
    targetedFollowUpRouting.length === 5 &&
      targetedFollowUpRouting.map((item) => item.id).join(',') === 'rail_label_fit_polish,header_logo_sizing_polish,close_button_accessibility_fix,copy_summary_placement_fix,old_branding_removal_fix',
    targetedFollowUpRouting.map((item) => item.label).join(' | '));
  assertCase(results, 'normal_evidence_intake_copy_hides_forbidden_internal_terms',
    evidenceIntakePacket.normalEvidenceIntakeCopyHidesForbiddenTerms === true,
    normalEvidenceIntakeCopy);
  assertCase(results, 'w228_acceptance_packet_remains_unchanged',
    acceptancePacket.status === 'post_install_acceptance_packet_ready' &&
      acceptancePacket.expectedInstalledScript === 'idb-drawer.user.js' &&
      acceptancePacket.acceptanceChecks.length === 7 &&
      acceptancePacket.preservedFromW227.finalInstallPacketStatus === 'forge_final_install_packet_ready',
    acceptancePacket.status);
  assertCase(results, 'install_exclusions_remain_explicit',
    installExclusions.noW144AdapterUpdate === true &&
      installExclusions.noRunnerUpdate === true &&
      installExclusions.noSuiteScriptDeploymentUpdate === true &&
      installExclusions.noImageLookupChange === true,
    JSON.stringify(installExclusions));
  assertCase(results, 'w214_to_w228_boundaries_preserved',
    Object.values(noRegressionBoundarySummary).every(Boolean),
    JSON.stringify(noRegressionBoundarySummary));

  const passCount = results.filter((item) => item.pass).length;
  const harnessSummary = {
    schema: 'idb.w229-forge-post-install-operator-evidence-intake-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    evidenceIntakePacket
  };
  const trace = {
    schema: 'idb.w229-forge-post-install-operator-evidence-intake-trace.v1',
    expectedInstalledScript: evidenceIntakePacket.expectedInstalledScript,
    evidenceFields,
    classificationRules,
    blockConditions,
    targetedFollowUpRouting,
    sampleClassifications: evidenceIntakePacket.sampleClassifications,
    visualTestingDecision
  };
  writeJson(dataPath, harnessSummary);
  writeJson(tracePath, trace);
  const report = [
    '# W229 FORGE Post-Install Operator Evidence Intake',
    '',
    `Status: ${harnessSummary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Expected Installed Script',
    '- idb-drawer.user.js',
    '',
    '## Operator Evidence Fields',
    ...evidenceFields.map((item) => `- ${item.label}${item.optional ? ' (optional)' : ''}`),
    '',
    '## Acceptance Classification Model',
    ...classificationRules.map((item) => `- ${item.label}: ${item.when}`),
    '',
    '## Targeted Follow-Up Routing',
    ...targetedFollowUpRouting.map((item) => `- ${item.label}: ${item.trigger}`),
    '',
    '## Block Conditions',
    ...blockConditions.map((item) => `- ${item}`),
    '',
    '## Normal Evidence Intake Copy',
    '```text',
    normalEvidenceIntakeCopy,
    '```',
    '',
    '## Install Exclusions',
    '- No W144 adapter update.',
    '- No runner update.',
    '- No SuiteScript deployment update.',
    '- No image lookup change.',
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Trace Samples',
    '- trace_samples/w229_forge_post_install_operator_evidence_intake_trace.json',
    '- data/w229_forge_post_install_operator_evidence_intake_packet.json',
    '',
    '## Visual Testing Decision',
    visualTestingDecision,
    '',
    '## Best Next Codex Prompt',
    'Move through W230: FORGE Post-Install Evidence Review And Targeted Fix Gate. Use W229 operator evidence intake to review any supplied post-install evidence, decide accept / accept with visual follow-up / block install, and only open a targeted fix block when the evidence names a specific FORGE rail, header, close-button, copy-summary, or old-branding issue.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W229 FORGE post-install operator evidence intake: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W229 FORGE post-install operator evidence intake: pass; ${passCount}/${results.length} checks`);
}

main();
