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
const reportPath = path.join(root, 'archive', 'reports', 'w418_executable_consultant_flow.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
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

function contextFor(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext || {
    title: 'NetSuite Home',
    url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
    pageType: 'NetSuite page',
    contextId: 'generic_netsuite_page',
    confidence: 'low'
  };
  const recommendation = hooks.recommendMove(lane, page);
  return { lane, page, recommendation };
}

function baseHerrState(hooks, overrides = {}) {
  const state = Object.assign(hooks.defaultState(), {
    selectedLaneId: 'food_beverage',
    laneSelectionSource: 'website_evidence',
    selectedActionId: 'prove',
    selectedMoveIndex: 0,
    intake: {
      customer: 'Herr Foods Reduced',
      website: 'https://www.herrs.com',
      notes: 'They make chips, pretzels, popcorn, snack packs, and seasonal flavors. Operations needs one trusted view before the customer promise is made. Prove finished-good readiness, packaging availability, and promo replenishment confidence.',
      websiteEvidence: '',
      scObjective: '',
      competitor: '',
      decisionCriteria: '',
      timelineUrgency: ''
    },
    customerName: 'Herr Foods Reduced',
    websiteUrl: 'https://www.herrs.com',
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    }
  }, overrides);
  contextFor(hooks, state);
  return state;
}

function completedHerrState(hooks) {
  const state = baseHerrState(hooks, {
    briefPrepared: true,
    confirmedLaneId: 'food_beverage',
    laneSelectionSource: 'consultant_confirmed',
    acceptedPacket: {
      selectedLaneId: 'food_beverage',
      selectedLane: 'Food / Beverage CPG Manufacturing',
      proofAnchor: 'Finished Good',
      productSeed: 'Finished Good Variety Pack',
      productFamily: 'Packaged Food and Beverage',
      demandMoment: 'finished-good readiness'
    },
    dccFinalNamingResult: {
      status: 'completed',
      runStatus: 'completed',
      prospect: 'Herr Foods Reduced',
      scenario: 'Finished Good',
      familyKey: 'food_beverage',
      runnerLaneVocabularyPolicy: {
        finalResultRoleLabels: {
          heroItem: 'Finished Good Item',
          matrixProofItem: 'Availability/Replenishment Flow',
          componentItem: 'Supporting SKU'
        }
      },
      records: {
        customer: {
          role: 'customer',
          type: 'customer',
          name: 'Herr Foods Reduced Customer Account',
          id: '3922',
          url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=3922'
        },
        salesOrder: {
          role: 'sales_order',
          type: 'salesorder',
          name: 'SO2712',
          id: '2712',
          url: 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=2712'
        },
        heroItem: {
          role: 'finished_food_or_batch_item',
          type: 'inventoryitem',
          name: 'Herr Foods Reduced Finished Good',
          id: '6154',
          url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6154'
        },
        matrixProofItem: {
          role: 'formula_or_batch_structure',
          type: 'inventoryitem',
          name: 'Herr Foods Reduced Branch Availability / Replenishment Flow',
          id: '6155',
          url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6155'
        },
        componentItems: [
          {
            role: 'ingredient_or_component_item',
            type: 'inventoryitem',
            name: 'Herr Foods Reduced Substitute Fulfillment Support SKU',
            id: '6156',
            url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6156'
          }
        ]
      }
    }
  });
  contextFor(hooks, state);
  return state;
}

function renderScenario(hooks, state) {
  const { lane, page, recommendation } = contextFor(hooks, state);
  return {
    html: hooks.renderDrawer(state),
    stage: hooks.consultantDayInLifeStageW416(state, lane, page, recommendation),
    lane,
    page,
    recommendation
  };
}

function acceptCurrentPath(hooks, state) {
  const { lane, page, recommendation } = contextFor(hooks, state);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  state.laneSelectionSource = 'consultant_confirmed';
  contextFor(hooks, state);
  return state;
}

function primaryBeforeSupport(html) {
  const supportIndex = html.indexOf('<summary>Support views</summary>');
  return supportIndex >= 0 ? html.slice(0, supportIndex) : html;
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);
  const runner = read(runnerPath);
  const fileCabinetRunner = read(fileCabinetRunnerPath);
  const pkg = JSON.parse(read(path.join(root, 'package.json')));

  const emptyRequest = renderScenario(hooks, Object.assign(hooks.defaultState(), { setupEditMode: true }));
  const readyRequest = renderScenario(hooks, baseHerrState(hooks, { briefPrepared: false, setupEditMode: true }));
  const unconfirmed = renderScenario(hooks, baseHerrState(hooks, { briefPrepared: true, setupEditMode: false }));
  const confirmedNoRecords = renderScenario(hooks, acceptCurrentPath(hooks, baseHerrState(hooks, {
    briefPrepared: true,
    setupEditMode: false
  })));
  const completed = renderScenario(hooks, acceptCurrentPath(hooks, completedHerrState(hooks)));
  const completedText = stripTags(completed.html);

  assertCase(results, 'w418-version-and-install-marker-advanced',
    drawer.includes('// @version      1.0.27') &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.27';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W418';"),
    'Tampermonkey and drawer display markers must advance so install/update checks are unambiguous.');

  assertCase(results, 'w418-root-filecabinet-drawer-synced',
    drawer === fileCabinetDrawer,
    'Root userscript and FileCabinet userscript must match before any upload decision.');

  assertCase(results, 'w418-runner-copies-still-synced',
    runner === fileCabinetRunner,
    'Runner copies should remain synced; W418 does not add runner behavior.');

  assertCase(results, 'w418-first-screen-is-forge-request-not-tab-sprawl',
    primaryBeforeSupport(readyRequest.html).includes('FORGE request') &&
      primaryBeforeSupport(readyRequest.html).includes('Customer / Prospect Name') &&
      primaryBeforeSupport(readyRequest.html).includes('Conversation Notes') &&
      !primaryBeforeSupport(readyRequest.html).includes('aria-label="Drawer workflow state"'),
    stripTags(primaryBeforeSupport(readyRequest.html)).slice(0, 1600));

  assertCase(results, 'w418-first-screen-includes-build-toggles',
    readyRequest.html.includes('Run options') &&
      readyRequest.html.includes('data-idb-toggle="createNewHeroItem"') &&
      readyRequest.html.includes('data-idb-toggle="enableManufacturing"') &&
      readyRequest.html.includes('data-idb-toggle="enableWip"') &&
      ['Create new item', 'Manufacturing', 'WIP'].every((label) => readyRequest.html.includes(label)),
    stripTags(readyRequest.html).slice(0, 2200));

  assertCase(results, 'w418-primary-action-is-run-forge-setup',
    readyRequest.stage.stage === 'enter_request' &&
      readyRequest.stage.label.next === 'Run FORGE setup' &&
      readyRequest.html.includes('Run FORGE setup') &&
      !primaryBeforeSupport(readyRequest.html).includes('Build demo plan'),
    `${readyRequest.stage.stage}: ${JSON.stringify(readyRequest.stage.label)}`);

  assertCase(results, 'w418-confirm-path-language-is-forge-path',
    unconfirmed.stage.stage === 'confirm_path' &&
      unconfirmed.stage.label.title === 'Confirm the FORGE path' &&
      unconfirmed.html.includes('Confirm FORGE path') &&
      !primaryBeforeSupport(unconfirmed.html).includes('Confirm demo path'),
    stripTags(primaryBeforeSupport(unconfirmed.html)).slice(0, 1800));

  assertCase(results, 'w418-build-stage-is-run-forge-build',
    confirmedNoRecords.stage.stage === 'build_records' &&
      confirmedNoRecords.stage.label.title === 'Run the FORGE build' &&
      confirmedNoRecords.html.includes('Build and proof readiness') &&
      detailsClosed(confirmedNoRecords.html, 'Request, value, and evidence support'),
    stripTags(primaryBeforeSupport(confirmedNoRecords.html)).slice(0, 2200));

  assertCase(results, 'w418-completed-state-is-one-cockpit-first',
    completed.stage.stage === 'demo_cockpit' &&
      completed.html.indexOf('idb-w415-demo-cockpit') >= 0 &&
      completed.html.indexOf('idb-w415-demo-cockpit') < completed.html.indexOf('<summary>Support / troubleshoot</summary>') &&
      completedText.includes('Story with embedded records') &&
      completedText.includes('Top ROI point') &&
      completedText.includes('Competitive battlecard'),
    completedText.slice(0, 2600));

  assertCase(results, 'w418-support-and-troubleshoot-are-collapsed',
    detailsClosed(completed.html, 'Support / troubleshoot') &&
      detailsClosed(completed.html, 'Support views') &&
      detailsClosed(confirmedNoRecords.html, 'Request, value, and evidence support'),
    'Support surfaces should be preserved for audit/debug, but closed by default.');

  assertCase(results, 'w418-open-link-authority-preserved',
    completed.html.includes('Open') &&
      completed.html.includes('verified') &&
      !/href=""/.test(completed.html) &&
      !/fake open|placeholder open|preview-url/i.test(completed.html),
    completedText.slice(0, 2200));

  assertCase(results, 'w418-advisory-and-write-boundaries-preserved',
    drawer.includes('function buildRecordNamingAdvisoryRequest') &&
      drawer.includes("writeAuthority: 'none'") &&
      drawer.includes('creationAllowed: false') &&
      drawer.includes('N/LLM') &&
      drawer.includes('Advisory'),
    'N/LLM naming remains advisory-only and cannot create records.');

  assertCase(results, 'w418-package-script-registered',
    pkg.scripts &&
      pkg.scripts['harness:executable-consultant-flow-w418'] === 'node archive/tools/run_w418_executable_consultant_flow_harness.js',
    JSON.stringify(pkg.scripts && pkg.scripts['harness:executable-consultant-flow-w418']));

  const passed = results.filter((result) => result.pass).length;
  const total = results.length;
  const report = `# W418 Executable Consultant Flow

## Summary
W418 tightens FORGE around the consultant day-in-life path: enter customer, website, notes, and selected run options; run FORGE setup; confirm the prepared path; build records; then use one Demo Cockpit when verified records return.

This is a local/source change only. No live smoke, upload, deployment, runtime package, source-pack mutation, adapter change, runner behavior change, or record-creation behavior change was performed in W418.

## What Changed
- Advanced the drawer install marker to \`1.0.27 / W418\`.
- Moved New Item, Manufacturing, and WIP run options onto the initial FORGE request surface.
- Reworded the prep path from “Build demo plan” toward “Run FORGE setup,” “Confirm FORGE path,” and “Run the FORGE build.”
- Kept support views collapsed and preserved for troubleshooting instead of primary consultant navigation.
- Preserved the W415 post-run Demo Cockpit as the first completed-result surface.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Install Reality
Tampermonkey will not show this update until the published/installed userscript source receives \`@version 1.0.27\`. The local repo now has that marker, but W418 did not upload or deploy it.

## Recommendation
Lock W418 as the local executable consultant-flow patch. Next work should either prepare the deliberate userscript/NetSuite deployment path, or run one controlled post-install validation after the updated drawer and synchronized runner are actually installed.
`;
  fs.writeFileSync(reportPath, report);
  printResults('W418 executable consultant flow harness', results);
}

main();
