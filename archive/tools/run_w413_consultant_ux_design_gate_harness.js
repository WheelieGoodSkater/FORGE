#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  loadHooks,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w413_consultant_ux_design_gate.md');
const w412ReportPath = path.join(root, 'archive', 'reports', 'w412_first_two_smoke_review_ux_cleanup_plan.md');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fileCabinetUserscriptPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
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
  const valueHtml = hooks.renderValueReviewView(state, lane, page, recommendation);
  const runHtml = hooks.renderRunView(state, lane, page, recommendation, selectedMove, action, '');
  const reviewHtml = hooks.renderReviewView(state, lane, page, recommendation);
  const navigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const website = hooks.websiteEvidenceUxModel(state, lane);
  return {
    label,
    trace,
    state,
    lane,
    valueHtml,
    valueText: stripTags(valueHtml),
    runHtml,
    runText: stripTags(runHtml),
    reviewHtml,
    reviewText: stripTags(reviewHtml),
    navigation,
    website
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

function detailsClosed(html, summaryText) {
  const source = String(html || '');
  const summaryIndex = source.indexOf(`<summary>${summaryText}</summary>`);
  if (summaryIndex < 0) return false;
  const detailsStart = source.lastIndexOf('<details', summaryIndex);
  const openTagEnd = source.indexOf('>', detailsStart);
  return detailsStart >= 0 && openTagEnd > detailsStart && !/\sopen(\s|>)/.test(source.slice(detailsStart, openTagEnd + 1));
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const report = fs.existsSync(reportPath) ? read(reportPath) : '';
  const w412Report = fs.existsSync(w412ReportPath) ? read(w412ReportPath) : '';
  const userscript = read(userscriptPath);
  const fileCabinetUserscript = read(fileCabinetUserscriptPath);
  const scripts = JSON.parse(read(path.join(root, 'package.json'))).scripts || {};
  const rideNow = renderTraceScenario(hooks, rideNowTracePath, 'RideNow Powersports');
  const reMichel = renderTraceScenario(hooks, reMichelTracePath, 'R.E. Michel Company');
  const scenarios = [rideNow, reMichel];

  assertCase(results, 'w413-marker-and-version-advanced',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.25 / W413' &&
      userscript.includes('// @version      1.0.25') &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W413';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w413-filecabinet-mirror-synced',
    userscript === fileCabinetUserscript &&
      fileCabinetUserscript.includes('idb-w413-presenter-flow') &&
      fileCabinetUserscript.includes('idb-w413-proof-cta-rows'),
    'root and FileCabinet userscripts should match exactly');

  assertCase(results, 'w413-approved-presenter-flow-source-present',
    ['Say first', 'Ask next', 'Show proof', 'Value to prove', 'Objection handle', 'Competitive watch-out', 'Claim caution']
      .every((label) => userscript.includes(label)) &&
      userscript.includes('idb-w413-presenter-flow'),
    userscript.slice(userscript.indexOf('idb-w413-presenter-flow') - 500, userscript.indexOf('idb-w413-presenter-flow') + 2400));

  assertCase(results, 'w413-rendered-presenter-flow-for-smoke-traces',
    scenarios.every((scenario) => ['Say first', 'Ask next', 'Show proof', 'Value to prove', 'Objection handle', 'Competitive watch-out', 'Claim caution']
      .every((label) => scenario.valueText.includes(label))) &&
      scenarios.every((scenario) => scenario.valueHtml.includes('idb-w413-presenter-flow')),
    scenarios.map((scenario) => `${scenario.label}\n${scenario.valueText.slice(0, 2200)}`).join('\n---\n'));

  assertCase(results, 'w413-top-value-copy-avoids-demo-risk',
    scenarios.every((scenario) => {
      const top = scenario.valueText.slice(0, scenario.valueText.indexOf('Competitive lens and prep'));
      return !/\bdemo risk\b/i.test(top) && /buyer risk|protect|promise|readiness|value/i.test(top);
    }),
    scenarios.map((scenario) => `${scenario.label}\n${scenario.valueText.slice(0, 1600)}`).join('\n---\n'));

  assertCase(results, 'w413-competitive-watchout-advisory-safe',
    scenarios.every((scenario) => /Competitive watch-out/.test(scenario.valueText) &&
      /Advisory only unless the buyer confirms/.test(scenario.valueText) &&
      /unsupported feature claims/.test(scenario.valueText)),
    scenarios.map((scenario) => `${scenario.label}\n${scenario.valueText.slice(0, 2400)}`).join('\n---\n'));

  assertCase(results, 'w413-claim-caution-preserved',
    scenarios.every((scenario) => /Claim caution/.test(scenario.valueText) &&
      /baseline|Measured savings require a customer baseline|customer-confirmed/i.test(scenario.valueText)),
    scenarios.map((scenario) => `${scenario.label}\n${scenario.valueText.slice(0, 2600)}`).join('\n---\n'));

  assertCase(results, 'w413-run-duplicate-script-cleaned-up',
    scenarios.every((scenario) => scenario.runText.includes('Presenter objective')) &&
      scenarios.every((scenario) => scenario.runHtml.includes('<summary>Full Say / Show / Close script</summary>')) &&
      scenarios.every((scenario) => !scenario.runHtml.includes('<div class="idb-card idb-accent idb-w56-run-script-first">')) &&
      userscript.includes('Presenter objective') &&
      userscript.includes('Full Say / Show / Close script'),
    scenarios.map((scenario) => `${scenario.label}\n${scenario.runText.slice(0, 2400)}`).join('\n---\n'));

  assertCase(results, 'w413-say-show-close-primary-steps-preserved',
    scenarios.every((scenario) => scenario.runHtml.includes('idb-w367-presenter-steps') &&
      /Say/.test(scenario.runText) &&
      /Show/.test(scenario.runText) &&
      /Close/.test(scenario.runText)),
    scenarios.map((scenario) => `${scenario.label}\n${scenario.runText.slice(0, 1800)}`).join('\n---\n'));

  assertCase(results, 'w413-run-open-links-preserved',
    scenarios.every((scenario) => openRecords(scenario).length === 5) &&
      scenarios.every((scenario) => scenario.runHtml.includes('idb-w371-path-clickable')) &&
      scenarios.every((scenario) => !/href=""/.test(scenario.runHtml)),
    scenarios.map((scenario) => `${scenario.label}: ${openRecords(scenario).length}`).join('\n'));

  assertCase(results, 'w413-build-cta-stacked-row-layout',
    scenarios.every((scenario) => scenario.reviewHtml.includes('idb-w413-proof-cta-rows') &&
      /Proof action/.test(scenario.reviewText) &&
      /Safe claim/.test(scenario.reviewText) &&
      /Stop/.test(scenario.reviewText)),
    scenarios.map((scenario) => `${scenario.label}\n${scenario.reviewText.slice(0, 2400)}`).join('\n---\n'));

  assertCase(results, 'w413-imported-proof-records-collapsed',
    scenarios.every((scenario) => detailsClosed(scenario.runHtml, 'Use imported proof records (5)')),
    scenarios.map((scenario) => `${scenario.label}: ${scenario.runHtml.includes('Use imported proof records (5)')}`).join('\n'));

  assertCase(results, 'w413-confidence-source-separation-preserved',
    scenarios.every((scenario) => scenario.website.status === 'needs_confirmation' &&
      scenario.website.confidence.displayText === 'Resolver limited' &&
      ['low', 'medium'].includes(scenario.website.confidence.scoreLabel) &&
      scenario.website.advisory.visualLabel === 'Advisory: Supported / High'),
    scenarios.map((scenario) => `${scenario.label}: ${JSON.stringify(scenario.website.confidence)} ${JSON.stringify(scenario.website.advisory)}`).join('\n'));

  assertCase(results, 'w413-no-fake-open-links',
    scenarios.every((scenario) => openRecords(scenario).length === 5) &&
      scenarios.every((scenario) => !/placeholder|preview-url|fake open/i.test(scenario.runHtml + scenario.reviewHtml)),
    scenarios.map((scenario) => `${scenario.label}: ${openRecords(scenario).map((record) => record.linkAuthority.url).join(', ')}`).join('\n'));

  assertCase(results, 'w413-w412-findings-preserved',
    w412Report.includes('RideNow lane specificity') &&
      w412Report.includes('R.E. Michel HVAC specificity') &&
      report.includes('RideNow Powersports trace') &&
      report.includes('R.E. Michel Company trace') &&
      report.includes('Industrial Distribution instead of Dealer Hardgoods') &&
      report.includes('Parts & Service instead of clean HVAC/Mechanical'),
    w412Report.slice(0, 2600));

  assertCase(results, 'w413-no-live-smoke-no-upload-boundary',
    report.includes('No live smoke was run in W413') &&
      report.includes('No upload or deployment was performed') &&
      report.includes('No runtime package was created'),
    report.slice(0, 1400));

  assertCase(results, 'w413-no-source-pack-runner-adapter-mutation-posture',
    report.includes('Source packs, runner, adapter, record creation, completed-result import validation, and Open-link authority were not changed') &&
      report.includes('W413 scoped changes to drawer presentation, report, harness, package script, and FileCabinet mirror'),
    report.slice(0, 3200));

  assertCase(results, 'w413-package-script-registered',
    scripts['harness:consultant-ux-design-gate-w413'] === 'node archive/tools/run_w413_consultant_ux_design_gate_harness.js',
    JSON.stringify(scripts, null, 2));

  assertCase(results, 'w413-no-regression-gates',
    report.includes('W413 consultant UX design gate harness: 19/19 passed') &&
      report.includes('W412 first two smoke review UX cleanup plan harness: 16/16 passed') &&
      report.includes('W411 larger smoke candidate packet harness: 17/17 passed') &&
      report.includes('W410 larger smoke-series design gate harness: 17/17 passed') &&
      report.includes('W409 comfortable lane hardening matrix harness: 17/17 passed'),
    report.slice(report.indexOf('## Verification Results')));

  printResults('W413 consultant UX design gate harness', results);
}

main();
