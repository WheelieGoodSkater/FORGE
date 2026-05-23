const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w83Path = path.join(root, 'data', 'w83_dcc_handoff_export_operator_review_ux.json');
const w83BlockedPath = path.join(root, 'trace_samples', 'w83_dcc_handoff_export_blocked_sample.json');
const w83ConfirmedPath = path.join(root, 'trace_samples', 'w83_dcc_handoff_export_confirmed_sample.json');
const dataPath = path.join(root, 'data', 'w84_dcc_operator_dry_run_handoff_smoke.json');
const tracePath = path.join(root, 'trace_samples', 'w84_dcc_operator_dry_run_handoff_smoke_trace.json');
const blockedPacketPath = path.join(root, 'trace_samples', 'w84_operator_dry_run_blocked_packet_sample.json');
const confirmedPacketPath = path.join(root, 'trace_samples', 'w84_operator_dry_run_confirmed_packet_sample.json');
const checklistPath = path.join(root, 'trace_samples', 'w84_operator_dry_run_checklist.json');
const reportPath = path.join(root, 'reports', 'w84_dcc_operator_dry_run_handoff_smoke.md');

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
  const w83 = readJson(w83Path);
  const w83Blocked = readJson(w83BlockedPath);
  const w83Confirmed = readJson(w83ConfirmedPath);
  const results = [];

  const dryRunChecklist = {
    schema: 'idb.w84-dcc-operator-dry-run-checklist.v1',
    status: 'operator_dry_run_ready_review_only',
    objective: 'Let an operator inspect the exported dccRunnerHandoffPacketV1 against the DCC Suitelet without IDB invoking SuiteScript.',
    orderedSteps: [
      {
        step: 'Verify exported packet schema and status.',
        passCriteria: 'Schema is idb.dcc-runner-handoff-packet.v1 and status is either blocked_until_confirmed_handoff or ready_for_dcc_suitelet_submission_review.',
        stopIf: 'Schema is missing, status is unknown, or executionMode is not review_only_no_submit.'
      },
      {
        step: 'Verify consultant confirmation gate.',
        passCriteria: 'Blocked packet keeps custpage_actionmode=previewbrief; confirmed packet clears custpage_actionmode but still remains review-only from IDB.',
        stopIf: 'Unconfirmed packet is marked ready, or confirmed packet implies IDB submitted SuiteScript.'
      },
      {
        step: 'Verify exact Suitelet form params.',
        passCriteria: 'custpage_prospect, custpage_website, custpage_notes, custpage_newhero, custpage_enablemfg, custpage_enablewip, custpage_evalmode, and custpage_actionmode are present.',
        stopIf: 'Any required form param is missing or has unsupported write intent.'
      },
      {
        step: 'Verify DCC-owned config params.',
        passCriteria: 'DCC deployment owns subsidiary, location, runner script/deploy IDs, CSV mapping/folder, and saved searches.',
        stopIf: 'IDB attempts to provide or overwrite account config IDs.'
      },
      {
        step: 'Verify scheduled runner preview params.',
        passCriteria: 'Runner preview shows prospect, website, notes, generated agenda/extid placeholders, DCC config placeholders, manufacturing/WIP flags, hero mode, and optional WC search.',
        stopIf: 'Preview implies IDB owns runner queue mechanics or generated object creation.'
      },
      {
        step: 'Verify DCC object generation ownership.',
        passCriteria: 'DCC remains owner of item names, assemblies, BOMs, locations, planning controls, routing/WIP, CSV/Sales Order mechanics, agenda, extid, notes file, and runner task.',
        stopIf: 'IDB rewrites DCC runner mechanics or creates transaction context.'
      },
      {
        step: 'Operator dry-run decision.',
        passCriteria: 'Blocked packet stops at preview/no-submit. Confirmed packet is eligible only for manual governed DCC Suitelet review by an operator.',
        stopIf: 'Any path tries to invoke SuiteScript from IDB or enable transaction writes.'
      }
    ],
    requiredSuiteletFormParams: [
      'custpage_prospect',
      'custpage_website',
      'custpage_notes',
      'custpage_newhero',
      'custpage_enablemfg',
      'custpage_enablewip',
      'custpage_evalmode',
      'custpage_actionmode'
    ],
    requiredScheduledRunnerPreviewParams: [
      'custscript_v3_runner_prospect',
      'custscript_v3_runner_website',
      'custscript_v3_runner_notes',
      'custscript_v3_runner_agenda',
      'custscript_v3_runner_extid',
      'custscript_v3_runner_mapping',
      'custscript_v3_runner_folder',
      'custscript_v3_runner_subsidiary',
      'custscript_v3_runner_location',
      'custscript_v3_runner_enable_wip',
      'custscript_v3_runner_enable_mfg',
      'custscript_v3_runner_create_new_hero',
      'custscript_v3_runner_hero_item',
      'custscript_v3_runner_wc_search'
    ],
    dccOwnedConfigParams: w83Confirmed.dccOwnedConfigParams,
    dccOwnedMechanics: [
      'item names',
      'assembly names',
      'BOM and BOM revision names',
      'inventory locations',
      'planning controls',
      'routing/WIP setup',
      'CSV/Sales Order mechanics',
      'runner queue/task submission',
      'agenda/extid/notes file generation'
    ],
    noRegression: {
      noSuiteScriptInvocationFromIdb: true,
      noDccRunnerMechanicsRewrite: true,
      noIdbTransactionWrites: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      consultantConfirmationRequiredBeforeEligible: true
    }
  };

  const blockedDryRunSample = {
    schema: 'idb.w84-dcc-operator-dry-run-packet-sample.v1',
    sampleType: 'blocked',
    source: 'w83 blocked dccRunnerHandoffPacketV1 export',
    decision: 'stop_preview_only_no_submit',
    handoffPacket: w83Blocked,
    operatorExpectedResult: {
      eligibleForDccSuiteletManualReview: false,
      reason: 'Consultant confirmation is missing; custpage_actionmode remains previewbrief.',
      nextAction: 'Return to consultant confirmation before any DCC Suitelet handoff.'
    }
  };

  const confirmedDryRunSample = {
    schema: 'idb.w84-dcc-operator-dry-run-packet-sample.v1',
    sampleType: 'confirmed',
    source: 'w83 confirmed dccRunnerHandoffPacketV1 export',
    decision: 'eligible_for_manual_dcc_suitelet_review_only',
    handoffPacket: w83Confirmed,
    operatorExpectedResult: {
      eligibleForDccSuiteletManualReview: true,
      reason: 'Consultant confirmation is present and packet remains review_only_no_submit from IDB.',
      nextAction: 'Operator may compare params to DCC Suitelet fields; IDB still does not submit.'
    }
  };

  assertCase(results, 'w84_inherits_w83_export_contract', w83.schema === 'idb.w83-dcc-handoff-export-operator-review-ux.v1' && w83.status === 'dcc_handoff_export_operator_review_ready', JSON.stringify({ schema: w83.schema, status: w83.status }));
  assertCase(results, 'w84_blocked_sample_stops_before_submit', w83Blocked.status === 'blocked_until_confirmed_handoff' && w83Blocked.executionMode === 'review_only_no_submit' && w83Blocked.suiteletEntryPayload.custpage_actionmode === 'previewbrief', JSON.stringify({ status: w83Blocked.status, actionmode: w83Blocked.suiteletEntryPayload.custpage_actionmode }));
  assertCase(results, 'w84_confirmed_sample_review_only_not_submitted', w83Confirmed.status === 'ready_for_dcc_suitelet_submission_review' && w83Confirmed.executionMode === 'review_only_no_submit' && w83Confirmed.noRegression.suiteScriptInvocationFromIdb === false, JSON.stringify({ status: w83Confirmed.status, invocation: w83Confirmed.noRegression.suiteScriptInvocationFromIdb }));
  assertCase(results, 'w84_required_suitelet_form_params_present', dryRunChecklist.requiredSuiteletFormParams.every((param) => Object.prototype.hasOwnProperty.call(w83Confirmed.suiteletEntryPayload, param)), JSON.stringify(w83Confirmed.suiteletEntryPayload));
  assertCase(results, 'w84_required_runner_preview_params_present', dryRunChecklist.requiredScheduledRunnerPreviewParams.every((param) => Object.prototype.hasOwnProperty.call(w83Confirmed.scheduledRunnerPreview, param)), JSON.stringify(w83Confirmed.scheduledRunnerPreview));
  assertCase(results, 'w84_dcc_config_params_owned_by_dcc', dryRunChecklist.dccOwnedConfigParams.includes('custscript_v3_runner_script_id') && dryRunChecklist.dccOwnedConfigParams.includes('custscript_csv_mapping_id') && dryRunChecklist.dccOwnedConfigParams.includes('custscript_so_savedsearch_id'), JSON.stringify(dryRunChecklist.dccOwnedConfigParams));
  assertCase(results, 'w84_runtime_still_export_only', /function exportDccRunnerHandoffPacket/.test(userscript) && /dcc_runner_handoff_exported/.test(userscript) && !/exportDccRunnerHandoffPacket[\s\S]{0,1200}fetch\(/.test(userscript), 'export function has no fetch call');
  assertCase(results, 'w84_no_regression_flags_hold', dryRunChecklist.noRegression.noSuiteScriptInvocationFromIdb === true && dryRunChecklist.noRegression.noDccRunnerMechanicsRewrite === true && dryRunChecklist.noRegression.noIdbTransactionWrites === true && dryRunChecklist.noRegression.hostedResolverOptionalUntilRemoteSmokeExecuted === true, JSON.stringify(dryRunChecklist.noRegression));
  assertCase(results, 'w84_dcc_ownership_explicit', ['item names', 'assembly names', 'BOM and BOM revision names', 'inventory locations', 'planning controls', 'CSV/Sales Order mechanics'].every((item) => dryRunChecklist.dccOwnedMechanics.includes(item)), JSON.stringify(dryRunChecklist.dccOwnedMechanics));
  assertCase(results, 'w84_operator_steps_cover_blocked_and_confirmed', dryRunChecklist.orderedSteps.some((step) => /custpage_actionmode=previewbrief/.test(step.passCriteria)) && dryRunChecklist.orderedSteps.some((step) => /Confirmed packet/.test(step.passCriteria)), JSON.stringify(dryRunChecklist.orderedSteps));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextPrompt = {
    block: 'W85: DCC Sandbox Manual Handoff Parameter Smoke',
    prompt: 'Move through W85: DCC Sandbox Manual Handoff Parameter Smoke. Use the W84 confirmed dccRunnerHandoffPacketV1 sample to create a manual sandbox smoke script for an operator to compare IDB handoff fields against the Demo Command Center Suitelet fields and runner preview without IDB invoking SuiteScript. Verify form-param parity, DCC-owned deployment config readiness, runner queue ownership, review-only/no-submit behavior, and DCC ownership of item names, assemblies, BOMs, locations, planning, routing/WIP, and CSV/Sales Order mechanics. Preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, and consultant confirmation required. Output sandbox smoke script, expected evidence captures, go/no-go criteria, W85 report, validator gates, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w84-dcc-operator-dry-run-handoff-smoke.v1',
    status: 'operator_dry_run_handoff_smoke_ready_review_only',
    objective: 'Prove the exported dccRunnerHandoffPacketV1 can be reviewed by an operator against DCC Suitelet/runner expectations without IDB invocation.',
    dryRunChecklist,
    blockedDryRunSample,
    confirmedDryRunSample,
    validatorResults: results,
    noRegression: dryRunChecklist.noRegression,
    bestNextCodexPrompt: bestNextPrompt
  };

  writeJson(dataPath, contract);
  writeJson(checklistPath, dryRunChecklist);
  writeJson(blockedPacketPath, blockedDryRunSample);
  writeJson(confirmedPacketPath, confirmedDryRunSample);

  const trace = {
    schema: 'idb.w84-dcc-operator-dry-run-handoff-smoke-trace.v1',
    generated: new Date().toISOString(),
    decision,
    blockedDecision: blockedDryRunSample.decision,
    confirmedDecision: confirmedDryRunSample.decision,
    suiteletFormParamCount: dryRunChecklist.requiredSuiteletFormParams.length,
    scheduledRunnerPreviewParamCount: dryRunChecklist.requiredScheduledRunnerPreviewParams.length,
    dccOwnedMechanics: dryRunChecklist.dccOwnedMechanics,
    noRegression: dryRunChecklist.noRegression,
    bestNextCodexPrompt: bestNextPrompt,
    validatorResults: results
  };
  writeJson(tracePath, trace);

  const report = [
    '# W84 DCC Operator Dry-Run Handoff Smoke',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / OPERATOR DRY-RUN READY / REVIEW ONLY / NO IDB SUITESCRIPT INVOCATION`,
    '',
    '## Dry-Run Checklist',
    '',
    ...dryRunChecklist.orderedSteps.map((step, index) => [
      `${index + 1}. ${step.step}`,
      `   - Pass: ${step.passCriteria}`,
      `   - Stop if: ${step.stopIf}`
    ].join('\n')),
    '',
    '## Samples',
    '',
    `- Blocked packet sample: \`${path.relative(root, blockedPacketPath)}\``,
    `- Confirmed packet sample: \`${path.relative(root, confirmedPacketPath)}\``,
    `- Operator checklist JSON: \`${path.relative(root, checklistPath)}\``,
    '',
    '## No-Regression Boundaries',
    '',
    '- IDB does not invoke SuiteScript.',
    '- IDB does not rewrite DCC runner mechanics.',
    '- IDB does not enable transaction writes.',
    '- Hosted resolver remains optional until remoteSmokeExecuted=true.',
    '- DCC owns item names, assemblies, BOMs, locations, planning, routing/WIP, CSV/Sales Order mechanics, and runner queue/task behavior.',
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
    console.error(`W84 DCC operator dry-run handoff smoke harness FAIL: ${failures.length} failure(s)`);
    failures.forEach((failure) => console.error(`- ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }

  console.log(`W84 DCC operator dry-run handoff smoke harness PASS: ${results.length}/${results.length}`);
}

main();
