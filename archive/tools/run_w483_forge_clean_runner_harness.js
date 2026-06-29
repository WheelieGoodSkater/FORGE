#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults,
  root
} = require('./lib/forge_harness_fixtures');

const runnerRel = path.join('netsuite', 'runner', 'scai_ss_so_csv_runner_forge_clean_w483.js');
const cabinetRunnerRel = path.join('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_forge_clean_w483.js');
const objectRel = path.join('src', 'Objects', 'customscript_scai_w483_clean.xml');
const oldRunnerPath = '/Users/aaronsunshine/Downloads/scai_ss_so_csv_runner (12).js';

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

  assertCase(results, 'w483-new-runner-files-exist-and-mirror',
    fs.existsSync(path.join(root, runnerRel)) &&
      fs.existsSync(path.join(root, cabinetRunnerRel)) &&
      runner === cabinetRunner,
    'W483 runner should exist in netsuite/runner and FileCabinet with identical contents.');

  assertCase(results, 'w483-seeded-from-attached-old-runner',
    oldRunner.includes('SCAI SO CSV Runner v1.12.13') &&
      allPresent(runner, oldCoreFunctions) &&
      runner.includes("RUNNER_EXECUTION_CORE_W483 = 'old-runner-v1.12.13'"),
    'W483 should keep the attached old runner naming, creation, routing, and CSV mechanics.');

  assertCase(results, 'w483-runner-stays-smaller-than-bloated-w472',
    runnerLines < 3800 &&
      !runner.includes('runnerLaneVocabularyPolicyW453') &&
      !runner.includes('idbDistributionProofNamesW341') &&
      !runner.includes('domain_catalog_resolver') &&
      !runner.includes('nllmComponentNamesUsed') &&
      !runner.includes('WEAK_PRODUCT_NAME_BLOCKLIST_W467'),
    `W483 should be compact old-core plus sidecar; observed ${runnerLines} lines.`);

  assertCase(results, 'w483-v3-adapter-param-aliases-supported',
    allPresent(runner, [
      'custscript_w483_prospect',
      'custscript_w483_website',
      'custscript_w483_notes',
      'custscript_w483_extid',
      'custscript_w483_mapping',
      'custscript_w483_folder',
      'custscript_w483_subsidiary',
      'custscript_w483_location',
      'custscript_w483_enable_wip',
      'custscript_w483_enable_mfg',
      'custscript_w483_create_hero',
      'custscript_w483_result_folder',
      'custscript_w483_req_json',
      'custscript_v3_runner_prospect',
      'custscript_v3_runner_idb_request_json'
    ]),
    'W483 should accept the W144/V3 runner parameter names.');

  assertCase(results, 'w483-sidecar-return-shape-includes-records-roi-competitive',
    allPresent(runner, [
      'function writeForgeSidecarResultW483',
      'function buildReturnedRecordsW483',
      "schema: 'forge.completed-runner-result.v3'",
      "schema: 'idb.runner-result-capture.w483.forge-clean.v1'",
      'displayReadyRecords',
      'roiCompetitiveReview',
      'roiAudit',
      'competitiveAdvisory',
      'valueReviewPacket'
    ]),
    'W483 should return display records plus ROI and competitive objects for the sidecar.');

  assertCase(results, 'w483-website-signal-naming-pack-is-generic-not-brand-baked',
    allPresent(runner, [
      'function buildWebsiteSignalNamingPackW483',
      'w483-website-signal-naming-pack',
      'Electric Guitar',
      'Musical Instruments Manufacturing',
      'website_signal_text_w483',
      'operation_names_by_seq'
    ]) &&
      !/Les Paul|Gibson|Stratocaster|Fender/.test(runner),
    'W483 should derive old-runner naming packs from generic website product signals, not hardcoded brand cases.');

  assertCase(results, 'w483-suitecloud-object-defines-script-deployment-and-params',
    fs.existsSync(path.join(root, objectRel)) &&
      objectXml.includes('<scheduledscript scriptid="customscript_scai_w483_clean">') &&
      objectXml.includes('<scriptdeployment scriptid="customdeploy_scai_w483_clean">') &&
      !/scriptid="[^"]{41,}"/.test(objectXml) &&
      objectXml.includes('<scriptfile>[/SuiteScripts/Intelligent Demo Builder/scai_ss_so_csv_runner_forge_clean_w483.js]</scriptfile>') &&
      allPresent(objectXml, [
        'custscript_w483_prospect',
        'custscript_w483_website',
        'custscript_w483_notes',
        'custscript_w483_extid',
        'custscript_w483_mapping',
        'custscript_w483_folder',
        'custscript_w483_subsidiary',
        'custscript_w483_location',
        'custscript_w483_enable_wip',
        'custscript_w483_enable_mfg',
        'custscript_w483_create_hero',
        'custscript_w483_naming_file',
        'custscript_w483_result_folder',
        'custscript_w483_req_json'
      ]),
    'W483 SuiteCloud object should create the scheduled script, deployment, file reference, and runner parameters.');

  printResults('W483 FORGE clean runner harness', results);
}

main();
