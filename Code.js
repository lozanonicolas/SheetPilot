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