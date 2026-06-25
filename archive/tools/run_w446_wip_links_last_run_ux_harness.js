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
    assemblyitem: 'app/common/item/item.nl',
    bom: 'app/accounting/manufacturing/bom.nl',
    bomrevision: 'app/accounting/manufacturing/bomrevision.nl',
    workorder: 'app/accounting/transactions/workord.nl',
    manufacturingrouting: 'app/accounting/manufacturing/routing.nl'
  };
  return {
    role,
    label,
    name,
    recordName: name,
    type,
    recordType: type,
    id: String(id),
    internalId: String(id),
    url: `https://td3021666.app.netsuite.com/${pathByType[type]}?id=${id}`,
    source: 'dcc_final'
  };
}

function buildSurface(hooks) {
  const operations = ['Mix Masa', 'Sheet and Cut Tortilla Chips', 'Fry in Avocado Oil', 'Season with Sea Salt', 'Bag, Case Pack, and QC']
    .map((name, index) => ({
      role: `operation${index + 1}`,
      label: `Planned Operation ${index + 1}`,
      name,
      recordName: name,
      operationIndex: index,
      plannedOnly: true,
      source: 'dcc_final'
    }));
  const sidecar = {
    schema: 'idb.runner-sidecar-result-json.v1',
    status: 'pending_transaction_resolution',
    runStatus: 'pending_transaction_resolution',
    idempotencyToken: 'W446-SIETE-EXT',
    runnerTaskId: 'task-w446',
    records: {
      customer: openRecord('customer', 'Customer', 'Siete Foods Customer Account', 'customer', 4722),
      assemblyItem: openRecord('assembly', 'Production Batch', 'Siete Maiz Tortilla Chip Batch', 'assemblyitem', 1869),
      bom: openRecord('bom', 'Bill of Materials', 'BOM - Siete Maiz Sea Salt Tortilla Chips', 'bom', 50),
      bomRevision: openRecord('bomRevision', 'BOM Revision', 'Revision 1 - Siete Maiz Sea Salt Tortilla Chips', 'bomrevision', 67),
      workOrderDiagnostic: {
        role: 'workOrderDiagnostic',
        label: 'Work Order Diagnostic',
        type: 'workorder_diagnostic',
        recordType: 'workorder_diagnostic',
        name: 'WO - Siete Maiz Sea Salt Tortilla Chips',
        reason: 'body-field-resolution-failure'
      },
      routingDiagnostic: {
        role: 'routingDiagnostic',
        label: 'Routing Diagnostic',
        type: 'manufacturingrouting_diagnostic',
        recordType: 'manufacturingrouting_diagnostic',
        name: 'Routing - Siete Maiz Sea Salt Tortilla Chips',
        expectedRoutingName: 'Routing - Siete Maiz Sea Salt Tortilla Chips',
        staleRoutingName: 'Cookie Production Line',
        reason: 'BOM not selectable for routing context'
      }
    },
    productBuildPlanW432: {
      primaryProductCandidate: 'Siete Maiz Sea Salt Tortilla Chips',
      alternateProductCandidates: ['Siete Grain Free Tortilla Chips', 'Siete Taco Shells', 'Siete Seasoning Mixes'],
      selectedProductReason: 'Selected from website and conversation evidence.',
      productCandidateSource: 'conversation_notes',
      operationNames: operations.map((item) => item.name)
    },
    routingOperations: operations,
    workOrderTelemetry: {
      status: 'failed',
      failureType: 'body-field-resolution-failure',
      attemptsTried: [{ label: 'body-field-fallback-dynamic-default-values', status: 'failed_before_save' }]
    },
    routingDiagnostics: {
      decision: 'failed_best_effort',
      failureStage: 'set_billofmaterials',
      routingEligibilityConclusion: 'BOM not selectable for routing context',
      staleRoutingName: 'Cookie Production Line'
    },
    manufacturingEligibilityPreflightW446: {
      schema: 'idb.w446-manufacturing-eligibility-preflight.v1',
      status: 'warning',
      probes: { assemblyId: 1869, bomId: 50, bomRevId: 67 }
    },
    troubleshootExportTelemetryW446: {
      schema: 'idb.w446-runner-troubleshoot-telemetry.v1',
      manufacturingEligibilityPreflightW446: { status: 'warning' },
      workOrderTelemetry: { failureType: 'body-field-resolution-failure' },
      routingResult: { routingFailure: { routingEligibilityConclusion: 'BOM not selectable for routing context' } }
    }
  };
  const empty = motionState(hooks, {});
  const context = motionContext(hooks, empty);
  const state = motionState(hooks, {
    selectedLaneId: 'food_beverage',
    intake: {
      customer: 'Siete Foods routed tortilla chip production readiness',
      website: 'https://www.sietefoods.com',
      notes: 'Production batch readiness, WIP routing, work order execution, ingredient availability, spreadsheets, disconnected MRP.'
    },
    toggles: { food_beverage: { createNewHeroItem: true, enableManufacturing: true, enableWip: true } },
    dccFinalNamingResult: hooks.dccFinalNamingResultV1(sidecar, empty, context.lane, context.page, context.recommendation),
    integratedBuildRunnerResult: {
      status: 'completed_result_ready',
      idempotencyToken: 'W446-SIETE-EXT',
      runnerTaskId: 'task-w446',
      sidecarGeneratedNamesJson: sidecar,
      resultCapture: {
        idempotencyToken: 'W446-SIETE-EXT',
        runnerTaskId: 'task-w446',
        workOrderTelemetry: sidecar.workOrderTelemetry,
        routingResult: sidecar.routingDiagnostics,
        routingOperations: sidecar.routingOperations,
        troubleshootExportTelemetryW446: sidecar.troubleshootExportTelemetryW446
      }
    }
  });
  const finalContext = motionContext(hooks, state);
  const cockpitRows = [
    sidecar.records.customer,
    sidecar.records.assemblyItem,
    sidecar.records.bom,
    sidecar.records.bomRevision,
    sidecar.records.workOrderDiagnostic,
    sidecar.records.routingDiagnostic
  ].concat(operations).map((item) => {
    const authority = hooks.verifiedRecordLinkAuthorityV1(item);
    return Object.assign({}, item, {
      source: 'dcc_final',
      linkAuthority: authority,
      openableUrl: authority.openable ? authority.url : ''
    });
  });
  const linkSummaryRows = cockpitRows.filter(hooks.linkSummaryEligibleW446);
  const linkAuthoritySummary = linkSummaryRows.reduce((summary, item) => {
    const status = item.linkAuthority && item.linkAuthority.status || 'unknown';
    summary[status] = (summary[status] || 0) + 1;
    return summary;
  }, {});
  const finalNavigation = {
    schema: 'idb.dcc-final-navigation-model.v1',
    status: 'using_dcc_final_names',
    displayStatus: 'Final generated names imported',
    source: 'dcc_final_imported',
    runCanUseImportedFinalNames: false,
    proofReviewAvailable: true,
    proofQualityGate: { status: 'proof_needs_review', runReady: false, proofNeedsReview: true },
    reviewObjects: cockpitRows.slice(0, 6),
    scriptPivotObjects: cockpitRows,
    linkAuthoritySummary,
    linkAuthoritySummaryExcludingPlannedW446: linkAuthoritySummary,
    plannedOnlyOperationCountW446: operations.length,
    warnings: []
  };
  const html = hooks.renderW415DemoCockpit({
    state,
    lane: finalContext.lane,
    value: { grounded: {}, roiAudit: { baselineNeeded: 'Baseline needed: miss rate and delay cost.' } },
    script: { say: 'Prove WIP truth.', show: 'Open production records and diagnostics.' },
    finalNavigation,
    storyContractW373: { proofLabel: 'WIP proof' },
    websiteEvidence: { text: 'production routing work order ingredient availability' },
    competitiveAdvisory: { likelyAlternatives: ['spreadsheets', 'disconnected MRP'] }
  });
  return { state, finalNavigation, html, text: stripHtml(html), exportPayload: hooks.w444TroubleshootExportPayload(state) };
}

function main() {
  const results = [];
  const drawer = read(drawerPath);
  const runner = read(runnerPath);
  const pkg = JSON.parse(read(packagePath));
  const hooks = loadHooks();
  const surface = buildSurface(hooks);

  assertCase(results, 'w446-marker-updated',
    /@version\s+1\.0\.55/.test(drawer) &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.55';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W447';"),
    'Drawer should identify current W447 / 1.0.55 while preserving W446 behavior.');

  assertCase(results, 'w446-wip-visual-three-stage-clickable',
    hooks.cockpitWorkflowNodesW446('wip', surface.finalNavigation.scriptPivotObjects).length <= 3 &&
      surface.html.includes('data-idb-w446-compact-wip-workflow="true"') &&
      /Demand & Procurement.*Production \/ WIP.*Output & Impact/.test(surface.text),
    surface.text);

  assertCase(results, 'w446-demand-standard-order-items-fallback',
    drawer.includes("standardNetSuiteScreenLinkAuthorityW446('/app/accounting/transactions/orderitems.nl')") &&
      drawer.includes('/app/accounting/transactions/orderitems.nl'),
    'Demand fallback must use the standard Order Items screen without weakening record-link authority.');

  assertCase(results, 'w446-planned-operations-not-link-debt',
    surface.exportPayload.plannedOnlyOperationCount >= 5 &&
      !Object.prototype.hasOwnProperty.call(surface.exportPayload.linkSummaryExcludingPlanned, 'missing_url') &&
      /Planned Operation 1 Mix Masa/.test(surface.text),
    JSON.stringify(surface.exportPayload.linkSummaryExcludingPlanned));

  assertCase(results, 'w446-diagnostics-still-visible',
    /Routing Diagnostic/.test(surface.text) &&
      /Work Order Diagnostic/.test(surface.text) &&
      /BOM not selectable for routing context|body-field-resolution-failure/.test(surface.text),
    surface.text);

  assertCase(results, 'w446-last-run-restore-contract',
    drawer.includes('LAST_RUN_STORAGE_KEY_W446') &&
      drawer.includes('data-idb-w446-restore-last-run') &&
      drawer.includes('restoreLastRunSnapshotW446') &&
      surface.html.includes('data-idb-w446-restore-last-run'),
    'Last Run should persist and restore a local display snapshot.');

  assertCase(results, 'w446-roi-competitive-source-tagging',
    /Source basis/.test(surface.text) &&
      /Conversation Notes|Industry Fallback/.test(surface.text) &&
      !/measured savings can|save \d+%/i.test(surface.text),
    surface.text);

  assertCase(results, 'w446-troubleshoot-export-telemetry',
    surface.exportPayload.schema === 'idb.w447-troubleshoot-export.v1' &&
      surface.exportPayload.truthSummaryW447 &&
      surface.exportPayload.manufacturingEligibilityPreflightW446 &&
      surface.exportPayload.troubleshootExportTelemetryW446 &&
      Array.isArray(surface.exportPayload.plannedOnlyRows) &&
      Array.isArray(surface.exportPayload.realLinkRows),
    JSON.stringify(surface.exportPayload, null, 2));

  assertCase(results, 'w446-runner-fallback-source-contract',
    runner.includes('buildManufacturingEligibilityPreflightW446') &&
      runner.includes('body-field-fallback-dynamic-default-values') &&
      runner.includes('BOM not selectable for routing context') &&
      runner.includes('troubleshootExportTelemetryW446') &&
      runner.includes('do_not_reuse_stale_route_create_product_specific_route'),
    'Runner should expose preflight, body-field fallback, routing context diagnostics, and stale-route non-reuse.');

  assertCase(results, 'w446-package-script',
    pkg.scripts && pkg.scripts['harness:wip-links-last-run-ux-w446'] === 'node archive/tools/run_w446_wip_links_last_run_ux_harness.js',
    'package.json should expose the W446 harness.');

  printResults('W446 WIP links, Last Run, and UX harness', results);
}

main();
