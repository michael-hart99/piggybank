export function initialize() {
    const sheetapp = SpreadsheetApp.getActive();

    // Run everyDay everyday at 1AM
    ScriptApp.newTrigger('everyDay')
        .timeBased()
        .atHour(1)
        .everyDays(1)
        .create();

    // Run everyWeek every week's Sunday at 1AM
    ScriptApp.newTrigger('everyWeek')
        .timeBased()
        .atHour(1)
        .onWeekDay(ScriptApp.WeekDay.SUNDAY)
        .create();

    sheetapp
        .insertSheet('Member')
        .appendRow([
            'id',
            'name',
            'dateJoined',
            'amountOwed',
            'email',
            'performing',
            'active',
            'officer',
            'currentDuesPaid',
            'sendReceipt',
        ]);
    sheetapp
        .insertSheet('Income')
        .appendRow(['id', 'date', 'amount', 'description', 'paymentTypeId', 'statementId']);
    sheetapp
        .insertSheet('Expense')
        .appendRow([
            'id',
            'date',
            'amount',
            'description',
            'paymentTypeId',
            'recipientId',
            'statementId',
        ]);
    sheetapp.insertSheet('Recipient').appendRow(['id', 'name']);
    sheetapp.insertSheet('PaymentType').appendRow(['id', 'name']);
    sheetapp
        .insertSheet('Statement')
        .appendRow(['id', 'date', 'confirmed']);
    sheetapp
        .insertSheet('Attendance')
        .appendRow(['id', 'date', 'memberIds', 'quarterId']);
    sheetapp
        .insertSheet('ClubInfo')
        .appendRow([
            'memberFee',
            'officerFee',
            'daysUntilFeeRequired',
            'currentQuarterId',
        ]);

    sheetapp.deleteSheet(sheetapp.getSheetByName('Sheet1'));
}
