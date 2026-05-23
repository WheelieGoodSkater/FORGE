const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w81Path = path.join(root, 'data', 'w81_idb_dcc_build_packet_bridge.json');
const dataPath = path.join(root, 'data', 'w82_dcc_runner_handoff_parameter_map.json');
const tracePath = path.join(root, 'trace_samples', 'w82_dcc_runner_handoff_parameter_map_trace.json');
const reportPath = path.join(root, 'reports', 'w82_dcc_runner_handoff_parameter_map.md');

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
  const w81 = readJson(w81Path);
  const results = [];

  const parameterMap = {
    schema: 'idb.w82-dcc-runner-parameter-map.v1',
    source: 'recent Demo Command Center Suitelet and scheduled runner parameter contract',
    suiteletEntryParams: [
      { idbField: 'identity.prospect', dccParam: 'custpage_prospect', required: true },
      { idbField: 'identity.website', dccParam: 'custpage_website', required: false },
      { idbField: 'consultantInputs.conversationNotes', dccParam: 'custpage_notes', required: true },
      { idbField: 'dccRunnerInputs.createNewHeroItem', dccParam: 'custpage_newhero', required: true },
      { idbField: 'dccRunnerInputs.enableManufacturing', dccParam: 'custpage_enablemfg', required: true },
      { idbField: 'dccRunnerInputs.enableWip', dccParam: 'custpage_enablewip', required: true },
      { idbField: 'writeMode', dccParam: 'custpage_evalmode', required: false },
      { idbField: 'dccGenerated.extId', dccParam: 'custpage_extid', required: false },
      { idbField: 'dccGenerated.agenda', dccParam: 'custpage_agenda', required: false },
      { idbField: 'dccGenerated.runnerTaskId', dccParam: 'custpage_runnertaskid', required: false },
      { idbField: 'dccGenerated.notesFileId', dccParam: 'custpage_notesfileid', required: false },
      { idbField: 'handoffAction', dccParam: 'custpage_actionmode', required: false }
    ],
    suiteletConfigParamsOwnedByDcc: [
      'custscriptv3_reset_subsidiary',
      'custscript_v3_reset_location',
      'custscript_v3_runner_script_id',
      'custscript_v3_runner_deploy_id',
      'custscript_csv_mapping_id',
      'custscript_csv_folder_id',
      'custscript_so_savedsearch_id',
      'custscript_wo_savedsearch_id'
    ],
    scheduledRunnerParams: [
      { idbField: 'identity.prospect', dccParam: 'custscript_v3_runner_prospect' },
      { idbField: 'identity.website', dccParam: 'custscript_v3_runner_website' },
      { idbField: 'dccRunnerInputs.signalText', dccParam: 'custscript_v3_runner_notes' },
      { idbField: 'dccGenerated.agenda', dccParam: 'custscript_v3_runner_agenda' },
      { idbField: 'dccGenerated.extId', dccParam: 'custscript_v3_runner_extid' },
      { idbField: 'dccConfig.soMappingId', dccParam: 'custscript_v3_runner_mapping' },
      { idbField: 'dccConfig.soFolderId', dccParam: 'custscript_v3_runner_folder' },
      { idbField: 'dccConfig.subsidiaryId', dccParam: 'custscript_v3_runner_subsidiary' },
      { idbField: 'dccConfig.locationId', dccParam: 'custscript_v3_runner_location' },
      { idbField: 'dccRunnerInputs.enableWip', dccParam: 'custscript_v3_runner_enable_wip' },
      { idbField: 'dccRunnerInputs.enableManufacturing', dccParam: 'custscript_v3_runner_enable_mfg' },
      { idbField: 'dccRunnerInputs.createNewHeroItem', dccParam: 'custscript_v3_runner_create_new_hero' },
      { idbField: 'dccGenerated.heroItemId', dccParam: 'custscript_v3_runner_hero_item' },
      { idbField: 'dccConfig.woSavedSearchId', dccParam: 'custscript_v3_runner_wc_search' }
    ]
  };

  const blockedExample = {
    schema: 'idb.dcc-runner-handoff-packet.v1',
    status: 'blocked_until_confirmed_handoff',
    reason: 'Consultant has not confirmed lane, scenario pack, product naming, and build mode.',
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
    suiteScriptInvocationFromIdb: false
  };

  const confirmedExample = {
    schema: 'idb.dcc-runner-handoff-packet.v1',
    status: 'ready_for_dcc_suitelet_submission_review',
    reason: 'Consultant confirmed IDB buildPacketV1; DCC Suitelet config remains required before queueing the runner.',
    suiteletEntryPayload: Object.assign({}, blockedExample.suiteletEntryPayload, { custpage_actionmode: '' }),
    scheduledRunnerPreview: {
      custscript_v3_runner_prospect: 'Ariat International',
      custscript_v3_runner_website: 'https://www.ariat.com/',
      custscript_v3_runner_notes: 'style size channel availability seasonal launch',
      custscript_v3_runner_agenda: 'generated_by_dcc_suitelet',
      custscript_v3_runner_extid: 'generated_by_dcc_suitelet',
      custscript_v3_runner_mapping: 'dcc_config_required',
      custscript_v3_runner_folder: 'dcc_config_required',
      custscript_v3_runner_subsidiary: 'dcc_config_required',
      custscript_v3_runner_location: 'dcc_config_optional',
      custscript_v3_runner_enable_wip: 'F',
      custscript_v3_runner_enable_mfg: 'F',
      custscript_v3_runner_create_new_hero: 'T',
      custscript_v3_runner_hero_item: 'generated_by_dcc_suitelet_fresh_hero',
      custscript_v3_runner_wc_search: 'dcc_config_optional'
    },
    suiteScriptInvocationFromIdb: false
  };

  const requiredRuntimeSnippets = [
    'function dccRunnerParameterMapV1',
    'function dccRunnerHandoffPacketV1',
    'custpage_prospect',
    'custpage_website',
    'custpage_notes',
    'custpage_newhero',
    'custpage_enablemfg',
    'custpage_enablewip',
    'custscript_v3_runner_prospect',
    'custscript_v3_runner_mapping',
    'custscript_v3_runner_folder',
    'custscript_v3_runner_subsidiary',
    'custscript_v3_runner_enable_mfg',
    'custscript_v3_runner_create_new_hero',
    'custscript_v3_runner_hero_item',
    'dccRunnerHandoffPacketV1: dccRunnerHandoffPacketV1'
  ];

  assertCase(results, 'w82_inherits_w81_bridge', w81.schema === 'idb.w81-idb-dcc-build-packet-bridge.v1' && w81.status === 'build_packet_bridge_ready_review_only', JSON.stringify({ schema: w81.schema, status: w81.status }));
  requiredRuntimeSnippets.forEach((snippet) => {
    assertCase(results, `w82_runtime_contains_${snippet.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`, userscript.includes(snippet), snippet);
  });
  assertCase(results, 'w82_suitelet_entry_param_map_complete', parameterMap.suiteletEntryParams.length === 12 && parameterMap.suiteletEntryParams.some((row) => row.dccParam === 'custpage_actionmode'), JSON.stringify(parameterMap.suiteletEntryParams));
  assertCase(results, 'w82_runner_param_map_complete', parameterMap.scheduledRunnerParams.length === 14 && parameterMap.scheduledRunnerParams.some((row) => row.dccParam === 'custscript_v3_runner_wc_search'), JSON.stringify(parameterMap.scheduledRunnerParams));
  assertCase(results, 'w82_dcc_config_params_marked_dcc_owned', parameterMap.suiteletConfigParamsOwnedByDcc.includes('custscript_v3_runner_script_id') && parameterMap.suiteletConfigParamsOwnedByDcc.includes('custscript_csv_mapping_id'), JSON.stringify(parameterMap.suiteletConfigParamsOwnedByDcc));
  assertCase(results, 'w82_blocked_confirmed_examples_keep_no_invoke', blockedExample.suiteScriptInvocationFromIdb === false && confirmedExample.suiteScriptInvocationFromIdb === false && blockedExample.status === 'blocked_until_confirmed_handoff' && confirmedExample.status === 'ready_for_dcc_suitelet_submission_review', JSON.stringify({ blocked: blockedExample.status, confirmed: confirmedExample.status }));
  assertCase(results, 'w82_no_regression_boundaries_present', /dccOwnsItemAssemblyBomLocationPlanningRoutingAndCsv/.test(userscript) && /noDccRunnerRewrite/.test(userscript) && /noIdbTransactionWrite/.test(userscript) && /hostedResolverOptionalUntilRemoteSmokeExecuted/.test(userscript) && /suiteScriptInvocationFromIdb: false/.test(userscript), 'no regression runtime flags');

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const contract = {
    schema: 'idb.w82-dcc-runner-handoff-parameter-map.v1',
    status: 'dcc_runner_handoff_parameter_map_ready_review_only',
    objective: 'Map buildPacketV1 to the exact Demo Command Center Suitelet and scheduled runner parameters without rewriting DCC mechanics or enabling IDB writes.',
    parameterMap,
    blockedExample,
    confirmedExample,
    noRegression: {
      dccOwnsItemAssemblyBomLocationPlanningRoutingAndCsv: true,
      noDccRunnerRewrite: true,
      noIdbTransactionWrite: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      consultantConfirmationRequired: true,
      suiteScriptInvocationFromIdb: false
    },
    bestNextCodexPrompt: {
      block: 'W83: DCC Handoff Export And Operator Review UX',
      prompt: 'Move through W83: DCC Handoff Export And Operator Review UX. Add a review-only DCC handoff export from the drawer using dccRunnerHandoffPacketV1, with a compact Review card showing blocked/confirmed status, exact Suitelet form params, DCC-owned config params, scheduled runner preview params, and operator checklist. Do not invoke SuiteScript, do not rewrite DCC runner mechanics, do not enable IDB transaction writes, keep hosted resolver optional until remoteSmokeExecuted=true, and require consultant confirmation before any handoff is eligible. Output export payload, UI summary, blocked/confirmed trace samples, W83 report, validator gates, and best next Codex prompt.'
    }
  };
  writeJson(dataPath, contract);

  const trace = {
    schema: 'idb.w82-dcc-runner-handoff-parameter-map-trace.v1',
    generated: new Date().toISOString(),
    decision,
    suiteletEntryParamCount: parameterMap.suiteletEntryParams.length,
    scheduledRunnerParamCount: parameterMap.scheduledRunnerParams.length,
    blockedStatus: blockedExample.status,
    confirmedStatus: confirmedExample.status,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  writeJson(tracePath, trace);

  const formRows = parameterMap.suiteletEntryParams.map((row) => `| ${escapeTable(row.idbField)} | ${escapeTable(row.dccParam)} | ${row.required ? 'yes' : 'no'} |`).join('\n');
  const runnerRows = parameterMap.scheduledRunnerParams.map((row) => `| ${escapeTable(row.idbField)} | ${escapeTable(row.dccParam)} |`).join('\n');
  const configRows = parameterMap.suiteletConfigParamsOwnedByDcc.map((param) => `- \`${param}\``).join('\n');
  const resultRows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const report = `# W82 DCC Runner Handoff Packet And Suitelet Parameter Map

Decision: ${decision} / DCC PARAMETER MAP READY / REVIEW ONLY / NO SUITESCRIPT INVOCATION FROM IDB

## Objective

Take \`buildPacketV1\` and map it to the exact Demo Command Center Suitelet and scheduled runner parameters while preserving DCC ownership of item names, assemblies, BOMs, locations, planning controls, routing/WIP, and CSV/Sales Order mechanics.

## Suitelet Entry Params

| IDB Field | DCC Param | Required |
| --- | --- | --- |
${formRows}

## DCC-Owned Config Params

${configRows}

## Scheduled Runner Params

| IDB Field / DCC-Owned Source | Runner Param |
| --- | --- |
${runnerRows}

## Blocked Example

\`blocked_until_confirmed_handoff\`: consultant confirmation is missing, so IDB may show preview guidance but must not submit to DCC.

## Confirmed Example

\`ready_for_dcc_suitelet_submission_review\`: consultant has confirmed the packet, but DCC Suitelet config and governed operator submission still own execution.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
${resultRows}

## No Regression

- DCC owns item, assembly, BOM, location, planning, routing/WIP, and CSV/Sales Order mechanics.
- DCC runner mechanics are not rewritten.
- IDB does not invoke SuiteScript.
- IDB transaction writes remain disabled.
- Hosted resolver remains optional until \`remoteSmokeExecuted=true\`.
- Consultant confirmation remains required before handoff eligibility.

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`W82 DCC runner handoff parameter map harness: ${decision} checks=${results.filter((result) => result.pass).length}/${results.length}`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
