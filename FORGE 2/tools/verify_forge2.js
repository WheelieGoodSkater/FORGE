#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const files = [
  'tampermonkey/forge2-sidecar.user.js',
  'FileCabinet/SuiteScripts/FORGE 2/scai_ss_so_csv_runner_forge2_v1_12_13.js',
  'Objects/customscript_scai_forge2_runner.xml',
  'README.md'
];

let failed = false;

function checkExists(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    console.error(`missing: ${rel}`);
    failed = true;
    return false;
  }
  console.log(`ok: ${rel}`);
  return true;
}

function run(label, cmd, args) {
  const result = spawnSync(cmd, args, { cwd: path.resolve(root, '..'), encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(`failed: ${label}`);
    if (result.stdout) console.error(result.stdout);
    if (result.stderr) console.error(result.stderr);
    failed = true;
  } else {
    console.log(`ok: ${label}`);
  }
}

for (const file of files) checkExists(file);

run('sidecar syntax', 'node', ['--check', path.join(root, 'tampermonkey/forge2-sidecar.user.js')]);
run('runner syntax', 'node', ['--check', path.join(root, 'FileCabinet/SuiteScripts/FORGE 2/scai_ss_so_csv_runner_forge2_v1_12_13.js')]);
run('object xml', 'xmllint', ['--noout', path.join(root, 'Objects/customscript_scai_forge2_runner.xml')]);

if (failed) process.exit(1);
console.log('FORGE 2 local setup is ready.');
