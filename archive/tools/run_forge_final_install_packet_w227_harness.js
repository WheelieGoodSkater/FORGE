const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const manifestPath = path.join(root, 'W226_UPLOAD_MANIFEST.md');
const report226Path = path.join(root, 'reports', 'w226_forge_header_install_cutover_packet.md');
const trace226Path = path.join(root, 'trace_samples', 'w226_forge_header_install_cutover_packet_trace.json');
const data226Path = path.join(root, 'data', 'w226_forge_header_install_cutover_packet.json');
const dataPath = path.join(root, 'data', 'w227_forge_final_install_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w227_forge_final_install_packet_trace.json');
const reportPath = path.join(root, 'reports', 'w227_forge_final_install_packet.md');

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

function fileInfo(file) {
  const stat = fs.statSync(file);
  return {
    path: path.relative(root, file),
    bytes: stat.size,
    present: stat.isFile()
  };
}

function main() {
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w226Data = JSON.parse(fs.readFileSync(data226Path, 'utf8'));
  const cutover = w226Data.cutover;
  const requiredArtifacts = [
    userscriptPath,
    manifestPath,
    report226Path,
    trace226Path,
    data226Path
  ].map(fileInfo);
  const operatorInstallNoteLines = [
    'Update Tampermonkey drawer script only.',
    'Refresh the NetSuite page.',
    'Confirm the FORGE rail button appears.',
    'Confirm the FORGE rail label is not clipped.',
    'Open the drawer.',
    'Confirm the larger FORGE header logo appears.',
    'Narrow or resize the window and confirm the logo does not overlap the close button.',
    'Confirm the close button works.',
    'Confirm Copy operator summary appears in the Trace/import-status surface.'
  ];
  const operatorInstallNote = operatorInstallNoteLines.join('\n');
  const installExclusions = {
    noW144AdapterUpdate: true,
    noRunnerUpdate: true,
    noSuiteScriptDeploymentUpdate: true,
    noImageLookupChange: true
  };
  const forbiddenPattern = /(W144 endpoint|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages)/i;
  const visualTestingDecision = 'No broad visual testing for W227. Optional targeted operator visual check may confirm FORGE logo sizing and rail fit after install only.';
  const finalInstallPacket = {
    schema: 'idb.w227-forge-final-install-packet.v1',
    status: 'forge_final_install_packet_ready',
    artifacts: requiredArtifacts,
    operatorInstallNote,
    installExclusions,
    optionalTargetedVisualCheck: {
      runOnlyIfOperatorWantsLiveVisualConfirmationAfterInstall: true,
      noBroadVisualTesting: true,
      noNetSuiteRecordOpenLinkTesting: true,
      noRunnerInvocation: true,
      noSuiteScriptInvocation: true
    },
    preservedFromW226: {
      responsiveLogoWidthRule: cutover.responsiveLogoPolish.responsiveWidthRule,
      railFontFitCorrection: /font:\s*800 10px\/1 var\(--rw-font-family-body\)/.test(userscript),
      scriptToInstallOrUpdate: cutover.scriptToInstallOrUpdate,
      installGuidance: cutover.installGuidance
    },
    normalOperatorNoteHidesForbiddenTerms: !forbiddenPattern.test(operatorInstallNote),
    visualTestingDecision
  };
  const results = [];

  assertCase(results, 'final_install_packet_includes_expected_w226_artifacts',
    requiredArtifacts.length === 5 && requiredArtifacts.every((item) => item.present && item.bytes > 0),
    requiredArtifacts.map((item) => `${item.path}:${item.bytes}`).join(', '));
  assertCase(results, 'operator_install_note_compact_and_complete',
    operatorInstallNoteLines.length === 9 &&
      /Update Tampermonkey drawer script only/.test(operatorInstallNote) &&
      /FORGE rail label is not clipped/.test(operatorInstallNote) &&
      /larger FORGE header logo/.test(operatorInstallNote) &&
      /does not overlap the close button/.test(operatorInstallNote) &&
      /Copy operator summary/.test(operatorInstallNote),
    operatorInstallNote);
  assertCase(results, 'normal_operator_note_hides_forbidden_internal_terms',
    finalInstallPacket.normalOperatorNoteHidesForbiddenTerms === true,
    operatorInstallNote);
  assertCase(results, 'install_exclusions_remain_explicit',
    installExclusions.noW144AdapterUpdate === true &&
      installExclusions.noRunnerUpdate === true &&
      installExclusions.noSuiteScriptDeploymentUpdate === true &&
      installExclusions.noImageLookupChange === true,
    JSON.stringify(installExclusions));
  assertCase(results, 'w226_responsive_logo_and_rail_font_fit_unchanged',
    /width:\s*min\(420px,\s*calc\(100% - 72px\)\)/.test(userscript) &&
      /max-width:\s*calc\(100% - 72px\)/.test(userscript) &&
      /object-fit:\s*contain/.test(userscript) &&
      /font:\s*800 10px\/1 var\(--rw-font-family-body\)/.test(userscript),
    finalInstallPacket.preservedFromW226.responsiveLogoWidthRule);
  assertCase(results, 'optional_visual_check_is_targeted_only',
    finalInstallPacket.optionalTargetedVisualCheck.runOnlyIfOperatorWantsLiveVisualConfirmationAfterInstall === true &&
      finalInstallPacket.optionalTargetedVisualCheck.noBroadVisualTesting === true &&
      finalInstallPacket.optionalTargetedVisualCheck.noNetSuiteRecordOpenLinkTesting === true &&
      finalInstallPacket.optionalTargetedVisualCheck.noRunnerInvocation === true &&
      finalInstallPacket.optionalTargetedVisualCheck.noSuiteScriptInvocation === true,
    JSON.stringify(finalInstallPacket.optionalTargetedVisualCheck));
  assertCase(results, 'w214_to_w226_boundaries_remain_in_cutover_data',
    cutover.noRegressionBoundarySummary.w151ImportGuardPreserved === true &&
      cutover.noRegressionBoundarySummary.semanticRoleMappingPreserved === true &&
      cutover.noRegressionBoundarySummary.modeAwareNamingGuardrailsPreserved === true &&
      cutover.noRegressionBoundarySummary.forgeBrandingPreserved === true &&
      cutover.noRegressionBoundarySummary.targetedLiveHeaderSmokePreserved === true &&
      cutover.noRegressionBoundarySummary.noDrawerCreatedRecords === true &&
      cutover.noRegressionBoundarySummary.noDrawerTransactionWrites === true &&
      cutover.noRegressionBoundarySummary.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      cutover.noRegressionBoundarySummary.runnerOwnsGeneratedRecords === true &&
      cutover.noRegressionBoundarySummary.imageLookupDisabledByDefault === true &&
      cutover.noRegressionBoundarySummary.nllmAdvisoryOnly === true,
    JSON.stringify(cutover.noRegressionBoundarySummary));

  const passCount = results.filter((item) => item.pass).length;
  const harnessSummary = {
    schema: 'idb.w227-forge-final-install-packet-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    finalInstallPacket
  };
  const trace = {
    schema: 'idb.w227-forge-final-install-packet-trace.v1',
    artifacts: requiredArtifacts,
    operatorInstallNoteLines,
    installExclusions,
    optionalTargetedVisualCheck: finalInstallPacket.optionalTargetedVisualCheck,
    visualTestingDecision
  };
  writeJson(dataPath, harnessSummary);
  writeJson(tracePath, trace);
  const report = [
    '# W227 FORGE Install Packet Final Packaging',
    '',
    `Status: ${harnessSummary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Final FORGE Install Packet',
    ...requiredArtifacts.map((item) => `- ${item.path} (${item.bytes} bytes)`),
    '',
    '## Compact Operator Install Note',
    '```text',
    operatorInstallNote,
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
    '- trace_samples/w227_forge_final_install_packet_trace.json',
    '- data/w227_forge_final_install_packet.json',
    '',
    '## Visual Testing Decision',
    visualTestingDecision,
    '',
    '## Best Next Codex Prompt',
    'Move through W228: Post-Install FORGE Operator Acceptance Packet. Use W227 final install packet to create a short acceptance checklist for the operator after they install the Tampermonkey script, keeping visual checks targeted and preserving all no-write/import boundaries.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W227 FORGE final install packet: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W227 FORGE final install packet: pass; ${passCount}/${results.length} checks`);
}

main();
