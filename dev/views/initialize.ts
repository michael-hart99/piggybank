export function initialize() {
    const sheetapp = SpreadsheetApp.getActive();

    //ScriptApp.newTrigger('everyDay')
    //    .timeBased()
    //    .everySoOften
    //    .create();

    sheetapp.insertSheet('')
            .appendRow(['']);

    sheetapp.deleteSheet(sheetapp.getSheetByName('Sheet1'));
}
