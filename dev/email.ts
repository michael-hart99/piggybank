import { GROUP_NAME } from './projectInfo';
import { getMembers } from './tables/get';
import { ErrorType, StringData } from './types';

/**
 * Send an identical email message to several recipients.
 * 
 * @param emails A list of email addresses
 * @param subject The subject of the message being sent
 * @param body The body of the message being sent
 */
function sendEmails(emails: string[], subject: string, body: string) {
    emails.forEach(email => GmailApp.sendEmail(email, subject, body));
}

/**
 * Sends emails to club members confirming the receipt of payment.
 * 
 * @param memberNames A list of club members' names
 * @param amount The amount received by the club
 * @param description Details on what the amount was for
 */
export function emailReceipts(memberNames: StringData[], amount: string, description: string) {
    memberNames = memberNames.map(name => new StringData(name.toString().toLowerCase()));
    const members = getMembers();

    const emails: string[] = [];
    let startIndex = 0;
    for (const name of memberNames) {
        let i = startIndex;
        do {
            const curName = members[i].name;
            const curEmail = members[i].email;
            const curSendReceipt = members[i].sendReceipt;
            if (!curName || !curEmail || !curSendReceipt) {
                throw ErrorType.AssertionError;
            } else if (curName.toString() === name.toString()) {
                if (curSendReceipt.getValue() && curEmail.getValue().length !== 0) {
                    emails.push(curEmail.getValue());
                }
                startIndex = i;
                break;
            }
            i = (i + 1) % members.length
        } while (i !== startIndex);
    }

    sendEmails(emails, `Receipt from ${GROUP_NAME}`, `This is confirming your payment of $${amount} to ${GROUP_NAME} for '${description}'.`);
}
/**
 * Sends emails to club members confirming their debt to the club
 * 
 * @param memberNames A list of club members' names
 * @param amount The amount owed to the club
 * @param description Details on what the amount is for
 */
export function emailIOUNotification(memberNames: StringData[], amount: string, description: string) {
    const inputNames = memberNames.map(name => name.toString().toLowerCase());
    const members = getMembers();

    const emails: string[] = [];
    let startIndex = 0;
    for (const name of inputNames) {
        let i = startIndex;
        do {
            const curName = members[i].name;
            const curEmail = members[i].email;
            if (!curName || !curEmail) {
                throw ErrorType.AssertionError;
            } else if (curName.toString() === name) {
                if (curEmail.getValue().length !== 0) {
                    emails.push(curEmail.getValue());
                }
                startIndex = i;
                break;
            }
            i = (i + 1) % members.length
        } while (i !== startIndex);
    }

    sendEmails(emails, `IOU for ${GROUP_NAME}`, `This is confirming that you owe $${amount} to ${GROUP_NAME} for '${description}'.`);
}
/**
 * Sends emails to members notifying them of a performance poll
 * 
 * @param pollName The name of the poll
 * @param deadline The deadline for the poll to be filled out by
 * @param link The link to the poll
 * @param sheetId The id of the spreadsheet to get data from
 */
export function emailPollNotification(pollName: string, deadline: Date, link: string, sheetId?: string) {
    const members = getMembers(sheetId);

    const emails: string[] = [];
    for (const member of members) {
        if (!member.email || !member.active || !member.performing || !member.notifyPoll) throw ErrorType.AssertionError;
        if (member.active.getValue() && member.notifyPoll.getValue() && member.email.getValue() !== '') {
            emails.push(member.email.getValue());
        }
    }

    let weekday: string;
    switch (deadline.getDay()) {
        case 0:
            weekday = 'Sunday';
            break;
        case 1:
            weekday = 'Monday';
            break;
        case 2:
            weekday = 'Tuesday';
            break;
        case 3:
            weekday = 'Wednesday';
            break;
        case 4:
            weekday = 'Thursday';
            break;
        case 5:
            weekday = 'Friday';
            break;
        case 6:
            weekday = 'Saturday';
            break;
        default:
            throw ErrorType.AssertionError;
    }
    let month: string;
    switch (deadline.getMonth()) {
        case 0:
            month = 'January';
            break;
        case 1:
            month = 'February';
            break;
        case 2:
            month = 'March';
            break;
        case 3:
            month = 'April';
            break;
        case 4:
            month = 'May';
            break;
        case 5:
            month = 'June';
            break;
        case 6:
            month = 'July';
            break;
        case 7:
            month = 'August';
            break;
        case 8:
            month = 'September';
            break;
        case 9:
            month = 'October';
            break;
        case 10:
            month = 'November';
            break;
        case 11:
            month = 'December';
            break;
        default:
            throw ErrorType.AssertionError;
    }
    const date = deadline.getDate();

    const hours = (((deadline.getHours() - 1) + 12) % 12 + 1).toString();
    const mins = deadline.getMinutes() < 10 ? `0${deadline.getMinutes()}` : deadline.getMinutes().toString();
    const ampm = deadline.getHours() < 12 ? 'AM' : 'PM';

    sendEmails(emails, `${GROUP_NAME} Performance Poll`, `Please respond to the ${pollName} poll before ${weekday}, ${month} ${date} at ${hours}:${mins} ${ampm}.\nLink: ${link}`);
}

/**
 * Send emails to club members with a given message.
 * 
 * @param memberList A list of club members' names
 * @param subject The subject line of the email
 * @param body The body text of the email
 * @param sheetId The id of the spreadsheet to get data from
 */
export function emailMembers(memberList: StringData[], subject: string, body: string, sheetId?: string) {
    const inputNames = memberList.map(name => name.toString().toLowerCase());
    const members = getMembers(sheetId);

    const emails: string[] = [];
    let startIndex = 0;
    for (const name of inputNames) {
        let i = startIndex;
        do {
            const curName = members[i].name;
            const curEmail = members[i].email;
            if (!curName || !curEmail) {
                throw ErrorType.AssertionError;
            } else if (curName.getValue() === name && curEmail.getValue() !== '') {
                emails.push(curEmail.getValue());
                startIndex = i;
                break;
            }
            i = (i + 1) % members.length
        } while (i !== startIndex);
    }

    emails.map(email => GmailApp.sendEmail(email, subject, body));
}
