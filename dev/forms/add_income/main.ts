import { getPaymentTypeIds } from '../../get';
import { appendIncome, appendPaymentType } from '../../tables/append';
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
    // Multi-choice
    const paymentType = resItems[3].getResponse() as string;

    addIncome(amountRes, desc, paymentType);
}

export function addIncome(
    amountRes: string,
    desc: string,
    paymentType: string
) {
    const today = new DateData(new Date());

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

    const amount = parseFloat(amountRes) * 100;
    appendIncome([today], [new IntData(amount)], [new StringData(desc)], [payTypeId], [new IntData(-1)]);
}
