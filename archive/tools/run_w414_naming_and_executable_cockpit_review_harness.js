#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const runnerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const drawerPath = path.join(root, 'idb-drawer.user.js');
const fileCabinetDrawerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w414_naming_and_executable_cockpit_review.md');
const herrTracePath = '/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1781706489161.json';

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJsonIfPresent(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(read(filePath));
}

function first(obj, paths) {
  for (const dotPath of paths) {
    const value = dotPath.split('.').reduce((node, key) => node && node[key], obj);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

function main() {
  const results = [];
  const runner = read(runnerPath);
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);
  const report = fs.existsSync(reportPath) ? read(reportPath) : '';
  const pkg = JSON.parse(read(path.join(root, 'package.json')));
  const herrTrace = readJsonIfPresent(herrTracePath) || {};

  assertCase(results, 'w414-runner-lane-id-priority-present',
    runner.includes("if (laneId === 'industrial_equipment') modeKey = enableWip ? 'wip_manufacturing' : 'manufacturing';") &&
      runner.includes("else if (laneId === 'food_beverage' || laneId === 'products_cpg') modeKey = enableManufacturing ? 'food_ingredient_manufacturing' : 'food_replenishment';") &&
      runner.indexOf("if (laneId === 'industrial_equipment')") < runner.indexOf("else if (/distribution_replenishment"),
    'runnerLaneVocabularyPolicyV1 should prefer confirmed lane id before generic text heuristics');

  assertCase(results, 'w414-industrial-role-labels-not-food',
    runner.includes("heroItem: 'Configured Equipment Item'") &&
      runner.includes("matrixProofItem: 'Assembly / Component Readiness'") &&
      runner.includes("matrixProofItem: 'WIP / Routing Readiness'") &&
      runner.includes("componentItem: 'Component Supply Item'"),
    'industrial equipment labels should not fall through to Finished Food, Formula, or Ingredient labels');

  assertCase(results, 'w414-food-role-labels-intentional-and-separated',
    runner.includes("modeKey === 'food_ingredient_manufacturing'") &&
      runner.includes("heroItem: 'Finished Food/Batch Item'") &&
      runner.includes("matrixProofItem: 'Formula or Batch Structure'") &&
      runner.includes("modeKey === 'food_replenishment'") &&
      runner.includes("matrixProofItem: 'Promotion / Replenishment Readiness'") &&
      runner.includes("componentItem: 'Packaging / Supply Support'"),
    'food labels should remain available only in food modes');

  assertCase(results, 'w414-prospect-specific-names-win-for-all-modes',
    runner.includes("const policyProofName = laneVocabularyPolicy && laneVocabularyPolicy.prospectSpecificProofNames && laneVocabularyPolicy.prospectSpecificProofNames.matrixProofItemName") &&
      runner.includes("const proofName = policyProofName || roleSpecificGeneratedItemName(roleLabel, name || fallbackName);") &&
      runner.includes("const policyProofName = laneVocabularyPolicy && laneVocabularyPolicy.prospectSpecificProofNames && laneVocabularyPolicy.prospectSpecificProofNames.componentItemName"),
    'matrix and component proof records should use lane/prospect-specific names before stale generated names');

  assertCase(results, 'w414-returned-record-labels-preserved-by-runner',
    runner.includes('label: laneVocabularyPolicy && laneVocabularyPolicy.finalResultRoleLabels && laneVocabularyPolicy.finalResultRoleLabels.heroItem') &&
      runner.includes('label: roleLabel') &&
      runner.includes('label: String(label || \'\')') &&
      runner.includes('finalResultRoleLabels: laneVocabularyPolicy.finalResultRoleLabels'),
    'runner should attach labels into sidecar/capture/returned records');

  assertCase(results, 'w414-drawer-preserves-returned-labels',
    drawer.includes('label: firstNonBlank(source.consultantLabel, source.displayLabel, source.label, label)') &&
      drawer.includes('const finalRoleLabels = laneVocabularyPolicy.finalResultRoleLabels || {};') &&
      drawer.includes("normalizeDccFinalObject('hero_item', firstNonBlank(finalRoleLabels.heroItem, 'Hero item'), rootHero)") &&
      drawer.includes('consultantLabel: firstNonBlank(record.consultantLabel, record.displayLabel, record.label, modeAwareRecordLabelW216'),
    'drawer should preserve runner labels before falling back to generic mode-aware labels');

  assertCase(results, 'w414-filecabinet-drawer-mirror-synced',
    drawer === fileCabinetDrawer,
    'root userscript and FileCabinet mirror should match');

  assertCase(results, 'w414-herr-trace-food-lane-reviewed',
    first(herrTrace, ['selectedLane.id']) === 'food_beverage' &&
      first(herrTrace, ['dryRunObjectPacket.websitePackageClassifier.productSeed']) === 'Finished Good Variety Pack' &&
      first(herrTrace, ['state.integratedBuildRunnerResult.runnerParams.custscript_v3_runner_prospect']) === 'Herr Foods',
    JSON.stringify({
      lane: first(herrTrace, ['selectedLane.id']),
      productSeed: first(herrTrace, ['dryRunObjectPacket.websitePackageClassifier.productSeed']),
      prospect: first(herrTrace, ['state.integratedBuildRunnerResult.runnerParams.custscript_v3_runner_prospect'])
    }, null, 2));

  assertCase(results, 'w414-executable-cockpit-recommendation-documented',
    report.includes('Demo Cockpit') &&
      report.includes('story with embedded records') &&
      report.includes('top ROI point without scrolling') &&
      report.includes('competitive battlecard') &&
      report.includes('one primary post-run surface'),
    report.slice(0, 2400));

  assertCase(results, 'w414-no-boundary-regression-posture',
    report.includes('No live smoke was run') &&
      report.includes('No upload or deployment was performed') &&
      report.includes('No adapter, completed-result import validation, or Open-link authority behavior was changed') &&
      report.includes('N/LLM remains advisory-only'),
    report.slice(0, 1800));

  assertCase(results, 'w414-package-script-registered',
    pkg.scripts && pkg.scripts['harness:naming-and-executable-cockpit-review-w414'] === 'node archive/tools/run_w414_naming_and_executable_cockpit_review_harness.js',
    JSON.stringify(pkg.scripts && pkg.scripts['harness:naming-and-executable-cockpit-review-w414']));

  printResults('W414 naming and executable cockpit review harness', results);
}

main();
