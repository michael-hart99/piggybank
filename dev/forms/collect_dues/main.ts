import { getClubInfo, getDuesValues, getMemberIds, getPaymentTypeIds } from '../../get';
import { appendIncome, appendPaymentType } from '../../tables/append';
import { updateMember } from '../../tables/update';
import { BooleanData, DateData, ErrorType, IntData, repeat, StringData } from '../../types';
import { getMostRecentResponse } from '../formOps';

/**
 * Executes upon submission of this form.
 */
export function onFormSubmit() {
    handleResponse(getMostRecentResponse(FormApp.getActiveForm()));
}

function handleResponse(resItems: GoogleAppsScript.Forms.ItemResponse[]) {
    // Checkbox: list of members
    const memListRes = resItems[0].getResponse() as string[];

    // Multi-choice: payment method
    const paymentTypeRes = resItems[1].getResponse() as string;

    collectDues(memListRes, paymentTypeRes);
}

export function collectDues(memListRes: string[], paymentTypeRes: string) {
    const curQuarter = getClubInfo().currentQuarterId;

    const members = memListRes.map(name => new StringData(name));
    const descriptions = memListRes.map(
        name => new StringData(`${name}, dues for ${curQuarter.toDateString()}`)
    );

    const paymentType = new StringData(paymentTypeRes);

    const today = new DateData(new Date());

    // Update members as having paid dues
    const memberIds = getMemberIds(members);
    updateMember(
        memberIds,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        repeat(BooleanData.TRUE, members.length)
    );

    // Append new income
    const duesAmounts = getDuesValues(members);
    let payTypeId: IntData;
    try {
        payTypeId = getPaymentTypeIds([paymentType])[0];
    } catch (e) {
        if (e === ErrorType.NoMatchFoundError) {
            payTypeId = appendPaymentType([paymentType])[0];
        } else {
            throw e;
        }
    }
    appendIncome(
        repeat(today, members.length),
        duesAmounts,
        descriptions,
        repeat(payTypeId, members.length),
        repeat(new IntData(-1), members.length)
    );
}
