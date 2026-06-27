#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..', '..');
const adapterRel = 'src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb_governed_runner_adapter_w144_suitelet.js';
const rootAdapterRel = 'netsuite/idb_governed_runner_adapter_w144_suitelet.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadAdapterTest(relPath) {
  const source = fs.readFileSync(path.join(repo, relPath), 'utf8');
  let moduleValue = null;
  const sandbox = {
    console,
    define(deps, factory) {
      moduleValue = factory(
        { accountId: 'TEST', getCurrentScript: () => ({ getParameter: () => '' }) },
        {},
        { audit() {}, error() {} },
        {},
        {}
      );
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: relPath });
  assert(moduleValue && moduleValue._test, `${relPath} did not expose _test`);
  return moduleValue._test;
}

const adapter = loadAdapterTest(adapterRel);
const rootAdapter = loadAdapterTest(rootAdapterRel);

const explicitPack = adapter.buildServerPrecomputedNamingPack({
  prospect: { name: 'Bose Dealer Audio Replenishment', website: 'https://www.bose.com' },
  precomputedNamingPack: {
    hero_item_name: 'Bose QuietComfort Ultra Headphones Case',
    assembly_name: 'Bose QuietComfort Ultra Headphones Kit',
    component_names: [
      'Bose QuietComfort Headphone Unit',
      'Bose Charging and Accessory Kit',
      'Bose Retail Audio Packaging'
    ],
    bom_name: 'BOM - Bose QuietComfort Ultra Headphones',
    bom_revision_name: 'Revision 1 - Bose QuietComfort Ultra Headphones',
    routing_name: 'Routing - Bose QuietComfort Ultra Headphones Kit'
  },
  websiteEvidence: {
    productNames: ['bose.com website evidence', 'Catalog Product', 'Products CPG']
  },
  demoPath: {
    laneId: 'dealer_hardgoods',
    productSeed: 'bose.com website evidence',
    scenario: 'dealer audio replenishment'
  },
  storyInputs: {
    buyerNeed: 'QuietComfort Ultra Headphones and SoundLink replenishment availability.'
  }
});

assert(explicitPack._source === 'suitelet-precomputed-naming-pack', 'explicit naming pack must be the adapter source');
assert(explicitPack.hero_item_name === 'Bose QuietComfort Ultra Headphones Case', 'explicit hero name must win over website evidence labels');
assert(explicitPack.component_names[0] === 'Bose QuietComfort Headphone Unit', 'explicit component names must be preserved');
assert(!/website evidence|Catalog Product|Products CPG/i.test(JSON.stringify({
  hero: explicitPack.hero_item_name,
  assembly: explicitPack.assembly_name,
  components: explicitPack.component_names,
  bom: explicitPack.bom_name
})), 'generic website evidence labels must not reach final names');
assert(explicitPack.industrySelection && /electronics|hardgoods|audio/i.test(explicitPack.industrySelection.label), 'industrySelection must carry website/LLM best-guess industry context');
assert(!Object.prototype.hasOwnProperty.call(explicitPack, 'selectedCatalogCandidate'), 'simple naming pack must not emit selectedCatalogCandidate');
assert(!Object.prototype.hasOwnProperty.call(explicitPack, 'fallbackUsed'), 'simple naming pack must not emit fallbackUsed');

const prospectFallback = adapter.buildServerPrecomputedNamingPack({
  prospect: { name: 'Acme Building Supply', website: 'https://example.invalid' },
  websiteEvidence: {
    productNames: ['Building Materials & Contractor Project Fulfillment', 'Product / SKU', 'Catalog Product']
  },
  demoPath: {
    laneId: 'building_materials',
    productSeed: 'Catalog Product',
    scenario: 'contractor project fulfillment'
  }
});

assert(prospectFallback._source === 'suitelet-prospect-fallback-naming-pack', 'missing explicit pack must use prospect fallback naming');
assert(prospectFallback.hero_item_name === 'Acme Building Supply Finished Good', 'prospect fallback hero name must be old-runner style');
assert(!/Catalog Product|Product \/ SKU|website evidence/i.test(JSON.stringify(prospectFallback)), 'prospect fallback must not copy generic product evidence into names');
assert(prospectFallback.industrySelection && prospectFallback.industrySelection.label, 'prospect fallback must still include industrySelection');

const rootPack = rootAdapter.buildServerPrecomputedNamingPack({
  prospect: { name: 'Le Creuset Retail Replenishment', website: 'https://www.lecreuset.com' },
  precomputedNamingPack: {
    heroItemName: 'Le Creuset Signature Dutch Oven Case',
    assemblyName: 'Le Creuset Signature Dutch Oven Set',
    componentNames: [
      'Le Creuset Cast Iron Oven Unit',
      'Le Creuset Lid and Knob Kit',
      'Le Creuset Retail Packaging'
    ],
    bomName: 'BOM - Le Creuset Signature Dutch Oven',
    bomRevisionName: 'Revision 1 - Le Creuset Signature Dutch Oven'
  },
  demoPath: { laneId: 'dealer_hardgoods', scenario: 'kitchenware fulfillment' }
});

assert(rootPack.hero_item_name === 'Le Creuset Signature Dutch Oven Case', 'root adapter copy must be synced to simple precomputed naming');
assert(rootPack.component_names[2] === 'Le Creuset Retail Packaging', 'root adapter copy must preserve component names');

console.log('W464 simple precomputed naming pack harness: passed');
