import { getAmountOwed, getMemberIds } from '../../get';
import { updateMember } from '../../tables/update';
import { IntData, StringData } from '../../types';
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

    addMemberIOU(membersRes, amount, description);
}

export function addMemberIOU(membersRes: string[], amount: string, description: string) {
    // DESCRIPTION SHOULD BE INCLUDED IN EMAIL RECEIPT //
    Logger.log(description);
    const memberNames = membersRes.map(member => new StringData(member));
    const memberIds = getMemberIds(memberNames);

    const amountCents = Math.round(parseFloat(amount) * 100);
    const curOwed = getAmountOwed(memberNames);

    updateMember(memberIds, undefined, undefined, curOwed.map(cur => new IntData(cur.getValue() + amountCents)));
}
