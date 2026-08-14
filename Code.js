function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SheetPilot')
    .addItem('Open SheetPilot', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService
    .createHtmlOutputFromFile('sidebar')
    .setTitle('SheetPilot');

  SpreadsheetApp.getUi().showSidebar(html);
}

function getActiveSheetValues() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  return {
    name: sheet.getName(),
    values: trimToContentBounds(sheet.getDataRange().getValues())
  };
}

function analyzeSheetData(values) {
  let emptyRows = 0;
  let emptyColumns = 0;

  // Check for empty rows
  for (const row of values) {
    if (row.every(cell => cell === '')) {
      emptyRows++;
    }
  }

  // Check for empty columns
  for (let column = 0; column < values[0].length; column++) {
    let isEmpty = true;

    for (let row = 1; row < values.length; row++) {
      if (values[row][column] !== '') {
        isEmpty = false;
        break;
      }
    }

    if (isEmpty) {
      emptyColumns++;
    }
  }

  const duplicateHeaders = findDuplicateHeaders(values);
  const incompleteCells = findIncompleteDataCells(values);
  const missingHeaders = incompleteCells.filter(cell => cell.row === 1);
  const dataTypeIssues = findDataTypeInconsistencies(values);
  const formulaErrors = findFormulaErrors(values);
  const duplicateRows = findDuplicateRows(values);

  const analysis = {
    rows: values.length - 1,
    columns: values[0].length,
    emptyRows: emptyRows,
    emptyColumns: emptyColumns,
    duplicateHeaders: duplicateHeaders,
    missingHeaders: missingHeaders,
    incompleteCells: incompleteCells,
    dataTypeIssues: dataTypeIssues,
    formulaErrors: formulaErrors,
    duplicateRows: duplicateRows
  };

  analysis.qualityScore = calculateQualityScore(analysis);

  return analysis;
}

function analyzeActiveSheet() {
  const sheetData = getActiveSheetValues();
  const analysis = analyzeSheetData(sheetData.values);

  return {
    name: sheetData.name,
    ...analysis
  };
}

function findDuplicateHeaders(values) {
  const headers = values[0];

  // Normalize each header: trim whitespace + lowercase,
  // so "Name", "name", and " Name " are all treated as the same header.
  const normalized = headers.map(h => String(h).trim().toLowerCase());

  const seen = {};
  const duplicates = [];

  normalized.forEach((header, index) => {
    if (header === '') return; // empty headers are covered by findIncompleteDataCells

    if (seen[header] !== undefined) {
      duplicates.push({
        row: 1,
        column: index + 1,
        text: headers[index] // original text, used for display in the sidebar
      });
    } else {
      seen[header] = index;
    }
  });

  return duplicates;
}

function findIncompleteDataCells(values) {
  const missingCells = [];

  for (let row = 0; row < values.length; row++) {
    for (let column = 0; column < values[row].length; column++) {
      const cell = String(values[row][column]).trim();

      if (cell === '') {
        missingCells.push({ row: row + 1, column: column + 1 });
      }
    }
  }

  return missingCells;
}

function highlightCells(cellPositions) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  cellPositions.forEach(cell => {
    sheet.getRange(cell.row, cell.column).setBackground('#FFFF00'); //Bright Yellow
  });
}

function highlightIssues() {
  const sheetData = getActiveSheetValues();
  const duplicateHeaders = findDuplicateHeaders(sheetData.values);
  const incompleteCells = findIncompleteDataCells(sheetData.values);
  const dataTypeIssues = findDataTypeInconsistencies(sheetData.values);
  const formulaErrors = findFormulaErrors(sheetData.values);
  const duplicateRows = findDuplicateRows(sheetData.values);

  highlightCells(duplicateHeaders);
  highlightCells(incompleteCells);
  highlightCells(dataTypeIssues.cells);
  highlightCells(formulaErrors.cells);
  highlightRows(duplicateRows);
}

function getCellType(cell) {
  if (typeof cell === 'number') return 'number';
  if (Object.prototype.toString.call(cell) === '[object Date]') return 'date';
  return 'text';
}

function findDataTypeInconsistencies(values) {
  const cells = [];
  const columnSummary = [];
  const columnCount = values[0].length;

  for (let column = 0; column < columnCount; column++) {
    const typeCounts = {};
    const cellTypes = [];

    for (let row = 1; row < values.length; row++) {
      const cell = values[row][column];

      if (String(cell).trim() === '') {
        cellTypes.push(null);
        continue;
      }

      const type = getCellType(cell);
      cellTypes.push(type);
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }

    const dominantType = getDominantType(typeCounts);

    if (dominantType === null) continue;

    let inconsistentCount = 0;

    cellTypes.forEach((type, index) => {
      if (type !== null && type !== dominantType) {
        cells.push({ row: index + 2, column: column + 1, type: type });
        inconsistentCount++;
      }
    });

    if (inconsistentCount > 0) {
      const totalTypedCells = Object.values(typeCounts).reduce((sum, n) => sum + n, 0);
      const dominantPercentage = Math.round((typeCounts[dominantType] / totalTypedCells) * 100);

      columnSummary.push({
        column: column + 1,
        dominantType: dominantType,
        dominantPercentage: dominantPercentage, // new
        inconsistentCount: inconsistentCount
      });
    }
  }

  return { cells, columnSummary };
}

function getDominantType(typeCounts) {
  const entries = Object.entries(typeCounts);
  if (entries.length === 0) return null; // column has no data

  entries.sort((a, b) => b[1] - a[1]); // sort by count, descending

  const [topType, topCount] = entries[0];

  // Check for a tie with the second place type
  const isTie = entries.length > 1 && entries[1][1] === topCount;

  return isTie ? null : topType;
}

const FORMULA_ERROR_TYPES = ['#DIV/0!', '#N/A', '#NAME?', '#NULL!', '#NUM!', '#REF!', '#VALUE!', '#ERROR!'];

function findFormulaErrors(values) {
  const cells = [];
  const errorTypeCounts = {}; // e.g. { '#DIV/0!': 2, '#REF!': 1 }

  // Start at row 1 to skip the header 
  for (let row = 1; row < values.length; row++) {
    for (let column = 0; column < values[row].length; column++) {
      const cell = values[row][column];
      const cellText = String(cell).trim();

      if (FORMULA_ERROR_TYPES.includes(cellText)) {
        cells.push({ row: row + 1, column: column + 1, errorType: cellText });
        errorTypeCounts[cellText] = (errorTypeCounts[cellText] || 0) + 1;
      }
    }
  }

  return { cells, errorTypeCounts };
}

function findDuplicateRows(values) {
  const seen = {};
  const duplicateRows = [];

  for (let row = 1; row < values.length; row++) {
    // Normalize the whole row into a single comparable string:
    const key = values[row]
      .map(cell => String(cell).trim().toLowerCase())
      .join('|');

    if (seen[key] !== undefined) {
      duplicateRows.push({ row: row + 1 }); // 2nd+ occurrence, the original stays unmarked
    } else {
      seen[key] = row;
    }
  }

  return duplicateRows;
}

function highlightRows(rowPositions) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastColumn = sheet.getLastColumn();

  rowPositions.forEach(row => {
    sheet.getRange(row.row, 1, 1, lastColumn).setBackground('#FFFF00');
  });
}

function columnToLetter(col) {
  let letter = '';
  while (col > 0) {
    const remainder = (col - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

const ISSUE_WEIGHTS = {
  emptyRowOrColumn: 1,
  duplicateHeader: 1,
  incompleteCell: 0.5,
  dataTypeIssue: 1,
  formulaError: 2,
  duplicateRow: 1
};

const SCORE_SMOOTHING_BASELINE = 20;

function calculateQualityScore(analysis) {
  const totalCells = analysis.rows * analysis.columns;

  if (totalCells <= 0) return 100; // nothing to grade, treat as clean

  const weightedIssues =
    (analysis.emptyRows * analysis.columns) * ISSUE_WEIGHTS.emptyRowOrColumn +
    (analysis.emptyColumns * analysis.rows) * ISSUE_WEIGHTS.emptyRowOrColumn +
    analysis.duplicateHeaders.length * ISSUE_WEIGHTS.duplicateHeader +
    analysis.incompleteCells.length * ISSUE_WEIGHTS.incompleteCell +
    analysis.dataTypeIssues.cells.length * ISSUE_WEIGHTS.dataTypeIssue +
    analysis.formulaErrors.cells.length * ISSUE_WEIGHTS.formulaError +
    (analysis.duplicateRows.length * analysis.columns) * ISSUE_WEIGHTS.duplicateRow;

  const score = 100 - (weightedIssues / (totalCells + SCORE_SMOOTHING_BASELINE)) * 100;

  return Math.max(0, Math.round(score));
}

// Trims the raw values matrix down to the actual content bounding box
function trimToContentBounds(values) {
  let lastContentRow = 0;
  let lastContentColumn = 0;

  for (let row = 0; row < values.length; row++) {
    for (let column = 0; column < values[row].length; column++) {
      if (String(values[row][column]).trim() !== '') {
        if (row > lastContentRow) lastContentRow = row;
        if (column > lastContentColumn) lastContentColumn = column;
      }
    }
  }

  return values
    .slice(0, lastContentRow + 1)
    .map(row => row.slice(0, lastContentColumn + 1));
}