import { ID as BACKUP_FOLDER_ID } from '../ids/backupFolderId';
import { ID as TABLES_ID } from '../ids/tablesId';
import { GAS_OFFSET } from '../tableOps';

export function createBackup() {
    const datestring = new Date().toJSON().replace('T', ', ');
    const backupSS = SpreadsheetApp.create(datestring);
    const backupFile = DriveApp.getFileById(backupSS.getId());

    // Move file to backup folder
    backupFile.getParents().next().removeFile(backupFile);
    DriveApp.getFolderById(BACKUP_FOLDER_ID).addFile(backupFile);

    const curSS = SpreadsheetApp.openById(TABLES_ID);
    curSS.getSheets().forEach(sheet => {
        const backupSheet = backupSS.insertSheet(sheet.getName());
        const vals = sheet.getDataRange().getValues();
        if (vals.length > 0 && vals[0].length > 0) {
            backupSheet.getRange(GAS_OFFSET, GAS_OFFSET, vals.length, vals[0].length).setValues(vals);
        }
    });

    backupSS.deleteSheet(backupSS.getSheetByName('Sheet1'));
}
