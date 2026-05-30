#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults,
  read,
  readArchiveText,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

const {
  EXPECTED_VISIBLE_MARKER,
  runVerification
} = require('../../tools/verify_deployment_sync_w347');

const root = path.resolve(__dirname, '..', '..');

function packageJson() {
  return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
}

function main() {
  const results = [];
  const userscript = read(userscriptPath);
  const report = readArchiveText('reports', 'w347_deployment_sync_guard.md');
  const local = runVerification();
  const downloadMatch = runVerification({
    downloads: {
      'drawer-download': path.join(root, 'idb-drawer.user.js'),
      'adapter-download': path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js'),
      'runner-download': path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js')
    }
  });
  const missingDownload = runVerification({
    downloads: {
      'drawer-download': path.join(root, 'archive', 'missing-w347-download.js')
    }
  });
  const pkg = packageJson();

  assertCase(results, 'w347-local-root-mirror-hash-guard-passes',
    local.status === 'PASS' &&
      local.targets.length === 3 &&
      local.targets.every((target) => target.root.sha256 && target.root.sha256 === target.mirror.sha256),
    JSON.stringify(local.targets.map((target) => ({ id: target.id, pass: target.pass, hash: target.root.sha256 }))));

  assertCase(results, 'w347-download-comparison-gate-passes-when-files-match',
    downloadMatch.status === 'PASS' &&
      downloadMatch.targets.every((target) => target.downloaded.exists === true && target.downloaded.sha256 === target.root.sha256),
    JSON.stringify(downloadMatch.targets.map((target) => ({ id: target.id, downloaded: target.downloaded.sha256 }))));

  assertCase(results, 'w347-download-comparison-fails-when-provided-file-missing',
    missingDownload.status === 'FAIL' &&
      missingDownload.targets.find((target) => target.id === 'drawer').pass === false,
    JSON.stringify(missingDownload.targets.find((target) => target.id === 'drawer')));

  assertCase(results, 'w347-drawer-baseline-and-auto-update-metadata-locked',
    userscript.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.6';") &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W353';") &&
      userscript.includes('return `Drawer ${DRAWER_USERSCRIPT_VERSION} / ${CURRENT_UX_BLOCK_W346}`;') &&
      /@version\s+1\.0\.6/.test(userscript) &&
      /@updateURL\s+https:\/\/raw\.githubusercontent\.com\/WheelieGoodSkater\/FORGE\/main\/idb-drawer\.user\.js/.test(userscript) &&
      /@downloadURL\s+https:\/\/raw\.githubusercontent\.com\/WheelieGoodSkater\/FORGE\/main\/idb-drawer\.user\.js/.test(userscript),
    EXPECTED_VISIBLE_MARKER);

  assertCase(results, 'w347-report-covers-operator-checklist-and-update-paths',
    /Operator Checklist Before Every Smoke/.test(report) &&
      /GitHub push updates Tampermonkey/.test(report) &&
      /SuiteCloud Deploy Project/.test(report) &&
      /--adapter-download/.test(report) &&
      /--runner-download/.test(report),
    report.slice(0, 1400));

  assertCase(results, 'w347-report-preserves-no-regression-boundaries',
    /Preserve W151/.test(report) &&
      /Preserve W214/.test(report) &&
      /Preserve W245/.test(report) &&
      /Preserve W341 and W342/.test(report) &&
      /Preserve W344 and W345/.test(report) &&
      /Preserve W346/.test(report) &&
      /Do not change runner, adapter, record creation behavior, import validation, or drawer write authority/.test(report),
    'W347 report protects prior gates');

  assertCase(results, 'w347-package-script-registration-present',
    pkg.scripts['deploy:verify-sync-w347'] === 'node tools/verify_deployment_sync_w347.js' &&
      pkg.scripts['harness:deployment-sync-guard-w347'] === 'node archive/tools/run_w347_deployment_sync_guard_harness.js' &&
      /run_w347_deployment_sync_guard_harness/.test(pkg.scripts.check) &&
      /verify_deployment_sync_w347/.test(pkg.scripts.check),
    JSON.stringify({
      verify: pkg.scripts['deploy:verify-sync-w347'],
      harness: pkg.scripts['harness:deployment-sync-guard-w347']
    }));

  printResults('W347 deployment sync guard harness', results);
}

main();
