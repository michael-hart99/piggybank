import { getIdsFromVals, remove } from '../tableOps';
import { ErrorType, ExpenseEntry, IncomeEntry, IntData, MemberEntry, PaymentTypeEntry, RecipientEntry, RefreshLogger, StatementEntry, Table } from '../types';
import { ID } from './id';

export function removeMember(id?: IntData[], name?: IntData[]) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Member');

    if (!id) {
        // If not enough info is given to find ID, throw error
        if (!name) {
            throw ErrorType.IllegalArgumentError;
        }
        id = getIdsFromVals(sheet, ['name'], [name]);
    }

    const entries = id.map(i => new MemberEntry(i));

    RefreshLogger.include(Table.MEMBER);

    remove(sheet, entries);
}
export function removeIncome(
    id: IntData[],
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Income');

    const entries = id.map(i => new IncomeEntry(i));

    RefreshLogger.include(Table.INCOME);

    remove(sheet, entries);
}
export function removeExpense(
    id: IntData[],
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Expense');

    const entries = id.map(i => new ExpenseEntry(i));

    RefreshLogger.include(Table.EXPENSE);

    remove(sheet, entries);
}
export function removeRecipient(id?: IntData[], name?: IntData[]) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Recipient');

    if (!id) {
        // If not enough info is given to find ID, throw error
        if (!name) {
            throw ErrorType.IllegalArgumentError;
        }
        id = getIdsFromVals(sheet, ['name'], [name]);
    }

    const entries = id.map(i => new RecipientEntry(i));

    RefreshLogger.include(Table.RECIPIENT);

    remove(sheet, entries);
}
export function removePaymentType(id?: IntData[], name?: IntData[]) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('PaymentType');

    if (!id) {
        // If not enough info is given to find ID, throw error
        if (!name) {
            throw ErrorType.IllegalArgumentError;
        }
        id = getIdsFromVals(sheet, ['name'], [name]);
    }

    const entries = id.map(i => new PaymentTypeEntry(i));

    RefreshLogger.include(Table.PAYMENT_TYPE);

    remove(sheet, entries);
}
export function removeStatement(
    id: IntData[],
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Statement');

    const entries = id.map(i => new StatementEntry(i));

    RefreshLogger.include(Table.STATEMENT);

    remove(sheet, entries);
}
export function removeAttendance(
    id: IntData[],
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Attendance');

    const entries = id.map(i => new StatementEntry(i));

    RefreshLogger.include(Table.ATTENDANCE);

    remove(sheet, entries);
}
