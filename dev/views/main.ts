import { initialize } from './initialize';

/**
 * Executes upon opening the document this script is bound to.
 * 
 * @param e The event that triggered this function call
 */
function onOpen() {
    const sheetapp = SpreadsheetApp.getActive();

    if (sheetapp.getNumSheets() === 1 && ScriptApp.getProjectTriggers().length === 0) {
        initialize();
    }
}

/**
 * Executes upon editing the document this script is bound to.
 * 
 * @param e The event that triggered this function call
 */
function onEdit() {

}

export { };

