#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const { assertCase, printResults, root } = require('./lib/forge_harness_fixtures');

function loadDrawerHooks() {
  const drawerPath = path.join(root, 'idb-drawer.user.js');
  return fs.readFileSync(drawerPath, 'utf8');
}

function loadAdapterHooks() {
  const adapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const modules = {
    'N/runtime': { accountId: 'TD3021666', getCurrentScript() { return { getParameter() { return ''; } }; } },
    'N/task': {},
    'N/log': { audit() {}, error() {}, debug() {} },
    'N/file': {},
    'N/search': { Sort: { DESC: 'DESC' }, createColumn(opts) { return opts || {}; }, create() { return { run() { return { getRange() { return []; } }; } }; } }
  };
  let exported = null;
  const sandbox = {
    console,
    JSON,
    Date,
    Math,
    RegExp,
    String,
    Number,
    Boolean,
    Array,
    Object,
    define(deps, factory) {
      exported = factory.apply(null, deps.map((dep) => modules[dep]));
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(adapterPath, 'utf8'), sandbox, { filename: adapterPath });
  if (!exported || !exported._test) throw new Error('Adapter hooks unavailable');
  return exported._test;
}

function main() {
  const drawerSource = loadDrawerHooks();
  const adapterHooks = loadAdapterHooks();
  const results = [];

  assertCase(results, 'w483-drawer-submit-time-visible-toggle-wiring',
    drawerSource.includes('function forceVisibleBuildTogglesForSubmitW483') &&
      drawerSource.includes("schema: 'idb.w483-submit-time-visible-toggle-authority.v1'") &&
      /prepareOneClickBuildRecordsPath[\s\S]{0,1200}forceVisibleBuildTogglesForSubmitW483/.test(drawerSource) &&
      /submitBuildRecordsOnce[\s\S]{0,2200}forceVisibleBuildTogglesForSubmitW483/.test(drawerSource) &&
      drawerSource.includes('if (patch.enableWip === true) patch.enableManufacturing = true;'),
    'Drawer must read live toggle DOM at submit time and force WIP to imply Manufacturing.');

  const normalized = adapterHooks.normalizeSelectedToggles({
    prospect: { name: 'W483 Hestan CopperBond WIP Harness' },
    selectedToggles: { createNewHeroItem: true, enableManufacturing: false, enableWip: false },
    storyInputs: {
      conversationNotes: 'Create CopperBond components, BOM, routing, operation names, work order, and WIP production steps.'
    },
    demoPath: { scenario: 'CopperBond WIP manufacturing proof' }
  });
  assertCase(results, 'w483-adapter-explicit-wip-text-recovers-toggles',
    normalized.createNewHeroItem === true &&
      normalized.enableManufacturing === true &&
      normalized.enableWip === true &&
      normalized.explicitIntentFallbackW483 &&
      normalized.explicitIntentFallbackW483.source === 'explicit_request_text_w483',
    JSON.stringify(normalized, null, 2));

  printResults('W483 WIP toggle handoff repair harness', results);
}

main();
