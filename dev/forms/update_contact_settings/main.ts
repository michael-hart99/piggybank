import { getMemberIds } from '../../get';
import { updateMember } from '../../tables/update';
import { BooleanData, ErrorType, StringData } from '../../types';
import { getMostRecentResponse } from '../formOps';

/**
 * Executes upon submission of this form.
 */
export function onFormSubmit() {
    handleResponse(getMostRecentResponse(FormApp.getActiveForm()));
}

function handleResponse(resItems: GoogleAppsScript.Forms.ItemResponse[]) {
    const name = resItems[0].getResponse() as string;

    let email: string | undefined;
    let phone: string | undefined;
    let carrier: string | undefined;
    let notifyPoll: string | undefined;
    let sendReceipt: string | undefined;
    if (resItems[1]) {
        switch (resItems[1].getItem().getIndex()) {
            case 1:
                email = resItems[1].getResponse() as string;
                break;
            case 2:
                phone = resItems[1].getResponse() as string;
                break;
            case 3:
                carrier = resItems[1].getResponse() as string;
                break;
            case 4:
                notifyPoll = resItems[1].getResponse() as string;
                break;
            case 5:
                sendReceipt = resItems[1].getResponse() as string;
                break;
            default:
                // Unable to be reached
                throw Error
        }
        if (resItems[2]) {
            switch (resItems[2].getItem().getIndex()) {
                case 2:
                    phone = resItems[2].getResponse() as string;
                    break;
                case 3:
                    carrier = resItems[2].getResponse() as string;
                    break;
                case 4:
                    notifyPoll = resItems[2].getResponse() as string;
                    break;
                case 5:
                    sendReceipt = resItems[2].getResponse() as string;
                    break;
                default:
                    // Unable to be reached
                    throw Error
            }
            if (resItems[3]) {
                switch (resItems[3].getItem().getIndex()) {
                    case 3:
                        carrier = resItems[3].getResponse() as string;
                        break;
                    case 4:
                        notifyPoll = resItems[3].getResponse() as string;
                        break;
                    case 5:
                        sendReceipt = resItems[3].getResponse() as string;
                        break;
                    default:
                        // Unable to be reached
                        throw Error
                }
                if (resItems[4]) {
                    switch (resItems[4].getItem().getIndex()) {
                        case 4:
                            notifyPoll = resItems[4].getResponse() as string;
                            break;
                        case 5:
                            sendReceipt = resItems[4].getResponse() as string;
                            break;
                        default:
                            // Unable to be reached
                            throw Error
                    }
                    if (resItems[5]) {
                        sendReceipt = resItems[5].getResponse() as string;
                    }
                }
            }
        }
    }

    updateContactSettings(name, email, phone, carrier, notifyPoll, sendReceipt);
}

export function updateContactSettings(name: string, email?: string, phone?: string, carrier?: string, notifyPoll?: string, sendReceipt?: string) {
    function yesnoToBool(yesno: string) {
        switch (yesno) {
            case 'yes':
                return BooleanData.TRUE;
            case 'no':
                return BooleanData.FALSE;
            default:
                throw ErrorType.IllegalArgumentError;
        }
    }

    const memberData = new StringData(name);
    const memberId = getMemberIds([memberData]);

    let emailData: StringData | undefined;
    if (email) {
        emailData = new StringData(email);
    } else if (phone && carrier) {
        switch (carrier) {
            case 'AT&T':
                emailData = new StringData(phone + '@txt.att.net');
                break;
            case 'T-Mobile':
                emailData = new StringData(phone + '@tmomail.net');
                break;
            case 'Verizon':
                emailData = new StringData(phone + '@vtext.com');
                break;
            case 'Sprint':
                emailData = new StringData(phone + '@messaging.sprintpcs.com');
                break;
            case 'XFinity Mobile':
                emailData = new StringData(phone + '@vtext.com');
                break;
            case 'Virgin Mobile':
                emailData = new StringData(phone + '@vmobl.com');
                break;
            case 'Metro PCS':
                emailData = new StringData(phone + '@mymetropcs.com');
                break;
            case 'Boost Mobile':
                emailData = new StringData(phone + '@sms.myboostmobile.com');
                break;
            case 'Cricket':
                emailData = new StringData(phone + '@sms.cricketwireless.net');
                break;
            case 'Republic Wireless':
                emailData = new StringData(phone + '@text.republicwireless.com');
                break;
            case 'Google Fi':
                emailData = new StringData(phone + '@msg.fi.google.com');
                break;
            case 'U.S. Cellular':
                emailData = new StringData(phone + '@email.uscc.net');
                break;
            case 'Ting':
                emailData = new StringData(phone + '@message.ting.com');
                break;
            case 'Consumer Cellular':
                emailData = new StringData(phone + '@mailmymobile.net');
                break;
            case 'C-Spire':
                emailData = new StringData(phone + '@cspire1.com');
                break;
            case 'Page Plus':
                emailData = new StringData(phone + '@vtext.com');
                break;
            default:
                throw 'No matching carrier';
        }
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
