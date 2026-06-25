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

function buildChompsSurface(hooks) {
  const state = motionState(hooks, {
    selectedLaneId: 'products_cpg',
    intake: {
      customer: 'Chomps Jerky Line Readiness',
      website: 'https://chomps.com',
      notes: 'Run a WIP manufacturing demo for Chomps focused on jerky snack production readiness. They need to prove customer demand can be tied to raw meat supply, seasoning availability, batch production, routing steps, quality checks, finished case output, and customer promise dates. Competitive pressure is spreadsheets and disconnected MRP.'
    },
    toggles: { products_cpg: { createNewHeroItem: true, enableManufacturing: true, enableWip: true } },
    briefPrepared: true,
    acceptedPacket: { packetId: 'accepted', selectedLaneId: 'products_cpg', signature: 'x' },
    w444CockpitDetail: 'competitive'
  });
  const finalContext = motionContext(hooks, state);
  const rows = [
    record('customer', 'customer', 'Chomps Jerky Line Readiness Customer Account', 4822, 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=4822'),
    record('sales_order', 'salesorder', 'Chomps Jerky Line Readiness Demo Sales Order', 9901, 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=9901'),
    record('hero_item', 'inventoryitem', 'Chomps Jerky Snack Sticks 12-Count Case Pack', 7845, 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7845'),
    record('assembly', 'assemblyitem', 'Chomps Jerky Snack Sticks Production Batch', 1869, 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=1869'),
    record('bom', 'bom', 'BOM - Chomps Jerky Snack Sticks', 50, 'https://td3021666.app.netsuite.com/app/accounting/manufacturing/bom.nl?id=50'),
    record('bom_revision', 'bomrevision', 'Revision 1 - Chomps Jerky Snack Sticks', 67, 'https://td3021666.app.netsuite.com/app/accounting/manufacturing/bomrevision.nl?id=67'),
    record('routingDiagnostic', 'manufacturingrouting_diagnostic', 'Routing Diagnostic - Routing - Chomps Jerky Snack Sticks', '', '')
  ].map((item) => Object.assign({}, item, { linkAuthority: hooks.verifiedRecordLinkAuthorityV1(item) }));
  rows[6].expectedRoutingName = 'Routing - Chomps Jerky Snack Sticks';
  rows[6].reason = 'set_billofmaterials';

  const finalNavigation = {
    status: 'using_dcc_final_names',
    displayStatus: 'Final generated names imported',
    runCanUseImportedFinalNames: false,
    proofReviewAvailable: true,
    proofQualityGate: { runReady: false, blockers: ['Routing failed at set_billofmaterials'] },
    reviewObjects: rows,
    scriptPivotObjects: rows,
    linkAuthoritySummary: { verified_openable: 6, missing_url: 1 },
    linkAuthoritySummaryExcludingPlannedW446: { verified_openable: 6, missing_url: 1 },
    productBuildPlanW432: {
      primaryProductCandidate: 'Chomps Jerky Snack Sticks',
      operationNames: ['Stage Protein and Marinade', 'Season and Tumble Jerky', 'Cook and Dehydrate', 'Quality Check Moisture and Weight', 'Wrap, Case Pack, and QC']
    }
  };

  const html = hooks.renderW415DemoCockpit({
    state,
    lane: finalContext.lane,
    value: {
      grounded: { unsupportedClaimBlocker: { blockedClaims: ['Measured savings require a customer baseline before they can be claimed.'] } },
      roiAudit: { baselineNeeded: 'order misses, protein shortage delay, seasoning readiness delay, or manual schedule reconciliation' }
    },
    script: { say: 'Prove jerky line readiness.', show: 'Open the Sales Order and WIP proof path.' },
    finalNavigation,
    storyContractW373: { proofLabel: 'WIP line-flow readiness' },
    websiteEvidence: { text: 'jerky meat snacks protein seasoning case pack' },
    competitiveAdvisory: { alternatives: ['spreadsheets', 'disconnected MRP'], publicEvidenceStrong: false }
  });

  return { html, text: stripHtml(html), finalNavigation };
}

function main() {
  const results = [];
  const drawer = read(drawerPath);
  const runner = read(runnerPath);
  const pkg = JSON.parse(read(packagePath));
  const hooks = loadHooks();
  const surface = buildChompsSurface(hooks);

  assertCase(results, 'w448-marker-updated',
    /@version\s+1\.0\.56/.test(drawer) &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.56';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W448';"),
    'Drawer should identify W448 / 1.0.56.');

  assertCase(results, 'w448-roi-competitive-clean-percent',
    /Decrease customer-promise risk/.test(surface.text) &&
      /Confidence:\s*\d+%/.test(surface.text) &&
      /Beat spreadsheets with fresher proof/.test(surface.text) &&
      !/Why this competitive angle was chosen/.test(surface.text) &&
      !/Presented because the run context points/.test(surface.text),
    surface.text);

  assertCase(results, 'w448-chomps-specific-naming',
    runner.includes('Chomps Jerky Snack Sticks') &&
      runner.includes('Beef and Turkey Protein Input') &&
      runner.includes('Smokehouse Seasoning Marinade') &&
      runner.includes('Stick Wrapper and Retail Case Packaging') &&
      runner.includes('Season and Tumble Jerky') &&
      drawer.includes('Chomps Beef and Turkey Protein Input') &&
      !runner.includes('`${brandName} Primary Material Input`') &&
      !drawer.includes('Primary Material Input'),
    'Chomps should not fall back to Primary Material Input.');

  assertCase(results, 'w448-routing-repair-default-contract',
    runner.includes('setRoutingBomBestEffortW448') &&
      runner.includes('repaired-stale-routing-in-place') &&
      runner.includes('attachRoutingToAssemblySafe({ assemblyId, routingId, forceDefault: true })') &&
      runner.includes('already-linked-defaulted') &&
      runner.includes('attached-defaulted'),
    'WIP routing should create/repair and default the assembly routing.');

  assertCase(results, 'w448-bom-failure-does-not-stop-routing-repair',
    runner.includes('Routing BOM set failed but WIP repair continues') &&
      runner.includes("schema: 'idb.w448-routing-bom-link-attempt.v1'") &&
      !runner.includes("const staleRoutingRepairTargetId = null;"),
    'BOM set failures should be telemetry, not the only outcome.');

  assertCase(results, 'w448-troubleshoot-versioned',
    drawer.includes("schema: 'idb.w448-troubleshoot-export.v1'") &&
      drawer.includes('forge-w448-troubleshoot') &&
      drawer.includes('idb.w448-troubleshoot-truth-summary.v1'),
    'Troubleshoot export should be W448-versioned.');

  assertCase(results, 'w448-package-script',
    pkg.scripts && pkg.scripts['harness:chomps-wip-routing-roi-w448'] === 'node archive/tools/run_w448_chomps_wip_routing_roi_harness.js',
    'package.json should expose the W448 harness.');

  printResults('W448 Chomps WIP routing and ROI harness', results);
}

main();
