#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const {
  assertCase,
  loadHooks,
  motionContext,
  motionState,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const drawerPath = path.join(root, 'idb-drawer.user.js');
const runnerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const reportPath = path.join(root, 'archive', 'reports', 'w444_cockpit_truth_and_resize.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadRunnerHooks() {
  const sandbox = {
    console,
    moduleResult: null,
    define: (deps, factory) => {
      const runtime = { accountId: 'TD3021666', getCurrentScript: () => ({ getParameter: () => null }) };
      const log = { audit: () => {}, error: () => {}, debug: () => {} };
      const search = { createColumn: () => ({}), Sort: { ASC: 'ASC', DESC: 'DESC' } };
      const record = { Type: { CUSTOMER: 'customer', INVENTORY_ITEM: 'inventoryitem' } };
      const noop = {};
      sandbox.moduleResult = factory(runtime, log, search, record, noop, noop, noop, noop, {}, {}, {});
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(read(runnerPath), sandbox, { filename: runnerPath });
  if (!sandbox.moduleResult || !sandbox.moduleResult.__W432_TEST_HOOKS__) throw new Error('Missing runner test hooks.');
  return sandbox.moduleResult.__W432_TEST_HOOKS__;
}

function openRecord(role, label, name, urlSuffix, extra) {
  const recordId = String(8100 + String(urlSuffix || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0));
  const roleText = String(role || '').toLowerCase();
  const recordPath = /customer/.test(roleText)
    ? 'app/common/entity/custjob.nl'
    : /sales|demand/.test(roleText)
      ? 'app/accounting/transactions/salesord.nl'
      : /bomrevision|bom_revision/.test(roleText)
        ? 'app/accounting/manufacturing/bomrevision.nl'
        : /\bbom\b/.test(roleText)
          ? 'app/accounting/manufacturing/bom.nl'
          : /work_order|workorder/.test(roleText)
            ? 'app/accounting/transactions/workord.nl'
            : 'app/common/item/item.nl';
  const url = `https://td3021666.app.netsuite.com/${recordPath}?id=${recordId}`;
  return Object.assign({
    role,
    label,
    consultantLabel: label,
    name,
    recordName: name,
    id: recordId,
    internalId: recordId,
    recordType: /customer/.test(roleText) ? 'customer' : /sales/.test(roleText) ? 'salesorder' : 'inventoryitem',
    url,
    source: 'dcc_final'
  }, extra || {});
}

function sietePlan(runnerHooks) {
  return runnerHooks.productBuildPlanW432({
    prospect: 'Siete Foods',
    website: 'https://www.sietefoods.com',
    signalText: 'Siete Maíz Sea Salt Tortilla Chips, Grain Free Tortilla Chips, Taco Shells, Seasoning Mixes, Cookies, Beans, Sauces.'
  });
}

function rawSidecar(plan) {
  return {
    schema: 'idb.runner-sidecar-result-json.v1',
    status: 'pending_transaction_resolution',
    runStatus: 'pending_transaction_resolution',
    idempotencyToken: 'W444-SIETE-EXT',
    runnerTaskId: 'task-w444',
    enableManufacturing: true,
    enableWip: true,
    toggles: { createNewHeroItem: true, enableManufacturing: true, enableWip: true },
    productBuildPlanW432: plan,
    records: {
      customer: openRecord('customer', 'Customer', 'Siete Foods Customer Account', 'customer'),
      demoTransaction: openRecord('sales_order', 'Sales Order', 'SO-W444-SIETE', 'sales-order'),
      heroItem: openRecord('hero_item', 'Sellable item', 'Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack', 'sellable'),
      assemblyItem: openRecord('assembly', 'Production Batch', 'Siete Maíz Sea Salt Tortilla Chip Production Batch', 'assembly'),
      componentItem1: openRecord('component_item', 'Ingredient Input 1', 'Siete Corn Masa Input', 'component-1'),
      componentItem2: openRecord('component_item', 'Ingredient Input 2', 'Avocado Oil Frying Input', 'component-2'),
      componentItem3: openRecord('component_item', 'Ingredient / Packaging Input 3', 'Sea Salt Seasoning and Retail Bag Packaging', 'component-3'),
      bom: openRecord('bom', 'BOM', 'BOM - Siete Maíz Sea Salt Tortilla Chips', 'bom', { recordType: 'bom' }),
      bomRevision: openRecord('bom_revision', 'BOM revision', 'Revision 1 - Siete Maíz Sea Salt Tortilla Chips', 'bom-revision', { recordType: 'bomrevision' }),
      workOrder: openRecord('work_order', 'Work Order', 'WO - Siete Maíz Sea Salt Tortilla Chips', 'work-order', { recordType: 'workorder' }),
      routingDiagnostic: {
        role: 'routingDiagnostic',
        label: 'Routing Diagnostic',
        type: 'manufacturingrouting_diagnostic',
        recordType: 'manufacturingrouting_diagnostic',
        name: 'Routing Diagnostic - Routing - Siete Maíz Sea Salt Tortilla Chips',
        requestedWip: true,
        effectiveWip: true,
        expectedRoutingName: 'Routing - Siete Maíz Sea Salt Tortilla Chips',
        staleRoutingName: 'Cookie Production Line',
        reason: 'stale_routing_name_from_prior_product'
      }
    },
    routingDiagnostic: {
      role: 'routingDiagnostic',
      type: 'manufacturingrouting_diagnostic',
      recordType: 'manufacturingrouting_diagnostic',
      expectedRoutingName: 'Routing - Siete Maíz Sea Salt Tortilla Chips',
      staleRoutingName: 'Cookie Production Line',
      reason: 'stale_routing_name_from_prior_product'
    },
    routingOperations: plan.operationNames.map((name, index) => ({
      role: `operation${index + 1}`,
      name,
      recordName: name,
      operationIndex: index,
      plannedOnly: true
    })),
    resultCapture: {
      idempotencyToken: 'W444-SIETE-EXT',
      runnerTaskId: 'task-w444',
      routingResult: {
        status: 'failed_best_effort',
        expectedRoutingName: 'Routing - Siete Maíz Sea Salt Tortilla Chips',
        actualRoutingName: 'Cookie Production Line',
        reason: 'stale_routing_name_from_prior_product'
      },
      routingOperations: plan.operationNames
    }
  };
}

function renderCockpit(drawerHooks, sidecar) {
  const baseState = motionState(drawerHooks, {
    selectedLaneId: 'food_beverage',
    intake: {
      customer: 'Siete Foods',
      website: 'https://www.sietefoods.com',
      notes: 'Siete needs fresher production signals than spreadsheets, disconnected MRP, SAP Business One, Microsoft Dynamics, QuickBooks inventory add-ons, Fishbowl, and Katana when line capacity, routing progress, and finished case output are at risk.'
    },
    toggles: { food_beverage: { createNewHeroItem: true, enableManufacturing: true, enableWip: true } },
    websiteEvidenceV1: {
      status: 'ready',
      domain: 'www.sietefoods.com',
      text: 'Siete Maíz Sea Salt Tortilla Chips, Grain Free Tortilla Chips, Taco Shells, Seasoning Mixes, Cookies, Beans, Sauces.'
    }
  });
  const context = motionContext(drawerHooks, baseState);
  const finalNaming = drawerHooks.dccFinalNamingResultV1(sidecar, baseState, context.lane, context.page, context.recommendation);
  const state = Object.assign({}, baseState, {
    dccFinalNamingResult: finalNaming,
    integratedBuildRunnerResult: {
      status: 'completed_result_ready',
      idempotencyToken: 'W444-SIETE-EXT',
      runnerTaskId: 'task-w444',
      resultCapture: sidecar.resultCapture,
      sidecarGeneratedNamesJson: sidecar
    }
  });
  const finalNavigation = drawerHooks.dccFinalNavigationModel(state, context.lane, context.page, context.recommendation);
  const html = drawerHooks.renderW415DemoCockpit({
    state,
    lane: context.lane,
    value: {
      customer: 'Siete Foods',
      roiAudit: { claim: 'Protect production reliability.', baselineNeeded: 'current miss rate, schedule delay, and manual reconciliation baseline needed' },
      grounded: {}
    },
    script: { say: 'Prove line-flow truth.', show: 'Show routing progress and finished case output.' },
    finalNavigation,
    storyContractW373: { proofLabel: 'Production proof' },
    websiteEvidence: { confidence: { displayText: 'Website evidence', scoreLabel: 'medium' }, text: 'routing production tortilla chips' },
    competitiveAdvisory: { likelyAlternatives: ['spreadsheets', 'disconnected MRP', 'SAP Business One', 'Microsoft Dynamics', 'QuickBooks inventory add-ons', 'Fishbowl', 'Katana'] }
  });
  return { state, finalNaming, finalNavigation, html, text: stripHtml(html) };
}

function main() {
  const results = [];
  const drawer = read(drawerPath);
  const runner = read(runnerPath);
  const drawerHooks = loadHooks();
  const runnerHooks = loadRunnerHooks();
  const plan = sietePlan(runnerHooks);
  const sidecar = rawSidecar(plan);
  const surface = renderCockpit(drawerHooks, sidecar);
  const text = surface.text;
  const exportPayload = drawerHooks.w444TroubleshootExportPayload(surface.state);
  const receipt = drawerHooks.lastRunReceiptW444(
    surface.state,
    surface.finalNavigation,
    drawerHooks.productCandidateModelW444(surface.state, surface.finalNavigation),
    drawerHooks.selectedBuildToggleReceiptW440(surface.state, motionContext(drawerHooks, surface.state).lane, surface.finalNavigation),
    surface.finalNavigation.scriptPivotObjects.filter((item) => /diagnostic/i.test(`${item.role || ''} ${item.label || ''}`))
  );

  assertCase(results, 'w444-marker-updated',
    /@version\s+1\.0\.55/.test(drawer) &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.55';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W447';"),
    'Drawer should identify current W447 / 1.0.55 while preserving W444 behavior.');

  assertCase(results, 'w444-wip-diagnostic-import-visible',
    /WIP \/ Routing/.test(text) &&
      /Routing Diagnostic/.test(text) &&
      /Routing - Siete Maíz Sea Salt Tortilla Chips/.test(text) &&
      /Stale detected: Cookie Production Line/.test(text) &&
      !/Manufacturing Routing\s+Cookie Production Line/i.test(text),
    text);

  assertCase(results, 'w444-planned-operations-visible-when-routing-fails',
    /Planned Operation 1\s+Mix Masa/.test(text) &&
      /Planned Operation 2\s+Sheet and Cut Tortilla Chips/.test(text) &&
      /Planned Operation 3\s+Fry in Avocado Oil/.test(text) &&
      /Planned Operation 4\s+Season with Sea Salt/.test(text) &&
      /Planned Operation 5\s+Bag, Case Pack, and QC/.test(text),
    text);

  assertCase(results, 'w444-product-candidates-visible',
    /Product:\s*Siete Maíz Sea Salt Tortilla Chips/.test(text) &&
      /Siete Grain Free Tortilla Chips/.test(text) &&
      /Siete Taco Shells/.test(text) &&
      /Siete Seasoning Mixes/.test(text) &&
      /Siete Cookies/.test(text) &&
      /Siete Beans/.test(text) &&
      /Siete Sauces/.test(text) &&
      !/Kettle Air Fried|Kettle candidate/i.test(text),
    text);

  assertCase(results, 'w444-status-health-panel',
    /idb-w444-health-panel/.test(surface.html) &&
      /idb-w444-health-(green|yellow|red)/.test(surface.html) &&
      /Records\s+\d+/.test(text) &&
      /Links\s+\d+/.test(text) &&
      /Confidence/.test(text) &&
      /Diagnostics\s+\d+/.test(text) &&
      !/idb-w415-cockpit-status">/.test(surface.html),
    surface.html);

  assertCase(results, 'w444-roi-competitive-drilldowns',
    /Why this ROI was chosen/.test(text) &&
      /Why this competitive angle was chosen|data-idb-w444-detail="competitive"/.test(text + drawer) &&
      /Source:/.test(text) &&
      /Confidence:/.test(text) &&
      /Evidence terms used:/.test(text) &&
      /baseline needed/i.test(text) &&
      /Unsupported savings claims|Measured savings need/i.test(text) &&
      drawer.includes('data-idb-w444-detail="competitive"') &&
      drawer.includes('SAP Business One') &&
      drawer.includes('Microsoft Dynamics') &&
      drawer.includes('QuickBooks inventory add-ons') &&
      drawer.includes('Fishbowl') &&
      drawer.includes('Katana') &&
      !/guaranteed savings|save \d+%|reduce costs by \d+%/i.test(text),
    text);

  assertCase(results, 'w444-clear-run-last-run-audit',
    drawer.includes('data-idb-w445-start-new-run') &&
      !drawer.includes('data-idb-w444-clear-run="all"') &&
      receipt.customer === 'Siete Foods' &&
      /sietefoods/.test(receipt.website) &&
      receipt.toggles.join(' ').includes('WIP on') &&
      /Siete Maíz/.test(receipt.selectedProduct) &&
      receipt.returnedCount > 0 &&
      receipt.diagnosticsCount > 0 &&
      receipt.extId === 'W444-SIETE-EXT',
    JSON.stringify(receipt, null, 2));

  assertCase(results, 'w444-resizable-drawer-contract',
    drawer.includes('data-idb-w444-resize-handle') &&
      drawer.includes('DRAWER_WIDTH_STORAGE_KEY_W444') &&
      drawer.includes('minWidth: 360') &&
      drawer.includes('maxWidth') &&
      !drawer.includes('data-idb-w444-width-preset="compact"') &&
      !drawer.includes('data-idb-w444-width-preset="standard"') &&
      !drawer.includes('data-idb-w444-width-preset="wide"') &&
      drawerHooks.drawerWidthContractW444().presets.wide > drawerHooks.drawerWidthContractW444().presets.standard,
    drawerHooks.drawerWidthContractW444());

  assertCase(results, 'w444-troubleshoot-export',
    !/Support \/ troubleshoot|Support views/.test(drawer) &&
      /Troubleshoot \/ Export/.test(drawer) &&
      exportPayload.drawerVersion === '1.0.55' &&
      exportPayload.drawerBlock === 'W447' &&
      exportPayload.schema === 'idb.w447-troubleshoot-export.v1' &&
      exportPayload.truthSummaryW447 &&
      exportPayload.selectedToggles.enableWip === true &&
      /Siete Maíz/.test(exportPayload.selectedProduct) &&
      exportPayload.productCandidates.alternateProductCandidates.length >= 5 &&
      exportPayload.routingWorkOrderDiagnostics.length > 0 &&
      exportPayload.routingTruth &&
      exportPayload.workOrderTruth &&
      exportPayload.recommendedReview &&
      exportPayload.returnedRecords.length > 0 &&
      exportPayload.extId === 'W444-SIETE-EXT' &&
      exportPayload.taskId === 'task-w444',
    JSON.stringify(exportPayload, null, 2));

  assertCase(results, 'w444-runner-product-and-routing-capture',
    runner.includes('primaryProductCandidate') &&
      runner.includes('alternateProductCandidates') &&
      runner.includes('selectedProductReason') &&
      runner.includes('productCandidateSource') &&
      runner.includes('nextCandidateHint') &&
      runner.includes('routingResult: args.routingResult') &&
      runner.includes('routingOperations: operationPlanRecords'),
    'Runner should expose product candidates and routing result capture.');

  const report = `# W444 Cockpit Truth And Resize

W444 validates WIP diagnostic import truth, planned operation visibility, product candidates, compact health panel, drilldowns, clear run/last run, resize, and troubleshoot export.

${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.id}`).join('\n')}
`;
  fs.writeFileSync(reportPath, report);
  printResults('W444 cockpit truth and resize harness', results);
}

main();
