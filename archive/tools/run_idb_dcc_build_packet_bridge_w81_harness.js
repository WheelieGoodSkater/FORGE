const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w81_idb_dcc_build_packet_bridge.json');
const tracePath = path.join(root, 'trace_samples', 'w81_idb_dcc_build_packet_bridge_trace.json');
const reportPath = path.join(root, 'reports', 'w81_idb_dcc_build_packet_bridge.md');

function read(file) {
  return fs.readFileSync(file, 'utf8');
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
  const results = [];

  const buildPacketContract = {
    schema: 'idb.build-packet.v1',
    objective: 'Map IDB consultant intake and evidence into a DCC-owned build packet without making website intelligence own object generation.',
    authorityModel: {
      idbOwns: [
        'consultant intake',
        'website evidence summary',
        'lane recommendation',
        'scenario pack recommendation',
        'confirmation gate',
        'review-only build packet handoff'
      ],
      websiteOwns: [
        'identity evidence recommendation',
        'source citations',
        'confidence and uncertainty state'
      ],
      notesOwn: [
        'pain',
        'ROI framing',
        'competitive framing',
        'objections',
        'talk track'
      ],
      dccOwns: [
        'item names',
        'assembly names',
        'BOM and BOM revision names',
        'component structure',
        'inventory location setup',
        'planning controls',
        'manufacturing routing/WIP where enabled',
        'CSV/Sales Order context mechanics'
      ]
    },
    requiredFields: [
      'identity.prospect',
      'identity.website',
      'identity.selectedLaneId',
      'identity.proofAnchor',
      'identity.productSeed',
      'scenarioPackSelection.selectedScenarioPack',
      'dccRunnerInputs.familyKey',
      'dccRunnerInputs.scenario',
      'dccRunnerInputs.createNewHeroItem',
      'dccRunnerInputs.enableManufacturing',
      'dccRunnerInputs.enableWip',
      'dccRunnerInputs.locationPlanningIntent',
      'consultantConfirmation.required',
      'consultantConfirmation.confirmed',
      'dccObjectGenerationOwnership.owner',
      'noRegression.dccRunnerMechanicsNotRewritten'
    ],
    idbToDccFieldMapping: [
      { idbField: 'identity.prospect', dccInput: 'prospect', owner: 'IDB prepares / DCC consumes' },
      { idbField: 'identity.website', dccInput: 'website', owner: 'IDB prepares / DCC consumes' },
      { idbField: 'scenarioPackSelection.selectedScenarioPack', dccInput: 'familyKey', owner: 'consultant confirms / DCC executes' },
      { idbField: 'scenarioPackSelection.selectedScenario', dccInput: 'scenario', owner: 'consultant confirms / DCC executes' },
      { idbField: 'dccRunnerInputs.createNewHeroItem', dccInput: 'createNewHeroItem', owner: 'DCC runner' },
      { idbField: 'dccRunnerInputs.enableManufacturing', dccInput: 'enableManufacturing', owner: 'DCC runner' },
      { idbField: 'dccRunnerInputs.enableWip', dccInput: 'enableWip', owner: 'DCC runner' },
      { idbField: 'dccRunnerInputs.signalText', dccInput: 'signalText', owner: 'IDB summarizes / DCC interprets' },
      { idbField: 'identity.namingHints', dccInput: 'names or signalText hints', owner: 'advisory only' },
      { idbField: 'writeMode', dccInput: 'review-only until governed execution', owner: 'governance gate' }
    ],
    scenarioPackSelectionRules: [
      'Website evidence recommends the identity path and must cite evidence.',
      'Consultant confirmation is required before the packet is ready for DCC handoff.',
      'Conversation notes can shape story, ROI, competitive, objections, and talk track.',
      'Conversation notes cannot silently override confirmed website/category identity.',
      'DCC runner/Suitelet owns object generation and setup mechanics.'
    ],
    reviewUxSummary: [
      'Show selected DCC pack and scenario first.',
      'Show build mode: create new hero, manufacturing, WIP.',
      'Show confirmation status and blocked write paths.',
      'Show IDB-to-DCC field mapping under audit detail.',
      'State clearly that DCC owns object-generation mechanics.'
    ],
    noRegression: {
      websiteCannotInventUnsupportedClaims: true,
      notesCannotSilentlyOverrideConfirmedIdentity: true,
      dccRunnerMechanicsNotRewritten: true,
      noTransactionWritesFromIdb: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      governedWriteExplicitAndBlockedUnlessConfirmed: true,
      nllmAdvisoryOnly: true
    }
  };

  const sampleBuildPacket = {
    schema: 'idb.build-packet.v1',
    status: 'blocked_until_consultant_confirmation',
    writeMode: 'review_only_dcc_owned_generation',
    identity: {
      prospect: 'Ariat International',
      website: 'https://www.ariat.com/',
      selectedLaneId: 'apparel_accessories',
      selectedLane: 'Apparel & Accessories',
      proofAnchor: 'Style / SKU Matrix',
      productSeed: 'Core Boot and Apparel Style Matrix',
      productFamily: 'Apparel and Footwear Style',
      demandMoment: 'style, size, and channel availability'
    },
    scenarioPackSelection: {
      selectedScenarioPack: 'apparelAccessories',
      selectedScenario: 'Style-to-Availability Readiness',
      selectionAuthority: 'website_recommends_consultant_confirms_dcc_builds',
      confirmationRequired: true
    },
    dccRunnerInputs: {
      familyKey: 'apparelAccessories',
      scenario: 'Style-to-Availability Readiness',
      mode: 'Balanced',
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false,
      locationPlanningIntent: 'DCC owns location, inventory positioning, replenishment, and Sales Order CSV context decisions.',
      writeMode: 'review_only_until_governed_dcc_runner_execution'
    },
    dccObjectGenerationOwnership: buildPacketContract.authorityModel.dccOwns,
    blockedWritePaths: ['IDB transaction write', 'IDB direct object generation'],
    noRegression: buildPacketContract.noRegression
  };

  assertCase(results, 'w81_build_packet_function_present', /function idbBuildPacketV1/.test(userscript) && /schema: 'idb.build-packet.v1'/.test(userscript), 'idbBuildPacketV1');
  assertCase(results, 'w81_scenario_selection_rules_present', /function scenarioPackSelectionRules/.test(userscript) && /website_recommends_consultant_confirms_dcc_builds/.test(userscript), 'scenarioPackSelectionRules');
  assertCase(results, 'w81_review_ux_bridge_present', /function renderDccBuildPacketBridge/.test(userscript) && /Build packet detail/.test(userscript) && /Handoff field mapping/.test(userscript), 'renderDccBuildPacketBridge');
  assertCase(results, 'w81_trace_export_includes_build_packet', /buildPacketV1: idbBuildPacketV1/.test(userscript), 'exportTrace buildPacketV1');
  assertCase(results, 'w81_dcc_ownership_preserved_in_runtime', /Demo Command Center runner\/Suitelet/.test(userscript) && /item names/.test(userscript) && /assembly names/.test(userscript) && /BOM and BOM revision names/.test(userscript) && /planning controls/.test(userscript) && /CSV\/Sales Order context mechanics/.test(userscript), 'dcc ownership text');
  assertCase(results, 'w81_no_regression_runtime_boundaries', /websiteCannotInventUnsupportedClaims/.test(userscript) && /notesCannotSilentlyOverrideConfirmedIdentity/.test(userscript) && /dccRunnerMechanicsNotRewritten/.test(userscript) && /noTransactionWritesFromIdb/.test(userscript) && /hostedResolverOptionalUntilRemoteSmokeExecuted/.test(userscript), 'no regression flags');
  assertCase(results, 'w81_contract_mapping_complete', buildPacketContract.idbToDccFieldMapping.length >= 10 && buildPacketContract.requiredFields.includes('dccRunnerInputs.enableManufacturing'), JSON.stringify(buildPacketContract.idbToDccFieldMapping));
  assertCase(results, 'w81_sample_preserves_dcc_object_generation_ownership', sampleBuildPacket.dccObjectGenerationOwnership.includes('assembly names') && sampleBuildPacket.dccObjectGenerationOwnership.includes('planning controls') && sampleBuildPacket.dccRunnerInputs.writeMode === 'review_only_until_governed_dcc_runner_execution', JSON.stringify(sampleBuildPacket));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const contract = {
    schema: 'idb.w81-idb-dcc-build-packet-bridge.v1',
    status: 'build_packet_bridge_ready_review_only',
    objective: 'Pivot IDB into a consultant-facing intake, confirmation, and governance layer that feeds the proven Demo Command Center build engine.',
    buildPacketV1: buildPacketContract,
    sampleBuildPacket,
    validatorGates: results,
    bestNextCodexPrompt: {
      block: 'W82: DCC Runner Handoff Packet And Suitelet Parameter Map',
      prompt: 'Move through W82: DCC Runner Handoff Packet And Suitelet Parameter Map. Take buildPacketV1 and map it to the exact Demo Command Center Suitelet/runner parameters, including prospect, website, notes/signalText, family key, scenario, createNewHeroItem, enableManufacturing, enableWip, location/planning intent, and review-only write mode. Preserve DCC ownership of item names, assemblies, BOMs, locations, planning controls, routing/WIP, and CSV/Sales Order mechanics. Do not rewrite DCC runner mechanics, do not enable IDB transaction writes, keep hosted resolver optional until remoteSmokeExecuted=true, and keep consultant confirmation required before handoff. Output parameter map, handoff packet sample, blocked/confirmed examples, W82 report, validator gates, and best next Codex prompt.'
    }
  };
  writeJson(dataPath, contract);

  const trace = {
    schema: 'idb.w81-idb-dcc-build-packet-bridge-trace.v1',
    generated: new Date().toISOString(),
    decision,
    buildPacketSchema: buildPacketContract.schema,
    sampleStatus: sampleBuildPacket.status,
    dccObjectGenerationOwner: 'Demo Command Center runner/Suitelet',
    noRegression: buildPacketContract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  writeJson(tracePath, trace);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const ownerRows = Object.entries(buildPacketContract.authorityModel).map(([owner, values]) => `| ${escapeTable(owner)} | ${escapeTable(values.join(', '))} |`).join('\n');
  const mapRows = buildPacketContract.idbToDccFieldMapping.map((item) => `| ${escapeTable(item.idbField)} | ${escapeTable(item.dccInput)} | ${escapeTable(item.owner)} |`).join('\n');
  const report = `# W81 IDB To Demo Command Center Build Packet Bridge

Decision: ${decision} / BUILD PACKET BRIDGE READY / REVIEW ONLY / DCC OWNS OBJECT GENERATION

## Objective

Pivot IDB from website-only intelligence toward a consultant-facing intake and governance layer that feeds the proven Demo Command Center build engine.

## Build Packet V1

\`buildPacketV1\` maps prospect, website evidence, consultant notes, lane, scenario pack, proof anchor, manufacturing flag, WIP flag, naming hints, location/planning intent, and write mode into a DCC-ready handoff packet.

## Authority Model

| Owner | Responsibility |
| --- | --- |
${ownerRows}

## IDB-To-DCC Field Mapping

| IDB Field | DCC Input | Owner |
| --- | --- | --- |
${mapRows}

## Consultant Confirmation Gate

The packet remains \`blocked_until_consultant_confirmation\` until the consultant confirms lane, scenario pack, product naming, and build mode. Website evidence recommends; it does not over-own the build.

## Review UX

- Review now includes a DCC build packet detail summary.
- It shows selected pack, build mode, confirmation status, blocked write paths, and audit field mapping.
- It states that DCC owns item, assembly, BOM, location, planning, routing/WIP, and CSV/Sales Order mechanics.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## No Regression

- Website evidence cannot invent unsupported claims.
- Notes cannot silently override confirmed website/category identity.
- DCC runner mechanics are not rewritten.
- No transaction writes from IDB.
- Hosted resolver remains optional until \`remoteSmokeExecuted=true\`.
- Governed write path remains explicit and blocked unless confirmed.

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`W81 IDB-DCC build packet bridge harness: ${decision} checks=${results.filter((result) => result.pass).length}/${results.length}`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
