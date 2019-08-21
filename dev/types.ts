import { disableForm, enableForm } from './forms/disable';
import { refreshAddExpense, refreshAddIncome, refreshAddMemberIou, refreshCollectDues, refreshConfirmTransfer, refreshNextQuarter, refreshResolveMemberIou, refreshTakeAttendance, refreshTransferFunds, refreshUpdateContactSettings, refreshUpdateMemberStatus } from './forms/refresh';
import { refreshAccountInfo, refreshAllTransactions, refreshExpenses, refreshIncomes, refreshMembers, refreshStatements } from './views/refresh';

export abstract class ErrorType {
    static FieldNotFoundError = 'FieldNotFoundError';
    static IllegalArgumentError = 'IllegalArgumentError';
    static AssertionError = 'AssertionError';
    static NoMatchFoundError = 'NoMatchFoundError';
}
export enum Quarter {
    WINTER,
    SPRING,
    SUMMER,
    FALL,
}

export type Dictionary<K extends keyof any, V> = { [P in K]?: V }
export class UniqueList<T> {
    private vals: T[];

    constructor(vals?: T[]) {
        if (vals) this.vals = vals;
        else this.vals = [];
    }
    add(x: T) {
        if (this.vals.indexOf(x) === -1) {
            this.vals.push(x);
            return true;
        }
        return false;
    }
    size() {
        return this.vals.length;
    }
    asArray() {
        return this.vals.map(x => x);
    }
}

export const CARRIERS: Dictionary<string, string> = {
    'AT&T': '@txt.att.net',
    'T-Mobile': '@tmomail.net',
    'Verizon': '@vtext.com',
    'Sprint': '@messaging.sprintpcs.com',
    'XFinity Mobile': '@vtext.com',
    'Virgin Mobile': '@vmobl.com',
    'Metro PCS': '@mymetropcs.com',
    'Boost Mobile': '@sms.myboostmobile.com',
    'Cricket': '@sms.cricketwireless.net',
    'Republic Wireless': '@text.republicwireless.com',
    'Google Fi': '@msg.fi.google.com',
    'U.S. Cellular': '@email.uscc.net',
    'Ting': '@message.ting.com',
    'Consumer Cellular': '@mailmymobile.net',
    'C-Spire': '@cspire1.com',
    'Page Plus': '@vtext.com'
};

export interface EditEvent {
    range: GoogleAppsScript.Spreadsheet.Range;
    source: GoogleAppsScript.Spreadsheet.Spreadsheet;
}
export interface SortSpecObj {
    column: number;
    ascending: boolean;
}

export abstract class Color {
    static WHITE = '#ffffff';
    static BLACK = '#000000';
    static LIGHT_GRAY = '#d5d5d5';
    static LIGHT_RED = '#ffcbcb';
    static PALE_RED = '#ffcbcb';
    static PALE_GREEN = '#f2fff0';
    static PALE_BLUE = '#ecf1f8';
}
export abstract class NumberFormat {
    static TEXT = '';
    static MONEY = '"$"#,##0.00';
    static INTEGER = '#,##0';
    static DATE = 'MMM dd, yyyy';
}

export abstract class Generated {
    constructor(private name: string, private refreshFn: Function) { }

    public getName() { return this.name; }
    public getRefreshFn() { return this.refreshFn; }
}
export class GeneratedTable extends Generated {
    static ACCOUNT_INFO = new GeneratedTable('Account Info', refreshAccountInfo);
    static MEMBERS = new GeneratedTable('Members', refreshMembers);
    static INCOMES = new GeneratedTable('Incomes', refreshIncomes);
    static EXPENSES = new GeneratedTable('Expenses', refreshExpenses);
    static ALL_TRANSACTIONS = new GeneratedTable('All Transactions', refreshAllTransactions);
    static STATEMENTS = new GeneratedTable('Statements', refreshStatements);

    private constructor(name: string, refreshFn: Function) {
        super(name, refreshFn);
    }
}
export class GeneratedForm extends Generated {
    static ADD_EXPENSE = new GeneratedForm('Add Expense', refreshAddExpense);
    static ADD_INCOME = new GeneratedForm('Add Income', refreshAddIncome);
    static ADD_MEMBER_IOU = new GeneratedForm('Add Member IOU', refreshAddMemberIou);
    static COLLECT_DUES = new GeneratedForm('Collect Dues', refreshCollectDues);
    static CONFIRM_TRANSFER = new GeneratedForm('Confirm Transfer', refreshConfirmTransfer);
    static NEXT_QUARTER = new GeneratedForm('Next Quarter', refreshNextQuarter);
    static RESOLVE_MEMBER_IOU = new GeneratedForm('Resolve Member IOU', refreshResolveMemberIou);
    static TAKE_ATTENDANCE = new GeneratedForm('Take Attendance', refreshTakeAttendance);
    static TRANSFER_FUNDS = new GeneratedForm('Transfer Funds', refreshTransferFunds);
    static UPDATE_CONTACT_SETTINGS = new GeneratedForm('Update Contact Settings', refreshUpdateContactSettings);
    static UPDATE_MEMBER_STATUS = new GeneratedForm('Update Member Status', refreshUpdateMemberStatus);

    private constructor(name: string, refreshFn: Function) {
        super(name, refreshFn);
    }
}
export class DataTable {
    static MEMBER = new DataTable('Member', [
        GeneratedTable.MEMBERS,
    ], [
            GeneratedForm.ADD_MEMBER_IOU,
            GeneratedForm.COLLECT_DUES,
            GeneratedForm.RESOLVE_MEMBER_IOU,
            GeneratedForm.TAKE_ATTENDANCE,
            GeneratedForm.UPDATE_CONTACT_SETTINGS,
            GeneratedForm.UPDATE_MEMBER_STATUS
        ]);
    static INCOME = new DataTable('Income', [
        GeneratedTable.ACCOUNT_INFO,
        GeneratedTable.INCOMES,
        GeneratedTable.ALL_TRANSACTIONS,
        GeneratedTable.STATEMENTS
    ], [
            GeneratedForm.CONFIRM_TRANSFER,
            GeneratedForm.TRANSFER_FUNDS
        ]);
    static EXPENSE = new DataTable('Expense', [
        GeneratedTable.ACCOUNT_INFO,
        GeneratedTable.EXPENSES,
        GeneratedTable.ALL_TRANSACTIONS,
        GeneratedTable.STATEMENTS
    ], [
            GeneratedForm.CONFIRM_TRANSFER,
            GeneratedForm.TRANSFER_FUNDS
        ]);
    static RECIPIENT = new DataTable('Recipient', [
        GeneratedTable.EXPENSES,
        GeneratedTable.ALL_TRANSACTIONS
    ], []);
    static PAYMENT_TYPE = new DataTable('Payment Type', [
        GeneratedTable.ACCOUNT_INFO,
        GeneratedTable.INCOMES,
        GeneratedTable.EXPENSES,
        GeneratedTable.ALL_TRANSACTIONS,
        GeneratedTable.STATEMENTS
    ], [
            GeneratedForm.ADD_EXPENSE,
            GeneratedForm.ADD_INCOME,
            GeneratedForm.COLLECT_DUES,
            GeneratedForm.CONFIRM_TRANSFER,
            GeneratedForm.RESOLVE_MEMBER_IOU,
            GeneratedForm.TRANSFER_FUNDS
        ]);
    static STATEMENT = new DataTable('Statement', [
        GeneratedTable.STATEMENTS
    ], [
            GeneratedForm.CONFIRM_TRANSFER,
            GeneratedForm.TRANSFER_FUNDS
        ]);
    static ATTENDANCE = new DataTable('Attendance', [
        GeneratedTable.MEMBERS
    ], []);
    static CLUB_INFO = new DataTable('Club Info', [
        GeneratedTable.ACCOUNT_INFO,
        GeneratedTable.MEMBERS
    ], [
            GeneratedForm.COLLECT_DUES,
            GeneratedForm.NEXT_QUARTER
        ]);

    private constructor(private name: string, private dependentTables: GeneratedTable[], private dependentForms: GeneratedForm[]) { }

    public getName() { return this.name; }
    public getDependentTables() { return this.dependentTables; }
    public getDependentForms() { return this.dependentForms; }
}

export abstract class RefreshLogger {
    static tables: UniqueList<DataTable> = new UniqueList<DataTable>();

    static markAsUpdated(table: DataTable) {
        this.tables.add(table);
    }
    static run() {
        const forms = new UniqueList<GeneratedForm>();

        this.tables.asArray().forEach(table => {
            table.getDependentForms().forEach(form => forms.add(form));
        });

        const lock = LockService.getScriptLock();
        lock.waitLock(5 * 60 * 1000) // five minutes

        forms.asArray().forEach(form => disableForm(form));

        try {
            this.tables.asArray().forEach(table => {
                table.getDependentTables().forEach(x => x.getRefreshFn()());
            });
            this.tables.asArray().forEach(table => {
                table.getDependentForms().forEach(x => x.getRefreshFn()());
            });
        } catch (e) {
            forms.asArray().forEach(form => enableForm(form));
            throw e;
        }

        lock.releaseLock();
    }
}

export abstract class Data {
    abstract toString(): string;
    abstract getValue(): any;
}
export class StringData extends Data {
    constructor(private val: string) {
        super();
    }
    static create(s: string) {
        return new StringData(s);
    }
    toString() {
        return this.val;
    }
    getValue() {
        return this.val;
    }
}
export class IntData extends Data {
    constructor(private val: number) {
        super();
        if (val % 1 !== 0) {
            throw ErrorType.IllegalArgumentError;
        }
    }
    static create(s: string) {
        let n = parseInt(s, 10);
        if (isNaN(n)) throw ErrorType.IllegalArgumentError;
        return new IntData(n);
    }
    toString() {
        return this.val.toString();
    }
    getValue() {
        return this.val;
    }
}
export class FloatData extends Data {
    constructor(private val: number) {
        super();
    }
    static create(s: string) {
        let n = parseFloat(s);
        if (isNaN(n)) throw ErrorType.IllegalArgumentError;
        return new FloatData(n);
    }
    toString() {
        return this.val.toString();
    }
    getValue() {
        return this.val;
    }
}
export class DateData extends Data {
    constructor(private val: Date) {
        super();
    }
    static create(s: string) {
        let n = parseInt(s, 10);
        if (isNaN(n)) throw ErrorType.IllegalArgumentError;
        return new DateData(new Date(n));
    }
    toDateString() {
        let month: string;
        switch (this.val.getMonth()) {
            case 0:
                month = 'Jan';
                break;
            case 1:
                month = 'Feb';
                break;
            case 2:
                month = 'Mar';
                break;
            case 3:
                month = 'Apr';
                break;
            case 4:
                month = 'May';
                break;
            case 5:
                month = 'Jun';
                break;
            case 6:
                month = 'Jul';
                break;
            case 7:
                month = 'Aug';
                break;
            case 8:
                month = 'Sep';
                break;
            case 9:
                month = 'Oct';
                break;
            case 10:
                month = 'Nov';
                break;
            case 11:
                month = 'Dec';
                break;
            default:
                throw ErrorType.AssertionError;
        }
        return month + ' ' + this.val.getDate() + ', ' + this.val.getFullYear();
    }
    toString() {
        return this.val.valueOf().toString();
    }
    getValue() {
        return this.val;
    }
}
export class BooleanData extends Data {
    private val: boolean;

    static TRUE = new BooleanData(true);
    static FALSE = new BooleanData(false);

    constructor(val: boolean | string) {
        super();
        if (typeof val === 'string') {
            if (val === '1') {
                this.val = true;
            } else if (val === '0') {
                this.val = false;
            } else {
                throw ErrorType.IllegalArgumentError;
            }
        } else {
            this.val = val;
        }
    }
    static create(s: string) {
        switch (s) {
            case '0':
                return BooleanData.FALSE;
            case '1':
                return BooleanData.TRUE;
            default:
                throw ErrorType.IllegalArgumentError;
        }
    }
    toString() {
        return this.val ? '1' : '0';
    }
    getValue() {
        return this.val;
    }
}
export class QuarterData extends Data {
    private val: IntData;
    private dateString: string;

    constructor(private quarter: Quarter, private year: IntData) {
        super();
        switch (quarter) {
            case Quarter.WINTER:
                this.val = new IntData(year.getValue() * 4);
                this.dateString = `Winter ${year}`;
                break;
            case Quarter.SPRING:
                this.val = new IntData(year.getValue() * 4 + 1);
                this.dateString = `Spring ${year}`;
                break;
            case Quarter.SUMMER:
                this.val = new IntData(year.getValue() * 4 + 2);
                this.dateString = `Summer ${year}`;
                break;
            case Quarter.FALL:
                this.val = new IntData(year.getValue() * 4 + 3);
                this.dateString = `Fall ${year}`;
                break;
            default:
                throw ErrorType.IllegalArgumentError;
        }
    }
    static create(s: string) {
        let n = parseInt(s, 10);
        if (isNaN(n)) throw ErrorType.IllegalArgumentError;
        const year = new IntData(Math.floor(n / 4))
        switch (n % 4) {
            case 0:
                return new QuarterData(
                    Quarter.WINTER,
                    year
                );
            case 1:
                return new QuarterData(
                    Quarter.SPRING,
                    year
                );
            case 2:
                return new QuarterData(
                    Quarter.SUMMER,
                    year
                );
            case 3:
                return new QuarterData(
                    Quarter.FALL,
                    year
                );
            default:
                // Impossible to reach
                throw ErrorType.AssertionError;
        }
    }
    toString() {
        return this.val.toString();
    }
    getValue() {
        return this.val.getValue();
    }
    toDateString() {
        return this.dateString;
    }
    getQuarter() {
        return this.quarter;
    }
    getYear() {
        return this.year;
    }
    next() {
        switch (this.quarter) {
            case Quarter.WINTER:
                return new QuarterData(Quarter.SPRING, this.year);
            case Quarter.SPRING:
                return new QuarterData(Quarter.SUMMER, this.year);
            case Quarter.SUMMER:
                return new QuarterData(Quarter.FALL, this.year);
            case Quarter.FALL:
                return new QuarterData(Quarter.WINTER, new IntData(this.year.getValue() + 1));
        }
    }
}
export class IntListData extends Data {
    private s: string;

    constructor(private vals: IntData[]) {
        super();
        this.vals = vals;
        this.s = vals.join(',');
    }
    static create(s: string) {
        if (s.length === 0) {
            return new IntListData([]);
        }
        const vals = s.split(',');
        return new IntListData(
            vals.map(val => {
                let n = parseInt(val, 10);
                if (isNaN(n)) throw ErrorType.IllegalArgumentError;
                return new IntData(n);
            })
        );
    }
    toString() {
        return this.s;
    }
    getValue() {
        return [...this.vals];
    }
}

export abstract class Entry {
    constructor(public id?: IntData) { }

    abstract toArray(): string[];
    abstract length(): number;
}
export class MemberEntry extends Entry {
    constructor(
        id?: IntData,
        public name?: StringData,
        public dateJoined?: DateData,
        public amountOwed?: IntData,
        public email?: StringData,
        public performing?: BooleanData,
        public active?: BooleanData,
        public officer?: BooleanData,
        public currentDuesPaid?: BooleanData,
        public notifyPoll?: BooleanData,
        public sendReceipt?: BooleanData
    ) {
        super();
        this.id = id;
    }

    toArray() {
        const out: string[] = [];

        if (this.id) out.push(this.id.toString());
        if (this.name) out.push(this.name.toString());
        if (this.dateJoined) out.push(this.dateJoined.toString());
        if (this.amountOwed) out.push(this.amountOwed.toString());
        if (this.email) out.push(this.email.toString());
        if (this.performing) out.push(this.performing.toString());
        if (this.active) out.push(this.active.toString());
        if (this.officer) out.push(this.officer.toString());
        if (this.currentDuesPaid) out.push(this.currentDuesPaid.toString());
        if (this.notifyPoll) out.push(this.notifyPoll.toString());
        if (this.sendReceipt) out.push(this.sendReceipt.toString());

        return out;
    }
    length() {
        return 11;
    }
}
export class IncomeEntry extends Entry {
    constructor(
        id?: IntData,
        public date?: DateData,
        public amount?: IntData,
        public description?: StringData,
        public paymentTypeId?: IntData,
        public statementId?: IntData
    ) {
        super();
        this.id = id;
    }

    toArray() {
        const out: string[] = [];

        if (this.id) out.push(this.id.toString());
        if (this.date) out.push(this.date.toString());
        if (this.amount) out.push(this.amount.toString());
        if (this.description) out.push(this.description.toString());
        if (this.paymentTypeId) out.push(this.paymentTypeId.toString());
        if (this.statementId) out.push(this.statementId.toString());

        return out;
    }
    length() {
        return 6;
    }
}
export class ExpenseEntry extends Entry {
    constructor(
        id?: IntData,
        public date?: DateData,
        public amount?: IntData,
        public description?: StringData,
        public paymentTypeId?: IntData,
        public recipientId?: IntData,
        public statementId?: IntData
    ) {
        super();
        this.id = id;
    }

    toArray() {
        const out: string[] = [];

        if (this.id) out.push(this.id.toString());
        if (this.date) out.push(this.date.toString());
        if (this.amount) out.push(this.amount.toString());
        if (this.description) out.push(this.description.toString());
        if (this.paymentTypeId) out.push(this.paymentTypeId.toString());
        if (this.recipientId) out.push(this.recipientId.toString());
        if (this.statementId) out.push(this.statementId.toString());

        return out;
    }
    length() {
        return 7;
    }
}
export class RecipientEntry extends Entry {
    constructor(id?: IntData, public name?: StringData) {
        super();
        this.id = id;
    }

    toArray() {
        const out: string[] = [];

        if (this.id) out.push(this.id.toString());
        if (this.name) out.push(this.name.toString());

        return out;
    }
    length() {
        return 2;
    }
}
export class PaymentTypeEntry extends Entry {
    constructor(id?: IntData, public name?: StringData) {
        super();
        this.id = id;
    }

    toArray() {
        const out: string[] = [];

        if (this.id) out.push(this.id.toString());
        if (this.name) out.push(this.name.toString());

        return out;
    }
    length() {
        return 2;
    }
}
export class StatementEntry extends Entry {
    constructor(
        id?: IntData,
        public date?: DateData,
        public confirmed?: BooleanData
    ) {
        super();
        this.id = id;
    }

    toArray() {
        const out: string[] = [];

        if (this.id) out.push(this.id.toString());
        if (this.date) out.push(this.date.toString());
        if (this.confirmed) out.push(this.confirmed.toString());

        return out;
    }
    length() {
        return 3;
    }
}
export class AttendanceEntry extends Entry {
    constructor(
        id?: IntData,
        public date?: DateData,
        public member_ids?: IntListData,
        public quarter_id?: QuarterData
    ) {
        super();
        this.id = id;
    }

    toArray() {
        const out: string[] = [];

        if (this.id) out.push(this.id.toString());
        if (this.date) out.push(this.date.toString());
        if (this.member_ids) out.push(this.member_ids.toString());
        if (this.quarter_id) out.push(this.quarter_id.toString());

        return out;
    }
    length() {
        return 4;
    }
}
export class ClubInfoEntry {
    constructor(
        public memberFee: IntData,
        public officerFee: IntData,
        public daysUntilFeeRequired: IntData,
        public currentQuarterId: QuarterData
    ) { }

    toArray() {
        const out: string[] = [];

        if (this.memberFee) out.push(this.memberFee.toString());
        if (this.officerFee) out.push(this.officerFee.toString());
        if (this.daysUntilFeeRequired) out.push(this.daysUntilFeeRequired.toString());
        if (this.currentQuarterId) out.push(this.currentQuarterId.toString());

        return out;
    }
    length() {
        return 4;
    }
}

export function repeat<T>(val: T, length: number): T[] {
    const array: T[] = Array(length);
    for (let i = 0; i < length; ++i) {
        array[i] = val;
    }
    return array;
}
export function capitalizeString(s: string) {
    function capitalize(s: string) {
        if (s.length <= 0) {
            return s;
        }
        return s[0].toUpperCase() + s.substr(1);
    }
    const words = s.split(' ');
    let output = '';
    if (words.length > 0) {
        output += capitalize(words[0]);
        for (let i = 1; i < words.length; ++i) {
            output += ' ' + capitalize(words[i]);
        }
    }
    return output;
}
export function centsToString(n: IntData) {
    if (n.getValue() < 0) {
        return '-$'.concat((Math.abs(n.getValue()) / 100).toFixed(2));
    } else {
        return '$'.concat((n.getValue() / 100).toFixed(2));
    }
}
export function compareByDateDesc(
    a: IncomeEntry | ExpenseEntry | StatementEntry,
    b: IncomeEntry | ExpenseEntry | StatementEntry
) {
    if (!a.date || !b.date) throw ErrorType.AssertionError;
    return b.date.getValue().valueOf() - a.date.getValue().valueOf();
}
// 'yyyy-mm-dd' -> obj
export function datestrToDate(date: string) {
    const vals = date.split('-');
    if (vals.length < 3) throw ErrorType.IllegalArgumentError;
    const year = parseInt(vals[0], 10);
    const month = parseInt(vals[1], 10);
    const day = parseInt(vals[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) throw ErrorType.IllegalArgumentError;
    return new Date(year, month - 1, day);
}
