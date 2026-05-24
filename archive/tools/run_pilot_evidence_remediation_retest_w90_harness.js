const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w89rPath = path.join(root, 'data', 'w89r_uploaded_real_user_test_evidence_review.json');
const dataPath = path.join(root, 'data', 'w90_pilot_evidence_remediation_retest_pack.json');
const tracePath = path.join(root, 'trace_samples', 'w90_pilot_evidence_remediation_trace.json');
const retestPacketPath = path.join(root, 'trace_samples', 'w90_one_run_retest_packet.json');
const reportPath = path.join(root, 'reports', 'w90_pilot_evidence_remediation_retest_pack.md');

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

function main() {
  const userscript = read(userscriptPath);
  const w89r = readJson(w89rPath);
  const results = [];

  const uiTraceRemediation = {
    schema: 'idb.w90-ui-trace-remediation.v1',
    fixes: [
      {
        area: 'DCC handoff export',
        status: 'implemented',
        detail: 'Review and Trace make Export DCC handoff the primary evidence action and label the required idb-dcc-runner-handoff-packet file.'
      },
      {
        area: 'Trace evidence checklist',
        status: 'implemented',
        detail: 'Trace now shows required screenshots, DCC handoff JSON, trace JSON, operator notes, and secondary legacy packet status.'
      },
      {
        area: 'Non-submit language',
        status: 'implemented',
        detail: 'SuiteScript review packet uses review_only_export_only / not_submitted_from_idb language while preserving create-disabled SuiteScript contract boundaries.'
      },
      {
        area: 'Trace ownership language',
        status: 'implemented',
        detail: 'lane_recommended trace source now identifies website_evidence_v1 as identity authority and notes as story-only.'
      }
    ]
  };

  const oneRunRetestPacket = {
    schema: 'idb.w90-one-run-retest-packet.v1',
    status: 'ready_for_single_retest_no_submit',
    objective: 'Retest exactly one consultant-to-operator flow and prove the correct DCC handoff evidence is captured.',
    fileToLoad: path.join(root, 'idb-drawer.user.js'),
    testData: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      notes: 'Buyer needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches. Current process relies on spreadsheets and disconnected inventory views.',
      scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise for a seasonal boot and apparel launch.',
      knownCompetitor: 'Current spreadsheets and existing inventory tools; broader ERP options under comparison.',
      decisionCriteria: 'Must show style/SKU matrix fit, size/color visibility, channel availability, replenishment timing, and customer-to-order impact.'
    },
    requiredEvidence: [
      'Plan screenshot after intake.',
      'Review screenshot showing DCC handoff export card.',
      'Trace screenshot showing Pilot evidence checklist.',
      'Export idb-dcc-runner-handoff-packet-*.json.',
      'Export intelligent-demo-builder-trace-*.json.',
      'Operator comparison notes marking Suitelet form params, DCC config params, and runner preview params as match/missing/unclear.'
    ],
    stopGo: {
      goIf: [
        'DCC handoff JSON is attached.',
        'Trace JSON is attached.',
        'Plan, Review DCC handoff, and Trace evidence checklist screenshots are attached.',
        'Operator maps handoff params in under 5 minutes.',
        'No IDB SuiteScript invocation, queue action, or transaction write occurs.'
      ],
      noGoIf: [
        'Only the legacy SuiteScript review packet is exported.',
        'Operator cannot identify Suitelet form params or runner preview params.',
        'Trace source suggests notes own identity.',
        'Any IDB path appears to submit, queue, or write records.'
      ]
    }
  };

  assertCase(results, 'w90_inherits_w89r_no_go_findings', w89r.status === 'graded_partial_real_evidence_no_go' && w89r.pilotDecision.canProceedToBroaderPilot === false, JSON.stringify({ status: w89r.status, decision: w89r.pilotDecision.decision }));
  assertCase(results, 'w90_dcc_handoff_primary_in_review_and_trace', /data-idb-export-dcc-handoff/.test(userscript) && /Required export: build handoff JSON/.test(userscript) && /Primary: handoff JSON/.test(userscript), 'primary handoff evidence labels');
  assertCase(results, 'w90_trace_evidence_checklist_present', /function pilotEvidenceChecklistModel/.test(userscript) && /idb-w90-evidence-checklist/.test(userscript) && /operator_comparison_notes/.test(userscript) && /primaryRequiredExport: 'idb-dcc-runner-handoff-packet-\*\.json'/.test(userscript), 'pilot evidence checklist model and UI');
  assertCase(results, 'w90_suitescript_packet_language_review_only', /mode: 'review_only_export_only'/.test(userscript) && /submissionMode: 'not_submitted_from_idb'/.test(userscript) && !/mode: 'create'/.test(userscript), 'review-only export language');
  assertCase(results, 'w90_trace_ownership_normalized', /source: 'website_evidence_identity_guided_intake_story'/.test(userscript) && /identityAuthority: 'website_evidence_v1'/.test(userscript) && /notesRole: 'story_only'/.test(userscript), 'website owns identity, notes own story');
  assertCase(results, 'w90_trace_export_covers_checklist', /pilotEvidenceChecklist: pilotEvidenceChecklistModel/.test(userscript) && /requiredPrimaryEvidence: 'idb-dcc-runner-handoff-packet-\*\.json'/.test(userscript) && /primaryPilotEvidence: true/.test(userscript), 'trace and handoff export coverage');
  assertCase(results, 'w90_no_write_boundaries_preserved', /suiteScriptInvocationFromIdb: false/.test(userscript) && /noIdbTransactionWrite: true/.test(userscript) && /noTransactionWritesFromIdb: true/.test(userscript), 'no submit/write boundaries');
  assertCase(results, 'w90_retest_packet_complete', oneRunRetestPacket.requiredEvidence.length === 6 && oneRunRetestPacket.stopGo.noGoIf.some((item) => /legacy SuiteScript review packet/.test(item)) && oneRunRetestPacket.stopGo.goIf.some((item) => /DCC handoff JSON/.test(item)), JSON.stringify(oneRunRetestPacket.requiredEvidence));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextPrompt = {
    block: 'W91: Execute One-Run Retest And Grade Pilot Unlock',
    prompt: 'Move through W91: Execute One-Run Retest And Grade Pilot Unlock. Use the W90 retest packet to run one hands-on consultant-to-operator test. Require Plan, Review DCC handoff, and Trace evidence-checklist screenshots; idb-dcc-runner-handoff-packet JSON; intelligent-demo-builder trace JSON; and operator comparison notes. Grade against the W88/W90 rubric, verify no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output scored results, pilot unlock/no-go decision, exact remediation, W91 report, validator gates, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w90-pilot-evidence-remediation-retest-pack.v1',
    status: 'pilot_evidence_remediation_ready_for_one_run_retest',
    objective: 'Fix the evidence flow before a broader consultant pilot and prepare one controlled retest.',
    uiTraceRemediation,
    oneRunRetestPacket,
    validatorResults: results,
    noRegression: {
      noIdbWrites: true,
      noSuiteScriptInvocationFromIdb: true,
      noDccRunnerRewrite: true,
      noTransactionWrites: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      consultantConfirmationRequired: true,
      dccOwnsObjectGeneration: true
    },
    bestNextCodexPrompt: bestNextPrompt
  };

  writeJson(dataPath, contract);
  writeJson(retestPacketPath, oneRunRetestPacket);

  const trace = {
    schema: 'idb.w90-pilot-evidence-remediation-trace.v1',
    generated: new Date().toISOString(),
    decision,
    status: contract.status,
    remediationCount: uiTraceRemediation.fixes.length,
    requiredEvidenceCount: oneRunRetestPacket.requiredEvidence.length,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: bestNextPrompt,
    validatorResults: results
  };
  writeJson(tracePath, trace);

  const report = [
    '# W90 Pilot Evidence Remediation And Retest Pack',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / EVIDENCE FLOW REMEDIATED / READY FOR ONE-RUN RETEST / BROADER PILOT STILL NO-GO`,
    '',
    '## Remediation',
    '',
    ...uiTraceRemediation.fixes.map((fix) => `- ${fix.area}: ${fix.detail}`),
    '',
    '## One-Run Retest Evidence',
    '',
    ...oneRunRetestPacket.requiredEvidence.map((item) => `- ${item}`),
    '',
    '## Stop / Go',
    '',
    '**Go if:**',
    '',
    ...oneRunRetestPacket.stopGo.goIf.map((item) => `- ${item}`),
    '',
    '**No-go if:**',
    '',
    ...oneRunRetestPacket.stopGo.noGoIf.map((item) => `- ${item}`),
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
    console.error(`W90 pilot evidence remediation harness FAIL: ${failures.length} failure(s)`);
    failures.forEach((failure) => console.error(`- ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }

  console.log(`W90 pilot evidence remediation harness PASS: ${results.length}/${results.length}`);
}

main();
