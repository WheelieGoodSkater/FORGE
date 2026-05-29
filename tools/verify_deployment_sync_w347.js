#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const mirrorDir = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder');

const EXPECTED_DRAWER_VERSION = '1.0.4';
const EXPECTED_VISIBLE_MARKER = 'Drawer 1.0.4 / W346';
const RAW_USERSCRIPT_URL = 'https://raw.githubusercontent.com/WheelieGoodSkater/FORGE/main/idb-drawer.user.js';

const TARGETS = [
  {
    id: 'drawer',
    label: 'Tampermonkey drawer',
    rootPath: path.join(root, 'idb-drawer.user.js'),
    mirrorPath: path.join(mirrorDir, 'idb-drawer.user.js'),
    downloadArgs: ['drawer-download', 'drawer'],
    updatePath: 'GitHub push updates Tampermonkey; SuiteCloud deploy only updates the NetSuite File Cabinet mirror.'
  },
  {
    id: 'adapter',
    label: 'Governed runner adapter Suitelet',
    rootPath: path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js'),
    mirrorPath: path.join(mirrorDir, 'idb_governed_runner_adapter_w144_suitelet.js'),
    downloadArgs: ['adapter-download', 'adapter'],
    updatePath: 'SuiteCloud Deploy Project is required to update NetSuite runtime/File Cabinet.'
  },
  {
    id: 'runner',
    label: 'SCAI SO CSV runner Scheduled Script',
    rootPath: path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js'),
    mirrorPath: path.join(mirrorDir, 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js'),
    downloadArgs: ['runner-download', 'runner'],
    updatePath: 'SuiteCloud Deploy Project is required to update NetSuite runtime/File Cabinet.'
  }
];

function parseArgs(argv) {
  const args = {
    downloads: {},
    json: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--json') {
      args.json = true;
      continue;
    }
    if (!token || !token.startsWith('--')) continue;

    let key = token.slice(2);
    let value = '';
    const equalsIndex = key.indexOf('=');
    if (equalsIndex >= 0) {
      value = key.slice(equalsIndex + 1);
      key = key.slice(0, equalsIndex);
    } else if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
      value = argv[i + 1];
      i += 1;
    }

    if (value) args.downloads[key] = path.resolve(value);
  }

  return args;
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function rel(filePath) {
  return path.relative(root, filePath) || '.';
}

function findDownloadPath(target, downloads) {
  for (const key of target.downloadArgs) {
    if (downloads[key]) return downloads[key];
  }
  return null;
}

function fileResult(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      exists: false,
      path: filePath,
      relativePath: rel(filePath),
      sha256: null
    };
  }

  return {
    exists: true,
    path: filePath,
    relativePath: rel(filePath),
    sha256: sha256(filePath)
  };
}

function drawerMetadataChecks(rootText, mirrorText) {
  const checks = [
    {
      id: 'drawer_version_marker',
      pass: new RegExp(`@version\\s+${EXPECTED_DRAWER_VERSION.replace('.', '\\.')}`).test(rootText) &&
        new RegExp(`@version\\s+${EXPECTED_DRAWER_VERSION.replace('.', '\\.')}`).test(mirrorText),
      expected: `@version ${EXPECTED_DRAWER_VERSION}`
    },
    {
      id: 'visible_w346_marker',
      pass: rootText.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.4';") &&
        rootText.includes("const CURRENT_UX_BLOCK_W346 = 'W346';") &&
        rootText.includes('return `Drawer ${DRAWER_USERSCRIPT_VERSION} / ${CURRENT_UX_BLOCK_W346}`;') &&
        mirrorText.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.4';") &&
        mirrorText.includes("const CURRENT_UX_BLOCK_W346 = 'W346';") &&
        mirrorText.includes('return `Drawer ${DRAWER_USERSCRIPT_VERSION} / ${CURRENT_UX_BLOCK_W346}`;'),
      expected: EXPECTED_VISIBLE_MARKER
    },
    {
      id: 'update_url',
      pass: rootText.includes(`@updateURL    ${RAW_USERSCRIPT_URL}`) &&
        mirrorText.includes(`@updateURL    ${RAW_USERSCRIPT_URL}`),
      expected: RAW_USERSCRIPT_URL
    },
    {
      id: 'download_url',
      pass: rootText.includes(`@downloadURL  ${RAW_USERSCRIPT_URL}`) &&
        mirrorText.includes(`@downloadURL  ${RAW_USERSCRIPT_URL}`),
      expected: RAW_USERSCRIPT_URL
    }
  ];

  return checks;
}

function verifyTarget(target, downloads) {
  const rootFile = fileResult(target.rootPath);
  const mirrorFile = fileResult(target.mirrorPath);
  const downloadPath = findDownloadPath(target, downloads);
  const downloadedFile = downloadPath ? fileResult(downloadPath) : null;
  const checks = [];

  checks.push({
    id: `${target.id}_root_exists`,
    pass: rootFile.exists,
    detail: rootFile.relativePath
  });
  checks.push({
    id: `${target.id}_mirror_exists`,
    pass: mirrorFile.exists,
    detail: mirrorFile.relativePath
  });

  if (rootFile.exists && mirrorFile.exists) {
    checks.push({
      id: `${target.id}_root_mirror_hash_match`,
      pass: rootFile.sha256 === mirrorFile.sha256,
      detail: `${rootFile.sha256} == ${mirrorFile.sha256}`
    });
  }

  if (downloadedFile) {
    checks.push({
      id: `${target.id}_download_exists`,
      pass: downloadedFile.exists,
      detail: downloadedFile.relativePath
    });
    if (rootFile.exists && downloadedFile.exists) {
      checks.push({
        id: `${target.id}_download_hash_match`,
        pass: rootFile.sha256 === downloadedFile.sha256,
        detail: `${rootFile.sha256} == ${downloadedFile.sha256}`
      });
    }
  }

  if (target.id === 'drawer' && rootFile.exists && mirrorFile.exists) {
    checks.push(...drawerMetadataChecks(readText(target.rootPath), readText(target.mirrorPath)));
  }

  return {
    id: target.id,
    label: target.label,
    updatePath: target.updatePath,
    root: rootFile,
    mirror: mirrorFile,
    downloaded: downloadedFile || {
      exists: false,
      path: null,
      relativePath: 'not_provided',
      sha256: null
    },
    checks,
    pass: checks.every((check) => check.pass === true)
  };
}

function runVerification(options = {}) {
  const downloads = options.downloads || {};
  const targets = TARGETS.map((target) => verifyTarget(target, downloads));
  const report = {
    block: 'W347',
    baseline: {
      drawerVersion: EXPECTED_DRAWER_VERSION,
      visibleMarker: EXPECTED_VISIBLE_MARKER
    },
    status: targets.every((target) => target.pass) ? 'PASS' : 'FAIL',
    targets
  };
  return report;
}

function printHuman(report) {
  console.log(`W347 deployment sync guard: ${report.status}`);
  console.log(`Baseline: ${report.baseline.visibleMarker}`);
  report.targets.forEach((target) => {
    const downloadStatus = target.downloaded.path ? target.downloaded.sha256 : 'not_provided';
    console.log(`${target.pass ? 'PASS' : 'FAIL'} ${target.id}`);
    console.log(`  root   ${target.root.relativePath} ${target.root.sha256 || 'missing'}`);
    console.log(`  mirror ${target.mirror.relativePath} ${target.mirror.sha256 || 'missing'}`);
    console.log(`  live   ${target.downloaded.relativePath} ${downloadStatus}`);
    console.log(`  update ${target.updatePath}`);
    target.checks
      .filter((check) => !check.pass)
      .forEach((check) => console.log(`  ! ${check.id}: ${check.detail || check.expected || 'failed'}`));
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = runVerification({ downloads: args.downloads });

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHuman(report);
  }

  if (report.status !== 'PASS') {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  EXPECTED_DRAWER_VERSION,
  EXPECTED_VISIBLE_MARKER,
  RAW_USERSCRIPT_URL,
  TARGETS,
  parseArgs,
  runVerification
};
