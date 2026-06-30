#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const { assertCase, printResults, root } = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function loadAdapterTest(relPath) {
  const source = readRepoFile(relPath);
  let moduleValue = null;
  const sandbox = {
    console,
    define(deps, factory) {
      moduleValue = factory(
        { accountId: 'TEST', getCurrentScript: () => ({ getParameter: () => '' }) },
        { create: () => ({ save: () => '999001', name: 'scai_naming_test.json' }), Type: { JSON: 'JSON' } },
        { audit() {}, error() {} },
        {},
        {}
      );
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: relPath });
  if (!moduleValue || !moduleValue._test) throw new Error(`${relPath} did not expose _test`);
  return moduleValue._test;
}

function main() {
  const results = [];
  const adapter = loadAdapterTest('src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb_governed_runner_adapter_w144_suitelet.js');

  const evidencePack = adapter.buildServerPrecomputedNamingPack({
    prospect: { name: 'Hydro Flask W490 Smoke', website: 'https://www.hydroflask.com' },
    selectedToggles: { createNewHeroItem: true, enableManufacturing: true, enableWip: true },
    websiteEvidence: {
      trustedWebsiteProductExamplesW472: [
        'All Around Travel Tumbler',
        'Wide Mouth Bottle',
        'Carry Out Soft Cooler'
      ],
      productCardNames: ['All Around Travel Tumbler', 'Wide Mouth Bottle']
    },
    productEvidence: {
      trustedWebsiteProductExamplesW472: ['All Around Travel Tumbler', 'Wide Mouth Bottle']
    }
  });

  assertCase(results, 'w490-v210-promotes-website-product-evidence-to-required-nllm-pack',
    evidencePack &&
      evidencePack._source === 'suitelet-nllm-website-naming-pack-w490' &&
      evidencePack.namingEvidenceSource === 'nllm_website_product_evidence' &&
      evidencePack.websiteEvidenceSource === 'website_product_evidence_nllm_route_w490' &&
      evidencePack.nllmWebsiteEvidencePromotedByAdapterW490 === true &&
      evidencePack.hero_item_name === 'All Around Travel Tumbler' &&
      evidencePack.assembly_name === 'All Around Travel Tumbler Assembly' &&
      evidencePack.bom_name === 'BOM - All Around Travel Tumbler' &&
      evidencePack.routing_name === 'Routing - All Around Travel Tumbler' &&
      evidencePack.component_names.length === 3 &&
      evidencePack.selectedCatalogCandidateSource === 'trusted_website_product_examples_w472' &&
      !/Hydro Flask W490 Smoke|website_product_url_slug_w473|domain|fallback/i.test(JSON.stringify({
        hero: evidencePack.hero_item_name,
        assembly: evidencePack.assembly_name,
        bom: evidencePack.bom_name,
        routing: evidencePack.routing_name,
        components: evidencePack.component_names,
        candidateSource: evidencePack.selectedCatalogCandidateSource
      })),
    JSON.stringify(evidencePack, null, 2));

  const urlOnlyPack = adapter.buildServerPrecomputedNamingPack({
    prospect: { name: 'Hydro Flask URL Only Guard', website: 'https://www.hydroflask.com/shop/24-oz-wide-mouth-bottle' },
    selectedToggles: { createNewHeroItem: true, enableManufacturing: true, enableWip: true }
  });

  assertCase(results, 'w490-v210-rejects-url-slug-only-naming-guess',
    urlOnlyPack === null,
    JSON.stringify(urlOnlyPack, null, 2));

  printResults('W490 V2.1.0 website naming route harness', results);
}

main();
