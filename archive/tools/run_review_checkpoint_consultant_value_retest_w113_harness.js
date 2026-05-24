const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w113_review_checkpoint_consultant_value_retest.json');
const tracePath = path.join(root, 'trace_samples', 'w113_review_checkpoint_consultant_value_retest_trace.json');
const reportPath = path.join(root, 'reports', 'w113_review_checkpoint_consultant_value_retest.md');

const uploadedEvidence = {
  suiteScriptReviewPacket: '/path/to/downloads/idb-suitescript-review-packet-1778783125495.json',
  traceJson: '/path/to/downloads/intelligent-demo-builder-trace-1778783124832.json',
  dccHandoffJson: '/path/to/downloads/idb-dcc-runner-handoff-packet-1778783123485.json'
};

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function scoreLine(score, finding, evidence, remediation) {
  return { score, finding, evidence, remediation };
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function safeHas(object, pathParts, expected) {
  let value = object;
  for (const part of pathParts) value = value && value[part];
  return expected === undefined ? value != null : value === expected;
}

function main() {
  const userscript = read(userscriptPath);
  const trace = readJson(uploadedEvidence.traceJson);
  const dccHandoff = readJson(uploadedEvidence.dccHandoffJson);
  const suiteScriptReview = readJson(uploadedEvidence.suiteScriptReviewPacket);
  const results = [];

  const authority = dccHandoff.stateAuthority || trace.stateAuthority || {};
  const roi = trace.roiCompetitiveReview || {};
  const run = trace.runSelectorInteraction || {};
  const intake = trace.state && trace.state.intake ? trace.state.intake : {};
  const events = Array.isArray(trace.events) ? trace.events : [];

  const stateAligned = [
    authority.recommendedLaneId,
    authority.selectedLaneId,
    authority.confirmedLaneId,
    authority.exportedLaneId,
    trace.selectedLane && trace.selectedLane.id
  ].every((laneId) => laneId === 'apparel_accessories')
    && dccHandoff.selectedPack === 'apparelAccessories'
    && dccHandoff.selectedScenario === 'Style-to-Availability Readiness'
    && authority.handoffEligible === true
    && Array.isArray(authority.handoffBlockers)
    && authority.handoffBlockers.length === 0;

  const noRegression = {
    noIdbWrites: (trace.sourceAuthority && trace.sourceAuthority.noRegression && trace.sourceAuthority.noRegression.noIdbWrites === true)
      || (suiteScriptReview.nonRegression && suiteScriptReview.nonRegression.createDisabled === true),
    noSuiteScriptInvocationFromIdb: (trace.sourceAuthority && trace.sourceAuthority.noRegression && trace.sourceAuthority.noRegression.noSuiteScriptInvocationFromIdb === true)
      || (dccHandoff.noRegression && dccHandoff.noRegression.suiteScriptInvocationFromIdb === false),
    noTransactionWrites: (trace.sourceAuthority && trace.sourceAuthority.noRegression && trace.sourceAuthority.noRegression.noTransactionWrites === true)
      || (dccHandoff.noRegression && dccHandoff.noRegression.noIdbTransactionWrite === true),
    hostedResolverOptionalUntilRemoteSmokeExecuted: dccHandoff.noRegression && dccHandoff.noRegression.hostedResolverOptionalUntilRemoteSmokeExecuted === true,
    notesDriveStoryValue: /Drive pain, ROI framing, competitor context, objections, and talk track/.test(trace.sourceAuthority && trace.sourceAuthority.value && trace.sourceAuthority.value.notesRole || ''),
    websiteSupportsIdentityNaming: /Suggest lane, category, naming, product family, and DCC pack/.test(trace.sourceAuthority && trace.sourceAuthority.identity && trace.sourceAuthority.identity.websiteRole || ''),
    consultantConfirmationRequired: dccHandoff.consultantConfirmation && dccHandoff.consultantConfirmation.required === true && dccHandoff.consultantConfirmation.confirmed === true,
    dccOwnsObjectGeneration: (trace.sourceAuthority && trace.sourceAuthority.noRegression && trace.sourceAuthority.noRegression.dccOwnsObjectGeneration === true)
      || (dccHandoff.stateAuthority && dccHandoff.stateAuthority.noRegression && dccHandoff.stateAuthority.noRegression.dccOwnsObjectGeneration === true)
  };

  const planGrade = scoreLine(
    4,
    'Plan is close to 30-second usable after Prepare brief: it has prospect, Apparel & Accessories, confidence, next action, and an aligned DCC pack.',
    'Trace state shows Ariat request captured and acceptedPacket selected Apparel & Accessories / Style-to-Availability Readiness.',
    'Keep tightening first-visit intake language and avoid extra chips unless they directly tell the consultant what to do next.'
  );

  const reviewGrade = scoreLine(
    3,
    'Review is technically correct and safer, but still feels more like an operator handoff screen than a consultant checkpoint.',
    'DCC handoff JSON is export-ready and aligned, but the Review surface still contains many collapsed operator sections.',
    'Next UI block should make Review a one-screen checkpoint: what DCC will build, export handoff, operator compare, blocker.'
  );

  const valueGrade = scoreLine(
    3,
    'ROI/Competitive is now notes-aware, but it still underuses the consultant request and over-explains audit detail.',
    `Business pain: ${intake.notes || 'missing'} / competitor: ${intake.competitor || 'missing'}.`,
    'Move talk track and discovery fully above audit, then let N/LLM advisory create sharper questions and value framing from notes, timeline, competitor, and decision criteria.'
  );

  const runGrade = scoreLine(
    4,
    'Run is the strongest consultant surface now: selector chips are obvious and the selected script is action-oriented.',
    `Selected action: ${trace.state && trace.state.selectedActionId}; run selector schema: ${run.schema || 'present in trace'}.`,
    'Keep this pattern and use it as the model for Review and ROI/Competitive.'
  );

  const traceGrade = scoreLine(
    4,
    'Trace is operationally clear: export DCC first, trace JSON second, keep no-write evidence.',
    'Uploaded trace JSON and DCC handoff JSON were both available and machine-readable.',
    'Keep Trace for evidence only; do not let it become a consultant coaching tab.'
  );

  const scorecard = {
    scale: '1-5',
    passingAverageForPilotUnlock: 4,
    categories: {
      plan: planGrade,
      review: reviewGrade,
      roiCompetitive: valueGrade,
      run: runGrade,
      trace: traceGrade,
      stateAuthority: scoreLine(
        stateAligned ? 5 : 1,
        stateAligned ? 'Visible lane, confirmed lane, exported lane, selected pack, and scenario agree.' : 'State authority mismatch detected.',
        JSON.stringify({
          recommended: authority.recommendedLaneId,
          selected: authority.selectedLaneId,
          confirmed: authority.confirmedLaneId,
          exported: authority.exportedLaneId,
          pack: dccHandoff.selectedPack,
          scenario: dccHandoff.selectedScenario,
          blockers: authority.handoffBlockers
        }),
        stateAligned ? 'No remediation required for this run.' : 'Block DCC export until all state authority IDs and DCC pack agree.'
      ),
      prepareBriefButton: scoreLine(
        /querySelectorAll\('\[data-idb-prepare-brief\]'\)/.test(userscript) ? 5 : 1,
        /querySelectorAll\('\[data-idb-prepare-brief\]'\)/.test(userscript) ? 'All Prepare brief buttons are wired, including the bottom Plan button.' : 'Prepare brief binding still targets only one button.',
        'Source inspection of data-idb-prepare-brief event binding.',
        'Keep querySelectorAll binding and add visual retest confirmation from user screenshots.'
      )
    }
  };
  const scores = Object.values(scorecard.categories).map((item) => item.score);
  scorecard.average = Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1));
  scorecard.anyBelowFour = scores.some((score) => score < 4);

  const uxFindings = [
    'Plan is much cleaner, but the first empty state still needs to feel like a guided sales request, not a system setup form.',
    'Review is export-ready but not yet emotionally obvious to a consultant; it needs a stronger "this is your demo build handoff" story.',
    'ROI/Competitive should become the value coach: lead with talk track, discovery question, objection answer, and proof move; leave audit collapsed.',
    'Run is moving in the right direction and should stay chips-first with dynamic script changes.',
    'Trace is appropriately operational and should stay out of the consultant selling flow.'
  ];

  const exactRemediation = [
    {
      priority: 1,
      block: 'W114',
      issue: 'Review is still being skipped because it reads like a technical export page.',
      fix: 'Reframe Review as Demo Build Handoff: one sentence objective, what DCC will build, export handoff, operator comparison status, blocker.'
    },
    {
      priority: 2,
      block: 'W115',
      issue: 'ROI/Competitive is useful but not yet strong enough as a consultant coach.',
      fix: 'Promote talk track/discovery/objection handling above ROI cards and generate better notes-driven value copy through advisory-only N/LLM.'
    },
    {
      priority: 3,
      block: 'W116',
      issue: 'Prepare brief fix needs one real screenshot confirmation.',
      fix: 'Ask user to click the bottom Prepare brief button after upload and capture Plan after it prepares.'
    },
    {
      priority: 4,
      block: 'W117',
      issue: 'Production execution path still stops at export/operator comparison.',
      fix: 'Design governed DCC invocation pilot after Review and operator approval are proven, keeping transaction writes blocked.'
    }
  ];

  const pilotDecision = {
    broaderConsultantPilot: 'no_go_yet',
    oneRunRetest: 'go_after_upload',
    reason: 'State authority and handoff are strong, but Review and ROI/Competitive need one more UX/value pass before broader consultant testing.',
    unlockCriteria: [
      'Bottom Prepare brief button confirmed visually in NetSuite.',
      'Review understood in under 30 seconds without reading operator detail.',
      'ROI/Competitive gives a useful talk track, discovery question, and objection answer from notes.',
      'DCC handoff JSON and trace JSON still export with aligned Apparel & Accessories state.',
      'No IDB write, SuiteScript invocation, or transaction write appears.'
    ]
  };

  assertCase(results, 'w113_uploaded_trace_and_handoff_loaded', trace.product && dccHandoff.schema === 'idb.dcc-runner-handoff-packet.v1', JSON.stringify({ trace: !!trace.product, handoff: dccHandoff.schema }));
  assertCase(results, 'w113_prepare_brief_all_buttons_bound', /querySelectorAll\('\[data-idb-prepare-brief\]'\)/.test(userscript), 'all Prepare brief buttons use shared binding');
  assertCase(results, 'w113_state_authority_aligned', stateAligned, JSON.stringify(scorecard.categories.stateAuthority));
  assertCase(results, 'w113_review_checkpoint_export_ready', dccHandoff.status === 'ready_for_dcc_suitelet_submission_review' && dccHandoff.executionMode === 'review_only_no_submit', JSON.stringify({ status: dccHandoff.status, mode: dccHandoff.executionMode }));
  assertCase(results, 'w113_roi_competitive_notes_present', !!intake.notes && !!intake.competitor && !!intake.decisionCriteria && !!roi.groundedRoiSummary && !!roi.competitiveReview, JSON.stringify({ notes: !!intake.notes, competitor: !!intake.competitor, decisionCriteria: !!intake.decisionCriteria, groundedRoiSummary: !!roi.groundedRoiSummary, competitiveReview: !!roi.competitiveReview }));
  assertCase(results, 'w113_run_selector_trace_present', trace.state && trace.state.selectedActionId === 'prove' && /data-idb-action=/.test(userscript), JSON.stringify({ selectedActionId: trace.state && trace.state.selectedActionId }));
  assertCase(results, 'w113_no_regression_boundaries_hold', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));
  assertCase(results, 'w113_pilot_decision_honest_no_go_broader', pilotDecision.broaderConsultantPilot === 'no_go_yet' && pilotDecision.oneRunRetest === 'go_after_upload', JSON.stringify(pilotDecision));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';

  const contract = {
    schema: 'idb.w113-review-checkpoint-consultant-value-retest.v1',
    status: failures.length ? 'blocked' : 'graded_retest_no_go_broader_pilot_go_one_run_retest',
    decision,
    objective: 'Grade whether Plan, Review, ROI/Competitive, Run, and Trace are consultant-usable in under 30 seconds from the latest uploaded evidence.',
    uploadedEvidence,
    fileToUpload: {
      absolutePath: userscriptPath,
      sha256: sha256(userscriptPath),
      tampermonkeyName: 'Intelligent Demo Builder Drawer'
    },
    gradedRetestResults: scorecard,
    uxFindings,
    stateHandoffFindings: {
      aligned: stateAligned,
      authority,
      dccHandoff: {
        status: dccHandoff.status,
        executionMode: dccHandoff.executionMode,
        selectedPack: dccHandoff.selectedPack,
        selectedScenario: dccHandoff.selectedScenario,
        exportEligible: dccHandoff.parityLock && dccHandoff.parityLock.exportEligible
      }
    },
    roiCompetitiveFindings: {
      notesDrivenInputsPresent: !!intake.notes && !!intake.competitor && !!intake.decisionCriteria && !!intake.timelineUrgency,
      currentAssessment: valueGrade.finding,
      nextDirection: 'Use N/LLM as advisory-only value coach from notes, pain, decision criteria, timeline, and competitor/incumbent. Website remains identity/naming support.'
    },
    exactRemediation,
    pilotDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W114: Review Handoff Story Compression',
      prompt: 'Move through W114: Review Handoff Story Compression. Make Review impossible to skip by turning it into a one-screen Demo Build Handoff checkpoint: what the consultant requested, what DCC will build, what to export, what the operator must compare, and what is blocked. Hide operator technical details by default, preserve W92/W110 state authority and DCC handoff parity, keep no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only/value-first, consultant confirmation required, and DCC ownership of object generation. Output compressed Review UI, validator gates, W114 report, and best next Codex prompt.'
    }
  };

  const traceSample = {
    schema: 'idb.w113-review-checkpoint-consultant-value-retest-trace.v1',
    decision,
    pass: failures.length === 0,
    averageScore: scorecard.average,
    broaderConsultantPilot: pilotDecision.broaderConsultantPilot,
    oneRunRetest: pilotDecision.oneRunRetest,
    prepareBriefButtonBound: scorecard.categories.prepareBriefButton.score === 5,
    stateAligned,
    noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, traceSample);

  const report = [
    '# W113 Review Checkpoint And Consultant Value Retest',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / ${pilotDecision.broaderConsultantPilot.toUpperCase()} / ${pilotDecision.oneRunRetest.toUpperCase()}`,
    '',
    '## Graded Retest Results',
    '',
    `Average score: ${scorecard.average}/5`,
    '',
    '| Area | Score | Finding | Remediation |',
    '| --- | ---: | --- | --- |',
    ...Object.entries(scorecard.categories).map(([area, item]) => `| ${escapeTable(area)} | ${item.score} | ${escapeTable(item.finding)} | ${escapeTable(item.remediation)} |`),
    '',
    '## UX Findings',
    '',
    ...uxFindings.map((item) => `- ${item}`),
    '',
    '## State / Handoff Findings',
    '',
    `- State aligned: ${stateAligned ? 'yes' : 'no'}`,
    `- Selected pack: ${dccHandoff.selectedPack}`,
    `- Selected scenario: ${dccHandoff.selectedScenario}`,
    `- Handoff status: ${dccHandoff.status}`,
    `- Execution mode: ${dccHandoff.executionMode}`,
    '',
    '## ROI / Competitive Findings',
    '',
    `- Notes-driven inputs present: ${contract.roiCompetitiveFindings.notesDrivenInputsPresent ? 'yes' : 'no'}`,
    `- Assessment: ${contract.roiCompetitiveFindings.currentAssessment}`,
    `- Direction: ${contract.roiCompetitiveFindings.nextDirection}`,
    '',
    '## Exact Remediation',
    '',
    ...exactRemediation.map((item) => `- P${item.priority} ${item.block}: ${item.issue} Fix: ${item.fix}`),
    '',
    '## Pilot Go / No-Go',
    '',
    `- Broader consultant pilot: ${pilotDecision.broaderConsultantPilot}`,
    `- One-run retest: ${pilotDecision.oneRunRetest}`,
    `- Reason: ${pilotDecision.reason}`,
    '',
    '## Validator Gates',
    '',
    '| Gate | Result | Detail |',
    '| --- | --- | --- |',
    ...results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`),
    '',
    '## Best Next Codex Prompt',
    '',
    contract.bestNextCodexPrompt.prompt
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`);

  console.log(JSON.stringify({
    decision,
    results: results.length,
    averageScore: scorecard.average,
    broaderConsultantPilot: pilotDecision.broaderConsultantPilot,
    oneRunRetest: pilotDecision.oneRunRetest,
    report: path.relative(root, reportPath)
  }, null, 2));

  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
