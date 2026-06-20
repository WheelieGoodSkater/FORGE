#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w411_larger_smoke_candidate_packet.md');
const w410ReportPath = path.join(root, 'archive', 'reports', 'w410_larger_smoke_series_design_gate.md');
const packageDirs = [
  'archive/package_ready/w386_forge_source_pack_ready_artifact',
  'archive/package_ready/w397_building_materials_readiness_delta',
  'archive/package_ready/w403_wholesale_janitorial_readiness_delta',
  'archive/package_ready/w408_hvac_mechanical_readiness_delta'
];
const packageZips = [
  'archive/package_ready/w386_forge_source_pack_ready_artifact.zip',
  'archive/package_ready/w397_building_materials_readiness_delta.zip',
  'archive/package_ready/w403_wholesale_janitorial_readiness_delta.zip',
  'archive/package_ready/w408_hvac_mechanical_readiness_delta.zip'
];

const candidates = [
  {
    name: 'RideNow Powersports',
    website: 'https://www.ridenow.com/',
    lane: 'Dealer Hardgoods / Dealer Channel Availability',
    toggle: 'Manufacturing off / WIP off',
    nearNeighbor: 'Building Materials generic branch availability or Apparel/Retail generic inventory'
  },
  {
    name: 'R.E. Michel Company',
    website: 'https://www.remichel.com/',
    lane: 'HVAC / Mechanical Contractor Supply & Service Readiness',
    toggle: 'Manufacturing off / WIP off',
    nearNeighbor: 'Building Materials contractor supply or Parts/Service dispatch/truck-stock story'
  },
  {
    name: 'General Parts Group',
    website: 'https://generalparts.com/',
    lane: 'Parts & Service / Field Service Operations',
    toggle: 'Manufacturing off / WIP off',
    nearNeighbor: 'HVAC contractor supply or Medical/Dental equipment availability'
  },
  {
    name: 'Meridian Bioscience',
    website: 'https://www.meridianbioscience.com/',
    lane: 'Life Sciences / Regulated Supply & Release',
    toggle: 'Manufacturing off / WIP off unless explicit regulated manufacturing scope is approved later',
    nearNeighbor: 'Medical/Dental equipment/supply or Food/Beverage QA/batch language'
  },
  {
    name: 'Yost Foods',
    website: 'https://www.yostfoods.com/',
    lane: 'Food/Beverage / Batch and Promotion Readiness',
    toggle: 'Manufacturing on only if candidate setup explicitly requires it; WIP off unless separately approved',
    nearNeighbor: 'Life Sciences QA/release or Industrial Equipment component/build readiness'
  }
];

const requiredCandidatePhrases = [
  'Prospect name:',
  'Website:',
  'Intended lane:',
  'Toggle posture:',
  'Public website anchor:',
  'Why it belongs:',
  'Near-neighbor confusion risk:',
  'Expected proof roles:',
  'Expected Open-link authority:',
  'ROI baseline caution:',
  'Competitive/advisory caution:',
  'Stop conditions:',
  'Poorly created sales rep notes:'
];

const preconditions = [
  'user explicitly approves smoke execution',
  'installed drawer/runtime version is confirmed',
  'target environment and build setup are confirmed',
  'W410, W409, W408, W403, W397, and W386 harnesses still pass',
  'completed-result import validation remains unchanged',
  'Open-link authority remains verified-import-only',
  'Manufacturing/WIP toggle policy is confirmed for each candidate'
];

const evidenceFields = [
  'drawer version and block marker',
  'candidate name, website, and notes',
  'selected lane and source-pack confidence',
  'website/category evidence state',
  'advisory inference state',
  'Build/Run result state',
  'returned records and Open-link count',
  'Run path and clickable Open-link behavior',
  'ROI/Competitive flow state',
  'proof guardrails and confidence separation',
  'trace export path',
  'pass/fail against intended lane',
  'runner/import/Open-link errors'
];

const stopRules = [
  'completed-result import validation regresses',
  'fake Open links appear',
  'real Open links are lost for verified imported records',
  'wrong lane selection causes unsafe live build behavior',
  'Manufacturing/WIP is enabled unexpectedly',
  'runner or adapter behavior changes unexpectedly',
  'source-pack gap makes remaining smoke misleading',
  'upload/deployment is accidentally introduced'
];

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function packageJson() {
  return JSON.parse(read(path.join(root, 'package.json')));
}

function sectionFor(report, candidateName) {
  const start = report.indexOf(`Prospect name: ${candidateName}`);
  if (start < 0) return '';
  const next = report.indexOf('\n### ', start + 1);
  return report.slice(start, next > start ? next : report.length);
}

function main() {
  const results = [];
  const report = fs.existsSync(reportPath) ? read(reportPath) : '';
  const w410Report = fs.existsSync(w410ReportPath) ? read(w410ReportPath) : '';
  const scripts = packageJson().scripts || {};

  assertCase(results, 'w411-w410-design-baseline-preserved',
    w410Report.includes('W410 larger smoke-series design gate harness: 17/17 passed') &&
      w410Report.includes('Lock W410 smoke-series design and prepare W411 candidate packet') &&
      report.includes('Use W410 Larger Smoke-Series Design and Controlled Execution Gate as the locked smoke-design baseline'),
    JSON.stringify({ w410: w410Report.slice(0, 1800), w411: report.slice(0, 1800) }, null, 2));

  assertCase(results, 'w411-five-candidate-packet-complete',
    candidates.length === 5 &&
      candidates.every((candidate) => report.includes(candidate.name) && report.includes(candidate.website) && report.includes(candidate.lane)) &&
      report.includes("W410's five-slot minimum smoke design") &&
      report.includes('Recommended run order'),
    JSON.stringify(candidates, null, 2));

  assertCase(results, 'w411-candidate-fields-complete',
    candidates.every((candidate) => {
      const section = sectionFor(report, candidate.name);
      return requiredCandidatePhrases.every((phrase) => section.includes(phrase));
    }),
    JSON.stringify(candidates.map((candidate) => ({ name: candidate.name, section: sectionFor(report, candidate.name).slice(0, 2000) })), null, 2));

  assertCase(results, 'w411-poorly-created-notes-present',
    candidates.every((candidate) => {
      const section = sectionFor(report, candidate.name);
      return section.includes('Poorly created sales rep notes:') &&
        section.includes('"') &&
        /(maybe|not sure|did not|get exact|spreadsheets|portal)/i.test(section);
    }),
    JSON.stringify(candidates.map((candidate) => ({ name: candidate.name, section: sectionFor(report, candidate.name).slice(-900) })), null, 2));

  assertCase(results, 'w411-lane-intent-and-near-neighbor-risk-documented',
    candidates.every((candidate) => {
      const section = sectionFor(report, candidate.name);
      return section.includes(candidate.lane) && section.includes(candidate.nearNeighbor);
    }),
    JSON.stringify(candidates, null, 2));

  assertCase(results, 'w411-manufacturing-wip-policy-documented',
    candidates.every((candidate) => sectionFor(report, candidate.name).includes(candidate.toggle)) &&
      report.includes('Manufacturing/WIP is not defaulted into non-manufacturing lanes') &&
      report.includes('W393 WIP routing best-effort diagnostics were not weakened'),
    JSON.stringify(candidates.map((candidate) => ({ name: candidate.name, toggle: candidate.toggle })), null, 2));

  assertCase(results, 'w411-open-link-authority-preservation',
    candidates.every((candidate) => sectionFor(report, candidate.name).includes('Open links only after verified imported NetSuite records return')) &&
      report.includes('Open-link authority remains verified-import-only') &&
      report.includes('No fake Open links'),
    report.slice(0, 12000));

  assertCase(results, 'w411-roi-and-competitive-caution-documented',
    candidates.every((candidate) => {
      const section = sectionFor(report, candidate.name);
      return section.includes('do not claim measured savings without a customer-confirmed baseline') &&
        section.includes('advisory') &&
        section.includes('unless confirmed');
    }),
    JSON.stringify(candidates.map((candidate) => ({ name: candidate.name, section: sectionFor(report, candidate.name).slice(0, 1800) })), null, 2));

  assertCase(results, 'w411-stop-rules-documented',
    stopRules.every((rule) => report.includes(rule)) &&
      candidates.every((candidate) => sectionFor(report, candidate.name).includes('Stop conditions:')),
    JSON.stringify(stopRules, null, 2));

  assertCase(results, 'w411-execution-preconditions-documented',
    preconditions.every((precondition) => report.includes(precondition)) &&
      report.includes('Do not run this packet until'),
    JSON.stringify(preconditions, null, 2));

  assertCase(results, 'w411-evidence-capture-checklist-documented',
    evidenceFields.every((field) => report.includes(field)),
    JSON.stringify(evidenceFields, null, 2));

  assertCase(results, 'w411-no-live-smoke-no-upload-boundary',
    report.includes('No live smoke in W411') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('does not run live smoke'),
    report.slice(0, 2400));

  assertCase(results, 'w411-no-runtime-package-creation',
    !exists('archive/package_ready/w411_larger_smoke_candidate_packet') &&
      !exists('archive/package_ready/w411_larger_smoke_candidate_packet.zip') &&
      report.includes('No package creation in W411'),
    'W411 must remain a candidate packet, not a package block.');

  assertCase(results, 'w411-no-source-pack-mutation',
    report.includes('No source-pack mutation in W411') &&
      report.includes('No source packs were mutated') &&
      report.includes('No runner, adapter, record creation, completed-result import validation, or Open-link authority changes'),
    report.slice(0, 4000));

  assertCase(results, 'w411-package-baseline-preservation',
    packageDirs.every(exists) &&
      packageZips.every(exists) &&
      report.includes('W386, W397, W403, and W408 packages were not mutated'),
    JSON.stringify({ packageDirs, packageZips }, null, 2));

  assertCase(results, 'w411-preservation-scripts-registered',
    typeof scripts['harness:larger-smoke-candidate-packet-w411'] === 'string' &&
      typeof scripts['harness:larger-smoke-series-design-gate-w410'] === 'string' &&
      typeof scripts['harness:comfortable-lane-hardening-matrix-w409'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-readiness-delta-package-w408'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-readiness-delta-package-w403'] === 'string' &&
      typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w411: scripts['harness:larger-smoke-candidate-packet-w411'],
      w410: scripts['harness:larger-smoke-series-design-gate-w410'],
      w409: scripts['harness:comfortable-lane-hardening-matrix-w409'],
      w408: scripts['harness:hvac-mechanical-readiness-delta-package-w408'],
      w403: scripts['harness:wholesale-janitorial-readiness-delta-package-w403'],
      w397: scripts['harness:building-materials-readiness-delta-package-w397'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w411-no-regression-gates',
      report.includes('Website/category evidence owns lane identity') &&
      report.includes('Messy notes shape pain, ROI, objections, and demo flow only') &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('Lock W411 candidate packet') &&
      report.includes('Run no smoke until explicit user approval'),
    report.slice(-6000));

  printResults('W411 larger smoke candidate packet harness', results);
}

main();
