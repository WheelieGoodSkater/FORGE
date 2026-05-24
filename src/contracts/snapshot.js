'use strict';

const operatingModes = require('./operatingModes');
const recordRoles = require('./recordRoles');
const importStates = require('./importStates');
const netSuiteLinks = require('./netSuiteLinks');

const SNAPSHOT_VERSION = 'forge.contract-snapshot.w241.v1';

function buildContractSnapshot(options) {
  const opts = options || {};
  return {
    schema: 'forge.canonical-runtime-contract-snapshot.v1',
    snapshotVersion: opts.snapshotVersion || SNAPSHOT_VERSION,
    generatedFrom: [
      'src/contracts/operatingModes.js',
      'src/contracts/recordRoles.js',
      'src/contracts/importStates.js',
      'src/contracts/netSuiteLinks.js',
      'src/contracts/runnerResultCompatibility.js'
    ],
    operatingModes: operatingModes.OPERATING_MODES,
    knownDomainModeHints: operatingModes.KNOWN_DOMAIN_MODE_HINTS,
    recordRoles: {
      aliases: recordRoles.ROLE_ALIASES,
      labels: recordRoles.ROLE_LABELS,
      legacySlotToRole: recordRoles.LEGACY_SLOT_TO_ROLE,
      modePrimaryRoleAliases: recordRoles.MODE_PRIMARY_ROLE_ALIASES
    },
    importStates: importStates.IMPORT_STATES,
    frozenSuccessCopy: importStates.FROZEN_SUCCESS_COPY,
    frozenRecoveryCopy: importStates.FROZEN_RECOVERY_COPY,
    netSuiteLinks: {
      supportedRecordPaths: netSuiteLinks.SUPPORTED_RECORD_PATHS,
      numericInternalIdRequired: true,
      supportedNetSuiteUrlRequired: true
    },
    compatibility: {
      legacyFiveRecordShapeAccepted: true,
      canonicalRecordsArrayAccepted: true,
      fakeOpenLinksBlockedBeforeValidImport: true,
      normalConsultantUiHidesDiagnostics: true
    }
  };
}

module.exports = {
  SNAPSHOT_VERSION,
  buildContractSnapshot
};
