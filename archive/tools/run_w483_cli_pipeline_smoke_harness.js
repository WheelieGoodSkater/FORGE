#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const {
  assertCase,
  printResults,
  root
} = require('./lib/forge_harness_fixtures');

const runnerRel = path.join('netsuite', 'runner', 'scai_ss_so_csv_runner_forge_clean_w483.js');
const runnerPath = path.join(root, runnerRel);

function loadRunnerHooks() {
  const savedFiles = [];
  const modules = {
    'N/runtime': {
      accountId: 'TD3021666',
      getCurrentScript() {
        return { getParameter() { return ''; } };
      }
    },
    'N/log': {
      audit() {},
      error() {},
      debug() {}
    },
    'N/search': {
      Sort: { DESC: 'DESC', ASC: 'ASC' },
      createColumn(opts) { return opts || {}; },
      create() {
        return { run() { return { getRange() { return []; } }; } };
      }
    },
    'N/record': {},
    'N/https': {},
    'N/task': {},
    'N/file': {
      Type: { PLAINTEXT: 'PLAINTEXT', JSON: 'JSON', CSV: 'CSV' },
      create(opts) {
        const item = Object.assign({ id: String(9000 + savedFiles.length) }, opts || {});
        savedFiles.push(item);
        return {
          name: item.name,
          save() { return item.id; },
          getContents() { return item.contents || ''; }
        };
      },
      load() {
        throw new Error('No file loads in CLI smoke harness');
      }
    }
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
    encodeURIComponent,
    define(deps, factory) {
      exported = factory.apply(null, deps.map((dep) => modules[dep]));
    }
  };
  vm.createContext(sandbox);
  const source = fs.readFileSync(runnerPath, 'utf8').replace(
    'return { execute };',
    'return { execute, __testHooks: { generateNamingPack, buildProductBuildPlanW483, buildRoiCompetitiveSidecarW483, writeForgeSidecarResultW483 } };'
  );
  vm.runInContext(source, sandbox, { filename: runnerPath });
  if (!exported || !exported.__testHooks) throw new Error('Failed to expose W483 test hooks');
  return { hooks: exported.__testHooks, savedFiles };
}

function fakeIds(index) {
  const base = 1000 + index * 20;
  return {
    customerId: base + 1,
    heroItemId: base + 2,
    assemblyId: base + 3,
    bomId: base + 4,
    bomRevId: base + 5,
    comp1Id: base + 6,
    comp2Id: base + 7,
    comp3Id: base + 8,
    heroItemExternalId: `SCAI_W483_HERO_${index}`,
    heroItemCsvKey: `SCAI_W483_HERO_${index}`
  };
}

function runCase(hooks, savedFiles, item, index) {
  const names = hooks.generateNamingPack({
    prospect: item.prospect,
    website: item.website,
    signalText: item.signalText
  });
  const enableManufacturing = item.mode !== 'distribution';
  const enableWip = item.mode === 'wip';
  const args = {
    folderId: 777,
    prospect: item.prospect,
    website: item.website,
    notes: item.notes,
    agenda: item.agenda,
    extId: `W483_CLI_${index}_${item.slug}`,
    ids: fakeIds(index),
    names,
    soFileId: 8000 + index,
    soTaskId: `CSVIMPORT_${index}`,
    woId: enableManufacturing ? 7000 + index : null,
    routingId: enableWip ? 7100 + index : null,
    routingResult: enableWip ? { routingId: 7100 + index, decision: 'created-new-routing', attachResult: 'attached' } : null,
    enableManufacturing,
    enableWip,
    createNewHeroItem: true,
    namingPayload: {
      found: false,
      parsed: false,
      applied: true,
      source: names._source,
      payload: names
    },
    confirmedBuildRequestJson: {
      sourceRequestId: `REQ-${item.slug}`,
      buildAttemptId: `ATTEMPT-${item.slug}`,
      storyInputs: {
        buyerNeed: item.notes,
        scObjective: item.agenda,
        competitors: item.competitors || ''
      }
    }
  };
  const capture = hooks.writeForgeSidecarResultW483(args);
  const saved = savedFiles[savedFiles.length - 1];
  const payload = saved ? JSON.parse(saved.contents) : null;
  return { item, names, capture, payload };
}

function main() {
  const { hooks, savedFiles } = loadRunnerHooks();
  const cases = [
    {
      slug: 'gibson',
      prospect: 'Gibson Brands',
      website: 'https://www.gibson.com',
      mode: 'wip',
      signalText: 'Gibson official site for electric guitars, acoustic guitars, bass guitars, pickups, accessories, and musical instruments.',
      notes: 'Dealer demand is rising ahead of a fall launch. Sales wants proof that instrument availability and production readiness can support channel promises.',
      agenda: 'Show guitar order, assembly, BOM, routing, and advisory ROI/competitive story.',
      expectedProduct: 'Electric Guitar',
      expectedIndustry: 'Musical Instruments Manufacturing',
      competitors: 'Fender, PRS'
    },
    {
      slug: 'herman-miller',
      prospect: 'Herman Miller',
      website: 'https://www.hermanmiller.com',
      mode: 'manufacturing',
      signalText: 'Office furniture, ergonomic seating, chairs, desks, tables, workplace furniture and seating systems.',
      notes: 'Enterprise dealers need clearer furniture configuration readiness before promising project delivery dates.',
      agenda: 'Show chair availability, assembly, BOM, and value story without WIP routing.',
      expectedProduct: 'Ergonomic Chair',
      expectedIndustry: 'Furniture Manufacturing',
      competitors: 'Steelcase, Haworth'
    },
    {
      slug: 'dyson',
      prospect: 'Dyson',
      website: 'https://www.dyson.com',
      mode: 'distribution',
      signalText: 'Premium home appliance products including vacuum cleaners, air purifiers, hair dryers, electronics, and accessories.',
      notes: 'Retail operations wants cleaner launch allocation and stockout prevention across premium appliances.',
      agenda: 'Show distribution-only availability proof and advisory ROI.',
      expectedProduct: 'Premium Home Appliance',
      expectedIndustry: 'Premium Home Appliance Manufacturing',
      competitors: 'SharkNinja, Samsung'
    },
    {
      slug: 'crown',
      prospect: 'Crown Equipment',
      website: 'https://www.crown.com',
      mode: 'wip',
      signalText: 'Forklift trucks, pallet trucks, warehouse equipment, lift truck service, and industrial equipment.',
      notes: 'Branch sales needs proof that equipment order readiness and assembly routing can support promised delivery windows.',
      agenda: 'Show lift truck order, manufacturing records, work order, routing, ROI and competitive proof.',
      expectedProduct: 'Lift Truck',
      expectedIndustry: 'Industrial Equipment Manufacturing',
      competitors: 'Toyota Material Handling, Hyster'
    },
    {
      slug: 'le-creuset',
      prospect: 'Le Creuset',
      website: 'https://www.lecreuset.com',
      mode: 'manufacturing',
      signalText: 'Cookware, Dutch ovens, cast iron, skillets, bakeware, kitchenware, and cookware sets.',
      notes: 'Wholesale teams need confidence in holiday cookware set availability and replenishment timing.',
      agenda: 'Show cookware product, assembly, BOM, and advisory ROI story.',
      expectedProduct: 'Cookware Set',
      expectedIndustry: 'Kitchenware Manufacturing',
      competitors: 'Staub, Lodge'
    },
    {
      slug: 'yeti',
      prospect: 'YETI',
      website: 'https://www.yeti.com',
      mode: 'distribution',
      signalText: 'Coolers, drinkware, tumblers, mugs, bottles, outdoor hardgoods, bags, and durable products.',
      notes: 'Retail teams need allocation confidence for seasonal hardgoods and drinkware demand without overpromising.',
      agenda: 'Show distribution availability, returned records, ROI and competitive advisory.',
      expectedProduct: 'Durable Hardgoods Product',
      expectedIndustry: 'Durable Consumer Goods Manufacturing',
      competitors: 'Stanley, Hydro Flask'
    }
  ];

  const results = [];
  const outputs = cases.map((item, index) => runCase(hooks, savedFiles, item, index + 1));
  outputs.forEach(({ item, names, capture, payload }) => {
    const label = `w483-cli-${item.slug}`;
    const completed = payload && payload.completedResultJson || {};
    const roiAudit = completed.roiAudit || {};
    const competitive = completed.competitive || {};
    assertCase(results, `${label}-product-industry`,
      names.hero_item_name === item.expectedProduct &&
        names.industry_category === item.expectedIndustry &&
        names._source === 'w483-website-signal-naming-pack',
      JSON.stringify({ names }, null, 2));
    assertCase(results, `${label}-old-runner-pack-shape`,
      names.assembly_name === `${item.expectedProduct} Assembly` &&
        names.bom_name === `BOM - ${item.expectedProduct}` &&
        names.bom_revision_name === `Revision 1 - ${item.expectedProduct}` &&
        names.routing_name === `Routing - ${item.expectedProduct}` &&
        Array.isArray(names.component_names) &&
        names.component_names.length === 3 &&
        names.operation_names_by_seq &&
        names.operation_names_by_seq['10'],
      JSON.stringify({ names }, null, 2));
    assertCase(results, `${label}-sidecar-result-shape`,
      capture &&
        capture.fileId &&
        payload &&
        payload.schema === 'idb.runner-result-capture.w483.forge-clean.v1' &&
        completed.schema === 'forge.completed-runner-result.v3' &&
        Array.isArray(completed.displayReadyRecords) &&
        completed.displayReadyRecords.length >= (item.mode === 'distribution' ? 3 : 7),
      JSON.stringify({ capture, completedKeys: Object.keys(completed || {}) }, null, 2));
    assertCase(results, `${label}-roi-competitive`,
      roiAudit.schema === 'idb.w483-runner-roi-audit.v1' &&
        /Advisory only|returned NetSuite records/i.test(roiAudit.claim || '') &&
        competitive.schema === 'idb.w483-runner-competitive.v1' &&
        Array.isArray(competitive.namedCompetitors),
      JSON.stringify({ roiAudit, competitive }, null, 2));
  });

  printResults('W483 CLI pipeline smoke suite', results);
  console.log(JSON.stringify(outputs.map(({ item, names, capture, payload }) => ({
    slug: item.slug,
    mode: item.mode,
    product: names.hero_item_name,
    industry: names.industry_category,
    components: names.component_names,
    operations: names.operation_names_by_seq,
    status: payload.completedResultJson.status,
    returnedCount: payload.completedResultJson.returnedCount,
    realMissingUrlCount: payload.completedResultJson.realMissingUrlCount,
    roi: payload.completedResultJson.roiAudit.claim,
    competitive: payload.completedResultJson.competitive.competitorSafeContrast,
    resultFileName: capture.fileName
  })), null, 2));
}

main();
