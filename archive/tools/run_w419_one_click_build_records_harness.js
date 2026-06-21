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
const reportPath = path.join(root, 'archive', 'reports', 'w419_one_click_build_records.md');

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

function primaryBeforeSupport(html) {
  const supportIndex = html.indexOf('<summary>Support views</summary>');
  return supportIndex >= 0 ? html.slice(0, supportIndex) : html;
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

function requestState(hooks, overrides = {}) {
  const state = Object.assign(hooks.defaultState(), {
    selectedLaneId: 'food_beverage',
    laneSelectionSource: 'website_evidence',
    setupEditMode: true,
    briefPrepared: false,
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

function renderScenario(hooks, state) {
  const { lane, page, recommendation } = contextFor(hooks, state);
  return {
    html: hooks.renderDrawer(state),
    stage: hooks.consultantDayInLifeStageW416(state, lane, page, recommendation),
    flow: hooks.oneActionIntakeFlowModel(state, lane, page, recommendation)
  };
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);
  const pkg = JSON.parse(read(path.join(root, 'package.json')));

  const ready = renderScenario(hooks, requestState(hooks));
  const readyPrimary = primaryBeforeSupport(ready.html);
  const preparedNeedsConfirmation = renderScenario(hooks, requestState(hooks, {
    setupEditMode: false,
    briefPrepared: true
  }));
  const preparedPrimary = primaryBeforeSupport(preparedNeedsConfirmation.html);

  assertCase(results, 'w419-version-marker-advanced',
    drawer.includes('// @version      1.0.28') &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.28';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W419';"),
    'Drawer should show W419 / 1.0.28 for install/update clarity.');

  assertCase(results, 'w419-filecabinet-drawer-synced',
    drawer === fileCabinetDrawer,
    'Root and FileCabinet userscript copies should match.');

  assertCase(results, 'w419-first-screen-primary-is-build-records',
    ready.stage.stage === 'enter_request' &&
      ready.stage.label.next === 'Build records' &&
      ready.flow.primaryLabel === 'Build records' &&
      readyPrimary.includes('data-idb-one-click-build-records=') &&
      stripTags(readyPrimary).includes('Build records'),
    stripTags(readyPrimary).slice(0, 1800));

  assertCase(results, 'w419-first-screen-keeps-entry-and-toggles',
    ['Customer / Prospect Name', 'Website', 'Conversation Notes', 'Run options', 'Create new item', 'Manufacturing', 'WIP']
      .every((label) => stripTags(readyPrimary).includes(label)) &&
      readyPrimary.includes('data-idb-toggle="createNewHeroItem"') &&
      readyPrimary.includes('data-idb-toggle="enableManufacturing"') &&
      readyPrimary.includes('data-idb-toggle="enableWip"'),
    stripTags(readyPrimary).slice(0, 2200));

  assertCase(results, 'w419-old-setup-confirm-actions-not-primary-path',
    !readyPrimary.includes('data-idb-build-demo-plan') &&
      !stripTags(readyPrimary).includes('Run FORGE setup') &&
      !stripTags(preparedPrimary).includes('Confirm FORGE path') &&
      preparedPrimary.includes('data-idb-one-click-build-records=') &&
      stripTags(preparedPrimary).includes('Build records'),
    stripTags(preparedPrimary).slice(0, 2200));

  assertCase(results, 'w419-one-click-handler-prepares-confirms-and-submits',
    drawer.includes('const prepareOneClickBuildRecordsPath') &&
      drawer.includes('const submitBuildRecordsOnce') &&
      drawer.includes("source: 'one_click_build_records_w419'") &&
      drawer.includes("state.acceptedPacket = buildAcceptedPacketContext") &&
      drawer.includes('await submitBuildRecordsOnce(button, Object.assign({}, prepared'),
    'One-click handler should freeze accepted packet and call existing approved adapter submit path.');

  assertCase(results, 'w419-existing-approved-adapter-path-preserved',
    drawer.includes("data-idb-real-adapter-action=\"submit_w144_once\"") &&
      drawer.includes("await submitBuildRecordsOnce(button, { source: 'explicit_build_records_button' });") &&
      drawer.includes('invokeW144ApprovedServerAdapterFromDrawerV1(preflight.adapterRequestEnvelope)'),
    'Existing Build records action should reuse the same submit helper.');

  assertCase(results, 'w419-support-stays-collapsed',
    detailsClosed(ready.html, 'Support views') &&
      detailsClosed(preparedNeedsConfirmation.html, 'Behind the scenes: request and evidence'),
    'Support surfaces should remain collapsed.');

  assertCase(results, 'w419-authority-boundaries-preserved',
    drawer.includes('validateDccFinalNamingImportPayload') &&
      drawer.includes('completedResultImportEligibilityFromDrawerGuardsW289') &&
      drawer.includes("writeAuthority: 'none'") &&
      drawer.includes('creationAllowed: false') &&
      drawer.includes('noActiveOpenLinksWithoutRealUrls: true'),
    'One-click Build records must not weaken import validation, N/LLM advisory, or Open-link authority.');

  assertCase(results, 'w419-package-script-registered',
    pkg.scripts &&
      pkg.scripts['harness:one-click-build-records-w419'] === 'node archive/tools/run_w419_one_click_build_records_harness.js',
    JSON.stringify(pkg.scripts && pkg.scripts['harness:one-click-build-records-w419']));

  const passed = results.filter((result) => result.pass).length;
  const total = results.length;
  const report = `# W419 One-Click Build Records

## Summary
W419 collapses the pre-build consultant flow to one primary action after entry: \`Build records\`.

The consultant enters customer, website, conversation notes, and toggles on the first surface. The \`Build records\` click prepares the path, freezes the accepted packet when evidence is usable, and submits through the existing approved adapter path.

## What Changed
- Advanced the drawer marker to \`1.0.28 / W419\`.
- Replaced the first-screen \`Run FORGE setup\` action with \`Build records\`.
- Replaced the visible prepared-but-unconfirmed \`Confirm FORGE path\` action with \`Build records\`.
- Added a one-click handler that prepares/confirms the build path and reuses the existing approved \`submit_w144_once\` adapter route.
- Kept support views collapsed and preserved.

## Boundaries
- No runner behavior changed.
- No source-pack behavior changed.
- No adapter contract changed.
- No completed-result import validation was weakened.
- No fake Open links were introduced.
- N/LLM remains advisory-only.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Recommendation
Lock W419 as the local one-click Build records patch. Next step is deployment/install readiness so Tampermonkey and NetSuite actually receive \`1.0.28 / W419\` before the next live validation.
`;
  fs.writeFileSync(reportPath, report);
  printResults('W419 one-click Build records harness', results);
}

main();
