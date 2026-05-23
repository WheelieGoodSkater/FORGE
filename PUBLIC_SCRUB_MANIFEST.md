# Public Scrub Manifest

The FORGE repo-ready package was scrubbed for public GitHub use.

## Replaced

- NetSuite sandbox hostnames -> `YOUR_ACCOUNT_ID.app.netsuite.com`
- Concrete Suitelet script/deploy URLs -> placeholder script/deploy URL
- Local macOS paths -> `/path/to/workspace` and `/path/to/downloads`
- Operator personal name -> `Operator User`
- Scheduled runner task IDs -> `SCHEDSCRIPT_REDACTED`

## Excluded

- Historical zip upload bundles
- macOS `.DS_Store` files
- nested one-off upload packet folders
- `node_modules`
- git metadata

## Preserved

- FORGE drawer source
- FORGE logo assets
- NetSuite adapter and runner source
- harnesses, reports, data contracts, and sanitized trace samples
- no-drawer-write / governed-runner boundaries
