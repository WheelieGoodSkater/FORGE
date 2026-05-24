const DCC_RESULT_EXPORT_SCHEMA = 'idb.dcc-result-export-shape.v1';

const SECRET_KEY_PATTERN = /(token|secret|password|cookie|authorization|authHeader|auth_header|apiKey|api_key|session)/i;

function str(value) {
  return String(value || '').trim();
}

function trimLen(value, max) {
  const text = str(value);
  return text.length <= max ? text : text.slice(0, max).trim();
}

function shortExtSuffix(extId) {
  const raw = str(extId).replace(/^SCAI_SO_/i, '').replace(/[^A-Za-z0-9]/g, '');
  return raw ? raw.slice(-8).toUpperCase() : 'RUN';
}

function buildDifferentiatedNames(baseName, extId) {
  const cleanBase = str(baseName).replace(/^SCAI\s*-\s*/i, '').trim() || 'Demo';
  const suffix = shortExtSuffix(extId);
  return {
    displayName: trimLen(cleanBase, 120),
    itemIdName: trimLen(cleanBase, 60),
    internalItemIdName: trimLen(`SCAI - ${cleanBase} - ${suffix}`, 60),
    suffix
  };
}

function consultantFacingName(value) {
  return str(value)
    .replace(/^SCAI\s*-\s*/i, '')
    .replace(/\s+-\s+[A-Z0-9]{4,12}$/i, '')
    .trim();
}

function redactSecrets(value) {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).reduce((acc, key) => {
    acc[key] = key === 'noSecrets' ? value[key] : (SECRET_KEY_PATTERN.test(key) ? '[redacted]' : redactSecrets(value[key]));
    return acc;
  }, {});
}

function recordRef({ role, name, id, url, externalId, status }) {
  const rawName = str(name);
  const displayName = consultantFacingName(rawName);
  return {
    role: str(role),
    name: displayName,
    internalName: rawName && rawName !== displayName ? rawName : '',
    id: id === undefined || id === null ? '' : str(id),
    url: str(url),
    externalId: str(externalId),
    status: str(status || (name || id || url ? 'returned' : 'not_returned'))
  };
}

function buildDccFinalResultExportBridgeV1(input) {
  const source = redactSecrets(input || {});
  const ids = source.ids || {};
  const names = source.names || {};
  const extId = str(source.extId || source.generatedExtId);
  const prospect = str(source.prospect || source.customerName);
  const enableManufacturing = !!source.enableManufacturing;
  const enableWip = !!source.enableWip;
  const heroName = buildDifferentiatedNames(names.hero_item_name || source.heroItemName || `${prospect} Hero Item`, extId);
  const assemblyName = buildDifferentiatedNames(names.assembly_name || source.assemblyName || `${prospect} Assembly`, extId);
  const componentNames = Array.isArray(names.component_names) ? names.component_names : (source.componentNames || []);
  const bomName = buildDifferentiatedNames(names.bom_name || source.bomName || `BOM - ${prospect}`, extId);
  const bomRevisionName = buildDifferentiatedNames(names.bom_revision_name || source.bomRevisionName || `Revision 1 - ${prospect}`, extId);
  const scenario = str(source.scenario || source.scenarioLabel || source.normalizedScenarioLabel || names.scenarioLabel || names._uiSourceFlowLabel);
  const familyKey = str(source.familyKey || source.authoritativeFamilyKey || names.family_key || names.industry_category);
  const csvName = str(source.csvFileName || (extId ? `scai_so_${extId}.csv` : ''));

  const componentItems = componentNames.map((name, index) => {
    const pair = buildDifferentiatedNames(name, extId);
    const id = [ids.comp1Id, ids.comp2Id, ids.comp3Id][index] || '';
    return recordRef({
      role: 'component_item',
      name: pair.displayName,
      id,
      externalId: [ids.comp1ExternalId, ids.comp2ExternalId, ids.comp3ExternalId][index] || ''
    });
  });

  const exported = {
    schema: DCC_RESULT_EXPORT_SCHEMA,
    source: 'demo_command_center_final_result_export_bridge_v1',
    runStatus: str(source.runStatus || 'preview_or_run_complete'),
    prospect,
    familyKey,
    scenario,
    generatedExtId: extId,
    generatedAgenda: str(source.agenda || source.generatedAgenda),
    customer: recordRef({
      role: 'customer',
      name: str(source.customerName || prospect),
      id: source.customerId || source.anchorCustomerId || '',
      url: source.customerUrl || '',
      externalId: source.customerExternalId || 'SCAI_ANCHOR_CUSTOMER'
    }),
    salesOrder: recordRef({
      role: 'sales_order',
      name: str(source.salesOrderName || (extId ? `Sales Order CSV import for ${extId}` : '')),
      id: source.salesOrderId || '',
      url: source.salesOrderUrl || '',
      externalId: extId,
      status: source.salesOrderId ? 'returned' : 'csv_import_submitted_pending_transaction_id'
    }),
    heroItem: recordRef({
      role: 'hero_item',
      name: heroName.displayName,
      id: ids.heroItemId || source.heroItemId || '',
      url: source.heroItemUrl || '',
      externalId: ids.heroItemExternalId || source.heroItemExternalId || ''
    }),
    matrixItem: recordRef({
      role: 'matrix_or_proof_item',
      name: str(source.matrixItemName || heroName.displayName),
      id: source.matrixItemId || ids.matrixItemId || '',
      url: source.matrixItemUrl || '',
      externalId: source.matrixItemExternalId || ''
    }),
    proofItem: recordRef({
      role: 'proof_item',
      name: str(source.proofItemName || source.matrixItemName || heroName.displayName),
      id: source.proofItemId || ids.proofItemId || '',
      url: source.proofItemUrl || '',
      externalId: source.proofItemExternalId || ''
    }),
    componentItems,
    assembly: enableManufacturing
      ? recordRef({ role: 'assembly', name: assemblyName.displayName, id: ids.assemblyId || source.assemblyId || '', url: source.assemblyUrl || '', externalId: ids.assemblyExternalId || source.assemblyExternalId || '' })
      : recordRef({ role: 'assembly', status: 'not_applicable_manufacturing_disabled' }),
    bom: enableManufacturing
      ? recordRef({ role: 'bom', name: bomName.displayName, id: ids.bomId || source.bomId || '', url: source.bomUrl || '', externalId: ids.bomExternalId || source.bomExternalId || '' })
      : recordRef({ role: 'bom', status: 'not_applicable_manufacturing_disabled' }),
    bomRevision: enableManufacturing
      ? recordRef({ role: 'bom_revision', name: bomRevisionName.displayName, id: ids.bomRevId || source.bomRevId || '', url: source.bomRevisionUrl || '', externalId: ids.bomRevExternalId || source.bomRevisionExternalId || '' })
      : recordRef({ role: 'bom_revision', status: 'not_applicable_manufacturing_disabled' }),
    locationPlanningRecords: (source.locationPlanningRecords || []).map((record, index) => recordRef(Object.assign({ role: `location_planning_${index + 1}` }, record))),
    csvSalesOrderArtifacts: csvName ? [{
      label: 'Sales Order CSV',
      name: csvName,
      id: source.soFileId || source.csvFileId || '',
      url: source.soFileUrl || source.csvFileUrl || '',
      status: source.soTaskId ? 'csv_import_submitted' : 'csv_artifact_returned'
    }] : [],
    warnings: (source.warnings || []).map(str),
    errors: (source.errors || []).map(str),
    recoverableBlockers: (source.recoverableBlockers || []).map(str),
    exportMeta: {
      generatedAt: str(source.generatedAt || new Date().toISOString()),
      noSecrets: true,
      idbImportOnly: true,
      dccOwnsObjectGeneration: true,
      namingMechanicsChanged: false,
      enableManufacturing,
      enableWip
    }
  };

  return redactSecrets(exported);
}

function sampleDccGeneratedRun() {
  return {
    runStatus: 'run_complete',
    prospect: 'Ariat International',
    customerName: 'Ariat International',
    customerId: '321',
    extId: 'ARIATSTYLE20260514',
    agenda: 'Show style/SKU readiness, size/color availability, replenishment timing, and customer promise.',
    familyKey: 'apparelAccessories',
    scenario: 'Style-to-Availability Readiness',
    enableManufacturing: true,
    enableWip: false,
    ids: {
      heroItemId: '987',
      assemblyId: '989',
      bomId: '990',
      bomRevId: '991',
      comp1Id: '992',
      comp2Id: '993',
      comp3Id: '994'
    },
    names: {
      hero_item_name: 'Ariat Core Boot and Apparel Style Matrix',
      assembly_name: 'Ariat Seasonal Style Availability Flow',
      component_names: [
        'Ariat Width Size Color Variant Control',
        'Ariat Channel Availability Commitment',
        'Ariat Seasonal Replenishment Signal'
      ],
      bom_name: 'Ariat Style Availability Structure',
      bom_revision_name: 'Ariat Launch Readiness Revision'
    },
    soFileId: 'file-42',
    soTaskId: 'csvtask-77',
    secretToken: 'should_not_survive_trace',
    cookie: 'should_not_survive_trace'
  };
}

module.exports = {
  DCC_RESULT_EXPORT_SCHEMA,
  buildDccFinalResultExportBridgeV1,
  buildDifferentiatedNames,
  consultantFacingName,
  redactSecrets,
  sampleDccGeneratedRun
};
