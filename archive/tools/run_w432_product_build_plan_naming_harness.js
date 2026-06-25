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

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
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
  const sieteBase = {
    prospect: 'Siete Foods',
    website: 'https://www.sietefoods.com',
    signalText: 'Siete Maíz Sea Salt Tortilla Chips, Grain Free Tortilla Chips, Taco Shells, and Seasoning Mixes.',
    notes: 'Focus on Siete Maíz Sea Salt Tortilla Chips retail replenishment readiness.'
  };
  const sieteTerms = runnerHooks.extractWebsiteProductTermsW432(sieteBase);
  const sietePlan = runnerHooks.productBuildPlanW432(sieteBase);
  const sieteNewItemNames = runnerHooks.applyToggleAwareNamingGuardrails(
    runnerHooks.generateNamingPack(sieteBase),
    Object.assign({}, sieteBase, { enableManufacturing: false, enableWip: false })
  );
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

  assertCase(results, 'w440-marker-updated',
    /@version\s+1\.0\.51/.test(drawer) &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.51';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W443';"),
    'Drawer should identify W443 / 1.0.51 while preserving W432 product build plan naming.');

  const mfgToggleSyncState = motionState(drawerHooks, {
    selectedLaneId: 'food_beverage',
    intake: {
      customer: 'Siete Foods',
      website: 'https://www.sietefoods.com',
      notes: 'Siete Maíz Sea Salt Tortilla Chips production readiness with components, BOM, and work order.'
    },
    toggles: {
      food_beverage: {
        createNewHeroItem: true,
        enableManufacturing: false,
        enableWip: false
      }
    },
    websiteEvidenceV1: {
      status: 'ready',
      domain: 'www.sietefoods.com',
      text: 'Siete Maíz Sea Salt Tortilla Chips.'
    }
  });
  const fakeToggleRoot = {
    querySelectorAll: (selector) => selector === '[data-idb-toggle]'
      ? [
        { getAttribute: () => 'createNewHeroItem', checked: true },
        { getAttribute: () => 'enableManufacturing', checked: true },
        { getAttribute: () => 'enableWip', checked: false }
      ]
      : []
  };
  drawerHooks.syncBuildTogglesFromVisibleFieldsW440(fakeToggleRoot, mfgToggleSyncState, 'food_beverage');
  const mfgToggleSyncContext = motionContext(drawerHooks, mfgToggleSyncState);
  const syncedConfirmedRequest = drawerHooks.confirmedBuildRequestJsonV1(
    mfgToggleSyncState,
    mfgToggleSyncContext.lane,
    mfgToggleSyncContext.page,
    mfgToggleSyncContext.recommendation
  );
  const syncedHandoff = drawerHooks.dccRunnerHandoffPacketV1(
    mfgToggleSyncState,
    mfgToggleSyncContext.lane,
    mfgToggleSyncContext.page,
    mfgToggleSyncContext.recommendation
  );
  const syncedReceipt = drawerHooks.selectedBuildToggleReceiptW440(
    mfgToggleSyncState,
    mfgToggleSyncContext.lane,
    syncedConfirmedRequest
  );
  assertCase(results, 'w440-visible-toggle-sync-reaches-confirmed-request',
    mfgToggleSyncState.toggles.food_beverage.enableManufacturing === true &&
      syncedConfirmedRequest.selectedToggles.enableManufacturing === true &&
      syncedHandoff.scheduledRunnerPreview.custscript_v3_runner_enable_mfg === 'T' &&
      syncedReceipt.enableManufacturing === true &&
      syncedReceipt.chips.includes('Manufacturing on'),
    JSON.stringify({ toggles: mfgToggleSyncState.toggles.food_beverage, selectedToggles: syncedConfirmedRequest.selectedToggles, runnerPreview: syncedHandoff.scheduledRunnerPreview, syncedReceipt }));

  assertCase(results, 'w440-runner-confirmed-request-toggles-authoritative',
    typeof runnerHooks.confirmedBuildToggleValueW440 === 'function' &&
      runnerHooks.confirmedBuildToggleValueW440({ selectedToggles: { enableManufacturing: true, enableWip: false, createNewHeroItem: true } }, ['enableManufacturing']) === true &&
      runner.includes('confirmed_build_request: confirmedEnableManufacturingRaw') &&
      runner.includes('const enableWipCandidates = {'),
    'Runner should read selected toggles from custscript_v3_runner_idb_request_json before legacy script params.');

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

  assertCase(results, 'w438-siete-product-terms-extracted-without-kettle-carryover',
    /Siete Maíz Sea Salt Tortilla Chips/.test(sieteTerms.selectedProductCandidate) &&
      /Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack/.test(sietePlan.distributionItemName) &&
      /Siete Maíz Sea Salt Tortilla Chips Retail Replenishment/.test(sietePlan.distributionProofName) &&
      /Siete Maíz Sea Salt Tortilla Chips Channel Supply/.test(sietePlan.distributionSupportName) &&
      !/Kettle|Jalapeno/.test(JSON.stringify(sietePlan)) &&
      /Siete Maíz Sea Salt Tortilla Chips/.test(JSON.stringify(sieteNewItemNames)),
    JSON.stringify({ sieteTerms, sietePlan, sieteNewItemNames }));

  assertCase(results, 'w432-new-item-only-uses-distribution-language',
    /Air Fried Sea Salt & Vinegar/.test(newItemActiveText) &&
      /(Case Pack|replenishment|Channel Supply|SKU|availability)/i.test(newItemActiveText) &&
      hasNone(newItemActiveText, forbiddenCreateOnly) &&
      hasNone(newItemRoleLabelsText, forbiddenCreateOnly),
    newItemActiveText + newItemRoleLabelsText);

  assertCase(results, 'w432-mfg-uses-finished-good-and-components',
    /Air Fried Sea Salt & Vinegar.*Production Batch/.test(mfgNames.assembly_name) &&
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
      advisoryRequest.modeAwareNamingContractW432.visibleProductNamingContractW436 &&
      advisoryRequest.modeAwareNamingContractW432.visibleProductNamingContractW436.randomRunIdsForbiddenInVisibleNames === true &&
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

  assertCase(results, 'w434-non-mfg-proof-support-prefers-product-plan-names',
    runner.includes('const proofName = name || policyProofName') &&
      runner.includes('const componentName = name || policyProofName') &&
      /useDistributionCockpitCopyW434/.test(drawer),
    'Non-MFG proof/support records and cockpit copy should prefer W432 product plan names over old finished-good fallbacks.');

  const repairedImport = drawerHooks.dccFinalNamingResultV1({
    schema: 'idb.runner-sidecar-result-json.v1',
    status: 'partial_result_imported_for_display',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    productBuildPlanW432: plan,
    records: {
      customer: {
        role: 'customer',
        type: 'customer',
        name: 'Kettle Brand Snacks Customer Account',
        internalId: '9001',
        url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=9001'
      },
      heroItem: {
        role: 'heroItem',
        type: 'inventoryitem',
        name: plan.distributionItemName,
        internalId: '9002',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=9002'
      },
      matrixProofItem: {
        role: 'matrixProofItem',
        type: 'inventoryitem',
        name: 'Kettle Brand Snacks Finished Good Replenishment - SNACKS-S8MGKV-WR5 - RUN',
        internalId: '9003',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=9003'
      },
      componentItem: {
        role: 'componentItem',
        type: 'inventoryitem',
        name: 'Kettle Brand Snacks Finished Good Packaging / Case Pack - SNACKS-S8MGKV-WR5 - RUN',
        internalId: '9004',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=9004'
      }
    }
  }, state, context.lane, context.page, context.recommendation);
  const repairedVisibleText = JSON.stringify(repairedImport.displayObjects.concat(repairedImport.componentItems).map((record) => ({
    role: record.role,
    label: record.label,
    name: record.name,
    recordName: record.recordName
  })));
  assertCase(results, 'w436-visible-names-strip-run-suffix',
    drawerHooks.consultantVisibleRecordNameW436('Kettle Jalapeno Retail Replenishment - SNACKS-SA3N09-JQ6 - RUN') === 'Kettle Jalapeno Retail Replenishment' &&
      drawerHooks.consultantVisibleRecordNameW436('Kettle Jalapeno Channel Supply - SNACKS-SA3N09-JQ6 - RUN') === 'Kettle Jalapeno Channel Supply' &&
      /Kettle Air Fried Sea Salt & Vinegar Retail Replenishment/.test(repairedVisibleText) &&
      /Kettle Air Fried Sea Salt & Vinegar Channel Supply/.test(repairedVisibleText) &&
      !/\bSNACKS-/.test(repairedVisibleText) &&
      !/\bBEVERAGE-/.test(repairedVisibleText) &&
      !/\bRUN\b/.test(repairedVisibleText),
    repairedVisibleText);

  assertCase(results, 'w436-all-visible-item-roles-use-product-plan',
    /Retail Replenishment/.test(repairedVisibleText) &&
      /Channel Supply/.test(repairedVisibleText) &&
      !/Finished Good Replenishment/.test(repairedVisibleText) &&
      !/Finished Good Packaging/.test(repairedVisibleText) &&
      !/Product Availability SKU/.test(repairedVisibleText) &&
      !/Branch Availability\s*\/\s*Replenishment Flow/.test(repairedVisibleText) &&
      !/Fulfillment Support SKU/.test(repairedVisibleText),
    repairedVisibleText);

  const sieteState = motionState(drawerHooks, {
    selectedLaneId: 'food_beverage',
    intake: {
      customer: 'Siete Foods',
      website: 'https://www.sietefoods.com',
      notes: 'Siete Maíz Sea Salt Tortilla Chips retail replenishment readiness.'
    },
    toggles: {
      food_beverage: {
        createNewHeroItem: true,
        enableManufacturing: false,
        enableWip: false
      }
    },
    websiteEvidenceV1: {
      status: 'ready',
      domain: 'www.sietefoods.com',
      text: 'Siete Maíz Sea Salt Tortilla Chips, Grain Free Tortilla Chips, Taco Shells, Seasoning Mixes.'
    }
  });
  const sieteContext = motionContext(drawerHooks, sieteState);
  const stalePlanImport = drawerHooks.dccFinalNamingResultV1({
    schema: 'idb.runner-sidecar-result-json.v1',
    status: 'partial_result_imported_for_display',
    productBuildPlanW432: plan,
    records: {
      customer: {
        role: 'customer',
        type: 'customer',
        name: 'Siete Foods Customer Account',
        internalId: '9101',
        url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=9101'
      },
      heroItem: {
        role: 'heroItem',
        type: 'inventoryitem',
        name: 'Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack - SNACKS-SIETE-RUN1 - RUN',
        internalId: '9102',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=9102'
      },
      matrixProofItem: {
        role: 'matrixProofItem',
        type: 'inventoryitem',
        name: 'Siete Maíz Sea Salt Tortilla Chips Retail Replenishment - SNACKS-SIETE-RUN1 - RUN',
        internalId: '9103',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=9103'
      },
      componentItem: {
        role: 'componentItem',
        type: 'inventoryitem',
        name: 'Siete Maíz Sea Salt Tortilla Chips Channel Supply - SNACKS-SIETE-RUN1 - RUN',
        internalId: '9104',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=9104'
      }
    }
  }, sieteState, sieteContext.lane, sieteContext.page, sieteContext.recommendation);
  const stalePlanVisibleText = JSON.stringify(stalePlanImport.displayObjects.concat(stalePlanImport.componentItems).map((record) => ({
    role: record.role,
    name: record.name,
    recordName: record.recordName,
    productBuildPlanDisplayOverrideW435: record.productBuildPlanDisplayOverrideW435
  })));
  assertCase(results, 'w437-stale-product-plan-does-not-repair-new-customer-to-old-product',
    drawerHooks.productBuildPlanMatchesPayloadContextW437({ productBuildPlanW432: plan }, sieteState, { name: 'Siete Foods Customer Account' }) === false &&
      /Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack/.test(stalePlanVisibleText) &&
      /Siete Maíz Sea Salt Tortilla Chips Retail Replenishment/.test(stalePlanVisibleText) &&
      /Siete Maíz Sea Salt Tortilla Chips Channel Supply/.test(stalePlanVisibleText) &&
      !/Kettle/.test(stalePlanVisibleText) &&
      !/\bSNACKS-/.test(stalePlanVisibleText) &&
      !/\bRUN\b/.test(stalePlanVisibleText) &&
      !/productBuildPlanDisplayOverrideW435\":true/.test(stalePlanVisibleText),
    stalePlanVisibleText);

  const alreadyNormalizedStale = drawerHooks.dccFinalNamingResultV1({
    schema: 'idb.dcc-final-naming-result.v1',
    status: 'dcc_final_names_imported',
    finalNamesImported: true,
    displayObjects: [
      { role: 'customer', consultantLabel: 'Customer', label: 'Customer', name: 'Siete Foods Customer Account', recordName: 'Siete Foods Customer Account', url: 'https://example.test/customer', linkAuthority: { openable: true, url: 'https://example.test/customer' } },
      { role: 'sales_order', consultantLabel: 'Sales Order', label: 'Sales Order', name: 'SO27222', recordName: 'SO27222', url: 'https://example.test/so', linkAuthority: { openable: true, url: 'https://example.test/so' } },
      { role: 'hero_item', consultantLabel: 'Product SKU', label: 'Product SKU', name: 'Kettle Jalapeno 12-Count Case Pack', recordName: 'Kettle Jalapeno 12-Count Case Pack', url: 'https://example.test/item', linkAuthority: { openable: true, url: 'https://example.test/item' } },
      { role: 'matrix_or_proof_item', consultantLabel: 'Availability/Replenishment Flow', label: 'Availability/Replenishment Flow', name: 'Kettle Jalapeno Retail Replenishment', recordName: 'Kettle Jalapeno Retail Replenishment', url: 'https://example.test/proof', linkAuthority: { openable: true, url: 'https://example.test/proof' } }
    ],
    componentItems: [
      { role: 'component_item', consultantLabel: 'Supporting SKU', label: 'Supporting SKU', name: 'Kettle Jalapeno Channel Supply', recordName: 'Kettle Jalapeno Channel Supply', url: 'https://example.test/support', linkAuthority: { openable: true, url: 'https://example.test/support' } }
    ],
    displayReadyRecords: []
  }, sieteState, sieteContext.lane, sieteContext.page, sieteContext.recommendation);
  const normalizedRepairText = JSON.stringify(alreadyNormalizedStale.displayObjects.concat(alreadyNormalizedStale.componentItems).map((record) => ({
    role: record.role,
    name: record.name,
    recordName: record.recordName,
    internalName: record.internalName,
    visibleBrandMismatchRepairW438: record.visibleBrandMismatchRepairW438,
    visibleProductNarrativeRepairW439: record.visibleProductNarrativeRepairW439
  })));
  assertCase(results, 'w438-already-normalized-final-result-repairs-old-brand-visible-rows',
    /Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack/.test(normalizedRepairText) &&
      /Siete Maíz Sea Salt Tortilla Chips Retail Replenishment/.test(normalizedRepairText) &&
      /Siete Maíz Sea Salt Tortilla Chips Channel Supply/.test(normalizedRepairText) &&
      /Kettle Jalapeno 12-Count Case Pack/.test(normalizedRepairText) &&
      !/\"name\":\"Kettle/.test(normalizedRepairText) &&
      /(visibleBrandMismatchRepairW438|visibleProductNarrativeRepairW439)\":true/.test(normalizedRepairText),
    normalizedRepairText);

  const nonMfgCockpitHtml = drawerHooks.renderW415DemoCockpit({
    state: { customerName: 'Kettle Brand Snacks' },
    lane: context.lane,
    value: {
      customer: 'Kettle Brand Snacks',
      roiAudit: { claim: 'Kettle Brand Snacks can protect finished-good readiness.', baselineNeeded: 'Customer-confirmed miss rate.' },
      objections: ['How do we know finished-good readiness is current enough to trust?'],
      groundedCompetitiveSummary: 'Prove the same decision through Finished Good.',
      grounded: {}
    },
    script: { say: 'Prove finished-good readiness with ingredient availability and batch schedule.', show: 'Move through ingredient and batch records.' },
    finalNavigation: {
      runCanUseImportedFinalNames: true,
      proofQualityGate: { runReady: true },
      scriptPivotObjects: repairedImport.displayObjects.concat(repairedImport.componentItems).map((record) => Object.assign({}, record, {
        linkAuthority: { openable: true, url: record.url }
      }))
    },
    storyContractW373: {
      proofLabel: 'Finished-good production readiness',
      proofMove: 'Prove finished-good production readiness.'
    },
    websiteEvidence: { confidence: { displayText: 'Needs confirmation', scoreLabel: 'medium' } },
    competitiveAdvisory: { runCue: 'Finished-good readiness battlecard.' }
  });
  const nonMfgCockpitText = stripHtml(nonMfgCockpitHtml);
  assertCase(results, 'w436-non-mfg-copy-has-no-manufacturing-language',
    !/\b(finished-good readiness|ingredient|batch|BOM|work order|routing|production readiness)\b/i.test(nonMfgCockpitText) &&
      /\breplenishment\b/i.test(nonMfgCockpitText) &&
      /\bcase-pack\b/i.test(nonMfgCockpitText) &&
      /\b(allocation|fulfillment)\b/i.test(nonMfgCockpitText) &&
      /\b(channel supply|availability)\b/i.test(nonMfgCockpitText),
    nonMfgCockpitText);

  const mfgCockpitHtml = drawerHooks.renderW415DemoCockpit({
    state: { customerName: 'Kettle Brand Snacks' },
    lane: context.lane,
    value: { customer: 'Kettle Brand Snacks', roiAudit: { claim: 'Finished Good readiness depends on component and BOM confidence.' }, grounded: {} },
    script: { say: 'Prove Finished Good readiness with BOM and Work Order records.', show: 'Open components, BOM, and Work Order.' },
    finalNavigation: {
      runCanUseImportedFinalNames: true,
      proofQualityGate: { runReady: true },
      scriptPivotObjects: [
        { consultantLabel: 'Assembly', name: plan.assemblyItemName, linkAuthority: { openable: true, url: 'https://example.test/assembly' } },
        { consultantLabel: 'Component item 1', name: plan.componentNames[0], linkAuthority: { openable: true, url: 'https://example.test/component' } },
        { consultantLabel: 'BOM', name: plan.bomName, linkAuthority: { openable: true, url: 'https://example.test/bom' } },
        { consultantLabel: 'Work Order', name: plan.workOrderName, linkAuthority: { openable: true, url: 'https://example.test/wo' } }
      ]
    },
    storyContractW373: { proofLabel: 'Finished-good production readiness' },
    websiteEvidence: {}
  });
  const mfgCockpitText = stripHtml(mfgCockpitHtml);
  assertCase(results, 'w436-mfg-copy-keeps-manufacturing-language',
    /\bProduction Batch\b/i.test(mfgCockpitText) &&
      /\b(?:input|ingredient)\b/i.test(mfgCockpitText) &&
      /\bBOM\b/i.test(mfgCockpitText) &&
      /\bWork Order\b/i.test(mfgCockpitText) &&
      /Sea Salt & Vinegar|Kettle Potato Slice Input/i.test(mfgCockpitText),
    mfgCockpitText);

  const wipCockpitHtml = drawerHooks.renderW415DemoCockpit({
    state: { customerName: 'Kettle Brand Snacks' },
    lane: context.lane,
    value: { customer: 'Kettle Brand Snacks', roiAudit: { claim: 'Routing operation readiness is visible.' }, grounded: {} },
    script: { say: 'Use routing operations for the chip process.', show: plan.operationNames.join(', ') },
    finalNavigation: {
      runCanUseImportedFinalNames: true,
      proofQualityGate: { runReady: true },
      scriptPivotObjects: [
        { consultantLabel: 'Routing', name: plan.routingName, linkAuthority: { openable: true, url: 'https://example.test/routing' } },
        { consultantLabel: 'Operation names', name: plan.operationNames.join(', '), linkAuthority: { openable: true, url: 'https://example.test/ops' } }
      ]
    },
    storyContractW373: { proofLabel: 'WIP routing readiness' },
    websiteEvidence: {}
  });
  const wipCockpitText = stripHtml(wipCockpitHtml);
  assertCase(results, 'w436-wip-copy-keeps-routing-language',
    /\bRouting\b/i.test(wipCockpitText) &&
      /Kettle Cook/.test(wipCockpitText) &&
      /Air Finish/.test(wipCockpitText) &&
      /Season/.test(wipCockpitText),
    wipCockpitText);

  assertCase(results, 'w436-product-candidates-captured',
    Array.isArray(plan.alternateProductCandidates) &&
      plan.alternateProductCandidates.some((candidate) => /Sea Salt & Vinegar/i.test(candidate)) &&
      plan.alternateProductCandidates.some((candidate) => /Jalapeno/i.test(candidate)) &&
      plan.alternateProductCandidates.some((candidate) => /Himalayan Salt/i.test(candidate)) &&
      plan.alternateProductCandidates.some((candidate) => /Texas BBQ/i.test(candidate)) &&
      !/\bbeverage\b/i.test(JSON.stringify(plan.alternateProductCandidates)) &&
      plan.roleProductSelections &&
      /Air Fried Sea Salt & Vinegar/i.test(plan.roleProductSelections.distributionItem),
    JSON.stringify({ alternateProductCandidates: plan.alternateProductCandidates, roleProductSelections: plan.roleProductSelections }));

  function openRecord(role, label, name, urlSuffix, extra) {
    const recordId = String(1000 + String(urlSuffix || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0));
    const roleText = String(role || '').toLowerCase();
    const path = /customer/.test(roleText)
      ? 'app/common/entity/custjob.nl'
      : /sales/.test(roleText)
        ? 'app/accounting/transactions/salesord.nl'
        : /bom/.test(roleText)
          ? 'app/common/item/item.nl'
          : /work_order|work order/.test(roleText)
            ? 'app/accounting/transactions/workord.nl'
            : /routing/.test(roleText)
              ? 'app/common/custom/custrecordentry.nl'
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

  function sieteFinalResult(toggles, records) {
    return {
      schema: 'idb.dcc-final-naming-result.v1',
      status: 'dcc_final_names_imported',
      finalNamesImported: true,
      prospect: 'Siete Foods',
      displayObjects: records.displayObjects,
      componentItems: records.componentItems || [],
      locationPlanningRecords: [],
      displayReadyRecords: [],
      productBuildPlanW432: sietePlan,
      toggles
    };
  }

  function renderSieteSurface(toggles, records) {
    const localState = motionState(drawerHooks, {
      selectedLaneId: 'food_beverage',
      intake: {
        customer: 'Siete Foods',
        website: 'https://www.sietefoods.com',
        notes: 'Siete Maíz Sea Salt Tortilla Chips retail replenishment readiness.'
      },
      toggles: { food_beverage: toggles },
      websiteEvidenceV1: {
        status: 'ready',
        domain: 'www.sietefoods.com',
        text: 'Siete Maíz Sea Salt Tortilla Chips, Grain Free Tortilla Chips, Taco Shells, Seasoning Mixes.'
      },
      dccFinalNamingResult: sieteFinalResult(toggles, records)
    });
    const localContext = motionContext(drawerHooks, localState);
    const finalNaming = drawerHooks.dccFinalNamingResultV1(localState.dccFinalNamingResult, localState, localContext.lane, localContext.page, localContext.recommendation);
    const finalNavigation = drawerHooks.dccFinalNavigationModel(localState, localContext.lane, localContext.page, localContext.recommendation);
    const cockpit = drawerHooks.renderW415DemoCockpit({
      state: localState,
      lane: localContext.lane,
      value: {
        customer: 'Siete Foods',
        roiAudit: { claim: 'Finished Good readiness old copy should be replaced.', baselineNeeded: 'Customer-confirmed miss rate.' },
        objections: ['Finished Good readiness old objection should be replaced.'],
        groundedCompetitiveSummary: 'Finished Good proof should be replaced.',
        grounded: {}
      },
      script: { say: 'Finished Good proof should be replaced.', show: 'Move through ingredient and batch records.' },
      finalNavigation,
      storyContractW373: { proofLabel: 'Finished-good production readiness', proofMove: 'Finished Good proof.' },
      websiteEvidence: { confidence: { displayText: 'Needs confirmation', scoreLabel: 'medium' } },
      competitiveAdvisory: { runCue: 'Finished Good readiness battlecard.' }
    });
    const run = drawerHooks.renderRunView(localState, localContext.lane, localContext.page, localContext.recommendation, localContext.lane.moves[0], { id: 'prove', label: 'Prove' }, 'summary');
    return {
      finalNaming,
      text: stripHtml(`${cockpit} ${run}`)
    };
  }

  const sieteDistributionSurface = renderSieteSurface(
    { createNewHeroItem: true, enableManufacturing: false, enableWip: false },
    {
      displayObjects: [
        openRecord('customer', 'Customer', 'Siete Foods Customer Account', 'customer'),
        openRecord('sales_order', 'Sales Order', 'SO27221', 'sales-order'),
        openRecord('hero_item', 'Product SKU', 'Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack - SNACKS-SIETE-RUN - RUN', 'item')
      ],
      componentItems: [
        openRecord('matrix_or_proof_item', 'Availability/Replenishment Flow', 'Siete Maíz Sea Salt Tortilla Chips Retail Replenishment - SNACKS-SIETE-RUN - RUN', 'proof'),
        openRecord('component_item', 'Supporting SKU', 'Siete Maíz Sea Salt Tortilla Chips Channel Supply - SNACKS-SIETE-RUN - RUN', 'support')
      ]
    }
  );
  const sieteDistributionText = sieteDistributionSurface.text;
  assertCase(results, 'w439-siete-non-mfg-visible-everywhere',
    /Siete Maíz Sea Salt Tortilla Chips/.test(sieteDistributionText) &&
      /Retail Replenishment/.test(sieteDistributionText) &&
      /Channel Supply/.test(sieteDistributionText) &&
      /case-pack availability/i.test(sieteDistributionText) &&
      /allocation/i.test(sieteDistributionText) &&
      /fulfillment confidence/i.test(sieteDistributionText) &&
      !/\b(Kettle|Finished Good|ingredient|batch|BOM|work order|routing|production readiness|BEVERAGE|SNACKS-)\b/i.test(sieteDistributionText),
    sieteDistributionText);

  const sieteMfgSurface = renderSieteSurface(
    { createNewHeroItem: true, enableManufacturing: true, enableWip: false },
    {
      displayObjects: [
        openRecord('customer', 'Customer', 'Siete Foods Customer Account', 'customer'),
        openRecord('sales_order', 'Sales Order', 'SO27222', 'sales-order'),
        openRecord('assembly', 'Assembly', 'Siete Maíz Sea Salt Tortilla Chips Finished Good', 'assembly'),
        openRecord('bom', 'BOM', 'BOM - Siete Maíz Sea Salt Tortilla Chips', 'bom'),
        openRecord('bom_revision', 'BOM revision', 'Revision 1 - Siete Maíz Sea Salt Tortilla Chips', 'bom-revision'),
        openRecord('work_order', 'Work Order', 'WO - Siete Maíz Sea Salt Tortilla Chips', 'work-order')
      ],
      componentItems: [
        openRecord('component_item', 'Component item 1', 'Siete Corn Masa Input', 'component-1', { componentIndex: 0 }),
        openRecord('component_item', 'Component item 2', 'Avocado Oil Frying Input', 'component-2', { componentIndex: 1 }),
        openRecord('component_item', 'Component item 3', 'Sea Salt Seasoning and Retail Bag Packaging', 'component-3', { componentIndex: 2 })
      ]
    }
  );
  const sieteMfgText = sieteMfgSurface.text;
  assertCase(results, 'w439-siete-mfg-visible-everywhere',
    /Siete Maíz Sea Salt Tortilla Chip Production Batch/.test(sieteMfgText) &&
      /Siete Corn Masa Input/.test(sieteMfgText) &&
      /Avocado Oil Frying Input/.test(sieteMfgText) &&
      /Sea Salt Seasoning and Retail Bag Packaging/.test(sieteMfgText) &&
      /BOM - Siete Maíz Sea Salt Tortilla Chips/.test(sieteMfgText) &&
      /Revision 1 - Siete Maíz Sea Salt Tortilla Chips/.test(sieteMfgText) &&
      /WO - Siete Maíz Sea Salt Tortilla Chips/.test(sieteMfgText) &&
      !/\b(Kettle|Ingredient Blend|Packaging Component|BEVERAGE|Routing)\b/i.test(sieteMfgText),
    sieteMfgText);

  const sieteWipSurface = renderSieteSurface(
    { createNewHeroItem: true, enableManufacturing: true, enableWip: true },
    {
      displayObjects: [
        openRecord('customer', 'Customer', 'Siete Foods Customer Account', 'customer'),
        openRecord('sales_order', 'Sales Order', 'SO27223', 'sales-order'),
        openRecord('assembly', 'Assembly', 'Siete Maíz Sea Salt Tortilla Chips Finished Good', 'assembly'),
        openRecord('routing', 'Routing', 'Routing - Siete Maíz Sea Salt Tortilla Chips', 'routing'),
        openRecord('operation_1', 'Operation 1', 'Mix Masa', 'operation-1'),
        openRecord('operation_2', 'Operation 2', 'Sheet and Cut Tortilla Chips', 'operation-2'),
        openRecord('operation_3', 'Operation 3', 'Fry in Avocado Oil', 'operation-3'),
        openRecord('operation_4', 'Operation 4', 'Season with Sea Salt', 'operation-4'),
        openRecord('operation_5', 'Operation 5', 'Bag, Case Pack, and QC', 'operation-5')
      ],
      componentItems: [
        openRecord('component_item', 'Component item 1', 'Siete Corn Masa Input', 'component-1', { componentIndex: 0 })
      ]
    }
  );
  const sieteWipText = sieteWipSurface.text;
  assertCase(results, 'w439-siete-wip-visible-everywhere',
    /Routing - Siete Maíz Sea Salt Tortilla Chips/.test(sieteWipText) &&
      /Mix Masa/.test(sieteWipText) &&
      /Sheet and Cut Tortilla Chips/.test(sieteWipText) &&
      /Fry in Avocado Oil/.test(sieteWipText) &&
      /Season with Sea Salt/.test(sieteWipText) &&
      /Bag, Case Pack, and QC/.test(sieteWipText) &&
      !/\b(Kettle|BEVERAGE)\b/i.test(sieteWipText),
    sieteWipText);

  const nonMfgRunnerNarrative = runnerHooks.applyToggleAwareNamingGuardrails(
    runnerHooks.generateNamingPack(sieteBase),
    Object.assign({}, sieteBase, { enableManufacturing: false, enableWip: false })
  )._visibleProductNarrativeW439;
  const mfgRunnerNarrative = runnerHooks.applyToggleAwareNamingGuardrails(
    runnerHooks.generateNamingPack(sieteBase),
    Object.assign({}, sieteBase, { enableManufacturing: true, enableWip: false })
  )._visibleProductNarrativeW439;
  const wipRunnerNarrative = runnerHooks.applyToggleAwareNamingGuardrails(
    runnerHooks.generateNamingPack(sieteBase),
    Object.assign({}, sieteBase, { enableManufacturing: true, enableWip: true })
  )._visibleProductNarrativeW439;
  assertCase(results, 'w439-runner-sidecar-story-is-mode-aware',
    !/Finished Good readiness/i.test(JSON.stringify(nonMfgRunnerNarrative.distribution || {})) &&
      /Siete Maíz Sea Salt Tortilla Chip Production Batch/.test(JSON.stringify(mfgRunnerNarrative)) &&
      /Finished Case Output/.test(JSON.stringify(mfgRunnerNarrative)) &&
      /Routing - Siete Maíz Sea Salt Tortilla Chips/.test(JSON.stringify(wipRunnerNarrative)) &&
      /Mix Masa/.test(JSON.stringify(wipRunnerNarrative)),
    JSON.stringify({ nonMfgRunnerNarrative, mfgRunnerNarrative, wipRunnerNarrative }));

  assertCase(results, 'w439-internal-trace-preserved',
    /Kettle Jalapeno 12-Count Case Pack/.test(normalizedRepairText) &&
      /Siete Maíz Sea Salt Tortilla Chips 12-Count Case Pack/.test(normalizedRepairText) &&
      alreadyNormalizedStale.displayObjects.length === 4 &&
      alreadyNormalizedStale.componentItems.length === 1,
    normalizedRepairText);

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
