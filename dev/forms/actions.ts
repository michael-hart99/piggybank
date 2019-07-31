import { emailIOUNotification, emailReceipts } from '../email';
import { appendAttendance, appendExpense, appendIncome, appendMember, appendPaymentType, appendRecipient, appendStatement } from '../tables/append';
import { getClubInfo, getMemberIds, getMembers, getPaymentTypeIds, getRecipientIds } from "../tables/get";
import { updateClubInfo, updateExpense, updateIncome, updateMember, updateStatement } from '../tables/update';
import { BooleanData, capitalizeString, CARRIERS, DateData, ErrorType, IntData, IntListData, repeat, StringData } from "../types";

function getAmountOwed(memberNames: StringData[]) {
    const members = getMembers();

    const owed: IntData[] = [];
    let startIndex = 0;
    for (const name of memberNames) {
        let i = startIndex;
        do {
            const curName = members[i].name;
            const curOwed = members[i].amountOwed;
            if (!curName || !curOwed) {
                throw ErrorType.AssertionError;
            } else if (curName.toString() === name.toString()) {
                owed.push(curOwed);
                startIndex = i;
                break;
            }
            i = (i + 1) % members.length;
        } while (i !== startIndex);
    }

    return owed;
}
function getDuesValues(memberNames: StringData[]) {
    const clubInfo = getClubInfo();
    const members = getMembers();

    const duesVals: IntData[] = [];
    let startIndex = 0;
    for (const name of memberNames) {
        let i = startIndex;
        do {
            const curName = members[i].name;
            const curOfficer = members[i].officer;
            if (!curName || !curOfficer) {
                throw ErrorType.AssertionError;
            } else if (curName.toString() === name.toString()) {
                duesVals.push(curOfficer.getValue() ? clubInfo.officerFee : clubInfo.memberFee);
                startIndex = i;
                break;
            }
            i = (i + 1) % members.length
        } while (i !== startIndex);
    }

    return duesVals;
}
function yesnoToBool(yesno: string) {
    switch (yesno) {
        case 'Yes':
            return BooleanData.TRUE;
        case 'No':
            return BooleanData.FALSE;
        default:
            throw ErrorType.IllegalArgumentError;
    }
}

export function addExpense(
    amountRes: string,
    desc: string,
    recipient: string,
    paymentType: string
) {
    const today = new DateData(new Date());
    const recipientData = new StringData(recipient.toLowerCase());
    const payTypeData = new StringData(paymentType.toLowerCase());

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
export function addIncome(
    amountRes: string,
    desc: string,
    paymentType: string
) {
    const today = new DateData(new Date());

    const payTypeData = new StringData(paymentType.toLowerCase());
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
export function addMemberIOU(membersRes: string[], amount: string, description: string) {
    const memberNames = membersRes.map(member => new StringData(member.substr(0, member.indexOf(':')).toLowerCase()));
    emailIOUNotification(memberNames.map(member => new StringData(capitalizeString(member.getValue()))), amount, description)

    const memberIds = getMemberIds(memberNames);

    const amountCents = Math.round(parseFloat(amount) * 100);
    const curOwed = getAmountOwed(memberNames);

    updateMember(memberIds, undefined, undefined, curOwed.map(cur => new IntData(cur.getValue() + amountCents)));
}
export function collectDues(memListRes: string[], paymentTypeRes: string) {
    memListRes = memListRes.map(res => res.substr(0, res.indexOf(':')));

    const curQuarter = getClubInfo().currentQuarterId;

    const members = memListRes.map(name => new StringData(name.toLowerCase()));
    const descriptions = memListRes.map(
        name => new StringData(`${name}, dues for ${curQuarter.toDateString()}`)
    );

    const paymentType = new StringData(paymentTypeRes.toLowerCase());

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

    for (let i = 0; i < members.length; ++i) {
        emailReceipts(
            [new StringData(capitalizeString(members[i].getValue()))],
            (duesAmounts[i].getValue() / 100).toString(),
            descriptions[i].toString()
        );
    }

    appendIncome(
        repeat(today, members.length),
        duesAmounts,
        descriptions,
        repeat(payTypeId, members.length),
        repeat(new IntData(-1), members.length)
    );
}
export function confirmTransfer(statementList: string[]) {
    const ids = statementList.map(s => {
        const start = s.lastIndexOf('[');
        const end = s.lastIndexOf(']');
        return IntData.create(s.substr(start + 1, end - start - 1));
    });

    updateStatement(ids, undefined, repeat(BooleanData.TRUE, ids.length));
}
export function nextQuarter() {
    const clubInfo = getClubInfo();
    const ids = getMembers().map(member => {
        if (!member.id) throw ErrorType.AssertionError;
        return member.id;
    });

    updateClubInfo(undefined, undefined, undefined, clubInfo.currentQuarterId.next());
    updateMember(ids, undefined, undefined, undefined, undefined, undefined, undefined, undefined, repeat(BooleanData.FALSE, ids.length));
}
export function resolveMemberIOU(membersRes: string[], amount: string, description: string, paymentType: string) {
    const memberNames = membersRes.map(member => new StringData(member.substr(0, member.indexOf(':')).toLowerCase()));

    emailReceipts(memberNames.map(member => new StringData(capitalizeString(member.getValue()))), amount, description)

    const memberIds = getMemberIds(memberNames);

    const amountCents = Math.round(parseFloat(amount) * 100);
    const curOwed = getAmountOwed(memberNames);

    const payTypeData = new StringData(paymentType.toLowerCase());
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
        memberNames.map(name => new StringData(capitalizeString(name.toString()) + ' ' + description + ' (debt)')),
        repeat(payTypeId, memberNames.length),
        repeat(new IntData(-1), memberNames.length)
    );
}
export function takeAttendance(memListRes: string[], newMemberRes?: string) {
    const curQuarter = getClubInfo().currentQuarterId;
    const today = new DateData(new Date());
    const curNames = getMembers().map(member => {
        if (!member.name) throw ErrorType.AssertionError;
        return member.name.getValue();
    });

    memListRes = memListRes.map(name => name.toLowerCase());
    const prevMembersData = memListRes.map(name => new StringData(name));

    let newMembersData: StringData[] = [];
    let newIds: IntData[];
    if (newMemberRes === undefined) {
        newIds = [];
    } else {
        newMemberRes = newMemberRes.toLowerCase();

        const newMembers = newMemberRes.split('\n');

        for (const member of newMembers) {
            if (curNames.indexOf(member) === -1) {
                newMembersData.push(new StringData(member));
            } else {
                memListRes.indexOf(member)
                prevMembersData.push(new StringData(member));
            }
        }

        if (newMembersData.length > 0) {
            newIds = appendMember(
                newMembersData,
                repeat(today, newMembersData.length),
                repeat(new IntData(0), newMembersData.length),
                repeat(new StringData(''), newMembersData.length),
                repeat(BooleanData.FALSE, newMembersData.length),
                repeat(BooleanData.FALSE, newMembersData.length),
                repeat(BooleanData.FALSE, newMembersData.length),
                repeat(BooleanData.FALSE, newMembersData.length),
                repeat(BooleanData.FALSE, newMembersData.length),
                repeat(BooleanData.FALSE, newMembersData.length),
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
export function updateContactSettings(name: string, email?: string, phone?: string, carrier?: string, notifyPoll?: string, sendReceipt?: string) {
    const memberData = new StringData(name.toLowerCase());
    const memberId = getMemberIds([memberData]);

    let emailData: StringData | undefined;
    if (email) {
        emailData = new StringData(email);
    } else if (phone && carrier) {
        // remove the two dashes
        phone = phone.replace('-', '').replace('-', '');
        const carrierSuffix = CARRIERS[carrier];
        if (carrierSuffix === undefined) throw ErrorType.AssertionError;
        emailData = new StringData(phone.concat(carrierSuffix));
    }

    updateMember(
        memberId,
        undefined,
        undefined,
        undefined,
        emailData ? [emailData] : undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        notifyPoll ? [yesnoToBool(notifyPoll)] : undefined,
        sendReceipt ? [yesnoToBool(sendReceipt)] : undefined,
    );
}
export function updateMemberStatus(memberNames: string[], performingRes?: string, activeRes?: string, officerRes?: string) {
    const memberData = memberNames.map(name => new StringData(name.toLowerCase()));
    const memberId = getMemberIds(memberData);

    updateMember(
        memberId,
        undefined,
        undefined,
        undefined,
        undefined,
        performingRes ? repeat(yesnoToBool(performingRes), memberId.length) : undefined,
        activeRes ? repeat(yesnoToBool(activeRes), memberId.length) : undefined,
        officerRes ? repeat(yesnoToBool(officerRes), memberId.length) : undefined
    );
}
