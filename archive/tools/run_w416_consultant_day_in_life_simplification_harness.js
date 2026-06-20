#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  loadHooks,
  motionState,
  motionContext,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const drawerPath = path.join(root, 'idb-drawer.user.js');
const fileCabinetDrawerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w416_consultant_day_in_life_simplification.md');
const herrTracePath = '/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1781970431176.json';
const rideNowTracePath = '/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780515279117.json';

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

function renderDrawerScenario(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const html = hooks.renderDrawer(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext || {
    title: 'NetSuite Home',
    url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
    pageType: 'NetSuite page',
    contextId: 'generic_netsuite_page',
    confidence: 'low'
  };
  const recommendation = hooks.recommendMove(lane, page);
  return {
    html,
    text: stripTags(html),
    stage: hooks.consultantDayInLifeStageW416(state, lane, page, recommendation)
  };
}

function completedTraceState(hooks, tracePath) {
  const trace = readJson(tracePath);
  const state = Object.assign(hooks.defaultState(), trace.state || {});
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  return state;
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);
  const report = fs.existsSync(reportPath) ? read(reportPath) : '';
  const pkg = JSON.parse(read(path.join(root, 'package.json')));

  const emptyState = hooks.defaultState();
  const empty = renderDrawerScenario(hooks, emptyState);

  const preparedState = hooks.defaultState();
  preparedState.intake = {
    customer: 'Herr Foods',
    website: 'https://www.herrs.com',
    notes: 'They sell chips and snacks. Need inventory and shipment confidence before promising orders.',
    websiteEvidence: '',
    scObjective: '',
    competitor: '',
    decisionCriteria: '',
    timelineUrgency: ''
  };
  preparedState.briefPrepared = true;
  preparedState.selectedLaneId = 'food_beverage';
  hooks.ensureWebsiteEvidenceRuntime(preparedState);
  hooks.reconcileStateAuthority(preparedState);
  const prepared = renderDrawerScenario(hooks, preparedState);

  const confirmedState = motionState(hooks, {
    selectedLaneId: 'food_beverage',
    intake: {
      customer: 'Herr Foods',
      website: 'https://www.herrs.com',
      notes: 'They sell chips and snacks. Need inventory and shipment confidence before promising retailer orders.'
    }
  });
  const confirmed = renderDrawerScenario(hooks, confirmedState);

  const herrTrace = completedTraceState(hooks, herrTracePath);
  const herr = renderDrawerScenario(hooks, herrTrace);

  const rideNow = renderDrawerScenario(hooks, completedTraceState(hooks, rideNowTracePath));

  assertCase(results, 'w416-stage-model-exported',
    typeof hooks.consultantDayInLifeStageW416 === 'function' &&
      typeof hooks.renderW416ConsultantDayInLife === 'function' &&
      drawer.includes('forge.w416.consultant-day-in-life-stage.v1'),
    'W416 stage model should be exported and identifiable');

  assertCase(results, 'w416-filecabinet-mirror-synced',
    drawer === fileCabinetDrawer &&
      fileCabinetDrawer.includes('idb-w416-day-in-life') &&
      fileCabinetDrawer.includes('Support views'),
    'root and FileCabinet drawer copies should match');

  assertCase(results, 'w416-default-state-only-shows-request-entry',
    empty.stage.stage === 'enter_request' &&
      empty.text.includes('Enter the sales request') &&
      empty.text.includes('Build request') &&
      empty.text.includes('Build demo plan') &&
      !empty.text.includes('Consultant value coach') &&
      !empty.text.includes('Build Demo Records') &&
      !empty.text.includes('CPG Products Manufacturing') &&
      !/Open\s+Prove\s+Handle objection\s+Close value/.test(empty.text),
    empty.text.slice(0, 3000));

  assertCase(results, 'w416-premature-tabs-collapsed-into-support',
    !empty.html.includes('aria-label="Drawer workflow state"') &&
      empty.html.includes('idb-w416-support-nav') &&
      detailsClosed(empty.html, 'Support views'),
    empty.html.slice(0, 2400));

  assertCase(results, 'w416-prepared-unconfirmed-primary-action-is-confirm',
    prepared.stage.stage === 'confirm_path' &&
      prepared.text.includes('Confirm the demo path') &&
      prepared.text.includes('Confirm demo path') &&
      !prepared.text.includes('Build demo records') &&
      !/Open\s+Prove\s+Handle objection\s+Close value/.test(prepared.text),
    prepared.text.slice(0, 3200));

  assertCase(results, 'w416-confirmed-no-records-primary-action-is-build',
    confirmed.stage.stage === 'build_records' &&
      confirmed.text.includes('Build demo records') &&
      confirmed.text.includes('Build and proof readiness') &&
      detailsClosed(confirmed.html, 'Request, value, and evidence support') &&
      !confirmed.text.includes('Demo Cockpit') &&
      !/Open\s+Prove\s+Handle objection\s+Close value/.test(confirmed.text),
    confirmed.text.slice(0, 3600));

  assertCase(results, 'w416-herr-trace-routes-to-build-not-tab-hunt',
    ['build_records', 'waiting_for_records', 'fix_build'].includes(herr.stage.stage) &&
      herr.text.includes('Consultant day in life') &&
      herr.text.includes('Build and proof readiness') &&
      detailsClosed(herr.html, 'Request, value, and evidence support') &&
      !herr.text.includes('Live controls') &&
      !herr.text.includes('Trace actions only'),
    herr.text.slice(0, 3600));

  assertCase(results, 'w416-completed-records-route-to-cockpit',
    rideNow.stage.stage === 'demo_cockpit' &&
      rideNow.text.includes('Use the Demo Cockpit') &&
      rideNow.text.includes('Demo Cockpit') &&
      rideNow.text.includes('Story with embedded records') &&
      rideNow.text.includes('Top ROI point') &&
      rideNow.text.includes('Competitive battlecard') &&
      rideNow.html.indexOf('idb-w415-demo-cockpit') < rideNow.html.indexOf('Supporting NetSuite path'),
    rideNow.text.slice(0, 3600));

  assertCase(results, 'w416-run-blocked-view-hides-live-controls',
    !hooks.renderRunView(confirmedState, motionContext(hooks, confirmedState).lane, motionContext(hooks, confirmedState).page, motionContext(hooks, confirmedState).recommendation, 'Customer Record', { id: 'open' }, '').includes('idb-run-selector-chips'),
    'Blocked Run view should not expose Open / Prove / Handle objection / Close value chips');

  assertCase(results, 'w416-no-runtime-boundary-regression',
    report.includes('No live smoke was run in W416') &&
      report.includes('No runner, adapter, source-pack, record creation, completed-result import validation, or Open-link authority behavior changed'),
    report.slice(0, 1800));

  assertCase(results, 'w416-package-script-registered',
    pkg.scripts && pkg.scripts['harness:consultant-day-in-life-simplification-w416'] === 'node archive/tools/run_w416_consultant_day_in_life_simplification_harness.js',
    JSON.stringify(pkg.scripts && pkg.scripts['harness:consultant-day-in-life-simplification-w416']));

  assertCase(results, 'w416-report-records-validation-results',
    report.includes('W416 consultant day-in-life simplification harness: 12/12 passed') &&
      report.includes('W415 post-run demo cockpit harness: 16/16 passed') &&
      report.includes('W414 naming and executable cockpit review harness: 11/11 passed'),
    report.slice(report.indexOf('## Verification Results')));

  printResults('W416 consultant day-in-life simplification harness', results);
}

main();
