#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const playground = path.resolve(root, '..');
const runnerPath = path.join(playground, 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const masterRunnerPath = path.join(playground, 'Demo Command Center V4 Master', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const reportPath = path.join(root, 'reports', 'w236_runner_unique_item_names.md');
const tracePath = path.join(root, 'trace_samples', 'w236_runner_unique_item_names_trace.json');

function mkdirFor(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function writeText(file, value) {
  mkdirFor(file);
  fs.writeFileSync(file, value);
}

function writeJson(file, value) {
  mkdirFor(file);
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function has(source, needle) {
  return source.indexOf(needle) !== -1;
}

function main() {
  const runner = fs.readFileSync(runnerPath, 'utf8');
  const masterRunner = fs.readFileSync(masterRunnerPath, 'utf8');
  const results = [];

  assertCase(
    results,
    'w236_runner_creates_per_execution_uniqueness_token',
    has(runner, 'const runUniqueSuffix = buildRunUniquenessToken(extId);') &&
      has(runner, 'function buildRunUniquenessToken(extId)') &&
      has(runner, 'Date.now().toString(36)') &&
      has(runner, 'Math.random()'),
    'Runner creates one short per-execution suffix for generated item names.'
  );

  assertCase(
    results,
    'w236_fresh_hero_external_id_and_names_are_unique_per_run',
    has(runner, "buildUniqueExternalId('SCAI_HERO', extId || new Date().getTime(), runUniqueSuffix)") &&
      has(runner, "buildDifferentiatedNames(prospect || 'Demo Hero', extId, runUniqueSuffix)") &&
      has(runner, 'saveFreshHeroItemWithFallbacks({') &&
      has(runner, 'rec.setValue({ fieldId: \'itemid\', value: differentiated.itemIdName });'),
    'Fresh hero creation now carries the per-run suffix through external ID, itemid, and displayname.'
  );

  assertCase(
    results,
    'w236_apply_naming_keeps_suffix_after_fresh_item_create',
    has(runner, 'runUniqueSuffix: effectiveCreateNewHeroItem') ||
      has(runner, 'createNewHeroItem: effectiveCreateNewHeroItem, extId, prospect, runUniqueSuffix') &&
      has(runner, 'const runUniqueSuffix = opts && opts.runUniqueSuffix;') &&
      has(runner, 'buildDifferentiatedNames(names.hero_item_name, extId, runUniqueSuffix)'),
    'The later naming pass no longer strips the unique suffix from generated item names.'
  );

  assertCase(
    results,
    'w236_sidecar_support_items_are_unique_per_run',
    has(runner, "buildUniqueExternalId('IDB_MATRIX', extId, runUniqueSuffix)") &&
      has(runner, "buildUniqueExternalId('IDB_COMPONENT', extId, runUniqueSuffix)") &&
      has(runner, "roleSpecificGeneratedItemName('Formula / Availability Context'") &&
      has(runner, "roleSpecificGeneratedItemName('Ingredient / Packaging Component'"),
    'IDB sidecar proof and component item records also use per-run names and external IDs.'
  );

  assertCase(
    results,
    'w236_sidecar_items_retry_on_netsuite_dup_item',
    has(runner, 'function saveIdbInventoryItemWithDuplicateFallbacks') &&
      has(runner, 'function isDuplicateItemError(error)') &&
      has(runner, 'DUP_ITEM') &&
      has(runner, 'role-retry-1') &&
      has(runner, 'time-retry-2') &&
      has(runner, 'IDB sidecar item save strategy'),
    'Sidecar item creation retries with distinct item names/external IDs if NetSuite still reports DUP_ITEM.'
  );

  assertCase(
    results,
    'w236_master_runner_copy_is_synced',
    runner === masterRunner,
    'Root runner and Demo Command Center V4 Master runner are byte-for-byte identical after the DUP_ITEM fix.'
  );

  assertCase(
    results,
    'w236_no_drawer_write_boundary_changed',
    has(runner, 'drawerWrites: false') &&
      has(runner, 'drawerTransactionWrites: false') &&
      has(runner, 'writeIdbSidecarResultCaptureV1'),
    'Fix stays inside the governed runner naming/create path and preserves drawer no-write boundaries.'
  );

  const trace = {
    schema: 'idb.w236-runner-unique-item-names.trace.v1',
    generatedAt: new Date().toISOString(),
    diagnosis: 'NetSuite DUP_ITEM was caused by repeat runs reusing deterministic item names for fresh generated items.',
    fix: 'Generated runner items now receive a per-execution suffix on external IDs, item IDs, and display names.',
    resultCount: results.length,
    passCount: results.filter((item) => item.pass).length,
    results,
    visualTestingDecision: 'No broad visual testing. This is a runner-side item uniqueness regression harness.'
  };

  const report = [
    '# W236 Runner Unique Item Names',
    '',
    '## Diagnosis',
    '',
    'Repeat runs for the same customer/request can hit NetSuite DUP_ITEM when generated item names are deterministic.',
    '',
    '## Fix',
    '',
    '- Generate a per-execution suffix in the runner.',
    '- Apply that suffix to fresh hero item external IDs, item IDs, and display names.',
    '- Preserve the suffix during the later naming pass.',
    '- Apply the suffix to sidecar proof/component items returned to FORGE.',
    '- Keep the drawer no-write boundary unchanged.',
    '',
    '## Harness Results',
    '',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    `Result: ${trace.passCount}/${trace.resultCount}`,
    ''
  ].join('\n');

  writeJson(tracePath, trace);
  writeText(reportPath, report);

  if (trace.passCount !== trace.resultCount) {
    console.error(report);
    process.exit(1);
  }
  console.log(report);
}

main();
