// Simple assertion helper — throws if the condition is false,
// which stops execution and shows the error in the Apps Script logs.
function assert(condition, message) {
  if (!condition) {
    throw new Error('❌ FAILED: ' + message);
  }
}

function test_analyzeSheetData_detectsEmptyRow() {
  const values = [
    ['Name', 'Age'],
    ['John', 21],
    ['', ''],
    ['Sarah', 25]
  ];

  const result = analyzeSheetData(values);

  assert(result.emptyRows === 1, 'expected 1 empty row, got ' + result.emptyRows);
  Logger.log('✅ test_analyzeSheetData_detectsEmptyRow passed');
}

function test_analyzeSheetData_detectsEmptyColumn() {
  const values = [
    ['Name', 'Age', 'Phone'],
    ['John', 21, ''],
    ['Sarah', 25, '']
  ];

  const result = analyzeSheetData(values);

  assert(result.emptyColumns === 1, 'expected 1 empty column, got ' + result.emptyColumns);
  Logger.log('✅ test_analyzeSheetData_detectsEmptyColumn passed');
}

function test_analyzeSheetData_rowsExcludesHeader() {
  const values = [
    ['Name', 'Age'],
    ['John', 21],
    ['Sarah', 25]
  ];

  const result = analyzeSheetData(values);

  assert(result.rows === 2, 'expected 2 data rows, got ' + result.rows);
  Logger.log('✅ test_analyzeSheetData_rowsExcludesHeader passed');
}

function test_findDuplicateHeaders_detectsCaseAndWhitespace() {
  const values = [
    ['Name', 'AGE', ' name ', 'Country'],
    ['John', 21, 'x', 'USA']
  ];

  const result = findDuplicateHeaders(values);

  assert(result.length === 1, 'expected 1 duplicate, got ' + result.length);
  assert(result[0].row === 1 && result[0].column === 3, 'expected duplicate at row 1, col 3');
  assert(result[0].text === ' name ', 'expected duplicate text " name ", got "' + result[0].text + '"');
  Logger.log('✅ test_findDuplicateHeaders_detectsCaseAndWhitespace passed');
}

function test_findIncompleteDataCells_findsEmptyAndWhitespaceInData() {
  const values = [
    ['Name', 'Age'],
    ['John', 21],
    ['', 25],
    ['Sarah', '  ']
  ];

  const result = findIncompleteDataCells(values);

  assert(result.length === 2, 'expected 2 missing cells, got ' + result.length);
  assert(result[0].row === 3 && result[0].column === 1, 'expected first missing at row 3, col 1');
  assert(result[1].row === 4 && result[1].column === 2, 'expected second missing at row 4, col 2');
  Logger.log('✅ test_findIncompleteDataCells_findsEmptyAndWhitespaceInData passed');
}

function test_findIncompleteDataCells_includesHeaderRow() {
  const values = [
    ['Name', '', 'Age'],
    ['John', 'x', 21],
    ['', 'y', 25]
  ];

  const result = findIncompleteDataCells(values);

  assert(result.length === 2, 'expected 2 missing cells, got ' + result.length);
  assert(result[0].row === 1 && result[0].column === 2, 'expected missing header at row 1, col 2');
  assert(result[1].row === 3 && result[1].column === 1, 'expected missing data at row 3, col 1');
  Logger.log('✅ test_findIncompleteDataCells_includesHeaderRow passed');
}

function test_analyzeSheetData_missingHeadersIsSubsetOfIncompleteCells() {
  const values = [
    ['Name', '', 'Age'],
    ['John', 'x', 21],
    ['', 'y', 25]
  ];

  const result = analyzeSheetData(values);

  assert(result.incompleteCells.length === 2, 'expected 2 incomplete cells total, got ' + result.incompleteCells.length);
  assert(result.missingHeaders.length === 1, 'expected 1 missing header, got ' + result.missingHeaders.length);
  assert(result.missingHeaders[0].column === 2, 'expected missing header at column 2');
  Logger.log('✅ test_analyzeSheetData_missingHeadersIsSubsetOfIncompleteCells passed');
}

function test_findDataTypeInconsistencies_detectsMinorityType() {
  const values = [
    ['Name', 'Age'],
    ['John', 21],
    ['Sarah', 25],
    ['Mike', 'thirty'],
    ['Ana', 30]
  ];

  const result = findDataTypeInconsistencies(values);

  assert(result.cells.length === 1, 'expected 1 inconsistency, got ' + result.cells.length);
  assert(result.cells[0].row === 4 && result.cells[0].column === 2, 'expected inconsistency at row 4, col 2');

  assert(result.columnSummary.length === 1, 'expected 1 column in summary, got ' + result.columnSummary.length);
  assert(result.columnSummary[0].dominantType === 'number', 'expected dominant type number');
  assert(result.columnSummary[0].inconsistentCount === 1, 'expected inconsistentCount 1');
  Logger.log('✅ test_findDataTypeInconsistencies_detectsMinorityType passed');
}

function test_findDataTypeInconsistencies_ignoresTiedColumns() {
  const values = [
    ['Mixed'],
    [1],
    ['a'],
    [2],
    ['b']
  ];

  const result = findDataTypeInconsistencies(values);

  assert(result.cells.length === 0, 'expected 0 inconsistencies on a tied column, got ' + result.cells.length);
  assert(result.columnSummary.length === 0, 'expected 0 columns in summary for a tie');
  Logger.log('✅ test_findDataTypeInconsistencies_ignoresTiedColumns passed');
}

function test_findDataTypeInconsistencies_ignoresEmptyCells() {
  const values = [
    ['Age'],
    [21],
    [''],
    [25]
  ];

  const result = findDataTypeInconsistencies(values);

  assert(result.cells.length === 0, 'expected 0 inconsistencies when only empty cells differ, got ' + result.cells.length);
  assert(result.columnSummary.length === 0, 'expected 0 columns in summary when column is clean');
  Logger.log('✅ test_findDataTypeInconsistencies_ignoresEmptyCells passed');
}

function test_findFormulaErrors_detectsAndCategorizes() {
  const values = [
    ['Name', 'Result'],
    ['John', '#DIV/0!'],
    ['Sarah', 42],
    ['Mike', '#REF!'],
    ['Ana', '#DIV/0!']
  ];

  const result = findFormulaErrors(values);

  assert(result.cells.length === 3, 'expected 3 formula errors, got ' + result.cells.length);
  assert(result.errorTypeCounts['#DIV/0!'] === 2, 'expected 2 #DIV/0! errors, got ' + result.errorTypeCounts['#DIV/0!']);
  assert(result.errorTypeCounts['#REF!'] === 1, 'expected 1 #REF! error, got ' + result.errorTypeCounts['#REF!']);
  Logger.log('✅ test_findFormulaErrors_detectsAndCategorizes passed');
}

// Run all tests in one go — handy while the suite is still small
function runAllTests() {
  test_analyzeSheetData_detectsEmptyRow();
  test_analyzeSheetData_detectsEmptyColumn();
  test_analyzeSheetData_rowsExcludesHeader();
  test_findDuplicateHeaders_detectsCaseAndWhitespace();
  test_findIncompleteDataCells_findsEmptyAndWhitespaceInData();
  test_findIncompleteDataCells_includesHeaderRow();
  test_analyzeSheetData_missingHeadersIsSubsetOfIncompleteCells();
  test_findDataTypeInconsistencies_detectsMinorityType();
  test_findDataTypeInconsistencies_ignoresTiedColumns();
  test_findDataTypeInconsistencies_ignoresEmptyCells();
  test_findFormulaErrors_detectsAndCategorizes();
  Logger.log('✅ All tests passed');
}