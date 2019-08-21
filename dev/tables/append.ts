import { ID } from '../ids/tablesId';
import { append } from '../tableOps';
import { AttendanceEntry, BooleanData, DataTable, DateData, ErrorType, ExpenseEntry, IncomeEntry, IntData, IntListData, MemberEntry, PaymentTypeEntry, QuarterData, RecipientEntry, RefreshLogger, StatementEntry, StringData } from '../types';

export function appendMember(
    name: StringData[],
    dateJoined: DateData[],
    amountOwed: IntData[],
    email: StringData[],
    performing: BooleanData[],
    active: BooleanData[],
    officer: BooleanData[],
    currentDuesPaid: BooleanData[],
    notifyPoll: BooleanData[],
    sendReceipt: BooleanData[]
) {
    // Check that all arrays are the same length if given
    let numEntries = name.length;
    if (
        dateJoined.length !== numEntries ||
        amountOwed.length !== numEntries ||
        email.length !== numEntries ||
        performing.length !== numEntries ||
        active.length !== numEntries ||
        officer.length !== numEntries ||
        currentDuesPaid.length !== numEntries ||
        notifyPoll.length !== numEntries ||
        sendReceipt.length !== numEntries
    ) {
        throw ErrorType.IllegalArgumentError;
    }

    const entries: MemberEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(
            new MemberEntry(
                undefined,
                name[i],
                dateJoined[i],
                amountOwed[i],
                email[i],
                performing[i],
                active[i],
                officer[i],
                currentDuesPaid[i],
                notifyPoll[i],
                sendReceipt[i]
            )
        );
    }

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Member');

    RefreshLogger.markAsUpdated(DataTable.MEMBER);

    return append(sheet, entries);
}
export function appendIncome(
    date: DateData[],
    amount: IntData[],
    description: StringData[],
    paymentTypeId: IntData[],
    statementId: IntData[]
) {
    // Check that all arrays are the same length if given
    let numEntries = date.length;
    if (
        amount.length !== numEntries ||
        description.length !== numEntries ||
        paymentTypeId.length !== numEntries ||
        statementId.length !== numEntries
    ) {
        throw ErrorType.IllegalArgumentError;
    }

    const entries: IncomeEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(
            new IncomeEntry(
                undefined,
                date[i],
                amount[i],
                description[i],
                paymentTypeId[i],
                statementId[i],
            )
        );
    }

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Income');

    RefreshLogger.markAsUpdated(DataTable.INCOME);

    return append(sheet, entries);
}
export function appendExpense(
    date: DateData[],
    amount: IntData[],
    description: StringData[],
    paymentTypeId: IntData[],
    recipientId: IntData[],
    statementId: IntData[]
) {
    // Check that all arrays are the same length if given
    let numEntries = date.length;
    if (
        amount.length !== numEntries ||
        description.length !== numEntries ||
        paymentTypeId.length !== numEntries ||
        recipientId.length !== numEntries ||
        statementId.length !== numEntries
    ) {
        throw ErrorType.IllegalArgumentError;
    }

    const entries: ExpenseEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(
            new ExpenseEntry(
                undefined,
                date[i],
                amount[i],
                description[i],
                paymentTypeId[i],
                recipientId[i],
                statementId[i]
            )
        );
    }

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Expense');

    RefreshLogger.markAsUpdated(DataTable.EXPENSE);

    return append(sheet, entries);
}
export function appendRecipient(name: StringData[]) {
    let numEntries = name.length;

    const entries: RecipientEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(new RecipientEntry(undefined, name[i]));
    }

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Recipient');

    RefreshLogger.markAsUpdated(DataTable.RECIPIENT);

    return append(sheet, entries);
}
export function appendPaymentType(name: StringData[]) {
    let numEntries = name.length;

    const entries: PaymentTypeEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(new PaymentTypeEntry(undefined, name[i]));
    }

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('PaymentType');

    RefreshLogger.markAsUpdated(DataTable.PAYMENT_TYPE);

    return append(sheet, entries);
}
export function appendStatement(
    date: DateData[],
    confirmed: BooleanData[]
) {
    // Check that all arrays are the same length if given
    let numEntries = date.length;
    if (
        confirmed.length !== numEntries
    ) {
        throw ErrorType.IllegalArgumentError;
    }

    const entries: StatementEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(
            new StatementEntry(
                undefined,
                date[i],
                confirmed[i]
            )
        );
    }

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Statement');

    RefreshLogger.markAsUpdated(DataTable.STATEMENT);

    return append(sheet, entries);
}
export function appendAttendance(
    date: DateData[],
    memberIds: IntListData[],
    quarterId: QuarterData[]
) {
    // Check that all arrays are the same length if given
    let numEntries = date.length;
    if (memberIds.length !== numEntries || quarterId.length !== numEntries) {
        throw ErrorType.IllegalArgumentError;
    }

    const entries: AttendanceEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(
            new AttendanceEntry(undefined, date[i], memberIds[i], quarterId[i])
        );
    }

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Attendance');

    RefreshLogger.markAsUpdated(DataTable.ATTENDANCE);

    return append(sheet, entries);
}
