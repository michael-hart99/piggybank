import { getClubInfo, getFromTables, getMemberIds } from '../../get';
import { appendAttendance, appendMember } from '../../tables/append';
import { BooleanData, DateData, IntData, IntListData, repeat, StringData } from '../../types';
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
    if (resItems.length === 1) {
        takeAttendance(memListRes);
    } else {
        // Short text: '\n' seperated new members
        const newMemberRes = resItems[1].getResponse() as string;

        takeAttendance(memListRes, newMemberRes);
    }
}

export function takeAttendance(memListRes: string[], newMemberRes?: string) {
    const curQuarter = getClubInfo().currentQuarterId;
    const today = new DateData(new Date());
    const curNames = getFromTables('Member', ['name']).map(row => row[0].toString());

    const prevMembersData = memListRes.map(name => new StringData(name));

    let newMembersData: StringData[] = [];
    let newIds: IntData[];
    if (!newMemberRes) {
        newIds = [];
    } else {
        const newMembers = newMemberRes.split('\n');

        for (const member of newMembers) {
            if (curNames.indexOf(member) === -1) {
                newMembersData.push(new StringData(member));
            } else {
                prevMembersData.push(new StringData(member));
            }
        }

        if (newMembersData.length > 0) {
            newIds = appendMember(
                newMembersData,
                repeat(today, newMembersData.length),
                repeat(new IntData(0), newMembersData.length),
                repeat(new StringData(''), newMembersData.length),
                repeat(new BooleanData(false), newMembersData.length),
                repeat(new BooleanData(false), newMembersData.length),
                repeat(new BooleanData(false), newMembersData.length),
                repeat(new BooleanData(false), newMembersData.length),
                repeat(new BooleanData(false), newMembersData.length),
                repeat(new BooleanData(false), newMembersData.length)
            );
        } else {
            newIds = [];
        }
    }

    if (prevMembersData.length === 0) {
        appendAttendance([today], [new IntListData(newIds)], [curQuarter]);
    } else {
        const prevIds = getMemberIds(prevMembersData);
        prevIds.sort((valA, valB) => valA.getValue() - valB.getValue());
        appendAttendance([today], [new IntListData(prevIds.concat(newIds))], [curQuarter]);
    }
}
