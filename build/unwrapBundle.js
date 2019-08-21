function initialize() {
    Bundle.initializeAll();
}
function refreshAll() {
    Bundle.refreshAll();
}
function backupTables() {
    Bundle.backupTables();
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
function everyMonth() {
    Bundle.everyMonth();
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
function addMemberDialog() {
    Bundle.addMemberDialog();
}
function addAttendanceDialog() {
    Bundle.addAttendanceDialog();
}
function addIncomeDialog() {
    Bundle.addIncomeDialog();
}
function addExpenseDialog() {
    Bundle.addExpenseDialog();
}
function addStatementDialog() {
    Bundle.addStatementDialog();
}
function addRecipientDialog() {
    Bundle.addRecipientDialog();
}
function addPaymentTypeDialog() {
    Bundle.addPaymentTypeDialog();
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

function handleAddMember(name, dateJoined) {
    Bundle.handleAddMember(name, dateJoined);
}
function handleAddAttendance(date, members, quarter, year) {
    Bundle.handleAddAttendance(date, members, quarter, year);
}
function handleAddIncome(date, amount, description, payType) {
    Bundle.handleAddIncome(date, amount, description, payType);
}
function handleAddExpense(date, amount, description, recipient, payType) {
    Bundle.handleAddExpense(date, amount, description, recipient, payType);
}
function handleAddStatement(date, incomes, expenses) {
    Bundle.handleAddStatement(date, incomes, expenses);
}
function handleAddRecipient(name) {
    Bundle.handleAddRecipient(name);
}
function handleAddPayType(name) {
    Bundle.handleAddPayType(name);
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
