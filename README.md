# SheetPilot

<img src="./assets/sheetpilot_icon_only.jpg" alt="SheetPilot icon" width="80" />

Google Sheets™ productivity toolkit built with Google Apps Script.

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

- **1.1 — Data Cleaner**: remove empty rows/columns, remove duplicates, trim whitespace, normalize data
- **1.2 — Smart Formatting**: format headers, auto-resize columns, freeze headers, create filters, format dates/numbers

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