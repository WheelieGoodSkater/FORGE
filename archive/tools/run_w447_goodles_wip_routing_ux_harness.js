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

function record(role, recordType, name, id, url) {
  return {
    role,
    label: role,
    recordType,
    type: recordType,
    name,
    recordName: name,
    id: id ? String(id) : '',
    internalId: id ? String(id) : '',
    url: url || '',
    source: 'dcc_final'
  };
}

function buildGoodlesSurface(hooks) {
  const empty = motionState(hooks, {});
  const context = motionContext(hooks, empty);
  const state = motionState(hooks, {
    selectedLaneId: 'products_cpg',
    intake: {
      customer: 'Goodles Line-Ready Mac & Cheese Production',
      website: 'https://www.goodles.com',
      notes: 'Run a WIP manufacturing demo for Goodles focused on line-ready mac and cheese production. Prove customer demand through Sales Order readiness, pasta and cheese blend ingredient availability, BOM readiness, work order execution, routing progress, and finished case output. Competitive pressure is spreadsheets and disconnected MRP.'
    },
    toggles: { products_cpg: { createNewHeroItem: true, enableManufacturing: true, enableWip: true } },
    briefPrepared: true,
    acceptedPacket: { packetId: 'accepted', selectedLaneId: 'products_cpg', signature: 'x' }
  });
  const finalContext = motionContext(hooks, state);
  const salesOrder = record('sales_order', 'salesorder', 'Goodles Line-Ready Mac & Cheese Production Demo Sales Order', 991, 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=991');
  const rows = [
    record('customer', 'customer', 'Goodles Line-Ready Mac & Cheese Production Customer Account', 4723, 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=4723'),
    salesOrder,
    record('assembly', 'assemblyitem', 'Goodles Line-Ready Mac & Cheese Product', 1869, 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=1869'),
    record('bom', 'bom', 'BOM - Goodles Line-Ready Mac & Cheese', 50, 'https://td3021666.app.netsuite.com/app/accounting/manufacturing/bom.nl?id=50'),
    record('bom_revision', 'bomrevision', 'Revision 1 - Goodles Line-Ready Mac & Cheese', 67, 'https://td3021666.app.netsuite.com/app/accounting/manufacturing/bomrevision.nl?id=67'),
    record('routingDiagnostic', 'manufacturingrouting_diagnostic', 'Routing Diagnostic - Routing - Goodles Line-Ready Mac & Cheese', '', ''),
    record('workOrderDiagnostic', 'workorder_diagnostic', 'Work Order Diagnostic - WO - Goodles Line-Ready Mac & Cheese', '', '')
  ].map((item) => {
    const authority = hooks.verifiedRecordLinkAuthorityV1(item);
    return Object.assign({}, item, { linkAuthority: authority });
  });
  rows[5].expectedRoutingName = 'Routing - Goodles Line-Ready Mac & Cheese';
  rows[5].reason = 'set_billofmaterials';
  rows[6].reason = 'body-field-resolution-failure';
  const finalNavigation = {
    status: 'using_dcc_final_names',
    displayStatus: 'Final generated names imported',
    runCanUseImportedFinalNames: false,
    proofReviewAvailable: true,
    proofQualityGate: { runReady: false, blockers: ['Routing failed at set_billofmaterials'] },
    reviewObjects: rows,
    scriptPivotObjects: rows.filter((item) => item.role !== 'sales_order'),
    linkAuthoritySummary: { verified_openable: 5, missing_url: 2 },
    linkAuthoritySummaryExcludingPlannedW446: { verified_openable: 5, missing_url: 2 },
    productBuildPlanW432: {
      primaryProductCandidate: 'Goodles Line-Ready Mac & Cheese',
      operationNames: ['Stage Pasta and Cheese Blend', 'Blend Seasoning and Dry Goods', 'Fill Retail Cartons', 'Case Pack and QC']
    }
  };
  const html = hooks.renderW415DemoCockpit({
    state,
    lane: finalContext.lane,
    value: {
      grounded: { unsupportedClaimBlocker: { blockedClaims: ['Measured savings require a customer baseline before they can be claimed.'] } },
      roiAudit: { baselineNeeded: 'current miss rate, delay cost, inventory exposure, or manual-effort baseline' }
    },
    script: { say: 'Prove line-ready production truth.', show: 'Open the Sales Order and WIP records.' },
    finalNavigation,
    storyContractW373: { proofLabel: 'WIP line-flow readiness' },
    websiteEvidence: { text: 'mac cheese production pasta ingredients case pack' },
    competitiveAdvisory: { alternatives: ['spreadsheets', 'disconnected MRP'] }
  });
  return { state, html, text: stripHtml(html), finalNavigation, salesOrder };
}

function main() {
  const results = [];
  const drawer = read(drawerPath);
  const runner = read(runnerPath);
  const pkg = JSON.parse(read(packagePath));
  const hooks = loadHooks();
  const surface = buildGoodlesSurface(hooks);

  assertCase(results, 'w447-marker-updated',
    /@version\s+1\.0\.56/.test(drawer) &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.56';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W448';"),
    'Drawer should identify W448 / 1.0.56.');

  assertCase(results, 'w447-demand-prefers-sales-order',
    /salesord\.nl\?id=991/.test(surface.html) &&
      /data-idb-w446-workflow-stage="demand"/.test(surface.html) &&
      drawer.includes("fallback: 'order_items_when_sales_order_url_missing'"),
    surface.html);

  assertCase(results, 'w447-impact-visuals-render',
    surface.html.includes('idb-w447-impact-graphic') &&
      /Decrease customer-promise risk/.test(surface.text) &&
      /Confidence:\s*\d+%/.test(surface.text),
    surface.text);

  assertCase(results, 'w447-start-new-run-clears-request',
    drawer.includes("const keepRequest = button.getAttribute('data-idb-w444-clear-run') === 'keep';") &&
      drawer.includes("Object.assign(state, fresh, { open: preserved.open, activeView: 'plan', setupEditMode: true });"),
    'Start new run should not preserve the old request/toggles.');

  assertCase(results, 'w447-value-page-clutter-retired',
    !drawer.includes('<summary>Request, value, and evidence support</summary>') &&
      !drawer.includes('<summary>Expanded value answer</summary>') &&
      !drawer.includes('<summary>Details: value evidence, proof stack, and claim guard</summary>') &&
      !drawer.includes('<summary>Evidence behind the value hypothesis</summary>'),
    'Behind-the-scenes value walls should be retired from visible drawer UI.');

  assertCase(results, 'w447-goodles-product-specific-bom-language',
    runner.includes('Goodles Line-Ready Mac & Cheese') &&
      runner.includes('Goodles Pasta Input') &&
      runner.includes('Cheese Sauce Seasoning Blend') &&
      runner.includes('Retail Carton and Case Packaging') &&
      runner.includes('Stage Pasta and Cheese Blend'),
    'Runner should use Goodles/mac-cheese-specific component and routing language.');

  assertCase(results, 'w447-routing-discovery-telemetry',
    runner.includes('inspectAssemblyRoutingSublistsW448') &&
      runner.includes('idb.w448-assembly-routing-discovery.v1') &&
      runner.includes('staleRouteSignals') &&
      runner.includes('visibleStaleRoutingSuspected') &&
      runner.includes('assemblyRoutingDiscoveryW448'),
    'Routing failure export should include assembly routing sublist snapshots and stale-route signals.');

  assertCase(results, 'w448-troubleshoot-summary-schema',
    drawer.includes("schema: 'idb.w448-troubleshoot-export.v1'") &&
      drawer.includes('truthSummaryW448') &&
      drawer.includes('rawAppendix') &&
      drawer.includes('forge-w448-troubleshoot'),
    'Troubleshoot export should promote a compact truth summary and keep raw detail in an appendix.');

  assertCase(results, 'w447-package-script',
    pkg.scripts && pkg.scripts['harness:goodles-wip-routing-ux-w447'] === 'node archive/tools/run_w447_goodles_wip_routing_ux_harness.js',
    'package.json should expose the W448 harness.');

  printResults('W448 Goodles WIP routing and UX harness', results);
}

main();
