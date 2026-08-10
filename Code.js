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

function getActiveSheetName() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  return sheet.getName();
}

function analyzeActiveSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();

  return {
    name: sheet.getName(),
    rows: values.length,
    columns: values[0].length
  };
}