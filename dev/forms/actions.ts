import { emailIOUNotification, emailReceipts } from '../email';
import { appendAttendance, appendExpense, appendIncome, appendMember, appendPaymentType, appendRecipient, appendStatement } from '../tables/append';
import { getClubInfo, getMemberIds, getMembers, getPaymentTypeIds, getRecipientIds } from "../tables/get";
import { updateClubInfo, updateExpense, updateIncome, updateMember, updateStatement } from '../tables/update';
import { BooleanData, capitalizeString, CARRIERS, DateData, ErrorType, IntData, IntListData, repeat, StringData } from "../types";

/**
 * Returns the amount owed by the given members.
 * 
 * @param memberNames The members to read the amounts owed of
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws NoMatchFoundError if a name in memberNames is not in the Member
 *                              sheet
 */
function getAmountOwed(memberNames: StringData[], sheetId?: string) {
    const members = getMembers(sheetId);

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

    if (owed.length !== memberNames.length) {
        throw ErrorType.NoMatchFoundError;
    }

    return owed;
}
/**
 * Returns the dues owed by the given members.
 * 
 * @param memberNames The members to read the dues values of
 * @param sheetId The id of the spreadsheet to operate on
 * 
 * @throws NoMatchFoundError if a name in memberNames is not in the Member
 *                              sheet
 */
function getDuesValues(memberNames: StringData[], sheetId?: string) {
    const clubInfo = getClubInfo(sheetId);
    const members = getMembers(sheetId);

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
/**
 * Returns true if passed "Yes" and false if passed "No".
 * 
 * @param yesno A string that is either "Yes" or "No"
 * 
 * @throws IllegalArgumentError if yesno is not "Yes" or "No"
 */
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

/**
 * Adds a new expense entry described by a response to the Add Expense form.
 * 
 * @param amountRes The amount given in the form response
 * @param description The description given in the form response
 * @param recipient The recipient given in the form response
 * @param paymentType The payment type given in the form response
 * @param sheetId The id of the spreadsheet to operate on
 */
export function addExpense(
    amountRes: string,
    description: string,
    recipient: string,
    paymentType: string,
    sheetId?: string
) {
    const today = new DateData(new Date());
    const recipientData = new StringData(recipient.trim().toLowerCase());
    const payTypeData = new StringData(paymentType.trim().toLowerCase());

    let payTypeId: IntData;
    try {
        payTypeId = getPaymentTypeIds([payTypeData], sheetId)[0];
    } catch (e) {
        if (e === ErrorType.NoMatchFoundError) {
            payTypeId = appendPaymentType([payTypeData], sheetId)[0];
        } else {
            throw e;
        }
    }

    let recipientId: IntData;
    try {
        recipientId = getRecipientIds([recipientData], sheetId)[0];
    } catch (e) {
        if (e === ErrorType.NoMatchFoundError) {
            recipientId = appendRecipient([recipientData], sheetId)[0];
        } else {
            throw e;
        }
    }

    const amount = parseFloat(amountRes);
    if (isNaN(amount)) {
        throw "parseFloat error: Unable to parse amount given";
    }
    appendExpense([today], [new IntData(Math.round(amount * 100))], [new StringData(description)], [payTypeId], [recipientId], [new IntData(-1)], sheetId);
}
/**
 * Adds a new income entry described by a response to the Add Income form.
 * 
 * @param amountRes The amount given in the form response
 * @param description The description given in the form response
 * @param paymentType The payment type given in the form response
 * @param sheetId The id of the spreadsheet to operate on
 */
export function addIncome(
    amountRes: string,
    description: string,
    paymentType: string,
    sheetId?: string
) {
    const today = new DateData(new Date());

    const payTypeData = new StringData(paymentType.trim().toLowerCase());
    let payTypeId: IntData;
    try {
        payTypeId = getPaymentTypeIds([payTypeData], sheetId)[0];
    } catch (e) {
        if (e === ErrorType.NoMatchFoundError) {
            payTypeId = appendPaymentType([payTypeData], sheetId)[0];
        } else {
            throw e;
        }
    }

    const amount = parseFloat(amountRes);
    if (isNaN(amount)) {
        throw "parseFloat error: Unable to parse amount given";
    }
    appendIncome([today], [new IntData(Math.round(amount * 100))], [new StringData(description)], [payTypeId], [new IntData(-1)], sheetId);
}
/**
 * Adds member debt described by a response to the Add Member IOU form.
 * 
 * @param membersRes The members given in the form response
 * @param amountRes The amount given in the form response
 * @param description The description given in the form response
 * @param sheetId The id of the spreadsheet to operate on
 */
export function addMemberIOU(membersRes: string[], amountRes: string, description: string, sheetId?: string) {
    const memberNames = membersRes.map(member => new StringData(member.substr(0, member.indexOf(':')).toLowerCase()));
    if (!sheetId) {
        emailIOUNotification(memberNames.map(member => new StringData(capitalizeString(member.getValue()))), amountRes, description);
    }

    const memberIds = getMemberIds(memberNames, sheetId);

    const amount = parseFloat(amountRes);
    if (isNaN(amount)) {
        throw "parseFloat error: Unable to parse amount given";
    }
    const amountCents = Math.round(amount * 100);
    const curOwed = getAmountOwed(memberNames, sheetId);

    updateMember(
        memberIds,
        undefined,
        undefined,
        curOwed.map(cur => new IntData(cur.getValue() + amountCents)),
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        sheetId
    );
}
/**
 * Updates the database to reflect members as having paid dues, described by a
 * response to the Collect Dues form.
 * 
 * @param memListRes The members given in the form response
 * @param paymentTypeRes The payment types given in the form response
 * @param sheetId The id of the spreadsheet to operate on
 */
export function collectDues(memListRes: string[], paymentTypeRes: string, sheetId?: string) {
    memListRes = memListRes.map(res => res.substr(0, res.indexOf(':')));

    const curQuarter = getClubInfo(sheetId).currentQuarterId;

    const members = memListRes.map(name => new StringData(name.toLowerCase()));
    const descriptions = memListRes.map(
        name => new StringData(`${name}, dues for ${curQuarter.toDateString()}`)
    );

    const paymentType = new StringData(paymentTypeRes.trim().toLowerCase());

    const today = new DateData(new Date());

    // Update members as having paid dues
    const memberIds = getMemberIds(members, sheetId);
    updateMember(
        memberIds,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        repeat(BooleanData.TRUE, members.length),
        undefined,
        undefined,
        sheetId
    );

    // Append new income
    const duesAmounts = getDuesValues(members, sheetId);
    let payTypeId: IntData;
    try {
        payTypeId = getPaymentTypeIds([paymentType], sheetId)[0];
    } catch (e) {
        if (e === ErrorType.NoMatchFoundError) {
            payTypeId = appendPaymentType([paymentType], sheetId)[0];
        } else {
            throw e;
        }
    }

    if (!sheetId) {
        for (let i = 0; i < members.length; ++i) {
            emailReceipts(
                [new StringData(capitalizeString(members[i].getValue()))],
                (duesAmounts[i].getValue() / 100).toString(),
                descriptions[i].toString()
            );
        }
    }

    appendIncome(
        repeat(today, members.length),
        duesAmounts,
        descriptions,
        repeat(payTypeId, members.length),
        repeat(new IntData(-1), members.length),
        sheetId
    );
}
/**
 * Marks statements as confirmed, described by a form response to the Confirm
 * Transfer form.
 * 
 * @param statementList The statements given in the form response
 * @param sheetId The id of the spreadsheet to operate on
 */
export function confirmTransfer(statementList: string[], sheetId?: string) {
    const ids = statementList.map(s => {
        const start = s.lastIndexOf('[');
        const end = s.lastIndexOf(']');
        return IntData.create(s.substr(start + 1, end - start - 1));
    });

    updateStatement(ids, undefined, repeat(BooleanData.TRUE, ids.length), sheetId);
}
/**
 * Updates the database to reflect that a new quarter has begun, intended to be
 * run on the submit of the Next Quarter form.
 * 
 * @param sheetId The id of the spreadsheet to operate on
 */
export function nextQuarter(sheetId?: string) {
    const clubInfo = getClubInfo(sheetId);
    const ids = getMembers(sheetId).map(member => {
        if (!member.id) throw ErrorType.AssertionError;
        return member.id;
    });

    updateClubInfo(undefined, undefined, undefined, clubInfo.currentQuarterId.next(), sheetId);
    updateMember(ids, undefined, undefined, undefined, undefined, undefined, undefined, undefined, repeat(BooleanData.FALSE, ids.length), undefined, undefined, sheetId);
}
/**
 * Updates the database to reflect that members have resolved debt, described
 * by a response to the Resolve Member IOU form response.
 * 
 * @param membersRes The members given in the form response
 * @param amount The amount given in the form response
 * @param description The description given in the form response
 * @param paymentType The payment type given in the form response
 * @param sheetId The id of the spreadsheet to operate on
 */
export function resolveMemberIOU(membersRes: string[], amount: string, description: string, paymentType: string, sheetId?: string) {
    const memberNames = membersRes.map(member => new StringData(member.substr(0, member.indexOf(':')).toLowerCase()));

    if (!sheetId) {
        emailReceipts(memberNames.map(member => new StringData(capitalizeString(member.getValue()))), amount, description)
    }

    const memberIds = getMemberIds(memberNames, sheetId);

    const amountCents = Math.round(parseFloat(amount) * 100);
    const curOwed = getAmountOwed(memberNames, sheetId);

    const payTypeData = new StringData(paymentType.trim().toLowerCase());
    let payTypeId: IntData;
    try {
        payTypeId = getPaymentTypeIds([payTypeData], sheetId)[0];
    } catch (e) {
        if (e === ErrorType.NoMatchFoundError) {
            payTypeId = appendPaymentType([payTypeData], sheetId)[0];
        } else {
            throw e;
        }
    }

    updateMember(
        memberIds,
        undefined,
        undefined,
        curOwed.map(cur => new IntData(cur.getValue() - amountCents)),
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        sheetId
    );

    const today = new DateData(new Date());
    appendIncome(
        repeat(today, memberNames.length),
        repeat(new IntData(amountCents), memberNames.length),
        memberNames.map(name => new StringData(capitalizeString(name.toString()) + ' ' + description + ' (debt)')),
        repeat(payTypeId, memberNames.length),
        repeat(new IntData(-1), memberNames.length),
        sheetId
    );
}
/**
 * Updates the database to reflect attendance that was just taken, described
 * by a response to the Take Attendance form.
 * 
 * @param memListRes The current members given in the form response
 * @param newMemberRes The new members given in the form response
 * @param sheetId The id of the spreadsheet to operate on
 */
export function takeAttendance(memListRes?: string[], newMemberRes?: string, sheetId?: string) {
    if (!memListRes) {
        if (!newMemberRes) {
            return;
        }
        memListRes = [];
    }

    const curQuarter = getClubInfo(sheetId).currentQuarterId;
    const today = new DateData(new Date());
    const curNames = getMembers(sheetId).map(member => {
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

        const newMembers = newMemberRes.split('\n').map(s => s.trim()).filter(s => s.length > 0);

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
                repeat(BooleanData.TRUE, newMembersData.length),
                repeat(BooleanData.FALSE, newMembersData.length),
                repeat(BooleanData.FALSE, newMembersData.length),
                repeat(BooleanData.FALSE, newMembersData.length),
                repeat(BooleanData.FALSE, newMembersData.length),
                sheetId
            );
        } else {
            newIds = [];
        }
    }

    if (prevMembersData.length === 0) {
        appendAttendance([today], [new IntListData(newIds)], [curQuarter], sheetId);
    } else {
        const prevIds = getMemberIds(prevMembersData, sheetId);
        prevIds.sort((valA, valB) => valA.getValue() - valB.getValue());
        appendAttendance([today], [new IntListData(prevIds.concat(newIds))], [curQuarter], sheetId);
    }
}
/**
 * Updates the database to reflect a set of transactions as being migrated to
 * the bank account, described by a response to the Transfer Funds form.
 * 
 * @param incomes The incomes given in the form response
 * @param expenses The expenses given in the form response
 * @param sheetId The id of the spreadsheet to operate on
 */
export function transferFunds(incomes?: string[], expenses?: string[], sheetId?: string) {
    if (incomes || expenses) {
        const today = new DateData(new Date());
        const statementId = appendStatement(
            [today],
            [BooleanData.FALSE],
            sheetId
        )[0];
        if (incomes) {
            const incomeIds = incomes.map(s => {
                const start = s.lastIndexOf('[');
                const end = s.lastIndexOf(']');
                return IntData.create(s.substr(start + 1, end - start - 1));
            });
            updateIncome(incomeIds, undefined, undefined, undefined, undefined, repeat(statementId, incomeIds.length), sheetId);
        }
        if (expenses) {
            const expenseIds = expenses.map(s => {
                const start = s.lastIndexOf('[');
                const end = s.lastIndexOf(']');
                return IntData.create(s.substr(start + 1, end - start - 1));
            });
            updateExpense(expenseIds, undefined, undefined, undefined, undefined, undefined, repeat(statementId, expenseIds.length), sheetId);
        }
    }
}
/**
 * Updates member information with contact info and notification preferences,
 * described by a response to the Update Contact Settings form.
 * 
 * @param name The member name given in the form response
 * @param email The email given in the form response
 * @param phone The phone number given in the form response
 * @param carrier The carrier given in the form response
 * @param notifyPoll The notification preference given in the form response
 * @param sendReceipt The notification preference given in the form response
 * @param sheetId The id of the spreadsheet to operate on
 */
export function updateContactSettings(name: string, email?: string, phone?: string, carrier?: string, notifyPoll?: string, sendReceipt?: string, sheetId?: string) {
    const memberData = new StringData(name.toLowerCase());
    const memberId = getMemberIds([memberData], sheetId);

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
        sheetId
    );
}
/**
 * Updates member information with member status, described by a response to
 * the Update Member Status form.
 * 
 * @param memberNames The member name given in the form response
 * @param performingRes The performing status given in the form response
 * @param activeRes The active status given in the form response
 * @param officerRes The officer status given in the form response
 * @param sheetId The id of the spreadsheet to operate on
 */
export function updateMemberStatus(memberNames: string[], performingRes?: string, activeRes?: string, officerRes?: string, sheetId?: string) {
    const memberData = memberNames.map(name => new StringData(name.toLowerCase()));
    const memberId = getMemberIds(memberData, sheetId);

    updateMember(
        memberId,
        undefined,
        undefined,
        undefined,
        undefined,
        performingRes ? repeat(yesnoToBool(performingRes), memberId.length) : undefined,
        activeRes ? repeat(yesnoToBool(activeRes), memberId.length) : undefined,
        officerRes ? repeat(yesnoToBool(officerRes), memberId.length) : undefined,
        undefined,
        undefined,
        undefined,
        sheetId
    );
}
