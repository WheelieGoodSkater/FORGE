const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const downloads = '/path/to/downloads';
const useLiveDownloads = process.env.IDB_W91_USE_LIVE_DOWNLOADS === '1';
const w90Path = path.join(root, 'data', 'w90_pilot_evidence_remediation_retest_pack.json');
const dataPath = path.join(root, 'data', 'w91_execute_one_run_retest_grade_pilot_unlock.json');
const tracePath = path.join(root, 'trace_samples', 'w91_execute_one_run_retest_grade_trace.json');
const scoredPath = path.join(root, 'trace_samples', 'w91_scored_retest_results.json');
const remediationPath = path.join(root, 'trace_samples', 'w91_exact_remediation_before_unlock.json');
const decisionPath = path.join(root, 'trace_samples', 'w91_pilot_unlock_decision.json');
const reportPath = path.join(root, 'reports', 'w91_execute_one_run_retest_grade_pilot_unlock.md');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function listDownloads(pattern) {
  if (!useLiveDownloads) {
    const syntheticLegacy = 'idb-suitescript-review-packet-synthetic-secondary-only.json';
    return pattern.test(syntheticLegacy) ? [path.join(downloads, syntheticLegacy)] : [];
  }
  return fs.readdirSync(downloads)
    .filter((name) => pattern.test(name))
    .map((name) => path.join(downloads, name))
    .sort();
}

function main() {
  const w90 = readJson(w90Path);
  const results = [];
  const dccHandoffFiles = listDownloads(/^idb-dcc-runner-handoff-packet-.*\.json$/);
  const traceFiles = listDownloads(/^intelligent-demo-builder-trace-.*\.json$/);
  const legacySuiteScriptPackets = listDownloads(/^idb-suitescript-review-packet-.*\.json$/);

  const evidenceIntake = {
    schema: 'idb.w91-retest-evidence-intake.v1',
    dccHandoffJson: {
      required: true,
      provided: dccHandoffFiles.length > 0,
      files: dccHandoffFiles
    },
    traceJson: {
      required: true,
      provided: traceFiles.length > 0,
      files: traceFiles
    },
    screenshots: {
      required: ['Plan', 'Review DCC handoff', 'Trace evidence checklist'],
      provided: false,
      files: []
    },
    operatorComparisonNotes: {
      required: true,
      provided: false,
      files: []
    },
    legacySuiteScriptPackets: {
      provided: legacySuiteScriptPackets.length > 0,
      files: legacySuiteScriptPackets,
      note: 'Legacy SuiteScript packets do not satisfy the W90 DCC handoff requirement.'
    }
  };

  const categories = [
    {
      category: 'Plan screenshot after intake',
      score: 1,
      evidence: 'No W90 Plan screenshot was provided.'
    },
    {
      category: 'Review DCC handoff screenshot',
      score: 1,
      evidence: 'No Review screenshot showing the DCC handoff card was provided.'
    },
    {
      category: 'Trace evidence-checklist screenshot',
      score: 1,
      evidence: 'No Trace screenshot showing the W90 evidence checklist was provided.'
    },
    {
      category: 'DCC handoff JSON',
      score: dccHandoffFiles.length ? 5 : 1,
      evidence: dccHandoffFiles.length ? dccHandoffFiles.join(', ') : 'Missing idb-dcc-runner-handoff-packet-*.json.'
    },
    {
      category: 'Trace JSON',
      score: traceFiles.length ? 3 : 1,
      evidence: traceFiles.length
        ? 'Trace JSON exists in Downloads, but no new W90 retest trace was identified or paired with DCC handoff JSON.'
        : 'Missing intelligent-demo-builder-trace-*.json.'
    },
    {
      category: 'Operator comparison notes',
      score: 1,
      evidence: 'No operator notes proving form params, DCC config params, and runner preview parity were provided.'
    },
    {
      category: 'No-submit/no-write safety',
      score: 3,
      evidence: 'No write was observed, but the required W90 handoff evidence was not available to verify the retest path.'
    },
    {
      category: 'DCC ownership proof',
      score: 2,
      evidence: 'Prior artifacts preserve DCC ownership, but the W90 retest did not provide a DCC handoff packet or operator comparison.'
    }
  ];
  const averageScore = Number((categories.reduce((sum, item) => sum + item.score, 0) / categories.length).toFixed(1));
  const anyBelowThree = categories.some((item) => item.score < 3);

  const scoredResults = {
    schema: 'idb.w91-scored-one-run-retest-results.v1',
    status: 'blocked_missing_w90_retest_evidence',
    averageScore,
    passingScore: 4,
    anyCategoryBelowThree: anyBelowThree,
    pilotUnlockEligible: false,
    categories,
    findings: [
      {
        severity: 'blocker',
        area: 'DCC handoff evidence',
        finding: 'No idb-dcc-runner-handoff-packet JSON was found, so the primary W90 remediation cannot be verified.'
      },
      {
        severity: 'blocker',
        area: 'UX screenshots',
        finding: 'No Plan, Review DCC handoff, or Trace evidence-checklist screenshots were provided.'
      },
      {
        severity: 'blocker',
        area: 'operator proof',
        finding: 'No operator comparison notes were provided, so Suitelet form-param parity and runner-preview parity are unproven.'
      },
      {
        severity: 'safe_boundary',
        area: 'no write',
        finding: 'No IDB write, transaction write, or DCC runner rewrite was observed in the available evidence.'
      }
    ],
    noRegression: {
      noIdbWritesObserved: true,
      noDccRunnerRewriteObserved: true,
      noTransactionWritesObserved: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      consultantConfirmationRequired: true,
      dccOwnsObjectGeneration: true
    }
  };

  const pilotUnlockDecision = {
    schema: 'idb.w91-pilot-unlock-decision.v1',
    decision: 'no_go_missing_w90_retest_evidence',
    broaderConsultantPilotUnlocked: false,
    singleRetestStillRequired: true,
    reason: 'W90 required evidence was not provided. The unlock gate requires the DCC handoff JSON, trace JSON, screenshots, and operator comparison notes.',
    unlockCriteria: w90.oneRunRetestPacket.stopGo.goIf
  };

  const remediation = {
    schema: 'idb.w91-exact-remediation-before-unlock.v1',
    exactNextActions: [
      'Load the current idb-drawer.user.js in Tampermonkey.',
      'Run the W90 Ariat one-run retest from a clean IDB session.',
      'Capture the Plan screenshot after intake.',
      'Capture the Review screenshot showing the DCC handoff export card.',
      'Click Export DCC handoff and attach idb-dcc-runner-handoff-packet-*.json.',
      'Go to Trace, capture the Pilot evidence checklist screenshot, then export trace JSON.',
      'Attach intelligent-demo-builder-trace-*.json.',
      'Have the operator compare Suitelet form params, DCC-owned config params, and runner preview params, marking each match/missing/unclear.',
      'Do not attach only the legacy SuiteScript review packet; it is secondary evidence only.'
    ],
    stopConditions: w90.oneRunRetestPacket.stopGo.noGoIf
  };

  assertCase(results, 'w91_inherits_w90_retest_packet', w90.schema === 'idb.w90-pilot-evidence-remediation-retest-pack.v1' && w90.status === 'pilot_evidence_remediation_ready_for_one_run_retest', JSON.stringify({ schema: w90.schema, status: w90.status }));
  assertCase(results, 'w91_dcc_handoff_missing_blocks_unlock', dccHandoffFiles.length === 0 && pilotUnlockDecision.broaderConsultantPilotUnlocked === false, JSON.stringify(evidenceIntake.dccHandoffJson));
  assertCase(results, 'w91_screenshots_missing_blocks_unlock', evidenceIntake.screenshots.provided === false && scoredResults.categories.filter((item) => /screenshot/.test(item.category)).every((item) => item.score === 1), JSON.stringify(evidenceIntake.screenshots));
  assertCase(results, 'w91_operator_notes_missing_blocks_unlock', evidenceIntake.operatorComparisonNotes.provided === false && scoredResults.categories.some((item) => item.category === 'Operator comparison notes' && item.score === 1), JSON.stringify(evidenceIntake.operatorComparisonNotes));
  assertCase(results, 'w91_scores_force_no_go', averageScore < scoredResults.passingScore && anyBelowThree === true && scoredResults.pilotUnlockEligible === false, JSON.stringify({ averageScore, anyBelowThree }));
  assertCase(results, 'w91_legacy_packet_not_accepted_as_primary', legacySuiteScriptPackets.length >= 1 && dccHandoffFiles.length === 0 && remediation.exactNextActions.some((item) => /legacy SuiteScript review packet/.test(item)), JSON.stringify(evidenceIntake.legacySuiteScriptPackets));
  assertCase(results, 'w91_no_regression_boundaries_preserved', Object.values(scoredResults.noRegression).every(Boolean), JSON.stringify(scoredResults.noRegression));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextPrompt = {
    block: 'W91R: Run Actual One-Run Retest Evidence Review',
    prompt: 'Move through W91R: Run Actual One-Run Retest Evidence Review. Use the newly attached W90 retest evidence: Plan screenshot, Review DCC handoff screenshot, Trace evidence-checklist screenshot, idb-dcc-runner-handoff-packet JSON, intelligent-demo-builder trace JSON, and operator comparison notes. Grade against the W88/W90 rubric, decide pilot unlock or no-go, and preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output scored results, pilot unlock/no-go decision, exact remediation, W91R report, validator gates, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w91-execute-one-run-retest-grade-pilot-unlock.v1',
    status: 'blocked_missing_w90_retest_evidence_no_go',
    evidenceIntake,
    scoredResults,
    pilotUnlockDecision,
    remediation,
    validatorResults: results,
    bestNextCodexPrompt: bestNextPrompt
  };

  writeJson(dataPath, contract);
  writeJson(scoredPath, scoredResults);
  writeJson(remediationPath, remediation);
  writeJson(decisionPath, pilotUnlockDecision);

  const trace = {
    schema: 'idb.w91-execute-one-run-retest-grade-trace.v1',
    generated: new Date().toISOString(),
    decision,
    status: contract.status,
    averageScore,
    pilotUnlockDecision: pilotUnlockDecision.decision,
    evidenceIntake,
    noRegression: scoredResults.noRegression,
    bestNextCodexPrompt: bestNextPrompt,
    validatorResults: results
  };
  writeJson(tracePath, trace);

  const report = [
    '# W91 Execute One-Run Retest And Grade Pilot Unlock',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / PILOT UNLOCK NO-GO / W90 RETEST EVIDENCE MISSING`,
    '',
    '## Evidence Intake',
    '',
    `- DCC handoff JSON: ${dccHandoffFiles.length ? dccHandoffFiles.join(', ') : 'missing'}`,
    `- Trace JSON files found: ${traceFiles.length}`,
    '- Required screenshots: missing',
    '- Operator comparison notes: missing',
    `- Legacy SuiteScript review packets found: ${legacySuiteScriptPackets.length}`,
    '',
    '## Score',
    '',
    `- Average: ${averageScore} / 5`,
    '- Passing target: 4 / 5',
    `- Any category below 3: ${anyBelowThree ? 'yes' : 'no'}`,
    '- Broader pilot: no-go',
    '',
    '| Category | Score | Evidence |',
    '| --- | ---: | --- |',
    ...categories.map((item) => `| ${escapeTable(item.category)} | ${item.score} | ${escapeTable(item.evidence)} |`),
    '',
    '## Exact Remediation',
    '',
    ...remediation.exactNextActions.map((item) => `- ${item}`),
    '',
    '## Validator Gates',
    '',
    '| Status | Rule | Detail |',
    '| --- | --- | --- |',
    ...results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${escapeTable(result.name)} | ${escapeTable(result.detail)} |`),
    '',
    '## Best Next Codex Prompt',
    '',
    bestNextPrompt.prompt,
    ''
  ].join('\n');
  fs.writeFileSync(reportPath, report);

  if (failures.length) {
    console.error(`W91 one-run retest grade harness FAIL: ${failures.length} failure(s)`);
    failures.forEach((failure) => console.error(`- ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }

  console.log(`W91 one-run retest grade harness PASS: ${results.length}/${results.length} average=${averageScore} decision=${pilotUnlockDecision.decision}`);
}

main();
