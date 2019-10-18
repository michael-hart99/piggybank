function initialize() {
    Bundle_main.initializeAll();
}
function refreshAll() {
    Bundle_main.refreshAll();
}
function backupTables() {
    Bundle_main.backupTables();
}
function setupTriggers() {
    Bundle_main.setupTriggers();
}

function everyDay() {
    Bundle_main.everyDay();
}
function everyWeek() {
    Bundle_main.everyWeek();
}
function everyMonth() {
    Bundle_main.everyMonth();
}

function tablesOnOpen() {
    Bundle_main.tablesOnOpen();
}
function tablesOnEdit(e) {
    Bundle_main.tablesOnEdit(e);
}

function viewsOnOpen() {
    Bundle_main.viewsOnOpen();
}
function viewsOnEdit(e) {
    Bundle_main.viewsOnEdit(e);
}

function addExpenseOnFormSubmit() {
    Bundle_main.addExpenseOnFormSubmit();
}
function addIncomeOnFormSubmit() {
    Bundle_main.addIncomeOnFormSubmit();
}
function addMemberIouOnFormSubmit() {
    Bundle_main.addMemberIouOnFormSubmit();
}
function collectDuesOnFormSubmit() {
    Bundle_main.collectDuesOnFormSubmit();
}
function confirmTransferOnFormSubmit() {
    Bundle_main.confirmTransferOnFormSubmit();
}
function nextQuarterOnFormSubmit() {
    Bundle_main.nextQuarterOnFormSubmit();
}
function resolveMemberIouOnFormSubmit() {
    Bundle_main.resolveMemberIouOnFormSubmit();
}
function takeAttendanceOnFormSubmit() {
    Bundle_main.takeAttendanceOnFormSubmit();
}
function transferFundsOnFormSubmit() {
    Bundle_main.transferFundsOnFormSubmit();
}
function updateContactSettingsOnFormSubmit() {
    Bundle_main.updateContactSettingsOnFormSubmit();
}
function updateMemberStatusOnFormSubmit() {
    Bundle_main.updateMemberStatusOnFormSubmit();
}

function memberDetailsDialog() {
    Bundle_main.memberDetailsDialog();
}
function attendanceRecordsDialog() {
    Bundle_main.attendanceRecordsDialog();
}
function attendanceSummaryDialog() {
    Bundle_main.attendanceSummaryDialog();
}
function fullFinanceHistoryDialog() {
    Bundle_main.fullFinanceHistoryDialog();
}
function addMemberDialog() {
    Bundle_main.addMemberDialog();
}
function addAttendanceDialog() {
    Bundle_main.addAttendanceDialog();
}
function addIncomeDialog() {
    Bundle_main.addIncomeDialog();
}
function addExpenseDialog() {
    Bundle_main.addExpenseDialog();
}
function addStatementDialog() {
    Bundle_main.addStatementDialog();
}
function addRecipientDialog() {
    Bundle_main.addRecipientDialog();
}
function addPaymentTypeDialog() {
    Bundle_main.addPaymentTypeDialog();
}
function renameMemberDialog() {
    Bundle_main.renameMemberDialog();
}
function renamePaymentTypeDialog() {
    Bundle_main.renamePaymentTypeDialog();
}
function renameRecipientDialog() {
    Bundle_main.renameRecipientDialog();
}
function mergeMemberDialog() {
    Bundle_main.mergeMemberDialog();
}
function mergePaymentTypeDialog() {
    Bundle_main.mergePaymentTypeDialog();
}
function mergeRecipientDialog() {
    Bundle_main.mergeRecipientDialog();
}
function pollNotificationDialog() {
    Bundle_main.pollNotificationDialog();
}
function notifyMembersDialog() {
    Bundle_main.notifyMembersDialog();
}

function handleAddMember(name, dateJoined) {
    Bundle_main.handleAddMember(name, dateJoined);
}
function handleAddAttendance(date, members, quarter, year) {
    Bundle_main.handleAddAttendance(date, members, quarter, year);
}
function handleAddIncome(date, amount, description, payType) {
    Bundle_main.handleAddIncome(date, amount, description, payType);
}
function handleAddExpense(date, amount, description, recipient, payType) {
    Bundle_main.handleAddExpense(date, amount, description, recipient, payType);
}
function handleAddStatement(date, incomes, expenses) {
    Bundle_main.handleAddStatement(date, incomes, expenses);
}
function handleAddRecipient(name) {
    Bundle_main.handleAddRecipient(name);
}
function handleAddPayType(name) {
    Bundle_main.handleAddPayType(name);
}
function handleRenameMember(oldName, newName) {
    Bundle_main.handleRenameMember(oldName, newName);
}
function handleRenamePaymentType(oldName, newName) {
    Bundle_main.handleRenamePaymentType(oldName, newName);
}
function handleRenameRecipient(oldName, newName) {
    Bundle_main.handleRenameRecipient(oldName, newName);
}
function handleMergeMember(aliases, name) {
    Bundle_main.handleMergeMember(aliases, name);
}
function handleMergePaymentType(aliases, name) {
    Bundle_main.handleMergePaymentType(aliases, name);
}
function handleMergeRecipient(aliases, name) {
    Bundle_main.handleMergeRecipient(aliases, name);
}
function handlePollNotification(title, deadline, link) {
    Bundle_main.handlePollNotification(title, deadline, link);
}
function handleNotifyMembers(memberNames, subject, body) {
    Bundle_main.handleNotifyMembers(memberNames, subject, body);
}
