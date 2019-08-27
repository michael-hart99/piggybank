import { emailPollNotification } from '../email';
import { ID as VIEWS_ID } from '../ids/viewsId';
import { appendAttendance, appendExpense, appendIncome, appendMember, appendPaymentType, appendRecipient, appendStatement } from '../tables/append';
import { getAttendances, getExpenses, getIncomes, getMemberIds, getMembers, getPaymentTypeIds, getRecipientIds } from '../tables/get';
import { removeMember, removePaymentType, removeRecipient } from '../tables/remove';
import { updateAttendance, updateExpense, updateIncome, updateMember, updatePaymentType, updateRecipient } from '../tables/update';
import { BooleanData, DateData, ErrorType, IntData, IntListData, Quarter, QuarterData, RefreshLogger, repeat, StringData } from '../types';

/**
 * Handles the request to add a member from the Google Sheets menu.
 * 
 * @param name The name for this member
 * @param dateJoined The dateJoined for this member 
 * 
 * @toasts Failed if name already exists
 */
export function menuAddMember(name: string, dateJoined: string) {
    const nameData = new StringData(name.toLowerCase());
    const date = DateData.create(dateJoined);
    try {
        getMemberIds([nameData]);
        SpreadsheetApp.openById(VIEWS_ID).toast('Name is already in use', 'Adding Failed', 5);
    } catch (e) {
        if (e === ErrorType.NoMatchFoundError) {
            appendMember(
                [nameData],
                [date],
                [new IntData(0)],
                [new StringData('')],
                [BooleanData.FALSE],
                [BooleanData.FALSE],
                [BooleanData.FALSE],
                [BooleanData.FALSE],
                [BooleanData.FALSE],
                [BooleanData.FALSE]
            );
            SpreadsheetApp.openById(VIEWS_ID).toast(`Added Member`, 'Success', 5);

            RefreshLogger.refresh();
        } else {
            SpreadsheetApp.openById(VIEWS_ID).toast('Check error log for details', 'Adding Failed', 5);
            throw e;
        }
    }
}
/**
 * Handles the request to add an attendance from the Google Sheets menu.
 * 
 * @param date The date of this attendance
 * @param members The members of this attendance
 * @param quarter The quarter of this qttendance
 * @param year The year of this attendance
 */
export function menuAddAttendance(date: string, members: string, quarter: string, year: string) {
    try {
        const dateAsData = DateData.create(date);
        const memberIds = new IntListData(members
            .split(',')
            .map(s => new IntData(parseInt(s)))
            .sort((a, b) => a.getValue() - b.getValue())
        );
        let quarterVal: Quarter;
        switch (quarter) {
            case 'Winter':
                quarterVal = Quarter.WINTER;
                break;
            case 'Spring':
                quarterVal = Quarter.SPRING;
                break;
            case 'Summer':
                quarterVal = Quarter.SUMMER;
                break;
            case 'Fall':
                quarterVal = Quarter.FALL;
                break;
            default:
                throw ErrorType.IllegalArgumentError;
        }
        const quarterId = new QuarterData(quarterVal, IntData.create(year));

        appendAttendance([dateAsData], [memberIds], [quarterId]);
    } catch (e) {
        SpreadsheetApp.openById(VIEWS_ID).toast(`Check logs for details`, 'Failed', 5);
        throw e;
    }

    SpreadsheetApp.openById(VIEWS_ID).toast(`Added new attendance record`, 'Success', 5);

    RefreshLogger.refresh();
}
/**
 * Handles the request to add an income from the Google Sheets menu.
 * 
 * @param date The date of the income
 * @param amount The amount of the income
 * @param description The description of the income
 * @param payType The pay type of the income
 */
export function menuAddIncome(date: string, amount: string, description: string, payType: string) {
    try {
        const payId = getPaymentTypeIds([new StringData(payType.toLowerCase())])[0];

        const amountVal = parseFloat(amount);
        if (isNaN(amountVal)) throw ErrorType.IllegalArgumentError;

        appendIncome(
            [DateData.create(date)],
            [new IntData(Math.round(amountVal * 100))],
            [StringData.create(description)],
            [payId],
            [new IntData(-1)]
        );
    } catch (e) {
        SpreadsheetApp.openById(VIEWS_ID).toast(`Check logs for details`, 'Failed', 5);
        throw e;
    }

    SpreadsheetApp.openById(VIEWS_ID).toast(`Added new income`, 'Success', 5);

    RefreshLogger.refresh();
}
/**
 * Handles the request to add an expense from the Google Sheets menu.
 * 
 * @param date The date of the expense
 * @param amount The account of the expense
 * @param description The description of the expense
 * @param recipient The recipient of the expense
 * @param payType The pay type of the expense
 */
export function menuAddExpense(date: string, amount: string, description: string, recipient: string, payType: string) {
    try {
        const payId = getPaymentTypeIds([new StringData(payType.toLowerCase())])[0];

        const amountVal = parseFloat(amount);
        if (isNaN(amountVal)) throw ErrorType.IllegalArgumentError;

        const recipientData = new StringData(recipient.toLowerCase())
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

        appendExpense(
            [DateData.create(date)],
            [new IntData(Math.round(amountVal * 100))],
            [StringData.create(description)],
            [payId],
            [recipientId],
            [new IntData(-1)]
        );
    } catch (e) {
        SpreadsheetApp.openById(VIEWS_ID).toast(`Check logs for details`, 'Failed', 5);
        throw e;
    }

    SpreadsheetApp.openById(VIEWS_ID).toast(`Added new expense`, 'Success', 5);

    RefreshLogger.refresh();
}
/**
 * Handles the request to add a statement from the Google Sheets menu.
 * 
 * @param date The date of the statement
 * @param incomes The incomes of the statement
 * @param expenses The expenses of the statement
 * 
 * @toasts No change if no incomes/expenses specified
 */
export function menuAddStatement(date: string, incomes: string, expenses: string) {
    try {
        if (incomes.length === 0 && expenses.length === 0) {
            SpreadsheetApp.openById(VIEWS_ID).toast(`No incomes or expenses were specified`, 'No Change', 5);
            return;
        }
        const statementId = appendStatement([DateData.create(date)], [BooleanData.FALSE])[0];

        if (incomes.length > 0) {
            const incomeIds = incomes.split('\n').map(IntData.create);
            updateIncome(incomeIds, undefined, undefined, undefined, undefined, repeat(statementId, incomeIds.length))
        }
        if (expenses.length > 0) {
            const expenseIds = expenses.split('\n').map(IntData.create);
            updateExpense(expenseIds, undefined, undefined, undefined, undefined, undefined, repeat(statementId, expenseIds.length))
        }
    } catch (e) {
        SpreadsheetApp.openById(VIEWS_ID).toast(`Check logs for details`, 'Failed', 5);
        throw e;
    }

    SpreadsheetApp.openById(VIEWS_ID).toast(`Added new statement`, 'Success', 5);

    RefreshLogger.refresh();
}
/**
 * Handles the request to add a pay type from the Google Sheets menu.
 * 
 * @param name The name of the pay type
 * 
 * @toasts Failed if name already exists, Success otherwise
 */
export function menuAddPayType(name: string) {
    try {
        const nameData = StringData.create(name.toLowerCase());
        try {
            getPaymentTypeIds([nameData]);
            SpreadsheetApp.openById(VIEWS_ID).toast(`Payment type already exists`, 'Failed', 5);
            return;
        } catch (e) {
            if (e === ErrorType.NoMatchFoundError) {
                appendPaymentType([nameData]);
            } else {
                throw e;
            }
        }
    } catch (e) {
        SpreadsheetApp.openById(VIEWS_ID).toast(`Check logs for details`, 'Failed', 5);
        throw e;
    }

    SpreadsheetApp.openById(VIEWS_ID).toast(`Added new payment type`, 'Success', 5);

    RefreshLogger.refresh();
}
/**
 * Handles the request to add a recipient from the Google Sheets menu.
 * 
 * @param name The name of the recipient
 * 
 * @toasts Failed if name already exists, Success otherwise
 */
export function menuAddRecipient(name: string) {
    try {
        const nameData = StringData.create(name.toLowerCase());
        try {
            getRecipientIds([nameData]);
            SpreadsheetApp.openById(VIEWS_ID).toast(`Recipient already exists`, 'Failed', 5);
            return;
        } catch (e) {
            if (e === ErrorType.NoMatchFoundError) {
                appendRecipient([nameData]);
            } else {
                throw e;
            }
        }
    } catch (e) {
        SpreadsheetApp.openById(VIEWS_ID).toast(`Check logs for details`, 'Failed', 5);
        throw e;
    }

    SpreadsheetApp.openById(VIEWS_ID).toast(`Added new recipient`, 'Success', 5);

    RefreshLogger.refresh();
}

/**
 * Uses a nameToId function to get the id from the name of a
 * member/pay type/recipient, then changes that entry's name to the new name
 * using the update function.
 * 
 * @param oldName The current name
 * @param newName The new name
 * @param idFromNameFn A function that will return the id associated with this
 *                     name
 * @param updateFn A function that will update the database with a new name
 *                 when given an id and the new name
 */
function rename(oldName: string, newName: string, nameToIdFn: (name: StringData[]) => IntData[], updateFn: (ids: IntData[], names: StringData[]) => void) {
    const oldNameData = new StringData(oldName.toLowerCase());
    const newNameData = new StringData(newName.toLowerCase());

    let noMatch = false;
    try {
        nameToIdFn([newNameData])
    } catch (e) {
        if (e === ErrorType.NoMatchFoundError) {
            noMatch = true;
        } else {
            throw e;
        }
    }
    if (!noMatch) {
        SpreadsheetApp.openById(VIEWS_ID).toast('New name is already in use, try merging instead', 'Renaming Failed', 5);
    } else {
        const id = nameToIdFn([oldNameData])[0];
        updateFn([id], [newNameData]);
        SpreadsheetApp.openById(VIEWS_ID).toast(`Renamed ${oldName} to ${newName}`, 'Success', 5);
    }

    RefreshLogger.refresh();
}
/**
 * Handles the request to rename a member from the Google Sheets menu.
 * 
 * @param oldName The current name
 * @param newName The new name
 */
export function renameMember(oldName: string, newName: string) {
    rename(oldName, newName, getMemberIds, updateMember);
}
/**
 * Handles the request to rename a payment type from the Google Sheets menu.
 * 
 * @param oldName The current name
 * @param newName The new name
 */
export function renamePaymentType(oldName: string, newName: string) {
    rename(oldName, newName, getPaymentTypeIds, updatePaymentType);
}
/**
 * Handles the request to rename a recipient from the Google Sheets menu.
 * 
 * @param oldName The current name
 * @param newName The new name
 */
export function renameRecipient(oldName: string, newName: string) {
    rename(oldName, newName, getRecipientIds, updateRecipient);
}

/**
 * Handles the request to merge members from the Google Sheets menu.
 * 
 * @param aliases The members to be overwritten by an existing name
 * @param name The member that will replace the aliases
 * 
 * @toasts No action taken if no aliases specified
 */
export function mergeMember(aliases: string, name: string) {
    const aliasList = aliases.toLowerCase().split('\n');
    const i = aliasList.indexOf(name.toLowerCase());
    if (i !== -1) {
        // Remove the new name if in aliases
        aliasList.splice(i, 1);
    }

    if (aliasList.length === 0 ||
        (aliasList.length === 1 && aliasList[0].length === 0)
    ) {
        SpreadsheetApp.openById(VIEWS_ID).toast(`Either you selected no aliases or selected the same alias and name`, 'No Action Taken', 5);
        return;
    }

    const aliasIds = getMemberIds(aliasList.map(s => new StringData(s))).map(n => n.getValue());

    const newId = getMemberIds([new StringData(name.toLowerCase())])[0];

    const updateData: { ids: IntData[], memIds: IntListData[] } = {
        ids: [],
        memIds: []
    };
    getAttendances().forEach(attendance => {
        if (!attendance.id || !attendance.member_ids) throw ErrorType.AssertionError;
        const curIds = attendance.member_ids.getValue().map(n => n.getValue());
        const prunedIds = curIds.filter(id => aliasIds.indexOf(id) === -1);
        if (prunedIds.length < curIds.length) {
            if (prunedIds.indexOf(newId.getValue()) === -1) {
                prunedIds.push(newId.getValue());
                prunedIds.sort();
            }
            updateData.ids.push(attendance.id);
            updateData.memIds.push(new IntListData(prunedIds.map(id => new IntData(id))));
        }
    });

    if (updateData.ids.length > 0) {
        updateAttendance(updateData.ids, undefined, updateData.memIds);
    }
    removeMember(aliasIds.map(n => new IntData(n)));

    SpreadsheetApp.openById(VIEWS_ID).toast(`Merged into ${name}`, 'Success', 5);

    RefreshLogger.refresh();
}
/**
 * Handles the request to merge payment types from the Google Sheets menu.
 * 
 * @param aliases The payment types to be overwritten by an existing name
 * @param name The payment type that will replace the aliases
 * 
 * @toasts No action taken if no aliases specified
 */
export function mergePaymentType(aliases: string, name: string) {
    const aliasList = aliases.toLowerCase().split('\n');
    const i = aliasList.indexOf(name.toLowerCase());
    if (i !== -1) {
        // Remove the new name if in aliases
        aliasList.splice(i, 1);
    }

    if (aliasList.length === 0 ||
        (aliasList.length === 1 && aliasList[0].length === 0)
    ) {
        SpreadsheetApp.openById(VIEWS_ID).toast(`Either you selected no aliases or selected the same alias and name`, 'No Action Taken', 5);
        return;
    }

    const aliasIds = getPaymentTypeIds(aliasList.map(s => new StringData(s))).map(n => n.getValue());

    const newId = getPaymentTypeIds([new StringData(name.toLowerCase())])[0];

    const incomeIds: IntData[] = [];
    getIncomes().forEach(income => {
        if (!income.id || !income.paymentTypeId) throw ErrorType.AssertionError;
        if (aliasIds.indexOf(income.paymentTypeId.getValue()) !== -1) {
            incomeIds.push(income.id);
        }
    });
    const expenseIds: IntData[] = [];
    getExpenses().forEach(expense => {
        if (!expense.id || !expense.paymentTypeId) throw ErrorType.AssertionError;
        if (aliasIds.indexOf(expense.paymentTypeId.getValue()) !== -1) {
            expenseIds.push(expense.id);
        }
    });

    if (incomeIds.length > 0) {
        updateIncome(incomeIds, undefined, undefined, undefined, repeat(newId, incomeIds.length));
    }
    if (expenseIds.length > 0) {
        updateExpense(expenseIds, undefined, undefined, undefined, repeat(newId, expenseIds.length));
    }
    removePaymentType(aliasIds.map(n => new IntData(n)));

    SpreadsheetApp.openById(VIEWS_ID).toast(`Merged into ${name}`, 'Success', 5);

    RefreshLogger.refresh();
}
/**
 * Handles the request to merge recipients from the Google Sheets menu.
 * 
 * @param aliases The recipients to be overwritten by an existing name
 * @param name The recipient that will replace the aliases
 * 
 * @toasts No action taken if no aliases specified
 */
export function mergeRecipient(aliases: string, name: string) {
    const aliasList = aliases.toLowerCase().split('\n');
    const i = aliasList.indexOf(name.toLowerCase());
    if (i !== -1) {
        // Remove the new name if in aliases
        aliasList.splice(i, 1);
    }

    if (aliasList.length === 0 ||
        (aliasList.length === 1 && aliasList[0].length === 0)
    ) {
        SpreadsheetApp.openById(VIEWS_ID).toast(`Either you selected no aliases or selected the same alias and name`, 'No Action Taken', 5);
        return;
    }

    const aliasIds = getRecipientIds(aliasList.map(s => new StringData(s))).map(n => n.getValue());

    const newId = getRecipientIds([new StringData(name.toLowerCase())])[0];

    const expenseIds: IntData[] = [];
    getExpenses().forEach(expense => {
        if (!expense.id || !expense.recipientId) throw ErrorType.AssertionError;
        if (aliasIds.indexOf(expense.recipientId.getValue()) !== -1) {
            expenseIds.push(expense.id);
        }
    });

    if (expenseIds.length > 0) {
        updateExpense(expenseIds, undefined, undefined, undefined, undefined, repeat(newId, expenseIds.length));
    }
    removeRecipient(aliasIds.map(n => new IntData(n)));

    SpreadsheetApp.openById(VIEWS_ID).toast(`Merged into ${name}`, 'Success', 5);

    RefreshLogger.refresh();
}

/**
 * Sends a notification to all performing members who are noted as wanting to
 * be notified.
 * 
 * @param title The name of the poll 
 * @param deadline The deadline of the poll
 * @param link The link to the poll
 */
export function pollNotification(title: string, deadline: string, link: string) {
    emailPollNotification(title, new Date(deadline), link);
    SpreadsheetApp.openById(VIEWS_ID).toast('Emails sent', 'Success', 5);
}
/**
 * Sends a custom email to specified members.
 * 
 * @param memberNames The members to be emailed
 * @param subject The subject of the message
 * @param body The body of the message
 */
export function notifyMembers(memberNames: string, subject: string, body: string) {
    const memberList = memberNames.toLowerCase().split('\n');

    const members = getMembers();

    const emails: string[] = [];
    let startIndex = 0;
    for (const name of memberList) {
        let i = startIndex;
        do {
            const curName = members[i].name;
            const curEmail = members[i].email;
            if (!curName || !curEmail) {
                throw ErrorType.AssertionError;
            } else if (curName.getValue() === name) {
                emails.push(curEmail.getValue());
                startIndex = i;
                break;
            }
            i = (i + 1) % members.length
        } while (i !== startIndex);
    }

    emails.map(email => GmailApp.sendEmail(email, subject, body));
    SpreadsheetApp.openById(VIEWS_ID).toast('Emails sent', 'Success', 5);
}
