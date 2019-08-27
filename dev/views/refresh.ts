import { ID } from '../ids/viewsId';
import { setData } from '../tableOps';
import { getAttendances, getClubInfo, getExpenses, getIncomes, getMembers, getPaymentTypeIds, getPaymentTypes, getRecipients, getStatements } from "../tables/get";
import { capitalizeString, Color, compareByDateDesc, Dictionary, ErrorType, NumberFormat, StringData, UniqueList } from '../types';

/**
 * Refreshes all of the sheets in the Views spreadsheet using values from the database.
 */
export function refreshAllViews() {
    refreshAccountInfo();
    refreshMembers();
    refreshIncomes();
    refreshExpenses();
    refreshAllTransactions();
    refreshStatements()
}

/**
 * Refreshes the Account Info view using values from the database.
 */
export function refreshAccountInfo() {
    const curQuarter = getClubInfo().currentQuarterId;

    const unconfirmedList: number[] = [];
    getStatements().forEach(entry => {
        if (!entry.id || !entry.confirmed) throw ErrorType.AssertionError;
        if (!entry.confirmed.getValue()) unconfirmedList.push(entry.id.getValue());
    });

    let venmoId: number;
    try {
        venmoId = getPaymentTypeIds([new StringData('venmo')])[0].getValue();
    } catch (e) {
        if (e === ErrorType.NoMatchFoundError) {
            venmoId = NaN;
        } else {
            throw e;
        }
    }

    let total = 0;
    let bank = 0;
    let venmo = 0;
    let onHand = 0;

    getIncomes().forEach(income => {
        if (!income.amount || !income.paymentTypeId || !income.statementId) throw ErrorType.AssertionError;

        total += income.amount.getValue();
        if (income.statementId.getValue() === -1) {
            if (income.paymentTypeId.getValue() === venmoId) {
                venmo += income.amount.getValue();
            } else {
                onHand += income.amount.getValue();
            }
        } else {
            if (unconfirmedList.indexOf(income.statementId.getValue()) === -1) {
                bank += income.amount.getValue();
            }
        }
    });
    getExpenses().forEach(expense => {
        if (!expense.amount || !expense.paymentTypeId || !expense.statementId) throw ErrorType.AssertionError;

        total -= expense.amount.getValue();
        if (expense.statementId.getValue() === -1) {
            if (expense.paymentTypeId.getValue() === venmoId) {
                venmo -= expense.amount.getValue();
            } else {
                onHand -= expense.amount.getValue();
            }
        } else {
            if (unconfirmedList.indexOf(expense.statementId.getValue()) === -1) {
                bank -= expense.amount.getValue();
            }
        }
    });

    const tableVals = [[
        curQuarter.toDateString(),
        (total / 100).toString(),
        (bank / 100).toString(),
        (venmo / 100).toString(),
        (onHand / 100).toString()
    ]];

    const tableFormats = [[
        NumberFormat.TEXT,
        NumberFormat.MONEY,
        NumberFormat.MONEY,
        NumberFormat.MONEY,
        NumberFormat.MONEY
    ]];

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Account Info');
    setData(sheet, tableVals, tableFormats);
}
/**
 * Refreshes the Members view using values from the database.
 */
export function refreshMembers() {
    const clubInfo = getClubInfo();

    const memAttendance: Dictionary<number, UniqueList<number>> = {};
    const abcMembers = getMembers().sort((a, b) => {
        if (
            !a.dateJoined || !a.name || !a.active ||
            !b.dateJoined || !b.name || !b.active
        ) {
            throw ErrorType.AssertionError;
        }

        if (a.active.getValue() !== b.active.getValue()) {
            if (a.active.getValue()) {
                return -1;
            } else {
                return 1;
            }
        } else {
            if (a.active.getValue()) {
                const aYear = a.dateJoined.getValue().getFullYear();
                const bYear = b.dateJoined.getValue().getFullYear();
                if (aYear !== bYear) {
                    return aYear - bYear;
                } else {
                    return a.name.getValue().localeCompare(b.name.getValue());
                }
            } else {
                return a.name.getValue().localeCompare(b.name.getValue());
            }
        }
    });

    // Unique numbers to represent each day of the year are made using upper
    // bounds for the number of days in a month(50 > 31) and in a year(1000 > 50 * 12).
    getAttendances().forEach(entry => {
        if (!entry.date || !entry.member_ids || !entry.quarter_id) throw ErrorType.AssertionError;
        const curDate = entry.date.getValue();
        const dateNum = curDate.getFullYear() * 1000 +
            curDate.getMonth() * 50 +
            curDate.getDate();
        if (entry.quarter_id.getValue() === clubInfo.currentQuarterId.getValue()) {
            entry.member_ids.getValue().forEach(memberId => {
                let curSet = memAttendance[memberId.getValue()];
                if (!curSet) {
                    curSet = new UniqueList<number>();
                    memAttendance[memberId.getValue()] = curSet;
                }
                curSet.add(dateNum);
            });
        }
    });

    const tableVals: string[][] = [];
    const tableFormats: string[][] = [];
    const tableColors: string[][] = [];
    const breakLineNums: number[] = [];
    let prevYear = NaN;
    abcMembers.forEach((member, i) => {
        if (
            !member.id ||
            !member.name ||
            !member.dateJoined ||
            !member.amountOwed ||
            !member.currentDuesPaid ||
            !member.active
        ) throw ErrorType.AssertionError;

        const attnsSet = memAttendance[member.id.getValue()];
        const numAttns = attnsSet ? attnsSet.size() : 0;

        tableVals.push([
            capitalizeString(member.name.toString()),
            member.dateJoined.toDateString(),
            (member.amountOwed.getValue() / 100).toString(),
            member.currentDuesPaid.getValue() ? 'Yes' : 'No',
            numAttns.toString()
        ]);

        tableFormats.push([
            NumberFormat.TEXT,
            NumberFormat.DATE,
            NumberFormat.MONEY,
            NumberFormat.TEXT,
            NumberFormat.INTEGER
        ]);

        const defaultColor = member.active.getValue() ? Color.WHITE : Color.LIGHT_GRAY;
        const duesOwed = !member.currentDuesPaid.getValue() && numAttns >= clubInfo.daysUntilFeeRequired.getValue();
        tableColors.push([
            defaultColor,
            defaultColor,
            member.amountOwed.getValue() !== 0 ? Color.LIGHT_RED : defaultColor,
            duesOwed ? Color.PALE_RED : defaultColor,
            duesOwed ? Color.PALE_RED : defaultColor
        ]);

        if (member.active.getValue()) {
            const curYear = member.dateJoined.getValue().getFullYear();
            if (curYear !== prevYear) {
                if (!isNaN(prevYear)) {
                    breakLineNums.push(i);
                }
                prevYear = curYear;
            }
        } else {
            if (!isNaN(prevYear)) {
                breakLineNums.push(i);
                prevYear = NaN;
            }
        }
    });

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Members');
    setData(sheet, tableVals, tableFormats, tableColors, breakLineNums);
}
/**
 * Refreshes the Incomes view using values from the database.
 */
export function refreshIncomes() {
    const incomes = getIncomes().sort(compareByDateDesc);

    const idToPayType: Dictionary<number, string> = {};
    getPaymentTypes().forEach(entry => {
        if (!entry.id || !entry.name) throw ErrorType.AssertionError;
        idToPayType[entry.id.getValue()] = capitalizeString(entry.name.getValue());
    });

    const backColors = [Color.PALE_BLUE, Color.PALE_GREEN];

    const tableVals: string[][] = [];
    const tableFormats: string[][] = [];
    const tableColors: string[][] = [];
    incomes.forEach((income, i) => {
        if (
            !income.date ||
            !income.amount ||
            !income.description ||
            !income.paymentTypeId ||
            !income.statementId
        ) throw ErrorType.AssertionError;

        const payType = idToPayType[income.paymentTypeId.getValue()];
        if (payType === undefined) throw ErrorType.AssertionError;
        const inAccount = income.statementId.getValue() !== -1;

        tableVals.push([
            income.date.toDateString(),
            (income.amount.getValue() / 100).toString(),
            income.description.getValue(),
            payType,
            inAccount ? 'Yes' : 'No'
        ]);

        tableFormats.push([
            NumberFormat.DATE,
            NumberFormat.MONEY,
            NumberFormat.TEXT,
            NumberFormat.TEXT,
            NumberFormat.TEXT
        ]);

        const curColor = backColors[i % backColors.length]
        tableColors.push([
            curColor,
            curColor,
            curColor,
            curColor,
            inAccount ? curColor : Color.LIGHT_RED
        ]);
    });

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Incomes');
    setData(sheet, tableVals, tableFormats, tableColors);
}
/**
 * Refreshes the Expenses view using values from the database.
 */
export function refreshExpenses() {
    const expenses = getExpenses().sort(compareByDateDesc);

    const idToPayType: Dictionary<number, string> = {};
    getPaymentTypes().forEach(entry => {
        if (!entry.id || !entry.name) throw ErrorType.AssertionError;
        idToPayType[entry.id.getValue()] = capitalizeString(entry.name.getValue());
    });

    const idToRecipient: Dictionary<number, string> = {};
    getRecipients().forEach(entry => {
        if (!entry.id || !entry.name) throw ErrorType.AssertionError;
        idToRecipient[entry.id.getValue()] = capitalizeString(entry.name.getValue());
    });

    const backColors = [Color.PALE_BLUE, Color.PALE_GREEN];

    const tableVals: string[][] = [];
    const tableFormats: string[][] = [];
    const tableColors: string[][] = [];
    expenses.forEach((expense, i) => {
        if (
            !expense.date ||
            !expense.amount ||
            !expense.description ||
            !expense.paymentTypeId ||
            !expense.recipientId ||
            !expense.statementId
        ) throw ErrorType.AssertionError;

        const payType = idToPayType[expense.paymentTypeId.getValue()];
        const recipient = idToRecipient[expense.recipientId.getValue()];
        if (payType === undefined || recipient === undefined) throw ErrorType.AssertionError;
        const inAccount = expense.statementId.getValue() !== -1;

        tableVals.push([
            expense.date.toDateString(),
            (expense.amount.getValue() / -100).toString(),
            expense.description.getValue(),
            recipient,
            payType,
            inAccount ? 'Yes' : 'No'
        ]);

        tableFormats.push([
            NumberFormat.DATE,
            NumberFormat.MONEY,
            NumberFormat.TEXT,
            NumberFormat.TEXT,
            NumberFormat.TEXT,
            NumberFormat.TEXT
        ]);

        const curColor = backColors[i % backColors.length]
        tableColors.push([
            curColor,
            curColor,
            curColor,
            curColor,
            curColor,
            inAccount ? curColor : Color.LIGHT_RED
        ]);
    });

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Expenses');
    setData(sheet, tableVals, tableFormats, tableColors);
}
/**
 * Refreshes the All Transactions view using values from the database.
 */
export function refreshAllTransactions() {
    const incomes = getIncomes().sort(compareByDateDesc);
    const expenses = getExpenses().sort(compareByDateDesc);

    const idToPayType: Dictionary<number, string> = {};
    getPaymentTypes().forEach(entry => {
        if (!entry.id || !entry.name) throw ErrorType.AssertionError;
        idToPayType[entry.id.getValue()] = capitalizeString(entry.name.getValue());
    });

    const idToRecipient: Dictionary<number, string> = {};
    getRecipients().forEach(entry => {
        if (!entry.id || !entry.name) throw ErrorType.AssertionError;
        idToRecipient[entry.id.getValue()] = capitalizeString(entry.name.getValue());
    });

    const backColors = [Color.PALE_BLUE, Color.PALE_GREEN];

    const tableVals: string[][] = [];
    const tableFormats: string[][] = [];
    const tableColors: string[][] = [];
    let inc_i = 0;
    let exp_i = 0;
    while (inc_i < incomes.length || exp_i < expenses.length) {
        let inAccount: boolean;
        const curColor = backColors[(exp_i + inc_i) % backColors.length];

        if (inc_i < incomes.length && exp_i < expenses.length) {
            const incDate = incomes[inc_i].date;
            const expDate = expenses[exp_i].date;
            if (!incDate) throw ErrorType.AssertionError;
            if (!expDate) throw ErrorType.AssertionError;
            if (incDate.getValue() > expDate.getValue()) {
                // add Income
                const curDate = incomes[inc_i].date;
                const curAmount = incomes[inc_i].amount;
                const curDesc = incomes[inc_i].description;
                const curPayId = incomes[inc_i].paymentTypeId;
                const curStateId = incomes[inc_i].statementId;
                if (
                    !curDate ||
                    !curAmount ||
                    !curDesc ||
                    !curPayId ||
                    !curStateId
                ) throw ErrorType.AssertionError;

                const payType = idToPayType[curPayId.getValue()];
                if (payType === undefined) throw ErrorType.AssertionError;
                inAccount = curStateId.getValue() !== -1;

                tableVals.push([
                    curDate.toDateString(),
                    (curAmount.getValue() / 100).toString(),
                    curDesc.getValue(),
                    '-',
                    payType,
                    inAccount ? 'Yes' : 'No'
                ]);
                ++inc_i;
            } else {
                // add Expense
                const curDate = expenses[exp_i].date;
                const curAmount = expenses[exp_i].amount;
                const curDesc = expenses[exp_i].description;
                const curPayId = expenses[exp_i].paymentTypeId;
                const curRecip = expenses[exp_i].recipientId;
                const curStateId = expenses[exp_i].statementId;
                if (
                    !curDate ||
                    !curAmount ||
                    !curDesc ||
                    !curPayId ||
                    !curRecip ||
                    !curStateId
                ) throw ErrorType.AssertionError;

                const payType = idToPayType[curPayId.getValue()];
                const recipient = idToRecipient[curRecip.getValue()];
                if (payType === undefined || recipient === undefined) throw ErrorType.AssertionError;
                inAccount = curStateId.getValue() !== -1;

                tableVals.push([
                    curDate.toDateString(),
                    (curAmount.getValue() / -100).toString(),
                    curDesc.getValue(),
                    recipient,
                    payType,
                    inAccount ? 'Yes' : 'No'
                ]);
                ++exp_i;
            }
        } else if (inc_i < incomes.length) {
            // add Income
            const curDate = incomes[inc_i].date;
            const curAmount = incomes[inc_i].amount;
            const curDesc = incomes[inc_i].description;
            const curPayId = incomes[inc_i].paymentTypeId;
            const curStateId = incomes[inc_i].statementId;
            if (
                !curDate ||
                !curAmount ||
                !curDesc ||
                !curPayId ||
                !curStateId
            ) throw ErrorType.AssertionError;

            const payType = idToPayType[curPayId.getValue()];
            if (payType === undefined) throw ErrorType.AssertionError;
            inAccount = curStateId.getValue() !== -1;

            tableVals.push([
                curDate.toDateString(),
                (curAmount.getValue() / 100).toString(),
                curDesc.getValue(),
                '-',
                payType,
                inAccount ? 'Yes' : 'No'
            ]);
            ++inc_i;
        } else {
            // add Expense
            const curDate = expenses[exp_i].date;
            const curAmount = expenses[exp_i].amount;
            const curDesc = expenses[exp_i].description;
            const curPayId = expenses[exp_i].paymentTypeId;
            const curRecip = expenses[exp_i].recipientId;
            const curStateId = expenses[exp_i].statementId;
            if (
                !curDate ||
                !curAmount ||
                !curDesc ||
                !curPayId ||
                !curRecip ||
                !curStateId
            ) throw ErrorType.AssertionError;

            const payType = idToPayType[curPayId.getValue()];
            const recipient = idToRecipient[curRecip.getValue()];
            if (payType === undefined || recipient === undefined) throw ErrorType.AssertionError;
            inAccount = curStateId.getValue() !== -1;

            tableVals.push([
                curDate.toDateString(),
                (curAmount.getValue() / -100).toString(),
                curDesc.getValue(),
                recipient,
                payType,
                inAccount ? 'Yes' : 'No'
            ]);
            ++exp_i;
        }

        tableFormats.push([
            NumberFormat.DATE,
            NumberFormat.MONEY,
            NumberFormat.TEXT,
            NumberFormat.TEXT,
            NumberFormat.TEXT,
            NumberFormat.TEXT
        ]);

        tableColors.push([
            curColor,
            curColor,
            curColor,
            curColor,
            curColor,
            inAccount ? curColor : Color.LIGHT_RED
        ]);
    }

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('All Transactions');
    setData(sheet, tableVals, tableFormats, tableColors);
}
/**
 * Refreshes the Statements view using values from the database.
 */
export function refreshStatements() {
    const statements = getStatements().sort(compareByDateDesc);

    const statementDetails: Dictionary<number, { amount: number, payType: number }> = {};
    getIncomes().forEach(income => {
        if (!income.amount || !income.paymentTypeId || !income.statementId) throw ErrorType.AssertionError;
        if (income.statementId.getValue() !== -1) {
            let curDetails = statementDetails[income.statementId.getValue()];
            if (!curDetails) {
                curDetails = {
                    amount: 0,
                    payType: income.paymentTypeId.getValue()
                }
                statementDetails[income.statementId.getValue()] = curDetails;
            }
            curDetails.amount += income.amount.getValue();
        }
    });
    getExpenses().forEach(expense => {
        if (!expense.amount || !expense.paymentTypeId || !expense.statementId) throw ErrorType.AssertionError;
        if (expense.statementId.getValue() !== -1) {
            let curDetails = statementDetails[expense.statementId.getValue()];
            if (!curDetails) {
                curDetails = {
                    amount: 0,
                    payType: expense.paymentTypeId.getValue()
                }
                statementDetails[expense.statementId.getValue()] = curDetails;
            }
            curDetails.amount -= expense.amount.getValue();
        }
    });

    const idToPayType: Dictionary<number, string> = {};
    getPaymentTypes().forEach(entry => {
        if (!entry.id || !entry.name) throw ErrorType.AssertionError;
        idToPayType[entry.id.getValue()] = capitalizeString(entry.name.getValue());
    });

    const backColors = [Color.PALE_BLUE, Color.PALE_GREEN];

    const tableVals: string[][] = [];
    const tableFormats: string[][] = [];
    const tableColors: string[][] = [];
    statements.forEach((statement, i) => {
        if (
            !statement.id ||
            !statement.date ||
            !statement.confirmed
        ) throw ErrorType.AssertionError;

        let curDetails = statementDetails[statement.id.getValue()];
        if (!curDetails) {
            curDetails = {
                amount: 0,
                payType: NaN
            }
        }

        let payType = idToPayType[curDetails.payType];
        if (payType === undefined) payType = '';

        tableVals.push([
            statement.date.toDateString(),
            (curDetails.amount / 100).toString(),
            payType,
            statement.confirmed.getValue() ? 'Yes' : 'No'
        ]);

        tableFormats.push([
            NumberFormat.DATE,
            NumberFormat.MONEY,
            NumberFormat.TEXT,
            NumberFormat.TEXT,
        ]);

        const curColor = backColors[i % backColors.length]
        tableColors.push([
            curColor,
            curColor,
            curColor,
            statement.confirmed.getValue() ? curColor : Color.LIGHT_RED
        ]);
    });

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Statements');
    setData(sheet, tableVals, tableFormats, tableColors);
}
