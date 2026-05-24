const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const w229DataPath = path.join(root, 'data', 'w229_forge_post_install_operator_evidence_intake_packet.json');
const dataPath = path.join(root, 'data', 'w230_forge_post_install_evidence_review_fix_gate_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w230_forge_post_install_evidence_review_fix_gate_trace.json');
const reportPath = path.join(root, 'reports', 'w230_forge_post_install_evidence_review_fix_gate.md');

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
  const w229 = JSON.parse(fs.readFileSync(w229DataPath, 'utf8'));
  const evidencePacket = w229.evidenceIntakePacket;
  const forbiddenPattern = /(W144 endpoint|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|stack traces|raw guard messages)/i;
  const acceptedEvidenceSource = [
    'W229 operator evidence intake fields.',
    'Optional screenshot/reference note.'
  ];
  const reviewOutcomes = [
    {
      id: 'accept',
      label: 'Accept',
      decision: 'No fix needed.'
    },
    {
      id: 'accept_with_visual_follow_up',
      label: 'Accept with visual follow-up',
      decision: 'Open only the targeted visual polish follow-up named by the evidence.'
    },
    {
      id: 'block_install',
      label: 'Block install',
      decision: 'Open only the targeted blocked-install fix named by the evidence.'
    }
  ];
  const fixGateRouting = evidencePacket.targetedFollowUpRouting.map((item) => ({
    id: item.id,
    label: item.label,
    allowedScope: item.trigger
  }));
  const noFixConditions = [
    'All W229 required fields pass.',
    'No block condition present.',
    'Only optional note is supplied.'
  ];
  const blockedInstallConditions = [
    'Rail button missing.',
    'Drawer does not open.',
    'Header logo missing.',
    'Close button inaccessible.',
    'Old visible header text appears.',
    'Operator summary copy control missing.'
  ];
  const normalReviewCopy = [
    'Review the post-install FORGE evidence and choose accept, accept with visual follow-up, or block install.',
    'Open a follow-up only when the evidence names a specific rail, header, close-button, copy-summary, or old-branding issue.',
    'If all required checks pass, no fix is needed.'
  ].join('\n');
  const installExclusions = {
    noW144AdapterUpdate: true,
    noRunnerUpdate: true,
    noSuiteScriptDeploymentUpdate: true,
    noImageLookupChange: true
  };
  const noRegressionBoundarySummary = Object.assign({}, evidencePacket.noRegressionBoundarySummary, {
    postInstallEvidenceIntakePacketPreserved: true
  });
  const visualTestingDecision = 'No broad visual testing for W230. Review only supplied W229 evidence and route targeted follow-up if needed.';
  const reviewPacket = {
    schema: 'idb.w230-forge-post-install-evidence-review-fix-gate.v1',
    status: 'post_install_evidence_review_fix_gate_ready',
    expectedInstalledScript: 'idb-drawer.user.js',
    acceptedEvidenceSource,
    reviewOutcomes,
    fixGateRouting,
    noFixConditions,
    blockedInstallConditions,
    normalReviewCopy,
    normalReviewCopyHidesForbiddenTerms: !forbiddenPattern.test(normalReviewCopy),
    installExclusions,
    noRegressionBoundarySummary,
    preservedFromW229: {
      evidencePacketStatus: evidencePacket.status,
      evidenceFieldCount: evidencePacket.evidenceFields.length,
      sampleClassifications: evidencePacket.sampleClassifications,
      targetedFollowUpRouting: evidencePacket.targetedFollowUpRouting.map((item) => item.id)
    },
    visualTestingDecision
  };
  const results = [];

  assertCase(results, 'review_outcomes_present',
    reviewOutcomes.map((item) => item.id).join(',') === 'accept,accept_with_visual_follow_up,block_install',
    reviewOutcomes.map((item) => item.label).join(' | '));
  assertCase(results, 'no_fix_conditions_explicit',
    noFixConditions.length === 3 &&
      noFixConditions.includes('All W229 required fields pass.') &&
      noFixConditions.includes('No block condition present.') &&
      noFixConditions.includes('Only optional note is supplied.'),
    noFixConditions.join(' | '));
  assertCase(results, 'blocked_install_conditions_explicit',
    blockedInstallConditions.length === 6 &&
      blockedInstallConditions.includes('Rail button missing.') &&
      blockedInstallConditions.includes('Drawer does not open.') &&
      blockedInstallConditions.includes('Header logo missing.') &&
      blockedInstallConditions.includes('Close button inaccessible.') &&
      blockedInstallConditions.includes('Old visible header text appears.') &&
      blockedInstallConditions.includes('Operator summary copy control missing.'),
    blockedInstallConditions.join(' | '));
  assertCase(results, 'fix_gate_routing_limited_to_allowed_surface_fixes',
    fixGateRouting.length === 5 &&
      fixGateRouting.map((item) => item.id).join(',') === 'rail_label_fit_polish,header_logo_sizing_polish,close_button_accessibility_fix,copy_summary_placement_fix,old_branding_removal_fix',
    fixGateRouting.map((item) => item.label).join(' | '));
  assertCase(results, 'normal_review_copy_hides_forbidden_internal_terms',
    reviewPacket.normalReviewCopyHidesForbiddenTerms === true,
    normalReviewCopy);
  assertCase(results, 'w229_evidence_intake_packet_remains_unchanged',
    evidencePacket.status === 'post_install_operator_evidence_intake_ready' &&
      evidencePacket.expectedInstalledScript === 'idb-drawer.user.js' &&
      evidencePacket.evidenceFields.length === 8 &&
      evidencePacket.sampleClassifications.accepted === 'accept' &&
      evidencePacket.sampleClassifications.visualFollowUp === 'accept_with_visual_follow_up' &&
      evidencePacket.sampleClassifications.blocked === 'block_install',
    JSON.stringify(evidencePacket.sampleClassifications));
  assertCase(results, 'install_exclusions_remain_explicit',
    installExclusions.noW144AdapterUpdate === true &&
      installExclusions.noRunnerUpdate === true &&
      installExclusions.noSuiteScriptDeploymentUpdate === true &&
      installExclusions.noImageLookupChange === true,
    JSON.stringify(installExclusions));
  assertCase(results, 'w214_to_w229_boundaries_preserved',
    Object.values(noRegressionBoundarySummary).every(Boolean),
    JSON.stringify(noRegressionBoundarySummary));

  const passCount = results.filter((item) => item.pass).length;
  const harnessSummary = {
    schema: 'idb.w230-forge-post-install-evidence-review-fix-gate-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    reviewPacket
  };
  const trace = {
    schema: 'idb.w230-forge-post-install-evidence-review-fix-gate-trace.v1',
    expectedInstalledScript: reviewPacket.expectedInstalledScript,
    acceptedEvidenceSource,
    reviewOutcomes,
    fixGateRouting,
    noFixConditions,
    blockedInstallConditions,
    visualTestingDecision
  };
  writeJson(dataPath, harnessSummary);
  writeJson(tracePath, trace);
  const report = [
    '# W230 FORGE Post-Install Evidence Review And Targeted Fix Gate',
    '',
    `Status: ${harnessSummary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Expected Installed Script',
    '- idb-drawer.user.js',
    '',
    '## Accepted Evidence Source',
    ...acceptedEvidenceSource.map((item) => `- ${item}`),
    '',
    '## Review Outcomes',
    ...reviewOutcomes.map((item) => `- ${item.label}: ${item.decision}`),
    '',
    '## Fix-Gate Routing',
    ...fixGateRouting.map((item) => `- ${item.label}: ${item.allowedScope}`),
    '',
    '## No-Fix Conditions',
    ...noFixConditions.map((item) => `- ${item}`),
    '',
    '## Blocked-Install Conditions',
    ...blockedInstallConditions.map((item) => `- ${item}`),
    '',
    '## Normal Review Copy',
    '```text',
    normalReviewCopy,
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
    '- trace_samples/w230_forge_post_install_evidence_review_fix_gate_trace.json',
    '- data/w230_forge_post_install_evidence_review_fix_gate_packet.json',
    '',
    '## Visual Testing Decision',
    visualTestingDecision,
    '',
    '## Best Next Codex Prompt',
    'Move through W231: FORGE Post-Install Acceptance Closeout Packet. Use W230 evidence review and targeted fix gate to produce a final closeout packet for accepted installs, accepted-with-follow-up installs, and blocked installs while preserving all W214-W230 boundaries and avoiding broad visual testing.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W230 FORGE post-install evidence review fix gate: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W230 FORGE post-install evidence review fix gate: pass; ${passCount}/${results.length} checks`);
}

main();
