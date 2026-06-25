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
const reportPath = path.join(root, 'archive', 'reports', 'w445_pristine_cockpit_followup.md');

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

function openRecord(role, label, name, id, extra) {
  const type = /work/i.test(role) ? 'workorder' : (/routing/i.test(role) ? 'manufacturingrouting' : (/bomrevision/i.test(role) ? 'bomrevision' : (/bom/i.test(role) ? 'bom' : 'assemblyitem')));
  const pathByType = {
    workorder: 'app/accounting/transactions/workord.nl',
    manufacturingrouting: 'app/accounting/manufacturing/routing.nl',
    bomrevision: 'app/accounting/manufacturing/bomrevision.nl',
    bom: 'app/accounting/manufacturing/bom.nl',
    assemblyitem: 'app/common/item/item.nl'
  };
  return Object.assign({
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
  }, extra || {});
}

function buildSurface(drawerHooks) {
  const sidecar = {
    schema: 'idb.runner-sidecar-result-json.v1',
    status: 'pending_transaction_resolution',
    runStatus: 'pending_transaction_resolution',
    idempotencyToken: 'W445-SIETE-EXT',
    runnerTaskId: 'task-w445',
    records: {
      assemblyItem: openRecord('assembly', 'Production Batch', 'Siete Maíz Sea Salt Tortilla Chip Production Batch', 8201),
      workOrder: openRecord('workOrder', 'Work Order', 'WO634', 634),
      routingDiagnostic: {
        role: 'routingDiagnostic',
        label: 'Routing Diagnostic',
        type: 'manufacturingrouting_diagnostic',
        recordType: 'manufacturingrouting_diagnostic',
        name: 'Routing Diagnostic - Routing - Siete Maíz Sea Salt Tortilla Chips',
        expectedRoutingName: 'Routing - Siete Maíz Sea Salt Tortilla Chips',
        staleRoutingName: 'Cookie Production Line',
        reason: 'stale_routing_name_from_prior_product'
      }
    },
    productBuildPlanW432: {
      primaryProductCandidate: 'Siete Maíz Sea Salt Tortilla Chips',
      alternateProductCandidates: ['Siete Grain Free Tortilla Chips', 'Siete Taco Shells', 'Siete Seasoning Mixes', 'Siete Cookies', 'Siete Beans', 'Siete Sauces'],
      selectedProductReason: 'Selected from website/product evidence terms for this run.',
      productCandidateSource: 'website_product_evidence',
      nextCandidateHint: 'Siete Grain Free Tortilla Chips',
      operationNames: ['Mix Masa', 'Sheet and Cut Tortilla Chips', 'Fry in Avocado Oil', 'Season with Sea Salt', 'Bag, Case Pack, and QC']
    },
    workOrderTelemetry: { status: 'saved', woId: 634, workOrderId: 634 },
    routingDiagnostic: {
      expectedRoutingName: 'Routing - Siete Maíz Sea Salt Tortilla Chips',
      actualRoutingName: 'Cookie Production Line',
      staleRoutingName: 'Cookie Production Line',
      reason: 'stale_routing_name_from_prior_product'
    },
    routingOperations: ['Mix Masa', 'Sheet and Cut Tortilla Chips', 'Fry in Avocado Oil', 'Season with Sea Salt', 'Bag, Case Pack, and QC'].map((name, index) => ({
      role: `operation${index + 1}`,
      label: `Planned Operation ${index + 1}`,
      name,
      recordName: name,
      operationIndex: index,
      plannedOnly: true
    }))
  };
  const state = motionState(drawerHooks, {
    selectedLaneId: 'food_beverage',
    intake: {
      customer: 'Siete Foods',
      website: 'https://www.sietefoods.com',
      notes: 'Siete production batch readiness, WIP routing, work order execution, spreadsheets, disconnected MRP, SAP Business One, Microsoft Dynamics, QuickBooks inventory add-ons, Fishbowl, Katana.'
    },
    toggles: { food_beverage: { createNewHeroItem: true, enableManufacturing: true, enableWip: true } },
    dccFinalNamingResult: drawerHooks.dccFinalNamingResultV1(sidecar, motionState(drawerHooks, {}), motionContext(drawerHooks, motionState(drawerHooks, {})).lane, motionContext(drawerHooks, motionState(drawerHooks, {})).page, motionContext(drawerHooks, motionState(drawerHooks, {})).recommendation),
    integratedBuildRunnerResult: {
      status: 'completed_result_ready',
      idempotencyToken: 'W445-SIETE-EXT',
      runnerTaskId: 'task-w445',
      sidecarGeneratedNamesJson: sidecar,
      resultCapture: {
        idempotencyToken: 'W445-SIETE-EXT',
        runnerTaskId: 'task-w445',
        workOrderTelemetry: sidecar.workOrderTelemetry,
        routingResult: { decision: 'failed_best_effort', actualRoutingName: 'Cookie Production Line' },
        routingOperations: sidecar.routingOperations
      }
    }
  });
  const context = motionContext(drawerHooks, state);
  const finalNavigation = drawerHooks.dccFinalNavigationModel(state, context.lane, context.page, context.recommendation);
  const value = {
    customer: 'Siete Foods',
    roiAudit: { claim: 'Protect production batch readiness.', baselineNeeded: 'Baseline needed: miss rate, delay cost, and manual reconciliation volume.' },
    grounded: {}
  };
  const html = drawerHooks.renderW415DemoCockpit({
    state,
    lane: context.lane,
    value,
    script: { say: 'Prove the WIP truth.', show: 'Show work order, routing diagnostic, and planned operations.' },
    finalNavigation,
    storyContractW373: { proofLabel: 'Production proof' },
    websiteEvidence: { confidence: { displayText: 'Conversation notes', scoreLabel: 'medium' }, text: 'WIP routing work order production batch' },
    competitiveAdvisory: { likelyAlternatives: ['spreadsheets', 'disconnected MRP', 'SAP Business One', 'Microsoft Dynamics', 'QuickBooks inventory add-ons', 'Fishbowl', 'Katana'] }
  });
  return { state, finalNavigation, html, text: stripHtml(html) };
}

function main() {
  const results = [];
  const drawer = read(drawerPath);
  const runner = read(runnerPath);
  const pkg = JSON.parse(read(path.join(root, 'package.json')));
  const drawerHooks = loadHooks();
  const surface = buildSurface(drawerHooks);
  const exportPayload = drawerHooks.w444TroubleshootExportPayload(surface.state);

  assertCase(results, 'w445-marker-updated',
    /@version\s+1\.0\.53/.test(drawer) &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.53';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W445';"),
    'Drawer should identify W445 / 1.0.53.');

  assertCase(results, 'w445-drag-only-resize',
    drawer.includes('data-idb-w444-resize-handle') &&
      drawer.includes('DRAWER_WIDTH_STORAGE_KEY_W444') &&
      !drawer.includes('data-idb-w444-width-preset="compact"') &&
      !drawer.includes('data-idb-w444-width-preset="standard"') &&
      !drawer.includes('data-idb-w444-width-preset="wide"'),
    'Resize should be drag-only in the visible header.');

  assertCase(results, 'w445-drilldowns-obvious-and-surgical',
    /Why this ROI was chosen/.test(surface.text) &&
      /Presented because/.test(surface.text) &&
      /Why this competitive angle was chosen/.test(drawer) &&
      drawer.includes('aria-pressed') &&
      drawer.includes('data-idb-w445-detail-anchor') &&
      drawer.includes('scrollIntoView'),
    surface.text);

  assertCase(results, 'w445-proof-path-details-not-rendered',
    !/Proof path details|Proof quality details/.test(surface.text) &&
      /Troubleshoot \/ Export/.test(surface.text),
    surface.text);

  assertCase(results, 'w445-single-start-new-run-action',
    /Start new run/.test(surface.text) &&
      !/Clear run/.test(surface.text) &&
      drawer.includes('data-idb-w445-start-new-run') &&
      !drawer.includes('data-idb-w444-clear-run="all"'),
    surface.text);

  assertCase(results, 'w445-troubleshoot-export-for-escalation',
    exportPayload.schema === 'idb.w445-troubleshoot-export.v1' &&
      exportPayload.drawerBlock === 'W445' &&
      exportPayload.routingTruth &&
      exportPayload.workOrderTruth &&
      exportPayload.recommendedReview &&
      exportPayload.rawResultKeys &&
      exportPayload.workOrderTruth.telemetryWorkOrderId === '634' &&
      exportPayload.recommendedReview.routingStaleDetected === true &&
      drawer.includes('downloaded: true') &&
      drawer.includes('forge-w445-troubleshoot'),
    JSON.stringify(exportPayload, null, 2));

  assertCase(results, 'w445-short-internal-assembly-name',
    runner.includes("replace(/\\bSea\\s+Salt\\s+/i, '')") &&
      runner.includes(".replace(/\\bChips\\b/i, 'Chip')") &&
      runner.includes("+ ' Batch'") &&
      !/assemblyItemName:\\s*trimLen\\(industryNativeW442\\.industryNativeManufacturedItemName, 80\\)/.test(runner),
    'Siete internal assembly item name should be short enough for NetSuite item name/number plus suffix.');

  assertCase(results, 'w445-stale-routing-repair-in-place',
    runner.includes('staleRoutingRepairTargetId') &&
      runner.includes('Routing stale record repaired in place') &&
      runner.includes("decision: staleRoutingRepairTargetId ? 'repaired-stale-routing-in-place'") &&
      !runner.includes('staleRoutingIgnored'),
    'Stale routing should be a repair target, not a valid reused routing.');

  assertCase(results, 'w445-work-order-link-from-telemetry',
    runner.includes('resolvedWorkOrderIdW445') &&
      runner.includes('args.workOrderTelemetry && args.workOrderTelemetry.woId') &&
      runner.includes("type: 'workorder'") &&
      /Work Order\s+WO634\s+Open/.test(surface.text),
    surface.text);

  assertCase(results, 'w445-package-script',
    pkg.scripts['harness:cockpit-pristine-followup-w445'] === 'node archive/tools/run_w445_pristine_cockpit_followup_harness.js',
    JSON.stringify(pkg.scripts, null, 2));

  const report = `# W445 Pristine Cockpit Followup\n\n${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.id}`).join('\n')}\n`;
  fs.writeFileSync(reportPath, report);
  printResults('W445 pristine cockpit followup harness', results);
}

main();
