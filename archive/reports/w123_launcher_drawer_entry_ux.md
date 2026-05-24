# W123 Launcher And Drawer Entry UX

Status: launcher_entry_ux_ready

## What Changed

- Replaced the fixed middle-right launcher position with a right-edge snap launcher.
- Added snap positions: top right, middle right, and bottom right.
- Persisted the selected launcher position in browser storage.
- Added keyboard movement with ArrowUp / ArrowDown and reset with Home.
- Added right-click reset to the default middle-right position.
- Preserved one-active-drawer duplicate cleanup and normal click-to-open behavior.

## Visual Test Policy

- Default: harness_first
- Visual NetSuite testing is required only when the visible consultant workflow materially changes.
- W123 does not require user visual testing now; W124 does.

## W124-W133 Surgical Architecture Plan

- W124 Build Results Tab Reset: Make Review earn its place by becoming Build Handoff before generated names and Build Results after import. Visual test: yes (Visible consultant workflow materially changes.)
- W125 Consultant-Safe Export Language: Shield visible export labels from internal implementation language while preserving schema compatibility. Visual test: no (Harness can prove labels and export contracts unless visible layout changes.)
- W126 Value Coach Intelligence Upgrade: Reduce repetition and add competitor/FUD prep using named competitor or clearly labeled inferred alternatives. Visual test: yes (ROI / Competitive first viewport changes and needs consultant readability feedback.)
- W127 Run Story Engine V2: Replace similar chips with differentiated story stages tied to pain, proof, metric, objection, and next decision. Visual test: yes (Live demo coaching changes materially.)
- W128 Final Names Navigation Layer: Use imported final generated NetSuite record names and links throughout Build Results and Run pivots. Visual test: yes (Post-build navigation is a core live consultant workflow.)
- W129 Governed Invocation Readiness: Define exact safety gates before any future build-engine invocation from the drawer. Visual test: no (Contract and trace gate only; no visible write action enabled.)
- W130 Preview-Only Invocation Bridge: Prepare preview-only invocation artifacts without submit, queue, script invocation, or write. Visual test: no (Operator/harness smoke before consultant UI exposure.)
- W131 Sandbox Build Invocation With Type-To-Confirm: Enable first governed sandbox build invocation behind confirmation and operator approval. Visual test: yes (This is the first visible step toward real system writes.)
- W132 Real Build Result Import: Import real generated names from a completed sandbox build and prove the drawer uses them. Visual test: yes (Consultant must confirm final names and navigation are useful.)
- W133 First Write Pilot Scorecard: Grade safety, usability, rollback, trace, and generated-name reliability before broader pilot. Visual test: no (Evidence review and go/no-go scorecard.)

## Validator Gates

- PASS w123_launcher_positions_defined: ["top_right","middle_right","bottom_right"]
- PASS w123_launcher_snap_math: ["top_right","middle_right","bottom_right"]
- PASS w123_invalid_position_defaults_safely: {"schema":"idb.w123-launcher-position.v1","position":"middle_right","label":"Middle right","snapPositions":["top_right","middle_right","bottom_right"],"defaultPosition":"middle_right","persistentStorageKey":"idb.drawer.launcher.position.v1","noRegression":{"drawerOpenBehaviorUnchanged":true,"duplicateRootGuardPreserved":true,"noDrawerWrites":true,"noSuiteScriptInvocationFromDrawer":true,"noTransactionWritesFromDrawer":true}}
- PASS w123_apply_launcher_position_sets_accessible_attrs: {"data-launcher-position":"bottom_right","data-launcher-label":"Bottom right","aria-label":"Open Intelligent Demo Builder. Launcher position Bottom right. Drag to move."}
- PASS w123_css_has_right_edge_snap_positions: snap CSS
- PASS w123_position_persistence_and_reset_present: storage and reset controls
- PASS w123_keyboard_focus_accessibility_present: keyboard snap and reset
- PASS w123_duplicate_root_guard_preserved: W94 duplicate guard
- PASS w123_drawer_open_behavior_preserved: click still opens drawer
- PASS w123_no_forbidden_visible_acronyms_in_launcher_labels: {"title":"Open Intelligent Demo Builder. Launcher: Bottom right. Drag to move.","aria":"Open Intelligent Demo Builder. Launcher position Bottom right. Drag to move."}
- PASS w123_visual_test_policy_is_surgical: {"default":"harness_first","requireVisualNetSuiteTestOnlyWhen":["launcher/drawer entry changes are introduced","Plan, Build/Results, ROI/Competitive, Run, or Trace first viewport materially changes","final generated names import changes visible behavior","governed sandbox invocation is exposed","real generated NetSuite names or links are used for live navigation"],"skipVisualTestWhen":["contract-only changes","trace-only changes","internal schema or validator changes","no visible consultant copy/layout changes"]}
- PASS w123_no_write_boundaries_preserved: {"drawerOpenBehaviorUnchanged":true,"duplicateRootGuardPreserved":true,"noDrawerWrites":true,"noSuiteScriptInvocationFromDrawer":true,"noTransactionWritesFromDrawer":true}

## Best Next Codex Prompt

Move through W124: Build Results Tab Reset. Rename and reframe Review into Build/Results so it earns consultant attention: before final generated names are imported, show only a compact Build Handoff checkpoint with what the consultant requested, selected demo path, export handoff action, operator verification, and what is waiting; after final generated names are imported, transform the tab into Build Results showing final generated NetSuite records, names, links, warnings, and navigation pivots. Hide internal parameter/config/runner detail behind one collapsed internal section. Preserve W92/W110 state authority, W116-W123 final-name and launcher behavior, no drawer writes, no SuiteScript invocation from the drawer, no transaction writes, consultant confirmation required, website identity/naming support, notes-driven value story, and build-engine ownership of generated records. Output compressed Build/Results UI, final-name behavior, validator gates, W124 report, and best next Codex prompt.
