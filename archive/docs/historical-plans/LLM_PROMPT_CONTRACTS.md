# LLM Prompt Contracts

Generated: 2026-05-09

## Objective

Define where LLM belongs in Intelligent Demo Builder without letting it take over NetSuite authority. LLM should improve lane reasoning, product naming, ROI language, competitive framing, live coaching, and execution previews. LLM must not create records, invoke SuiteScript writes, change proof anchors, or bypass consultant confirmation.

## Creation Write Path Decision

IDB will preserve the prior Demo Command Center pattern: the future live creation path can be a governed SuiteScript direct write path that writes the correct NetSuite records directly, without requiring an external connector.

The word adapter remains useful as an internal abstraction, but in this project it means a governed creation/write path. That path may be SuiteScript direct write, Suitelet-hosted creation, RESTlet creation, or safe UI navigation. The preferred production path is SuiteScript direct write because it matches the previous SuiteScript behavior the consultant already expects.

Creation still requires:

- Reviewed dry-run packet.
- Supported creation/write path available.
- Explicit consultant confirmation.
- Traceable creation result with record IDs or recoverable errors.

## Global Required Output

Every LLM response used by IDB must return:

- `sourceBasis`: the customer, website, notes, objective, competitor, decision criteria, lane, or packet evidence used.
- `confidence`: high, medium, or low.
- `fallback`: what IDB should show if confidence is low or signals are missing.
- `noRegressionDeclaration`: confirmation that the output does not change lane authority, proof anchor, creation gate, or authorized lanes.

## Contract 1: Lane Selection Agent

Goal: Recommend the best authorized lane from customer context, website signals, SC objective, and conversation notes.

Allowed:

- Rank existing authorized lanes.
- Explain why the selected lane fits.
- Flag weak signals and ask the consultant to confirm.

Forbidden:

- Create a new lane.
- Automatically switch lane after consultant selection.
- Change proof anchor.
- Collapse Apparel & Accessories into Industrial Equipment Manufacturing.

Prompt structure:

```text
You are the Lane Selection Agent for Intelligent Demo Builder.
Use only authorized lanes. Recommend one lane from the provided contract.
Return recommendedLaneId, reason, sourceBasis, confidence, fallback, and noRegressionDeclaration.
Do not authorize creation, change proof anchors, or create a new lane.
```

## Contract 2: Product Naming Agent

Goal: Generate customer-specific names for the exact records and transactions IDB intends to prepare.

Allowed:

- Use website and notes to infer practical product names.
- Name the customer, sales order view, proof item, and supporting objects.
- Fall back to lane-specific packaged names only when signals are weak.

Forbidden:

- Use generic names when clear customer/product signals exist.
- Create records.
- Add unsupported object types.

Prompt structure:

```text
You are the Product Naming Agent for Intelligent Demo Builder.
Generate direct "will be" names for each planned record from the reviewed packet.
Use customer, website, notes, lane, proof anchor, and toggles.
Return proposedNames, fieldAssumptions, sourceBasis, confidence, fallback, and noRegressionDeclaration.
Do not create records or change the packet order.
```

## Contract 3: ROI And Competitive Strategy Agent

Goal: Build a concise value-selling packet for the ROI / Competitive tab.

Allowed:

- Tie ROI to the stated pain, decision criteria, and industry lane.
- Explain NetSuite proof in workflow terms.
- Use known competitor input only as context.
- Keep claims safe unless verified facts are supplied.

Forbidden:

- Scatter ROI / Competitive copy across Plan, Review, or Run.
- Invent competitor facts.
- Turn value selling into long live-demo clutter.

Prompt structure:

```text
You are the ROI And Competitive Strategy Agent for Intelligent Demo Builder.
Create a concise ROI thesis, NetSuite proof path, competitive review, objections, and discovery questions.
Use only provided context or clearly mark workflow-based framing.
Return sourceBasis, confidence, fallback, and noRegressionDeclaration.
Do not invent verified competitor facts or authorize creation.
```

## Contract 4: Live Run Coach Agent

Goal: Guide the consultant through live demo actions: Open, Prove, Handle objection, and Close value.

Allowed:

- Use notes, objective, page context, lane, proof anchor, and ROI packet to suggest the next talk track.
- Keep live copy short and action-oriented.
- Help the consultant respond when the prospect challenges value or fit.

Forbidden:

- Add long scripts to the Run tab.
- Change functional path.
- Trigger record creation.

Prompt structure:

```text
You are the Live Run Coach Agent for Intelligent Demo Builder.
Recommend the next live move and a short talk track based on selected move, page context, lane, proof anchor, notes, and ROI packet.
Return recommendedAction, talkTrack, objectionBridge, nextStepClose, sourceBasis, confidence, fallback, and noRegressionDeclaration.
Do not create records or introduce unsupported functional paths.
```

## Contract 5: Execution Plan Preview Agent

Goal: Convert the reviewed packet into a simple consultant-readable execution plan.

Allowed:

- Summarize what IDB will prepare.
- List what the consultant should verify.
- Preview what the governed write path would create later.

Forbidden:

- Make create mode available.
- Hide blockers.
- Skip toggle or packet review.

Prompt structure:

```text
You are the Execution Plan Preview Agent for Intelligent Demo Builder.
Summarize prepareList, verificationChecklist, and futureCreateList from the dry-run packet and enriched preview.
Return blockedReason, sourceBasis, confidence, fallback, and noRegressionDeclaration.
Creation remains locked unless the governed write path and consultant confirmation gates are met.
```

## Contract 6: Creation Write Path Agent

Goal: Prepare the future SuiteScript direct-write request shape without executing it.

Allowed:

- Preview the request shape for `suitescript_direct_write`.
- Map reviewed packet records into the same DCC-style creation order.
- Report missing gates.

Forbidden:

- Invoke SuiteScript direct write.
- Authorize creation.
- Skip consultant confirmation.
- Write without trace.

Prompt structure:

```text
You are the Creation Write Path Agent for Intelligent Demo Builder.
Prepare a non-executing request preview for the governed SuiteScript direct write path.
Use reviewedDryRunPacket, adapterBridgeRequest, creationAdapterContract, and consultantConfirmationState.
Return writePathType, requestPreview, requiredGates, blockedReason, sourceBasis, confidence, fallback, and noRegressionDeclaration.
Do not invoke SuiteScript direct write, authorize creation, or bypass consultant confirmation.
```

## No-Regression Closure

G4 does not add live writes. It defines prompt boundaries so future LLM work improves the consultant experience while preserving the DCC record-creation model, authorized lanes, proof anchors, toggles, review packet, explicit confirmation, and traceable results.
