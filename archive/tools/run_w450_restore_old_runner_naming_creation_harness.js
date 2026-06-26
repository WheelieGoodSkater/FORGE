#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const runnerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const runnerCopyPath = path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const olderRunnerPath = '/Users/aaronsunshine/Downloads/scai_ss_so_csv_runner (10).js';
const packagePath = path.join(root, 'package.json');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function allPresent(source, needles) {
  return needles.every((needle) => source.includes(needle));
}

function main() {
  const runner = read(runnerPath);
  const runnerCopy = read(runnerCopyPath);
  const olderRunner = read(olderRunnerPath);
  const pkg = JSON.parse(read(packagePath));
  const results = [];

  const oldCoreFunctions = [
    'function loadPrecomputedNamingPack',
    'function discoverNamingFileIdByExtId',
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
    'function createAndAttachRoutingIfPossible'
  ];

  assertCase(results, 'w453-old-runner-reference-canonical',
    allPresent(olderRunner, oldCoreFunctions.slice(0, -1)) &&
      olderRunner.includes('function createAndAttachRoutingIfPossible'),
    'Attached older runner should remain the canonical baseline for naming, creation, Work Order, and WIP routing.');

  assertCase(results, 'w453-current-runner-restores-old-core',
    allPresent(runner, oldCoreFunctions) &&
      runner.includes("RELEASE_TRANCHE = 'w453-legacy-runner-core-sidecar-bridge'") &&
      runner.includes('Restores the proven v1.12.13 runner as the executable core'),
    'Current runner should be the old core plus a W453 compatibility bridge.');

  assertCase(results, 'w453-v3-parameter-bridge',
    allPresent(runner, [
      'custscript_v3_runner_prospect',
      'custscript_v3_runner_website',
      'custscript_v3_runner_notes',
      'custscript_v3_runner_extid',
      'custscript_v3_runner_mapping',
      'custscript_v3_runner_folder',
      'custscript_v3_runner_result_capture_folder',
      'custscript_v3_runner_idb_request_json',
      'function getScriptParamAny',
      'function parseEmbeddedJson'
    ]),
    'Old runner core should accept current Suitelet v3 parameter names.');

  assertCase(results, 'w453-sidecar-result-bridge',
    allPresent(runner, [
      'function writeIdbSidecarResultCaptureW453',
      'finalGeneratedNamesJson',
      'sidecarGeneratedNamesJson',
      'partialGeneratedNamesJson',
      'completedResultJson',
      'generatedRecordOwner',
      'governed_runner_internal_build_engine',
      'pending_transaction_resolution',
      'realMissingUrls'
    ]),
    'Runner should write compact drawer-compatible result capture with governed owner and URL truth.');

  assertCase(results, 'w453-error-truth-sidecar',
    allPresent(runner, [
      'function writeIdbErrorSidecarResultCaptureW453',
      "status: 'error'",
      "runnerStatus: 'error'",
      "taskStatus: 'error'",
      'IDB sidecar ERROR capture W453 legacy core'
    ]),
    'Runner should write an error result capture before rethrowing terminal failures.');

  assertCase(results, 'w453-direct-three-step-wip-routing',
    runner.includes("addStep(10, opNames.op10 || 'Blending'") &&
      runner.includes("addStep(20, opNames.op20 || 'Dispensing'") &&
      runner.includes("addStep(30, opNames.op30 || 'Packaging'") &&
      runner.includes('buildRoutingOperationRowW453(1, 10') &&
      !runner.includes('W450_INSUFFICIENT_ACCEPTED_ROUTING_STEPS') &&
      !runner.includes('probeRoutingStepPair') &&
      !runner.includes('createAndAttachRoutingLegacyDirectW452'),
    'WIP should use the old direct three-step routing path, not the W450-W452 probe engine.');

  assertCase(results, 'w453-work-order-and-routing-best-effort',
    allPresent(runner, [
      'Work Order best-effort failure W453 legacy core',
      'WIP routing best-effort failure W453 legacy core',
      "finalStatus: effectiveEnableWip && !routingId ? 'completed_with_wip_diagnostic' : 'completed'"
    ]),
    'WO/routing failures should return diagnostics without blocking CSV/sidecar.');

  assertCase(results, 'w453-fresh-hero-created-when-v3-does-not-pass-item',
    runner.includes("handshakeAction = 'fresh-mode-runner-will-create-hero'") &&
      runner.includes('const created = createFreshHeroItem') &&
      !runner.includes('Fresh hero mode requires custscript_scai_runner_hero_item'),
    'Fresh v3 runs should create the hero item in the runner when no hero id was passed.');

  const freshHeroFn = runner.slice(runner.indexOf('function createFreshHeroItem'), runner.indexOf('function applyFreshHeroPersistence'));
  const itemAssemblyCreateFn = runner.slice(runner.indexOf('function createInventoryOrAssemblyWithLocationRetryW453'), runner.indexOf('function ensureBomByExternalId'));
  const subsLocFn = runner.slice(runner.indexOf('function buildSubsLocValues'), runner.indexOf('// ----------------------------', runner.indexOf('function buildSubsLocValues')));

  assertCase(results, 'w453-old-runner-location-first-with-invalid-sub-fallback',
    runner.includes('function isInvalidSubLocationErrorW453') &&
      runner.includes('function clearBodyLocationW453') &&
      runner.includes('itemBodyLocationPolicy') &&
      runner.includes('createInventoryOrAssemblyWithLocationRetryW453') &&
      freshHeroFn.includes("fieldId: 'location', value: Number(locationId)") &&
      itemAssemblyCreateFn.includes("fieldId: 'location', value: Number(locationId)") &&
      freshHeroFn.includes('clearBodyLocationW453(rec)') &&
      itemAssemblyCreateFn.includes('clearBodyLocationW453(rec)') &&
      subsLocFn.includes('values.location = locationId') &&
      runner.includes('old-runner-location-first-clear-copied-body-location-on-invalid-sub'),
    'Fresh hero, component, assembly, and existing item updates should apply the run location like the old runner, with INVALID_SUB fallback only.');

  assertCase(results, 'w453-result-size-guard',
    runner.includes('const maxChars = 9000000') &&
      runner.includes('text.length > maxChars ? text.slice(0, maxChars) : text'),
    'Result capture should stay below NetSuite 10 MB file content limit.');

  assertCase(results, 'w453-synced-runner-copy',
    runnerCopy === runner,
    'NetSuite runner copy should match FileCabinet runner source.');

  assertCase(results, 'w450-package-script-retained',
    pkg.scripts && pkg.scripts['harness:restore-old-runner-naming-creation-w450'] === 'node archive/tools/run_w450_restore_old_runner_naming_creation_harness.js',
    'Existing package script should continue to run the reset harness.');

  printResults('W453 legacy runner core + sidecar bridge harness', results);
}

main();
