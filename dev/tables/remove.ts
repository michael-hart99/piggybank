import { ID } from '../ids/tablesId';
import { getIdsFromFields, remove } from '../tableOps';
import { DataTable, ErrorType, ExpenseEntry, IncomeEntry, IntData, MemberEntry, PaymentTypeEntry, RecipientEntry, RefreshLogger, StatementEntry } from '../types';

/**
 * Removes the specified entries from the Member sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * @param name The names of the entries to be removed 
 * 
 * @throws IllegalArgumentError if both id and name are not specified
 * @throws NoMatchFoundError if a given name is not found in the sheet ||
 *                              a given id is not found in the sheet
 */
export function removeMember(id?: IntData[], name?: IntData[]) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Member');

    if (!id) {
        // If not enough info is given to find ID, throw error
        if (!name) {
            throw ErrorType.IllegalArgumentError;
        }
        id = getIdsFromFields(sheet, ['name'], name.map(s => [s]));
    }

    const entries = id.map(i => new MemberEntry(i));

    RefreshLogger.markAsUpdated(DataTable.MEMBER);

    remove(sheet, entries);
}
/**
 * Removes the specified entries from the Income sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * 
 * @throws NoMatchFoundError if a given id is not found in the sheet
 */
export function removeIncome(
    id: IntData[],
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Income');

    const entries = id.map(i => new IncomeEntry(i));

    RefreshLogger.markAsUpdated(DataTable.INCOME);

    remove(sheet, entries);
}
/**
 * Removes the specified entries from the Expense sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * 
 * @throws NoMatchFoundError if a given id is not found in the sheet
 */
export function removeExpense(
    id: IntData[],
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Expense');

    const entries = id.map(i => new ExpenseEntry(i));

    RefreshLogger.markAsUpdated(DataTable.EXPENSE);

    remove(sheet, entries);
}
/**
 * Removes the specified entries from the Recipient sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * @param name The names of the entries to be removed 
 * 
 * @throws IllegalArgumentError if both id and name are not specified
 * @throws NoMatchFoundError if a given name is not found in the sheet ||
 *                              a given id is not found in the sheet
 */
export function removeRecipient(id?: IntData[], name?: IntData[]) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Recipient');

    if (!id) {
        // If not enough info is given to find ID, throw error
        if (!name) {
            throw ErrorType.IllegalArgumentError;
        }
        id = getIdsFromFields(sheet, ['name'], name.map(s => [s]));
    }

    const entries = id.map(i => new RecipientEntry(i));

    RefreshLogger.markAsUpdated(DataTable.RECIPIENT);

    remove(sheet, entries);
}
/**
 * Removes the specified entries from the PaymentType sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * @param name The names of the entries to be removed 
 * 
 * @throws IllegalArgumentError if both id and name are not specified
 * @throws NoMatchFoundError if a given name is not found in the sheet ||
 *                              a given id is not found in the sheet
 */
export function removePaymentType(id?: IntData[], name?: IntData[]) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('PaymentType');

    if (!id) {
        // If not enough info is given to find ID, throw error
        if (!name) {
            throw ErrorType.IllegalArgumentError;
        }
        id = getIdsFromFields(sheet, ['name'], name.map(s => [s]));
    }

    const entries = id.map(i => new PaymentTypeEntry(i));

    RefreshLogger.markAsUpdated(DataTable.PAYMENT_TYPE);

    remove(sheet, entries);
}
/**
 * Removes the specified entries from the Statement sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * 
 * @throws NoMatchFoundError if a given id is not found in the sheet
 */
export function removeStatement(
    id: IntData[],
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Statement');

    const entries = id.map(i => new StatementEntry(i));

    RefreshLogger.markAsUpdated(DataTable.STATEMENT);

    remove(sheet, entries);
}
/**
 * Removes the specified entries from the Attendance sheet. If id is not specified,
 * name can be specified to be used to find the matching ids.
 * 
 * @param id The ids of the entries to be removed
 * 
 * @throws NoMatchFoundError if a given id is not found in the sheet
 */
export function removeAttendance(
    id: IntData[],
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Attendance');

    const entries = id.map(i => new StatementEntry(i));

    RefreshLogger.markAsUpdated(DataTable.ATTENDANCE);

    remove(sheet, entries);
}
