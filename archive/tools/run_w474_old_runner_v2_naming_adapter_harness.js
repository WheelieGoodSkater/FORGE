#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const runnerRel = path.join('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const runnerPath = path.join(root, runnerRel);

function loadRunnerHooks() {
  const source = fs.readFileSync(runnerPath, 'utf8');
  let moduleValue = null;
  const stub = {};
  const sandbox = {
    console,
    define(deps, factory) {
      moduleValue = factory(
        { getCurrentScript: () => ({ getParameter: () => '' }) },
        { audit() {}, error() {}, debug() {} },
        stub,
        stub,
        stub,
        stub,
        stub
      );
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: runnerRel });
  if (!moduleValue || !moduleValue.__W474_TEST_HOOKS__) throw new Error('Missing W474 test hooks');
  return moduleValue.__W474_TEST_HOOKS__;
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail });
}

function noBlockedText(pack) {
  const body = JSON.stringify(pack).toLowerCase();
  return !/product availability sku|food and beverage.*fender|mp4|media asset|shop now|learn more|cta|navigation/.test(body);
}

function main() {
  const hooks = loadRunnerHooks();
  const results = [];
  const fender = hooks.oldRunnerV2NamingAdapterW474({
    selectedProductName: 'Product Availability SKU',
    hero_item_name: 'Product Availability SKU',
    component_names: ['Shop Now', 'hero.mp4', 'Learn More']
  }, {
    prospect: 'Fender',
    website: 'https://www.fender.com/',
    signalText: 'Fender guitars, basses, amplifiers and accessories.',
    notes: 'guitars and amplifiers; dealer availability pressure',
    enableManufacturing: true,
    enableWip: true
  });
  const dyson = hooks.oldRunnerV2NamingAdapterW474({
    selectedProductName: 'launch-video.mp4'
  }, {
    prospect: 'Dyson',
    website: 'https://www.dyson.com/',
    signalText: 'Vacuum cleaners, air purifiers, hair care appliances.',
    notes: 'premium appliance channel allocation',
    enableManufacturing: false,
    enableWip: false
  });
  const hermanMiller = hooks.oldRunnerV2NamingAdapterW474({}, {
    prospect: 'Herman Miller',
    website: 'https://www.hermanmiller.com/',
    signalText: 'Aeron chairs, Embody chairs, ergonomic office furniture.',
    notes: 'furniture contract readiness',
    enableManufacturing: true,
    enableWip: false
  });

  assertCase(results, 'w474_fender_music_identity',
    fender.industrySelection.label === 'Musical Instruments Manufacturing' &&
      fender.selectedProductName === 'Stratocaster Guitar' &&
      fender.scenario_label === 'Stratocaster Guitar Scenario' &&
      fender.routing_name === 'Routing - Stratocaster Guitar',
    JSON.stringify({ industry: fender.industrySelection, product: fender.selectedProductName, scenario: fender.scenario_label, routing: fender.routing_name }));

  assertCase(results, 'w474_fender_blocks_weak_labels',
    noBlockedText(fender) && fender.component_names.every((name) => /Stratocaster Guitar/.test(name)),
    JSON.stringify({ product: fender.selectedProductName, components: fender.component_names }));

  assertCase(results, 'w474_dyson_appliance_not_media_or_food',
    fender.industrySelection.label !== 'Food and Beverage' &&
      dyson.industrySelection.label === 'Premium Home Appliance Manufacturing' &&
      /Vacuum|Airwrap/.test(dyson.selectedProductName) &&
      dyson.flow_label === 'Distribution / Inventory' &&
      noBlockedText(dyson),
    JSON.stringify({ industry: dyson.industrySelection, product: dyson.selectedProductName, flow: dyson.flow_label }));

  assertCase(results, 'w474_herman_miller_furniture_mfg_no_wip',
    hermanMiller.industrySelection.label === 'Furniture Manufacturing' &&
      /Chair/.test(hermanMiller.selectedProductName) &&
      hermanMiller.assembly_name === `${hermanMiller.selectedProductName} Assembly` &&
      hermanMiller.flow_label === `${hermanMiller.selectedProductName} Production Readiness`,
    JSON.stringify({ industry: hermanMiller.industrySelection, product: hermanMiller.selectedProductName, assembly: hermanMiller.assembly_name, flow: hermanMiller.flow_label }));

  assertCase(results, 'w474_old_runner_object_syntax',
    [fender, dyson, hermanMiller].every((pack) =>
      pack.bom_name === `BOM - ${pack.selectedProductName}` &&
      pack.bom_revision_name === `Revision 1 - ${pack.selectedProductName}` &&
      pack.routing_name === `Routing - ${pack.selectedProductName}` &&
      pack.operation_names_by_seq &&
      pack.operation_names_by_seq['10'] &&
      pack.operation_names_by_seq['20'] &&
      pack.operation_names_by_seq['30']
    ),
    JSON.stringify([fender, dyson, hermanMiller].map((pack) => ({
      product: pack.selectedProductName,
      bom: pack.bom_name,
      revision: pack.bom_revision_name,
      routing: pack.routing_name,
      ops: pack.operation_names_by_seq
    }))));

  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.name} | ${result.detail}`);
  });
  const failed = results.filter((result) => !result.pass);
  if (failed.length) process.exit(1);
}

main();
