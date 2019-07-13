import { getAllMembers, getClubInfo } from "../get";
import { IntData, StringData } from "../types";

export function getMostRecentResponse(form: GoogleAppsScript.Forms.Form) {
    const resList = form.getResponses();

    return resList[resList.length - 1].getItemResponses();
}

export function getAmountOwed(memberNames: StringData[]) {
    const members = getAllMembers();

    const owed: IntData[] = [];
    let startIndex = 0;
    for (const name of memberNames) {
        let i = startIndex;
        do {
            if (members[i].name.toString() === name.toString()) {
                owed.push(members[i].amountOwed);
                startIndex = i;
                break;
            }
            i = (i + 1) % members.length;
        } while (i !== startIndex);
    }

    return owed;
}
export function getDuesValues(memberNames: StringData[]) {
    const clubInfo = getClubInfo();
    const members = getAllMembers();

    const duesVals: IntData[] = [];
    let startIndex = 0;
    for (const name of memberNames) {
        let i = startIndex;
        do {
            if (members[i].name.toString() === name.toString()) {
                duesVals.push(members[i].officer.getValue() ? clubInfo.officerFee : clubInfo.memberFee);
                startIndex = i;
                break;
            }
            i = (i + 1) % members.length
        } while (i !== startIndex);
    }

    return duesVals;
}
