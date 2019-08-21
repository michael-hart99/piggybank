import { GROUP_NAME } from './projectInfo';
import { getMembers } from './tables/get';
import { ErrorType, StringData } from './types';

function sendEmails(emails: string[], subject: string, body: string) {
    emails.forEach(email => GmailApp.sendEmail(email, subject, body));
}

export function emailReceipts(memberNames: StringData[], amount: string, description: string) {
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
                if (curSendReceipt.getValue()) {
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
export function emailIOUNotification(memberNames: StringData[], amount: string, description: string) {
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
                if (curSendReceipt.getValue()) {
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
export function emailPollNotification(pollName: string, deadline: Date, link: string) {
    const members = getMembers();

    const emails: string[] = [];
    for (const member of members) {
        if (!member.email || !member.active || !member.performing || !member.notifyPoll) throw ErrorType.AssertionError;
        if (member.active.getValue() && member.notifyPoll.getValue()) {
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
