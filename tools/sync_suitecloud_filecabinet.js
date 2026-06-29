#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const targetDir = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder');

const files = [
  {
    source: path.join(root, 'idb-drawer.user.js'),
    target: path.join(targetDir, 'idb-drawer.user.js')
  },
  {
    source: path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js'),
    target: path.join(targetDir, 'idb_governed_runner_adapter_w144_suitelet.js')
  },
  {
    source: path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js'),
    target: path.join(targetDir, 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js')
  },
  {
    source: path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_sidecar_oldcore_roi_competitive_w472.js'),
    target: path.join(targetDir, 'scai_ss_so_csv_runner_sidecar_oldcore_roi_competitive_w472.js')
  },
  {
    source: path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_oldcore_simple_sidecar_w482.js'),
    target: path.join(targetDir, 'scai_ss_so_csv_runner_oldcore_simple_sidecar_w482.js')
  },
  {
    source: path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_forge_clean_w483.js'),
    target: path.join(targetDir, 'scai_ss_so_csv_runner_forge_clean_w483.js')
  }
];

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

fs.mkdirSync(targetDir, { recursive: true });

files.forEach(({ source, target }) => {
  fs.copyFileSync(source, target);
  const sourceHash = sha256(source);
  const targetHash = sha256(target);
  const relativeTarget = path.relative(root, target);
  if (sourceHash !== targetHash) {
    throw new Error(`Hash mismatch after copying ${relativeTarget}`);
  }
  console.log(`${relativeTarget} ${targetHash}`);
});
