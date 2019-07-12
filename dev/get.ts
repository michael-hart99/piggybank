import { getIdsFromVals, select, selectMulti } from './tableOps';
import { ID as TABLES_ID } from './tables/id';
import { BooleanData, IntData, QuarterData, StringData } from './types';
import { ID as VIEWS_ID } from './views/id';

export function getFromTables(sheetName: string, fields: string[]) {
    return selectMulti(
        SpreadsheetApp.openById(TABLES_ID).getSheetByName(sheetName),
        fields
    );
}
export function getFromViews(sheetName: string, fields: string[]) {
    return selectMulti(
        SpreadsheetApp.openById(VIEWS_ID).getSheetByName(sheetName),
        fields
    );
}

export function getAmountOwed(memberNames: StringData[]) {
    const tableVals = getFromTables('Member', ['name', 'amountOwed']);

    const owed: IntData[] = [];
    let startIndex = 0;
    for (const name of memberNames) {
        let i = startIndex;
        do {
            if (tableVals[i][0].toString() === name.toString()) {
                owed.push(IntData.create(tableVals[i][1].toString()));
                startIndex = i;
                break;
            }
            i = (i + 1) % tableVals.length
        } while (i !== startIndex);
    }

    return owed;
}
export function getDuesValues(memberNames: StringData[]) {
    const clubInfo = getClubInfo();
    const tableVals = getFromTables('Member', ['name', 'officer']);

    const duesVals: IntData[] = [];
    let startIndex = 0;
    for (const name of memberNames) {
        let i = startIndex;
        do {
            if (tableVals[i][0].toString() === name.toString()) {
                let isOfficer = BooleanData.create(tableVals[i][1].toString());
                duesVals.push(isOfficer.getValue() ? clubInfo.officerFee : clubInfo.memberFee);
                startIndex = i;
                break;
            }
            i = (i + 1) % tableVals.length
        } while (i !== startIndex);
    }

    return duesVals;
}
export function getAllMemberIds() {
    return select(SpreadsheetApp.openById(TABLES_ID).getSheetByName('Member'), 'id')
        .map(row => IntData.create(row.toString()));
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
