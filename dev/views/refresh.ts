import { getClubInfo, getPaymentTypes } from "../get";

export function refreshAccountInfo() {
    const curQuarter = getClubInfo().currentQuarterId;

    const incomes = getAllIncomes();
    const expenses = getAllExpenses();
    const paymentTypes = getPaymentTypes();

    let bank = 0;
    let venmo = 0;
    let onHand = 0;

    for (const income of incomes) {
        
    }
}