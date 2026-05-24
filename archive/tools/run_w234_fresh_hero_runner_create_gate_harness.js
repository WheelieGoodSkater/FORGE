#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const drawerRoot = path.resolve(__dirname, '..');
const playgroundRoot = path.resolve(drawerRoot, '..');
const primaryRunnerPath = path.join(playgroundRoot, 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const dccRunnerPath = path.join(playgroundRoot, 'Demo Command Center V4 Master', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const reportPath = path.join(drawerRoot, 'reports', 'w234_fresh_hero_runner_create_gate.md');
const tracePath = path.join(drawerRoot, 'trace_samples', 'w234_fresh_hero_runner_create_gate_trace.json');

function mkdirFor(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function writeJson(file, value) {
  mkdirFor(file);
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value) {
  mkdirFor(file);
  fs.writeFileSync(file, value);
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function inspectRunner(file) {
  const source = fs.readFileSync(file, 'utf8');
  const createFreshBlock = source.slice(
    source.indexOf('function createFreshHeroItem'),
    source.indexOf('function applyFreshHeroPersistence')
  );
  return {
    file,
    hasOldThrow: /Fresh hero mode requires custscript_v3_runner_hero_item/.test(source),
    hasRunnerCreateHandshake: /handshakeAction\s*=\s*['"]fresh-mode-runner-create['"]/.test(source),
    freshHeroCanCreateWithoutPassedItem: /function getOrCreateFreshHeroItem[\s\S]*?if \(passedHeroItemId\)[\s\S]*?const created = createFreshHeroItem/.test(source),
    ensureDemoRecordsUsesFreshCreate: /createNewHeroItem\s*\?\s*getOrCreateFreshHeroItem/.test(source),
    hasFreshHeroSaveFallbackLadder: /function saveFreshHeroItemWithFallbacks/.test(source) &&
      /copy-anchor-subsidiary-array/.test(source) &&
      /scratch-subsidiary-array/.test(source) &&
      /scratch-no-subsidiary/.test(source),
    avoidsForcedBodyLocationOnCreate: /Do not force a body location while creating the fresh item/.test(source) &&
      !/if \(locationId\) safeTry\(\(\) => rec\.setValue\(\{ fieldId: 'location', value: Number\(locationId\) \}\)\);/.test(createFreshBlock),
    syntaxLooksScheduledScript: /@NScriptType ScheduledScript/.test(source) && /function execute/.test(source)
  };
}

function main() {
  const results = [];
  const primary = inspectRunner(primaryRunnerPath);
  const dcc = inspectRunner(dccRunnerPath);
  const runners = [primary, dcc];

  runners.forEach((runner, index) => {
    const suffix = index === 0 ? 'primary_runner' : 'dcc_master_runner';
    assertCase(results, `w234_${suffix}_does_not_throw_before_create`, runner.hasOldThrow === false, JSON.stringify(runner));
    assertCase(results, `w234_${suffix}_uses_runner_create_handshake`, runner.hasRunnerCreateHandshake === true, JSON.stringify(runner));
    assertCase(results, `w234_${suffix}_fresh_mode_reaches_create_path`, runner.freshHeroCanCreateWithoutPassedItem === true && runner.ensureDemoRecordsUsesFreshCreate === true, JSON.stringify(runner));
    assertCase(results, `w234_${suffix}_has_subsidiary_location_save_fallbacks`, runner.hasFreshHeroSaveFallbackLadder === true && runner.avoidsForcedBodyLocationOnCreate === true, JSON.stringify(runner));
    assertCase(results, `w234_${suffix}_scheduled_script_shape_preserved`, runner.syntaxLooksScheduledScript === true, JSON.stringify(runner));
  });

  const trace = {
    schema: 'idb.w234-fresh-hero-runner-create-gate.trace.v1',
    generatedAt: new Date().toISOString(),
    primaryRunnerPath,
    dccRunnerPath,
    resultCount: results.length,
    passCount: results.filter((item) => item.pass).length,
    inspections: runners,
    results
  };
  const report = [
    '# W234 Fresh Hero Runner Create Gate',
    '',
    `Generated: ${trace.generatedAt}`,
    '',
    '## Diagnosis',
    'The W144 adapter now correctly passes Create new item to the DCC runner. The runner still had an old pre-create guard that rejected fresh hero mode when no hero item id was passed, even though the runner owns a createFreshHeroItem path.',
    '',
    '## Fix Contract',
    '- Create new item true may enter fresh hero mode without custscript_v3_runner_hero_item.',
    '- When no passed or inferred hero item exists, the runner uses handshakeAction fresh-mode-runner-create.',
    '- The runner-owned getOrCreateFreshHeroItem path creates the fresh inventory item.',
    '- Fresh item creation avoids forcing body location and falls back when copied anchor subsidiary/location restrictions are incompatible.',
    '- FORGE and W144 still do not create drawer records or transaction writes.',
    '',
    '## Results',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}`),
    ''
  ].join('\n');

  writeJson(tracePath, trace);
  writeText(reportPath, report);

  const failed = results.filter((item) => !item.pass);
  console.log(`W234 fresh hero runner create gate harness: ${failed.length ? 'FAIL' : 'PASS'} (${results.length - failed.length}/${results.length})`);
  if (failed.length) {
    failed.forEach((item) => console.error(`${item.id}: ${item.evidence}`));
    process.exit(1);
  }
}

main();
