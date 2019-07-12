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
    const memberName = resItems[0].getResponse() as string;

    let performingRes: string | undefined;
    let activeRes: string | undefined;
    let officerRes: string | undefined;
    if (resItems[1]) {
        switch (resItems[1].getItem().getIndex()) {
            case 1:
                performingRes = resItems[1].getResponse() as string;
                break;
            case 2:
                activeRes = resItems[1].getResponse() as string;
                break;
            case 3:
                officerRes = resItems[1].getResponse() as string;
                break;
            default:
                // Unable to be reached
                throw Error
        }
        if (resItems[2]) {
            switch (resItems[2].getItem().getIndex()) {
                case 2:
                    activeRes = resItems[2].getResponse() as string;
                    break;
                case 3:
                    officerRes = resItems[2].getResponse() as string;
                    break;
                default:
                    // Unable to be reached
                    throw Error
            }
            if (resItems[3]) {
                officerRes = resItems[3].getResponse() as string;
            }
        }
    }

    updateMemberStatus(memberName, performingRes, activeRes, officerRes);
}

export function updateMemberStatus(memberName: string, performingRes?: string, activeRes?: string, officerRes?: string) {
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

    const memberData = new StringData(memberName);
    const memberId = getMemberIds([memberData]);

    updateMember(
        memberId,
        undefined,
        undefined,
        undefined,
        undefined,
        performingRes ? [yesnoToBool(performingRes)] : undefined,
        activeRes ? [yesnoToBool(activeRes)] : undefined,
        officerRes ? [yesnoToBool(officerRes)] : undefined
    );
}
