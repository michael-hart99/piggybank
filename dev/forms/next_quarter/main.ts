import { getAllMemberIds, getClubInfo } from '../../get';
import { updateClubInfo, updateMember } from '../../tables/update';
import { BooleanData, repeat } from '../../types';

/**
 * Executes upon submission of this form.
 */
export function onFormSubmit() {
    nextQuarter();
}

export function nextQuarter() {
    const clubInfo = getClubInfo();
    const ids = getAllMemberIds();

    updateClubInfo(undefined, undefined, undefined, clubInfo.currentQuarterId.next());
    updateMember(ids, undefined, undefined, undefined, undefined, undefined, undefined, undefined, repeat(BooleanData.FALSE, ids.length));
}
