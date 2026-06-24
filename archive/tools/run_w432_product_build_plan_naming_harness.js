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
const reportPath = path.join(root, 'archive', 'reports', 'w432_product_build_plan_naming.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function loadRunnerHooks() {
  const sandbox = {
    console,
    moduleResult: null,
    define: (deps, factory) => {
      const runtime = { accountId: 'TD3021666', getCurrentScript: () => ({ getParameter: () => null }) };
      const log = { audit: () => {}, error: () => {}, debug: () => {} };
      const search = { createColumn: () => ({}), Sort: { ASC: 'ASC', DESC: 'DESC' } };
      const record = { Type: { CUSTOMER: 'customer' } };
      const noop = {};
      sandbox.moduleResult = factory(runtime, log, search, record, noop, noop, noop, noop, {}, {}, {});
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(read(runnerPath), sandbox, { filename: runnerPath });
  if (!sandbox.moduleResult || !sandbox.moduleResult.__W432_TEST_HOOKS__) throw new Error('Missing runner W432 test hooks.');
  return sandbox.moduleResult.__W432_TEST_HOOKS__;
}

function hasNone(text, terms) {
  return !terms.some((term) => new RegExp(`\\b${term}\\b`, 'i').test(text));
}

function activeNameText(names) {
  return JSON.stringify({
    hero_item_name: names.hero_item_name,
    assembly_name: names.assembly_name,
    component_names: names.component_names,
    bom_name: names.bom_name,
    bom_revision_name: names.bom_revision_name,
    routing_name: names.routing_name,
    operation_names_by_seq: names.operation_names_by_seq
  });
}

function main() {
  const results = [];
  const drawer = read(drawerPath);
  const runner = read(runnerPath);
  const runnerHooks = loadRunnerHooks();
  const drawerHooks = loadHooks();
  const websiteText = [
    'Kettle Brand Air Fried Sea Salt & Vinegar kettle chips are batch cooked in kettles then air fried.',
    '6.5 oz bag. 30% less fat. Products include Himalayan Salt, Jalapeno, Sea Salt and Vinegar, Texas BBQ.'
  ].join(' ');
  const base = {
    prospect: 'Kettle Brand Snacks',
    website: 'https://www.kettlebrand.com',
    signalText: websiteText,
    notes: 'Ops wants a snack product replenishment and production proof.',
    agenda: 'Air Fried Sea Salt & Vinegar product readiness'
  };

  const terms = runnerHooks.extractWebsiteProductTermsW432(base);
  const plan = runnerHooks.productBuildPlanW432(base);
  const newItemNames = runnerHooks.applyToggleAwareNamingGuardrails(
    runnerHooks.generateNamingPack(base),
    Object.assign({}, base, { enableManufacturing: false, enableWip: false })
  );
  const mfgNames = runnerHooks.applyToggleAwareNamingGuardrails(
    runnerHooks.generateNamingPack(base),
    Object.assign({}, base, { enableManufacturing: true, enableWip: false })
  );
  const wipNames = runnerHooks.applyToggleAwareNamingGuardrails(
    runnerHooks.generateNamingPack(base),
    Object.assign({}, base, { enableManufacturing: true, enableWip: true })
  );
  const newItemText = JSON.stringify(newItemNames);
  const mfgText = JSON.stringify(mfgNames);
  const wipText = JSON.stringify(wipNames);
  const newItemActiveText = activeNameText(newItemNames);
  const mfgActiveText = activeNameText(mfgNames);
  const wipActiveText = activeNameText(wipNames);
  const newItemRoleLabelsText = JSON.stringify(newItemNames._toggleAwareNamingGuardrail && newItemNames._toggleAwareNamingGuardrail.laneVocabularyPolicy && newItemNames._toggleAwareNamingGuardrail.laneVocabularyPolicy.finalResultRoleLabels || {});
  const forbiddenCreateOnly = ['Finished Good', 'Ingredient', 'Formula', 'Batch', 'BOM', 'Assembly', 'Work Order', 'Routing', 'WIP', 'Production Line', 'BEVERAGE'];

  const state = motionState(drawerHooks, {
    selectedLaneId: 'food_beverage',
    intake: {
      customer: 'Kettle Brand Snacks',
      website: 'https://www.kettlebrand.com',
      notes: websiteText
    },
    toggles: {
      food_beverage: {
        createNewHeroItem: true,
        enableManufacturing: true,
        enableWip: true
      }
    },
    websiteEvidenceV1: {
      status: 'ready',
      domain: 'www.kettlebrand.com',
      text: websiteText
    }
  });
  const context = motionContext(drawerHooks, state);
  const advisoryRequest = drawerHooks.buildRecordNamingAdvisoryRequest(
    state,
    context.lane,
    drawerHooks.dryRunObjectPacket(state, context.lane, context.page, context.recommendation)
  );
  const genericValidation = drawerHooks.nllmRecordNamingGroundingValidationW429(advisoryRequest, {
    sourceBasis: 'website_product',
    productSeed: 'Finished Good',
    productFamily: 'Food, Beverage & CPG Manufacturing',
    recordNames: [
      { proposedName: 'Kettle Brand Snacks Finished Good - BEVERAGE-S53PQR-F1L' },
      { proposedName: 'Ingredient Blend' },
      { proposedName: 'Packaging Component' }
    ],
    writeAuthority: 'none',
    creationAllowed: false
  });

  assertCase(results, 'w432-marker-updated',
    /@version\s+1\.0\.40/.test(drawer) &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.40';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W432';"),
    'Drawer should identify W432 / 1.0.40.');

  assertCase(results, 'w432-runner-test-hooks-present',
    runner.includes('__W432_TEST_HOOKS__') &&
      typeof runnerHooks.productBuildPlanW432 === 'function' &&
      typeof runnerHooks.applyToggleAwareNamingGuardrails === 'function',
    'Runner should expose W432 helpers to the harness.');

  assertCase(results, 'w432-kettle-product-terms-extracted',
    /Air Fried Sea Salt & Vinegar/.test(terms.selectedProductCandidate) &&
      /6\.5 oz bag/.test(terms.sellableUnit) &&
      terms.websiteTermsUsed.includes('kettle chips'),
    JSON.stringify(terms));

  assertCase(results, 'w432-new-item-only-uses-distribution-language',
    /Air Fried Sea Salt & Vinegar/.test(newItemActiveText) &&
      /(Case Pack|replenishment|Channel Supply|SKU|availability)/i.test(newItemActiveText) &&
      hasNone(newItemActiveText, forbiddenCreateOnly) &&
      hasNone(newItemRoleLabelsText, forbiddenCreateOnly),
    newItemActiveText + newItemRoleLabelsText);

  assertCase(results, 'w432-mfg-uses-finished-good-and-components',
    /Air Fried Sea Salt & Vinegar Finished Good/.test(mfgNames.assembly_name) &&
      Array.isArray(mfgNames.component_names) &&
      mfgNames.component_names.length === 3 &&
      /Kettle Potato Slice Input/.test(mfgActiveText) &&
      /Sea Salt & Vinegar Seasoning Blend/.test(mfgActiveText) &&
      /6\.5 oz Bag and Case Packaging/.test(mfgActiveText) &&
      /BOM - Kettle Air Fried Sea Salt & Vinegar/.test(mfgActiveText) &&
      /WO - Kettle Air Fried Sea Salt & Vinegar/.test(JSON.stringify(plan)),
    mfgActiveText);

  assertCase(results, 'w432-wip-adds-routing-and-operations',
    /Routing - Kettle Air Fried Sea Salt & Vinegar Chips/.test(wipNames.routing_name) &&
      /Kettle Cook/.test(wipActiveText) &&
      /Air Finish/.test(wipActiveText) &&
      /Season/.test(wipActiveText) &&
      /Case Pack and QC/.test(wipActiveText),
    wipActiveText);

  assertCase(results, 'w432-no-beverage-leak',
    !/\bBEVERAGE\b/.test(newItemActiveText + mfgActiveText + wipActiveText) &&
      runnerHooks.customerFacingRunSuffixW432('BEVERAGE-S53PQR-F1L') === 'SNACKS-S53PQR-F1L',
    newItemActiveText + mfgActiveText + wipActiveText);

  assertCase(results, 'w432-nllm-advisory-mode-contract',
    advisoryRequest.modeAwareNamingContractW432 &&
      advisoryRequest.modeAwareNamingContractW432.selectedMode === 'wip' &&
      advisoryRequest.modeAwareNamingContractW432.manufacturing.requiredNames.includes('workOrderName') &&
      advisoryRequest.modeAwareNamingContractW432.createNewItemOnly.forbiddenTerms.includes('Finished Good') &&
      advisoryRequest.modeAwareNamingContractW432.wip.requiredNames.includes('operationNames') &&
      genericValidation.accepted === false &&
      genericValidation.blockedReasons.includes('broad_beverage_lane_leaked_into_customer_name'),
    JSON.stringify({ modeAwareNamingContractW432: advisoryRequest.modeAwareNamingContractW432, genericValidation }));

  assertCase(results, 'w432-sidecar-mode-records-static-contract',
    runner.includes('records.assemblyItem = assemblyItem') &&
      runner.includes('records.bom = bomRecord') &&
      runner.includes('records.workOrder = workOrderRecord') &&
      runner.includes('records.routing = routingRecord') &&
      runner.includes('componentItems: args.enableManufacturing ? manufacturingComponents'),
    'Sidecar should return mode-specific manufacturing/WIP records when they exist.');

  assertCase(results, 'w432-routing-consumes-product-plan-operations',
    runner.includes('opNames.op40') &&
      runner.includes('opNames.op50') &&
      runner.includes('names._productBuildPlanW432.operationNames'),
    'Routing should use product-specific W432 operations.');

  const report = `# W432 Product Build Plan Naming

## Summary
W432 introduces a mode-aware product build plan so runner-created names come from website product evidence before record creation.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Boundaries
- No live NetSuite smoke was run by this harness.
- W432 keeps drawer N/LLM naming advisory-only.
- W432 does not weaken W431 refresh/sidecar import.
`;
  fs.writeFileSync(reportPath, report);
  printResults('W432 product build plan naming harness', results);
}

main();
