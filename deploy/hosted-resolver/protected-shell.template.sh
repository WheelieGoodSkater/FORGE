#!/usr/bin/env bash
# Template only. Do not paste real secrets into this file.
# Copy these exports into a protected shell, password manager shell item, or CI secret-backed task.

export IDB_REMOTE_RESOLVER_SMOKE=1
export IDB_REMOTE_RESOLVER_BASE_URL="https://<hosted-resolver-staging-origin>"
export IDB_REMOTE_RESOLVER_TOKEN="<set-from-secret-manager-or-protected-shell>"
export IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN="https://<approved-netsuite-staging-origin>"
export IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN="https://blocked-origin.example"

npm run harness:real-https-endpoint-rerun-w80r
