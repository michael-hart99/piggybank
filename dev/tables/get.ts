import { ID as TABLES_ID } from '../ids/tablesId';
import { getIdsFromFields, selectAll } from '../tableOps';
import { AttendanceEntry, BooleanData, ClubInfoEntry, DateData, ErrorType, ExpenseEntry, IncomeEntry, IntData, IntListData, MemberEntry, PaymentTypeEntry, QuarterData, RecipientEntry, StatementEntry, StringData } from '../types';

/**
 * Returns all of the entries in the Member sheet.
 * 
 * @param sheetId The id of the spreadsheet to operate on
 */
export function getMembers(sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId) :
        SpreadsheetApp.openById(TABLES_ID);

    return selectAll(sheet.getSheetByName('Member'))
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
/**
 * Returns all of the entries in the Income sheet.
 * 
 * @param sheetId The id of the spreadsheet to operate on
 */
export function getIncomes(sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId) :
        SpreadsheetApp.openById(TABLES_ID);

    return selectAll(sheet.getSheetByName('Income'))
        .map(row => new IncomeEntry(
            IntData.create(row[0].toString()),
            DateData.create(row[1].toString()),
            IntData.create(row[2].toString()),
            StringData.create(row[3].toString()),
            IntData.create(row[4].toString()),
            IntData.create(row[5].toString())
        ));
}
/**
 * Returns all of the entries in the Expense sheet.
 * 
 * @param sheetId The id of the spreadsheet to operate on
 */
export function getExpenses(sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId) :
        SpreadsheetApp.openById(TABLES_ID);

    return selectAll(sheet.getSheetByName('Expense'))
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
/**
 * Returns all of the entries in the Recipient sheet.
 * 
 * @param sheetId The id of the spreadsheet to operate on
 */
export function getRecipients(sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId) :
        SpreadsheetApp.openById(TABLES_ID);

    return selectAll(sheet.getSheetByName('Recipient'))
        .map(row => new RecipientEntry(
            IntData.create(row[0].toString()),
            StringData.create(row[1].toString())
        ));
}
/**
 * Returns all of the entries in the PaymentType sheet.
 * 
 * @param sheetId The id of the spreadsheet to operate on
 */
export function getPaymentTypes(sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId) :
        SpreadsheetApp.openById(TABLES_ID);

    return selectAll(sheet.getSheetByName('PaymentType'))
        .map(row => new PaymentTypeEntry(
            IntData.create(row[0].toString()),
            StringData.create(row[1].toString())
        ));
}
/**
 * Returns all of the entries in the Statement sheet.
 * 
 * @param sheetId The id of the spreadsheet to operate on
 */
export function getStatements(sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId) :
        SpreadsheetApp.openById(TABLES_ID);

    return selectAll(sheet.getSheetByName('Statement'))
        .map(row => new StatementEntry(
            IntData.create(row[0].toString()),
            DateData.create(row[1].toString()),
            BooleanData.create(row[2].toString())
        ));
}
/**
 * Returns all of the entries in the Attendance sheet.
 * 
 * @param sheetId The id of the spreadsheet to operate on
 */
export function getAttendances(sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId) :
        SpreadsheetApp.openById(TABLES_ID);

    return selectAll(sheet.getSheetByName('Attendance'))
        .map(row => new AttendanceEntry(
            IntData.create(row[0].toString()),
            DateData.create(row[1].toString()),
            IntListData.create(row[2].toString()),
            QuarterData.create(row[3].toString())
        ));
}
/**
 * Returns an entry describing the ClubInfo sheet.
 * 
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws IllegalArgumentError if the sheet does not have an entry..
 */
export function getClubInfo(sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId) :
        SpreadsheetApp.openById(TABLES_ID);

    const tableVals = selectAll(sheet.getSheetByName('ClubInfo'));
    if (tableVals.length === 0) throw ErrorType.IllegalArgumentError;

    return new ClubInfoEntry(
        IntData.create(tableVals[0][0].toString()),
        IntData.create(tableVals[0][1].toString()),
        IntData.create(tableVals[0][2].toString()),
        QuarterData.create(tableVals[0][3].toString()),
    );
}

/**
 * Returns the ids in the Member sheet that have names matching the given
 * member names.
 * 
 * @param member The member names to get the ids of
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws NoMatchFoundError if a matching name is not found
 */
export function getMemberIds(member: StringData[], sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId) :
        SpreadsheetApp.openById(TABLES_ID);

    return getIdsFromFields(
        sheet.getSheetByName('Member'),
        ['name'],
        member.map(m => [m])
    );
}
/**
 * Returns the ids in the Recipient sheet that have names matching the given
 * recipient names.
 * 
 * @param recipient The recipient names to get the ids of
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws NoMatchFoundError if a matching name is not found
 */
export function getRecipientIds(recipient: StringData[], sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId) :
        SpreadsheetApp.openById(TABLES_ID);

    return getIdsFromFields(
        sheet.getSheetByName('Recipient'),
        ['name'],
        recipient.map(r => [r])
    );
}
/**
 * Returns the ids in the PaymentType sheet that have names matching the given
 * paymentType names.
 * 
 * @param member The paymentType names to get the ids of
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws NoMatchFoundError if a matching name is not found
 */
export function getPaymentTypeIds(paymentType: StringData[], sheetId?: string) {
    const sheet = sheetId ?
        SpreadsheetApp.openById(sheetId) :
        SpreadsheetApp.openById(TABLES_ID);

    return getIdsFromFields(
        sheet.getSheetByName('PaymentType'),
        ['name'],
        paymentType.map(p => [p])
    );
}
