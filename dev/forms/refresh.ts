import { ID as AE_ID } from '../ids/ae';
import { ID as AI_ID } from '../ids/ai';
import { ID as AMI_ID } from '../ids/ami';
import { ID as CD_ID } from '../ids/cd';
import { ID as CT_ID } from '../ids/ct';
import { ID as NQ_ID } from '../ids/nq';
import { ID as RMI_ID } from '../ids/rmi';
import { ID as TA_ID } from '../ids/ta';
import { ID as TF_ID } from '../ids/tf';
import { ID as UCS_ID } from '../ids/ucs';
import { ID as UMS_ID } from '../ids/ums';
import { getClubInfo, getExpenses, getIncomes, getMembers, getPaymentTypes, getStatements } from '../tables/get';
import { capitalizeString, CARRIERS, centsToString, compareByDateDesc, Dictionary, ErrorType, GeneratedForm, IntData } from '../types';
import { enableForm } from './disable';

/**
 * Refreshes all of the forms using values from the database.
 */
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

/**
 * Refreshes the Add Expense form using values from the database.
 */
export function refreshAddExpense() {
    const payTypes = getPaymentTypes().map(entry => {
        if (!entry.name) throw ErrorType.AssertionError;
        return capitalizeString(entry.name.getValue());
    });

    const form = FormApp.openById(AE_ID);

    form.addTextItem()
        .setTitle('Amount')
        .setValidation(FormApp.createTextValidation()
            .requireNumber()
            // @ts-ignore 'build' is not listed as a property
            .build())
        .setRequired(true);
    form.addParagraphTextItem()
        .setTitle('Description')
        .setRequired(true);
    form.addTextItem()
        .setTitle('Recipient')
        .setRequired(true);

    if (payTypes.length === 0) {
        form.addTextItem()
            .setTitle('Payment Type')
            .setRequired(true);
    } else {
        form.addMultipleChoiceItem()
            .setTitle('Payment Type')
            .showOtherOption(true)
            .setRequired(true)
            .setChoiceValues(payTypes);
    }

    enableForm(GeneratedForm.ADD_EXPENSE);
}
/**
 * Refreshes the Add Income form using values from the database.
 */
export function refreshAddIncome() {
    const payTypes = getPaymentTypes().map(entry => {
        if (!entry.name) throw ErrorType.AssertionError;
        return capitalizeString(entry.name.getValue());
    });

    const form = FormApp.openById(AI_ID);

    form.addTextItem()
        .setTitle('Amount')
        .setValidation(FormApp.createTextValidation()
            .requireNumber()
            // @ts-ignore 'build' is not listed as a property
            .build())
        .setRequired(true);
    form.addParagraphTextItem()
        .setTitle('Description')
        .setRequired(true);

    if (payTypes.length === 0) {
        form.addTextItem()
            .setTitle('Payment Type')
            .setRequired(true);
    } else {
        form.addMultipleChoiceItem()
            .setTitle('Payment Type')
            .showOtherOption(true)
            .setRequired(true)
            .setChoiceValues(payTypes);
    }

    enableForm(GeneratedForm.ADD_INCOME);
}
/**
 * Refreshes the Add Member IOU form using values from the database.
 */
export function refreshAddMemberIou() {
    const memberNames = getMembers().map(entry => {
        if (!entry.name || !entry.amountOwed) throw ErrorType.AssertionError;
        const amount = centsToString(entry.amountOwed);
        return capitalizeString(entry.name.getValue()) + ': ' + amount;
    }).sort();

    const form = FormApp.openById(AMI_ID);

    if (memberNames.length === 0) {
        form.addCheckboxItem()
            .setTitle('No members found')
            .setValidation(FormApp.createCheckboxValidation()
                .requireSelectAtMost(0)
                // @ts-ignore 'build' is not listed as a property
                .build())
            .setChoiceValues(['-'])
            .setRequired(true)
    } else {
        form.addCheckboxItem()
            .setTitle('Member')
            .setRequired(true)
            .setChoiceValues(memberNames);
    }
    form.addTextItem()
        .setTitle('Amount')
        .setValidation(FormApp.createTextValidation()
            .requireNumber()
            // @ts-ignore 'build' is not listed as a property
            .build())
        .setRequired(true);
    form.addParagraphTextItem()
        .setTitle('Description')
        .setRequired(true);

    enableForm(GeneratedForm.ADD_MEMBER_IOU);
}
/**
 * Refreshes the Collect Dues form using values from the database.
 */
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

    const payTypes = getPaymentTypes().map(entry => {
        if (!entry.name) throw ErrorType.AssertionError;
        return capitalizeString(entry.name.getValue());
    });

    const form = FormApp.openById(CD_ID);

    if (memberNames.length === 0) {
        form.addCheckboxItem()
            .setTitle('No active members found that haven\'t paid dues')
            .setValidation(FormApp.createCheckboxValidation()
                .requireSelectAtMost(0)
                // @ts-ignore 'build' is not listed as a property
                .build())
            .setChoiceValues(['-'])
            .setRequired(true)
    } else {
        form.addCheckboxItem()
            .setTitle('Member')
            .setRequired(true)
            .setChoiceValues(memberNames);
    }

    if (payTypes.length === 0) {
        form.addTextItem()
            .setTitle('Payment Type')
            .setRequired(true);
    } else {
        form.addMultipleChoiceItem()
            .setTitle('Payment Type')
            .showOtherOption(true)
            .setRequired(true)
            .setChoiceValues(payTypes);
    }

    enableForm(GeneratedForm.COLLECT_DUES);
}
/**
 * Refreshes the Confirm Transfer form using values from the database.
 */
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

    const transfers: string[] = [];
    getStatements().sort(compareByDateDesc).forEach(entry => {
        if (!entry.id || !entry.date || !entry.confirmed) throw ErrorType.AssertionError;
        if (!entry.confirmed.getValue()) {
            const curDetails = statementDetails[entry.id.getValue()];
            if (!curDetails) throw ErrorType.AssertionError;

            const payType = idToPayType[curDetails.payType];
            if (payType === undefined) throw ErrorType.AssertionError

            transfers.push(entry.date.toDateString() +
                ', ' + centsToString(new IntData(curDetails.amount)) +
                ' ' + capitalizeString(payType) +
                ' [' + entry.id.toString() + ']');
        }
    });

    const form = FormApp.openById(CT_ID);

    if (transfers.length === 0) {
        form.addCheckboxItem()
            .setTitle('No unconfirmed statements found')
            .setValidation(FormApp.createCheckboxValidation()
                .requireSelectAtMost(0)
                // @ts-ignore 'build' is not listed as a property
                .build())
            .setChoiceValues(['-'])
            .setRequired(true)
    } else {
        form.addCheckboxItem()
            .setTitle('Transfer')
            .setRequired(true)
            .setChoiceValues(transfers);
    }

    enableForm(GeneratedForm.CONFIRM_TRANSFER);
}
/**
 * Refreshes the Next Quarter form using values from the database.
 */
export function refreshNextQuarter() {
    const clubInfo = getClubInfo();

    const form = FormApp.openById(NQ_ID);

    form.addCheckboxItem()
        .setTitle('Confirmation')
        .setRequired(true)
        .setChoiceValues(['Is it ' + clubInfo.currentQuarterId.next().toDateString() + '?']);

    enableForm(GeneratedForm.NEXT_QUARTER);
}
/**
 * Refreshes the Resolve Member IOU form using values from the database.
 */
export function refreshResolveMemberIou() {
    const memberNames = getMembers().map(entry => {
        if (!entry.name || !entry.amountOwed) throw ErrorType.AssertionError;
        const amount = centsToString(entry.amountOwed);
        return capitalizeString(entry.name.getValue()) + ': ' + amount;
    }).sort();

    const payTypes = getPaymentTypes().map(entry => {
        if (!entry.name) throw ErrorType.AssertionError;
        return capitalizeString(entry.name.getValue());
    });

    const form = FormApp.openById(RMI_ID);

    if (memberNames.length === 0) {
        form.addCheckboxItem()
            .setTitle('No members found')
            .setValidation(FormApp.createCheckboxValidation()
                .requireSelectAtMost(0)
                // @ts-ignore 'build' is not listed as a property
                .build())
            .setChoiceValues(['-'])
            .setRequired(true)
    } else {
        form.addCheckboxItem()
            .setTitle('Member')
            .setRequired(true)
            .setChoiceValues(memberNames);
    }
    form.addTextItem()
        .setTitle('Amount')
        .setValidation(FormApp.createTextValidation()
            .requireNumber()
            // @ts-ignore 'build' is not listed as a property
            .build())
        .setRequired(true);
    form.addParagraphTextItem()
        .setTitle('Description')
        .setRequired(true);

    if (payTypes.length === 0) {
        form.addTextItem()
            .setTitle('Payment Type')
            .setRequired(true);
    } else {
        form.addMultipleChoiceItem()
            .setTitle('Payment Type')
            .showOtherOption(true)
            .setRequired(true)
            .setChoiceValues(payTypes);
    }

    enableForm(GeneratedForm.RESOLVE_MEMBER_IOU);
}
/**
 * Refreshes the Take Attendance form using values from the database.
 */
export function refreshTakeAttendance() {
    const memberNames = getMembers().filter(entry => {
        if (!entry.active) throw ErrorType.AssertionError;
        return entry.active.getValue();
    }).sort((a, b) => {
        if (
            !a.dateJoined || !a.name || !a.active ||
            !b.dateJoined || !b.name || !b.active
        ) {
            throw ErrorType.AssertionError;
        }

        // SORT BY YEAR JOINED

        const aYear = a.dateJoined.getValue().getFullYear();
        const bYear = b.dateJoined.getValue().getFullYear();
        if (aYear !== bYear) {
            return aYear - bYear;
        } else {
            return a.name.getValue().localeCompare(b.name.getValue());
        }

        // SORT ALPHABETICALLY
        // return a.name.getValue().localeCompare(b.name.getValue());
    }).map(entry => {
        if (!entry.name) throw ErrorType.AssertionError;
        return capitalizeString(entry.name.getValue());
    });

    const form = FormApp.openById(TA_ID);

    if (memberNames.length === 0) {
        form.addCheckboxItem()
            .setTitle('No members found')
            .setValidation(FormApp.createCheckboxValidation()
                .requireSelectAtMost(0)
                // @ts-ignore 'build' is not listed as a property
                .build())
            .setChoiceValues(['-'])
    } else {
        form.addCheckboxItem()
            .setTitle('Member')
            .setChoiceValues(memberNames);
    }
    form.addParagraphTextItem()
        .setTitle('New Members')
        .setHelpText('Separate each name with a new line');

    enableForm(GeneratedForm.TAKE_ATTENDANCE);
}
/**
 * Refreshes the Transfer Funds form using values from the database.
 */
export function refreshTransferFunds() {
    const idToPayType: Dictionary<number, string> = {};
    getPaymentTypes().forEach(entry => {
        if (!entry.id || !entry.name) throw ErrorType.AssertionError;
        idToPayType[entry.id.getValue()] = capitalizeString(entry.name.getValue());
    });

    const incomes: string[] = [];
    getIncomes().sort(compareByDateDesc).forEach(entry => {
        if (!entry.id || !entry.amount || !entry.paymentTypeId || !entry.statementId) throw ErrorType.AssertionError;

        if (entry.statementId.getValue() === -1) {
            const payType = idToPayType[entry.paymentTypeId.getValue()];
            if (payType === undefined) throw ErrorType.AssertionError

            incomes.push(centsToString(entry.amount) +
                ' ' + capitalizeString(payType) +
                ' [' + entry.id.toString() + ']');
        }
    });

    const expenses: string[] = [];
    getExpenses().sort(compareByDateDesc).forEach(entry => {
        if (!entry.id || !entry.amount || !entry.paymentTypeId || !entry.statementId) throw ErrorType.AssertionError;

        if (entry.statementId.getValue() === -1) {
            const payType = idToPayType[entry.paymentTypeId.getValue()];
            if (payType === undefined) throw ErrorType.AssertionError

            expenses.push(centsToString(entry.amount) +
                ' ' + capitalizeString(payType) +
                ' [' + entry.id.toString() + ']');
        }
    });

    const form = FormApp.openById(TF_ID);

    if (incomes.length === 0) {
        form.addCheckboxItem()
            .setTitle('No incomes left to transfer')
            .setValidation(FormApp.createCheckboxValidation()
                .requireSelectAtMost(0)
                // @ts-ignore 'build' is not listed as a property
                .build())
            .setChoiceValues(['-'])
    } else {
        form.addCheckboxItem()
            .setTitle('Income')
            .setChoiceValues(incomes);
    }
    if (expenses.length === 0) {
        form.addCheckboxItem()
            .setTitle('No expenses left to transfer')
            .setValidation(FormApp.createCheckboxValidation()
                .requireSelectAtMost(0)
                // @ts-ignore 'build' is not listed as a property
                .build())
            .setChoiceValues(['-'])
    } else {
        form.addCheckboxItem()
            .setTitle('Expense')
            .setChoiceValues(expenses);
    }

    enableForm(GeneratedForm.TRANSFER_FUNDS);
}
/**
 * Refreshes the Update Contact Settings form using values from the database.
 */
export function refreshUpdateContactSettings() {
    const memberNames: string[] = [];
    getMembers().forEach(entry => {
        if (!entry.name || !entry.active) throw ErrorType.AssertionError;
        if (entry.active.getValue()) {
            memberNames.push(capitalizeString(entry.name.getValue()));
        }
    })
    memberNames.sort();

    const carriers = Object.keys(CARRIERS);

    const form = FormApp.openById(UCS_ID);

    form.setDescription('Please only choose phone OR email, only one will be recorded.');

    if (memberNames.length === 0) {
        form.addCheckboxItem()
            .setTitle('No active members found')
            .setValidation(FormApp.createCheckboxValidation()
                .requireSelectAtMost(0)
                // @ts-ignore 'build' is not listed as a property
                .build())
            .setChoiceValues(['-'])
            .setRequired(true)
    } else {
        form.addMultipleChoiceItem()
            .setTitle('Name')
            .setRequired(true)
            .setChoiceValues(memberNames);
    }
    form.addTextItem()
        .setTitle('Email');
    if (carriers.length > 0) {
        form.addTextItem()
            .setTitle('Phone Number')
            .setHelpText('Using the form \'XXX-XXX-XXXX\'')
            .setValidation(FormApp.createTextValidation()
                .requireTextMatchesPattern('[0-9]{3}-[0-9]{3}-[0-9]{4}')
                // @ts-ignore 'build' is not listed as a property
                .build());
        form.addMultipleChoiceItem()
            .setTitle('Phone Carrier')
            .setChoiceValues(carriers);
    }
    form.addMultipleChoiceItem()
        .setTitle('Recieve notification when new poll is created?')
        .setChoiceValues(['Yes', 'No']);
    form.addMultipleChoiceItem()
        .setTitle('Recieve receipts after paying dues?')
        .setChoiceValues(['Yes', 'No']);

    enableForm(GeneratedForm.UPDATE_CONTACT_SETTINGS);
}
/**
 * Refreshes the Update Member Status form using values from the database.
 */
export function refreshUpdateMemberStatus() {
    const memberNames = getMembers().map(entry => {
        if (!entry.name) throw ErrorType.AssertionError;
        return capitalizeString(entry.name.getValue());
    }).sort();

    const form = FormApp.openById(UMS_ID);

    if (memberNames.length === 0) {
        form.addCheckboxItem()
            .setTitle('No members found')
            .setValidation(FormApp.createCheckboxValidation()
                .requireSelectAtMost(0)
                // @ts-ignore 'build' is not listed as a property
                .build())
            .setChoiceValues(['-'])
            .setRequired(true)
    } else {
        form.addCheckboxItem()
            .setTitle('Member')
            .setRequired(true)
            .setChoiceValues(memberNames);
    }
    form.addMultipleChoiceItem()
        .setTitle('Performing?')
        .setChoiceValues(['Yes', 'No']);
    form.addMultipleChoiceItem()
        .setTitle('Active?')
        .setChoiceValues(['Yes', 'No']);
    form.addMultipleChoiceItem()
        .setTitle('Officer?')
        .setChoiceValues(['Yes', 'No']);

    enableForm(GeneratedForm.UPDATE_MEMBER_STATUS);
}
