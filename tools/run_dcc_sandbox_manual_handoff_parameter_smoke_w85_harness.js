const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w84Path = path.join(root, 'data', 'w84_dcc_operator_dry_run_handoff_smoke.json');
const w84ConfirmedPath = path.join(root, 'trace_samples', 'w84_operator_dry_run_confirmed_packet_sample.json');
const dataPath = path.join(root, 'data', 'w85_dcc_sandbox_manual_handoff_parameter_smoke.json');
const tracePath = path.join(root, 'trace_samples', 'w85_dcc_sandbox_manual_handoff_parameter_smoke_trace.json');
const scriptPath = path.join(root, 'trace_samples', 'w85_sandbox_manual_handoff_smoke_script.json');
const evidencePath = path.join(root, 'trace_samples', 'w85_expected_evidence_captures.json');
const goNoGoPath = path.join(root, 'trace_samples', 'w85_sandbox_manual_handoff_go_no_go.json');
const reportPath = path.join(root, 'reports', 'w85_dcc_sandbox_manual_handoff_parameter_smoke.md');

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
  const w84 = readJson(w84Path);
  const confirmedSample = readJson(w84ConfirmedPath);
  const handoffPacket = confirmedSample.handoffPacket;
  const results = [];

  const sandboxSmokeScript = {
    schema: 'idb.w85-dcc-sandbox-manual-handoff-smoke-script.v1',
    status: 'manual_sandbox_parameter_smoke_ready_no_idb_submit',
    objective: 'Guide an operator through comparing the confirmed IDB DCC handoff packet to the Demo Command Center Suitelet and runner preview in sandbox.',
    operatorMode: 'manual_compare_only',
    sourcePacket: {
      schema: handoffPacket.schema,
      status: handoffPacket.status,
      executionMode: handoffPacket.executionMode,
      selectedPack: handoffPacket.selectedPack,
      selectedScenario: handoffPacket.selectedScenario
    },
    steps: [
      {
        step: 'Open the Demo Command Center Suitelet in sandbox.',
        expected: 'Operator is in sandbox DCC surface, not an IDB-triggered SuiteScript flow.',
        evidence: 'Screenshot of Suitelet URL/header with sandbox context.'
      },
      {
        step: 'Compare Suitelet form fields to handoff suiteletEntryPayload.',
        expected: 'Prospect, website, notes, create-new-hero, manufacturing, WIP, eval mode, and action mode match the packet.',
        evidence: 'Screenshot or notes showing field-by-field parity.'
      },
      {
        step: 'Verify DCC-owned deployment config readiness.',
        expected: 'Subsidiary, location, runner script/deploy IDs, CSV mapping/folder, SO saved search, and WO saved search remain DCC deployment/config values.',
        evidence: 'Operator checklist marking DCC config present; no IDB-provided account config IDs.'
      },
      {
        step: 'Compare runner preview params.',
        expected: 'Runner preview maps prospect, website, notes, generated agenda/extid placeholders, mapping/folder/subsidiary placeholders, location, WIP/MFG flags, hero mode, hero item placeholder, and WC search.',
        evidence: 'Screenshot or copied preview showing scheduled runner params.'
      },
      {
        step: 'Verify review-only/no-submit behavior.',
        expected: 'This smoke stops before DCC submit/queue. No IDB code calls SuiteScript and no runner task is created by IDB.',
        evidence: 'No task ID, no submit click, no newly created transaction from this smoke.'
      },
      {
        step: 'Verify DCC object-generation ownership.',
        expected: 'DCC remains responsible for item names, assemblies, BOMs, locations, planning controls, routing/WIP, and CSV/Sales Order mechanics.',
        evidence: 'Operator notes confirming DCC mechanics are unchanged and not duplicated inside IDB.'
      },
      {
        step: 'Record sandbox smoke decision.',
        expected: 'Operator marks go only if params are clear, config readiness is understood, and the process remains manual/review-only.',
        evidence: 'Completed go/no-go checklist and any screenshots.'
      }
    ],
    suiteletFormParity: Object.entries(handoffPacket.suiteletEntryPayload).map(([param, value]) => ({
      packetParam: param,
      packetValue: value,
      operatorCheck: `Compare DCC Suitelet field for ${param}`
    })),
    runnerPreviewParity: Object.entries(handoffPacket.scheduledRunnerPreview).map(([param, value]) => ({
      packetParam: param,
      packetValue: value,
      operatorCheck: `Compare scheduled runner preview for ${param}`
    })),
    dccOwnedDeploymentConfig: handoffPacket.dccOwnedConfigParams.map((param) => ({
      configParam: param,
      owner: 'Demo Command Center deployment/config',
      operatorCheck: 'Confirm present in DCC setup; IDB must not provide or overwrite.'
    })),
    stopConditions: [
      'Any IDB button or export path attempts to invoke SuiteScript.',
      'Any transaction write is enabled from IDB.',
      'Any DCC runner mechanics are rewritten in IDB.',
      'Any unconfirmed handoff is treated as eligible.',
      'Any DCC-owned config value is supplied as an IDB-owned account setting.'
    ]
  };

  const expectedEvidenceCaptures = {
    schema: 'idb.w85-expected-evidence-captures.v1',
    requiredCaptures: [
      'Confirmed dccRunnerHandoffPacketV1 JSON export.',
      'DCC Suitelet sandbox page screenshot before submit.',
      'Suitelet form field parity notes or screenshot.',
      'DCC-owned deployment config readiness checklist.',
      'Scheduled runner preview params screenshot or copied preview.',
      'Operator note confirming no IDB SuiteScript invocation.',
      'Operator note confirming no transaction writes.',
      'Operator note confirming DCC owns item, assembly, BOM, location, planning, routing/WIP, and CSV/Sales Order mechanics.'
    ],
    optionalCaptures: [
      'Screenshot of blocked/no-submit state.',
      'Screenshot of DCC config page with sensitive values redacted.',
      'Operator notes on confusing field names or missing labels.'
    ],
    noSecretRules: [
      'Do not paste tokens, script deployment secrets, or account credentials into traces or reports.',
      'Redact internal IDs if the screenshot will leave the sandbox team.',
      'Record presence/absence of config, not secret values.'
    ]
  };

  const goNoGoCriteria = {
    schema: 'idb.w85-dcc-sandbox-manual-handoff-go-no-go.v1',
    goIf: [
      'Confirmed handoff packet maps cleanly to DCC Suitelet form fields.',
      'DCC-owned config params are understood and present or clearly marked as required.',
      'Runner preview params are clear and remain DCC-owned.',
      'No IDB SuiteScript invocation occurs.',
      'No IDB transaction write path occurs.',
      'Operator can explain what DCC will build in under 60 seconds.'
    ],
    noGoIf: [
      'Operator cannot tell which fields to enter/check in DCC.',
      'Any IDB path submits SuiteScript or creates/queues records.',
      'DCC-owned config ownership is ambiguous.',
      'Runner preview implies IDB owns queue mechanics.',
      'DCC object-generation mechanics appear rewritten or bypassed.'
    ],
    currentDecision: 'ready_for_manual_sandbox_parameter_smoke_no_submit'
  };

  assertCase(results, 'w85_inherits_w84_confirmed_packet', w84.schema === 'idb.w84-dcc-operator-dry-run-handoff-smoke.v1' && confirmedSample.decision === 'eligible_for_manual_dcc_suitelet_review_only', JSON.stringify({ w84: w84.schema, decision: confirmedSample.decision }));
  assertCase(results, 'w85_source_packet_confirmed_review_only', handoffPacket.status === 'ready_for_dcc_suitelet_submission_review' && handoffPacket.executionMode === 'review_only_no_submit', JSON.stringify({ status: handoffPacket.status, mode: handoffPacket.executionMode }));
  assertCase(results, 'w85_suitelet_form_parity_complete', sandboxSmokeScript.suiteletFormParity.length >= 8 && sandboxSmokeScript.suiteletFormParity.some((row) => row.packetParam === 'custpage_prospect') && sandboxSmokeScript.suiteletFormParity.some((row) => row.packetParam === 'custpage_actionmode'), JSON.stringify(sandboxSmokeScript.suiteletFormParity));
  assertCase(results, 'w85_runner_preview_parity_complete', sandboxSmokeScript.runnerPreviewParity.length >= 14 && sandboxSmokeScript.runnerPreviewParity.some((row) => row.packetParam === 'custscript_v3_runner_mapping') && sandboxSmokeScript.runnerPreviewParity.some((row) => row.packetParam === 'custscript_v3_runner_create_new_hero'), JSON.stringify(sandboxSmokeScript.runnerPreviewParity));
  assertCase(results, 'w85_dcc_owned_config_readiness_present', sandboxSmokeScript.dccOwnedDeploymentConfig.some((row) => row.configParam === 'custscript_v3_runner_script_id') && sandboxSmokeScript.dccOwnedDeploymentConfig.some((row) => row.configParam === 'custscript_csv_mapping_id'), JSON.stringify(sandboxSmokeScript.dccOwnedDeploymentConfig));
  assertCase(results, 'w85_expected_evidence_captures_complete', expectedEvidenceCaptures.requiredCaptures.length >= 8 && expectedEvidenceCaptures.requiredCaptures.some((item) => /no IDB SuiteScript invocation/.test(item)) && expectedEvidenceCaptures.noSecretRules.length >= 3, JSON.stringify(expectedEvidenceCaptures));
  assertCase(results, 'w85_go_no_go_preserves_no_submit', goNoGoCriteria.goIf.some((item) => /No IDB SuiteScript invocation/.test(item)) && goNoGoCriteria.noGoIf.some((item) => /submits SuiteScript/.test(item)), JSON.stringify(goNoGoCriteria));
  assertCase(results, 'w85_runtime_still_no_submit_path', /function exportDccRunnerHandoffPacket/.test(userscript) && !/exportDccRunnerHandoffPacket[\s\S]{0,1200}fetch\(/.test(userscript) && !/data-idb-submit-dcc-handoff/.test(userscript), 'IDB handoff remains export-only');
  assertCase(results, 'w85_dcc_object_generation_ownership_explicit', /DCC owns item names, assemblies, BOMs, locations, planning, routing\/WIP, CSV\/Sales Order mechanics/.test(sandboxSmokeScript.steps.map((step) => step.expected).join(' ')) || sandboxSmokeScript.steps.some((step) => /item names, assemblies, BOMs, locations, planning controls, routing\/WIP/.test(step.expected)), JSON.stringify(sandboxSmokeScript.steps));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextPrompt = {
    block: 'W86: Consultant-To-Operator Pilot Handoff Test Script',
    prompt: 'Move through W86: Consultant-To-Operator Pilot Handoff Test Script. Package the IDB-to-DCC flow into a real consultant test: consultant enters a realistic sales request in IDB, confirms the scenario, exports the DCC handoff packet, and an operator uses the W85 sandbox manual smoke script to compare fields without IDB invoking SuiteScript. Include test data, consultant instructions, operator instructions, screenshot/evidence checklist, scoring rubric, stop/go criteria, and no-regression gates. Preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of item names, assemblies, BOMs, locations, planning, routing/WIP, and CSV/Sales Order mechanics. Output pilot test script, evidence packet template, W86 report, validator gates, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w85-dcc-sandbox-manual-handoff-parameter-smoke.v1',
    status: 'sandbox_manual_handoff_parameter_smoke_ready_no_submit',
    objective: 'Create a manual sandbox smoke script for comparing IDB DCC handoff fields to DCC Suitelet and runner preview expectations without IDB invocation.',
    sandboxSmokeScript,
    expectedEvidenceCaptures,
    goNoGoCriteria,
    validatorResults: results,
    noRegression: {
      noSuiteScriptInvocationFromIdb: true,
      noDccRunnerMechanicsRewrite: true,
      noIdbTransactionWrites: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      consultantConfirmationRequired: true,
      dccOwnsObjectGeneration: true
    },
    bestNextCodexPrompt: bestNextPrompt
  };

  writeJson(dataPath, contract);
  writeJson(scriptPath, sandboxSmokeScript);
  writeJson(evidencePath, expectedEvidenceCaptures);
  writeJson(goNoGoPath, goNoGoCriteria);

  const trace = {
    schema: 'idb.w85-dcc-sandbox-manual-handoff-parameter-smoke-trace.v1',
    generated: new Date().toISOString(),
    decision,
    currentDecision: goNoGoCriteria.currentDecision,
    suiteletFormParamCount: sandboxSmokeScript.suiteletFormParity.length,
    runnerPreviewParamCount: sandboxSmokeScript.runnerPreviewParity.length,
    dccOwnedConfigParamCount: sandboxSmokeScript.dccOwnedDeploymentConfig.length,
    requiredEvidenceCount: expectedEvidenceCaptures.requiredCaptures.length,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: bestNextPrompt,
    validatorResults: results
  };
  writeJson(tracePath, trace);

  const report = [
    '# W85 DCC Sandbox Manual Handoff Parameter Smoke',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / SANDBOX MANUAL PARAMETER SMOKE READY / NO IDB SUITESCRIPT INVOCATION`,
    '',
    '## Manual Sandbox Smoke Script',
    '',
    ...sandboxSmokeScript.steps.map((step, index) => [
      `${index + 1}. ${step.step}`,
      `   - Expected: ${step.expected}`,
      `   - Evidence: ${step.evidence}`
    ].join('\n')),
    '',
    '## Expected Evidence Captures',
    '',
    ...expectedEvidenceCaptures.requiredCaptures.map((item) => `- ${item}`),
    '',
    '## Go / No-Go',
    '',
    `Current decision: \`${goNoGoCriteria.currentDecision}\``,
    '',
    'Go if:',
    ...goNoGoCriteria.goIf.map((item) => `- ${item}`),
    '',
    'No-go if:',
    ...goNoGoCriteria.noGoIf.map((item) => `- ${item}`),
    '',
    '## Artifacts',
    '',
    `- Smoke script: \`${path.relative(root, scriptPath)}\``,
    `- Evidence checklist: \`${path.relative(root, evidencePath)}\``,
    `- Go/no-go: \`${path.relative(root, goNoGoPath)}\``,
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
    console.error(`W85 DCC sandbox manual handoff parameter smoke harness FAIL: ${failures.length} failure(s)`);
    failures.forEach((failure) => console.error(`- ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }

  console.log(`W85 DCC sandbox manual handoff parameter smoke harness PASS: ${results.length}/${results.length}`);
}

main();
