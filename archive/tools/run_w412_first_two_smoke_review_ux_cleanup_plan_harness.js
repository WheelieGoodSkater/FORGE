#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w412_first_two_smoke_review_ux_cleanup_plan.md');
const w411ReportPath = path.join(root, 'archive', 'reports', 'w411_larger_smoke_candidate_packet.md');
const rideNowTracePath = '/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780515279117.json';
const reMichelTracePath = '/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780515597715.json';

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(read(filePath));
}

function first(obj, paths) {
  for (const dotPath of paths) {
    const value = dotPath.split('.').reduce((node, key) => node && node[key], obj);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

function navigationRecords(trace) {
  const records = first(trace, [
    'dccFinalNavigationModelV1.reviewObjects',
    'runSelectorInteraction.dccFinalNavigation.reviewObjects'
  ]);
  return Array.isArray(records) ? records : [];
}

function recordSummary(trace) {
  return navigationRecords(trace).map((record) => ({
    role: record.role,
    consultantLabel: record.consultantLabel || record.label,
    recordName: record.recordName || record.name,
    recordType: record.recordType,
    url: record.supportedOpenUrl || record.openableUrl || record.url,
    authority: record.linkAuthorityStatus || (record.linkAuthority && record.linkAuthority.status)
  }));
}

function allLinksVerified(trace) {
  const records = recordSummary(trace);
  return records.length === 5 &&
    records.every((record) => record.url &&
      record.url.startsWith('https://td3021666.app.netsuite.com/') &&
      record.authority === 'verified_openable');
}

function laneId(trace) {
  return first(trace, ['selectedLane.id', 'websiteEvidenceUx.recommendedLaneId']);
}

function laneName(trace) {
  return first(trace, ['selectedLane.name', 'websiteEvidenceUx.recommendedLaneName']);
}

function websiteStatus(trace) {
  return {
    status: first(trace, ['websiteEvidenceUx.status']),
    display: first(trace, ['websiteEvidenceUx.confidence.displayText']),
    score: first(trace, ['websiteEvidenceUx.confidence.scoreLabel']),
    advisory: first(trace, ['websiteEvidenceUx.advisory.visualLabel'])
  };
}

function runScript(trace) {
  return first(trace, ['runSelectorInteraction.scriptPreview']);
}

function packageJson() {
  return JSON.parse(read(path.join(root, 'package.json')));
}

function main() {
  const results = [];
  const report = fs.existsSync(reportPath) ? read(reportPath) : '';
  const w411Report = fs.existsSync(w411ReportPath) ? read(w411ReportPath) : '';
  const scripts = packageJson().scripts || {};
  const rideNow = fs.existsSync(rideNowTracePath) ? readJson(rideNowTracePath) : {};
  const reMichel = fs.existsSync(reMichelTracePath) ? readJson(reMichelTracePath) : {};
  const rideNowRecords = recordSummary(rideNow);
  const reMichelRecords = recordSummary(reMichel);

  assertCase(results, 'w412-report-and-traces-present',
    fs.existsSync(reportPath) &&
      fs.existsSync(rideNowTracePath) &&
      fs.existsSync(reMichelTracePath) &&
      report.includes(rideNowTracePath) &&
      report.includes(reMichelTracePath),
    JSON.stringify({ reportPath, rideNowTracePath, reMichelTracePath }, null, 2));

  assertCase(results, 'w412-w411-baseline-preserved',
    w411Report.includes('W411 builds the actual candidate packet') &&
      report.includes('Use W411 Larger Smoke-Series Candidate Packet as the locked smoke candidate baseline') &&
      report.includes('W411 baseline preservation'),
    JSON.stringify({ w411: w411Report.slice(0, 1200), w412: report.slice(0, 1200) }, null, 2));

  assertCase(results, 'w412-ridenow-trace-parsed',
    laneId(rideNow) === 'industrial_distribution' &&
      laneName(rideNow).includes('Industrial Distribution') &&
      websiteStatus(rideNow).status === 'needs_confirmation' &&
      runScript(rideNow).title === 'Open on the buyer risk',
    JSON.stringify({ laneId: laneId(rideNow), laneName: laneName(rideNow), websiteStatus: websiteStatus(rideNow), runScript: runScript(rideNow) }, null, 2));

  assertCase(results, 'w412-remichel-trace-parsed',
    laneId(reMichel) === 'parts_service' &&
      laneName(reMichel).includes('Parts & Service') &&
      websiteStatus(reMichel).status === 'needs_confirmation' &&
      runScript(reMichel).title === 'Prove the NetSuite path',
    JSON.stringify({ laneId: laneId(reMichel), laneName: laneName(reMichel), websiteStatus: websiteStatus(reMichel), runScript: runScript(reMichel) }, null, 2));

  assertCase(results, 'w412-open-link-authority-preserved',
    allLinksVerified(rideNow) &&
      allLinksVerified(reMichel) &&
      report.includes('both traces returned five verified NetSuite Open links'),
    JSON.stringify({ rideNowRecords, reMichelRecords }, null, 2));

  assertCase(results, 'w412-confidence-separation-preserved',
    websiteStatus(rideNow).display === 'Resolver limited' &&
      websiteStatus(rideNow).score === 'low' &&
      websiteStatus(rideNow).advisory === 'Advisory: Supported / High' &&
      websiteStatus(reMichel).display === 'Resolver limited' &&
      websiteStatus(reMichel).score === 'low' &&
      websiteStatus(reMichel).advisory === 'Advisory: Supported / High' &&
      report.includes('Website confidence separation'),
    JSON.stringify({ rideNow: websiteStatus(rideNow), reMichel: websiteStatus(reMichel) }, null, 2));

  assertCase(results, 'w412-ridenow-lane-specificity-finding',
    report.includes('RideNow lane specificity') &&
      report.includes('Intended Dealer Hardgoods slot selected Industrial Distribution') &&
      report.includes('do not count RideNow as a clean Dealer Hardgoods lane pass'),
    report);

  assertCase(results, 'w412-remichel-hvac-specificity-finding',
    report.includes('R.E. Michel HVAC specificity') &&
      report.includes('Intended HVAC slot selected Parts/Service') &&
      report.includes('should not be counted as the clean HVAC smoke'),
    report);

  assertCase(results, 'w412-roi-competitive-cleanup-plan',
    report.includes('Replace the box stack with a clearer consultant flow') &&
      report.includes('Say first') &&
      report.includes('Ask next') &&
      report.includes('Show proof') &&
      report.includes('Largest value to prove') &&
      report.includes('Competitive watch-out') &&
      report.includes('Claim caution'),
    report);

  assertCase(results, 'w412-run-duplication-cleanup-plan',
    report.includes('Run duplication') &&
      report.includes('Keep Say / Show / Close as the primary presenter script') &&
      report.includes('Replace Selected Script with a compact') &&
      report.includes('Collapse Live Script First by default'),
    report);

  assertCase(results, 'w412-build-cta-cleanup-plan',
    report.includes('Build Live Proof CTA density') &&
      report.includes('Convert Live Proof CTA to three horizontal rows') &&
      report.includes('Proof action') &&
      report.includes('Safe claim') &&
      report.includes('Stop'),
    report);

  assertCase(results, 'w412-remaining-smoke-routing-updated',
    report.includes('Do not run General Parts next unless a second Parts/Service smoke is desired') &&
      report.includes('Recommended remaining three') &&
      report.includes('Replacement HVAC/Mechanical candidate') &&
      report.includes('Meridian Bioscience') &&
      report.includes('Yost Foods'),
    report);

  assertCase(results, 'w412-no-additional-live-smoke-no-upload',
    report.includes('No additional live smoke was run in W412') &&
      report.includes('No upload or deployment was performed') &&
      report.includes('No source packs, runner, adapter, or record creation behavior were changed'),
    report.slice(0, 1800));

  assertCase(results, 'w412-no-fake-open-links',
    report.includes('No fake Open links') &&
      report.includes('verified-import-only link authority') &&
      allLinksVerified(rideNow) &&
      allLinksVerified(reMichel),
    JSON.stringify({ rideNowRecords, reMichelRecords }, null, 2));

  assertCase(results, 'w412-package-script-registered',
    scripts['harness:first-two-smoke-review-ux-cleanup-plan-w412'] === 'node archive/tools/run_w412_first_two_smoke_review_ux_cleanup_plan_harness.js',
    JSON.stringify(scripts, null, 2));

  assertCase(results, 'w412-no-regression-gates',
    report.includes('W412 first two smoke review UX cleanup plan harness: 16/16 passed') &&
      report.includes('W411 larger smoke candidate packet harness: 17/17 passed') &&
      report.includes('W410 larger smoke-series design gate harness: 17/17 passed') &&
      report.includes('W409 comfortable lane hardening matrix harness: 17/17 passed'),
    report.slice(report.indexOf('## Verification Results')));

  printResults('W412 first two smoke review UX cleanup plan harness', results);
}

main();
