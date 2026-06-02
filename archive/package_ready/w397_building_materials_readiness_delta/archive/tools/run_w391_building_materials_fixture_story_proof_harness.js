#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w391_building_materials_fixture_story_proof.md');
const w386PackageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const w386PackageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');

const proofRoles = [
  'customer / contractor account',
  'job_order',
  'branch_item_availability',
  'special_order_or_substitution',
  'will_call_or_jobsite_delivery'
];

const storyTerms = [
  'contractor account demand',
  'job order readiness',
  'item availability by branch',
  'special order status',
  'will-call pickup',
  'jobsite delivery readiness',
  'substitutions',
  'margin leakage',
  'project fulfillment confidence'
];

const antiLeakTerms = [
  'dealer allocation',
  'channel fulfillment',
  'style/color/size variants',
  'store/ecommerce promise',
  'technician truck stock',
  'work order dispatch',
  'first-time fix',
  'warranty exposure',
  'clinic supply substitutes',
  'compliance-sensitive items',
  'QA release',
  'lot/release readiness',
  'expiration',
  'validation documentation',
  'traceability',
  'food batch',
  'ingredient readiness',
  'packaging readiness',
  'promotion ship confidence',
  'QA/lot readiness',
  'configured assembly',
  'component lead time',
  'build/test/inspection readiness',
  'engineering BOM'
];

const baselineLanes = [
  'Dealer Hardgoods',
  'Apparel/Retail',
  'Parts/Service',
  'Medical/Dental',
  'Food/Beverage',
  'Industrial Equipment',
  'Life Sciences'
];

function exists(filePath) {
  return fs.existsSync(filePath);
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function rootPath(relPath) {
  return path.join(root, relPath);
}

function packageJson() {
  return JSON.parse(read(rootPath('package.json')));
}

function walkFiles(dir, prefix = '') {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath, rel) : [rel];
  });
}

function main() {
  const results = [];
  const report = exists(reportPath) ? read(reportPath) : '';
  const w390 = exists(rootPath('archive/reports/w390_fixture_first_expansion_restart.md'))
    ? read(rootPath('archive/reports/w390_fixture_first_expansion_restart.md'))
    : '';
  const w389 = exists(rootPath('archive/reports/w389_runtime_release_decision_gate.md'))
    ? read(rootPath('archive/reports/w389_runtime_release_decision_gate.md'))
    : '';
  const scripts = packageJson().scripts || {};
  const packageReadyFiles = walkFiles(rootPath('archive/package_ready'));
  const runtimeUploadArtifacts = packageReadyFiles.filter((file) =>
    /runtime|upload|deployment|filecabinet/i.test(file) &&
    !/^w386_forge_source_pack_ready_artifact\//.test(file)
  );

  assertCase(results, 'w391-w390-expansion-restart-preserved',
    w390.includes('Proceed with Building Materials / Contractor Supply as the next fixture-first lane') &&
      report.includes('Use W390 Fixture-First Expansion Restart and Next-Lane Selection as the locked expansion-restart baseline') &&
      report.includes('Keystone Building Supply'),
    JSON.stringify({ w390: w390.slice(0, 1400), report: report.slice(0, 1400) }, null, 2));

  assertCase(results, 'w391-w389-routing-baseline-preserved',
    w389.includes('Recommended path: Resume fixture-first industry expansion') &&
      report.includes('W389 routed work back to fixture-first expansion') &&
      report.includes('No runtime upload package was created'),
    JSON.stringify({ w389: w389.slice(0, 1400), report: report.slice(0, 1800) }, null, 2));

  assertCase(results, 'w391-w386-evidence-package-preserved',
    exists(w386PackageDir) &&
      exists(w386PackageZip) &&
      exists(path.join(w386PackageDir, 'PACKAGE_FILE_LIST_W386.txt')) &&
      report.includes('Do not mutate the W386 source-pack readiness evidence package'),
    JSON.stringify({ w386PackageDir, w386PackageZip }, null, 2));

  assertCase(results, 'w391-no-runtime-upload-package',
    runtimeUploadArtifacts.length === 0 &&
      report.includes('No runtime upload package was created'),
    JSON.stringify(runtimeUploadArtifacts, null, 2));

  assertCase(results, 'w391-no-live-smoke-no-upload-boundary',
    /No live smoke in W391/i.test(report) &&
      /No upload or deployment/i.test(report) &&
      /Do not upload or deploy/i.test(report),
    report.slice(0, 2500));

  assertCase(results, 'w391-building-materials-story-distinctness',
    storyTerms.every((term) => report.includes(term)) &&
      report.includes('protect job promise confidence and margin') &&
      report.includes('contractor commitment'),
    JSON.stringify(storyTerms, null, 2));

  assertCase(results, 'w391-expected-proof-role-coverage',
    proofRoles.every((role) => report.includes(role)) &&
      report.includes('Keystone Contractor Account') &&
      report.includes('Keystone Job Order') &&
      report.includes('Keystone Branch Item Availability'),
    JSON.stringify(proofRoles, null, 2));

  assertCase(results, 'w391-roi-competitive-flow-preserved',
    report.includes('Largest value to prove') &&
      report.includes('Discovery') &&
      report.includes('Proof move') &&
      report.includes('Competitive watch-out') &&
      report.includes('Claim caution') &&
      report.includes('measured savings require a customer baseline'),
    report.slice(0, 6000));

  assertCase(results, 'w391-run-path-open-link-authority-preserved',
    report.includes('Run path remains numbered') &&
      report.includes('verified Open-link authority') &&
      report.includes('https://td3021666.app.netsuite.com/app/') &&
      report.includes('fixture proof, not live smoke') &&
      report.includes('No fake Open links'),
    report.slice(0, 7000));

  assertCase(results, 'w391-collapse-posture-preserved',
    report.includes('Imported proof records remain collapsed by default') &&
      report.includes('Support and receipt surfaces remain lane-consistent and collapsed') &&
      report.includes('proof guardrails remain visible when expanded'),
    report.slice(0, 8000));

  assertCase(results, 'w391-cross-lane-anti-leak-wording',
    antiLeakTerms.every((term) => report.includes(term)) &&
      baselineLanes.every((lane) => report.includes(lane)) &&
      report.includes('Do not collapse into generic industrial distribution'),
    JSON.stringify({ antiLeakTerms, baselineLanes }, null, 2));

  assertCase(results, 'w391-confidence-source-separation',
    report.includes('Public website/category evidence') &&
      report.includes('messy notes') &&
      report.includes('advisory inference') &&
      report.includes('build/import proof') &&
      report.includes('Open-link authority') &&
      report.includes('N/LLM remains advisory-only'),
    report.slice(0, 8500));

  assertCase(results, 'w391-no-source-pack-mutation',
    report.includes('No source-pack mutation was made in W391') &&
      report.includes('Do not add Building Materials to runtime source packs in W391') &&
      report.includes('fixture/story proof only'),
    report.slice(0, 9000));

  assertCase(results, 'w391-preservation-scripts-registered',
    typeof scripts['harness:building-materials-fixture-story-proof-w391'] === 'string' &&
      typeof scripts['harness:fixture-first-expansion-restart-w390'] === 'string' &&
      typeof scripts['harness:runtime-release-decision-gate-w389'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify(scripts, null, 2).slice(0, 2000));

  assertCase(results, 'w391-no-regression-gates',
    report.includes('No package mutation') &&
      report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes') &&
      report.includes('No new drawer transaction write paths') &&
      report.includes('No broad abstractions'),
    report.slice(-3500));

  printResults('W391 Building Materials fixture-first story proof harness', results);
}

main();
