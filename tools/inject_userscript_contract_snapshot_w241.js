#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const snapshotOutPath = path.join(root, 'data', 'w241_embedded_contract_snapshot.json');
const { buildContractSnapshot, SNAPSHOT_VERSION } = require('../src/contracts/snapshot');

const BEGIN = '  // BEGIN GENERATED FORGE CONTRACT SNAPSHOT W241';
const END = '  // END GENERATED FORGE CONTRACT SNAPSHOT W241';

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = stable(value[key]);
      return out;
    }, {});
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(stable(value), null, 2);
}

function checksum(value) {
  return crypto.createHash('sha256').update(stableStringify(value)).digest('hex');
}

function buildEmbeddedSnapshot() {
  const snapshot = buildContractSnapshot({ snapshotVersion: SNAPSHOT_VERSION });
  const contentChecksum = checksum(snapshot);
  return Object.assign({}, snapshot, {
    embeddedForUserscript: true,
    generatedBy: 'tools/inject_userscript_contract_snapshot_w241.js',
    checksumAlgorithm: 'sha256-stable-json',
    checksum: contentChecksum
  });
}

function renderBlock(snapshot) {
  return [
    BEGIN,
    `  const FORGE_GENERATED_CONTRACT_SNAPSHOT_W241 = Object.freeze(${stableStringify(snapshot).replace(/\n/g, '\n  ')});`,
    END
  ].join('\n');
}

function inject(source, block) {
  if (source.includes(BEGIN) && source.includes(END)) {
    const start = source.indexOf(BEGIN);
    const end = source.indexOf(END) + END.length;
    return `${source.slice(0, start)}${block}${source.slice(end)}`;
  }
  const anchor = "  const FORGE_W240_CONTRACT_SNAPSHOT_VERSION = 'forge.contract-snapshot.w240.v1';";
  if (!source.includes(anchor)) {
    throw new Error('Unable to find W240 contract snapshot anchor in idb-drawer.user.js.');
  }
  return source.replace(anchor, `${block}\n\n${anchor}`);
}

function main() {
  const snapshot = buildEmbeddedSnapshot();
  const block = renderBlock(snapshot);
  const before = fs.readFileSync(userscriptPath, 'utf8');
  const after = inject(before, block);
  fs.mkdirSync(path.dirname(snapshotOutPath), { recursive: true });
  fs.writeFileSync(snapshotOutPath, `${stableStringify(snapshot)}\n`);
  if (after !== before) fs.writeFileSync(userscriptPath, after);
  console.log(`Injected ${snapshot.snapshotVersion} checksum ${snapshot.checksum}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  BEGIN,
  END,
  buildEmbeddedSnapshot,
  stableStringify,
  checksum,
  renderBlock,
  inject
};
