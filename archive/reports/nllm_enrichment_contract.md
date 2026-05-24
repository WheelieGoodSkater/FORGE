# N/LLM Enrichment Contract

Generated: 2026-05-09

Prompt: M10 - N/LLM Enrichment Contract

Decision: COMPLETE as review-only contract. No enrichment can create records or change lane authority.

## Purpose

The enrichment layer can later use customer, website, notes, selected lane, proof anchor, and planned records to generate:

- Better record descriptions.
- Field assumptions.
- Demo use notes.
- Compact ROI and competitive language.

## Guardrails

- Advisory only.
- Reviewable before use.
- Cannot change selected lane.
- Cannot change proof anchor.
- Cannot create records.
- Cannot remove required DCC V4 fields.

## Artifacts

- `data/nllm_enrichment_contract.json`
- Export payload field: `nllmEnrichmentRequest`

## UI Placement

Enrichment output should appear in Review as compact record assumptions and in Run only as one concise value lens. It must not become a long live-demo text block.
