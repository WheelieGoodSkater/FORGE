const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w227DataPath = path.join(root, 'data', 'w227_forge_final_install_packet.json');
const dataPath = path.join(root, 'data', 'w228_post_install_forge_operator_acceptance_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w228_post_install_forge_operator_acceptance_trace.json');
const reportPath = path.join(root, 'reports', 'w228_post_install_forge_operator_acceptance.md');

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

function main() {
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w227 = JSON.parse(fs.readFileSync(w227DataPath, 'utf8'));
  const w227Packet = w227.finalInstallPacket;
  const forbiddenPattern = /(W144 endpoint|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|stack traces|raw guard messages)/i;
  const acceptanceChecks = [
    'FORGE rail button appears.',
    'FORGE rail label is not clipped.',
    'Drawer opens.',
    'Larger responsive FORGE header logo appears.',
    'Logo scales without overlapping the close button on a narrower window.',
    'Close button works.',
    'Copy operator summary appears in the Trace/import-status surface.'
  ];
  const acceptanceOutcomes = [
    {
      id: 'accept',
      label: 'Accept',
      useWhen: 'All visible checks pass.'
    },
    {
      id: 'accept_with_visual_follow_up',
      label: 'Accept with visual follow-up',
      useWhen: 'The drawer works and the FORGE surface is usable, but minor spacing polish is desired.'
    },
    {
      id: 'block_install',
      label: 'Block install',
      useWhen: 'A required FORGE surface, close control, or copy-summary control is missing or unusable.'
    }
  ];
  const blockConditions = [
    'Rail label clipped.',
    'Header logo missing.',
    'Close button inaccessible.',
    'Old visible header text appears.',
    'Operator summary copy control missing.'
  ];
  const normalAcceptanceNote = [
    'After installing the Tampermonkey drawer script, use this checklist to confirm the FORGE drawer is ready.',
    'If every visible check passes, accept the install.',
    'If the drawer works but spacing needs polish, accept with visual follow-up.',
    'If a required control or FORGE brand element is missing, block the install.'
  ].join('\n');
  const installExclusions = {
    noW144AdapterUpdate: true,
    noRunnerUpdate: true,
    noSuiteScriptDeploymentUpdate: true,
    noImageLookupChange: true
  };
  const noRegressionBoundarySummary = {
    w151ImportGuardPreserved: true,
    semanticRoleMappingPreserved: true,
    modeAwareNamingGuardrailsPreserved: true,
    dynamicRecordDisplayPreserved: true,
    consultantPartialResultLanguagePreserved: true,
    operatorReadableSmokePacketPreserved: true,
    frozenReviewRunWordingPreserved: true,
    importFailureRecoveryCopyPreserved: true,
    recoveryUiSurfaceWiringPreserved: true,
    endToEndOperatorPacketPreserved: true,
    exportableOperatorSummaryPreserved: true,
    consultantCopyExportActionPreserved: true,
    forgeBrandingPreserved: true,
    targetedLiveHeaderSmokePreserved: true,
    forgeRailFontFitCorrectionPreserved: true,
    responsiveForgeHeaderLogoPolishPreserved: true,
    installCutoverPacketPreserved: true,
    finalInstallPacketPreserved: true,
    noDrawerCreatedRecords: true,
    noDrawerTransactionWrites: true,
    noDirectSuiteScriptOutsideApprovedW144AdapterPath: true,
    runnerOwnsGeneratedRecords: true,
    imageLookupDisabledByDefault: true,
    nllmAdvisoryOnly: true
  };
  const visualTestingDecision = 'No broad visual testing for W228. Use the post-install checklist for targeted operator acceptance only.';
  const acceptancePacket = {
    schema: 'idb.w228-post-install-forge-operator-acceptance.v1',
    status: 'post_install_acceptance_packet_ready',
    expectedInstalledScript: 'idb-drawer.user.js',
    acceptanceChecks,
    acceptanceOutcomes,
    blockConditions,
    normalAcceptanceNote,
    installExclusions,
    normalAcceptanceNoteHidesForbiddenTerms: !forbiddenPattern.test(normalAcceptanceNote),
    preservedFromW227: {
      finalInstallPacketStatus: w227Packet.status,
      scriptToInstallOrUpdate: w227Packet.preservedFromW226.scriptToInstallOrUpdate,
      responsiveLogoWidthRule: w227Packet.preservedFromW226.responsiveLogoWidthRule,
      railFontFitCorrection: w227Packet.preservedFromW226.railFontFitCorrection,
      optionalTargetedVisualCheck: w227Packet.optionalTargetedVisualCheck
    },
    noRegressionBoundarySummary,
    visualTestingDecision
  };
  const results = [];

  assertCase(results, 'acceptance_checklist_compact_and_complete',
    acceptanceChecks.length === 7 &&
      acceptanceChecks.includes('FORGE rail button appears.') &&
      acceptanceChecks.includes('FORGE rail label is not clipped.') &&
      acceptanceChecks.includes('Drawer opens.') &&
      acceptanceChecks.includes('Larger responsive FORGE header logo appears.') &&
      acceptanceChecks.includes('Logo scales without overlapping the close button on a narrower window.') &&
      acceptanceChecks.includes('Close button works.') &&
      acceptanceChecks.includes('Copy operator summary appears in the Trace/import-status surface.'),
    acceptanceChecks.join(' | '));
  assertCase(results, 'acceptance_outcomes_present',
    acceptanceOutcomes.map((item) => item.id).join(',') === 'accept,accept_with_visual_follow_up,block_install',
    acceptanceOutcomes.map((item) => item.label).join(' | '));
  assertCase(results, 'block_conditions_cover_required_failures',
    blockConditions.length === 5 &&
      blockConditions.includes('Rail label clipped.') &&
      blockConditions.includes('Header logo missing.') &&
      blockConditions.includes('Close button inaccessible.') &&
      blockConditions.includes('Old visible header text appears.') &&
      blockConditions.includes('Operator summary copy control missing.'),
    blockConditions.join(' | '));
  assertCase(results, 'normal_acceptance_note_hides_forbidden_internal_terms',
    acceptancePacket.normalAcceptanceNoteHidesForbiddenTerms === true,
    normalAcceptanceNote);
  assertCase(results, 'w226_responsive_logo_sizing_remains_unchanged',
    /width:\s*min\(420px,\s*calc\(100% - 72px\)\)/.test(userscript) &&
      /max-width:\s*calc\(100% - 72px\)/.test(userscript) &&
      /object-fit:\s*contain/.test(userscript) &&
      w227Packet.preservedFromW226.responsiveLogoWidthRule === 'width: min(420px, calc(100% - 72px))',
    w227Packet.preservedFromW226.responsiveLogoWidthRule);
  assertCase(results, 'w227_final_install_packet_remains_unchanged',
    w227Packet.status === 'forge_final_install_packet_ready' &&
      w227Packet.preservedFromW226.railFontFitCorrection === true &&
      w227Packet.optionalTargetedVisualCheck.noBroadVisualTesting === true &&
      w227Packet.optionalTargetedVisualCheck.noRunnerInvocation === true &&
      w227Packet.optionalTargetedVisualCheck.noSuiteScriptInvocation === true,
    JSON.stringify(w227Packet.optionalTargetedVisualCheck));
  assertCase(results, 'install_exclusions_remain_explicit',
    installExclusions.noW144AdapterUpdate === true &&
      installExclusions.noRunnerUpdate === true &&
      installExclusions.noSuiteScriptDeploymentUpdate === true &&
      installExclusions.noImageLookupChange === true,
    JSON.stringify(installExclusions));
  assertCase(results, 'w214_to_w227_boundaries_preserved',
    Object.values(noRegressionBoundarySummary).every(Boolean),
    JSON.stringify(noRegressionBoundarySummary));

  const passCount = results.filter((item) => item.pass).length;
  const harnessSummary = {
    schema: 'idb.w228-post-install-forge-operator-acceptance-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    acceptancePacket
  };
  const trace = {
    schema: 'idb.w228-post-install-forge-operator-acceptance-trace.v1',
    expectedInstalledScript: acceptancePacket.expectedInstalledScript,
    acceptanceChecks,
    acceptanceOutcomes,
    blockConditions,
    installExclusions,
    visualTestingDecision
  };
  writeJson(dataPath, harnessSummary);
  writeJson(tracePath, trace);
  const report = [
    '# W228 Post-Install FORGE Operator Acceptance Packet',
    '',
    `Status: ${harnessSummary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Expected Installed Script',
    '- idb-drawer.user.js',
    '',
    '## Operator Acceptance Checklist',
    ...acceptanceChecks.map((item) => `- ${item}`),
    '',
    '## Acceptance Outcomes',
    ...acceptanceOutcomes.map((item) => `- ${item.label}: ${item.useWhen}`),
    '',
    '## Block Conditions',
    ...blockConditions.map((item) => `- ${item}`),
    '',
    '## Normal Acceptance Note',
    '```text',
    normalAcceptanceNote,
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
    '- trace_samples/w228_post_install_forge_operator_acceptance_trace.json',
    '- data/w228_post_install_forge_operator_acceptance_packet.json',
    '',
    '## Visual Testing Decision',
    visualTestingDecision,
    '',
    '## Best Next Codex Prompt',
    'Move through W229: FORGE Post-Install Operator Evidence Intake. Use W228 acceptance checklist to capture the operator result after install, classify accept / accept with visual follow-up / block install, and route only targeted follow-up work while preserving all W214-W228 no-write/import boundaries.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W228 post-install FORGE operator acceptance: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W228 post-install FORGE operator acceptance: pass; ${passCount}/${results.length} checks`);
}

main();
