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
    values: sheet.getDataRange().getValues()
  };
}

function analyzeSheetData(values) {
  let emptyRows = 0;
  let emptyColumns = 0;

  //Check for empty rows
  for (const row of values) {
    if (row.every(cell => cell === '')) {
      emptyRows++;
    }
  }

  //Check for empty columns
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

  return {
    rows: values.length - 1,
    columns: values[0].length,
    emptyRows: emptyRows,
    emptyColumns: emptyColumns,
    duplicateHeaders: duplicateHeaders
  };
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
    if (header === '') return; // empty headers are a separate check, not this one

    if (seen[header] !== undefined) {
      duplicates.push(headers[index]); // keep the original (non-normalized) text
    } else {
      seen[header] = index;
    }
  });

  return duplicates;
}