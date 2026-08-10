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
}

function test_findDuplicateHeaders_detectsCaseAndWhitespace() {
  const values = [
    ['Name', 'AGE', ' name ', 'Country'],
    ['John', 21, 'x', 'USA']
  ];

  const result = findDuplicateHeaders(values);

  assert(result.length === 1, 'expected 1 duplicate, got ' + result.length);
  assert(result[0] === ' name ', 'expected duplicate to be " name ", got "' + result[0] + '"');
}

// Run all tests in one go — handy while the suite is still small
function runAllTests() {
  test_analyzeSheetData_detectsEmptyRow();
  test_analyzeSheetData_detectsEmptyColumn();
  test_analyzeSheetData_rowsExcludesHeader();
  test_findDuplicateHeaders_detectsCaseAndWhitespace();
  Logger.log('✅ All tests passed');
}