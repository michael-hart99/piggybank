export enum ErrorType {
    FieldNotFoundError,
    IllegalArgumentError,
    AssertionError,
    NoMatchFoundError
}

export enum Quarter {
    WINTER,
    SPRING,
    SUMMER,
    FALL,
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
        let n = parseInt(s);
        if (n === NaN) throw ErrorType.IllegalArgumentError;
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
        if (n === NaN) throw ErrorType.IllegalArgumentError;
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
        let n = parseInt(s);
        if (n === NaN) throw ErrorType.IllegalArgumentError;
        return new DateData(new Date(n));
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
        let n = parseInt(s);
        if (n === NaN) throw ErrorType.IllegalArgumentError;
        switch (n % 4) {
            case 0:
                return new QuarterData(
                    Quarter.WINTER,
                    new IntData(Math.round(n / 4))
                );
            case 1:
                return new QuarterData(
                    Quarter.SPRING,
                    new IntData(Math.round(n / 4))
                );
            case 2:
                return new QuarterData(
                    Quarter.SUMMER,
                    new IntData(Math.round(n / 4))
                );
            case 3:
                return new QuarterData(
                    Quarter.FALL,
                    new IntData(Math.round(n / 4))
                );
            default:
                // Impossible to reach
                throw Error;
        }
    }
    toString() {
        return this.val.toString();
    }
    getValue() {
        return this.val;
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
                let n = parseInt(val);
                if (n === NaN) throw ErrorType.IllegalArgumentError;
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

export function repeat<T>(val: T, length: number): T[] {
    const array: T[] = Array(length);
    for (let i = 0; i < length; ++i) {
        array[i] = val;
    }
    return array;
}
