#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
const olderRunnerPath = '/Users/aaronsunshine/Downloads/scai_ss_so_csv_runner (10).js';
const packagePath = path.join(root, 'package.json');

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

function openRecord(role, label, name, type, id) {
  const pathByType = {
    customer: 'app/common/entity/custjob.nl',
    salesorder: 'app/accounting/transactions/salesord.nl',
    inventoryitem: 'app/common/item/item.nl',
    assemblyitem: 'app/common/item/item.nl',
    bomrevision: 'app/accounting/manufacturing/bomrevision.nl',
    manufacturingrouting: 'app/accounting/manufacturing/routing.nl',
    workorder: 'app/accounting/transactions/workord.nl'
  };
  const url = `https://td3021666.app.netsuite.com/${pathByType[type]}?id=${id}`;
  return {
    role,
    label,
    consultantLabel: label,
    name,
    recordName: name,
    type,
    recordType: type,
    id: String(id),
    internalId: String(id),
    url,
    source: 'dcc_final',
    safeToOpen: true,
    linkAuthority: { status: 'verified_openable', openable: true, url }
  };
}

function buildKodiakSurface(hooks) {
  const operationNames = [
    'Receive Flour and Protein Blend',
    'Blend Dry Mix',
    'Fill Retail Cartons',
    'Case Pack',
    'QC Finished Cases'
  ];
  const operations = operationNames.map((name, index) => ({
    role: `operation${index + 1}`,
    label: `Planned Operation ${index + 1}`,
    consultantLabel: `Planned Operation ${index + 1}`,
    name,
    recordName: name,
    operationIndex: index,
    plannedOnly: true,
    source: 'dcc_final'
  }));
  const w450 = {
    schema: 'idb.w450-routing-work-center-cost-template-pair-probing.v1',
    authoritativeWorkCenterSearch: {
      id: 5005,
      scriptId: 'customsearch_scai_ss_wc_wip',
      title: 'Work Center List Reset Engine'
    },
    centerRanking: [
      { id: 1439, name: 'DEN-Large Fill Blender' },
      { id: 1450, name: 'Parfait Layering/Blending' },
      { id: 1686, name: 'DEN-Salad Assembly' }
    ],
    costTemplateRanking: [{ id: 6, name: 'DEN-Case Packing (2 Lines)' }],
    pairProbes: [
      { seq: 10, opName: operationNames[0], centerId: 1630, centerName: 'Receiving Dock', templateId: 6, fieldId: 'manufacturingworkcenter', status: 'rejected', errorName: 'INVALID_FLD_VALUE' },
      { seq: 20, opName: operationNames[1], centerId: 1439, centerName: 'DEN-Large Fill Blender', templateId: 6, fieldId: 'commitLine', status: 'accepted' },
      { seq: 30, opName: operationNames[2], centerId: 1397, centerName: 'SFO-Dispensing-HUM', templateId: 6, fieldId: 'commitLine', status: 'accepted' },
      { seq: 40, opName: operationNames[3], centerId: 1437, centerName: 'DEN-10-inch Case Packing', templateId: 6, fieldId: 'commitLine', status: 'accepted' }
    ],
    rejectedPairs: [{ seq: 10, centerId: 1630, centerName: 'Receiving Dock', templateId: 6, fieldId: 'manufacturingworkcenter', errorName: 'INVALID_FLD_VALUE' }],
    acceptedPairs: [
      { seq: 20, centerId: 1439, centerName: 'DEN-Large Fill Blender', templateId: 6 },
      { seq: 30, centerId: 1397, centerName: 'SFO-Dispensing-HUM', templateId: 6 },
      { seq: 40, centerId: 1437, centerName: 'DEN-10-inch Case Packing', templateId: 6 }
    ],
    acceptedOperationLinesW450: [
      { seq: 20, opName: operationNames[1], centerName: 'DEN-Large Fill Blender', templateName: 'DEN-Case Packing (2 Lines)' },
      { seq: 30, opName: operationNames[2], centerName: 'SFO-Dispensing-HUM', templateName: 'DEN-Case Packing (2 Lines)' },
      { seq: 40, opName: operationNames[3], centerName: 'DEN-10-inch Case Packing', templateName: 'DEN-Case Packing (2 Lines)' }
    ],
    rejectedOperationLinesW450: [{
      seq: 10,
      opName: operationNames[0],
      errorName: 'W449_NO_VALID_ROUTING_STEP_PAIR',
      rejectedPairs: [{ centerId: 1630, centerName: 'Receiving Dock', templateId: 6, fieldId: 'manufacturingworkcenter', errorName: 'INVALID_FLD_VALUE' }]
    }],
    routingSaveResult: { status: 'saved', routingId: 945, acceptedOperationCount: 3 },
    routingAssemblyVerification: { found: true, defaulted: true, staleCookieProductionLineDetected: true, staleSuperseded: true }
  };
  const sidecar = {
    schema: 'idb.runner-sidecar-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    idempotencyToken: 'W450-KODIAK-EXT',
    runnerTaskId: 'task-w450',
    productBuildPlanW432: {
      schema: 'idb.w450-authoritative-naming-pack-product-plan.v1',
      productCandidateSource: 'llm-suitelet-precomputed',
      primaryProductCandidate: 'Kodiak Power Cakes Buttermilk Mix Case Pack',
      alternateProductCandidates: ['Kodiak Protein Pancake Mix', 'Kodiak Oat & Honey Flapjack Mix'],
      confidencePercent: 91,
      evidenceTerms: ['Kodiak', 'Power Cakes', 'buttermilk', 'protein', 'flapjack mix'],
      componentNames: [
        'Whole Grain Wheat and Oat Flour Blend',
        'Whey Protein Blend',
        'Retail Carton and Case Packaging'
      ],
      routingName: 'Routing - Kodiak Power Cakes Buttermilk Mix',
      operationNames,
      fallbackBlockedGenericTerms: [
        'Product 12-Count Case Pack',
        'Core Material Input',
        'Product Seasoning Blend',
        'Prepare Materials',
        'Build Product'
      ],
      namingPayloadFound: true,
      namingPayloadParsed: true,
      namingPayloadApplied: true,
      namingPackAuthoritative: true,
      namingFileId: 12345,
      namingDiscoveryMode: 'direct-param'
    },
    records: {
      customer: openRecord('customer', 'Customer', 'Kodiak Cakes WIP Batch Readiness Customer Account', 'customer', 5001),
      salesOrder: openRecord('sales_order', 'Sales Order', 'SO - Kodiak Cakes WIP Batch Readiness', 'salesorder', 6001),
      sellableItem: openRecord('sellable_item', 'Sellable Item', 'Kodiak Power Cakes Buttermilk Mix Case Pack', 'inventoryitem', 7001),
      assemblyItem: openRecord('assembly', 'Production Batch', 'Kodiak Power Cakes Buttermilk Mix Batch', 'assemblyitem', 7002),
      componentItem1: openRecord('componentItem1', 'Component Item 1', 'Whole Grain Wheat and Oat Flour Blend', 'inventoryitem', 7003),
      componentItem2: openRecord('componentItem2', 'Component Item 2', 'Whey Protein Blend', 'inventoryitem', 7004),
      componentItem3: openRecord('componentItem3', 'Component Item 3', 'Retail Carton and Case Packaging', 'inventoryitem', 7005),
      bomRevision: openRecord('bomRevision', 'BOM Revision', 'Revision 1 - Kodiak Power Cakes Buttermilk Mix', 'bomrevision', 7007),
      routing: openRecord('routing', 'Manufacturing Routing', 'Routing - Kodiak Power Cakes Buttermilk Mix', 'manufacturingrouting', 945),
      workOrder: openRecord('workOrder', 'Work Order', 'WO - Kodiak Power Cakes Buttermilk Mix', 'workorder', 946)
    },
    routingOperations: operations,
    routingDiagnostics: {
      status: 'attached',
      decision: 'created-new-routing',
      routingId: 945,
      routingName: 'Routing - Kodiak Power Cakes Buttermilk Mix',
      w450,
      w449: w450
    },
    troubleshootExportTelemetryW446: {
      schema: 'idb.w446-runner-troubleshoot-telemetry.v1',
      routingResult: { w450, w449: w450 },
      manufacturingEligibilityPreflightW446: { status: 'passed', assemblyId: 7002, bomRevisionId: 7007 }
    }
  };
  const state = motionState(hooks, {
    selectedLaneId: 'products_cpg',
    intake: {
      customer: 'Kodiak Cakes WIP Batch Readiness',
      website: 'https://kodiakcakes.com',
      notes: 'Run a WIP manufacturing demo for Kodiak Cakes focused on Power Cakes buttermilk mix batch readiness.'
    },
    toggles: { createNewHeroItem: true, enableManufacturing: true, enableWip: true },
    integratedBuildRunnerResult: {
      status: 'completed',
      runStatus: 'completed',
      idempotencyToken: sidecar.idempotencyToken,
      runnerTaskId: sidecar.runnerTaskId,
      sidecarGeneratedNamesJson: sidecar,
      resultCapture: {
        idempotencyToken: sidecar.idempotencyToken,
        runnerTaskId: sidecar.runnerTaskId,
        productBuildPlanW432: sidecar.productBuildPlanW432,
        routingResult: sidecar.routingDiagnostics,
        troubleshootExportTelemetryW446: sidecar.troubleshootExportTelemetryW446
      }
    }
  });
  const objects = Object.values(sidecar.records).concat(operations);
  const linkRows = objects.filter(hooks.linkSummaryEligibleW446);
  const finalNavigation = {
    scriptPivotObjects: objects,
    reviewObjects: objects,
    proofReviewAvailable: true,
    runCanUseImportedFinalNames: true,
    linkAuthoritySummary: {
      total: linkRows.length,
      openable: linkRows.filter((item) => item.linkAuthority && item.linkAuthority.openable).length,
      missing_url: 0
    },
    linkAuthoritySummaryExcludingPlannedW446: {
      total: linkRows.length,
      openable: linkRows.filter((item) => item.linkAuthority && item.linkAuthority.openable).length,
      missing_url: 0
    },
    runnerSidecar: sidecar,
    resultCapture: state.integratedBuildRunnerResult.resultCapture
  };
  state.dccFinalNavigationModelW245 = finalNavigation;
  state.dccFinalNamingResult = { generated: { finalNavigation, scriptPivotObjects: objects, sidecarGeneratedNamesJson: sidecar } };
  const context = motionContext(hooks, state);
  const html = hooks.renderW415DemoCockpit({
    state,
    lane: context.lane,
    value: {},
    script: {},
    finalNavigation,
    storyContractW373: {},
    websiteEvidence: {},
    competitiveAdvisory: {}
  });
  return {
    state,
    finalNavigation,
    html,
    text: stripHtml(html),
    exportPayload: hooks.w444TroubleshootExportPayload(state),
    operations
  };
}

function main() {
  const drawer = read(drawerPath);
  const runner = read(runnerPath);
  const olderRunner = read(olderRunnerPath);
  const pkg = JSON.parse(read(packagePath));
  const hooks = loadHooks();
  const surface = buildKodiakSurface(hooks);
  const results = [];
  const banned = /Product 12-Count Case Pack|Core Material Input|Primary Material Input|Product Seasoning Blend|Prepare Materials|Build Product|Machine Unit|Final Assembly Unit|Finished Assembly Unit|Generic Product|Component Input/i;

  assertCase(results, 'w450-markers-updated',
    /@version\s+1\.0\.5[89]/.test(drawer) &&
      /const DRAWER_USERSCRIPT_VERSION = '1\.0\.5[89]';/.test(drawer) &&
      /const CURRENT_UX_BLOCK_W346 = 'W45[01]';/.test(drawer) &&
      /w45[0-2]-(llm-naming-real-wip-routing|older-routing-capacity-and-error-truth|legacy-direct-routing-first)/.test(runner),
    'Drawer and runner should identify W450 / 1.0.58 or a W451/W452 successor.');

  assertCase(results, 'w450-older-runner-reference-canonical',
    /function loadPrecomputedNamingPack/.test(olderRunner) &&
      /function discoverNamingFileIdByExtId/.test(olderRunner) &&
      /function applyNamingToAnchors/.test(olderRunner) &&
      /function createFreshHeroItem/.test(olderRunner) &&
      /function ensureManufacturingAnchors/.test(olderRunner) &&
      /function attachBomToAssembly/.test(olderRunner),
    'Older runner reference should contain the canonical naming and creation functions.');

  assertCase(results, 'w450-current-runner-restores-old-creation-functions',
    ['loadPrecomputedNamingPack', 'discoverNamingFileIdByExtId', 'applyNamingToAnchors', 'createFreshHeroItem', 'adoptFreshHeroItem', 'ensureManufacturingAnchors', 'ensureInventoryItemByExternalId', 'ensureAssemblyItemByExternalId', 'ensureBomByExternalId', 'ensureBomRevisionByExternalId', 'setBomRevisionComponents', 'attachBomToAssembly']
      .every((fn) => runner.includes(`function ${fn}`)),
    'Current runner should keep/restored the older runner naming and creation function set.');

  assertCase(results, 'w450-naming-pack-wins-over-deterministic-fallback',
    runner.includes('_namingPackAuthoritative') &&
      runner.includes('w450AuthoritativeNamingProductPlan') &&
      runner.includes('deterministicFallbackBlocked') &&
      runner.includes('Precomputed naming pack is authoritative') &&
      runner.includes('namingPayloadFound') &&
      runner.includes('namingPayloadParsed') &&
      runner.includes('namingPayloadApplied'),
    'Authoritative precomputed naming pack should block deterministic product-build fallback.');

  assertCase(results, 'w450-kodiak-fixture-renders-pack-names',
    /Kodiak Power Cakes Buttermilk Mix Case Pack/.test(surface.text) &&
      /Whole Grain Wheat and Oat Flour Blend/.test(surface.text) &&
      /Whey Protein Blend/.test(surface.text) &&
      /Retail Carton and Case Packaging/.test(surface.text) &&
      /Routing - Kodiak Power Cakes Buttermilk Mix/.test(surface.text) &&
      !banned.test(surface.text),
    surface.text);

  assertCase(results, 'w450-routing-probes-continue-after-operation-10-rejection',
    runner.includes('Routing operation rejected but W450 continues') &&
      runner.includes('acceptedOperationLinesW450') &&
      runner.includes('rejectedOperationLinesW450') &&
      runner.includes('W450_INSUFFICIENT_ACCEPTED_ROUTING_STEPS') &&
      /chosen\.operationRows\.length < 3/.test(runner) &&
      /slice\(0,\s*3\)/.test(runner),
    'Routing should keep probing later operations, cap the WIP operation model to three rows, and require at least three accepted lines before save.');

  assertCase(results, 'w451-result-capture-size-guard-and-error-truth',
    runner.includes('MAX_TEXT_ARTIFACT_CHARS_W451') &&
      runner.includes('compacted_before_file_save') &&
      runner.includes('idb.w451-routing-location-selection.v1') &&
      drawer.includes('runnerErrorTruthW451') &&
      drawer.includes('FORGE ERROR'),
    'Runner should compact oversized sidecar artifacts and drawer should surface terminal runner errors.');

  assertCase(results, 'w452-legacy-direct-routing-first',
    runner.includes('function createAndAttachRoutingLegacyDirectW452') &&
      runner.includes('function findWorkCentersFromSavedSearchLegacyDirectW452') &&
      runner.includes('older-runner-direct-routing-first') &&
      runner.includes('idb.w452-legacy-direct-routing.v1') &&
      runner.includes('W452 legacy direct routing failed; falling back to probe engine') &&
      runner.includes("finalStatus: effectiveEnableWip && !routingId ? 'completed_with_wip_diagnostic' : 'completed'"),
    'Runner should try the older-runner direct three-step routing path first, then report WIP diagnostics instead of plain completed when WIP fails.');

  assertCase(results, 'w450-routing-diagnostic-exact-center-template-field-error',
    surface.exportPayload.w450RoutingProbeTruth &&
      surface.exportPayload.w450RoutingProbeTruth.rejectedPairs[0].fieldId === 'manufacturingworkcenter' &&
      surface.exportPayload.w450RoutingProbeTruth.rejectedPairs[0].errorName === 'INVALID_FLD_VALUE' &&
      surface.exportPayload.w450RoutingProbeTruth.acceptedPairs.length >= 3,
    JSON.stringify(surface.exportPayload.w450RoutingProbeTruth, null, 2));

  assertCase(results, 'w450-drawer-wip-flow-not-planned-broken-links',
    surface.html.includes('data-idb-w449-wip-flow-component="true"') &&
      /Demand\s+→\s+Assembly \/ BOM Revision\s+→\s+Routing\s+→\s+Work Order\s+→\s+Output/.test(surface.text) &&
      /Planned Operation 1 Receive Flour and Protein Blend/.test(surface.text) &&
      !/Planned Operation 1 Receive Flour and Protein Blend\s+Needs real URL/i.test(surface.text) &&
      surface.operations.every((item) => hooks.linkSummaryEligibleW446(item) === false),
    surface.text);

  assertCase(results, 'w450-troubleshoot-export-naming-pack-and-routing-telemetry',
    surface.exportPayload.productNamingTruthW450 &&
      surface.exportPayload.productNamingTruthW450.namingPayloadFound === true &&
      surface.exportPayload.productNamingTruthW450.namingPayloadParsed === true &&
      surface.exportPayload.productNamingTruthW450.namingPayloadApplied === true &&
      surface.exportPayload.productNamingTruthW450.namingPackAuthoritative === true &&
      Array.isArray(surface.exportPayload.w450RoutingProbeTruth.acceptedPairs) &&
      Array.isArray(surface.exportPayload.w450RoutingProbeTruth.rejectedPairs),
    JSON.stringify(surface.exportPayload.productNamingTruthW450, null, 2));

  assertCase(results, 'w450-package-script',
    pkg.scripts && pkg.scripts['harness:restore-old-runner-naming-creation-w450'] === 'node archive/tools/run_w450_restore_old_runner_naming_creation_harness.js',
    'package.json should expose the W450 harness.');

  printResults('W450 restore old runner naming/creation and WIP routing harness', results);
}

main();
