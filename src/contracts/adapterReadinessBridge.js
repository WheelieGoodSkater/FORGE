'use strict';

const adapterProfiles = require('./adapterProfiles');

const ADAPTER_READINESS_BRIDGE_SCHEMA_VERSION = 'forge.w279.adapter-readiness-bridge.v1';

const REQUIRED_PROFILE_FIELDS = Object.freeze([
  'schema',
  'profileId',
  'profileLabel',
  'accountHost',
  'scriptName',
  'title',
  'deploymentScriptId',
  'deploymentStatus',
  'deployed',
  'executeAsRole',
  'logLevel',
  'suiteletPath',
  'scriptId',
  'deploymentId',
  'sandboxAccountAllowlist',
  'adapterApproved',
  'CREATE_ENABLED',
  'GOVERNED_SANDBOX_WRITE_ENABLED',
  'QUEUE_SUBMIT_ENABLED',
  'productionBuildModeEnabled'
]);

const REQUIRED_TRACE_FIELDS = Object.freeze([
  'selectedAdapterProfile',
  'endpointConfigured',
  'w262ReadinessState',
  'datasetSwitching',
  'motionRunObservations',
  'normalUi',
  'guardrails'
]);

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = clone(value[key]);
      return acc;
    }, {});
  }
  return value;
}

function hasOwn(source, field) {
  return Object.prototype.hasOwnProperty.call(source || {}, field);
}

function normalizeEndpoint(value) {
  return String(value || '').replace(/\/+$/g, '');
}

function profileMissingFields(profile) {
  return REQUIRED_PROFILE_FIELDS.filter((field) => !hasOwn(profile, field));
}

function validateAdapterProfile(profile) {
  const source = profile || {};
  const missing = profileMissingFields(source);
  const derivedEndpoint = adapterProfiles.adapterProfileEndpoint(source);
  const expectedReleased = adapterProfiles.releasedAdapterProfile({
    accountHost: source.accountHost || adapterProfiles.RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE.accountHost
  });
  const matchesReleasedPath = source.suiteletPath === expectedReleased.suiteletPath &&
    String(source.scriptId || '') === String(expectedReleased.scriptId) &&
    String(source.deploymentId || '') === String(expectedReleased.deploymentId) &&
    source.deploymentScriptId === expectedReleased.deploymentScriptId;
  const endpointMatches = !source.fullEndpointUrl || normalizeEndpoint(source.fullEndpointUrl) === normalizeEndpoint(derivedEndpoint);
  const schemaCompatible = source.schema === adapterProfiles.ADAPTER_PROFILE_SCHEMA_VERSION ||
    source.schema === 'forge.w263.adapter-profile.v1';
  const fieldCompatible = missing.length === 0 &&
    schemaCompatible &&
    derivedEndpoint &&
    matchesReleasedPath &&
    endpointMatches;
  return {
    schema: 'forge.w279.adapter-profile-validation.v1',
    sourceSchema: source.schema || '',
    expectedSchema: adapterProfiles.ADAPTER_PROFILE_SCHEMA_VERSION,
    acceptedSchemas: [adapterProfiles.ADAPTER_PROFILE_SCHEMA_VERSION, 'forge.w263.adapter-profile.v1'],
    fieldCompatible: Boolean(fieldCompatible),
    missingFields: missing,
    derivedEndpoint,
    matchesReleasedPath,
    endpointMatches,
    status: fieldCompatible ? 'field_compatible' : 'needs_attention'
  };
}

function validateTraceSelectedProfile(profile) {
  const source = profile || {};
  const required = [
    'profileId',
    'profileLabel',
    'scriptName',
    'title',
    'deploymentScriptId',
    'deploymentStatus',
    'deployed',
    'executeAsRole',
    'logLevel',
    'accountHost',
    'suiteletPath',
    'scriptId',
    'deploymentId',
    'fullEndpointUrl'
  ];
  const missing = required.filter((field) => !hasOwn(source, field));
  const derivedEndpoint = adapterProfiles.adapterProfileEndpoint(source);
  const fieldCompatible = missing.length === 0 &&
    source.suiteletPath === adapterProfiles.RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE.suiteletPath &&
    String(source.scriptId || '') === String(adapterProfiles.RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE.scriptId) &&
    String(source.deploymentId || '') === String(adapterProfiles.RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE.deploymentId) &&
    source.deploymentScriptId === adapterProfiles.RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE.deploymentScriptId &&
    normalizeEndpoint(source.fullEndpointUrl) === normalizeEndpoint(derivedEndpoint);
  return {
    schema: 'forge.w279.trace-selected-profile-validation.v1',
    fieldCompatible,
    missingFields: missing,
    derivedEndpoint,
    status: fieldCompatible ? 'field_compatible' : 'needs_attention'
  };
}

function validateEndpointDerivation(profile, alternateHost) {
  const source = profile || adapterProfiles.releasedAdapterProfile();
  const derivedEndpoint = adapterProfiles.adapterProfileEndpoint(source);
  const swappedProfile = adapterProfiles.releasedAdapterProfile({
    accountHost: alternateHost || 'future-dataset.app.netsuite.com',
    suiteletPath: source.suiteletPath,
    deploymentScriptId: source.deploymentScriptId,
    scriptId: source.scriptId,
    deploymentId: source.deploymentId
  });
  const swappedEndpoint = adapterProfiles.adapterProfileEndpoint(swappedProfile);
  return {
    schema: 'forge.w279.endpoint-derivation-validation.v1',
    derivedEndpoint,
    swappedEndpoint,
    endpointDerivedFromAccountHostAndPath: Boolean(derivedEndpoint && source.accountHost && source.suiteletPath),
    canSwapAccountHostWithoutRuntimeLogicChange: swappedEndpoint.indexOf(String(alternateHost || 'future-dataset.app.netsuite.com').replace(/^https?:\/\//i, '').replace(/\/+$/g, '')) >= 0 &&
      swappedProfile.suiteletPath === source.suiteletPath,
    status: derivedEndpoint && swappedEndpoint ? 'field_compatible' : 'needs_attention'
  };
}

function validateReadinessState(facts, expectedState) {
  const readiness = adapterProfiles.evaluateAdapterReadiness(facts);
  const matchesExpected = expectedState ? readiness.readinessState === expectedState : true;
  return {
    schema: 'forge.w279.adapter-readiness-validation.v1',
    expectedState: expectedState || '',
    readiness,
    matchesExpected,
    fieldCompatible: readiness.schema === adapterProfiles.ADAPTER_READINESS_SCHEMA_VERSION &&
      Boolean(adapterProfiles.ADAPTER_READINESS_STATES) &&
      matchesExpected,
    status: readiness.schema === adapterProfiles.ADAPTER_READINESS_SCHEMA_VERSION && matchesExpected
      ? 'field_compatible'
      : 'needs_attention'
  };
}

function validateReadinessTrace(trace) {
  const source = trace || {};
  const missing = REQUIRED_TRACE_FIELDS.filter((field) => !hasOwn(source, field));
  const profileValidation = source.selectedAdapterProfile
    ? validateTraceSelectedProfile(source.selectedAdapterProfile)
    : null;
  const dataset = source.datasetSwitching || {};
  const normalUi = source.normalUi || {};
  const guardrails = source.guardrails || {};
  const fieldCompatible = missing.length === 0 &&
    (!profileValidation || profileValidation.fieldCompatible === true) &&
    dataset.accountHostStoredPerProfile === true &&
    dataset.endpointDerivedFromAccountHostAndPath === true &&
    dataset.canSwapAccountHostWithoutRuntimeLogicChange === true &&
    normalUi.endpointProfileHiddenFromConsultant === true &&
    guardrails.noDrawerCreatedRecords === true &&
    guardrails.noDrawerTransactionWrites === true;
  return {
    schema: 'forge.w279.readiness-trace-validation.v1',
    sourceSchema: source.schema || '',
    expectedSchema: 'forge.w263.deployed-adapter-readiness-trace.v1',
    fieldCompatible,
    missingFields: missing,
    profileValidation,
    status: fieldCompatible ? 'field_compatible' : 'needs_attention'
  };
}

function bridgeAdapterReadiness(outputs) {
  const source = outputs || {};
  const profile = source.releasedAdapterProfile || adapterProfiles.releasedAdapterProfile();
  const profileValidation = validateAdapterProfile(profile);
  const endpointValidation = validateEndpointDerivation(profile, source.alternateAccountHost);
  const readinessEntries = Object.keys(source.readinessFacts || {}).map((id) => {
    const item = source.readinessFacts[id] || {};
    return Object.assign({ id }, validateReadinessState(item.facts, item.expectedState));
  });
  const traceValidation = source.readinessTrace
    ? validateReadinessTrace(source.readinessTrace)
    : null;
  const failed = []
    .concat(profileValidation.status === 'field_compatible' ? [] : ['releasedAdapterProfile'])
    .concat(endpointValidation.status === 'field_compatible' ? [] : ['endpointDerivation'])
    .concat(readinessEntries.filter((entry) => entry.status !== 'field_compatible').map((entry) => entry.id))
    .concat(traceValidation && traceValidation.status !== 'field_compatible' ? ['readinessTrace'] : []);
  return {
    schema: ADAPTER_READINESS_BRIDGE_SCHEMA_VERSION,
    status: failed.length ? 'bridge_needs_attention' : 'bridge_ready',
    governingContract: adapterProfiles.ADAPTER_PROFILE_SCHEMA_VERSION,
    readinessContract: adapterProfiles.ADAPTER_READINESS_SCHEMA_VERSION,
    releasedAdapterProfile: profileValidation,
    endpointDerivation: endpointValidation,
    readinessEntries,
    readinessTrace: traceValidation,
    failedPacketIds: failed,
    guardrails: {
      normalConsultantUiChanged: false,
      buildTabCopyButtonsLayoutChanged: false,
      connectedSubmitRefreshImportChanged: false,
      retrySafetyChanged: false,
      returnedRecordImportChanged: false,
      laneResolutionChanged: false,
      adapterEndpointProfileChanged: false,
      recordCreationAuthorityChanged: false,
      endpointProfileHiddenFromNormalUi: true,
      nllmAdvisoryOnly: true,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true,
      noW144DeploymentUpdateInThisBlock: true
    }
  };
}

function exportedContractSummary() {
  return {
    schema: ADAPTER_READINESS_BRIDGE_SCHEMA_VERSION,
    governingContract: adapterProfiles.ADAPTER_PROFILE_SCHEMA_VERSION,
    readinessContract: adapterProfiles.ADAPTER_READINESS_SCHEMA_VERSION,
    releasedProfileId: adapterProfiles.RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE.profileId,
    readinessStates: clone(adapterProfiles.ADAPTER_READINESS_STATES),
    guardrails: {
      normalConsultantUiChanged: false,
      connectedSubmitRefreshImportChanged: false,
      adapterEndpointProfileChanged: false,
      recordCreationAuthorityChanged: false,
      endpointProfileHiddenFromNormalUi: true
    }
  };
}

module.exports = {
  ADAPTER_READINESS_BRIDGE_SCHEMA_VERSION,
  REQUIRED_PROFILE_FIELDS,
  REQUIRED_TRACE_FIELDS,
  validateAdapterProfile,
  validateEndpointDerivation,
  validateReadinessState,
  validateReadinessTrace,
  bridgeAdapterReadiness,
  exportedContractSummary
};
