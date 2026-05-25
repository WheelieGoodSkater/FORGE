'use strict';

const ADAPTER_PROFILE_SCHEMA_VERSION = 'forge.w271.adapter-profile.v1';
const ADAPTER_READINESS_SCHEMA_VERSION = 'forge.w271.adapter-readiness.v1';

const ADAPTER_READINESS_STATES = Object.freeze({
  READY_TO_BUILD_RECORDS: 'ready_to_build_records',
  SMOKE_PREVIEW_ONLY: 'smoke_preview_only',
  ADAPTER_NOT_CONFIGURED: 'adapter_not_configured',
  BUILD_SUBMITTED: 'build_submitted',
  WAITING_FOR_RUNNER_RESULT: 'waiting_for_runner_result',
  RECORDS_READY_TO_IMPORT: 'records_ready_to_import',
  RECORDS_IMPORTED: 'records_imported'
});

const RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE = Object.freeze({
  schema: ADAPTER_PROFILE_SCHEMA_VERSION,
  profileId: 'td3021666-released-governed-runner-adapter',
  profileLabel: 'TD3021666 released governed runner adapter',
  accountHost: 'td3021666.app.netsuite.com',
  scriptName: 'IDB W144 Customer Proof Pilot Suitelet',
  title: 'IDB W24 Customer Proof Pilot Suitelet',
  deploymentScriptId: 'customdeployidb_governed_runner_adapter',
  deploymentStatus: 'Released',
  deployed: true,
  executeAsRole: 'Current Role',
  logLevel: 'Error',
  suiteletPath: '/app/site/hosting/scriptlet.nl?script=6702&deploy=2',
  scriptId: '6702',
  deploymentId: '2',
  sandboxAccountAllowlist: Object.freeze(['TD3021666']),
  adapterApproved: true,
  CREATE_ENABLED: true,
  GOVERNED_SANDBOX_WRITE_ENABLED: true,
  QUEUE_SUBMIT_ENABLED: true,
  productionBuildModeEnabled: true
});

const READINESS_COPY = Object.freeze({
  ready_to_build_records: Object.freeze({
    label: 'Ready to build records',
    headline: 'Ready to create NetSuite records',
    copy: 'Click Build records. FORGE will submit the approved build path, then you can refresh status until returned records are ready.'
  }),
  smoke_preview_only: Object.freeze({
    label: 'Preview ready',
    headline: 'Preview ready. Record creation is not enabled in this install.',
    copy: 'You can continue smoke testing the drawer flow. The real Build records action appears when the approved server build setup is ready.'
  }),
  adapter_not_configured: Object.freeze({
    label: 'Preview ready',
    headline: 'Preview ready. Record creation is not enabled in this install.',
    copy: 'You can continue smoke testing the drawer flow. Record creation stays off until the approved server build setup is ready.'
  }),
  build_submitted: Object.freeze({
    label: 'Build submitted',
    headline: 'Build submitted',
    copy: 'Refresh build status to check whether the runner returned completed records.'
  }),
  waiting_for_runner_result: Object.freeze({
    label: 'Waiting for records',
    headline: 'Build submitted',
    copy: 'Refresh build status to check whether the runner returned completed records.'
  }),
  records_ready_to_import: Object.freeze({
    label: 'Records ready',
    headline: 'Records ready',
    copy: 'Finish the build to bring returned names, labels, and Open links into Review and Run.'
  }),
  records_imported: Object.freeze({
    label: 'Records imported',
    headline: 'Records ready',
    copy: 'Review and Run are using returned NetSuite record names, lane-aware labels, and supported Open links.'
  })
});

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeAccountHost(host) {
  const raw = String(host || '').trim().replace(/\/+$/g, '');
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/g, '');
  return `https://${raw}`;
}

function normalizeSuiteletPath(path) {
  const raw = String(path || '').trim();
  if (!raw) return '';
  return raw.charAt(0) === '/' ? raw : `/${raw.replace(/^\/+/g, '')}`;
}

function adapterProfileEndpoint(profile) {
  const selected = profile || RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE;
  const accountHost = normalizeAccountHost(selected.accountHost);
  const suiteletPath = normalizeSuiteletPath(selected.suiteletPath);
  return accountHost && suiteletPath ? `${accountHost}${suiteletPath}` : '';
}

function releasedAdapterProfile(overrides) {
  const profile = Object.assign({}, RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE, overrides || {});
  profile.sandboxAccountAllowlist = arrayValue(profile.sandboxAccountAllowlist).slice();
  profile.fullEndpointUrl = adapterProfileEndpoint(profile);
  return profile;
}

function adapterProfilesFromConfig(config) {
  const base = config || {};
  if (base.adapterProfileDisabled === true) {
    return arrayValue(base.adapterProfiles).filter((profile) => profile && profile.profileId).map((profile) => Object.assign({}, profile, {
      schema: profile.schema || ADAPTER_PROFILE_SCHEMA_VERSION,
      fullEndpointUrl: adapterProfileEndpoint(profile)
    }));
  }
  const profiles = arrayValue(base.adapterProfiles).filter((profile) => profile && profile.profileId);
  if (!profiles.some((profile) => profile.profileId === RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE.profileId)) {
    profiles.unshift(releasedAdapterProfile());
  }
  return profiles.map((profile) => Object.assign({}, profile, {
    schema: profile.schema || ADAPTER_PROFILE_SCHEMA_VERSION,
    fullEndpointUrl: adapterProfileEndpoint(profile)
  }));
}

function selectedAdapterProfile(config) {
  const profiles = adapterProfilesFromConfig(config);
  const selectedId = (config && config.selectedAdapterProfileId) || RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE.profileId;
  return profiles.find((profile) => profile.profileId === selectedId) || profiles[0] || releasedAdapterProfile();
}

function applySelectedAdapterProfileToConfig(config) {
  const base = Object.assign({}, config || {});
  if (base.adapterProfileDisabled === true) {
    base.adapterProfiles = adapterProfilesFromConfig(base);
    return base;
  }
  base.adapterProfiles = adapterProfilesFromConfig(base);
  if (!base.selectedAdapterProfileId) base.selectedAdapterProfileId = RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE.profileId;
  const selected = selectedAdapterProfile(base);
  if (!base.endpointUrl) base.endpointUrl = selected.fullEndpointUrl;
  if (!Array.isArray(base.sandboxAccountAllowlist) || !base.sandboxAccountAllowlist.length) {
    base.sandboxAccountAllowlist = arrayValue(selected.sandboxAccountAllowlist).slice();
  }
  ['adapterApproved', 'CREATE_ENABLED', 'GOVERNED_SANDBOX_WRITE_ENABLED', 'QUEUE_SUBMIT_ENABLED', 'productionBuildModeEnabled'].forEach((key) => {
    if (base[key] !== true && selected[key] === true) base[key] = true;
  });
  base.profileEndpointUrl = selected.fullEndpointUrl;
  base.selectedAdapterProfile = selected;
  return base;
}

function evaluateAdapterReadiness(facts) {
  const stateFacts = Object.assign({
    finalNamesImported: false,
    completedResultReady: false,
    runnerTaskCaptured: false,
    buildSubmitted: false,
    adapterReady: false,
    requestReady: false,
    endpointConfigured: false
  }, facts || {});
  let readinessState = ADAPTER_READINESS_STATES.ADAPTER_NOT_CONFIGURED;
  if (stateFacts.finalNamesImported) readinessState = ADAPTER_READINESS_STATES.RECORDS_IMPORTED;
  else if (stateFacts.completedResultReady) readinessState = ADAPTER_READINESS_STATES.RECORDS_READY_TO_IMPORT;
  else if (stateFacts.runnerTaskCaptured) readinessState = ADAPTER_READINESS_STATES.WAITING_FOR_RUNNER_RESULT;
  else if (stateFacts.buildSubmitted) readinessState = ADAPTER_READINESS_STATES.BUILD_SUBMITTED;
  else if (stateFacts.adapterReady) readinessState = ADAPTER_READINESS_STATES.READY_TO_BUILD_RECORDS;
  else if (stateFacts.requestReady && stateFacts.endpointConfigured) readinessState = ADAPTER_READINESS_STATES.SMOKE_PREVIEW_ONLY;
  else if (stateFacts.requestReady) readinessState = ADAPTER_READINESS_STATES.SMOKE_PREVIEW_ONLY;
  const copy = READINESS_COPY[readinessState] || READINESS_COPY.smoke_preview_only;
  return {
    schema: ADAPTER_READINESS_SCHEMA_VERSION,
    readinessState,
    label: copy.label,
    headline: copy.headline,
    copy: copy.copy,
    actions: {
      showBuildButton: readinessState === ADAPTER_READINESS_STATES.READY_TO_BUILD_RECORDS,
      showRefreshButton: readinessState === ADAPTER_READINESS_STATES.BUILD_SUBMITTED || readinessState === ADAPTER_READINESS_STATES.WAITING_FOR_RUNNER_RESULT,
      showFinishButton: readinessState === ADAPTER_READINESS_STATES.RECORDS_READY_TO_IMPORT,
      showContinueToRun: readinessState === ADAPTER_READINESS_STATES.SMOKE_PREVIEW_ONLY || readinessState === ADAPTER_READINESS_STATES.ADAPTER_NOT_CONFIGURED
    },
    stateFacts
  };
}

module.exports = {
  ADAPTER_PROFILE_SCHEMA_VERSION,
  ADAPTER_READINESS_SCHEMA_VERSION,
  ADAPTER_READINESS_STATES,
  RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE,
  READINESS_COPY,
  normalizeAccountHost,
  normalizeSuiteletPath,
  adapterProfileEndpoint,
  releasedAdapterProfile,
  adapterProfilesFromConfig,
  selectedAdapterProfile,
  applySelectedAdapterProfileToConfig,
  evaluateAdapterReadiness
};
