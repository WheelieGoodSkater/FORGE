#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const {
  assertCase,
  loadHooks,
  motionContext,
  motionState,
  printResults,
  root
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function loadAdapterTest(relPath) {
  const source = readRepoFile(relPath);
  let moduleValue = null;
  const sandbox = {
    console,
    define(deps, factory) {
      moduleValue = factory(
        { accountId: 'TEST', getCurrentScript: () => ({ getParameter: () => '' }) },
        { create: () => ({ save: () => '999001', name: 'scai_naming_test.json' }), Type: { JSON: 'JSON' } },
        { audit() {}, error() {} },
        {},
        {}
      );
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: relPath });
  if (!moduleValue || !moduleValue._test) throw new Error(`${relPath} did not expose _test`);
  return moduleValue._test;
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W471 harness' });
  const runner = readRepoFile('netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
  const runnerCabinet = readRepoFile('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
  const drawer = readRepoFile('idb-drawer.user.js');
  const drawerCabinet = readRepoFile('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const adapterCabinet = readRepoFile('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb_governed_runner_adapter_w144_suitelet.js');
  const adapterTest = loadAdapterTest('netsuite/idb_governed_runner_adapter_w144_suitelet.js');

  assertCase(results, 'w471-runtime-copies-synced',
    runner === runnerCabinet && drawer === drawerCabinet && adapter === adapterCabinet,
    'Root runtime files must match FileCabinet copies.');

  assertCase(results, 'w471-runner-preserves-applied-old-runner-pack',
    runner.includes('names.namingPackPreserved = true;') &&
      runner.includes('names.namingSourceUsed = namingPayload.source || names._source') &&
      runner.includes('delete names.fallbackReason;') &&
      runner.includes("policy: 'authoritative-precomputed-naming-pack-preserved'") &&
      runner.indexOf('if (authoritativePackApplied) {') < runner.indexOf('const selectedCandidate = names.selectedCatalogCandidate'),
    'Applied naming packs must return before weak-name governance and product-first overrides can mutate them.');

  assertCase(results, 'w471-old-bad-noisy-fallback-literals-absent',
    !/old-runner-prospect-fallback-noisy-pack-blocked|old_runner_noisy_pack_blocked|Weak record naming|Weak product naming/i.test(runner),
    'Runner must not contain old noisy-pack fallback reason literals.');

  const resolverLimitedPack = adapterTest.buildServerPrecomputedNamingPack({
    prospect: { name: 'Bellroy W471 Carry Replenishment Smoke', website: 'https://bellroy.com' },
    websiteResolverOutput: {
      title: 'Resolver Limited',
      productNames: [
        'Resolver Limited',
        'Public Website Fetch Is Resolver-Limited',
        'Website Resolver Service V1',
        'Product / SKU',
        'Catalog Product'
      ]
    },
    websiteEvidence: {
      productNames: [
        'Resolver Limited',
        'Public Website Fetch Is Resolver-Limited',
        'Website Resolver Service V1'
      ]
    },
    storyInputs: {
      buyerNeed: 'Transit Backpack replenishment for back-to-office demand.'
    }
  });

  assertCase(results, 'w471-resolver-meta-text-rejected-before-pack-selection',
    resolverLimitedPack._source === 'suitelet-prospect-fallback-naming-pack' &&
      !/Resolver Limited|Public Website Fetch Is Resolver-Limited|Website Resolver Service V1|Product \/ SKU|Catalog Product/i.test(JSON.stringify({
        hero: resolverLimitedPack.hero_item_name,
        assembly: resolverLimitedPack.assembly_name,
        components: resolverLimitedPack.component_names,
        bom: resolverLimitedPack.bom_name,
        revision: resolverLimitedPack.bom_revision_name,
        routing: resolverLimitedPack.routing_name
      })),
    JSON.stringify(resolverLimitedPack, null, 2));

  assertCase(results, 'w471-suitelet-can-omit-weak-prospect-only-pack',
    adapter.includes("clean_naming_pack_omitted_runner_deterministic_fallback") &&
      adapter.includes("namingPackHandoff.status !== 'clean_naming_pack_omitted_runner_deterministic_fallback'"),
    'Weak resolver/prospect-only packs should be omitted without blocking runner submit.');

  const bellroyResult = {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runnerStatus: 'completed',
    taskStatus: 'completed',
    prospect: 'Bellroy W471 Carry Replenishment Smoke',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    finalGeneratedNamesJson: {
      status: 'completed',
      runStatus: 'completed',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      displayReadyRecords: [
        {
          role: 'customer',
          label: 'Customer',
          name: 'Bellroy W471 Carry Replenishment Smoke',
          id: '1716',
          recordType: 'customer',
          url: 'https://123456.app.netsuite.com/app/common/entity/custjob.nl?id=1716'
        },
        {
          role: 'sales_order',
          label: 'Sales Order',
          name: 'SO2788',
          id: '88638',
          recordType: 'salesorder',
          url: 'https://123456.app.netsuite.com/app/accounting/transactions/salesord.nl?id=88638'
        },
        {
          role: 'sales_order',
          label: 'Sales Order duplicate',
          name: 'SO2788',
          id: '88638',
          recordType: 'salesorder',
          url: 'https://123456.app.netsuite.com/app/accounting/transactions/salesord.nl?id=88638'
        },
        {
          role: 'hero_item',
          label: 'Hero item',
          name: 'Bellroy Transit Backpack Availability SKU',
          id: '10255',
          recordType: 'inventoryitem',
          url: 'https://123456.app.netsuite.com/app/common/item/item.nl?id=10255'
        },
        {
          role: 'routingDiagnostic',
          label: 'Routing diagnostic',
          name: 'Routing Diagnostic - not requested',
          id: '',
          recordType: 'manufacturingrouting_diagnostic',
          url: ''
        }
      ]
    },
    completedResultJson: {
      displayReadyRecords: []
    },
    recordsArray: [],
    displayRecords: []
  };
  const state = motionState(hooks, {
    intake: {
      customer: 'Bellroy W471 Carry Replenishment Smoke',
      website: 'https://bellroy.com',
      notes: 'Transit Backpack replenishment, distribution only.'
    },
    integratedBuildRunnerResult: {
      status: 'completed',
      runnerStatus: 'completed',
      taskStatus: 'completed',
      resultCapture: {
        fileId: '65278',
        sourceFileId: '65278',
        status: 'completed',
        finalGeneratedNamesJson: bellroyResult
      },
      finalGeneratedNamesJson: bellroyResult
    }
  });
  const context = motionContext(hooks, state);
  const importResult = hooks.commitRunnerSidecarDisplayResultW431(
    state,
    context.lane,
    context.page,
    context.recommendation,
    state.integratedBuildRunnerResult,
    { source: 'w471-bellroy-terminal-fixture' }
  );
  const imported = importResult.statePatch && importResult.statePatch.dccFinalNamingResult || {};
  const visibleRecords = (imported.displayReadyRecords || []).filter((record) => record.normalConsultantVisible !== false);
  const salesOrders = visibleRecords.filter((record) => record.recordType === 'salesorder' || record.canonicalRole === 'sales_order');

  assertCase(results, 'w471-bellroy-final-generated-display-ready-records-import',
    importResult.imported === true &&
      imported.finalNamesImported === true &&
      visibleRecords.length === 3 &&
      salesOrders.length === 1 &&
      visibleRecords.every((record) => record.safeToOpen === true && record.linkAuthorityStatus === 'verified_openable') &&
      visibleRecords.some((record) => record.name === 'Bellroy Transit Backpack Availability SKU'),
    JSON.stringify({ status: importResult.status, visibleRecords }, null, 2));

  assertCase(results, 'w471-drawer-terminal-import-branches-present',
    drawer.includes('terminalRunnerResultDisplayRecordsW471') &&
      drawer.includes('source.finalGeneratedNamesJson') &&
      drawer.includes('source.completedResultJson') &&
      drawer.includes('source.generatedNamesJson') &&
      drawer.includes('source.sidecarGeneratedNamesJson') &&
      drawer.includes('recordType || canonicalRole') &&
      drawer.includes('absoluteNetSuiteRecordUrl(linked.url ||'),
    'Drawer should normalize all terminal sidecar shapes and dedupe by type/id/url.');

  printResults('W471 locked naming + returned links harness', results);
}

main();
