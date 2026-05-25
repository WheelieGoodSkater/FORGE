# W250 Install-Ready Visual Smoke Packet

## Purpose
Use this packet after installing the updated `idb-drawer.user.js` in Tampermonkey. W250 only needs a targeted visual smoke because it changes lane-aware story labels and confirms the W249 launcher icon treatment.

## Preconditions
- Install/update `idb-drawer.user.js`.
- Do not update W144, runner deployment, SuiteScript deployment, or image lookup settings.
- Do not invoke the live runner for this smoke.

## Smoke Checks
1. Launcher icon
   - The floating launcher uses the repo-local `assets/forge-icon.png` FORGE icon treatment.
   - It no longer shows the text-only circular `FORGE` button.

2. Pre-import guard
   - Review/Run do not show the compact story card before a valid completed import.
   - Fake Open links remain blocked before valid import.

3. Valid import story surface
   - Review/Run show the compact live demo talk track after a valid completed import.
   - The Open target uses real returned record names.
   - Industrial distributor and CPG distributor proof records read as `Product SKU` or `Availability/Replenishment Flow`, not `Finished/Assembly Item`.
   - Manufacturing lanes still show manufacturing labels such as `Finished/Assembly Item`, `Work Order`, `Formula or Batch Structure`, or `Finished Food/Batch Item` where supported by the returned records.

4. Evidence uncertainty
   - Weak or conflicting evidence asks the consultant to confirm the lane before opening proof records.
   - N/LLM is shown as advisory-only and uncertainty remains visible.

## Expected Decision
- Targeted visual smoke: recommended after install.
- Broad NetSuite visual regression: not required for W250.
