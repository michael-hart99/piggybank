function customOnOpen() {
    Main.customOnOpen();
}
function customOnEdit() {
    Main.customOnEdit();
}
function everyDay() {
    Main.everyDay();
}
function everyWeek() {
    Main.everyWeek();
}

function setup() {
    const id = '';
    ScriptApp.newTrigger('customOnOpen').forSpreadsheet(id).onOpen().create();
    ScriptApp.newTrigger('customOnEdit').forSpreadsheet(id).onOpen().create();
}
