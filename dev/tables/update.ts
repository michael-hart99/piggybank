import { ID } from '../ids/tablesId';
import { GAS_OFFSET, getIndicesFromIds, HEADER_LEN, selectAll, update } from '../tableOps';
import { AttendanceEntry, BooleanData, DataTable, DateData, ErrorType, ExpenseEntry, IncomeEntry, IntData, IntListData, MemberEntry, PaymentTypeEntry, QuarterData, RecipientEntry, RefreshLogger, StatementEntry, StringData } from '../types';

export function updateMember(
    id: IntData[],
    name?: StringData[],
    dateJoined?: DateData[],
    amountOwed?: IntData[],
    email?: StringData[],
    performing?: BooleanData[],
    active?: BooleanData[],
    officer?: BooleanData[],
    currentDuesPaid?: BooleanData[],
    notifyPoll?: BooleanData[],
    sendReceipt?: BooleanData[]
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Member');

    // Check that all arrays are the same length if given
    let numEntries = id.length;
    if (
        (name && name.length !== numEntries) ||
        (dateJoined && dateJoined.length !== numEntries) ||
        (amountOwed && amountOwed.length !== numEntries) ||
        (email && email.length !== numEntries) ||
        (performing && performing.length !== numEntries) ||
        (active && active.length !== numEntries) ||
        (officer && officer.length !== numEntries) ||
        (currentDuesPaid && currentDuesPaid.length !== numEntries) ||
        (notifyPoll && notifyPoll.length !== numEntries) ||
        (sendReceipt && sendReceipt.length !== numEntries)
    ) {
        throw ErrorType.IllegalArgumentError;
    }

    const indicies = getIndicesFromIds(sheet, id);
    const sheetVals = selectAll(sheet).filter((_, i) => indicies.indexOf(i) !== -1);

    if (!name) name = sheetVals.map(row => StringData.create(row[1].toString()));
    if (!dateJoined) dateJoined = sheetVals.map(row => DateData.create(row[2].toString()));
    if (!amountOwed) amountOwed = sheetVals.map(row => IntData.create(row[3].toString()));
    if (!email) email = sheetVals.map(row => StringData.create(row[4].toString()));
    if (!performing)
        performing = sheetVals.map(row => BooleanData.create(row[5].toString()));
    if (!active) active = sheetVals.map(row => BooleanData.create(row[6].toString()));
    if (!officer) officer = sheetVals.map(row => BooleanData.create(row[7].toString()));
    if (!currentDuesPaid)
        currentDuesPaid = sheetVals.map(row => BooleanData.create(row[8].toString()));
    if (!notifyPoll)
        notifyPoll = sheetVals.map(row => BooleanData.create(row[9].toString()));
    if (!sendReceipt)
        sendReceipt = sheetVals.map(row => BooleanData.create(row[10].toString()));

    const entries: MemberEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(
            new MemberEntry(
                id[i],
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

    RefreshLogger.markAsUpdated(DataTable.MEMBER);

    update(sheet, entries);
}
export function updateIncome(
    id: IntData[],
    date?: DateData[],
    amount?: IntData[],
    description?: StringData[],
    paymentTypeId?: IntData[],
    statementId?: IntData[]
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Income');

    // Check that all arrays are the same length if given
    let numEntries = id.length;
    if (
        (date && date.length !== numEntries) ||
        (amount && amount.length !== numEntries) ||
        (description && description.length !== numEntries) ||
        (paymentTypeId && paymentTypeId.length !== numEntries) ||
        (statementId && statementId.length !== numEntries)
    ) {
        throw ErrorType.IllegalArgumentError;
    }

    const indicies = getIndicesFromIds(sheet, id);
    const sheetVals = selectAll(sheet).filter((_, i) => indicies.indexOf(i) !== -1);

    if (!date) date = sheetVals.map(row => DateData.create(row[1].toString()));
    if (!amount) amount = sheetVals.map(row => IntData.create(row[2].toString()));
    if (!description)
        description = sheetVals.map(row => StringData.create(row[3].toString()));
    if (!paymentTypeId)
        paymentTypeId = sheetVals.map(row => IntData.create(row[4].toString()));
    if (!statementId)
        statementId = sheetVals.map(row => IntData.create(row[5].toString()));

    const entries: IncomeEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(
            new IncomeEntry(
                id[i],
                date[i],
                amount[i],
                description[i],
                paymentTypeId[i],
                statementId[i]
            )
        );
    }

    RefreshLogger.markAsUpdated(DataTable.INCOME);

    update(sheet, entries);
}
export function updateExpense(
    id: IntData[],
    date?: DateData[],
    amount?: IntData[],
    description?: StringData[],
    paymentTypeId?: IntData[],
    recipientId?: IntData[],
    statementId?: IntData[]
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Expense');

    // Check that all arrays are the same length if given
    let numEntries = id.length;
    if (
        (date && date.length !== numEntries) ||
        (amount && amount.length !== numEntries) ||
        (description && description.length !== numEntries) ||
        (paymentTypeId && paymentTypeId.length !== numEntries) ||
        (recipientId && recipientId.length !== numEntries) ||
        (statementId && statementId.length !== numEntries)
    ) {
        throw ErrorType.IllegalArgumentError;
    }

    const indicies = getIndicesFromIds(sheet, id);
    const sheetVals = selectAll(sheet).filter((_, i) => indicies.indexOf(i) !== -1);

    if (!date) date = sheetVals.map(row => DateData.create(row[1].toString()));
    if (!amount) amount = sheetVals.map(row => IntData.create(row[2].toString()));
    if (!description)
        description = sheetVals.map(row => StringData.create(row[3].toString()));
    if (!paymentTypeId)
        paymentTypeId = sheetVals.map(row => IntData.create(row[4].toString()));
    if (!recipientId)
        recipientId = sheetVals.map(row => IntData.create(row[5].toString()));
    if (!statementId)
        statementId = sheetVals.map(row => IntData.create(row[6].toString()));

    const entries: ExpenseEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(
            new ExpenseEntry(
                id[i],
                date[i],
                amount[i],
                description[i],
                paymentTypeId[i],
                recipientId[i],
                statementId[i]
            )
        );
    }

    RefreshLogger.markAsUpdated(DataTable.EXPENSE);

    update(sheet, entries);
}
export function updateRecipient(id: IntData[], name: StringData[]) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Recipient');

    // Check that all arrays are the same length if given
    let numEntries = id.length;
    if (name && name.length !== numEntries) {
        throw ErrorType.IllegalArgumentError;
    }

    const entries: RecipientEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(new RecipientEntry(id[i], name[i]));
    }

    RefreshLogger.markAsUpdated(DataTable.RECIPIENT);

    update(sheet, entries);
}
export function updatePaymentType(id: IntData[], name: StringData[]) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('PaymentType');

    // Check that all arrays are the same length if given
    let numEntries = id.length;
    if (name && name.length !== numEntries) {
        throw ErrorType.IllegalArgumentError;
    }

    const entries: PaymentTypeEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(new PaymentTypeEntry(id[i], name[i]));
    }

    RefreshLogger.markAsUpdated(DataTable.PAYMENT_TYPE);

    update(sheet, entries);
}
export function updateStatement(
    id: IntData[],
    date?: DateData[],
    confirmed?: BooleanData[]
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Statement');

    // Check that all arrays are the same length if given
    let numEntries = id.length;
    if (
        (date && date.length !== numEntries) ||
        (confirmed && confirmed.length !== numEntries)
    ) {
        throw ErrorType.IllegalArgumentError;
    }

    const indicies = getIndicesFromIds(sheet, id);
    const sheetVals = selectAll(sheet).filter((_, i) => indicies.indexOf(i) !== -1);

    if (!date) date = sheetVals.map(row => DateData.create(row[1].toString()));
    if (!confirmed)
        confirmed = sheetVals.map(row => BooleanData.create(row[4].toString()));

    const entries: StatementEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(
            new StatementEntry(
                id[i],
                date[i],
                confirmed[i]
            )
        );
    }

    RefreshLogger.markAsUpdated(DataTable.STATEMENT);

    update(sheet, entries);
}
export function updateAttendance(
    id: IntData[],
    date?: DateData[],
    memberIds?: IntListData[],
    quarterId?: QuarterData[]
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Attendance');

    // Check that all arrays are the same length if given
    let numEntries = id.length;
    if (
        (date && date.length !== numEntries) ||
        (memberIds && memberIds.length !== numEntries) ||
        (quarterId && quarterId.length !== numEntries)
    ) {
        throw ErrorType.IllegalArgumentError;
    }

    const indicies = getIndicesFromIds(sheet, id);
    const sheetVals = selectAll(sheet).filter((_, i) => indicies.indexOf(i) !== -1);

    if (!date) date = sheetVals.map(row => DateData.create(row[1].toString()));
    if (!memberIds)
        memberIds = sheetVals.map(row => IntListData.create(row[2].toString()));
    if (!quarterId)
        quarterId = sheetVals.map(row => QuarterData.create(row[3].toString()));

    const entries: AttendanceEntry[] = [];
    for (let i = 0; i < numEntries; ++i) {
        entries.push(
            new AttendanceEntry(id[i], date[i], memberIds[i], quarterId[i])
        );
    }

    RefreshLogger.markAsUpdated(DataTable.ATTENDANCE);

    update(sheet, entries);
}
export function updateClubInfo(
    memberFee?: IntData,
    officerFee?: IntData,
    daysUntilFeeRequired?: IntData,
    currentQuarterId?: QuarterData
) {
    const sheet = SpreadsheetApp.openById(ID).getSheetByName('ClubInfo');
    const sheetVals = selectAll(sheet)[0];

    if (!memberFee) memberFee = IntData.create(sheetVals[0].toString());
    if (!officerFee) officerFee = IntData.create(sheetVals[1].toString());
    if (!daysUntilFeeRequired) daysUntilFeeRequired = IntData.create(sheetVals[2].toString());
    if (!currentQuarterId) currentQuarterId = QuarterData.create(sheetVals[3].toString());

    sheet
        .getRange(0 + HEADER_LEN + GAS_OFFSET, 1, 1, sheetVals.length)
        .setValues([
            [
                memberFee.toString(),
                officerFee.toString(),
                daysUntilFeeRequired.toString(),
                currentQuarterId.toString(),
            ],
        ]);

    RefreshLogger.markAsUpdated(DataTable.CLUB_INFO);
}
