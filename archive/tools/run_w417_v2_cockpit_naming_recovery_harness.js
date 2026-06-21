#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  loadHooks,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const drawerPath = path.join(root, 'idb-drawer.user.js');
const fileCabinetDrawerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
const runnerPath = path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const fileCabinetRunnerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const tracePath = '/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1781970431176.json';
const mockupPath = path.join(root, 'archive', 'reports', 'assets', 'w417_forge_v2_demo_cockpit.svg');
const reportPath = path.join(root, 'archive', 'reports', 'w417_v2_cockpit_naming_recovery.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(read(filePath));
}

function stripTags(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function detailsClosed(html, summaryText) {
  const source = String(html || '');
  const summaryIndex = source.indexOf(`<summary>${summaryText}</summary>`);
  if (summaryIndex < 0) return false;
  const detailsStart = source.lastIndexOf('<details', summaryIndex);
  const openTagEnd = source.indexOf('>', detailsStart);
  return detailsStart >= 0 && openTagEnd > detailsStart && !/\sopen(\s|>)/.test(source.slice(detailsStart, openTagEnd + 1));
}

function completedRunState(hooks) {
  const state = hooks.defaultState();
  state.intake = {
    customer: 'Herr Foods',
    website: 'https://www.herrs.com',
    notes: 'They make chips, pretzels, popcorn, snack packs, and seasonal flavors. Sales promises promo orders before operations knows finished goods, packaging, or replenishment inventory is ready.',
    websiteEvidence: '',
    scObjective: '',
    competitor: '',
    decisionCriteria: '',
    timelineUrgency: ''
  };
  state.briefPrepared = true;
  state.selectedLaneId = 'food_beverage';
  state.acceptedPacket = {
    selectedLaneId: 'food_beverage',
    selectedLane: 'Food / Beverage CPG Manufacturing',
    proofAnchor: 'Finished Good',
    productSeed: 'Finished Good Variety Pack',
    productFamily: 'Packaged Food and Beverage',
    demandMoment: 'finished-good readiness'
  };
  state.confirmedLaneId = 'food_beverage';
  state.dccFinalNamingResult = {
    status: 'completed',
    runStatus: 'completed',
    prospect: 'Herr Foods',
    scenario: 'Finished Good',
    familyKey: 'food_beverage',
    runnerLaneVocabularyPolicy: {
      finalResultRoleLabels: {
        heroItem: 'Finished Good Item',
        matrixProofItem: 'Promotion / Replenishment Readiness',
        componentItem: 'Packaging / Supply Support'
      }
    },
    records: {
      customer: { role: 'customer', type: 'customer', name: 'Herr Foods Customer Account', id: '3922', url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=3922' },
      salesOrder: { role: 'sales_order', type: 'salesorder', name: 'SO2712', id: '2712', url: 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=2712' },
      heroItem: { role: 'finished_food_or_batch_item', type: 'inventoryitem', name: 'Herr Foods Finished Good Variety Pack', id: '6154', url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6154' },
      matrixProofItem: { role: 'formula_or_batch_structure', type: 'inventoryitem', name: 'Herr Foods Promo Replenishment Readiness', id: '6155', url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6155' },
      componentItems: [
        { role: 'ingredient_or_component_item', type: 'inventoryitem', name: 'Herr Foods Packaging / Inbound Supply', id: '6156', url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6156' }
      ]
    }
  };
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  return state;
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);
  const runner = read(runnerPath);
  const fileCabinetRunner = read(fileCabinetRunnerPath);
  const pkg = JSON.parse(read(path.join(root, 'package.json')));
  const trace = fs.existsSync(tracePath) ? readJson(tracePath) : {};
  const mockup = read(mockupPath);

  const state = completedRunState(hooks);
  const lane = hooks.getLane(state);
  const page = {
    title: 'NetSuite Home',
    url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
    pageType: 'NetSuite page',
    contextId: 'generic_netsuite_page',
    confidence: 'low'
  };
  const recommendation = hooks.recommendMove(lane, page);
  const action = { id: 'prove', label: 'Prove' };
  const selectedMove = lane.moves[state.selectedMoveIndex] || lane.moves[0];
  const runHtml = hooks.renderRunView(state, lane, page, recommendation, selectedMove, action, '');
  const runText = stripTags(runHtml);
  const supportIndex = runHtml.indexOf('<summary>Support / troubleshoot</summary>');
  const supportPathIndex = runHtml.indexOf('Supporting NetSuite path');
  const cockpitIndex = runHtml.indexOf('idb-w415-demo-cockpit');

  assertCase(results, 'w417-version-marker-advanced',
    drawer.includes('// @version      1.0.26') &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.26';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W417';"),
    'Drawer should show W417 / 1.0.26 for install/update clarity.');

  assertCase(results, 'w417-v2-mockup-exists',
    mockup.includes('V2: One Request. One Cockpit.') &&
      mockup.includes('LLM advises') &&
      mockup.includes('Support / troubleshoot collapsed'),
    mockup.slice(0, 500));

  assertCase(results, 'w417-root-filecabinet-drawer-synced',
    drawer === fileCabinetDrawer,
    'Root and FileCabinet drawer userscript copies should match.');

  assertCase(results, 'w417-runner-copies-synced',
    runner === fileCabinetRunner,
    'Deployable netsuite/runner copy should match FileCabinet runner copy.');

  assertCase(results, 'w417-runner-food-naming-mode-first',
    runner.includes("if (laneId === 'food_beverage' || laneId === 'products_cpg') modeKey = enableManufacturing ? 'food_ingredient_manufacturing' : 'food_replenishment';") &&
      runner.includes('function idbProspectSpecificProofNamesForModeW414') &&
      runner.includes("if (modeKey === 'food_replenishment')") &&
      runner.includes('function idbProofNameProductSeedW417') &&
      runner.includes('demoPath.productSeed') &&
      runner.includes('Promotion Availability / Replenishment') &&
      !runner.includes("const prospectSpecificProofNames = modeKey === 'distribution_replenishment'"),
    'Runner should not limit prospect-specific proof names to distribution only and should use website/advisory product seed for food proof names.');

  assertCase(results, 'w417-cockpit-is-first-primary-run-surface',
    cockpitIndex >= 0 && supportIndex > cockpitIndex && supportPathIndex > supportIndex,
    `cockpit=${cockpitIndex} support=${supportIndex} path=${supportPathIndex}`);

  assertCase(results, 'w417-support-troubleshoot-collapsed',
    detailsClosed(runHtml, 'Support / troubleshoot') &&
      !runHtml.includes('<summary>Full Say / Show / Close script</summary>'),
    runHtml.slice(runHtml.indexOf('idb-w415-demo-cockpit'), runHtml.indexOf('idb-w417-support-troubleshoot') + 400));

  assertCase(results, 'w417-first-read-keeps-only-cockpit-essentials',
    runText.includes('Demo Cockpit') &&
      runText.includes('Herr Foods') &&
      runText.includes('Top ROI point') &&
      runText.includes('Competitive battlecard') &&
      runText.includes('Claim caution'),
    runText.slice(0, 2000));

  assertCase(results, 'w417-trace-preserves-nllm-advisory-boundary',
    trace.recordNamingAdvisoryRequest &&
      trace.recordNamingAdvisoryRequest.creationAllowed === false &&
      trace.recordNamingAdvisoryRequest.writeAuthority === 'none' &&
      trace.namingAdvisorySummary &&
      trace.namingAdvisorySummary.productSeed === 'Finished Good Variety Pack',
    JSON.stringify(trace.namingAdvisorySummary || {}).slice(0, 1000));

  assertCase(results, 'w417-trace-shows-advisory-names-better-than-generic-runner-result',
    JSON.stringify(trace.namingAdvisorySummary || {}).includes('Herr Foods W415 Finished Good Variety Pack') &&
      JSON.stringify(trace).includes('Product Availability SKU'),
    'Trace should prove the planning/advisory layer had sharper names while the returned runner result still exposed generic fallback risk.');

  assertCase(results, 'w417-package-script-registered',
    pkg.scripts && pkg.scripts['harness:v2-cockpit-naming-recovery-w417'] === 'node archive/tools/run_w417_v2_cockpit_naming_recovery_harness.js',
    JSON.stringify(pkg.scripts && pkg.scripts['harness:v2-cockpit-naming-recovery-w417']));

  const passed = results.filter((result) => result.pass).length;
  const total = results.length;
  const report = `# W417 V2 Cockpit and Naming Recovery

## Summary
W417 collapses the post-run experience back to a single consultant cockpit and restores deployable runner naming parity so N/LLM advisory naming can stay aligned with source-pack/story proof names.

## Findings
- The Herr Foods trace preserves the correct advisory boundary: N/LLM is advisory-only, website evidence provides the product seed, and notes shape story/ROI/competitive content.
- The completed screenshot showed generic returned record names because the deployable runner copy had drifted from the FileCabinet runner naming policy.
- The Run surface still showed a full support console under the cockpit; W417 collapses that into one Support / troubleshoot disclosure.

## V2 Visual
- \`archive/reports/assets/w417_forge_v2_demo_cockpit.svg\`

## Harness
W417 V2 cockpit and naming recovery harness: ${passed}/${total} passed.

| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Recommendation
Lock W417 if the cockpit image matches the intended direction. Next implementation should harden the actual installed/update path so Tampermonkey can receive the 1.0.26 / W417 userscript and the synchronized runner package can be deployed deliberately.
`;
  fs.writeFileSync(reportPath, report);
  printResults('W417 V2 cockpit and naming recovery harness', results);
}

main();
