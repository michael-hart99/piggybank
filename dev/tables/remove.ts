import { ID } from '../ids/tablesId';
import { remove } from '../tableOps';
import { DataTable, ExpenseEntry, IncomeEntry, IntData, MemberEntry, PaymentTypeEntry, RecipientEntry, RefreshLogger, StatementEntry } from '../types';

/**
 * Removes the specified entries from the Member sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws IllegalArgumentError if length of id is zero
 * @throws NoMatchFoundError if a given id is not found in the sheet
 */
export function removeMember(id: IntData[], sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId).getSheetByName('Member') :
        SpreadsheetApp.openById(ID).getSheetByName('Member');

    const entries = id.map(i => new MemberEntry(i));

    RefreshLogger.markAsUpdated(DataTable.MEMBER);

    remove(sheet, entries);
}
/**
 * Removes the specified entries from the Income sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws IllegalArgumentError if length of id is zero
 * @throws NoMatchFoundError if a given id is not found in the sheet
 */
export function removeIncome(
    id: IntData[],
    sheetId?: string
) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId).getSheetByName('Income') :
        SpreadsheetApp.openById(ID).getSheetByName('Income');

    const entries = id.map(i => new IncomeEntry(i));

    RefreshLogger.markAsUpdated(DataTable.INCOME);

    remove(sheet, entries);
}
/**
 * Removes the specified entries from the Expense sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws IllegalArgumentError if length of id is zero
 * @throws NoMatchFoundError if a given id is not found in the sheet
 */
export function removeExpense(
    id: IntData[],
    sheetId?: string
) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId).getSheetByName('Expense') :
        SpreadsheetApp.openById(ID).getSheetByName('Expense');

    const entries = id.map(i => new ExpenseEntry(i));

    RefreshLogger.markAsUpdated(DataTable.EXPENSE);

    remove(sheet, entries);
}
/**
 * Removes the specified entries from the Recipient sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws IllegalArgumentError if length of id is zero
 * @throws NoMatchFoundError if a given id is not found in the sheet
 */
export function removeRecipient(id: IntData[], sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId).getSheetByName('Recipient') :
        SpreadsheetApp.openById(ID).getSheetByName('Recipient');

    const entries = id.map(i => new RecipientEntry(i));

    RefreshLogger.markAsUpdated(DataTable.RECIPIENT);

    remove(sheet, entries);
}
/**
 * Removes the specified entries from the PaymentType sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws IllegalArgumentError if length of id is zero
 * @throws NoMatchFoundError if a given id is not found in the sheet
 */
export function removePaymentType(id: IntData[], sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId).getSheetByName('PaymentType') :
        SpreadsheetApp.openById(ID).getSheetByName('PaymentType');

    const entries = id.map(i => new PaymentTypeEntry(i));

    RefreshLogger.markAsUpdated(DataTable.PAYMENT_TYPE);

    remove(sheet, entries);
}
/**
 * Removes the specified entries from the Statement sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws IllegalArgumentError if length of id is zero
 * @throws NoMatchFoundError if a given id is not found in the sheet
 */
export function removeStatement(
    id: IntData[],
    sheetId?: string
) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId).getSheetByName('Statement') :
        SpreadsheetApp.openById(ID).getSheetByName('Statement');

    const entries = id.map(i => new StatementEntry(i));

    RefreshLogger.markAsUpdated(DataTable.STATEMENT);

    remove(sheet, entries);
}
/**
 * Removes the specified entries from the Attendance sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws IllegalArgumentError if length of id is zero
 * @throws NoMatchFoundError if a given id is not found in the sheet
 */
export function removeAttendance(
    id: IntData[],
    sheetId?: string
) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId).getSheetByName('Attendance') :
        SpreadsheetApp.openById(ID).getSheetByName('Attendance');

    const entries = id.map(i => new StatementEntry(i));

    RefreshLogger.markAsUpdated(DataTable.ATTENDANCE);

    remove(sheet, entries);
}
