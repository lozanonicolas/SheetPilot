<div align="center">

<img src="./assets/sheetpilot_icon_only.png" alt="SheetPilot icon" width="200" />

# SheetPilot

Google Sheets™ productivity toolkit built with Google Apps Script.

</div>

## Overview

SheetPilot scans the active spreadsheet in Google Sheets™ for common data-quality problems — empty rows/columns, duplicate or missing headers, incomplete cells, inconsistent data types, formula errors, and duplicate rows — and gives you a single Quality Score summarizing the sheet's health. One click highlights every issue directly in the sheet so you know exactly what to fix.

## Features (v1.0 — Analyzer)

- Row & column counts
- Empty row / column detection
- Duplicate header detection (case- and whitespace-insensitive)
- Missing header detection
- Incomplete data cell detection
- Data type inconsistency detection (per column, majority-type based)
- Formula error detection (`#DIV/0!`, `#REF!`, `#N/A`, etc.)
- Duplicate row detection
- One-click "Highlight Issues" — marks every problem cell/row in bright yellow
- Data Quality Score (0–100) summarizing overall sheet health

## Roadmap

### 1.1 — Data Cleaner
- Remove empty rows/columns
- Remove duplicates
- Trim whitespace
- Normalize data
- Basic error handling (try/catch with clear messages) before any destructive action
- Confirmation step before irreversible changes (e.g. preview before deleting rows)
- Activate the "Cleaner" tab in the sidebar

### 1.2 — Smart Formatting
- Format headers
- Auto-resize columns
- Freeze headers
- Create filters
- Format dates/numbers
- Non-color indicators alongside the red/amber/green status system, for accessibility

### Housekeeping (ongoing, no fixed version)
- CI pipeline to run `Tests.js` automatically on push
- `CHANGELOG.md`
- README screenshots / demo GIF of the sidebar in action
- Marketplace prep: icon sizes, listing screenshots, OAuth verification
- Recalibrate `SCORE_SMOOTHING_BASELINE` with real-world usage

### Future ideas (post-v1, not yet scheduled)
- Outlier detection within numeric columns
- Inconsistent date format detection (e.g. mixed DD/MM/YYYY vs MM/DD/YYYY)
- Export analysis report to PDF or a new sheet
- Column-level insights (min/max/average, unique values, % completeness)
- User-configurable rules (custom weights, excluded columns) — ties into the "Settings" tab
- Compare two sheets/tabs for differences

## Tech stack

- Google Apps Script (V8 runtime)
- Vanilla JS, HTML, CSS (sidebar UI)
- [clasp](https://github.com/google/clasp) for local development

## Development setup

```bash
git clone https://github.com/lozanonicolas/SheetPilot.git
cd SheetPilot
clasp login
clasp push
```

Open any spreadsheet in Google Sheets™, then use the **SheetPilot** menu to launch the sidebar.

## Running tests

Tests live in `Tests.js` and run inside the Apps Script editor (Apps Script has no native external test runner).

1. `clasp push`
2. Open the project in the Apps Script editor (`clasp open-script`, or via [script.google.com](https://script.google.com))
3. Select `runAllTests` from the function dropdown and click **Run**
4. Check the Execution log for ✅ results

## Privacy & Terms

- [Privacy Policy](./PRIVACY.md)
- [Terms of Service](./TERMS.md)

## License

MIT — see [LICENSE](./LICENSE)