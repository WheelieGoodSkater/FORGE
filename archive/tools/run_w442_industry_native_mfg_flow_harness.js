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
const reportPath = path.join(root, 'archive', 'reports', 'w442_industry_native_mfg_flow.md');

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
  const recordId = String(3000 + String(urlSuffix || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0));
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

function renderSurface(drawerHooks, toggles, records) {
  const state = motionState(drawerHooks, {
    selectedLaneId: 'food_beverage',
    intake: {
      customer: 'Siete Foods',
      website: 'https://www.sietefoods.com',
      notes: 'Siete Maíz Sea Salt Tortilla Chips production readiness with input availability, BOM, and Work Order execution.'
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
      reviewObjects: [],
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
  return { text: stripHtml(html), html, finalNavigation };
}

function sieteRecords(plan, includeWip) {
  const displayObjects = [
    openRecord('customer', 'Customer', 'Siete Foods Customer Account', 'customer'),
    openRecord('sales_order', 'Sales Order', 'SO27230', 'sales-order'),
    openRecord('hero_item', 'Sellable item', 'Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack - SNACKS-SOY123-WMU', 'sellable'),
    openRecord('assembly', 'Assembly / Finished Good', 'Siete Maíz Sea Salt Tortilla Chips Finis - SNACKS-SOY123-WMU', 'assembly'),
    openRecord('bom', 'Bill of Materials', 'BOM - Siete Maíz Sea Salt Tortilla Chips - SNACKS-SOY123-WMU', 'bom'),
    openRecord('bom_revision', 'BOM Revision', 'Revision 1 - Siete Maíz Sea Salt Tortill - SNACKS-SOY123-WMU', 'bom-revision'),
    openRecord('work_order', 'Work Order', 'WO - Siete Maíz Sea Salt Tortilla Chips', 'work-order')
  ];
  if (includeWip) {
    displayObjects.push(openRecord('routing', 'Routing', 'Routing - Siete Maíz Sea Salt Tortilla Chips', 'routing'));
    plan.operationNames.forEach((name, index) => {
      displayObjects.push(openRecord(`operation_${index + 1}`, `Operation ${index + 1}`, name, `operation-${index + 1}`));
    });
  }
  return {
    productBuildPlanW432: plan,
    displayObjects,
    componentItems: [
      openRecord('component_item', 'Ingredient / Component Item', 'Siete Corn Masa Input - SNACKS-SOY123-WMU', 'component-1', { componentIndex: 0 }),
      openRecord('component_item', 'Ingredient / Component Item', 'Avocado Oil Frying Input - SNACKS-SOY123-WMU', 'component-2', { componentIndex: 1 }),
      openRecord('component_item', 'Ingredient / Component Item', 'Sea Salt Seasoning and Retail Bag Packaging - SNACKS-SOY123-WMU', 'component-3', { componentIndex: 2 })
    ]
  };
}

function main() {
  const results = [];
  const drawer = read(drawerPath);
  const runner = read(runnerPath);
  const drawerHooks = loadHooks();
  const runnerHooks = loadRunnerHooks();
  const sietePlan = runnerHooks.productBuildPlanW432({
    prospect: 'Siete Foods',
    website: 'https://www.sietefoods.com',
    signalText: 'Siete Maíz Sea Salt Tortilla Chips, Grain Free Tortilla Chips, Taco Shells, and Seasoning Mixes.'
  });

  assertCase(results, 'w442-marker-updated',
    /@version\s+1\.0\.54/.test(drawer) &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.54';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W446';"),
    'Drawer should identify current W446 / 1.0.54 while preserving W442 behavior.');

  const mfgSurface = renderSurface(drawerHooks, { createNewHeroItem: true, enableManufacturing: true, enableWip: false }, sieteRecords(sietePlan, false));
  const mfgText = mfgSurface.text;

  assertCase(results, 'w442-siete-mfg-uses-industry-native-output',
    /Siete Maíz Sea Salt Tortilla Chip Production Batch/.test(mfgText) &&
      /production batch readiness/i.test(mfgText) &&
      /finished case output|case output/i.test(mfgText) &&
      !/Finished Good readiness|Formula or Batch Structure|Ingredient Blend|Packaging Component|SNACKS-|BEVERAGE-|RUN/.test(mfgText),
    mfgText);

  assertCase(results, 'w442-flow-groups-render',
    /CRM/.test(mfgText) &&
      /Demand/.test(mfgText) &&
      /Product \/ Inventory/.test(mfgText) &&
      /Inputs \/ Purchasing/.test(mfgText) &&
      /Manufacturing/.test(mfgText) &&
      /CRM\s+1\s+Customer/.test(mfgText) &&
      /Demand\s+1\s+Demand Order/.test(mfgText) &&
      /Inputs \/ Purchasing\s+3[\s\S]*Manufacturing\s+4/.test(mfgText),
    mfgText);

  assertCase(results, 'w442-component-descriptions-are-specific',
    runner.includes('Corn masa input used in the') &&
      runner.includes('Avocado oil frying input used during') &&
      runner.includes('Sea salt seasoning and retail bag packaging used for') &&
      !runner.includes('supports ingredient, packaging, or finished-good readiness'),
    'Runner component descriptions should be product/role-specific.');

  const distributionSurface = renderSurface(drawerHooks, { createNewHeroItem: true, enableManufacturing: false, enableWip: false }, {
    productBuildPlanW432: sietePlan,
    displayObjects: [
      openRecord('customer', 'Customer', 'Siete Foods Customer Account', 'customer'),
      openRecord('sales_order', 'Sales Order', 'SO27231', 'sales-order'),
      openRecord('hero_item', 'Product SKU', 'Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack', 'sellable'),
      openRecord('matrixProofItem', 'Availability/Replenishment Flow', 'Siete Maíz Sea Salt Tortilla Chips Retail Replenishment', 'replenishment'),
      openRecord('componentItem', 'Supporting SKU', 'Siete Maíz Sea Salt Tortilla Chips Channel Supply', 'support')
    ],
    componentItems: []
  });
  const distributionText = distributionSurface.text;

  assertCase(results, 'w442-non-mfg-preserved',
      /retail replenishment|Retail case-pack replenishment/i.test(distributionText) &&
      /case-pack availability/i.test(distributionText) &&
      /allocation/i.test(distributionText) &&
      /channel supply/i.test(distributionText) &&
      /fulfill/i.test(distributionText) &&
      !/Production Batch|BOM|Work Order|Component Input|WIP \/ Routing/i.test(distributionText),
    distributionText);

  const wipSurface = renderSurface(drawerHooks, { createNewHeroItem: true, enableManufacturing: true, enableWip: true }, sieteRecords(sietePlan, true));
  const wipText = wipSurface.text;
  assertCase(results, 'w442-wip-contract-ready',
    /WIP \/ Routing/.test(wipText) &&
      /Routing - Siete Maíz Sea Salt Tortilla Chips/.test(wipText) &&
      /Mix Masa/.test(wipText) &&
      /Sheet and Cut Tortilla Chips/.test(wipText) &&
      /Fry in Avocado Oil/.test(wipText) &&
      /Season with Sea Salt/.test(wipText) &&
      /Bag, Case Pack, and QC/.test(wipText),
    wipText);

  const beauty = runnerHooks.industryNativeManufacturingNamingW442({
    distributionBase: 'GlowCo Vitamin C Serum',
    productFamily: 'Health and Beauty Skincare',
    signalText: 'serum skincare formula batch fill run packaging'
  });
  const industrial = runnerHooks.industryNativeManufacturingNamingW442({
    distributionBase: 'Atlas Conveyor Drive Module',
    productFamily: 'Industrial Equipment',
    signalText: 'configured equipment machine subassembly motor component build'
  });
  const food = runnerHooks.industryNativeManufacturingNamingW442({
    distributionBase: 'Siete Maíz Sea Salt Tortilla Chips',
    signalText: 'food tortilla chips masa seasoning case pack'
  });
  assertCase(results, 'w442-cross-industry-taxonomy',
    /Production Batch/.test(food.industryNativeManufacturedItemName) &&
      /Batch Blend|Formula Batch/.test(`${beauty.industryNativeManufacturedItemName} ${beauty.industryManufacturingTerms.join(' ')}`) &&
      /Final Assembly Unit|Configured Equipment Build/.test(`${industrial.industryNativeManufacturedItemName} ${industrial.manufacturingOutputName}`) &&
      /SKU|case pack|replenishment|channel supply|allocation|fulfillment/i.test(drawer),
    JSON.stringify({ food, beauty, industrial }, null, 2));

  assertCase(results, 'w442-advisory-contract-updated',
    drawer.includes('idb.w442-industry-native-manufacturing-naming-contract.v1') &&
      drawer.includes('industryNativeManufacturedItemName') &&
      drawer.includes('writeAuthority') &&
      drawer.includes('creationAllowed'),
    'N/LLM advisory request should ask for W443 names without write authority.');

  const report = `# W443 Industry-Native Manufacturing Flow

W443 validates industry-native manufacturing naming, flow-grouped cockpit rows, WIP routing readiness, and cross-industry taxonomy coverage.

${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.id}`).join('\n')}
`;
  fs.writeFileSync(reportPath, report);
  printResults('W443 industry-native manufacturing flow harness', results);
}

main();
