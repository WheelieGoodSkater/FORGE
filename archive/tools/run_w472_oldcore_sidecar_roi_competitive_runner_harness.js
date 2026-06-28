#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const {
  assertCase,
  loadHooks,
  printResults,
  root
} = require('./lib/forge_harness_fixtures');

const runnerRel = path.join('netsuite', 'runner', 'scai_ss_so_csv_runner_sidecar_oldcore_roi_competitive_w472.js');
const cabinetRunnerRel = path.join('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_sidecar_oldcore_roi_competitive_w472.js');
const adapterRel = path.join('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const cabinetAdapterRel = path.join('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb_governed_runner_adapter_w144_suitelet.js');
const drawerRel = 'idb-drawer.user.js';
const cabinetDrawerRel = path.join('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
const oldRunnerPath = '/Users/aaronsunshine/Downloads/scai_ss_so_csv_runner (11).js';

function readRel(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function allPresent(source, needles) {
  return needles.every((needle) => source.includes(needle));
}

function loadAdapterTest() {
  const source = readRel(adapterRel);
  let moduleValue = null;
  const sandbox = {
    console,
    define(deps, factory) {
      moduleValue = factory(
        { accountId: 'TEST', getCurrentScript: () => ({ getParameter: () => '' }) },
        { create: () => ({ save: () => '999001', name: 'scai_naming_test.json' }), Type: { JSON: 'JSON' } },
        { audit() {}, error() {} },
        { create: () => ({ submit: () => 'task-472' }), TaskType: { SCHEDULED_SCRIPT: 'SCHEDULED_SCRIPT' } },
        {}
      );
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: adapterRel });
  if (!moduleValue || !moduleValue._test) throw new Error('adapter did not expose _test');
  return moduleValue._test;
}

function main() {
  const results = [];
  const runner = readRel(runnerRel);
  const cabinetRunner = readRel(cabinetRunnerRel);
  const adapter = readRel(adapterRel);
  const cabinetAdapter = readRel(cabinetAdapterRel);
  const drawer = readRel(drawerRel);
  const cabinetDrawer = readRel(cabinetDrawerRel);
  const oldRunner = fs.readFileSync(oldRunnerPath, 'utf8');
  const pkg = JSON.parse(readRel('package.json'));
  const adapterTest = loadAdapterTest();
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W472 harness' });

  const oldCoreFunctions = [
    'function loadPrecomputedNamingPack',
    'function discoverNamingFileIdByExtId',
    'function generateNamingPack',
    'function applyNamingToAnchors',
    'function createFreshHeroItem',
    'function adoptFreshHeroItem',
    'function ensureManufacturingAnchors',
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

  const paramAliases = [
    'custscript_v3_runner_prospect',
    'custscript_scai_so_runner_prospect',
    'custscript_v3_runner_website',
    'custscript_scai_so_runner_website',
    'custscript_v3_runner_notes',
    'custscript_scai_so_runner_notes',
    'custscript_v3_runner_agenda',
    'custscript_scai_so_runner_agenda',
    'custscript_v3_runner_extid',
    'custscript_scai_so_runner_extid',
    'custscript_v3_runner_mapping',
    'custscript_scai_so_runner_mapping',
    'custscript_v3_runner_folder',
    'custscript_scai_so_runner_folder',
    'custscript_v3_runner_subsidiary',
    'custscript_scai_runner_subsidiary',
    'custscript_v3_runner_location',
    'custscript_scai_runner_location',
    'custscript_v3_runner_wc_search',
    'custscript_scai_wc_savedsearch_id',
    'custscript_scai_runner_wc_search',
    'custscript_v3_runner_enable_wip',
    'custscript_scai_runner_enable_wip',
    'custscript_scai_runner_enablewip',
    'custscript_v3_runner_enable_mfg',
    'custscript_v3_runner_enable_manufacturing',
    'custscript_v3_runner_create_new_hero',
    'custscript_v3_runner_hero_item',
    'custscript_scai_runner_naming_file_id',
    'custscript_v3_runner_result_capture_folder',
    'custscript_idb_result_capture_folder_id',
    'custscript_v3_runner_idb_request_json'
  ];

  assertCase(results, 'w472-new-runner-files-exist-and-mirror',
    fs.existsSync(path.join(root, runnerRel)) &&
      fs.existsSync(path.join(root, cabinetRunnerRel)) &&
      runner === cabinetRunner,
    'New W472 runner should exist in netsuite/runner and FileCabinet with identical contents.');

  assertCase(results, 'w472-old-runner-11-is-canonical-core-reference',
    allPresent(oldRunner, oldCoreFunctions.filter((needle) => needle !== 'function createFreshHeroItem')) &&
      oldRunner.includes('SCAI SO CSV Runner v1.12.13'),
    'Attached runner (11) should contain the old naming, creation, routing, and CSV mechanics.');

  assertCase(results, 'w472-new-runner-preserves-old-core-functions',
    allPresent(runner, oldCoreFunctions) &&
      runner.includes("RUNNER_EXECUTION_CORE_W472 = 'old-runner-v1.12.13'") &&
      runner.includes('Restores the proven v1.12.13 runner as the executable core'),
    'W472 runner should preserve the old runner execution core while adding the sidecar bridge.');

  assertCase(results, 'w472-old-naming-authority-preserved',
    allPresent(runner, [
      'custscript_scai_runner_naming_file_id',
      'discoverNamingFileIdByExtId',
      'scai_naming_',
      'applyNamingToAnchors',
      '// 1) Resolve website-grounded naming before any records are created.',
      'authoritative-precomputed-naming-pack-preserved',
      'delete names.fallbackReason;',
      'function weakProductNameReasonW467',
      'function noisyRecordNameW468',
      'resolver-text-record-name-recovered-by-domain-product-resolver',
      'websiteresolverservicev1'
    ]) &&
      adapter.includes('resolver limited') &&
      adapter.includes('website resolver service v1') &&
      !/Resolver Limited['"].*(hero_item_name|assembly_name)|Website Resolver Service V1['"].*(hero_item_name|assembly_name)/.test(runner),
    'Naming pack loading/discovery/application should remain authoritative and meta resolver text should be rejected.');

  const namingBeforeCreate =
    runner.indexOf('// 1) Resolve website-grounded naming before any records are created.') > -1 &&
    runner.indexOf('// 1) Resolve website-grounded naming before any records are created.') < runner.indexOf('const ids = ensureDemoRecords({') &&
    runner.includes('passedHeroItemId,\n      names') &&
    runner.indexOf('freshHeroBaseNameW472(names, prospect)') > -1;

  assertCase(results, 'w472-website-naming-resolves-before-record-creation',
    namingBeforeCreate,
    'Runner should compute website/product naming before old-core record creation and pass names into fresh hero creation.');

  assertCase(results, 'w472-product-url-handles-feed-naming',
    allPresent(runner, [
      'function productNameFromProductUrlW472',
      "source: 'product_url_handle'",
      'productExampleCountW472',
      'productExampleNamesW472',
      'productNameSpecificityScoreW472',
      'weakPrecomputedNamingPayloadW472',
      'precomputedNamingSupersededByWebsiteProductsW472',
      'websiteNamingSupersedesAllPacksW472',
      "website product examples -> naming files only when website has no product evidence -> prospect fallback"
    ]) &&
      /push\(handleName, 'product_url_handle'/.test(runner) &&
      !/namingPayload\.found\s*\?\s*null/.test(runner) &&
      !/oru kayak portable folding lightweight recreational kayak for beginners/i.test(runner),
    'Runner should generically extract product names from /products/<handle> URLs without site-specific shortcuts.');

  assertCase(results, 'w472-accepts-v3-and-old-param-aliases',
    allPresent(runner, paramAliases),
    'W472 runner should accept every current sidecar and old runner parameter alias.');

  assertCase(results, 'w472-sidecar-schema-and-backcompat-fields',
    allPresent(runner, [
      'idb.runner-result-capture.w472.oldcore-roi-competitive.v1',
      'forge.completed-runner-result.v3',
      "sidecarVersion: SIDECAR_VERSION_W472",
      "runnerExecutionCore: RUNNER_EXECUTION_CORE_W472",
      "roiCompetitiveSidecarVersion: ROI_COMPETITIVE_SIDECAR_VERSION_W472",
      'finalGeneratedNamesJson',
      'completedResultJson',
      'generatedNamesJson',
      'sidecarGeneratedNamesJson',
      'partialGeneratedNamesJson',
      'displayReadyRecords',
      'recordsArray',
      'displayRecords',
      'records,'
    ]),
    'W472 result capture should bump schema while keeping drawer-compatible result fields.');

  assertCase(results, 'w472-roi-competitive-sidecar-payload',
    allPresent(runner, [
      'function buildRoiCompetitiveSidecarW472',
      'roiCompetitiveReview',
      'roiCompetitiveSourceBasis',
      'roiAudit',
      'competitive',
      'competitiveAdvisory',
      'roiCompetitiveDetailModelW444',
      'competitiveAdvisoryModelW362',
      'valueReviewPacket',
      'no_measured_roi_claim_without_buyer_baseline',
      'no_named_competitor_claim_without_buyer_source',
      'advisory_only'
    ]),
    'W472 sidecar should preserve or synthesize claim-safe ROI and competitive advisory payloads.');

  assertCase(results, 'w472-result-payload-keyed-records-and-display-arrays',
    allPresent(runner, [
      'records.customer',
      'records.demoTransaction',
      'records.salesOrder',
      'records.heroItem',
      'records.assembly',
      'componentItem${index + 1}',
      'records.bom',
      'records.bomRevision',
      'records.routing',
      'records.routingDiagnostic',
      'records.workOrder',
      'displayReadyRecordsFromKeyedRecordsW455(records)'
    ]),
    'W472 payload should include keyed records plus display-ready arrays for the drawer importer.');

  assertCase(results, 'w472-drawer-remains-queue-only-no-write-signatures',
    drawer === cabinetDrawer &&
      !/N\/record|record\.create|record\.submitFields|nlapiSubmitRecord|task\.create|N\/task/.test(drawer),
    'Drawer should remain advisory/queue-only with no direct SuiteScript write signatures.');

  const config = adapterTest.resolveRunnerConfig({
    getParameter({ name }) {
      const values = {
        custscript_idb_sandbox_account_allowlist: 'TEST',
        custscript_idb_runner_mapping_id: '100',
        custscript_idb_runner_folder_id: '200',
        custscript_idb_runner_subsidiary_id: '1',
        custscript_idb_result_capture_folder_id: '300'
      };
      return values[name] || '';
    }
  }, 'TEST');

  assertCase(results, 'w472-adapter-defaults-to-new-sidecar-runner',
    adapter === cabinetAdapter &&
      config.runnerScriptId === 'customscript_scai_ss_runner_sidecar_w472' &&
      config.runnerDeployId === 'customdeploy_scai_ss_runner_sidecar_w472' &&
      config.configuredSidecarRunnerVersion === 'W472' &&
      adapter.includes('DEFAULT_SIDECAR_RUNNER_SCRIPT_ID_W472') &&
      adapter.includes('DEFAULT_SIDECAR_RUNNER_DEPLOY_ID_W472'),
    JSON.stringify(config, null, 2));

  const params = adapterTest.buildRunnerParams({
    schema: 'idb.confirmed-build-request.v1',
    requestId: 'REQ-W472',
    buildAttemptId: 'ATT-W472',
    submittedAt: '2026-06-27T12:00:00.000Z',
    prospect: { name: 'W472 Prospect', website: 'https://example.com' },
    demoPath: { laneId: 'products_cpg', scenario: 'WIP proof' },
    storyInputs: { buyerNeed: 'Need WIP proof. Competitor: spreadsheets.', scObjective: 'Build records' },
    selectedToggles: { createNewHeroItem: true, enableManufacturing: true, enableWip: true },
    requiredRecords: ['customer', 'demoTransaction', 'heroItem', 'matrixProofItem', 'componentItem'],
    roiCompetitiveReview: { schema: 'fixture.roi', status: 'preserve' },
    roiCompetitiveSourceBasis: { schema: 'fixture.source' },
    roiAudit: { claim: 'advisory only' },
    competitive: { competitorSafeContrast: 'safe contrast' },
    competitiveAdvisory: { advisoryOnly: true },
    roiCompetitiveDetailModelW444: { roi: {}, competitive: {} },
    valueReviewPacket: { schema: 'fixture.value' }
  }, Object.assign({}, config, {
    mappingId: '100',
    folderId: '200',
    subsidiaryId: '1',
    locationId: '5',
    workCenterSearchId: '5005',
    resultCaptureFolderId: '300'
  }), 'IDB-W472', '999');
  const requestJson = JSON.parse(params.custscript_v3_runner_idb_request_json);

  assertCase(results, 'w472-adapter-passes-params-and-roi-context',
    params.custscript_v3_runner_prospect === 'W472 Prospect' &&
      params.custscript_scai_runner_naming_file_id === '999' &&
      params.custscript_v3_runner_result_capture_folder === '300' &&
      requestJson.roiCompetitiveReview &&
      requestJson.roiCompetitiveSourceBasis &&
      requestJson.roiAudit &&
      requestJson.competitive &&
      requestJson.competitiveAdvisory &&
      requestJson.roiCompetitiveDetailModelW444 &&
      requestJson.valueReviewPacket,
    JSON.stringify({ params, requestJson }, null, 2));

  const nhsState = Object.assign(hooks.defaultState(), {
    selectedLaneId: 'dealer_hardgoods',
    laneSelectionSource: 'website_evidence',
    intake: {
      customer: 'NHS Skate Direct Independent Trucks Smoke',
      website: 'https://nhsskatedirect.com/collections/independent-trucks-clothing-and-accessories',
      notes: 'Skate shop buyer needs product-specific availability and replenishment proof.',
      websiteEvidence: 'Website evidence includes concrete product examples from the page/site.'
    },
    websiteEvidenceV1: {
      schema: 'idb.website-evidence.v1',
      domain: 'nhsskatedirect.com',
      fetchStatus: 'captured',
      confidence: { state: 'recommended', score: 0.88 },
      sourceUrls: ['https://nhsskatedirect.com/collections/independent-trucks-clothing-and-accessories'],
      extractedEvidence: {
        pageTitle: 'Independent Trucks clothing and accessories',
        metaDescription: 'Independent Trucks skateboard hardware, trucks, and accessories.',
        productNames: ['Independent Trucks Stage 11 Standard', 'Chris Joslin Pro Titanium Trucks', 'Independent Trucks Inverted Kingpin'],
        productCategoryTerms: ['skateboard trucks', 'hardware', 'accessories']
      },
      signals: {
        laneCandidates: [{ laneId: 'dealer_hardgoods', score: 0.88, evidence: ['skateboard trucks', 'hardware'] }]
      }
    }
  });
  hooks.ensureWebsiteEvidenceRuntime(nhsState);
  const nhsLane = hooks.getLane(nhsState);
  const nhsPage = { title: 'NetSuite Home', url: 'https://td3021666.app.netsuite.com/app/center/card.nl', pageType: 'NetSuite page', confidence: 'low' };
  const nhsRecommendation = hooks.recommendMove(nhsLane, nhsPage);
  nhsState.acceptedPacket = hooks.buildAcceptedPacketContext(nhsState, nhsLane, nhsPage, nhsRecommendation);
  const nhsRequest = hooks.confirmedBuildRequestJsonV1(nhsState, nhsLane, nhsPage, nhsRecommendation);
  const nhsPack = adapterTest.buildServerPrecomputedNamingPack(nhsRequest);

  assertCase(results, 'w472-website-product-examples-become-item-names',
    nhsRequest.websiteEvidence &&
      nhsRequest.websiteEvidence.trustedWebsiteProductExamplesW472 &&
      nhsRequest.websiteEvidence.trustedWebsiteProductExamplesW472.length === 3 &&
      nhsPack &&
      nhsPack._source === 'suitelet-website-product-examples-naming-pack-w472' &&
      nhsPack.hero_item_name === 'Independent Trucks Stage 11 Standard' &&
      nhsPack.component_names.indexOf('Chris Joslin Pro Titanium Trucks') !== -1 &&
      nhsPack.component_names.indexOf('Independent Trucks Inverted Kingpin') !== -1 &&
      !/apparel|style matrix|resolver limited|website resolver service/i.test(JSON.stringify(nhsPack)),
    JSON.stringify({ trusted: nhsRequest.websiteEvidence && nhsRequest.websiteEvidence.trustedWebsiteProductExamplesW472, nhsPack }, null, 2));

  const weakCategoryRequest = {
    website: 'https://www.stasherbag.com/collections/best-sellers',
    prospect: { name: 'Stasher W472 Weak Category Guard' },
    precomputedNamingPack: {
      hero_item_name: 'Legacy Naming File Product',
      assembly_name: 'Legacy Naming File Assembly',
      component_names: ['Legacy Component A', 'Legacy Component B', 'Legacy Component C']
    },
    selectedToggles: { createNewHeroItem: true, enableManufacturing: false, enableWip: false },
    websiteEvidence: {
      trustedWebsiteProductExamplesW472: ['footwear', 'Sandwich Bag', 'Snack Bag', 'Stand-Up Mid Bag']
    },
    productEvidence: {
      trustedWebsiteProductExamplesW472: ['footwear']
    }
  };
  const weakCategoryPack = adapterTest.buildServerPrecomputedNamingPack(weakCategoryRequest);

  assertCase(results, 'w472-weak-category-labels-do-not-become-product-names',
    weakCategoryPack &&
      weakCategoryPack.hero_item_name === 'Sandwich Bag' &&
      weakCategoryPack.component_names.indexOf('Snack Bag') !== -1 &&
      weakCategoryPack.component_names.indexOf('Stand-Up Mid Bag') !== -1 &&
      weakCategoryPack.websiteNamingSupersedesAllPacksW472 === true &&
      weakCategoryPack.supersededExplicitNamingPackW472 === true &&
      !/footwear|apparel|style matrix|resolver limited|Legacy Naming File/i.test(JSON.stringify(weakCategoryPack)),
    JSON.stringify({ weakCategoryPack }, null, 2));

  assertCase(results, 'w472-existing-harness-scripts-retained',
    pkg.scripts['harness:restore-old-runner-naming-creation-w450'] === 'node archive/tools/run_w450_restore_old_runner_naming_creation_harness.js' &&
      pkg.scripts['harness:locked-naming-returned-links-w471'] === 'node archive/tools/run_w471_locked_naming_returned_links_harness.js' &&
      pkg.scripts['harness:oldcore-sidecar-roi-competitive-runner-w472'] === 'node archive/tools/run_w472_oldcore_sidecar_roi_competitive_runner_harness.js',
    'W450 and W471 harnesses should remain available and W472 should be exposed.');

  printResults('W472 old-core sidecar ROI/competitive runner harness', results);
}

main();
