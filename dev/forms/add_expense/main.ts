import { getPaymentTypeIds, getRecipientIds } from '../../get';
import { appendExpense, appendPaymentType, appendRecipient } from '../../tables/append';
import { DateData, ErrorType, IntData, StringData } from '../../types';
import { getMostRecentResponse } from '../formOps';

/**
 * Executes upon submission of this form.
 */
export function onFormSubmit() {
    handleResponse(getMostRecentResponse(FormApp.getActiveForm()));
}

function handleResponse(resItems: GoogleAppsScript.Forms.ItemResponse[]) {
    // Short text
    const amountRes = resItems[0].getResponse() as string;
    // Long text
    const desc = resItems[1].getResponse() as string;
    // Short text
    const recipient = resItems[2].getResponse() as string;
    // Multi-choice
    const paymentType = resItems[3].getResponse() as string;

    addExpense(amountRes, desc, recipient, paymentType);
}

export function addExpense(
    amountRes: string,
    desc: string,
    recipient: string,
    paymentType: string
) {
    const today = new DateData(new Date());
    const recipientData = new StringData(recipient);
    const payTypeData = new StringData(paymentType);

    let payTypeId: IntData;
    try {
        payTypeId = getPaymentTypeIds([payTypeData])[0];
    } catch (e) {
        if (e === ErrorType.NoMatchFoundError) {
            payTypeId = appendPaymentType([payTypeData])[0];
        } else {
            throw e;
        }
    }

    let recipientId: IntData;
    try {
        recipientId = getRecipientIds([recipientData])[0];
    } catch (e) {
        if (e === ErrorType.NoMatchFoundError) {
            recipientId = appendRecipient([recipientData])[0];
        } else {
            throw e;
        }
    }

    const amount = parseFloat(amountRes) * 100;
    appendExpense([today], [new IntData(amount)], [new StringData(desc)], [payTypeId], [recipientId], [new IntData(-1)]);
}
