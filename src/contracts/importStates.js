'use strict';

const IMPORT_STATES = Object.freeze({
  ready_to_build: {
    consultantCopy: 'Ready to build.',
    allowedAction: 'Build records'
  },
  submitted: {
    consultantCopy: 'Build submitted.',
    allowedAction: 'Wait for records'
  },
  waiting_for_runner: {
    consultantCopy: 'Records are being prepared.',
    allowedAction: 'Check status'
  },
  completed_result_found: {
    consultantCopy: 'Records are ready to import.',
    allowedAction: 'Bring back records'
  },
  imported: {
    consultantCopy: 'Build results are ready.',
    allowedAction: 'Open returned records'
  },
  partial: {
    consultantCopy: 'Core build records are ready. Some detail was not returned.',
    allowedAction: 'Use available records'
  },
  failed_recoverable: {
    consultantCopy: 'Build stopped safely.',
    allowedAction: 'Ask admin to review and retry'
  }
});

const FROZEN_SUCCESS_COPY = Object.freeze({
  complete: 'Build results are ready.',
  partialFoodWip: 'Food batch records are ready. WIP detail was not returned.'
});

const FROZEN_RECOVERY_COPY = Object.freeze({
  pasteCompleted: 'Paste the completed build result.',
  modeMismatch: 'This result does not match the selected operating mode.',
  latestCompleted: 'Use the latest completed runner result.',
  realLinks: 'Ask the runner to return real NetSuite links.',
  waitForImport: 'Use available records only after import succeeds.'
});

module.exports = {
  IMPORT_STATES,
  FROZEN_SUCCESS_COPY,
  FROZEN_RECOVERY_COPY
};
