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
const reportPath = path.join(root, 'archive', 'reports', 'w441_mfg_record_graph_naming.md');

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
  const recordId = String(2000 + String(urlSuffix || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0));
  const roleText = String(role || '').toLowerCase();
  const path = /customer/.test(roleText)
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
  const safeUrl = `https://td3021666.app.netsuite.com/${path}?id=${recordId}`;
  return Object.assign({
    role,
    consultantLabel: label,
    label,
    name,
    recordName: name,
    id: recordId,
    internalId: recordId,
    url: safeUrl,
    source: 'dcc_final',
    safeToOpen: true,
    linkAuthorityStatus: 'verified_openable',
    linkAuthority: { openable: true, url: safeUrl }
  }, extra || {});
}

function diagnosticRecord(name, extra) {
  return Object.assign({
    role: 'workOrderDiagnostic',
    consultantLabel: 'Work Order Diagnostic',
    label: 'Work Order Diagnostic',
    name,
    recordName: name,
    id: '',
    internalId: '',
    url: '',
    source: 'dcc_final',
    status: 'best_effort_failed',
    diagnostic: {
      assemblyId: 1869,
      assemblyRecordType: 'assemblyitem',
      itemType: 'assemblyitem',
      bomId: 1870,
      bomRevId: 1871,
      subsidiaryId: 1,
      locationId: 7,
      exactFieldAttempted: 'assemblyitem,item',
      errorName: 'body-field-resolution-failure',
      errorMessage: 'Work Order: could not set assembly item (assemblyId=1869)'
    }
  }, extra || {});
}

function renderSieteSurface(drawerHooks, toggles, records) {
  const state = motionState(drawerHooks, {
    selectedLaneId: 'food_beverage',
    intake: {
      customer: 'Siete Foods',
      website: 'https://www.sietefoods.com',
      notes: 'Siete Maíz Sea Salt Tortilla Chips production readiness with components, BOM, and work order.'
    },
    toggles: { food_beverage: toggles },
    websiteEvidenceV1: {
      status: 'ready',
      domain: 'www.sietefoods.com',
      text: 'Siete Maíz Sea Salt Tortilla Chips, Grain Free Tortilla Chips, Taco Shells, Seasoning Mixes.'
    },
    dccFinalNamingResult: {
      schema: 'idb.dcc-final-naming-result.v1',
      status: 'dcc_final_names_imported',
      finalNamesImported: true,
      prospect: 'Siete Foods',
      displayObjects: records.displayObjects,
      componentItems: records.componentItems || [],
      locationPlanningRecords: [],
      displayReadyRecords: [],
      productBuildPlanW432: records.productBuildPlanW432,
      workOrderDiagnostics: records.workOrderDiagnostics || null,
      toggles
    }
  });
  const context = motionContext(drawerHooks, state);
  const finalNaming = drawerHooks.dccFinalNamingResultV1(state.dccFinalNamingResult, state, context.lane, context.page, context.recommendation);
  const finalNavigation = drawerHooks.dccFinalNavigationModel(state, context.lane, context.page, context.recommendation);
  const cockpit = drawerHooks.renderW415DemoCockpit({
    state,
    lane: context.lane,
    value: {
      customer: 'Siete Foods',
      roiAudit: { claim: 'Old copy should be replaced.', baselineNeeded: 'Customer-confirmed miss rate.' },
      objections: ['Old objection should be replaced.'],
      grounded: {}
    },
    script: { say: 'Old proof should be replaced.', show: 'Old move should be replaced.' },
    finalNavigation,
    storyContractW373: { proofLabel: 'Finished-good production readiness' },
    websiteEvidence: { confidence: { displayText: 'Needs confirmation', scoreLabel: 'medium' } },
    competitiveAdvisory: {}
  });
  return {
    finalNaming,
    finalNavigation,
    text: stripHtml(cockpit)
  };
}

function main() {
  const results = [];
  const drawer = read(drawerPath);
  const runner = read(runnerPath);
  const drawerHooks = loadHooks();
  const runnerHooks = loadRunnerHooks();
  const sieteBase = {
    prospect: 'Siete Foods',
    website: 'https://www.sietefoods.com',
    signalText: 'Siete Maíz Sea Salt Tortilla Chips, Grain Free Tortilla Chips, Taco Shells, and Seasoning Mixes.',
    notes: 'Focus on Siete Maíz Sea Salt Tortilla Chips production readiness.'
  };
  const sietePlan = runnerHooks.productBuildPlanW432(sieteBase);

  assertCase(results, 'w441-marker-updated',
    /@version\s+1\.0\.52/.test(drawer) &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.52';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W444';"),
    'Drawer should identify W444 / 1.0.52 after W441.');

  const mfgSurface = renderSieteSurface(drawerHooks, { createNewHeroItem: true, enableManufacturing: true, enableWip: false }, {
    productBuildPlanW432: sietePlan,
    displayObjects: [
      openRecord('customer', 'Customer', 'Siete Foods Customer Account', 'customer'),
      openRecord('sales_order', 'Sales Order', 'SO27224', 'sales-order'),
      openRecord('hero_item', 'Sellable item', 'Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack - SNACKS-SK9R9S-OSD', 'sellable'),
      openRecord('assembly', 'Assembly / Finished Good', 'Siete Maíz Sea Salt Tortilla Chips Finis - SNACKS-SK9R9S-OSD', 'assembly'),
      openRecord('bom', 'Bill of Materials', 'BOM - Siete Maíz Sea Salt Tortilla Chips - SNACKS-SK9R9S-OSD', 'bom'),
      openRecord('bom_revision', 'BOM Revision', 'Revision 1 - Siete Maíz Sea Salt Tortill - SNACKS-SK9R9S-OSD', 'bom-revision'),
      openRecord('work_order', 'Work Order', 'WO - Siete Maíz Sea Salt Tortilla Chips', 'work-order')
    ],
    componentItems: [
      openRecord('component_item', 'Ingredient / Component Item', 'Siete Corn Masa Input - SNACKS-SK9R9S-OSD', 'component-1', { componentIndex: 0 }),
      openRecord('component_item', 'Ingredient / Component Item', 'Avocado Oil Frying Input - SNACKS-SK9R9S-OSD', 'component-2', { componentIndex: 1 }),
      openRecord('component_item', 'Ingredient / Component Item', 'Sea Salt Seasoning and Retail Bag Packaging - SNACKS-SK9R9S-OSD', 'component-3', { componentIndex: 2 })
    ]
  });
  const mfgText = mfgSurface.text;

  assertCase(results, 'w441-siete-mfg-record-graph-complete',
    /Customer\s+Siete Foods Customer Account/.test(mfgText) &&
      /Demand Order\s+SO27224/.test(mfgText) &&
      /Sellable Item\s+Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack/.test(mfgText) &&
      /Production Batch\s+Siete Maíz Sea Salt Tortilla Chip Production Batch/.test(mfgText) &&
      /Ingredient Input 1\s+Siete Corn Masa Input/.test(mfgText) &&
      /Ingredient Input 2\s+Avocado Oil Frying Input/.test(mfgText) &&
      /Ingredient \/ Packaging Input 3\s+Sea Salt Seasoning and Retail Bag Packaging/.test(mfgText) &&
      /Bill of Materials\s+BOM - Siete Maíz Sea Salt Tortilla Chips/.test(mfgText) &&
      /BOM Revision\s+Revision 1 - Siete Maíz Sea Salt Tortilla Chips/.test(mfgText) &&
      /Work Order\s+WO - Siete Maíz Sea Salt Tortilla Chips/.test(mfgText),
    mfgText);

  assertCase(results, 'w441-clean-visible-created-names',
    !/\b(SNACKS-|BEVERAGE-|FOOD_BEVERAGE)\b/i.test(mfgText) &&
      !/\s+-\s+RUN\b/i.test(mfgText) &&
      /Siete Maíz Sea Salt Tortilla Chip Production Batch/.test(mfgText) &&
      /Siete Corn Masa Input/.test(mfgText) &&
      /Avocado Oil Frying Input/.test(mfgText) &&
      /Sea Salt Seasoning and Retail Bag Packaging/.test(mfgText) &&
      /BOM - Siete Maíz Sea Salt Tortilla Chips/.test(mfgText) &&
      /Revision 1 - Siete Maíz Sea Salt Tortilla Chips/.test(mfgText),
    mfgText);

  const cleanName = runnerHooks.cleanCustomerFacingCreatedNameW441('Siete Maíz Sea Salt Tortilla Chips Finished Good - SNACKS-SK9R9S-OSD - RUN', 'assembly', sietePlan, 'manufacturing');
  assertCase(results, 'w441-internal-ids-preserved',
    cleanName === 'Siete Maíz Sea Salt Tortilla Chip Production Batch' &&
      runner.includes('internalName') &&
      runner.includes('itemIdName: buildUniqueRecordName') &&
      runner.includes('displayName: trimLen(cleanBase'),
    JSON.stringify({ cleanName }));

  const diagnosticSurface = renderSieteSurface(drawerHooks, { createNewHeroItem: true, enableManufacturing: true, enableWip: false }, {
    productBuildPlanW432: sietePlan,
    displayObjects: [
      openRecord('customer', 'Customer', 'Siete Foods Customer Account', 'customer'),
      openRecord('assembly', 'Assembly / Finished Good', 'Siete Maíz Sea Salt Tortilla Chips Finished Good', 'assembly'),
      openRecord('bom', 'Bill of Materials', 'BOM - Siete Maíz Sea Salt Tortilla Chips', 'bom'),
      openRecord('bom_revision', 'BOM Revision', 'Revision 1 - Siete Maíz Sea Salt Tortilla Chips', 'bom-revision'),
      diagnosticRecord('Work Order Diagnostic - WO - Siete Maíz Sea Salt Tortilla Chips')
    ],
    componentItems: [
      openRecord('component_item', 'Ingredient / Component Item', 'Siete Corn Masa Input', 'component-1', { componentIndex: 0 }),
      openRecord('component_item', 'Ingredient / Component Item', 'Avocado Oil Frying Input', 'component-2', { componentIndex: 1 }),
      openRecord('component_item', 'Ingredient / Component Item', 'Sea Salt Seasoning and Retail Bag Packaging', 'component-3', { componentIndex: 2 })
    ],
    workOrderDiagnostics: diagnosticRecord('Work Order Diagnostic - WO - Siete Maíz Sea Salt Tortilla Chips')
  });
  const diagnosticText = diagnosticSurface.text;
  assertCase(results, 'w441-work-order-diagnostic-not-silent',
    /Work Order Diagnostic/.test(diagnosticText) &&
      /WO - Siete Maíz Sea Salt Tortilla Chip Production Batch/.test(diagnosticText) &&
      /assemblyId/.test(JSON.stringify(diagnosticSurface.finalNaming)) &&
      /could not set assembly item/.test(JSON.stringify(diagnosticSurface.finalNaming)) &&
      !/Retail Replenishment/.test(diagnosticText),
    diagnosticText);

  const distributionSurface = renderSieteSurface(drawerHooks, { createNewHeroItem: true, enableManufacturing: false, enableWip: false }, {
    productBuildPlanW432: sietePlan,
    displayObjects: [
      openRecord('customer', 'Customer', 'Siete Foods Customer Account', 'customer'),
      openRecord('sales_order', 'Sales Order', 'SO27225', 'sales-order'),
      openRecord('hero_item', 'Product SKU', 'Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack', 'sellable'),
      openRecord('matrix_or_proof_item', 'Availability/Replenishment Flow', 'Siete Maíz Sea Salt Tortilla Chips Retail Replenishment', 'proof')
    ],
    componentItems: [
      openRecord('component_item', 'Supporting SKU', 'Siete Maíz Sea Salt Tortilla Chips Channel Supply', 'support')
    ]
  });
  const distributionText = distributionSurface.text;
  assertCase(results, 'w441-non-mfg-regression',
    /Retail Replenishment/.test(distributionText) &&
      /Channel Supply/.test(distributionText) &&
      !/\b(Assembly|BOM|BOM Revision|Work Order|Finished Good|production readiness)\b/i.test(distributionText),
    distributionText);

  assertCase(results, 'w441-runner-sidecar-clean-name-policy-present',
    runner.includes('function cleanCustomerFacingCreatedNameW441') &&
      runner.includes('workOrderDiagnostics: workOrderDiagnosticRecord') &&
      runner.includes('assemblyBomTelemetry') &&
      runner.includes('exactFieldAttempted'),
    'Runner should return clean visible names and explicit work-order diagnostics.');

  const report = `# W441 MFG Record Graph Naming

## Summary
W441 validates complete manufacturing graph display, clean customer-facing names, and explicit Work Order diagnostics.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Boundaries
- No live NetSuite smoke was run by this harness.
- Internal item ids and external ids may retain uniqueness suffixes.
- Drawer-side writes remain blocked.
`;
  fs.writeFileSync(reportPath, report);
  printResults('W441 MFG record graph naming harness', results);
}

main();
