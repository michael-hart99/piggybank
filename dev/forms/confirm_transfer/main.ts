import { updateStatement } from '../../tables/update';
import { BooleanData, IntData, repeat } from '../../types';
import { getMostRecentResponse } from '../formOps';

/**
 * Executes upon submission of this form.
 */
export function onFormSubmit() {
    handleResponse(getMostRecentResponse(FormApp.getActiveForm()));
}

function handleResponse(resItems: GoogleAppsScript.Forms.ItemResponse[]) {
    const statementList = resItems[0].getResponse() as string[];

    confirmTransfer(statementList);
}

export function confirmTransfer(statementList: string[]) {
    const ids = statementList.map(s => {
        const start = s.lastIndexOf('[');
        const end = s.lastIndexOf(']');
        return IntData.create(s.substr(start + 1, end - start - 1));
    });

    updateStatement(ids, undefined, repeat(BooleanData.TRUE, ids.length));
}
