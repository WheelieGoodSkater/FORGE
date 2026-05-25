'use strict';

const CONNECTED_BUILD_RESPONSE_SHAPE_SCHEMA_VERSION = 'forge.w283.connected-build-response-shapes.v1';
const APPROVED_SERVER_ADAPTER_RESPONSE_NORMALIZATION_SCHEMA = 'idb.integrated-build-approved-server-adapter-response-normalization.v1';
const ACTUAL_ADAPTER_RESPONSE_SHAPE_SCHEMA = 'forge.w265.actual-adapter-response-shape.v1';

const RESPONSE_SHAPE_STATUSES = Object.freeze({
  SUBMIT_TASK_CAPTURED: 'submit_task_captured',
  REFRESH_PENDING: 'refresh_pending',
  COMPLETED_RESULT_SHAPE_READY: 'completed_result_shape_ready',
  ADAPTER_ERROR_SAFE_STOP: 'adapter_error_safe_stop',
  NO_TASK_OR_RESULT_SHAPE: 'no_task_or_result_shape'
});

const TRANSPORT_NORMALIZATION_STATUSES = Object.freeze({
  FALSE_FLAG_NO_SUBMIT: 'false_flag_no_submit',
  QUEUED_PENDING: 'queued_pending',
  POLLING_PENDING: 'polling_pending',
  COMPLETED_RESULT_AWAITING_W151_IMPORT: 'completed_result_awaiting_w151_import',
  ADAPTER_TRANSPORT_ERROR_DRAWER_SAFE: 'adapter_transport_error_drawer_safe'
});

const NORMAL_UI_COPY_BY_STATUS = Object.freeze({
  submit_task_captured: 'Build submitted.',
  refresh_pending: 'Still building.',
  completed_result_shape_ready: 'Records ready.',
  adapter_error_safe_stop: 'Build stopped safely, ask admin.',
  no_task_or_result_shape: 'Build stopped safely, ask admin.'
});

const TRANSPORT_LABELS = Object.freeze({
  false_flag_no_submit: 'False flags: no submit',
  queued_pending: 'Queued: result pending',
  polling_pending: 'Polling: result pending',
  completed_result_awaiting_w151_import: 'Completed result waiting for import',
  adapter_transport_error_drawer_safe: 'Adapter response error'
});

const TRANSPORT_MESSAGES = Object.freeze({
  false_flag_no_submit: 'Server flags or adapter response did not submit the runner. The drawer keeps Build in no-submit mode.',
  queued_pending: 'The approved adapter reports a runner task id, but result capture is still pending.',
  polling_pending: 'Polling is still waiting for governed runner result capture.',
  completed_result_awaiting_w151_import: 'Completed runner result JSON is present, but W151 import guard must validate it before Open links appear.',
  adapter_transport_error_drawer_safe: 'The adapter response reported an error. The drawer keeps generated names and Open links unchanged.'
});

const COMPLETED_JSON_LOCATION_CANDIDATES = Object.freeze([
  'finalGeneratedNamesJson',
  'completedResultJson',
  'generatedNamesJson',
  'finalNamesJson',
  'resultCapture.finalGeneratedNamesJson',
  'resultCapture.completedResultJson',
  'resultCapture.generatedNamesJson',
  'body.finalGeneratedNamesJson',
  'body.completedResultJson',
  'body.generatedNamesJson',
  'body.finalNamesJson',
  'body.resultCapture.finalGeneratedNamesJson',
  'body.resultCapture.completedResultJson',
  'body.resultCapture.generatedNamesJson'
]);

function firstNonBlank() {
  for (let index = 0; index < arguments.length; index += 1) {
    const value = arguments[index];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
}

function objectValue(value) {
  return value && typeof value === 'object' ? value : {};
}

function nonBlankResult(value) {
  return value !== undefined && value !== null && (typeof value !== 'string' || value.trim());
}

function bodyFromRawResponse(rawResponse) {
  const raw = objectValue(rawResponse);
  return objectValue(raw.body || raw.payload || raw.data || raw.result || raw.response);
}

function resultCaptureFromRawResponse(rawResponse, body) {
  const raw = objectValue(rawResponse);
  return objectValue(raw.resultCapture || objectValue(body).resultCapture);
}

function completedJsonCandidates(rawResponse) {
  const raw = objectValue(rawResponse);
  const body = bodyFromRawResponse(raw);
  const resultCapture = resultCaptureFromRawResponse(raw, body);
  const nestedCapture = objectValue(body.resultCapture);
  return [
    raw.finalGeneratedNamesJson,
    raw.completedResultJson,
    raw.generatedNamesJson,
    raw.finalNamesJson,
    resultCapture.finalGeneratedNamesJson,
    resultCapture.completedResultJson,
    resultCapture.generatedNamesJson,
    body.finalGeneratedNamesJson,
    body.completedResultJson,
    body.generatedNamesJson,
    body.finalNamesJson,
    nestedCapture.finalGeneratedNamesJson,
    nestedCapture.completedResultJson,
    nestedCapture.generatedNamesJson
  ];
}

function detectCompletedJsonLocation(rawResponse) {
  const candidates = completedJsonCandidates(rawResponse);
  const index = candidates.findIndex(nonBlankResult);
  return {
    index,
    location: index >= 0 ? COMPLETED_JSON_LOCATION_CANDIDATES[index] : '',
    value: index >= 0 ? candidates[index] : null,
    ready: index >= 0
  };
}

function runnerTaskIdFromResponse(rawResponse, options) {
  const opts = options || {};
  const raw = objectValue(rawResponse);
  const body = bodyFromRawResponse(raw);
  const resultCapture = resultCaptureFromRawResponse(raw, body);
  const nestedCapture = objectValue(body.resultCapture);
  return firstNonBlank(
    raw.runnerTaskId,
    raw.runner_task_id,
    raw.taskId,
    raw.task_id,
    raw.queueTaskId,
    raw.runnerTask && raw.runnerTask.id,
    raw.task && raw.task.id,
    raw.queue && raw.queue.taskId,
    resultCapture.runnerTaskId,
    resultCapture.runner_task_id,
    body.runnerTaskId,
    body.runner_task_id,
    body.taskId,
    body.task_id,
    body.queueTaskId,
    body.runnerTask && body.runnerTask.id,
    body.task && body.task.id,
    body.queue && body.queue.taskId,
    nestedCapture.runnerTaskId,
    nestedCapture.runner_task_id,
    opts.runnerTaskId
  ) || null;
}

function idempotencyTokenFromResponse(rawResponse, options) {
  const opts = options || {};
  const raw = objectValue(rawResponse);
  const body = bodyFromRawResponse(raw);
  const resultCapture = resultCaptureFromRawResponse(raw, body);
  return firstNonBlank(
    opts.idempotencyToken,
    raw.idempotencyToken,
    raw.idempotency_key,
    body.idempotencyToken,
    body.idempotency_key,
    resultCapture.idempotencyToken
  );
}

function normalizeTransportResponse(rawResponse, options) {
  const opts = options || {};
  const result = objectValue(rawResponse);
  const resultCapture = objectValue(result.resultCapture);
  const nestedResult = objectValue(result.result || result.payload || result.data || result.response);
  const nestedCapture = objectValue(nestedResult.resultCapture);
  const rawStatus = firstNonBlank(
    result.status,
    result.adapterStatus,
    result.runnerStatus,
    resultCapture.status,
    nestedResult.status,
    nestedResult.adapterStatus,
    nestedCapture.status,
    opts.status,
    'transport_not_executed_no_submit'
  );
  const initialRunnerTaskId = firstNonBlank(
    result.runnerTaskId,
    result.runner_task_id,
    result.taskId,
    result.task_id,
    result.queueTaskId,
    resultCapture.runnerTaskId,
    resultCapture.runner_task_id,
    nestedResult.runnerTaskId,
    nestedResult.runner_task_id,
    nestedResult.taskId,
    nestedResult.task_id,
    nestedResult.queueTaskId,
    nestedCapture.runnerTaskId,
    nestedCapture.runner_task_id,
    opts.runnerTaskId
  );
  const normalizedRunnerTaskId = firstNonBlank(
    initialRunnerTaskId,
    result.taskId,
    result.runnerTask && result.runnerTask.id,
    result.task && result.task.id,
    result.queue && result.queue.taskId,
    resultCapture.taskId,
    nestedResult.taskId,
    nestedResult.runnerTask && nestedResult.runnerTask.id,
    nestedResult.task && nestedResult.task.id,
    nestedResult.queue && nestedResult.queue.taskId,
    nestedCapture.taskId
  );
  const hasError = result.error === true ||
    resultCapture.error === true ||
    nestedResult.error === true ||
    nestedCapture.error === true ||
    /error|failed|rejected|exception/i.test(rawStatus);
  const completed = detectCompletedJsonLocation(result);
  const queueSubmitted = result.queueSubmitted === true ||
    result.queued === true ||
    resultCapture.queueSubmitted === true ||
    nestedResult.queueSubmitted === true ||
    nestedResult.queued === true ||
    nestedCapture.queueSubmitted === true;
  const captureStatus = firstNonBlank(
    resultCapture.status,
    nestedCapture.status,
    opts.resultCaptureStatus,
    normalizedRunnerTaskId ? 'pending_runner_completion' : 'not_started_no_submit'
  );
  const normalizedStatus = hasError
    ? TRANSPORT_NORMALIZATION_STATUSES.ADAPTER_TRANSPORT_ERROR_DRAWER_SAFE
    : completed.ready
      ? TRANSPORT_NORMALIZATION_STATUSES.COMPLETED_RESULT_AWAITING_W151_IMPORT
      : opts.pollAttempted === true && normalizedRunnerTaskId
        ? TRANSPORT_NORMALIZATION_STATUSES.POLLING_PENDING
        : queueSubmitted && normalizedRunnerTaskId
          ? TRANSPORT_NORMALIZATION_STATUSES.QUEUED_PENDING
          : TRANSPORT_NORMALIZATION_STATUSES.FALSE_FLAG_NO_SUBMIT;
  return {
    schema: APPROVED_SERVER_ADAPTER_RESPONSE_NORMALIZATION_SCHEMA,
    status: normalizedStatus,
    label: TRANSPORT_LABELS[normalizedStatus],
    message: TRANSPORT_MESSAGES[normalizedStatus],
    rawStatus,
    queueSubmitted: normalizedStatus === TRANSPORT_NORMALIZATION_STATUSES.ADAPTER_TRANSPORT_ERROR_DRAWER_SAFE ? false : queueSubmitted,
    runnerTaskId: normalizedStatus === TRANSPORT_NORMALIZATION_STATUSES.FALSE_FLAG_NO_SUBMIT ? null : normalizedRunnerTaskId,
    resultCaptureStatus: normalizedStatus === TRANSPORT_NORMALIZATION_STATUSES.FALSE_FLAG_NO_SUBMIT ? 'not_started_no_submit' : captureStatus,
    resultCapture: Object.assign({}, resultCapture, {
      status: normalizedStatus === TRANSPORT_NORMALIZATION_STATUSES.FALSE_FLAG_NO_SUBMIT ? 'not_started_no_submit' : captureStatus,
      runnerTaskId: normalizedRunnerTaskId || resultCapture.runnerTaskId || '',
      finalGeneratedNamesReady: completed.ready && normalizedStatus === TRANSPORT_NORMALIZATION_STATUSES.COMPLETED_RESULT_AWAITING_W151_IMPORT,
      finalGeneratedNamesJson: completed.ready ? completed.value : null
    }),
    pollAttempted: opts.pollAttempted === true,
    finalGeneratedNamesJsonReady: completed.ready && normalizedStatus === TRANSPORT_NORMALIZATION_STATUSES.COMPLETED_RESULT_AWAITING_W151_IMPORT,
    finalGeneratedNamesJson: completed.ready ? completed.value : null,
    importGuard: 'W151 completed runner result JSON guard owns final generated names import before drawer navigation links become active.',
    activeOpenLinks: 0,
    visualTestingBlocked: true,
    noRegression: {
      noDrawerWrites: true,
      noDrawerTransactionWrites: true,
      noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: true,
      noActiveOpenLinksWithoutRealUrls: true,
      internalRunnerOwnership: true,
      rollbackByDisablingServerFlags: true
    }
  };
}

function normalizeResponseShape(rawResponse, options) {
  const opts = options || {};
  const raw = objectValue(rawResponse);
  const body = bodyFromRawResponse(raw);
  const resultCapture = resultCaptureFromRawResponse(raw, body);
  const completed = detectCompletedJsonLocation(raw);
  const flattened = Object.assign({}, body, raw, {
    resultCapture,
    runnerTaskId: runnerTaskIdFromResponse(raw, opts),
    finalGeneratedNamesJson: completed.value
  });
  const normalized = normalizeTransportResponse(flattened, {
    pollAttempted: opts.phase === 'refresh' || opts.pollAttempted === true,
    runnerTaskId: opts.runnerTaskId,
    resultCaptureStatus: opts.resultCaptureStatus
  });
  const phase = opts.phase || 'unknown';
  const hasError = normalized.status === TRANSPORT_NORMALIZATION_STATUSES.ADAPTER_TRANSPORT_ERROR_DRAWER_SAFE;
  const status = hasError
    ? RESPONSE_SHAPE_STATUSES.ADAPTER_ERROR_SAFE_STOP
    : normalized.finalGeneratedNamesJsonReady
      ? RESPONSE_SHAPE_STATUSES.COMPLETED_RESULT_SHAPE_READY
      : normalized.runnerTaskId
        ? phase === 'submit'
          ? RESPONSE_SHAPE_STATUSES.SUBMIT_TASK_CAPTURED
          : RESPONSE_SHAPE_STATUSES.REFRESH_PENDING
        : RESPONSE_SHAPE_STATUSES.NO_TASK_OR_RESULT_SHAPE;
  const idempotencyToken = idempotencyTokenFromResponse(raw, opts);
  const nestedCapture = objectValue(body.resultCapture);
  return {
    schema: ACTUAL_ADAPTER_RESPONSE_SHAPE_SCHEMA,
    phase,
    status,
    http: {
      status: firstNonBlank(raw.httpStatus, raw.statusCode, raw.code, opts.httpStatus),
      ok: raw.ok === true || raw.success === true || body.ok === true
    },
    adapterStatus: firstNonBlank(raw.status, raw.adapterStatus, raw.runnerStatus, resultCapture.status, body.status, body.adapterStatus, nestedCapture.status),
    runnerTaskId: normalized.runnerTaskId || null,
    idempotencyToken: idempotencyToken || '',
    resultCaptureStatus: normalized.resultCaptureStatus || '',
    finalGeneratedNamesJsonLocation: completed.location,
    finalGeneratedNamesJsonReady: normalized.finalGeneratedNamesJsonReady === true,
    finalGeneratedNamesJson: normalized.finalGeneratedNamesJson || null,
    adapterSafeErrorCopy: hasError ? NORMAL_UI_COPY_BY_STATUS.adapter_error_safe_stop : '',
    normalUiCopy: NORMAL_UI_COPY_BY_STATUS[status] || NORMAL_UI_COPY_BY_STATUS.no_task_or_result_shape,
    normalizedResponse: normalized,
    rawEvidence: {
      adminOnly: true,
      archivedOnly: true,
      rawStatus: normalized.rawStatus,
      responseKeys: Object.keys(raw),
      bodyKeys: body && typeof body === 'object' ? Object.keys(body) : [],
      resultCaptureKeys: resultCapture && typeof resultCapture === 'object' ? Object.keys(resultCapture) : []
    },
    guardrails: {
      normalUiHidesRawEvidence: true,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true,
      noW144DeploymentUpdateInThisBlock: true,
      w245W151ValidationStillRequired: true,
      cannotDeclareImportValid: true
    }
  };
}

function contractSummary() {
  return {
    schema: CONNECTED_BUILD_RESPONSE_SHAPE_SCHEMA_VERSION,
    status: 'contract_ready',
    actualShapeSchema: ACTUAL_ADAPTER_RESPONSE_SHAPE_SCHEMA,
    transportNormalizationSchema: APPROVED_SERVER_ADAPTER_RESPONSE_NORMALIZATION_SCHEMA,
    statuses: Object.keys(RESPONSE_SHAPE_STATUSES).map((key) => RESPONSE_SHAPE_STATUSES[key]),
    completedJsonLocationCandidates: COMPLETED_JSON_LOCATION_CANDIDATES.slice(),
    validationBoundary: {
      w151OwnsImportValidity: true,
      w214OwnsSemanticGuard: true,
      w245OwnsCanonicalImportNormalization: true,
      responseShapeMayLocateCompletedJsonButCannotDeclareImportValid: true
    },
    runtimeBoundary: {
      noSubmitExecutionMoved: true,
      noRefreshExecutionMoved: true,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true,
      noW144DeploymentUpdate: true
    }
  };
}

module.exports = {
  CONNECTED_BUILD_RESPONSE_SHAPE_SCHEMA_VERSION,
  APPROVED_SERVER_ADAPTER_RESPONSE_NORMALIZATION_SCHEMA,
  ACTUAL_ADAPTER_RESPONSE_SHAPE_SCHEMA,
  RESPONSE_SHAPE_STATUSES,
  TRANSPORT_NORMALIZATION_STATUSES,
  NORMAL_UI_COPY_BY_STATUS,
  COMPLETED_JSON_LOCATION_CANDIDATES,
  detectCompletedJsonLocation,
  runnerTaskIdFromResponse,
  idempotencyTokenFromResponse,
  normalizeTransportResponse,
  normalizeResponseShape,
  contractSummary
};
