#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults,
  root
} = require('./lib/forge_harness_fixtures');

const runnerRel = path.join('netsuite', 'runner', 'scai_ss_so_csv_runner_oldcore_simple_sidecar_w482.js');
const cabinetRunnerRel = path.join('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_oldcore_simple_sidecar_w482.js');
const adapterRel = path.join('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const cabinetAdapterRel = path.join('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb_governed_runner_adapter_w144_suitelet.js');
const drawerRel = 'idb-drawer.user.js';
const cabinetDrawerRel = path.join('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
const objectRel = path.join('src', 'Objects', 'customscript_scai_ss_runner_simple_w482.xml');
const oldRunnerPath = '/Users/aaronsunshine/Downloads/scai_ss_so_csv_runner (10).js';

function readRel(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function allPresent(source, needles) {
  return needles.every((needle) => source.includes(needle));
}

function count(source, needle) {
  return source.split(needle).length - 1;
}

function main() {
  const results = [];
  const runner = readRel(runnerRel);
  const cabinetRunner = readRel(cabinetRunnerRel);
  const adapter = readRel(adapterRel);
  const cabinetAdapter = readRel(cabinetAdapterRel);
  const drawer = readRel(drawerRel);
  const cabinetDrawer = readRel(cabinetDrawerRel);
  const objectXml = readRel(objectRel);
  const oldRunner = fs.readFileSync(oldRunnerPath, 'utf8');
  const runnerLines = runner.split(/\r?\n/).length;

  const oldCoreFunctions = [
    'function loadPrecomputedNamingPack',
    'function discoverNamingFileIdByExtId',
    'function generateNamingPack',
    'function applyNamingToAnchors',
    'function createFreshHeroItem',
    'function adoptFreshHeroItem',
    'function ensureDemoRecords',
    'function ensureInventoryItemByExternalId',
    'function ensureAssemblyItemByExternalId',
    'function ensureBomByExternalId',
    'function ensureBomRevisionByExternalId',
    'function setBomRevisionComponents',
    'function attachBomToAssembly',
    'function createAndAttachRoutingIfPossible',
    'function buildSoCsv',
    'function submitCsvImport'
  ];

  assertCase(results, 'w482-new-runner-files-exist-and-mirror',
    fs.existsSync(path.join(root, runnerRel)) &&
      fs.existsSync(path.join(root, cabinetRunnerRel)) &&
      runner === cabinetRunner,
    'W482 runner should exist in netsuite/runner and FileCabinet with identical contents.');

  assertCase(results, 'w482-seeded-from-attached-old-runner',
    oldRunner.includes('SCAI SO CSV Runner v1.12.13') &&
      allPresent(runner, oldCoreFunctions) &&
      runner.includes("RUNNER_EXECUTION_CORE_W482 = 'old-runner-v1.12.13'"),
    'W482 should keep the attached old runner naming, creation, routing, and CSV mechanics.');

  assertCase(results, 'w482-runner-stays-smaller-than-bloated-w472',
    runnerLines < 3800 &&
      !runner.includes('runnerLaneVocabularyPolicyW453') &&
      !runner.includes('idbDistributionProofNamesW341') &&
      !runner.includes('domain_catalog_resolver') &&
      !runner.includes('nllmComponentNamesUsed') &&
      !runner.includes('WEAK_PRODUCT_NAME_BLOCKLIST_W467'),
    `W482 should be compact old-core plus sidecar; observed ${runnerLines} lines.`);

  assertCase(results, 'w482-v3-adapter-param-aliases-supported',
    allPresent(runner, [
      'custscript_w482_prospect',
      'custscript_w482_website',
      'custscript_w482_notes',
      'custscript_w482_extid',
      'custscript_w482_mapping',
      'custscript_w482_folder',
      'custscript_w482_subsidiary',
      'custscript_w482_location',
      'custscript_w482_enable_wip',
      'custscript_w482_enable_mfg',
      'custscript_w482_create_hero',
      'custscript_w482_result_folder',
      'custscript_w482_req_json',
      'custscript_v3_runner_prospect',
      'custscript_v3_runner_idb_request_json'
    ]),
    'W482 should accept the W144/V3 runner parameter names.');

  assertCase(results, 'w482-sidecar-return-shape-includes-records-roi-competitive',
    allPresent(runner, [
      'function writeForgeSidecarResultW482',
      'function buildReturnedRecordsW482',
      "schema: 'forge.completed-runner-result.v3'",
      "schema: 'idb.runner-result-capture.w482.oldcore-simple-sidecar.v1'",
      'displayReadyRecords',
      'roiCompetitiveReview',
      'roiAudit',
      'competitiveAdvisory',
      'valueReviewPacket'
    ]),
    'W482 should return display records plus ROI and competitive objects for the sidecar.');

  assertCase(results, 'w482-adapter-defaults-route-to-new-runner',
    adapter === cabinetAdapter &&
      adapter.includes("DEFAULT_SIDECAR_RUNNER_SCRIPT_ID_W482 = 'customscript_scai_ss_runner_simple_w482'") &&
      adapter.includes("DEFAULT_SIDECAR_RUNNER_DEPLOY_ID_W482 = 'customdeploy_scai_ss_runner_simple_w482'") &&
      adapter.includes("resultCaptureFolderId: 'custscript_w482_result_folder'") &&
      !adapter.includes('DEFAULT_SIDECAR_RUNNER_SCRIPT_ID_W472') &&
      !adapter.includes('DEFAULT_SIDECAR_RUNNER_DEPLOY_ID_W472'),
    'W144 adapter defaults should route to the W482 scheduled runner.');

  assertCase(results, 'w482-suitecloud-object-defines-script-deployment-and-params',
    fs.existsSync(path.join(root, objectRel)) &&
      objectXml.includes('<scheduledscript scriptid="customscript_scai_ss_runner_simple_w482">') &&
      objectXml.includes('<scriptdeployment scriptid="customdeploy_scai_ss_runner_simple_w482">') &&
      objectXml.includes('<scriptfile>[/SuiteScripts/Intelligent Demo Builder/scai_ss_so_csv_runner_oldcore_simple_sidecar_w482.js]</scriptfile>') &&
      allPresent(objectXml, [
        'custscript_w482_prospect',
        'custscript_w482_website',
        'custscript_w482_notes',
        'custscript_w482_extid',
        'custscript_w482_mapping',
        'custscript_w482_folder',
        'custscript_w482_subsidiary',
        'custscript_w482_location',
        'custscript_w482_enable_wip',
        'custscript_w482_enable_mfg',
        'custscript_w482_create_hero',
        'custscript_w482_naming_file',
        'custscript_w482_result_folder',
        'custscript_w482_req_json'
      ]),
    'W482 SuiteCloud object should create the scheduled script, deployment, file reference, and runner parameters.');

  const setupRenderer = drawer.slice(drawer.indexOf('function renderDemoSetup'), drawer.indexOf('function renderSetupPlan'));
  const buildPrep = drawer.slice(drawer.indexOf('const prepareOneClickBuildRecordsPath'), drawer.indexOf('const submitBuildRecordsOnce'));
  assertCase(results, 'w482-drawer-visible-setup-is-three-fields-toggles-buttons',
    drawer === cabinetDrawer &&
      allPresent(setupRenderer, [
        'Customer / Prospect Name',
        'Website',
        'Conversation Notes',
        'renderToggleControls(state, lane)',
        'Build Records',
        'Clear/New Run'
      ]) &&
      !setupRenderer.includes('Optional website/category evidence') &&
      !setupRenderer.includes('Admin/debug: legacy intake fields') &&
      !setupRenderer.includes('Recommended lane') &&
      !setupRenderer.includes('Draft autosaved') &&
      !setupRenderer.includes('Request saved'),
    'Setup panel should expose only the three required inputs, toggles, Build Records, and Clear/New Run.');

  assertCase(results, 'w482-drawer-build-no-longer-blocks-for-manual-lane-selection',
    buildPrep.includes("state.lanePickerOpen = false") &&
      buildPrep.includes("state.laneSelectionSource = 'automatic_website_hidden'") &&
      !buildPrep.includes('one_click_build_records_blocked_for_website_review_w419') &&
      !buildPrep.includes('Unknown website should not auto-commit a lane from notes alone.'),
    'Build Records should not interrupt the simple flow with a lane picker.');

  assertCase(results, 'w482-primary-visible-buttons-are-constrained',
    count(setupRenderer, '>Build Records<') >= 1 &&
      count(setupRenderer, '>Clear/New Run<') >= 1 &&
      !setupRenderer.includes('Change lane manually') &&
      !setupRenderer.includes('Troubleshoot / Export'),
    'The simplified request surface should not show lane/debug action buttons.');

  printResults('W482 old-core simple sidecar harness', results);
}

main();
