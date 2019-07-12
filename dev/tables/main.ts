import { initialize } from './initialize';

/**
 * Executes upon opening the document this script is bound to.
 */
export function customOnOpen() {
    const sheetapp = SpreadsheetApp.getActive();

    if (
        sheetapp.getNumSheets() === 1 &&
        ScriptApp.getProjectTriggers().length === 2
    ) {
        initialize();
    }
}

/**
 * Executes upon editing the document this script is bound to.
 */
export function customOnEdit() {}

/**
 * Executes every day near 1AM.
 */
export function everyDay() {}

/**
 * Executes every week's Sunday near 1AM.
 */
export function everyWeek() {}
