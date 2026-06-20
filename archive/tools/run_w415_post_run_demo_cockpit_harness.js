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
const reportPath = path.join(root, 'archive', 'reports', 'w415_post_run_demo_cockpit.md');
const w414ReportPath = path.join(root, 'archive', 'reports', 'w414_naming_and_executable_cockpit_review.md');
const w413ReportPath = path.join(root, 'archive', 'reports', 'w413_consultant_ux_design_gate.md');
const rideNowTracePath = '/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780515279117.json';
const reMichelTracePath = '/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780515597715.json';

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

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function detailsClosed(html, summaryText) {
  const source = String(html || '');
  const summaryIndex = source.indexOf(`<summary>${summaryText}</summary>`);
  if (summaryIndex < 0) return false;
  const detailsStart = source.lastIndexOf('<details', summaryIndex);
  const openTagEnd = source.indexOf('>', detailsStart);
  return detailsStart >= 0 && openTagEnd > detailsStart && !/\sopen(\s|>)/.test(source.slice(detailsStart, openTagEnd + 1));
}

function renderTraceScenario(hooks, tracePath, label) {
  const trace = readJson(tracePath);
  const state = Object.assign(hooks.defaultState(), trace.state || {});
  const lane = hooks.getLane(state);
  const page = state.pageContext || {
    title: 'NetSuite Home',
    url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
    pageType: 'NetSuite page',
    contextId: 'generic_netsuite_page',
    confidence: 'low'
  };
  const recommendation = hooks.recommendMove(lane, page);
  const actionModel = (hooks.runSelectorTraceModel && hooks.runSelectorTraceModel(state, lane, page, recommendation)) || {};
  const action = {
    id: state.selectedActionId || actionModel.selectedActionId || 'open',
    label: actionModel.selectedActionLabel || 'Open'
  };
  const selectedMove = lane.moves[state.selectedMoveIndex] || lane.moves[0];
  const value = hooks.valueReviewPacket(state, lane, page, recommendation);
  const storyContractW373 = value.storyContractW373 || hooks.crossLaneStoryPolishContractW373(state, lane, value);
  const competitiveAdvisory = hooks.competitiveAdvisoryModelW362(state, lane, value);
  const websiteEvidence = hooks.websiteEvidenceUxModel(state, lane);
  const script = hooks.liveDemoCoachingFromLanePackW246
    ? null
    : null;
  const runHtml = hooks.renderRunView(state, lane, page, recommendation, selectedMove, action, '');
  const cockpitHtml = hooks.renderW415DemoCockpit({
    state,
    lane,
    value,
    script: runHtml.includes('Open on the buyer risk') ? { say: value.talkTrackLead, show: value.valueDecision } : {},
    finalNavigation: hooks.dccFinalNavigationModel(state, lane, page, recommendation),
    storyContractW373,
    websiteEvidence,
    competitiveAdvisory
  });
  const navigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  return {
    label,
    state,
    lane,
    runHtml,
    runText: stripTags(runHtml),
    cockpitHtml,
    cockpitText: stripTags(cockpitHtml),
    navigation,
    websiteEvidence
  };
}

function openRecords(scenario) {
  const records = scenario.navigation && scenario.navigation.reviewObjects || [];
  return records.filter((record) => {
    const authority = record.linkAuthority || {};
    return authority.status === 'verified_openable' &&
      authority.openable === true &&
      /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(authority.url || record.url || record.openableUrl || ''));
  });
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);
  const report = fs.existsSync(reportPath) ? read(reportPath) : '';
  const w414Report = fs.existsSync(w414ReportPath) ? read(w414ReportPath) : '';
  const w413Report = fs.existsSync(w413ReportPath) ? read(w413ReportPath) : '';
  const pkg = JSON.parse(read(path.join(root, 'package.json')));
  const rideNow = renderTraceScenario(hooks, rideNowTracePath, 'RideNow Powersports');
  const reMichel = renderTraceScenario(hooks, reMichelTracePath, 'R.E. Michel Company');
  const scenarios = [rideNow, reMichel];

  assertCase(results, 'w415-demo-cockpit-renderer-present',
    typeof hooks.renderW415DemoCockpit === 'function' &&
      drawer.includes('function renderW415DemoCockpit') &&
      drawer.includes('idb-w415-demo-cockpit'),
    'W415 cockpit renderer should be exported for harness validation');

  assertCase(results, 'w415-filecabinet-mirror-synced',
    drawer === fileCabinetDrawer &&
      fileCabinetDrawer.includes('idb-w415-demo-cockpit') &&
      fileCabinetDrawer.includes('Supporting NetSuite path'),
    'root and FileCabinet drawer copies should match');

  assertCase(results, 'w415-cockpit-first-in-run-view',
    scenarios.every((scenario) => scenario.runHtml.indexOf('idb-w415-demo-cockpit') >= 0 &&
      scenario.runHtml.indexOf('idb-w415-demo-cockpit') < scenario.runHtml.indexOf('Supporting NetSuite path')),
    scenarios.map((scenario) => `${scenario.label}: cockpit=${scenario.runHtml.indexOf('idb-w415-demo-cockpit')} support=${scenario.runHtml.indexOf('Supporting NetSuite path')}`).join('\n'));

  assertCase(results, 'w415-above-fold-cockpit-essentials',
    scenarios.every((scenario) => ['Demo Cockpit', 'Story with embedded records', 'Top ROI point', 'Competitive battlecard', 'Claim caution']
      .every((label) => scenario.runText.includes(label))) &&
      scenarios.every((scenario) => normalizeText(scenario.runText).includes(normalizeText(scenario.state.customerName))),
    scenarios.map((scenario) => `${scenario.label}\n${scenario.runText.slice(0, 2600)}`).join('\n---\n'));

  assertCase(results, 'w415-ordered-open-records-visible-in-cockpit',
    scenarios.every((scenario) => openRecords(scenario).length === 5) &&
      scenarios.every((scenario) => scenario.runHtml.includes('idb-w415-open-link')) &&
      scenarios.every((scenario) => scenario.runHtml.indexOf('idb-w415-open-link') < scenario.runHtml.indexOf('idb-w371-path-clickable')),
    scenarios.map((scenario) => `${scenario.label}: ${openRecords(scenario).map((record) => record.linkAuthority.url).join(', ')}`).join('\n'));

  assertCase(results, 'w415-roi-copy-is-buyer-value-not-demo-risk',
    scenarios.every((scenario) => {
      const cockpitText = scenario.runText.slice(
        scenario.runText.indexOf('Demo Cockpit'),
        scenario.runText.indexOf('Supporting NetSuite path')
      );
      return /Top ROI point/.test(cockpitText) &&
        /Baseline:/.test(cockpitText) &&
        !/\bdemo risk\b|\bdemo demand\b/i.test(cockpitText);
    }),
    scenarios.map((scenario) => `${scenario.label}\n${scenario.runText.slice(scenario.runText.indexOf('Demo Cockpit'), scenario.runText.indexOf('Supporting NetSuite path'))}`).join('\n---\n'));

  assertCase(results, 'w415-competitive-battlecard-is-practical-and-advisory',
    scenarios.every((scenario) => {
      const cockpitText = scenario.runText.slice(
        scenario.runText.indexOf('Demo Cockpit'),
        scenario.runText.indexOf('Supporting NetSuite path')
      );
      return /Competitive battlecard/.test(cockpitText) &&
        /Watch-out:/.test(cockpitText) &&
        /advisory|buyer|workflow|trust|current/i.test(cockpitText);
    }),
    scenarios.map((scenario) => `${scenario.label}\n${scenario.runText.slice(scenario.runText.indexOf('Demo Cockpit'), scenario.runText.indexOf('Supporting NetSuite path'))}`).join('\n---\n'));

  assertCase(results, 'w415-run-support-and-full-script-collapsed',
    scenarios.every((scenario) => detailsClosed(scenario.runHtml, 'Use imported proof records (5)')) &&
      scenarios.every((scenario) => detailsClosed(scenario.runHtml, 'Full Say / Show / Close script')) &&
      scenarios.every((scenario) => detailsClosed(scenario.runHtml, 'Audit: controls, moves, guardrails, and coaching')),
    scenarios.map((scenario) => `${scenario.label}: imported=${detailsClosed(scenario.runHtml, 'Use imported proof records (5)')} full=${detailsClosed(scenario.runHtml, 'Full Say / Show / Close script')}`).join('\n'));

  assertCase(results, 'w415-open-link-authority-preserved',
    scenarios.every((scenario) => openRecords(scenario).length === 5) &&
      scenarios.every((scenario) => !/href=""/.test(scenario.runHtml)) &&
      scenarios.every((scenario) => !/placeholder|preview-url|fake open/i.test(scenario.runHtml)),
    scenarios.map((scenario) => `${scenario.label}: ${openRecords(scenario).length} verified`).join('\n'));

  assertCase(results, 'w415-confidence-source-separation-visible',
    scenarios.every((scenario) => /Source confidence remains separate from advisory inference/.test(scenario.runText)) &&
      scenarios.every((scenario) => /Resolver limited|Advisory|Open links verified/i.test(scenario.runText)),
    scenarios.map((scenario) => `${scenario.label}\n${scenario.runText.slice(0, 1800)}`).join('\n---\n'));

  assertCase(results, 'w415-w414-naming-hardening-preserved',
    drawer.includes('label: firstNonBlank(source.consultantLabel, source.displayLabel, source.label, label)') &&
      w414Report.includes('prioritizes confirmed lane id before broad text heuristics') &&
      w414Report.includes('one primary post-run surface'),
    w414Report.slice(0, 2200));

  assertCase(results, 'w415-w413-design-baseline-preserved',
    drawer.includes('idb-w413-presenter-flow') &&
      drawer.includes('idb-w413-proof-cta-rows') &&
      w413Report.includes('W413 consultant UX design gate harness: 19/19 passed'),
    w413Report.slice(0, 2200));

  assertCase(results, 'w415-no-runner-source-pack-adapter-mutation-posture',
    report.includes('No runner, adapter, source-pack, record creation, completed-result import validation, or Open-link authority behavior changed') &&
      report.includes('Subagent review completed before implementation'),
    report.slice(0, 2200));

  assertCase(results, 'w415-no-live-smoke-no-upload-boundary',
    report.includes('No live smoke was run in W415') &&
      report.includes('No upload or deployment was performed') &&
      report.includes('No runtime package was created'),
    report.slice(0, 1600));

  assertCase(results, 'w415-package-script-registered',
    pkg.scripts && pkg.scripts['harness:post-run-demo-cockpit-w415'] === 'node archive/tools/run_w415_post_run_demo_cockpit_harness.js',
    JSON.stringify(pkg.scripts && pkg.scripts['harness:post-run-demo-cockpit-w415']));

  assertCase(results, 'w415-report-records-validation-results',
    report.includes('W415 post-run demo cockpit harness: 16/16 passed') &&
      report.includes('W414 naming and executable cockpit review harness: 11/11 passed') &&
      report.includes('W413 consultant UX design gate harness: 19/19 passed'),
    report.slice(report.indexOf('## Verification Results')));

  printResults('W415 post-run demo cockpit harness', results);
}

main();
