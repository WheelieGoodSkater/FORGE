const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const w230DataPath = path.join(root, 'data', 'w230_forge_post_install_evidence_review_fix_gate_packet.json');
const dataPath = path.join(root, 'data', 'w231_forge_post_install_acceptance_closeout_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w231_forge_post_install_acceptance_closeout_trace.json');
const reportPath = path.join(root, 'reports', 'w231_forge_post_install_acceptance_closeout.md');

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
  const w230 = JSON.parse(fs.readFileSync(w230DataPath, 'utf8'));
  const reviewPacket = w230.reviewPacket;
  const forbiddenPattern = /(W144 endpoint|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|stack traces|raw guard messages)/i;
  const acceptedEvidenceSource = [
    'W230 evidence review outcome.',
    'W229 operator evidence intake fields.',
    'Optional screenshot/reference note.'
  ];
  const closeoutDispositions = [
    {
      id: 'install_accepted',
      label: 'Install accepted',
      nextActions: [
        'Keep current Tampermonkey drawer script installed.',
        'No further action required.'
      ]
    },
    {
      id: 'install_accepted_with_visual_follow_up',
      label: 'Install accepted with visual follow-up',
      nextActions: [
        'Keep current Tampermonkey drawer script installed.',
        'Open only the named visual follow-up.'
      ]
    },
    {
      id: 'install_blocked',
      label: 'Install blocked',
      nextActions: [
        'Do not treat install as accepted.',
        'Open only the named blocked-install fix.'
      ]
    }
  ];
  const blockedInstallFixCategories = [
    'Rail button missing.',
    'Drawer does not open.',
    'Header logo missing.',
    'Close button inaccessible.',
    'Old visible header text appears.',
    'Operator summary copy control missing.'
  ];
  const visualFollowUpCategories = [
    'Rail label fit polish.',
    'Header logo sizing polish.'
  ];
  const normalCloseoutCopy = [
    'Record the final FORGE install disposition after reviewing the evidence.',
    'If accepted, keep the current Tampermonkey drawer script installed.',
    'If accepted with visual follow-up or blocked, open only the named follow-up or fix.'
  ].join('\n');
  const installExclusions = {
    noW144AdapterUpdate: true,
    noRunnerUpdate: true,
    noSuiteScriptDeploymentUpdate: true,
    noImageLookupChange: true
  };
  const noRegressionBoundarySummary = Object.assign({}, reviewPacket.noRegressionBoundarySummary, {
    evidenceReviewAndTargetedFixGatePreserved: true
  });
  const visualTestingDecision = 'No broad visual testing for W231. Closeout records the final disposition from W230 evidence review only.';
  const closeoutPacket = {
    schema: 'idb.w231-forge-post-install-acceptance-closeout.v1',
    status: 'post_install_acceptance_closeout_ready',
    expectedInstalledScript: 'idb-drawer.user.js',
    acceptedEvidenceSource,
    closeoutDispositions,
    blockedInstallFixCategories,
    visualFollowUpCategories,
    normalCloseoutCopy,
    normalCloseoutCopyHidesForbiddenTerms: !forbiddenPattern.test(normalCloseoutCopy),
    installExclusions,
    noRegressionBoundarySummary,
    preservedFromW230: {
      reviewPacketStatus: reviewPacket.status,
      reviewOutcomes: reviewPacket.reviewOutcomes.map((item) => item.id),
      blockedInstallConditions: reviewPacket.blockedInstallConditions,
      fixGateRouting: reviewPacket.fixGateRouting.map((item) => item.id)
    },
    visualTestingDecision
  };
  const results = [];

  assertCase(results, 'closeout_dispositions_present',
    closeoutDispositions.map((item) => item.id).join(',') === 'install_accepted,install_accepted_with_visual_follow_up,install_blocked',
    closeoutDispositions.map((item) => item.label).join(' | '));
  assertCase(results, 'closeout_next_actions_exact_and_compact',
    JSON.stringify(closeoutDispositions[0].nextActions) === JSON.stringify([
      'Keep current Tampermonkey drawer script installed.',
      'No further action required.'
    ]) &&
      JSON.stringify(closeoutDispositions[1].nextActions) === JSON.stringify([
        'Keep current Tampermonkey drawer script installed.',
        'Open only the named visual follow-up.'
      ]) &&
      JSON.stringify(closeoutDispositions[2].nextActions) === JSON.stringify([
        'Do not treat install as accepted.',
        'Open only the named blocked-install fix.'
      ]),
    closeoutDispositions.map((item) => `${item.label}: ${item.nextActions.join(' / ')}`).join(' | '));
  assertCase(results, 'blocked_install_fix_categories_limited_to_w230_blocked_conditions',
    JSON.stringify(blockedInstallFixCategories) === JSON.stringify(reviewPacket.blockedInstallConditions),
    blockedInstallFixCategories.join(' | '));
  assertCase(results, 'visual_follow_up_categories_limited_to_rail_and_header',
    JSON.stringify(visualFollowUpCategories) === JSON.stringify([
      'Rail label fit polish.',
      'Header logo sizing polish.'
    ]),
    visualFollowUpCategories.join(' | '));
  assertCase(results, 'closeout_copy_hides_forbidden_internal_terms',
    closeoutPacket.normalCloseoutCopyHidesForbiddenTerms === true,
    normalCloseoutCopy);
  assertCase(results, 'w230_review_packet_remains_unchanged',
    reviewPacket.status === 'post_install_evidence_review_fix_gate_ready' &&
      reviewPacket.expectedInstalledScript === 'idb-drawer.user.js' &&
      reviewPacket.reviewOutcomes.map((item) => item.id).join(',') === 'accept,accept_with_visual_follow_up,block_install' &&
      reviewPacket.fixGateRouting.length === 5,
    reviewPacket.status);
  assertCase(results, 'install_exclusions_remain_explicit',
    installExclusions.noW144AdapterUpdate === true &&
      installExclusions.noRunnerUpdate === true &&
      installExclusions.noSuiteScriptDeploymentUpdate === true &&
      installExclusions.noImageLookupChange === true,
    JSON.stringify(installExclusions));
  assertCase(results, 'w214_to_w230_boundaries_preserved',
    Object.values(noRegressionBoundarySummary).every(Boolean),
    JSON.stringify(noRegressionBoundarySummary));

  const passCount = results.filter((item) => item.pass).length;
  const harnessSummary = {
    schema: 'idb.w231-forge-post-install-acceptance-closeout-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    closeoutPacket
  };
  const trace = {
    schema: 'idb.w231-forge-post-install-acceptance-closeout-trace.v1',
    expectedInstalledScript: closeoutPacket.expectedInstalledScript,
    acceptedEvidenceSource,
    closeoutDispositions,
    blockedInstallFixCategories,
    visualFollowUpCategories,
    visualTestingDecision
  };
  writeJson(dataPath, harnessSummary);
  writeJson(tracePath, trace);
  const report = [
    '# W231 FORGE Post-Install Acceptance Closeout Packet',
    '',
    `Status: ${harnessSummary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Expected Installed Script',
    '- idb-drawer.user.js',
    '',
    '## Accepted Evidence Source',
    ...acceptedEvidenceSource.map((item) => `- ${item}`),
    '',
    '## Closeout Dispositions',
    ...closeoutDispositions.map((item) => `- ${item.label}: ${item.nextActions.join(' ')}`),
    '',
    '## Blocked-Install Fix Categories',
    ...blockedInstallFixCategories.map((item) => `- ${item}`),
    '',
    '## Visual-Follow-Up Categories',
    ...visualFollowUpCategories.map((item) => `- ${item}`),
    '',
    '## Normal Closeout Copy',
    '```text',
    normalCloseoutCopy,
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
    '- trace_samples/w231_forge_post_install_acceptance_closeout_trace.json',
    '- data/w231_forge_post_install_acceptance_closeout_packet.json',
    '',
    '## Visual Testing Decision',
    visualTestingDecision,
    '',
    '## Best Next Codex Prompt',
    'Move through W232: FORGE Install Acceptance Archive And Restart Handoff. Use W231 closeout packet to create a compact archive/restart handoff for the FORGE install acceptance state, including artifact paths, validation status, and the next targeted action only if the install is accepted with follow-up or blocked.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W231 FORGE post-install acceptance closeout: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W231 FORGE post-install acceptance closeout: pass; ${passCount}/${results.length} checks`);
}

main();
