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

function names(list) {
  return (list || []).map((item) => item && item.name).filter(Boolean);
}

const adapter = loadAdapterTest(adapterRel);
const rootAdapter = loadAdapterTest(rootAdapterRel);

[
  'Building Materials & Contractor Project Fulfillment',
  'Dealer Hardgoods & Channel Fulfillment',
  'Product / SKU',
  'Contractor Job Order',
  'Dealer Channel Availability',
  'Industrial Equipment Manufacturing',
  'WIP Line-Flow Readiness',
  'Catalog Product',
  'Apparel & Accessories',
  'Apparel and Footwear Style',
  'Core Style Color-Size Matrix',
  'Style / SKU Matrix',
  'Dealer Durable Hardgoods',
  'websiteResolverServiceV1',
  'Needs Confirmation'
].forEach((blockedName) => {
  assert(
    adapter.selectedCatalogCandidateRejectedReasonW464(blockedName, { prospect: 'Acme Supply' }),
    `${blockedName} must be rejected as a selected catalog candidate`
  );
});

const ranked = adapter.rankCatalogCandidatesW457([
  { name: 'Dealer Hardgoods & Channel Fulfillment', source: 'website_nav', confidence: 99, reasons: ['lane label'] },
  { name: 'Rambler 20 oz Tumbler', source: 'website_product_list', confidence: 60, reasons: ['public product card'] }
], {
  website: 'https://www.yeti.com',
  scenario: 'dealer hardgoods channel fulfillment',
  prospect: 'YETI'
});

assert(ranked[0] && ranked[0].name === 'Rambler 20 oz Tumbler', 'real YETI product-line candidate must outrank lane label');
assert(names(ranked.rejectedCatalogCandidates).includes('Dealer Hardgoods & Channel Fulfillment'), 'lane label rejection must be visible');

const genericOnlyPack = adapter.buildServerPrecomputedNamingPack({
  prospect: { name: 'Acme Building Supply', website: 'https://example.invalid' },
  websiteEvidence: {
    productNames: [
      'Building Materials & Contractor Project Fulfillment',
      'Product / SKU',
      'Contractor Job Order',
      'Dealer Channel Availability',
      'Acme Building Supply'
    ]
  },
  productCandidate: 'Catalog Product',
  demoPath: {
    laneId: 'building_materials',
    productSeed: 'Dealer Channel Availability',
    scenario: 'contractor project fulfillment'
  },
  storyInputs: {
    buyerNeed: 'contractor job order readiness',
    scObjective: 'prove project fulfillment availability'
  }
});

assert(genericOnlyPack.fallbackUsed === true, 'generic-only evidence must use fallback');
assert(genericOnlyPack.selectedCatalogCandidate === null, 'fallback must not select a catalog candidate');
assert(Array.isArray(genericOnlyPack.catalogCandidates) && genericOnlyPack.catalogCandidates.length === 0, 'fallback must expose empty accepted catalogCandidates');
assert(genericOnlyPack.selectedProductName === null, 'fallback must not expose Catalog Product as selectedProductName');
assert(genericOnlyPack.primary_product_candidate === null, 'fallback must not expose Catalog Product as primary_product_candidate');
assert((genericOnlyPack.missingEvidence || []).includes('real public product/product-line evidence'), 'fallback must expose missing public product evidence');
assert(/only generic lane, workflow, industry, or prospect-name labels/.test(genericOnlyPack.fallbackReason), 'fallbackReason must explain rejected-only extraction');
assert(names(genericOnlyPack.rejectedCatalogCandidates).includes('Acme Building Supply'), 'prospect-name-only candidate rejection must be visible');
assert(genericOnlyPack.genericCandidateRejectedReasons.some((reason) => /Catalog Product rejected/.test(reason)), 'Catalog Product rejection must be visible');

const productEvidencePack = adapter.buildServerPrecomputedNamingPack({
  prospect: { name: 'YETI', website: 'https://www.yeti.com' },
  websiteEvidence: {
    productNames: ['Dealer Hardgoods & Channel Fulfillment', 'Rambler 20 oz Tumbler'],
    pageText: 'Shop Rambler 20 oz Tumbler, Tundra Cooler, and Hopper Soft Cooler product lines.'
  },
  demoPath: {
    laneId: 'dealer_hardgoods',
    productSeed: 'Product / SKU',
    scenario: 'dealer hardgoods channel fulfillment'
  }
});

assert(productEvidencePack.fallbackUsed === false, 'public product evidence must avoid fallback');
assert(productEvidencePack.selectedCatalogCandidate && productEvidencePack.selectedCatalogCandidate.name === 'Rambler 20 oz Tumbler', 'Rambler product line must be selected');
assert(!names(productEvidencePack.catalogCandidates).includes('Dealer Hardgoods & Channel Fulfillment'), 'blocked lane label must not remain in accepted catalogCandidates');

const oxoPack = adapter.buildServerPrecomputedNamingPack({
  prospect: { name: 'OXO W466 Real Naming Distribution Harness', website: 'https://www.oxo.com' },
  websiteEvidence: {
    productNames: ['Advisory Supported', 'Product / SKU'],
    pageText: 'Public OXO product lines include Good Grips, POP Containers, Brew Coffee Maker, Steel Salad Spinner, Angled Measuring Cup, and Tot feeding products.'
  },
  demoPath: {
    laneId: 'dealer_hardgoods',
    productSeed: 'Product / SKU',
    scenario: 'distribution replenishment proof'
  }
});

assert(oxoPack.fallbackUsed === false, 'OXO domain product evidence must avoid fallback');
assert(oxoPack.selectedCatalogCandidate && oxoPack.selectedCatalogCandidate.name === 'Good Grips', 'OXO Good Grips product line must be selected');
assert(names(oxoPack.catalogCandidates).includes('Pop Containers'), 'OXO catalog candidates must include public product lines');
assert(!names(oxoPack.catalogCandidates).includes('Advisory Supported'), 'advisory/status labels must not remain in accepted OXO catalogCandidates');
assert(oxoPack.selectedProductName === 'Good Grips', 'OXO selectedProductName must be a real public product line');

const traegerPack = adapter.buildServerPrecomputedNamingPack({
  prospect: { name: 'Traeger W466 Real Naming Manufacturing WIP Off Harness', website: 'https://www.traeger.com' },
  websiteEvidence: {
    productNames: ['Manufacturing Proof', 'Catalog Product'],
    pageText: 'Public Traeger product lines include Ironwood, Timberline, Pro Series, Woodridge, Flat Top Grill, pellets, and grill accessories.'
  },
  demoPath: {
    laneId: 'dealer_hardgoods',
    productSeed: 'Catalog Product',
    scenario: 'manufacturing only with WIP intentionally off'
  }
});

assert(traegerPack.fallbackUsed === false, 'Traeger domain product evidence must avoid fallback');
assert(traegerPack.selectedCatalogCandidate && traegerPack.selectedCatalogCandidate.name === 'Ironwood', 'Traeger Ironwood product line must be selected');
assert(names(traegerPack.catalogCandidates).includes('Timberline Pellet Grill'), 'Traeger catalog candidates must include public product lines');
assert(traegerPack.component_names.some((name) => /Ironwood/.test(name)), 'Traeger component names must use selected product line');

const garminPack = adapter.buildServerPrecomputedNamingPack({
  prospect: { name: 'Garmin Spring Dealer Replenishment Review', website: 'https://www.garmin.com' },
  websiteEvidence: {
    productNames: ['Apparel & Accessories', 'Core Style Color-Size Matrix', 'websiteResolverServiceV1'],
    pageText: 'Garmin dealer replenishment notes mention Forerunner running watches, Edge cycling computers, inventory availability, and clean product naming.'
  },
  demoPath: {
    laneId: 'dealer_hardgoods',
    productSeed: 'Product / SKU',
    scenario: 'dealer hardgoods electronics fulfillment'
  },
  storyInputs: {
    buyerNeed: 'Forerunner watches, Edge cycling computers, inventory availability, clean product naming.'
  }
});

assert(garminPack.fallbackUsed === false, 'Garmin product evidence must avoid fallback');
assert(garminPack.selectedCatalogCandidate && garminPack.selectedCatalogCandidate.name === 'Forerunner Running Watch', 'Garmin Forerunner product line must be selected');
assert(names(garminPack.catalogCandidates).includes('Edge Cycling Computer'), 'Garmin catalog candidates must include Edge Cycling Computer');
assert(!names(garminPack.catalogCandidates).includes('Apparel & Accessories'), 'Garmin accepted catalogCandidates must exclude apparel resolver label');
assert(garminPack.selectedProductName === 'Forerunner Running Watch', 'Garmin selectedProductName must be a real public product line');
assert(garminPack.component_names.some((name) => /Forerunner Running Watch/.test(name)), 'Garmin component names must use selected product line');

const leCreusetPack = adapter.buildServerPrecomputedNamingPack({
  prospect: { name: 'Le Creuset Seasonal Showroom Demo Plan', website: 'https://www.lecreuset.com' },
  websiteEvidence: {
    productNames: ['Dealer Durable Hardgoods', 'Needs Confirmation', 'Style / SKU Matrix'],
    pageText: 'Le Creuset buyer mentioned Signature Dutch Ovens, enameled cast iron cookware, color and size assortment planning, and store-level availability.'
  },
  demoPath: {
    laneId: 'dealer_hardgoods',
    productSeed: 'Product / SKU',
    scenario: 'dealer hardgoods kitchenware fulfillment'
  },
  storyInputs: {
    buyerNeed: 'Signature Dutch Ovens, enameled cast iron cookware, color and size assortment planning, and store-level availability.'
  }
});

assert(leCreusetPack.fallbackUsed === false, 'Le Creuset product evidence must avoid fallback');
assert(leCreusetPack.selectedCatalogCandidate && leCreusetPack.selectedCatalogCandidate.name === 'Signature Dutch Oven', 'Le Creuset Signature Dutch Oven product line must be selected');
assert(names(leCreusetPack.catalogCandidates).includes('Enameled Cast Iron Cookware'), 'Le Creuset catalog candidates must include enameled cast iron cookware');
assert(!names(leCreusetPack.catalogCandidates).includes('Dealer Durable Hardgoods'), 'Le Creuset accepted catalogCandidates must exclude lane label');
assert(leCreusetPack.selectedProductName === 'Signature Dutch Oven', 'Le Creuset selectedProductName must be a real public product line');
assert(leCreusetPack.component_names.some((name) => /Signature Dutch Oven/.test(name)), 'Le Creuset component names must use selected product line');

const rootRanked = rootAdapter.rankCatalogCandidatesW457([
  { name: 'Dealer Channel Availability', source: 'website_nav', confidence: 99, reasons: ['workflow label'] },
  { name: 'Karu 2 Pro Multi-Fuel Pizza Oven', source: 'website_product_list', confidence: 70, reasons: ['public product card'] }
], {
  website: 'https://ooni.com',
  scenario: 'durable hardgoods product build',
  prospect: 'Ooni'
});

assert(rootRanked[0] && rootRanked[0].name === 'Karu 2 Pro Multi-Fuel Pizza Oven', 'root adapter copy must preserve product-line ranking');

console.log('W464 catalog candidate ranking harness: passed');
