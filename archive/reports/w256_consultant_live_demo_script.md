# W256 Consultant Live Demo Script From Receipt Evidence

## Scope
- Adds a compact live-demo script helper sourced from W245 returned records, W246 lane packs, W254 receipt rows, and W255 first-glance story data.
- Renders a consultant-facing script block inside the Review/Run story surface after valid import.
- Keeps the W254 receipt expandable below the script for trust review.

## Guardrails
- Script does not claim record creation, write actions, measured ROI, guaranteed outcomes, or unsupported lane fit.
- Weak or conflicting evidence produces a confirmation/uncertainty script.
- W255 receipt-driven QA remains available.
- W252 proposal review stays admin-only, W253 acceptance packet stays review-only, and W254 receipt stays consultant-safe.

## Validation
- `archive/tools/run_w256_consultant_live_demo_script_harness.js`
- `archive/trace_samples/w256_consultant_live_demo_script_trace.json`
