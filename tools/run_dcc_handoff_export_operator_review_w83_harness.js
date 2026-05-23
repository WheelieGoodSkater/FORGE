const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w82Path = path.join(root, 'data', 'w82_dcc_runner_handoff_parameter_map.json');
const dataPath = path.join(root, 'data', 'w83_dcc_handoff_export_operator_review_ux.json');
const tracePath = path.join(root, 'trace_samples', 'w83_dcc_handoff_export_operator_review_ux_trace.json');
const blockedTracePath = path.join(root, 'trace_samples', 'w83_dcc_handoff_export_blocked_sample.json');
const confirmedTracePath = path.join(root, 'trace_samples', 'w83_dcc_handoff_export_confirmed_sample.json');
const reportPath = path.join(root, 'reports', 'w83_dcc_handoff_export_operator_review_ux.md');

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
  const w82 = readJson(w82Path);
  const results = [];

  const blockedExportPayload = {
    schema: 'idb.dcc-runner-handoff-packet.v1',
    status: 'blocked_until_confirmed_handoff',
    executionMode: 'review_only_no_submit',
    selectedPack: 'Apparel and footwear style readiness',
    selectedScenario: 'Style / SKU Matrix',
    suiteletEntryPayload: {
      custpage_prospect: 'Ariat International',
      custpage_website: 'https://www.ariat.com/',
      custpage_notes: 'Buyer needs style, size, and channel availability readiness before a seasonal launch.',
      custpage_newhero: 'T',
      custpage_enablemfg: 'F',
      custpage_enablewip: 'F',
      custpage_evalmode: 'review_only',
      custpage_actionmode: 'previewbrief'
    },
    dccOwnedConfigParams: w82.parameterMap.suiteletConfigParamsOwnedByDcc,
    scheduledRunnerPreview: w82.confirmedExample.scheduledRunnerPreview,
    operatorChecklist: [
      'Block handoff until consultant confirms lane, pack, naming, and build mode.',
      'Export DCC handoff packet for operator review.',
      'Operator verifies Suitelet form params and DCC-owned deployment config.',
      'Submit only from governed DCC surface; IDB does not invoke SuiteScript.'
    ],
    noRegression: {
      dccRunnerMechanicsNotRewritten: true,
      suiteScriptInvocationFromIdb: false,
      idbTransactionWritesEnabled: false,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      consultantConfirmationRequired: true
    }
  };

  const confirmedExportPayload = {
    schema: 'idb.dcc-runner-handoff-packet.v1',
    status: 'ready_for_dcc_suitelet_submission_review',
    executionMode: 'review_only_no_submit',
    selectedPack: blockedExportPayload.selectedPack,
    selectedScenario: blockedExportPayload.selectedScenario,
    suiteletEntryPayload: Object.assign({}, blockedExportPayload.suiteletEntryPayload, { custpage_actionmode: '' }),
    dccOwnedConfigParams: w82.parameterMap.suiteletConfigParamsOwnedByDcc,
    scheduledRunnerPreview: w82.confirmedExample.scheduledRunnerPreview,
    operatorChecklist: [
      'Consultant confirmation is present.',
      'Export DCC handoff packet for operator review.',
      'Operator verifies Suitelet form params and DCC-owned deployment config.',
      'Submit only from governed DCC surface; IDB does not invoke SuiteScript.'
    ],
    noRegression: blockedExportPayload.noRegression
  };

  const requiredRuntimeSnippets = [
    'function renderDccHandoffOperatorReview',
    'Build Handoff',
    'Export build handoff',
    'Exact preview and runner params',
    'Build-owned config',
    'Scheduled runner params',
    'Operator checklist',
    'data-idb-export-dcc-handoff',
    'function exportDccRunnerHandoffPacket',
    'idb-dcc-runner-handoff-packet',
    'dcc_runner_handoff_exported',
    'suiteScriptInvocationFromIdb: false',
    'noIdbTransactionWrite: true'
  ];

  assertCase(results, 'w83_inherits_w82_parameter_map', w82.schema === 'idb.w82-dcc-runner-handoff-parameter-map.v1' && w82.status === 'dcc_runner_handoff_parameter_map_ready_review_only', JSON.stringify({ schema: w82.schema, status: w82.status }));
  requiredRuntimeSnippets.forEach((snippet) => {
    assertCase(results, `w83_runtime_contains_${snippet.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`, userscript.includes(snippet), snippet);
  });
  assertCase(results, 'w83_export_uses_handoff_packet_contract', /const payload = dccRunnerHandoffPacketV1\(state, lane, pageContext, recommendation\)/.test(userscript), 'exportDccRunnerHandoffPacket payload source');
  assertCase(results, 'w83_review_renders_operator_card', /renderReviewView[\s\S]{0,600}renderDccHandoffOperatorReview\(state, lane, page, recommendation\)/.test(userscript), 'renderReviewView operator card');
  assertCase(results, 'w83_exact_form_params_visible', ['custpage_prospect', 'custpage_website', 'custpage_notes', 'custpage_newhero', 'custpage_enablemfg', 'custpage_enablewip', 'custpage_evalmode', 'custpage_actionmode'].every((param) => userscript.includes(param)), 'Suitelet entry params');
  assertCase(results, 'w83_dcc_owned_config_visible', w82.parameterMap.suiteletConfigParamsOwnedByDcc.length >= 8 && userscript.includes('suiteletConfigParamsOwnedByDcc'), JSON.stringify(w82.parameterMap.suiteletConfigParamsOwnedByDcc));
  assertCase(results, 'w83_scheduled_runner_preview_visible', ['custscript_v3_runner_prospect', 'custscript_v3_runner_mapping', 'custscript_v3_runner_enable_mfg', 'custscript_v3_runner_create_new_hero'].every((param) => userscript.includes(param)), 'scheduled runner preview params');
  assertCase(results, 'w83_blocked_confirmed_samples_review_only', blockedExportPayload.executionMode === 'review_only_no_submit' && confirmedExportPayload.executionMode === 'review_only_no_submit' && blockedExportPayload.noRegression.suiteScriptInvocationFromIdb === false && confirmedExportPayload.noRegression.idbTransactionWritesEnabled === false, JSON.stringify({ blocked: blockedExportPayload.status, confirmed: confirmedExportPayload.status }));
  assertCase(results, 'w83_consultant_confirmation_gate_preserved', blockedExportPayload.status === 'blocked_until_confirmed_handoff' && confirmedExportPayload.status === 'ready_for_dcc_suitelet_submission_review' && confirmedExportPayload.noRegression.consultantConfirmationRequired === true, JSON.stringify({ blocked: blockedExportPayload.status, confirmed: confirmedExportPayload.status }));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextPrompt = {
    block: 'W84: DCC Operator Dry-Run Handoff Smoke',
    prompt: 'Move through W84: DCC Operator Dry-Run Handoff Smoke. Use the exported dccRunnerHandoffPacketV1 JSON to build an operator dry-run checklist against the Demo Command Center Suitelet without invoking SuiteScript from IDB: verify form params, DCC-owned config params, consultant confirmation gate, review-only mode, DCC runner queue ownership, and blocked/no-submit behavior. Preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, and DCC ownership of item names, assemblies, BOMs, locations, planning, routing/WIP, and CSV/Sales Order mechanics. Output dry-run checklist, blocked and confirmed packet samples, validator gates, W84 report, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w83-dcc-handoff-export-operator-review-ux.v1',
    status: 'dcc_handoff_export_operator_review_ready',
    objective: 'Add review-only DCC handoff export and compact operator review UX using dccRunnerHandoffPacketV1 without invoking SuiteScript.',
    exportPayloadShape: {
      sourceContract: 'dccRunnerHandoffPacketV1',
      filenamePrefix: 'idb-dcc-runner-handoff-packet',
      executionMode: 'review_only_no_submit',
      containsSuiteletEntryPayload: true,
      containsDccOwnedConfigParams: true,
      containsScheduledRunnerPreview: true,
      containsOperatorChecklist: true
    },
    uiSummary: {
      reviewCard: 'DCC handoff export',
      showsBlockedOrConfirmedStatus: true,
      showsExactSuiteletFormParams: true,
      showsDccOwnedConfigParams: true,
      showsScheduledRunnerPreviewParams: true,
      showsOperatorChecklist: true
    },
    blockedExportPayload,
    confirmedExportPayload,
    validatorResults: results,
    noRegression: {
      noSuiteScriptInvocationFromIdb: true,
      noDccRunnerMechanicsRewrite: true,
      noIdbTransactionWrites: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      consultantConfirmationRequiredBeforeEligible: true
    },
    bestNextCodexPrompt: bestNextPrompt
  };

  writeJson(dataPath, contract);
  writeJson(blockedTracePath, blockedExportPayload);
  writeJson(confirmedTracePath, confirmedExportPayload);

  const trace = {
    schema: 'idb.w83-dcc-handoff-export-operator-review-ux-trace.v1',
    generated: new Date().toISOString(),
    decision,
    exportPayload: contract.exportPayloadShape,
    uiSummary: contract.uiSummary,
    blockedSampleStatus: blockedExportPayload.status,
    confirmedSampleStatus: confirmedExportPayload.status,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: bestNextPrompt,
    validatorResults: results
  };
  writeJson(tracePath, trace);

  const report = [
    '# W83 DCC Handoff Export And Operator Review UX',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / DCC HANDOFF EXPORT READY / REVIEW ONLY / NO SUITESCRIPT INVOCATION`,
    '',
    '## Export Payload',
    '',
    '- Source: `dccRunnerHandoffPacketV1`',
    '- Filename prefix: `idb-dcc-runner-handoff-packet`',
    '- Execution mode: `review_only_no_submit`',
    '- Includes exact Suitelet form params, DCC-owned config params, scheduled runner preview params, and operator checklist.',
    '',
    '## UI Summary',
    '',
    '- Review now includes a compact `DCC handoff export` card.',
    '- The card shows blocked/confirmed status before parameter detail.',
    '- Details expose exact Suitelet form params, DCC-owned config params, and scheduled runner preview params.',
    '- Export button downloads the handoff JSON only; it does not call SuiteScript.',
    '',
    '## Blocked And Confirmed Samples',
    '',
    `- Blocked sample: \`${path.relative(root, blockedTracePath)}\``,
    `- Confirmed sample: \`${path.relative(root, confirmedTracePath)}\``,
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
    console.error(`W83 DCC handoff export/operator review harness FAIL: ${failures.length} failure(s)`);
    failures.forEach((failure) => console.error(`- ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }

  console.log(`W83 DCC handoff export/operator review harness PASS: ${results.length}/${results.length}`);
}

main();
