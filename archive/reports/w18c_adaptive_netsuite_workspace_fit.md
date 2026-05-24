# W18C Adaptive NetSuite Workspace Fit

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Let NetSuite and IDB operate side by side when the drawer is expanded.

## Goal

Expanded IDB reserves right-side space while the NetSuite working page auto-fits to the remaining left-side browser width. The behavior must be reversible, stable, and safe across NetSuite pages.

## What Changed

- Added root CSS variables for drawer width and reserved drawer space.
- Added `body.idb-workspace-fit` as the reversible page offset.
- Added `workspaceFitEnabled` to require enough viewport space before fitting.
- Added `applyWorkspaceFit` to reserve the drawer width only when safe.
- Added `clearWorkspaceFit` to restore original page width on close or fallback.
- Added resize handling so workspace fit downgrades to overlay mode on narrow screens.
- Added cross-tab storage handling so open drawer state reapplies workspace fit.

## Safety Model

The implementation does not edit NetSuite page internals. It only applies a reversible body class and root CSS variable owned by IDB. If the browser is too narrow or the remaining left workspace would be too small, IDB stays in overlay mode.

## Consultant Test

1. Open a NetSuite Home page on a wide browser.
2. Open IDB.
3. Confirm the NetSuite page visibly narrows to the left instead of being hidden under the drawer.
4. Close IDB.
5. Confirm the NetSuite page returns to full width.
6. Resize the browser narrower.
7. Reopen IDB and confirm it falls back to overlay mode when side-by-side would be too cramped.
8. Repeat on Customer Record, Sales Order View, and Item / Inventory pages.

## No Regression

- No live writes.
- No automatic creation.
- No lane/proof/toggle changes.
- No NetSuite internal DOM mutation.
- Workspace fit is reversible on close.
- Overlay fallback remains available for narrow or incompatible pages.
