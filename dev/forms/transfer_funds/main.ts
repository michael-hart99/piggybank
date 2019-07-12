import { appendStatement } from '../../tables/append';
import { updateExpense, updateIncome } from '../../tables/update';
import { BooleanData, DateData, IntData, repeat } from '../../types';
import { getMostRecentResponse } from '../formOps';

/**
 * Executes upon submission of this form.
 */
export function onFormSubmit() {
    handleResponse(getMostRecentResponse(FormApp.getActiveForm()));
}

function handleResponse(resItems: GoogleAppsScript.Forms.ItemResponse[]) {
    let val: string | string[] | string[][];
    resItems.toString();

}

export function transferFunds(incomes?: string[], expenses?: string[]) {
    if (incomes || expenses) {
        const today = new DateData(new Date());
        const statementId = appendStatement(
            [today],
            [BooleanData.FALSE]
        )[0];
        if (incomes) {
            const incomeIds = incomes.map(s => {
                const start = s.lastIndexOf('[');
                const end = s.lastIndexOf(']');
                return IntData.create(s.substr(start + 1, end - start - 1));
            });
            updateIncome(incomeIds, undefined, undefined, undefined, undefined, repeat(statementId, incomeIds.length));
        }
        if (expenses) {
            const expenseIds = expenses.map(s => {
                const start = s.lastIndexOf('[');
                const end = s.lastIndexOf(']');
                return IntData.create(s.substr(start + 1, end - start - 1));
            });
            updateExpense(expenseIds, undefined, undefined, undefined, undefined, undefined, repeat(statementId, expenseIds.length));
        }
    }
}
