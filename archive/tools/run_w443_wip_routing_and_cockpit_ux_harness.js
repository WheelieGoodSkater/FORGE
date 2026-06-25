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
const reportPath = path.join(root, 'archive', 'reports', 'w443_wip_routing_and_cockpit_ux.md');

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
  const recordId = String(7000 + String(urlSuffix || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0));
  const roleText = String(role || '').toLowerCase();
  const recordPath = /customer/.test(roleText)
    ? 'app/common/entity/custjob.nl'
    : /sales|demand/.test(roleText)
      ? 'app/accounting/transactions/salesord.nl'
      : /bom_revision/.test(roleText)
        ? 'app/accounting/manufacturing/bomrevision.nl'
        : /\bbom\b/.test(roleText)
          ? 'app/accounting/manufacturing/bom.nl'
          : /work_order|workorder/.test(roleText)
            ? 'app/accounting/transactions/workord.nl'
            : /routing/.test(roleText)
              ? 'app/accounting/manufacturing/routing.nl'
              : 'app/common/item/item.nl';
  const url = `https://td3021666.app.netsuite.com/${recordPath}?id=${recordId}`;
  return Object.assign({
    role,
    consultantLabel: label,
    label,
    name,
    recordName: name,
    id: recordId,
    internalId: recordId,
    url,
    source: 'dcc_final',
    safeToOpen: true,
    linkAuthorityStatus: 'verified_openable',
    linkAuthority: { openable: true, url }
  }, extra || {});
}

function sietePlan(runnerHooks) {
  return runnerHooks.productBuildPlanW432({
    prospect: 'Siete Foods',
    website: 'https://www.sietefoods.com',
    signalText: 'Siete Maíz Sea Salt Tortilla Chips, Grain Free Tortilla Chips, Taco Shells, Seasoning Mixes.'
  });
}

function recordsFor(plan, mode) {
  const records = [
    openRecord('customer', 'Customer', 'Siete Foods Customer Account', 'customer'),
    openRecord('sales_order', 'Sales Order', 'SO27243', 'sales-order'),
    openRecord('hero_item', 'Sellable item', 'Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack - SNACKS-SRIOU4-KGJ', 'sellable')
  ];
  const componentItems = [
    openRecord('component_item', 'Component Input 1', 'Siete Corn Masa Input - SNACKS-SRIOU4-KGJ', 'component-1', { componentIndex: 0 }),
    openRecord('component_item', 'Component Input 2', 'Avocado Oil Frying Input - SNACKS-SRIOU4-KGJ', 'component-2', { componentIndex: 1 }),
    openRecord('component_item', 'Component Input 3', 'Sea Salt Seasoning and Retail Bag Packaging - SNACKS-SRIOU4-KGJ', 'component-3', { componentIndex: 2 })
  ];
  if (mode === 'distribution') {
    records.push(openRecord('matrixProofItem', 'Availability/Replenishment Flow', 'Siete Maíz Sea Salt Tortilla Chips Retail Replenishment', 'replenishment'));
    records.push(openRecord('componentItem', 'Supporting SKU', 'Siete Maíz Sea Salt Tortilla Chips Channel Supply', 'support'));
    return { productBuildPlanW432: plan, displayObjects: records, componentItems: [] };
  }
  records.push(openRecord('assembly', 'Production Batch', 'Siete Maíz Sea Salt Tortilla Chip Produc - SNACKS-SRIOU4-KGJ', 'assembly'));
  records.push(openRecord('bom', 'Bill of Materials', 'BOM - Siete Maíz Sea Salt Tortilla Chips', 'bom'));
  records.push(openRecord('bom_revision', 'BOM Revision', 'Revision 1 - Siete Maíz Sea Salt Tortilla Chips', 'bom-revision'));
  records.push(openRecord('work_order_diagnostic', 'Work Order Diagnostic', 'WO - Siete Maíz Sea Salt Tortilla Chips', 'work-order', { diagnostic: true }));
  if (mode === 'wip') {
    records.push(openRecord('routingDiagnostic', 'Routing Diagnostic', 'Routing - Siete Maíz Sea Salt Tortilla Chips', 'routing-diagnostic', {
      requestedWip: true,
      effectiveWip: true,
      expectedRoutingName: 'Routing - Siete Maíz Sea Salt Tortilla Chips',
      staleRoutingName: 'Cookie Production Line',
      staleRoutingId: '1779',
      diagnostic: true
    }));
    plan.operationNames.forEach((name, index) => {
      records.push(openRecord(`operation_${index + 1}`, `Operation ${index + 1}`, name, `operation-${index + 1}`, { plannedOnly: true }));
    });
  }
  return { productBuildPlanW432: plan, displayObjects: records, componentItems };
}

function renderSurface(drawerHooks, toggles, records, notes) {
  const state = motionState(drawerHooks, {
    selectedLaneId: 'food_beverage',
    intake: {
      customer: 'Siete Foods',
      website: 'https://www.sietefoods.com',
      notes: notes || 'Siete Foods needs fresher production signals than spreadsheets, with ingredient availability, line capacity, routing progress, and finished case output tied to orders.'
    },
    toggles: { food_beverage: toggles },
    websiteEvidenceV1: {
      status: 'ready',
      domain: 'www.sietefoods.com',
      text: 'Siete Maíz Sea Salt Tortilla Chips and grain-free Mexican-American pantry products.'
    },
    dccFinalNamingResult: {
      schema: 'idb.dcc-final-naming-result.v1',
      status: 'dcc_final_names_imported',
      finalNamesImported: true,
      prospect: 'Siete Foods',
      displayObjects: records.displayObjects,
      componentItems: records.componentItems || [],
      locationPlanningRecords: [],
      reviewObjects: [],
      displayReadyRecords: [],
      productBuildPlanW432: records.productBuildPlanW432,
      toggles
    }
  });
  const context = motionContext(drawerHooks, state);
  const finalNavigation = drawerHooks.dccFinalNavigationModel(state, context.lane, context.page, context.recommendation);
  const html = drawerHooks.renderW415DemoCockpit({
    state,
    lane: context.lane,
    value: {
      customer: 'Siete Foods',
      roiAudit: { claim: 'Old ROI copy should not survive.', baselineNeeded: 'Customer-confirmed miss rate.' },
      objections: ['Old objection should not survive.'],
      grounded: {}
    },
    script: { say: 'Old story should not survive.', show: 'Old proof move should not survive.' },
    finalNavigation,
    storyContractW373: { proofLabel: 'Old proof label' },
    websiteEvidence: { confidence: { displayText: 'Needs confirmation', scoreLabel: 'medium' } },
    competitiveAdvisory: {}
  });
  return { state, html, text: stripHtml(html), finalNavigation };
}

function main() {
  const results = [];
  const drawer = read(drawerPath);
  const runner = read(runnerPath);
  const drawerHooks = loadHooks();
  const runnerHooks = loadRunnerHooks();
  const plan = sietePlan(runnerHooks);

  assertCase(results, 'w443-marker-updated',
    /@version\s+1\.0\.(57|58|59)/.test(drawer) &&
      /const DRAWER_USERSCRIPT_VERSION = '1\.0\.(57|58|59)';/.test(drawer) &&
      /const CURRENT_UX_BLOCK_W346 = 'W(449|450|451)';/.test(drawer),
    'Drawer should identify current W449/W450/W451 while preserving W443 behavior.');

  const wipSurface = renderSurface(drawerHooks, { createNewHeroItem: true, enableManufacturing: true, enableWip: true }, recordsFor(plan, 'wip'));
  const wipText = wipSurface.text;

  assertCase(results, 'w443-cockpit-header-not-scrunched',
    /idb-w415-cockpit-heading/.test(wipSurface.html) &&
      /idb-w415-cockpit-status-panel/.test(wipSurface.html) &&
      /Siete Foods/.test(wipText) &&
      /WIP line-flow readiness|production batch readiness/i.test(wipText) &&
      /Records\s+\d+/.test(wipText) &&
      /Links\s+\d+/.test(wipText) &&
      /New item on/.test(wipText) &&
      /Manufacturing on/.test(wipText) &&
      /WIP on/.test(wipText),
    wipText);

  assertCase(results, 'w443-food-input-labels-are-industry-native',
    /Ingredient Input 1\s+Siete Corn Masa Input/.test(wipText) &&
      /Ingredient Input 2\s+Avocado Oil Frying Input/.test(wipText) &&
      /Ingredient \/ Packaging Input 3\s+Sea Salt Seasoning and Retail Bag Packaging/.test(wipText) &&
      !/Component Input 1|Component Input 2|Component Input 3/.test(wipText),
    wipText);

  const staleRouting = runnerHooks.validateRoutingForProductPlanW443({ id: '1779', name: 'Cookie Production Line' }, plan, { expectedRoutingName: plan.routingName });
  const validRouting = runnerHooks.validateRoutingForProductPlanW443({ id: '2001', name: 'Routing - Siete Maíz Sea Salt Tortilla Chips' }, plan, { expectedRoutingName: plan.routingName });
  assertCase(results, 'w443-wip-routing-product-specific-or-diagnostic',
    /Routing Diagnostic/i.test(wipText) &&
      /Routing - Siete Maíz Sea Salt Tortilla Chips/.test(wipText) &&
      staleRouting.stale === true &&
      staleRouting.valid === false &&
      validRouting.valid === true &&
      /Stale detected: Cookie Production Line/.test(wipText) &&
      !/Manufacturing Routing\s+Cookie Production Line|Mixing & Dough Preparation|Baking & Cooling|Fudge Coating & Packaging/.test(wipText),
    JSON.stringify({ staleRouting, validRouting, wipText }, null, 2));

  assertCase(results, 'w443-wip-operation-flow-visible',
    /Mix Masa/.test(wipText) &&
      /Sheet and Cut Tortilla Chips/.test(wipText) &&
      /Fry in Avocado Oil/.test(wipText) &&
      /Season with Sea Salt/.test(wipText) &&
      /Bag, Case Pack, and QC/.test(wipText),
    wipText);

  assertCase(results, 'w443-proof-flow-copy-not-truncated',
    /Proof Flow|Operating Flow/.test(wipText) &&
      !/Story with embedded records/i.test(wipText) &&
      !/\.\.\./.test(wipText) &&
      /customer demand/i.test(wipText) &&
      /ingredient availability/i.test(wipText) &&
      /production batch/i.test(wipText) &&
      /routing operations/i.test(wipText) &&
      /finished case output/i.test(wipText),
    wipText);

  const distributionText = renderSurface(drawerHooks, { createNewHeroItem: true, enableManufacturing: false, enableWip: false }, recordsFor(plan, 'distribution')).text;
  const mfgText = renderSurface(drawerHooks, { createNewHeroItem: true, enableManufacturing: true, enableWip: false }, recordsFor(plan, 'manufacturing')).text;
  assertCase(results, 'w443-workflow-visual-follows-toggles',
    /CRM/.test(distributionText) &&
      /Demand/.test(distributionText) &&
      /Product SKU/.test(distributionText) &&
      /Replenishment/.test(distributionText) &&
      /Fulfillment/.test(distributionText) &&
      !/Routing \/ Line Flow|Operations/.test(distributionText) &&
      /Ingredients \/ Inputs/.test(mfgText) &&
      /Production Batch/.test(mfgText) &&
      /BOM \/ Revision/.test(mfgText) &&
      /Work Order/.test(mfgText) &&
      /Finished Case Output/.test(mfgText) &&
      /Demand & Procurement/.test(wipText) &&
      /Production \/ WIP/.test(wipText) &&
      /Output & Impact/.test(wipText) &&
      /Operation 1|Planned Operation 1/.test(wipText),
    JSON.stringify({ distributionText, mfgText, wipText }));

  assertCase(results, 'w443-roi-competitive-source-confidence',
    /Source:\s*(conversation notes|website industry fallback|nllm advisory)/i.test(wipText) &&
      /Confidence:\s*\d+%/.test(wipText) &&
      /Decrease customer-promise risk/i.test(wipText) &&
      /fresher proof/i.test(wipText) &&
      /demand, supply, WIP routing, Work Order status, and finished output/i.test(wipText),
    wipText);

  assertCase(results, 'w443-nllm-advisory-boundary-preserved',
    drawer.includes('idb.w443-wip-routing-value-advisory-contract.v1') &&
      drawer.includes('cockpitValueNarrative') &&
      drawer.includes('industrySpecificRoutingOperationNames') &&
      drawer.includes('writeAuthority') &&
      drawer.includes('creationAllowed') &&
      drawer.includes("writeAuthority: 'none'") &&
      drawer.includes('creationAllowed: false'),
    'W443 advisory contract should request value/routing copy while preserving no-write authority.');

  assertCase(results, 'w443-runner-diagnostic-fields-present',
    runner.includes('function validateRoutingForProductPlanW443') &&
      runner.includes('buildRoutingDiagnosticRecordW443') &&
      runner.includes('staleRoutingName') &&
      runner.includes('attemptedOperationNames'),
    'Runner should expose product-specific routing validation and explicit diagnostic fields.');

  const report = `# W443 WIP Routing And Cockpit UX

W443 validates product-specific WIP routing truth, cockpit header layout, industry-native row labels, proof-flow copy, workflow visual, and advisory value copy.

${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.id}`).join('\n')}
`;
  fs.writeFileSync(reportPath, report);
  printResults('W443 WIP routing and cockpit UX harness', results);
}

main();
