function initialize() {
    Bundle.initializeAll();
}
function refresh() {
    Bundle.refreshAll();
}
function setupTriggers() {
    Bundle.setupTriggers();
}

function everyDay() {
    Bundle.everyDay();
}
function everyWeek() {
    Bundle.everyWeek();
}

function tablesOnOpen() {
    Bundle.tablesOnOpen();
}
function tablesOnEdit(e) {
    Bundle.tablesOnEdit(e);
}

function viewsOnOpen() {
    Bundle.viewsOnOpen();
}
function viewsOnEdit(e) {
    Bundle.viewsOnEdit(e);
}

function addExpenseOnFormSubmit() {
    Bundle.addExpenseOnFormSubmit();
}
function addIncomeOnFormSubmit() {
    Bundle.addIncomeOnFormSubmit();
}
function addMemberIouOnFormSubmit() {
    Bundle.addMemberIouOnFormSubmit();
}
function collectDuesOnFormSubmit() {
    Bundle.collectDuesOnFormSubmit();
}
function confirmTransferOnFormSubmit() {
    Bundle.confirmTransferOnFormSubmit();
}
function nextQuarterOnFormSubmit() {
    Bundle.nextQuarterOnFormSubmit();
}
function resolveMemberIouOnFormSubmit() {
    Bundle.resolveMemberIouOnFormSubmit();
}
function takeAttendanceOnFormSubmit() {
    Bundle.takeAttendanceOnFormSubmit();
}
function transferFundsOnFormSubmit() {
    Bundle.transferFundsOnFormSubmit();
}
function updateContactSettingsOnFormSubmit() {
    Bundle.updateContactSettingsOnFormSubmit();
}
function updateMemberStatusOnFormSubmit() {
    Bundle.updateMemberStatusOnFormSubmit();
}

function memberDetailsDialog() {
    Bundle.memberDetailsDialog();
}
function attendanceRecordsDialog() {
    Bundle.attendanceRecordsDialog();
}
function attendanceSummaryDialog() {
    Bundle.attendanceSummaryDialog();
}
function fullFinanceHistoryDialog() {
    Bundle.fullFinanceHistoryDialog();
}
function renameMemberDialog() {
    Bundle.renameMemberDialog();
}
function renamePaymentTypeDialog() {
    Bundle.renamePaymentTypeDialog();
}
function renameRecipientDialog() {
    Bundle.renameRecipientDialog();
}
function mergeMemberDialog() {
    Bundle.mergeMemberDialog();
}
function mergePaymentTypeDialog() {
    Bundle.mergePaymentTypeDialog();
}
function mergeRecipientDialog() {
    Bundle.mergeRecipientDialog();
}
function pollNotificationDialog() {
    Bundle.pollNotificationDialog();
}
function notifyMembersDialog() {
    Bundle.notifyMembersDialog();
}

function handleRenameMember(oldName, newName) {
    Bundle.handleRenameMember(oldName, newName);
}
function handleRenamePaymentType(oldName, newName) {
    Bundle.handleRenamePaymentType(oldName, newName);
}
function handleRenameRecipient(oldName, newName) {
    Bundle.handleRenameRecipient(oldName, newName);
}
function handleMergeMember(aliases, name) {
    Bundle.handleMergeMember(aliases, name);
}
function handleMergePaymentType(aliases, name) {
    Bundle.handleMergePaymentType(aliases, name);
}
function handleMergeRecipient(aliases, name) {
    Bundle.handleMergeRecipient(aliases, name);
}
function handlePollNotification(title, deadline, link) {
    Bundle.handlePollNotification(title, deadline, link);
}
function handleNotifyMembers(memberNames, subject, body) {
    Bundle.handleNotifyMembers(memberNames, subject, body);
}
