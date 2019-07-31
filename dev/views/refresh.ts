import { ID } from '../ids/viewsId';
import { setData } from '../tableOps';
import { getAttendances, getClubInfo, getExpenses, getIncomes, getMembers, getPaymentTypeIds, getPaymentTypes, getRecipients, getStatements } from "../tables/get";
import { capitalizeString, Color, compareByDateDesc, DateData, Dictionary, ErrorType, MemberEntry, NumberFormat, StringData, UniqueList } from '../types';

export function refreshAllViews() {
    refreshAccountInfo();
    refreshMembers();
    refreshIncomes();
    refreshExpenses();
    refreshAllTransactions();
    refreshStatements()
}

export function refreshAccountInfo() {
    const curQuarter = getClubInfo().currentQuarterId;

    const incomes = getIncomes();
    const expenses = getExpenses();
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

    let bank = 0;
    let venmo = 0;
    let onHand = 0;

    for (const income of incomes) {
        if (!income.amount || !income.paymentTypeId || !income.statementId) throw ErrorType.AssertionError;

        if (income.statementId.getValue() === -1) {
            if (income.paymentTypeId.getValue() === venmoId) {
                venmo += income.amount.getValue();
            } else {
                onHand += income.amount.getValue();
            }
        } else {
            bank += income.amount.getValue();
        }
    }
    for (const expense of expenses) {
        if (!expense.amount || !expense.paymentTypeId || !expense.statementId) throw ErrorType.AssertionError;

        if (expense.statementId.getValue() === -1) {
            if (expense.paymentTypeId.getValue() === venmoId) {
                venmo -= expense.amount.getValue();
            } else {
                onHand -= expense.amount.getValue();
            }
        } else {
            bank -= expense.amount.getValue();
        }
    }

    const tableVals = [[
        curQuarter.toDateString(),
        ((bank + venmo + onHand) / 100).toString(),
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
export function refreshMembers() {
    const clubInfo = getClubInfo();

    const memAttendance: Dictionary<number, UniqueList<number>> = {};
    const activeMems: MemberEntry[] = [];
    const inactiveMems: MemberEntry[] = [];
    getMembers().forEach(entry => {
        if (!entry.id || !entry.active) throw ErrorType.AssertionError;
        if (entry.active.getValue()) {
            activeMems.push(entry);
        } else {
            inactiveMems.push(entry);
        }
        memAttendance[entry.id.getValue()] = new UniqueList<number>();
    });
    activeMems.sort((a, b) => {
        if (
            !a.dateJoined || !a.name ||
            !b.dateJoined || !b.name
        ) {
            throw ErrorType.AssertionError;
        }
        const aYear = a.dateJoined.getValue().getFullYear();
        const bYear = b.dateJoined.getValue().getFullYear();
        if (aYear !== bYear) {
            return aYear - bYear;
        } else {
            return a.name.getValue().localeCompare(b.name.getValue());
        }
    });
    inactiveMems.sort((a, b) => {
        if (!a.name || !b.name) throw ErrorType.AssertionError;
        return a.name.getValue().localeCompare(b.name.getValue());
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
                if (!curSet) throw ErrorType.AssertionError;
                curSet.add(dateNum);
            });
        }
    });

    const tableVals: string[][] = [];
    const tableFormats: string[][] = [];
    const tableColors: string[][] = [];
    const breakLineNums: number[] = [];
    let prevYear = activeMems.length === 0 ? undefined : (activeMems[0].dateJoined as DateData).getValue().getFullYear();
    for (let i = 0; i < activeMems.length; ++i) {
        const curId = activeMems[i].id;
        const curName = activeMems[i].name;
        const curDate = activeMems[i].dateJoined;
        const curAmount = activeMems[i].amountOwed;
        const curDuesPaid = activeMems[i].currentDuesPaid;
        if (
            !curId ||
            !curName ||
            !curDate ||
            !curAmount ||
            !curDuesPaid
        ) throw ErrorType.AssertionError;

        const attnsSet = memAttendance[curId.getValue()];
        if (!attnsSet) throw ErrorType.AssertionError;
        const numAttns = attnsSet.size();

        tableVals.push([
            capitalizeString(curName.toString()),
            curDate.toDateString(),
            (curAmount.getValue() / 100).toString(),
            curDuesPaid.getValue() ? 'Yes' : 'No',
            numAttns.toString()
        ]);

        tableFormats.push([
            NumberFormat.TEXT,
            NumberFormat.DATE,
            NumberFormat.MONEY,
            NumberFormat.TEXT,
            NumberFormat.INTEGER
        ]);

        const duesOwed = !curDuesPaid.getValue() && numAttns >= clubInfo.daysUntilFeeRequired.getValue();
        tableColors.push([
            Color.WHITE,
            Color.WHITE,
            curAmount.getValue() === 0 ? Color.WHITE : Color.LIGHT_RED,
            duesOwed ? Color.PALE_RED : Color.WHITE,
            duesOwed ? Color.PALE_RED : Color.WHITE
        ]);

        const curYear = curDate.getValue().getFullYear();
        if (curYear !== prevYear) {
            breakLineNums.push(i);
            prevYear = curYear;
        }
    }
    if (activeMems.length > 0) breakLineNums.push(activeMems.length);
    for (let i = 0; i < inactiveMems.length; ++i) {
        const curId = inactiveMems[i].id;
        const curName = inactiveMems[i].name;
        const curDate = inactiveMems[i].dateJoined;
        const curAmount = inactiveMems[i].amountOwed;
        const curDuesPaid = inactiveMems[i].currentDuesPaid;
        if (
            !curId ||
            !curName ||
            !curDate ||
            !curAmount ||
            !curDuesPaid
        ) throw ErrorType.AssertionError;

        const attnsSet = memAttendance[curId.getValue()];
        const numAttns = attnsSet ? attnsSet.size() : 0;

        tableVals.push([
            capitalizeString(curName.toString()),
            curDate.toDateString(),
            (curAmount.getValue() / 100).toString(),
            curDuesPaid.getValue() ? 'Yes' : 'No',
            numAttns.toString()
        ]);

        tableFormats.push([
            NumberFormat.TEXT,
            NumberFormat.DATE,
            NumberFormat.MONEY,
            NumberFormat.TEXT,
            NumberFormat.INTEGER
        ]);

        const duesOwed = !curDuesPaid.getValue() && numAttns >= clubInfo.daysUntilFeeRequired.getValue();
        tableColors.push([
            Color.LIGHT_GRAY,
            Color.LIGHT_GRAY,
            curAmount.getValue() === 0 ? Color.LIGHT_GRAY : Color.LIGHT_RED,
            duesOwed ? Color.PALE_RED : Color.LIGHT_GRAY,
            duesOwed ? Color.PALE_RED : Color.LIGHT_GRAY
        ]);
    }

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Members');
    setData(sheet, tableVals, tableFormats, tableColors, breakLineNums);
}
export function refreshIncomes() {
    const incomes = getIncomes().sort(compareByDateDesc);

    const idToPayType: Dictionary<number, string> = {};
    getPaymentTypes().forEach(entry => {
        if (!entry.id || !entry.name) throw ErrorType.AssertionError;
        idToPayType[entry.id.getValue()] = capitalizeString(entry.name.getValue());
    });

    const backColors = [Color.PALE_BLUE, Color.PALE_GREEN];

    const tableVals = [];
    const tableFormats = [];
    const tableColors = [];
    for (let i = 0; i < incomes.length; ++i) {
        const curDate = incomes[i].date;
        const curAmount = incomes[i].amount;
        const curDesc = incomes[i].description;
        const curPayId = incomes[i].paymentTypeId;
        const curStateId = incomes[i].statementId;
        if (
            !curDate ||
            !curAmount ||
            !curDesc ||
            !curPayId ||
            !curStateId
        ) throw ErrorType.AssertionError;

        const payType = idToPayType[curPayId.getValue()];
        if (!payType) throw ErrorType.AssertionError;
        const inAccount = curStateId.getValue() !== -1;

        tableVals.push([
            curDate.toDateString(),
            (curAmount.getValue() / 100).toString(),
            curDesc.getValue(),
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
    }

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Incomes');
    setData(sheet, tableVals, tableFormats, tableColors);
}
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

    const tableVals = [];
    const tableFormats = [];
    const tableColors = [];
    for (let i = 0; i < expenses.length; ++i) {
        const curDate = expenses[i].date;
        const curAmount = expenses[i].amount;
        const curDesc = expenses[i].description;
        const curPayId = expenses[i].paymentTypeId;
        const curRecip = expenses[i].recipientId;
        const curStateId = expenses[i].statementId;
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
        if (!payType || !recipient) throw ErrorType.AssertionError;
        const inAccount = curStateId.getValue() !== -1;

        tableVals.push([
            curDate.toDateString(),
            (curAmount.getValue() / 100).toString(),
            curDesc.getValue(),
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
    }

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Expenses');
    setData(sheet, tableVals, tableFormats, tableColors);
}
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

    const tableVals = [];
    const tableFormats = [];
    const tableColors = [];
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
                if (!payType) throw ErrorType.AssertionError;
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
                if (!payType || !recipient) throw ErrorType.AssertionError;
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
            if (!payType) throw ErrorType.AssertionError;
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
            if (!payType) throw ErrorType.AssertionError;
            const recipient = idToRecipient[curRecip.getValue()];
            if (!recipient) throw ErrorType.AssertionError;
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
export function refreshStatements() {
    const incomes = getIncomes();
    const expenses = getExpenses();
    const statements = getStatements().sort(compareByDateDesc);

    const statementDetails: Dictionary<number, { amount: number, payType: number }> = {};
    statements.forEach(entry => {
        if (!entry.id) throw ErrorType.AssertionError;
        statementDetails[entry.id.getValue()] = {
            amount: 0,
            payType: -1
        };
    });
    incomes.forEach(entry => {
        if (!entry.amount || !entry.paymentTypeId || !entry.statementId) throw ErrorType.AssertionError;
        if (entry.statementId.getValue() !== -1) {
            let curDetails = statementDetails[entry.statementId.getValue()];
            if (!curDetails) throw ErrorType.AssertionError;
            curDetails.amount += entry.amount.getValue();
            if (curDetails.payType === -1) {
                curDetails.payType = entry.paymentTypeId.getValue();
            }
        }
    });
    expenses.forEach(entry => {
        if (!entry.amount || !entry.paymentTypeId || !entry.statementId) throw ErrorType.AssertionError;
        if (entry.statementId.getValue() !== -1) {
            let curDetails = statementDetails[entry.statementId.getValue()];
            if (!curDetails) throw ErrorType.AssertionError;
            curDetails.amount -= entry.amount.getValue();
            if (curDetails.payType === -1) {
                curDetails.payType = entry.paymentTypeId.getValue();
            }
        }
    });

    const idToPayType: Dictionary<number, string> = {};
    getPaymentTypes().forEach(entry => {
        if (!entry.id || !entry.name) throw ErrorType.AssertionError;
        idToPayType[entry.id.getValue()] = capitalizeString(entry.name.getValue());
    });

    const backColors = [Color.PALE_BLUE, Color.PALE_GREEN];

    const tableVals = [];
    const tableFormats = [];
    const tableColors = [];
    for (let i = 0; i < statements.length; ++i) {
        const curId = statements[i].id;
        const curDate = statements[i].date;
        const curConfirmed = statements[i].confirmed;
        if (
            !curId ||
            !curDate ||
            !curConfirmed
        ) throw ErrorType.AssertionError;

        const curDetails = statementDetails[curId.getValue()];
        if (!curDetails) throw ErrorType.AssertionError;

        const payType = idToPayType[curDetails.payType];
        if (!payType) throw ErrorType.AssertionError;

        tableVals.push([
            curDate.toDateString(),
            (curDetails.amount / 100).toString(),
            payType,
            curConfirmed.getValue() ? 'Yes' : 'No'
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
            curConfirmed.getValue() ? curColor : Color.LIGHT_RED
        ]);
    }

    const sheet = SpreadsheetApp.openById(ID).getSheetByName('Statements');
    setData(sheet, tableVals, tableFormats, tableColors);
}
