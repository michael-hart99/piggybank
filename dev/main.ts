import { addExpense, addIncome, addMemberIOU, collectDues, confirmTransfer, nextQuarter, resolveMemberIOU, takeAttendance, transferFunds, updateContactSettings, updateMemberStatus } from './forms/actions';
import { refreshAllForms } from './forms/refresh';
import { ID as AE_ID } from './ids/ae';
import { ID as AI_ID } from './ids/ai';
import { ID as AMI_ID } from './ids/ami';
import { ID as CD_ID } from './ids/cd';
import { ID as CT_ID } from './ids/ct';
import { ID as NQ_ID } from './ids/nq';
import { ID as RMI_ID } from './ids/rmi';
import { ID as TA_ID } from './ids/ta';
import { ID as TABLES_ID } from './ids/tablesId';
import { ID as TF_ID } from './ids/tf';
import { ID as UCS_ID } from './ids/ucs';
import { ID as UMS_ID } from './ids/ums';
import { ID as VIEWS_ID } from './ids/viewsId';
import { createBackup } from './tables/backup';
import { EditEvent, RefreshLogger, Table } from './types';
import { mergeMember, mergePaymentType, mergeRecipient, notifyMembers, pollNotification, renameMember, renamePaymentType, renameRecipient } from './views/handlers';
import { attendanceRecordsHTML, attendanceSummaryHTML, fullFinanceHistoryHTML, memberDetailsHTML, mergeMemberHTML, mergePaymentTypeHTML, mergeRecipientHTML, notifyMembersHTML, pollNotificationHTML, renameMemberHTML, renamePaymentTypeHTML, renameRecipientHTML } from './views/html';
import { refreshAllViews } from './views/refresh';

export function initializeAll() {
    initializeTables();
    initializeViews();

    initializeAddExpense();
    initializeAddIncome();
    initializeAddMemberIou();
    initializeCollectDues();
    initializeConfirmTransfer();
    initializeNextQuarter();
    initializeResolveMemberIou();
    initializeTakeAttendance();
    initializeTransferFunds();
    initializeUpdateContactSettings();
    initializeUpdateMemberStatus();

    setupTriggers();

    refreshAllViews();
    refreshAllForms();
}

export function refreshAll() {
    refreshAllViews();
    refreshAllForms();
}

export function setupTriggers() {
    // Run everyDay everyday at 1AM
    ScriptApp.newTrigger('everyDay')
        .timeBased()
        .everyDays(1)
        .atHour(1)
        .create();
    // Run everyWeek every week's Sunday at 1AM
    ScriptApp.newTrigger('everyWeek')
        .timeBased()
        .onWeekDay(ScriptApp.WeekDay.SUNDAY)
        .atHour(1)
        .create();
    // Run everyMonth on the first of the month at 1AM
    ScriptApp.newTrigger('everyMonth')
        .timeBased()
        .onMonthDay(1)
        .atHour(1)
        .create()

    ScriptApp.newTrigger('tablesOnOpen')
        .forSpreadsheet(TABLES_ID)
        .onOpen()
        .create();
    ScriptApp.newTrigger('tablesOnEdit')
        .forSpreadsheet(TABLES_ID)
        .onEdit()
        .create();

    ScriptApp.newTrigger('viewsOnOpen')
        .forSpreadsheet(VIEWS_ID)
        .onOpen()
        .create();
    ScriptApp.newTrigger('viewsOnEdit')
        .forSpreadsheet(VIEWS_ID)
        .onEdit()
        .create();

    ScriptApp.newTrigger('addExpenseOnFormSubmit')
        .forForm(AE_ID)
        .onFormSubmit()
        .create();
    ScriptApp.newTrigger('addIncomeOnFormSubmit')
        .forForm(AI_ID)
        .onFormSubmit()
        .create();
    ScriptApp.newTrigger('addMemberIouOnFormSubmit')
        .forForm(AMI_ID)
        .onFormSubmit()
        .create();
    ScriptApp.newTrigger('collectDuesOnFormSubmit')
        .forForm(CD_ID)
        .onFormSubmit()
        .create();
    ScriptApp.newTrigger('confirmTransferOnFormSubmit')
        .forForm(CT_ID)
        .onFormSubmit()
        .create();
    ScriptApp.newTrigger('nextQuarterOnFormSubmit')
        .forForm(NQ_ID)
        .onFormSubmit()
        .create();
    ScriptApp.newTrigger('resolveMemberIouOnFormSubmit')
        .forForm(RMI_ID)
        .onFormSubmit()
        .create();
    ScriptApp.newTrigger('takeAttendanceOnFormSubmit')
        .forForm(TA_ID)
        .onFormSubmit()
        .create();
    ScriptApp.newTrigger('transferFundsOnFormSubmit')
        .forForm(TF_ID)
        .onFormSubmit()
        .create();
    ScriptApp.newTrigger('updateContactSettingsOnFormSubmit')
        .forForm(UCS_ID)
        .onFormSubmit()
        .create();
    ScriptApp.newTrigger('updateMemberStatusOnFormSubmit')
        .forForm(UMS_ID)
        .onFormSubmit()
        .create();
}

export function everyDay() { }
export function everyWeek() { }
export function everyMonth() {
    createBackup();
}

export function tablesOnOpen() { }
export function tablesOnEdit(e: EditEvent) {
    const sheetName = e.range.getSheet().getName();

    let fns: Function[];
    switch (sheetName) {
        case 'Member':
            RefreshLogger.include(Table.MEMBER);
            break;
        case 'Income':
            RefreshLogger.include(Table.INCOME);
            break;
        case 'Expense':
            RefreshLogger.include(Table.EXPENSE);
            break;
        case 'Recipient':
            RefreshLogger.include(Table.RECIPIENT);
            break;
        case 'PaymentType':
            RefreshLogger.include(Table.PAYMENT_TYPE);
            break;
        case 'Statement':
            RefreshLogger.include(Table.STATEMENT);
            break;
        case 'Attendance':
            RefreshLogger.include(Table.ATTENDANCE);
            break;
        case 'ClubInfo':
            RefreshLogger.include(Table.CLUB_INFO);
            break;
        default:
            fns = [];
    }

    RefreshLogger.run();
}

export function viewsOnOpen() {
    createViewsMenu();
}
export function viewsOnEdit() { }

function getMostRecentResponse(form: GoogleAppsScript.Forms.Form) {
    const resList = form.getResponses();
    return resList[resList.length - 1].getItemResponses();
}
export function addExpenseOnFormSubmit() {
    const resItems = getMostRecentResponse(FormApp.openById(AE_ID));

    // Short text
    const amountRes = resItems[0].getResponse() as string;
    // Long text
    const desc = resItems[1].getResponse() as string;
    // Short text
    const recipient = resItems[2].getResponse() as string;
    // Multi-choice
    const paymentType = resItems[3].getResponse() as string;

    addExpense(amountRes, desc, recipient, paymentType);

    RefreshLogger.run();
}
export function addIncomeOnFormSubmit() {
    const resItems = getMostRecentResponse(FormApp.openById(AI_ID));

    // Short text
    const amountRes = resItems[0].getResponse() as string;
    // Long text
    const desc = resItems[1].getResponse() as string;
    // Multi-choice
    const paymentType = resItems[2].getResponse() as string;

    addIncome(amountRes, desc, paymentType);

    RefreshLogger.run();
}
export function addMemberIouOnFormSubmit() {
    const resItems = getMostRecentResponse(FormApp.openById(AMI_ID));

    // Checkbox
    const membersRes = resItems[0].getResponse() as string[];
    // Short text
    const amount = resItems[1].getResponse() as string;
    // Long text
    const description = resItems[2].getResponse() as string;

    addMemberIOU(membersRes, amount, description);

    RefreshLogger.run();
}
export function collectDuesOnFormSubmit() {
    const resItems = getMostRecentResponse(FormApp.openById(CD_ID));

    // Checkbox
    const memListRes = resItems[0].getResponse() as string[];
    // Multi-choice
    const paymentTypeRes = resItems[1].getResponse() as string;

    collectDues(memListRes, paymentTypeRes);

    RefreshLogger.run();
}
export function confirmTransferOnFormSubmit() {
    const resItems = getMostRecentResponse(FormApp.openById(CT_ID));

    // Checkbox
    const statementList = resItems[0].getResponse() as string[];

    confirmTransfer(statementList);

    RefreshLogger.run();
}
export function nextQuarterOnFormSubmit() {
    nextQuarter();

    RefreshLogger.run();
}
export function resolveMemberIouOnFormSubmit() {
    const resItems = getMostRecentResponse(FormApp.openById(RMI_ID));

    // Checkbox
    const membersRes = resItems[0].getResponse() as string[];
    // Short text
    const amount = resItems[1].getResponse() as string;
    // Long text
    const description = resItems[2].getResponse() as string;
    // Multi-choice
    const paymentType = resItems[3].getResponse() as string;

    resolveMemberIOU(membersRes, amount, description, paymentType);

    RefreshLogger.run();
}
export function takeAttendanceOnFormSubmit() {
    const resItems = getMostRecentResponse(FormApp.openById(TA_ID));

    // Checkbox
    let memListRes: string[];
    // Short text
    let newMemberRes: string | undefined;
    if (resItems.length === 2) {
        memListRes = resItems[0].getResponse() as string[];
        newMemberRes = resItems[1].getResponse() as string;
        takeAttendance(memListRes, newMemberRes);
    } else if (resItems.length === 1) {
        if (resItems[0].getItem().getIndex() === 0) {
            memListRes = resItems[0].getResponse() as string[];
        } else {
            memListRes = [];
            newMemberRes = resItems[0].getResponse() as string;
        }
        takeAttendance(memListRes, newMemberRes);
    }

    RefreshLogger.run();
}
export function transferFundsOnFormSubmit() {
    const resItems = getMostRecentResponse(FormApp.openById(TF_ID));

    // Checkbox
    let incomes: string[] | undefined;
    // Checkbox
    let expenses: string[] | undefined;
    if (resItems.length > 0) {
        if (resItems.length > 1) {
            incomes = resItems[0].getResponse() as string[];
            expenses = resItems[1].getResponse() as string[];
        } else {
            if (resItems[0].getItem().getIndex() === 0) {
                incomes = resItems[0].getResponse() as string[];
            } else {
                expenses = resItems[0].getResponse() as string[];
            }
        }
    }

    transferFunds(incomes, expenses);

    RefreshLogger.run();
}
export function updateContactSettingsOnFormSubmit() {
    const resItems = getMostRecentResponse(FormApp.openById(UCS_ID));

    // Multi-choice
    const name = resItems[0].getResponse() as string;
    // Short text
    let email: string | undefined;
    // Short text
    let phone: string | undefined;
    // Multi-choice
    let carrier: string | undefined;
    // Multi-choice
    let notifyPoll: string | undefined;
    // Multi-choice
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

    RefreshLogger.run();
}
export function updateMemberStatusOnFormSubmit() {
    const resItems = getMostRecentResponse(FormApp.openById(UMS_ID));

    // Multi-choice
    const memberName = resItems[0].getResponse() as string[];

    // Multi-choice
    let performingRes: string | undefined;
    // Multi-choice
    let activeRes: string | undefined;
    // Multi-choice
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

    RefreshLogger.run();
}

function initializeViews() {
    const sheetapp = SpreadsheetApp.openById(VIEWS_ID);

    sheetapp.insertSheet('Account Info')
        .appendRow([
            'Current Quarter',
            'Total',
            'Bank',
            'Venmo',
            'On-hand'
        ]);
    sheetapp.insertSheet('Members')
        .appendRow([
            'Name',
            'Date Joined',
            'Amount Owed',
            'Current Dues Paid?',
            '# Attendances This Quarter'
        ])
        .setFrozenRows(1);
    sheetapp.insertSheet('Incomes')
        .appendRow([
            'Date',
            'Amount',
            'Description',
            'Payment Type',
            'In Account?'
        ])
        .setFrozenRows(1);
    sheetapp.insertSheet('Expenses')
        .appendRow([
            'Date',
            'Amount',
            'Description',
            'Recipient',
            'Payment Type',
            'In Account?'
        ])
        .setFrozenRows(1);
    sheetapp.insertSheet('All Transactions')
        .appendRow([
            'Date',
            'Amount',
            'Description',
            'Recipient',
            'Payment Type',
            'In Account?'
        ])
        .setFrozenRows(1);
    sheetapp.insertSheet('Statements')
        .appendRow([
            'Date',
            'Amount',
            'Payment Type',
            'Confirmed?'
        ])
        .setFrozenRows(1);

    sheetapp.deleteSheet(sheetapp.getSheetByName('Sheet1'));
}
function initializeTables() {
    const sheetapp = SpreadsheetApp.openById(TABLES_ID);

    sheetapp
        .insertSheet('Member')
        .appendRow([
            'id',
            'name',
            'dateJoined',
            'amountOwed',
            'email',
            'performing',
            'active',
            'officer',
            'currentDuesPaid',
            'notifyPoll',
            'sendReceipt'
        ]);
    sheetapp
        .insertSheet('Income')
        .appendRow(['id', 'date', 'amount', 'description', 'paymentTypeId', 'statementId']);
    sheetapp
        .insertSheet('Expense')
        .appendRow([
            'id',
            'date',
            'amount',
            'description',
            'paymentTypeId',
            'recipientId',
            'statementId'
        ]);
    sheetapp.insertSheet('Recipient').appendRow(['id', 'name']);
    sheetapp.insertSheet('PaymentType').appendRow(['id', 'name']);
    sheetapp
        .insertSheet('Statement')
        .appendRow(['id', 'date', 'confirmed']);
    sheetapp
        .insertSheet('Attendance')
        .appendRow(['id', 'date', 'memberIds', 'quarterId']);
    sheetapp
        .insertSheet('ClubInfo')
        .appendRow([
            'memberFee',
            'officerFee',
            'daysUntilFeeRequired',
            'currentQuarterId'
        ])
        .appendRow([
            '3000',
            '1500',
            '5',
            '5'
        ]);

    sheetapp.deleteSheet(sheetapp.getSheetByName('Sheet1'));
}

function initializeAddExpense() {
    const form = FormApp.openById(AE_ID);

    form.deleteItem(0);

    form.addTextItem()
        .setTitle('Amount')
        .setValidation(FormApp.createTextValidation()
            .requireNumber()
            // @ts-ignore 'build' is not listed as a property
            .build())
        .setRequired(true);
    form.addParagraphTextItem()
        .setTitle('Description')
        .setRequired(true);
    form.addTextItem()
        .setTitle('Recipient')
        .setRequired(true);
    form.addMultipleChoiceItem()
        .setTitle('Payment Type')
        .showOtherOption(true)
        .setRequired(true);
}
function initializeAddIncome() {
    const form = FormApp.openById(AI_ID);

    form.deleteItem(0);

    form.addTextItem()
        .setTitle('Amount')
        .setValidation(FormApp.createTextValidation()
            .requireNumber()
            // @ts-ignore 'build' is not listed as a property
            .build())
        .setRequired(true);
    form.addParagraphTextItem()
        .setTitle('Description')
        .setRequired(true);
    form.addMultipleChoiceItem()
        .setTitle('Payment Type')
        .showOtherOption(true)
        .setRequired(true);
}
function initializeAddMemberIou() {
    const form = FormApp.openById(AMI_ID);

    form.deleteItem(0);

    form.addCheckboxItem()
        .setTitle('Member')
        .setRequired(true);
    form.addTextItem()
        .setTitle('Amount')
        .setValidation(FormApp.createTextValidation()
            .requireNumber()
            // @ts-ignore 'build' is not listed as a property
            .build())
        .setRequired(true);
    form.addParagraphTextItem()
        .setTitle('Description')
        .setRequired(true);
}
function initializeCollectDues() {
    const form = FormApp.openById(CD_ID);

    form.deleteItem(0);

    form.addCheckboxItem()
        .setTitle('Member')
        .setRequired(true);
    form.addMultipleChoiceItem()
        .setTitle('Payment Type')
        .showOtherOption(true)
        .setRequired(true);
}
function initializeConfirmTransfer() {
    const form = FormApp.openById(CT_ID);

    form.deleteItem(0);

    form.addCheckboxItem()
        .setTitle('Transfer')
        .setRequired(true);
}
function initializeNextQuarter() {
    const form = FormApp.openById(NQ_ID);

    form.deleteItem(0);

    form.addCheckboxItem()
        .setTitle('Confirmation')
        .setRequired(true);
}
function initializeResolveMemberIou() {
    const form = FormApp.openById(RMI_ID);

    form.deleteItem(0);

    form.addCheckboxItem()
        .setTitle('Member')
        .setRequired(true);
    form.addTextItem()
        .setTitle('Amount')
        .setValidation(FormApp.createTextValidation()
            .requireNumber()
            // @ts-ignore 'build' is not listed as a property
            .build())
        .setRequired(true);
    form.addParagraphTextItem()
        .setTitle('Description')
        .setRequired(true);
    form.addMultipleChoiceItem()
        .setTitle('Payment Type')
        .showOtherOption(true)
        .setRequired(true);
}
function initializeTakeAttendance() {
    const form = FormApp.openById(TA_ID);

    form.deleteItem(0);

    form.addCheckboxItem()
        .setTitle('Member')
    form.addParagraphTextItem()
        .setTitle('New Members')
        .setHelpText('Separate each name with a new line')
}
function initializeTransferFunds() {
    const form = FormApp.openById(TF_ID);

    form.deleteItem(0);

    form.addCheckboxItem()
        .setTitle('Income');
    form.addCheckboxItem()
        .setTitle('Expense');
}
function initializeUpdateContactSettings() {
    const form = FormApp.openById(UCS_ID);

    form.deleteItem(0);

    form.addMultipleChoiceItem()
        .setTitle('Name')
        .setRequired(true);
    form.addTextItem()
        .setTitle('Email');
    form.addTextItem()
        .setTitle('Phone Number')
        .setHelpText('Using the form \'XXX-XXX-XXXX\'')
        .setValidation(FormApp.createTextValidation()
            .requireTextMatchesPattern('[0-9]{3}-[0-9]{3}-[0-9]{4}')
            // @ts-ignore 'build' is not listed as a property
            .build());
    form.addMultipleChoiceItem()
        .setTitle('Phone Carrier')
    form.addMultipleChoiceItem()
        .setTitle('Recieve notification when new poll is created?')
        .setChoiceValues(['Yes', 'No']);
    form.addMultipleChoiceItem()
        .setTitle('Recieve receipts after paying dues?')
        .setChoiceValues(['Yes', 'No']);
}
function initializeUpdateMemberStatus() {
    const form = FormApp.openById(UMS_ID);

    form.deleteItem(0);

    form.addCheckboxItem()
        .setTitle('Member')
        .setRequired(true);
    form.addMultipleChoiceItem()
        .setTitle('Performing?')
        .setChoiceValues(['Yes', 'No']);
    form.addMultipleChoiceItem()
        .setTitle('Active?')
        .setChoiceValues(['Yes', 'No']);
    form.addMultipleChoiceItem()
        .setTitle('Officer?')
        .setChoiceValues(['Yes', 'No']);
}

function createViewsMenu() {
    SpreadsheetApp.getUi()
        .createMenu('Actions')
        .addSubMenu(SpreadsheetApp.getUi()
            .createMenu('Rename')
            .addItem('Rename Member', 'renameMemberDialog')
            .addItem('Rename Payment Method', 'renamePaymentTypeDialog')
            .addItem('Rename Recipient', 'renameRecipientDialog'))
        .addSeparator()
        .addSubMenu(SpreadsheetApp.getUi()
            .createMenu('Merge')
            .addItem('Merge Members', 'mergeMemberDialog')
            .addItem('Merge Payment Methods', 'mergePaymentTypeDialog')
            .addItem('Merge Recipients', 'mergeRecipientDialog'))
        .addSeparator()
        .addItem('Poll Notification', 'pollNotificationDialog')
        .addItem('Notify Members', 'notifyMembersDialog')
        .addToUi();
    SpreadsheetApp.getUi().createMenu('Reports')
        .addItem('Member Details', 'memberDetailsDialog')
        .addItem('Attendance Records', 'attendanceRecordsDialog')
        .addItem('Attendance Summary', 'attendanceSummaryDialog')
        .addItem('Full Finance History', 'fullFinanceHistoryDialog')
        .addToUi();
}
function createDialog(title: string, html: string, height: number, width: number) {
    SpreadsheetApp.getUi().showModalDialog(
        HtmlService.createHtmlOutput(html).setHeight(height).setWidth(width),
        title
    );
}
export function memberDetailsDialog() {
    //  provide attendance, debt, and booleans breakdown
    createDialog('Member Details', memberDetailsHTML(), 300, 300);
}
export function attendanceRecordsDialog() {
    // allow selecting a date and viewing who was there that day 
    createDialog('Attendance Records', attendanceRecordsHTML(), 220, 450);
}
export function attendanceSummaryDialog() {
    // show percent of practices each member attended between 2 dates
    createDialog('Attendance Summary', attendanceSummaryHTML(), 220, 450);
}
export function fullFinanceHistoryDialog() {
    // generate waterfall graph of account's contents
    createDialog('Full Finance History', fullFinanceHistoryHTML(), 850, 450);
}
export function renameMemberDialog() {
    createDialog('Rename Member', renameMemberHTML(), 300, 300);
}
export function renamePaymentTypeDialog() {
    createDialog('Rename Payment Method', renamePaymentTypeHTML(), 300, 300);
}
export function renameRecipientDialog() {
    createDialog('Rename Recipient', renameRecipientHTML(), 300, 300);
}
export function mergeMemberDialog() {
    createDialog('Merge Member', mergeMemberHTML(), 300, 300);
}
export function mergePaymentTypeDialog() {
    createDialog('Merge Payment Method', mergePaymentTypeHTML(), 300, 300);
}
export function mergeRecipientDialog() {
    createDialog('Merge Recipient', mergeRecipientHTML(), 300, 300);
}
export function pollNotificationDialog() {
    // send performers a (performance) notification
    createDialog('Poll Notification', pollNotificationHTML(), 300, 300);
}
export function notifyMembersDialog() {
    // send performers a custom notification
    createDialog('Notify Performers', notifyMembersHTML(), 300, 300);
}

export function handleRenameMember(oldName: string, newName: string) {
    renameMember(oldName, newName);
}
export function handleRenamePaymentType(oldName: string, newName: string) {
    renamePaymentType(oldName, newName);
}
export function handleRenameRecipient(oldName: string, newName: string) {
    renameRecipient(oldName, newName);
}
export function handleMergeMember(aliases: string, name: string) {
    mergeMember(aliases, name);
}
export function handleMergePaymentType(aliases: string, name: string) {
    mergePaymentType(aliases, name);
}
export function handleMergeRecipient(aliases: string, name: string) {
    mergeRecipient(aliases, name);
}
export function handlePollNotification(title: string, deadline: string, link: string) {
    pollNotification(title, deadline, link);
}
export function handleNotifyMembers(memberNames: string, subject: string, body: string) {
    notifyMembers(memberNames, subject, body);
}
