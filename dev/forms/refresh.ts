import { getClubInfo, getExpenses, getIncomes, getMembers, getPaymentTypes, getStatements } from '../tables/get';
import { capitalizeString, CARRIERS, centsToString, compareByDateDesc, Dictionary, ErrorType, IntData } from '../types';
import { ID as AE_ID } from './ids/ae';
import { ID as AI_ID } from './ids/ai';
import { ID as AMI_ID } from './ids/ami';
import { ID as CD_ID } from './ids/cd';
import { ID as CT_ID } from './ids/ct';
import { ID as NQ_ID } from './ids/nq';
import { ID as RMI_ID } from './ids/rmi';
import { ID as TA_ID } from './ids/ta';
import { ID as TF_ID } from './ids/tf';
import { ID as UCS_ID } from './ids/ucs';
import { ID as UMS_ID } from './ids/ums';

export function refreshAllForms() {
    refreshAddExpense();
    refreshAddIncome();
    refreshAddMemberIou();
    refreshCollectDues();
    refreshConfirmTransfer();
    refreshNextQuarter();
    refreshResolveMemberIou();
    refreshTakeAttendance();
    refreshTransferFunds();
    refreshUpdateContactSettings();
    refreshUpdateMemberStatus();
}

export function refreshAddExpense() {
    const payTypes = getPaymentTypes().map(entry => {
        if (!entry.name) throw ErrorType.AssertionError;
        return capitalizeString(entry.name.getValue());
    });
    if (payTypes.length === 0) payTypes.push('');

    const formItems = FormApp.openById(AE_ID).getItems();
    formItems[3].asMultipleChoiceItem().setChoiceValues(payTypes);
}
export function refreshAddIncome() {
    const payTypes = getPaymentTypes().map(entry => {
        if (!entry.name) throw ErrorType.AssertionError;
        return capitalizeString(entry.name.getValue());
    });
    if (payTypes.length === 0) payTypes.push('');

    const formItems = FormApp.openById(AI_ID).getItems();
    formItems[2].asMultipleChoiceItem().setChoiceValues(payTypes);
}
export function refreshAddMemberIou() {
    const memberNames = getMembers().map(entry => {
        if (!entry.name || !entry.amountOwed) throw ErrorType.AssertionError;
        const amount = centsToString(entry.amountOwed);
        return capitalizeString(entry.name.getValue()) + ': ' + amount;
    }).sort();
    if (memberNames.length === 0) memberNames.push('');

    const formItems = FormApp.openById(AMI_ID).getItems();
    formItems[0].asCheckboxItem().setChoiceValues(memberNames);
}
export function refreshCollectDues() {
    const clubInfo = getClubInfo();
    const memberFee = centsToString(clubInfo.memberFee);
    const officerFee = centsToString(clubInfo.officerFee);

    const memberNames: string[] = [];
    getMembers().forEach(entry => {
        if (!entry.name || !entry.active || !entry.currentDuesPaid || !entry.officer) throw ErrorType.AssertionError;
        if (entry.active.getValue() && !entry.currentDuesPaid.getValue()) {
            const fee = entry.officer.getValue() ? officerFee : memberFee;
            memberNames.push(capitalizeString(entry.name.getValue()) + ': ' + fee);
        }
    });
    memberNames.sort();
    if (memberNames.length === 0) memberNames.push('');

    const payTypes = getPaymentTypes().map(entry => {
        if (!entry.name) throw ErrorType.AssertionError;
        return capitalizeString(entry.name.getValue());
    });
    if (payTypes.length === 0) payTypes.push('');

    const formItems = FormApp.openById(CD_ID).getItems();
    formItems[0].asCheckboxItem().setChoiceValues(memberNames);
    formItems[1].asMultipleChoiceItem().setChoiceValues(payTypes);
}
export function refreshConfirmTransfer() {
    const statementDetails: Dictionary<number, { payType: number, amount: number }> = {};
    getIncomes().forEach(entry => {
        if (!entry.amount || !entry.paymentTypeId || !entry.statementId) throw ErrorType.AssertionError;
        let curDetails = statementDetails[entry.statementId.getValue()];
        if (!curDetails) {
            curDetails = {
                payType: entry.paymentTypeId.getValue(),
                amount: 0
            };
            statementDetails[entry.statementId.getValue()] = curDetails;
        }
        curDetails.amount += entry.amount.getValue();
    });
    getExpenses().forEach(entry => {
        if (!entry.amount || !entry.paymentTypeId || !entry.statementId) throw ErrorType.AssertionError;
        let curDetails = statementDetails[entry.statementId.getValue()];
        if (!curDetails) {
            curDetails = {
                payType: entry.paymentTypeId.getValue(),
                amount: 0
            };
            statementDetails[entry.statementId.getValue()] = curDetails;
        }
        curDetails.amount -= entry.amount.getValue();
    });
    const idToPayType: Dictionary<number, string> = {};
    getPaymentTypes().forEach(entry => {
        if (!entry.id || !entry.name) throw ErrorType.AssertionError;
        idToPayType[entry.id.getValue()] = capitalizeString(entry.name.getValue());
    });

    const statements = getStatements().sort(compareByDateDesc);
    const transfers: string[] = [];
    statements.forEach(entry => {
        if (!entry.id || !entry.confirmed) throw ErrorType.AssertionError;
        if (!entry.confirmed.getValue()) {
            const curDetails = statementDetails[entry.id.getValue()];
            if (!curDetails) throw ErrorType.AssertionError;

            const payType = idToPayType[curDetails.payType];
            if (!payType) throw ErrorType.AssertionError

            transfers.push(centsToString(new IntData(curDetails.amount)) +
                ' ' + capitalizeString(payType) +
                ' [' + entry.id.toString() + ']');
        }
    });
    if (transfers.length === 0) transfers.push('');

    const formItems = FormApp.openById(CT_ID).getItems();
    formItems[0].asCheckboxItem().setChoiceValues(transfers);
}
export function refreshNextQuarter() {
    const clubInfo = getClubInfo();

    const formItems = FormApp.openById(NQ_ID).getItems();
    formItems[0].asCheckboxItem().setChoiceValues(['Is it ' + clubInfo.currentQuarterId.next().toDateString() + '?']);
}
export function refreshResolveMemberIou() {
    const memberNames = getMembers().map(entry => {
        if (!entry.name || !entry.amountOwed) throw ErrorType.AssertionError;
        const amount = centsToString(entry.amountOwed);
        return capitalizeString(entry.name.getValue()) + ': ' + amount;
    }).sort();
    if (memberNames.length === 0) memberNames.push('');

    const payTypes = getPaymentTypes().map(entry => {
        if (!entry.name) throw ErrorType.AssertionError;
        return capitalizeString(entry.name.getValue());
    });
    if (payTypes.length === 0) payTypes.push('');

    const formItems = FormApp.openById(RMI_ID).getItems();
    formItems[0].asCheckboxItem().setChoiceValues(memberNames);
    formItems[3].asMultipleChoiceItem().setChoiceValues(payTypes);
}
export function refreshTakeAttendance() {
    const memberNames = getMembers().map(entry => {
        if (!entry.name) throw ErrorType.AssertionError;
        return capitalizeString(entry.name.getValue());
    }).sort();
    if (memberNames.length === 0) memberNames.push('');

    const formItems = FormApp.openById(TA_ID).getItems();
    formItems[0].asCheckboxItem().setChoiceValues(memberNames);
}
export function refreshTransferFunds() {
    const idToPayType: Dictionary<number, string> = {};
    getPaymentTypes().forEach(entry => {
        if (!entry.id || !entry.name) throw ErrorType.AssertionError;
        idToPayType[entry.id.getValue()] = capitalizeString(entry.name.getValue());
    });

    const incomeVals = getIncomes().sort(compareByDateDesc);
    const incomes: string[] = [];
    incomeVals.forEach(entry => {
        if (!entry.id || !entry.amount || !entry.paymentTypeId || !entry.statementId) throw ErrorType.AssertionError;

        if (entry.statementId.getValue() === -1) {
            const payType = idToPayType[entry.paymentTypeId.getValue()];
            if (!payType) throw ErrorType.AssertionError

            incomes.push(centsToString(entry.amount) +
                ' ' + capitalizeString(payType) +
                ' [' + entry.id.toString() + ']');
        }
    });
    if (incomes.length === 0) incomes.push('');

    const expenseVals = getExpenses().sort(compareByDateDesc);
    const expenses: string[] = [];
    expenseVals.forEach(entry => {
        if (!entry.id || !entry.amount || !entry.paymentTypeId || !entry.statementId) throw ErrorType.AssertionError;

        if (entry.statementId.getValue() === -1) {
            const payType = idToPayType[entry.paymentTypeId.getValue()];
            if (!payType) throw ErrorType.AssertionError

            expenses.push(centsToString(entry.amount) +
                ' ' + capitalizeString(payType) +
                ' [' + entry.id.toString() + ']');
        }
    });
    if (expenses.length === 0) expenses.push('');

    const formItems = FormApp.openById(TF_ID).getItems();
    formItems[0].asCheckboxItem().setChoiceValues(incomes);
    formItems[1].asCheckboxItem().setChoiceValues(expenses);
}
export function refreshUpdateContactSettings() {
    const memberNames = [];
    getMembers().forEach(entry => {
        if (!entry.name || !entry.active) throw ErrorType.AssertionError;
        if (entry.active.getValue()) {
            memberNames.push(capitalizeString(entry.name.getValue()));
        }
    })
    memberNames.sort();
    if (memberNames.length === 0) memberNames.push('');

    const carriers = Object.keys(CARRIERS);
    if (carriers.length === 0) carriers.push('');

    const formItems = FormApp.openById(UCS_ID).getItems();
    formItems[0].asMultipleChoiceItem().setChoiceValues(memberNames);
    formItems[3].asMultipleChoiceItem().setChoiceValues(carriers);
}
export function refreshUpdateMemberStatus() {
    const memberNames = getMembers().map(entry => {
        if (!entry.name) throw ErrorType.AssertionError;
        return capitalizeString(entry.name.getValue());
    }).sort();
    if (memberNames.length === 0) memberNames.push('');

    const formItems = FormApp.openById(UMS_ID).getItems();
    formItems[0].asCheckboxItem().setChoiceValues(memberNames);
}
