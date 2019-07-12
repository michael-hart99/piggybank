export function getMostRecentResponse(form: GoogleAppsScript.Forms.Form) {
    const resList = form.getResponses();

    return resList[resList.length - 1].getItemResponses();
}
