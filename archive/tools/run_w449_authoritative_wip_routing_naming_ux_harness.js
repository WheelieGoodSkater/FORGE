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

function openRecord(role, label, name, type, id) {
  const pathByType = {
    customer: 'app/common/entity/custjob.nl',
    salesorder: 'app/accounting/transactions/salesord.nl',
    assemblyitem: 'app/common/item/item.nl',
    bom: 'app/accounting/manufacturing/bom.nl',
    bomrevision: 'app/accounting/manufacturing/bomrevision.nl',
    workorder: 'app/accounting/transactions/workord.nl',
    manufacturingrouting: 'app/accounting/manufacturing/routing.nl'
  };
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
    url: `https://td3021666.app.netsuite.com/${pathByType[type]}?id=${id}`,
    source: 'dcc_final',
    safeToOpen: true,
    linkAuthority: {
      status: 'verified_openable',
      openable: true,
      url: `https://td3021666.app.netsuite.com/${pathByType[type]}?id=${id}`
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

function buildSurface(hooks) {
  const operations = [
    'Receive Chickpeas and Seasoning',
    'Roast Chickpeas',
    'Season and Cool',
    'Bag and Case Pack',
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

  const w449 = {
    schema: 'idb.w449-routing-work-center-pair-probing.v1',
    authoritativeWorkCenterSearch: {
      id: 5005,
      scriptId: 'customsearch_scai_ss_wc_wip',
      title: 'Work Center List Reset Engine'
    },
    centerRanking: [
      { id: 1439, name: 'DEN-Large Fill Blender', w449PreferredIdRank: 1 },
      { id: 1450, name: 'Parfait Layering/Blending', w449PreferredIdRank: 2 },
      { id: 1394, name: 'SFO-Blending-HUM', w449PreferredIdRank: 3 }
    ],
    operationPlans: [{
      seq: 20,
      opName: 'Roast Chickpeas',
      rankedCenters: [{ id: 1686, name: 'DEN-Salad Assembly' }],
      rankedTemplates: [{ id: 6, name: 'DEN-Case Packing (2 Lines)' }]
    }],
    pairProbes: [
      { seq: 20, centerId: 1394, centerName: 'SFO-Blending-HUM', status: 'rejected', errorName: 'INVALID_FLD_VALUE', fieldId: 'manufacturingworkcenter' },
      { seq: 20, centerId: 1686, centerName: 'DEN-Salad Assembly', status: 'accepted', templateId: 6 }
    ],
    rejectedPairs: [{ seq: 20, centerId: 1394, errorName: 'INVALID_FLD_VALUE', fieldId: 'manufacturingworkcenter' }],
    acceptedPairs: [{ seq: 20, centerId: 1686, centerName: 'DEN-Salad Assembly', templateId: 6 }],
    routingAssemblyVerification: {
      found: false,
      valid: false,
      staleCookieProductionLineDetected: true
    }
  };

  const sidecar = {
    schema: 'idb.runner-sidecar-result-json.v1',
    status: 'pending_transaction_resolution',
    runStatus: 'pending_transaction_resolution',
    idempotencyToken: 'W449-BIENA-EXT',
    runnerTaskId: 'task-w449',
    records: {
      customer: openRecord('customer', 'Customer', 'Biena Chickpea Snack Line Readiness Customer Account', 'customer', 5101),
      salesOrder: openRecord('sales_order', 'Sales Order', 'SO - Biena Chickpea Snack Line Readiness', 'salesorder', 6110),
      sellableItem: openRecord('sellable_item', 'Sellable Item', 'Biena Roasted Chickpeas Finished Case 12-Count Case Pack', 'assemblyitem', 1871),
      assemblyItem: openRecord('assembly', 'Production Batch', 'Biena Roasted Chickpeas Finished Case Production Batch', 'assemblyitem', 1872),
      bom: openRecord('bom', 'Bill of Materials', 'BOM - Biena Roasted Chickpeas Finished Case 12-Count Case Pack', 'bom', 73),
      bomRevision: openRecord('bomRevision', 'BOM Revision', 'Revision 1 - Biena Roasted Chickpeas Finished Case 12-Count Case Pack', 'bomrevision', 74),
      workOrderDiagnostic: diagnostic('workOrderDiagnostic', 'Work Order Diagnostic', 'Work Order Diagnostic - WO - Biena Roasted Chickpeas Finished Case', 'body-field-resolution-failure'),
      routingDiagnostic: diagnostic('routingDiagnostic', 'Routing Diagnostic', 'Routing Diagnostic - Routing - Biena Roasted Chickpeas Finished Case', 'No compatible WIP work center accepted by manufacturingrouting line field', {
        expectedRoutingName: 'Routing - Biena Roasted Chickpeas Finished Case',
        staleRoutingName: 'Cookie Production Line',
        w449
      })
    },
    productBuildPlanW432: {
      primaryProductCandidate: 'Biena Roasted Chickpeas Finished Case',
      alternateProductCandidates: ['Biena Sea Salt Chickpea Snacks', 'Biena Honey Roasted Chickpeas', 'Biena Chickpea Puffs'],
      selectedProductReason: 'Selected from website/category and conversation notes about roasted chickpea line readiness.',
      productCandidateSource: 'website_category_inference',
      confidencePercent: 82,
      evidenceTerms: ['Biena', 'chickpea', 'snack', 'retail bag', 'case pack'],
      rejectedFallbackReason: 'Food/CPG website and notes evidence blocked generic manufacturing fallback.',
      operationNames: operations.map((item) => item.name)
    },
    routingOperations: operations,
    routingDiagnostics: {
      status: 'failed_best_effort',
      decision: 'failed_best_effort',
      failureStage: 'add_routing_step',
      reason: 'No compatible WIP work center accepted by manufacturingrouting line field',
      expectedRoutingName: 'Routing - Biena Roasted Chickpeas Finished Case',
      staleRoutingName: 'Cookie Production Line',
      w449
    },
    workOrderTelemetry: {
      status: 'failed',
      failureType: 'body-field-resolution-failure',
      attemptsTried: [{ label: 'body-field-fallback-dynamic-default-values', status: 'failed_before_save' }]
    },
    troubleshootExportTelemetryW446: {
      schema: 'idb.w446-runner-troubleshoot-telemetry.v1',
      routingResult: { w449 },
      manufacturingEligibilityPreflightW446: { status: 'warning', assemblyId: 1872, bomId: 73, bomRevisionId: 74 }
    }
  };

  const state = motionState(hooks, {
    selectedLaneId: 'products_cpg',
    intake: {
      customer: 'Biena Chickpea Snack Line Readiness',
      website: 'https://bienasnacks.com',
      notes: 'Run a WIP demo for Biena roasted chickpea snack production. Buyer wants to beat QuickBooks plus spreadsheets by proving customer demand, supply, WIP routing, work order status, and finished case output in one path.'
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: true,
      enableWip: true
    },
    integratedBuildRunnerResult: {
      status: 'completed',
      runStatus: 'pending_transaction_resolution',
      idempotencyToken: sidecar.idempotencyToken,
      runnerTaskId: sidecar.runnerTaskId,
      sidecarGeneratedNamesJson: sidecar,
      resultCapture: {
        idempotencyToken: sidecar.idempotencyToken,
        runnerTaskId: sidecar.runnerTaskId,
        routingResult: sidecar.routingDiagnostics,
        workOrderTelemetry: sidecar.workOrderTelemetry,
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
    operations,
    diagnostics: [sidecar.records.routingDiagnostic, sidecar.records.workOrderDiagnostic]
  };
}

function main() {
  const drawer = read(drawerPath);
  const runner = read(runnerPath);
  const pkg = JSON.parse(read(packagePath));
  const hooks = loadHooks();
  const surface = buildSurface(hooks);
  const results = [];
  const w453ResetMode = runner.includes("w453-legacy-runner-core-sidecar-bridge");

  assertCase(results, 'w449-marker-updated',
    /@version\s+1.0.(57|58|59|60)/.test(drawer) &&
      /const DRAWER_USERSCRIPT_VERSION = '1.0.(57|58|59|60)';/.test(drawer) &&
      /const CURRENT_UX_BLOCK_W346 = 'W(449|450|451|454)';/.test(drawer),
    'Drawer should identify W449 / 1.0.57 or successor W450/W451/W454.');

  assertCase(results, 'w449-authoritative-work-center-search',
    w453ResetMode || runner.includes('customsearch_scai_ss_wc_wip') &&
      runner.includes('Work Center List Reset Engine') &&
      runner.includes('5005') &&
      runner.includes('authoritativeWipWorkCenterSearchIdW449'),
    'Runner should force saved search 5005 / customsearch_scai_ss_wc_wip as the WIP center pool, or use the W453 legacy-core reset path.');

  assertCase(results, 'w449-known-centers-ranked-by-family',
    w453ResetMode || runner.includes('W449_WORK_CENTER_FAMILIES') &&
      runner.includes('receiving: [1630]') &&
      runner.includes('mixing: [1439, 1450, 1394]') &&
      runner.includes('production: [1686, 1438, 1398]') &&
      runner.includes('packing: [1437, 1396, 1451]') &&
      runner.includes('w449PreferredIdRank'),
    'Known saved-search centers should be ranked by operation family, unless W453 has intentionally restored the older direct routing core.');

  assertCase(results, 'w449-rejected-center-values-captured',
    w453ResetMode && runner.includes('WIP routing best-effort failure W453 legacy core') ||
      runner.includes('addStepWithPairProbingW449') &&
      runner.includes('probe_routing_step_pair') &&
      runner.includes('rejectedPairs') &&
      runner.includes('acceptedPairs') &&
      runner.includes('W449_NO_VALID_ROUTING_STEP_PAIR'),
    'Rejected work center/template pairs should be captured, or W453 should return direct-routing diagnostics without blocking sidecar output.');

  assertCase(results, 'w449-routing-attach-default-verification',
    w453ResetMode && runner.includes('attachRoutingToAssemblySafe') && runner.includes('createAndAttachRoutingIfPossible') ||
      runner.includes('verifyRoutingAttachedOnAssemblyW449') &&
      runner.includes('attachRoutingToAssemblySafe({ assemblyId, routingId, forceDefault: true })') &&
      runner.includes('stale_cookie_production_line_rejected') &&
      /cookie\\s\+production\\s\+line/i.test(runner),
    'Routing should attach/default through W449 verification or through the W453 restored legacy direct-routing path.');

  assertCase(results, 'w449-product-naming-source-not-deterministic-fallback',
    surface.exportPayload.productNamingTruthW449 &&
      surface.exportPayload.productNamingTruthW449.source !== 'deterministic_product_fallback' &&
      surface.exportPayload.productNamingTruthW449.source !== 'fallback_no_product_found' &&
      /Biena Roasted Chickpeas Finished Case/.test(surface.text),
    JSON.stringify(surface.exportPayload.productNamingTruthW449, null, 2));

  assertCase(results, 'w449-no-generic-food-names-in-cockpit',
    !/Machine Unit|Core Material Input|Primary Material Input|Build Product|Prepare Materials|Final Assembly Unit/.test(surface.text) &&
      /Receive Chickpeas and Seasoning|Roast Chickpeas|Season and Cool|Bag and Case Pack|QC Finished Cases/.test(surface.text),
    surface.text);

  assertCase(results, 'w449-wip-flow-not-planned-url-rows',
    surface.html.includes('data-idb-w449-wip-flow-component="true"') &&
      /Demand\s+→\s+Assembly \/ BOM Revision\s+→\s+Routing diagnostic\s+→\s+Work Order diagnostic\s+→\s+Output/.test(surface.text) &&
      /Routing and operation detail/.test(surface.text) &&
      /Planned Operation 1 Receive Chickpeas and Seasoning/.test(surface.text) &&
      !/Planned Operation 1 Receive Chickpeas and Seasoning\s+Needs real URL/i.test(surface.text) &&
      !/Routing Diagnostic[\s\S]{0,160}Needs real URL/i.test(surface.text),
    surface.text);

  assertCase(results, 'w449-planned-and-diagnostic-excluded-from-link-debt',
    surface.operations.every((item) => hooks.linkSummaryEligibleW446(item) === false) &&
      surface.diagnostics.every((item) => hooks.linkSummaryEligibleW446(item) === false) &&
      surface.exportPayload.realMissingUrlRows.every((item) => !/operation|diagnostic/i.test(`${item.role || ''} ${item.label || ''} ${item.recordType || ''}`)),
    JSON.stringify(surface.exportPayload.realMissingUrlRows, null, 2));

  assertCase(results, 'w449-manufacturing-group-removes-duplicate-bom-row',
    /Manufacturing/.test(surface.text) &&
      /Production Batch Biena Roasted Chickpeas Finished Case Production Batch/.test(surface.text) &&
      /BOM Revision Revision 1 - Biena Roasted Chickpeas Finished Case/.test(surface.text) &&
      !/Bill of Materials BOM - Biena Roasted Chickpeas Finished Case/.test(surface.text),
    surface.text);

  assertCase(results, 'w449-roi-competitive-compact-collapsible',
      surface.html.includes('idb-w449-collapsible-why') &&
      /Decrease customer-promise risk/.test(surface.text) &&
      /Confidence: \d+%/.test(surface.text) &&
      /Beat (QuickBooks plus spreadsheets|spreadsheets) with fresher proof/.test(surface.text) &&
      /No savings claim without baseline/.test(surface.text),
    surface.text);

  assertCase(results, 'w449-troubleshoot-export-routing-and-naming-telemetry',
    /^idb\.w(449|450|451)-troubleshoot-export\.v1$/.test(surface.exportPayload.schema) &&
      (
        surface.exportPayload.authoritativeWorkCenterRoutingW449 &&
        (
          surface.exportPayload.authoritativeWorkCenterRoutingW449.authoritativeWorkCenterSearch ||
          surface.exportPayload.authoritativeWorkCenterRoutingW449.savedSearch
        )
      ) &&
      (
        Array.isArray(surface.exportPayload.authoritativeWorkCenterRoutingW449.pairProbes) ||
        Array.isArray(surface.exportPayload.w450RoutingProbeTruth && surface.exportPayload.w450RoutingProbeTruth.routingLineProbes)
      ) &&
      (
        (
          surface.exportPayload.authoritativeWorkCenterRoutingW449.rejectedPairs &&
          surface.exportPayload.authoritativeWorkCenterRoutingW449.rejectedPairs[0] &&
          surface.exportPayload.authoritativeWorkCenterRoutingW449.rejectedPairs[0].errorName === 'INVALID_FLD_VALUE'
        ) ||
        (
          surface.exportPayload.w450RoutingProbeTruth &&
          Array.isArray(surface.exportPayload.w450RoutingProbeTruth.rejectedPairs)
        )
      ) &&
      surface.exportPayload.productNamingTruthW449 &&
      Array.isArray(surface.exportPayload.productNamingTruthW449.evidenceTerms) &&
      Array.isArray(surface.exportPayload.plannedAndDiagnosticRowsExcludedFromLinkDebt),
    JSON.stringify(surface.exportPayload.authoritativeWorkCenterRoutingW449, null, 2));

  assertCase(results, 'w449-package-script',
    pkg.scripts && pkg.scripts['harness:authoritative-wip-routing-naming-ux-w449'] === 'node archive/tools/run_w449_authoritative_wip_routing_naming_ux_harness.js',
    'package.json should expose the W449 harness.');

  printResults('W449 authoritative WIP routing, naming, and UX harness', results);
}

main();
