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

function record(role, label, name, type, id) {
  const pathByType = {
    customer: 'app/common/entity/custjob.nl',
    salesorder: 'app/accounting/transactions/salesord.nl',
    assemblyitem: 'app/common/item/item.nl',
    inventoryitem: 'app/common/item/item.nl',
    bom: 'app/accounting/manufacturing/bom.nl',
    bomrevision: 'app/accounting/manufacturing/bomrevision.nl',
    workorder: 'app/accounting/transactions/workord.nl',
    manufacturingrouting: 'app/accounting/manufacturing/routing.nl'
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
    linkAuthority: {
      status: 'verified_openable',
      openable: true,
      url
    }
  };
}

function diagnostic(role, label, name, reason, extra) {
  return Object.assign({
    role,
    label,
    consultantLabel: label,
    type: role === 'routingDiagnostic' ? 'manufacturingrouting_diagnostic' : 'workorder_diagnostic',
    recordType: role === 'routingDiagnostic' ? 'manufacturingrouting_diagnostic' : 'workorder_diagnostic',
    name,
    recordName: name,
    reason,
    url: '',
    source: 'dcc_final'
  }, extra || {});
}

function buildKodiakSurface(hooks) {
  const operations = [
    'Receive Flour and Protein Blend',
    'Dry Blend Power Cakes Mix',
    'Fill Retail Cartons',
    'Case Pack Retail Cartons',
    'QC Finished Cases'
  ].map((name, index) => ({
    role: `operation${index + 1}`,
    label: `Planned Operation ${index + 1}`,
    consultantLabel: `Planned Operation ${index + 1}`,
    name,
    recordName: name,
    operationIndex: index,
    plannedOnly: true,
    source: 'dcc_final'
  }));

  const namingAdvisoryW450 = {
    schema: 'idb.w450-llm-naming-advisory.v1',
    writeAuthority: 'none',
    creationAllowed: false,
    modelSources: ['website_product_evidence', 'conversation_notes', 'llm_naming_advisory'],
    advisorySources: ['kodiakcakes.com product evidence', 'operator notes', 'naming model advisory'],
    acceptedName: 'Kodiak Power Cakes Pancake and Flapjack Mix Retail Carton',
    rejectedGenericNames: ['Machine Unit', 'Core Material Input', 'Primary Material Input', 'Build Product', 'Final Assembly Unit'],
    blockedFallbackReason: 'Power Cakes, pancake/flapjack, flour/protein blend, retail carton, and case packaging evidence blocked generic manufacturing names.',
    genericFallbackBlockedWhenEvidenceExists: true
  };

  const routingW450 = {
    schema: 'idb.w450-real-wip-routing-probes.v1',
    authoritativeWorkCenterSearch: {
      id: 5005,
      scriptId: 'customsearch_scai_ss_wc_wip',
      title: 'Work Center List Reset Engine'
    },
    pairProbes: [
      {
        seq: 10,
        opName: 'Receive Flour and Protein Blend',
        family: 'receiving',
        centerId: 1630,
        centerName: 'DEN-Receiving',
        templateId: 2,
        templateName: 'DEN-Standard Labor',
        status: 'rejected',
        fieldId: 'manufacturingworkcenter',
        errorName: 'INVALID_FLD_VALUE',
        errorMessage: 'Receiving center rejected for this routing step context.',
        nextFixHint: 'Retry ranked mixing, production, packing, and QC operation families before failing the whole routing.'
      },
      {
        seq: 20,
        opName: 'Dry Blend Power Cakes Mix',
        family: 'mixing',
        centerId: 1439,
        centerName: 'DEN-Large Fill Blender',
        templateId: 6,
        templateName: 'DEN-Case Packing (2 Lines)',
        status: 'accepted'
      },
      {
        seq: 30,
        opName: 'Fill Retail Cartons',
        family: 'production',
        centerId: 1686,
        centerName: 'DEN-Salad Assembly',
        templateId: 6,
        templateName: 'DEN-Case Packing (2 Lines)',
        status: 'accepted'
      },
      {
        seq: 40,
        opName: 'Case Pack Retail Cartons',
        family: 'packing',
        centerId: 1437,
        centerName: 'DEN-Case Packing',
        templateId: 6,
        templateName: 'DEN-Case Packing (2 Lines)',
        status: 'accepted'
      },
      {
        seq: 50,
        opName: 'QC Finished Cases',
        family: 'qc',
        centerId: 1629,
        centerName: 'DEN-Quality Control',
        templateId: 6,
        templateName: 'DEN-Case Packing (2 Lines)',
        status: 'accepted'
      }
    ],
    rejectedPairs: [{
      operation: 'Receive Flour and Protein Blend',
      center: 'DEN-Receiving',
      template: 'DEN-Standard Labor',
      fieldId: 'manufacturingworkcenter',
      errorName: 'INVALID_FLD_VALUE',
      errorMessage: 'Receiving center rejected for this routing step context.',
      nextFixHint: 'Retry ranked mixing, production, packing, and QC operation families before failing the whole routing.'
    }],
    acceptedPairs: [
      { operation: 'Dry Blend Power Cakes Mix', family: 'mixing', center: 'DEN-Large Fill Blender', template: 'DEN-Case Packing (2 Lines)' },
      { operation: 'Fill Retail Cartons', family: 'production', center: 'DEN-Salad Assembly', template: 'DEN-Case Packing (2 Lines)' },
      { operation: 'Case Pack Retail Cartons', family: 'packing', center: 'DEN-Case Packing', template: 'DEN-Case Packing (2 Lines)' },
      { operation: 'QC Finished Cases', family: 'qc', center: 'DEN-Quality Control', template: 'DEN-Case Packing (2 Lines)' }
    ],
    routingAttachVerification: {
      routingId: 9021,
      routingUrl: 'https://td3021666.app.netsuite.com/app/accounting/manufacturing/routing.nl?id=9021',
      assemblyId: 8022,
      attached: true,
      defaulted: true,
      status: 'attached-defaulted-verified'
    },
    failureDiagnostics: [{
      operation: 'Receive Flour and Protein Blend',
      center: 'DEN-Receiving',
      template: 'DEN-Standard Labor',
      fieldId: 'manufacturingworkcenter',
      errorName: 'INVALID_FLD_VALUE',
      errorMessage: 'Receiving center rejected for this routing step context.',
      nextFixHint: 'Use the next ranked production/mixing/packing/QC family pair and keep the routing attempt alive.'
    }]
  };

  const sidecar = {
    schema: 'idb.runner-sidecar-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    idempotencyToken: 'W450-KODIAK-EXT',
    runnerTaskId: 'task-w450',
    records: {
      customer: record('customer', 'Customer', 'Kodiak Cakes Customer Account', 'customer', 8010),
      salesOrder: record('sales_order', 'Sales Order', 'SO - Kodiak Power Cakes Retail Carton Demo', 'salesorder', 8011),
      sellableItem: record('sellable_item', 'Sellable Item', 'Kodiak Power Cakes Pancake and Flapjack Mix Retail Carton', 'inventoryitem', 8021),
      assemblyItem: record('assembly', 'Production Batch', 'Kodiak Power Cakes Pancake and Flapjack Mix Production Batch', 'assemblyitem', 8022),
      componentItem1: record('component_item', 'Ingredient Input 1', 'Kodiak Flour/Protein Blend Input', 'inventoryitem', 8023),
      componentItem2: record('component_item', 'Packaging Input 2', 'Kodiak Retail Carton and Case Packaging', 'inventoryitem', 8024),
      bom: record('bom', 'Bill of Materials', 'BOM - Kodiak Power Cakes Pancake and Flapjack Mix', 'bom', 8025),
      bomRevision: record('bomRevision', 'BOM Revision', 'Revision 1 - Kodiak Power Cakes Pancake and Flapjack Mix', 'bomrevision', 8026),
      routing: record('routing', 'Manufacturing Routing', 'Routing - Kodiak Power Cakes Pancake and Flapjack Mix', 'manufacturingrouting', 9021),
      workOrder: record('work_order', 'Work Order', 'WO - Kodiak Power Cakes Pancake and Flapjack Mix', 'workorder', 9022),
      routingDiagnostic: diagnostic('routingDiagnostic', 'Routing Diagnostic', 'Routing Diagnostic - Kodiak work-center probe retry trace', 'first-pair-rejected-then-retried', { w450: routingW450 })
    },
    productBuildPlanW432: {
      primaryProductCandidate: 'Kodiak Power Cakes Pancake and Flapjack Mix Retail Carton',
      alternateProductCandidates: ['Kodiak Power Cakes', 'Kodiak pancake mix', 'Kodiak flapjack mix'],
      selectedProductReason: 'Selected from Kodiak Power Cakes website product evidence and operator notes.',
      productCandidateSource: 'llm_naming_advisory_with_website_evidence',
      confidencePercent: 88,
      evidenceTerms: ['Power Cakes', 'pancake', 'flapjack', 'flour/protein blend', 'retail carton', 'case packaging', 'dry blend', 'fill', 'carton', 'case', 'QC'],
      rejectedFallbackReason: namingAdvisoryW450.blockedFallbackReason,
      namingAdvisoryW450,
      operationNames: operations.map((item) => item.name)
    },
    routingOperations: operations,
    routingDiagnostics: {
      status: 'attached',
      decision: 'created-new-routing',
      expectedRoutingName: 'Routing - Kodiak Power Cakes Pancake and Flapjack Mix',
      w450: routingW450,
      workCenterSetabilityProbesW450: routingW450
    },
    troubleshootExportTelemetryW446: {
      schema: 'idb.w450-troubleshoot-export-telemetry.v1',
      namingAdvisoryW450,
      blockedFallback: namingAdvisoryW450.blockedFallbackReason,
      workCenterTemplateProbesW450: routingW450,
      routingAttachVerificationW450: routingW450.routingAttachVerification
    }
  };

  const state = motionState(hooks, {
    selectedLaneId: 'products_cpg',
    intake: {
      customer: 'Kodiak Cakes',
      website: 'https://kodiakcakes.com',
      notes: 'Run a WIP manufacturing demo for Kodiak Power Cakes. Show pancake and flapjack retail cartons, flour/protein blend readiness, dry blend, fill, carton, case packing, and QC without generic manufacturing names.'
    },
    toggles: {
      products_cpg: {
        createNewHeroItem: true,
        enableManufacturing: true,
        enableWip: true
      },
      createNewHeroItem: true,
      enableManufacturing: true,
      enableWip: true
    },
    websiteEvidenceV1: {
      status: 'ready',
      domain: 'kodiakcakes.com',
      text: 'Kodiak Power Cakes pancake and flapjack mix, protein-packed whole grain flour blend, retail cartons and case packaging.'
    },
    integratedBuildRunnerResult: {
      status: 'completed',
      runStatus: 'completed',
      idempotencyToken: sidecar.idempotencyToken,
      runnerTaskId: sidecar.runnerTaskId,
      sidecarGeneratedNamesJson: sidecar,
      resultCapture: {
        idempotencyToken: sidecar.idempotencyToken,
        runnerTaskId: sidecar.runnerTaskId,
        routingResult: sidecar.routingDiagnostics,
        troubleshootExportTelemetryW446: sidecar.troubleshootExportTelemetryW446
      }
    }
  });

  const records = Object.values(sidecar.records);
  const objects = records.concat(operations);
  const linkRows = objects.filter(hooks.linkSummaryEligibleW446);
  const linkAuthoritySummary = {
    total: linkRows.length,
    openable: linkRows.filter((item) => item.linkAuthority && item.linkAuthority.openable).length,
    missing_url: linkRows.filter((item) => !(item.linkAuthority && item.linkAuthority.openable)).length
  };
  const finalNavigation = {
    scriptPivotObjects: objects,
    reviewObjects: objects,
    proofReviewAvailable: true,
    runCanUseImportedFinalNames: true,
    linkAuthoritySummary,
    linkAuthoritySummaryExcludingPlannedW446: linkAuthoritySummary,
    plannedOnlyOperationCountW446: operations.length,
    runnerSidecar: sidecar,
    resultCapture: state.integratedBuildRunnerResult.resultCapture
  };
  state.dccFinalNavigationModelW245 = finalNavigation;
  state.dccFinalNamingResult = {
    schema: 'idb.dcc-final-naming-result.v1',
    status: 'dcc_final_names_imported',
    finalNamesImported: true,
    prospect: 'Kodiak Cakes',
    displayObjects: objects,
    componentItems: [sidecar.records.componentItem1, sidecar.records.componentItem2],
    locationPlanningRecords: [],
    reviewObjects: objects,
    displayReadyRecords: objects,
    productBuildPlanW432: sidecar.productBuildPlanW432,
    toggles: state.toggles,
    generated: {
      finalNavigation,
      scriptPivotObjects: objects,
      sidecarGeneratedNamesJson: sidecar
    }
  };

  const context = motionContext(hooks, state);
  const html = hooks.renderW415DemoCockpit({
    state,
    lane: context.lane,
    value: {
      roiAudit: {
        claim: 'Protect retail carton promise dates.',
        baselineNeeded: 'Baseline production misses, flour/protein blend delays, carton shortages, and case QC holds before claiming savings.'
      },
      grounded: {}
    },
    script: { say: 'Prove Kodiak Power Cakes WIP readiness.', show: 'Open the routing, work order, and packaging proof path.' },
    finalNavigation,
    storyContractW373: { proofLabel: 'Power Cakes WIP readiness' },
    websiteEvidence: { text: 'Power Cakes pancake flapjack flour protein blend retail carton case packaging dry blend fill QC' },
    competitiveAdvisory: { likelyAlternatives: ['spreadsheets', 'disconnected MRP'], publicEvidenceStrong: false }
  });

  return {
    state,
    sidecar,
    finalNavigation,
    html,
    text: stripHtml(html),
    exportPayload: hooks.w444TroubleshootExportPayload(state),
    operations,
    diagnostics: [sidecar.records.routingDiagnostic],
    routingW450,
    namingAdvisoryW450
  };
}

function includesAll(haystack, needles) {
  return needles.every((needle) => String(haystack || '').includes(needle));
}

function main() {
  const results = [];
  const drawer = read(drawerPath);
  const runner = read(runnerPath);
  const pkg = JSON.parse(read(packagePath));
  const hooks = loadHooks();
  const surface = buildKodiakSurface(hooks);
  const allNames = JSON.stringify(surface.sidecar.records) + ' ' + surface.text;

  assertCase(results, 'w450-markers-present',
    /@version\s+1\.0\.58/.test(drawer) &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.58';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W450';") &&
      /W450|w450/.test(runner),
    'Drawer and runner should identify W450 / 1.0.58.');

  assertCase(results, 'w450-naming-model-advisory-sources',
    surface.namingAdvisoryW450.writeAuthority === 'none' &&
      surface.namingAdvisoryW450.creationAllowed === false &&
      includesAll(surface.namingAdvisoryW450.modelSources.join(' '), ['website_product_evidence', 'conversation_notes', 'llm_naming_advisory']) &&
      runner.includes('function namingAdvisoryForProductEvidenceW450') &&
      runner.includes("schema: 'idb.w450-llm-product-naming-advisory.v1'") &&
      runner.includes("writeAuthority: 'none'") &&
      runner.includes('creationAllowed: false') &&
      runner.includes('LLM/category advisory used only to shape product-realistic names'),
    JSON.stringify(surface.namingAdvisoryW450, null, 2));

  assertCase(results, 'w450-generic-terms-blocked-when-evidence-exists',
    surface.namingAdvisoryW450.genericFallbackBlockedWhenEvidenceExists === true &&
      surface.namingAdvisoryW450.rejectedGenericNames.every((name) => !allNames.includes(name)) &&
      /Power Cakes|pancake|flapjack|flour\/protein blend|retail carton|case packaging/i.test(allNames),
    allNames);

  assertCase(results, 'w450-kodiak-fixture-industry-native-names',
    !/Machine Unit|Core Material Input|Primary Material Input|Build Product|Prepare Materials|Final Assembly Unit/.test(allNames) &&
      ['power cakes', 'pancake', 'flapjack', 'flour/protein blend', 'retail carton', 'case packaging', 'dry blend power cakes mix', 'fill retail cartons', 'case pack retail cartons', 'qc finished cases'].every((needle) => allNames.toLowerCase().includes(needle)),
    allNames);

  assertCase(results, 'w450-routing-continues-after-first-rejected-pair',
    surface.routingW450.pairProbes[0].status === 'rejected' &&
      surface.routingW450.pairProbes.slice(1).some((probe) => probe.status === 'accepted') &&
      surface.routingW450.acceptedPairs.length >= 4 &&
      /for\s*\([^)]*pairs\.length[^)]*\)/.test(runner) &&
      runner.includes('w449Telemetry.rejectedPairs.push(probe)') &&
      runner.includes('w449Telemetry.acceptedPairs.push(probe)'),
    JSON.stringify(surface.routingW450.pairProbes, null, 2));

  assertCase(results, 'w450-retries-production-mixing-packing-qc-after-receiving-fails',
    surface.routingW450.rejectedPairs.some((pair) => /Receive/.test(pair.operation)) &&
      ['mixing', 'production', 'packing', 'qc'].every((family) => surface.routingW450.acceptedPairs.some((pair) => pair.family === family)) &&
      /function classifyOperationFamilyW450|function classifyOperationFamilyW449|return 'qc'/.test(runner),
    JSON.stringify(surface.routingW450.acceptedPairs, null, 2));

  assertCase(results, 'w450-probes-include-accepted-rejected-telemetry',
    Array.isArray(surface.routingW450.pairProbes) &&
      surface.routingW450.pairProbes.some((probe) => probe.status === 'accepted') &&
      surface.routingW450.pairProbes.some((probe) => probe.status === 'rejected') &&
      surface.exportPayload.troubleshootExportTelemetryW446 &&
      surface.exportPayload.troubleshootExportTelemetryW446.workCenterTemplateProbesW450,
    JSON.stringify(surface.exportPayload.troubleshootExportTelemetryW446, null, 2));

  assertCase(results, 'w450-success-output-routing-id-url-attach-default',
    /(?:Manufacturing Routing|Routing)\s+Routing - Kodiak Power Cakes Pancake and Flapjack Mix/.test(surface.text) &&
      surface.finalNavigation.scriptPivotObjects.some((item) => item.recordType === 'manufacturingrouting' && /routing\.nl\?id=9021/.test(item.url || '')) &&
      surface.routingW450.routingAttachVerification.routingId === 9021 &&
      /routing\.nl\?id=9021/.test(surface.routingW450.routingAttachVerification.routingUrl) &&
      surface.routingW450.routingAttachVerification.attached === true &&
      surface.routingW450.routingAttachVerification.defaulted === true,
    JSON.stringify(surface.routingW450.routingAttachVerification, null, 2));

  assertCase(results, 'w450-failure-diagnostics-actionable',
    surface.routingW450.failureDiagnostics.every((item) => (
      item.operation &&
      item.center &&
      item.template &&
      item.fieldId &&
      item.errorName &&
      item.errorMessage &&
      item.nextFixHint
    )),
    JSON.stringify(surface.routingW450.failureDiagnostics, null, 2));

  assertCase(results, 'w450-drawer-wip-flow-diagnostic-not-needs-real-url',
    /Routing and operation detail|Routing Diagnostic/.test(surface.text) &&
      !/Routing Diagnostic[\s\S]{0,180}Needs real URL/i.test(surface.text) &&
      !/Planned Operation 1[\s\S]{0,180}Needs real URL/i.test(surface.text),
    surface.text);

  assertCase(results, 'w450-planned-diagnostic-excluded-from-missing-link-counts',
    surface.operations.every((item) => hooks.linkSummaryEligibleW446(item) === false) &&
      surface.diagnostics.every((item) => hooks.linkSummaryEligibleW446(item) === false) &&
      surface.exportPayload.realMissingUrlRows.every((item) => !/operation|diagnostic/i.test(`${item.role || ''} ${item.label || ''} ${item.recordType || ''}`)),
    JSON.stringify(surface.exportPayload.realMissingUrlRows, null, 2));

  assertCase(results, 'w450-roi-competitive-compact-confidence-source-tagged',
    surface.html.includes('idb-w449-collapsible-why') &&
      /Decrease customer-promise risk/.test(surface.text) &&
      /Confidence: \d+%/.test(surface.text) &&
      /Source:/.test(surface.text) &&
      /Beat (spreadsheets|disconnected MRP|QuickBooks plus spreadsheets) with fresher proof/.test(surface.text),
    surface.text);

  assertCase(results, 'w450-troubleshoot-export-complete',
    surface.exportPayload.schema === 'idb.w450-troubleshoot-export.v1' &&
      surface.exportPayload.troubleshootExportTelemetryW446 &&
      surface.exportPayload.troubleshootExportTelemetryW446.namingAdvisoryW450 &&
      /generic/i.test(surface.exportPayload.troubleshootExportTelemetryW446.blockedFallback || '') &&
      surface.exportPayload.troubleshootExportTelemetryW446.workCenterTemplateProbesW450 &&
      surface.exportPayload.troubleshootExportTelemetryW446.routingAttachVerificationW450 &&
      surface.exportPayload.productNamingTruthW450 &&
      surface.exportPayload.productNamingTruthW450.genericFallbackBlocked === true &&
      surface.exportPayload.routingTruth &&
      surface.exportPayload.routingTruth.routingAttempts &&
      surface.exportPayload.routingTruth.routingAttempts.w450,
    JSON.stringify(surface.exportPayload, null, 2));

  assertCase(results, 'w450-package-script',
    pkg.scripts && pkg.scripts['harness:llm-naming-and-real-wip-routing-w450'] === 'node archive/tools/run_w450_llm_naming_and_real_wip_routing_harness.js',
    'package.json should expose the W450 harness.');

  printResults('W450 LLM naming and real WIP routing harness', results);
}

main();
