import { getIdsFromVals, selectAll } from './tableOps';
import { ID as TABLES_ID } from './tables/id';
import { BooleanData, IntData, QuarterData, StringData, IncomeEntry, DateData, MemberEntry, ExpenseEntry, PaymentTypeEntry, RecipientEntry, StatementEntry, AttendanceEntry, IntListData } from './types';

export function getMembers() {
    return selectAll(SpreadsheetApp.openById(TABLES_ID).getSheetByName('Member'))
        .map(row => new MemberEntry(
            IntData.create(row[0].toString()),
            StringData.create(row[1].toString()),
            DateData.create(row[2].toString()),
            IntData.create(row[3].toString()),
            StringData.create(row[4].toString()),
            BooleanData.create(row[5].toString()),
            BooleanData.create(row[6].toString()),
            BooleanData.create(row[7].toString()),
            BooleanData.create(row[8].toString()),
            BooleanData.create(row[9].toString()),
            BooleanData.create(row[10].toString())
        ));
}
export function getIncomes() {
    return selectAll(SpreadsheetApp.openById(TABLES_ID).getSheetByName('Income'))
        .map(row => new IncomeEntry(
            IntData.create(row[0].toString()),
            DateData.create(row[1].toString()),
            IntData.create(row[2].toString()),
            StringData.create(row[3].toString()),
            IntData.create(row[4].toString()),
            IntData.create(row[5].toString())
        ));
}
export function getExpenses() {
    return selectAll(SpreadsheetApp.openById(TABLES_ID).getSheetByName('Expense'))
        .map(row => new ExpenseEntry(
            IntData.create(row[0].toString()),
            DateData.create(row[1].toString()),
            IntData.create(row[2].toString()),
            StringData.create(row[3].toString()),
            IntData.create(row[4].toString()),
            IntData.create(row[5].toString()),
            IntData.create(row[6].toString())
        ));
}
export function getRecipient() {
    return selectAll(SpreadsheetApp.openById(TABLES_ID).getSheetByName('Recipient'))
        .map(row => new RecipientEntry(
            IntData.create(row[0].toString()),
            StringData.create(row[1].toString())
        ));
}
export function getPaymentTypes() {
    return selectAll(SpreadsheetApp.openById(TABLES_ID).getSheetByName('PaymentType'))
        .map(row => new PaymentTypeEntry(
            IntData.create(row[0].toString()),
            StringData.create(row[1].toString())
        ));
}
export function getStatements() {
    return selectAll(SpreadsheetApp.openById(TABLES_ID).getSheetByName('Statement'))
        .map(row => new StatementEntry(
            IntData.create(row[0].toString()),
            DateData.create(row[1].toString()),
            BooleanData.create(row[2].toString())
        ));
}
export function getAttendances() {
    return selectAll(SpreadsheetApp.openById(TABLES_ID).getSheetByName('Attendance'))
        .map(row => new AttendanceEntry(
            IntData.create(row[0].toString()),
            DateData.create(row[1].toString()),
            IntListData.create(row[2].toString()),
            QuarterData.create(row[3].toString())
        ));
}

export function getMemberIds(member: StringData[]) {
    return getIdsFromVals(
        SpreadsheetApp.openById(TABLES_ID).getSheetByName('Member'),
        ['name'],
        member.map(m => [m])
    );
}
export function getRecipientIds(recipient: StringData[]) {
    return getIdsFromVals(
        SpreadsheetApp.openById(TABLES_ID).getSheetByName('Recipient'),
        ['name'],
        [recipient]
    );
}
export function getPaymentTypeIds(paymentType: StringData[]) {
    return getIdsFromVals(
        SpreadsheetApp.openById(TABLES_ID).getSheetByName('PaymentType'),
        ['name'],
        [paymentType]
    );
}
export function getClubInfo() {
    const tableVals = getFromTables('ClubInfo', [
        'memberFee',
        'officerFee',
        'daysUntilFeeRequired',
        'currentQuarterId',
    ])[0];

    return {
        memberFee: IntData.create(tableVals[0].toString()),
        officerFee: IntData.create(tableVals[1].toString()),
        daysUntilFeeRequired: IntData.create(tableVals[2].toString()),
        currentQuarterId: QuarterData.create(tableVals[3].toString()),
    };
}
