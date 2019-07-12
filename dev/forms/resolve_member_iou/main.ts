import { getAmountOwed, getMemberIds, getPaymentTypeIds } from '../../get';
import { appendIncome, appendPaymentType } from '../../tables/append';
import { updateMember } from '../../tables/update';
import { DateData, ErrorType, IntData, repeat, StringData } from '../../types';
import { getMostRecentResponse } from '../formOps';

/**
 * Executes upon submission of this form.
 */
export function onFormSubmit() {
    handleResponse(getMostRecentResponse(FormApp.getActiveForm()));
}

function handleResponse(resItems: GoogleAppsScript.Forms.ItemResponse[]) {
    const membersRes = resItems[0].getResponse() as string[];
    const amount = resItems[1].getResponse() as string;
    const description = resItems[2].getResponse() as string;
    const paymentType = resItems[3].getResponse() as string;

    resolveMemberIOU(membersRes, amount, description, paymentType);
}

export function resolveMemberIOU(membersRes: string[], amount: string, description: string, paymentType: string) {
    const memberNames = membersRes.map(member => new StringData(member));
    const memberIds = getMemberIds(memberNames);

    const amountCents = Math.round(parseFloat(amount) * 100);
    const curOwed = getAmountOwed(memberNames);

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

    updateMember(memberIds, undefined, undefined, curOwed.map(cur => new IntData(cur.getValue() - amountCents)));

    const today = new DateData(new Date());
    appendIncome(
        repeat(today, memberNames.length),
        repeat(new IntData(amountCents), memberNames.length),
        memberNames.map(name => new StringData(name.toString() + ' ' + description + ' (debt)')),
        repeat(payTypeId, memberNames.length),
        repeat(new IntData(-1), memberNames.length)
    );
}
