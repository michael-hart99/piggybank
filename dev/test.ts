import { clearData } from './tableOps';
import { appendAttendance, appendExpense, appendIncome, appendMember, appendPaymentType, appendRecipient, appendStatement } from './tables/append';
import { BooleanData, DateData, ErrorType, IntData, IntListData, Quarter, QuarterData, StringData } from './types';

function checkTableValues(tableName: string, testVals: string[][], id: string) {
    const trueVals = SpreadsheetApp.openById(id).getSheetByName(tableName).getDataRange().getValues();

    if (trueVals.length !== testVals.length ||
        (
            trueVals.length > 0 &&
            testVals.length > 0 &&
            trueVals[0].length !== testVals[0].length
        )
    ) {
        return false;
    }

    for (let row = 0; row < trueVals.length; ++row) {
        for (let col = 0; col < trueVals[0].length; ++col) {
            if (trueVals[row][col].toString() !== testVals[row][col]) {
                return false;
            }
        }
    }

    return true;
}
function checkDatabaseValues(values: {
    member: string[][],
    income: string[][],
    expense: string[][],
    recipient: string[][],
    paymentType: string[][],
    statement: string[][],
    attendance: string[][],
    clubInfo: string[][]
}, id: string) {
    return (
        checkTableValues('Member', values.member, id) &&
        checkTableValues('Income', values.income, id) &&
        checkTableValues('Expense', values.expense, id) &&
        checkTableValues('Recipient', values.recipient, id) &&
        checkTableValues('PaymentType', values.paymentType, id) &&
        checkTableValues('Statement', values.statement, id) &&
        checkTableValues('Attendance', values.attendance, id) &&
        checkTableValues('ClubInfo', values.clubInfo, id)
    );
}

function clearAllData(sheetId: string) {
    const sheetApp = SpreadsheetApp.openById(sheetId);

    clearData(sheetApp.getSheetByName('Member'));
    clearData(sheetApp.getSheetByName('Income'));
    clearData(sheetApp.getSheetByName('Expense'));
    clearData(sheetApp.getSheetByName('Recipient'));
    clearData(sheetApp.getSheetByName('PaymentType'));
    clearData(sheetApp.getSheetByName('Statement'));
    clearData(sheetApp.getSheetByName('Attendance'));
    clearData(sheetApp.getSheetByName('ClubInfo'));
}

class UnitTest {
    constructor(public name: string, public test: (s: string) => boolean) { }
}

export class UnitTester {
    private static tests: UnitTest[] = [
        new UnitTest('testAppendMember', (id) => {
            const tableVals = UnitTester.getEmptyTables();

            try {
                appendMember([], [], [], [], [], [], [], [], [], [], id);
                return false;
            } catch (e) {
                if (e !== ErrorType.IllegalArgumentError) {
                    throw e;
                }
            }

            appendMember(
                [new StringData('joe schmo')],
                [new DateData(new Date(123456789))],
                [new IntData(0)],
                [new StringData('asdf@gmail.com')],
                [new BooleanData(false)],
                [new BooleanData(false)],
                [new BooleanData(false)],
                [new BooleanData(false)],
                [new BooleanData(false)],
                [new BooleanData(false)],
                id
            );
            tableVals.member.push([
                '0',
                'joe schmo',
                '123456789',
                '0',
                'asdf@gmail.com',
                '0',
                '0',
                '0',
                '0',
                '0',
                '0'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            appendMember(
                [new StringData('abc'), new StringData('xyz')],
                [new DateData(new Date(123)), new DateData(new Date(789))],
                [new IntData(100), new IntData(-55)],
                [new StringData('email@email.com'), new StringData('asdf@asdf.com')],
                [new BooleanData(false), new BooleanData(true)],
                [new BooleanData(true), new BooleanData(false)],
                [new BooleanData(false), new BooleanData(true)],
                [new BooleanData(true), new BooleanData(false)],
                [new BooleanData(false), new BooleanData(true)],
                [new BooleanData(true), new BooleanData(false)],
                id
            );
            tableVals.member.push([
                '1',
                'abc',
                '123',
                '100',
                'email@email.com',
                '0',
                '1',
                '0',
                '1',
                '0',
                '1'
            ]);
            tableVals.member.push([
                '2',
                'xyz',
                '789',
                '-55',
                'asdf@asdf.com',
                '1',
                '0',
                '1',
                '0',
                '1',
                '0'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            try {
                appendMember(
                    [new StringData('joe schmo'), new StringData('asdf')],
                    [new DateData(new Date(123456789))],
                    [new IntData(0)],
                    [new StringData('asdf@gmail.com')],
                    [new BooleanData(false)],
                    [new BooleanData(false)],
                    [new BooleanData(false)],
                    [new BooleanData(false)],
                    [new BooleanData(false)],
                    [new BooleanData(false)],
                    id
                );
                return false;
            } catch (e) {
                if (e !== ErrorType.IllegalArgumentError) {
                    throw e;
                }
            }

            return true;
        }),
        new UnitTest('testAppendIncome', (id) => {
            const tableVals = UnitTester.getEmptyTables();

            try {
                appendIncome([], [], [], [], [], id);
                return false;
            } catch (e) {
                if (e !== ErrorType.IllegalArgumentError) {
                    throw e;
                }
            }

            appendIncome(
                [new DateData(new Date(123456789))],
                [new IntData(444)],
                [new StringData('test')],
                [new IntData(0)],
                [new IntData(0)],
                id
            );
            tableVals.income.push([
                '0',
                '123456789',
                '444',
                'test',
                '0',
                '0'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            appendIncome(
                [new DateData(new Date(334455)), new DateData(new Date(111223))],
                [new IntData(0), new IntData(1000000)],
                [new StringData('other test'), new StringData('Large sum')],
                [new IntData(1), new IntData(99)],
                [new IntData(0), new IntData(77)],
                id
            );
            tableVals.income.push([
                '1',
                '334455',
                '0',
                'other test',
                '1',
                '0'
            ]);
            tableVals.income.push([
                '2',
                '111223',
                '1000000',
                'Large sum',
                '99',
                '77'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            try {
                appendIncome(
                    [new DateData(new Date(123456789)), new DateData(new Date(123))],
                    [new IntData(444)],
                    [new StringData('test')],
                    [new IntData(0)],
                    [new IntData(0)],
                    id
                );
                return false;
            } catch (e) {
                if (e !== ErrorType.IllegalArgumentError) {
                    throw e;
                }
            }

            return true;
        }),
        new UnitTest('testAppendExpense', (id) => {
            const tableVals = UnitTester.getEmptyTables();

            try {
                appendExpense([], [], [], [], [], [], id);
                return false;
            } catch (e) {
                if (e !== ErrorType.IllegalArgumentError) {
                    throw e;
                }
            }

            appendExpense(
                [new DateData(new Date(123456789))],
                [new IntData(444)],
                [new StringData('test')],
                [new IntData(0)],
                [new IntData(0)],
                [new IntData(0)],
                id
            );
            tableVals.expense.push([
                '0',
                '123456789',
                '444',
                'test',
                '0',
                '0',
                '0'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            appendExpense(
                [new DateData(new Date(334455)), new DateData(new Date(111223))],
                [new IntData(0), new IntData(1000000)],
                [new StringData('other test'), new StringData('Large sum')],
                [new IntData(1), new IntData(99)],
                [new IntData(21), new IntData(12)],
                [new IntData(0), new IntData(77)],
                id
            );
            tableVals.expense.push([
                '1',
                '334455',
                '0',
                'other test',
                '1',
                '21',
                '0'
            ]);
            tableVals.expense.push([
                '2',
                '111223',
                '1000000',
                'Large sum',
                '99',
                '12',
                '77'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            try {
                appendExpense(
                    [new DateData(new Date(123456789)), new DateData(new Date(123))],
                    [new IntData(444)],
                    [new StringData('test')],
                    [new IntData(0)],
                    [new IntData(0)],
                    [new IntData(0)],
                    id
                );
                return false;
            } catch (e) {
                if (e !== ErrorType.IllegalArgumentError) {
                    throw e;
                }
            }

            return true;
        }),
        new UnitTest('testAppendRecipient', (id) => {
            const tableVals = UnitTester.getEmptyTables();

            try {
                appendRecipient([], id);
                return false;
            } catch (e) {
                if (e !== ErrorType.IllegalArgumentError) {
                    throw e;
                }
            }

            appendRecipient(
                [new StringData('Recipient 1')],
                id
            );
            tableVals.recipient.push([
                '0',
                'Recipient 1'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            appendRecipient(
                [new StringData('costco'), new StringData('this is a recipient')],
                id
            );
            tableVals.recipient.push([
                '1',
                'costco'
            ]);
            tableVals.recipient.push([
                '2',
                'this is a recipient'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            return true;
        }),
        new UnitTest('testAppendPaymentType', (id) => {
            const tableVals = UnitTester.getEmptyTables();

            try {
                appendPaymentType([], id);
                return false;
            } catch (e) {
                if (e !== ErrorType.IllegalArgumentError) {
                    throw e;
                }
            }

            appendPaymentType(
                [new StringData('Pay type 1')],
                id
            );
            tableVals.paymentType.push([
                '0',
                'Pay type 1'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            appendPaymentType(
                [new StringData('cash'), new StringData('asdfasdf')],
                id
            );
            tableVals.paymentType.push([
                '1',
                'cash'
            ]);
            tableVals.paymentType.push([
                '2',
                'asdfasdf'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            return true;
        }),
        new UnitTest('testAppendStatement', (id) => {
            const tableVals = UnitTester.getEmptyTables();

            try {
                appendStatement([], [], id);
                return false;
            } catch (e) {
                if (e !== ErrorType.IllegalArgumentError) {
                    throw e;
                }
            }

            appendStatement(
                [new DateData(new Date(11111))],
                [BooleanData.TRUE],
                id
            );
            tableVals.statement.push([
                '0',
                '11111',
                '1'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            appendStatement(
                [new DateData(new Date(40)), new DateData(new Date(222222))],
                [BooleanData.TRUE, BooleanData.FALSE],
                id
            );
            tableVals.statement.push([
                '1',
                '40',
                '1'
            ]);
            tableVals.statement.push([
                '2',
                '222222',
                '0'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            try {
                appendStatement(
                    [new DateData(new Date(11111)), new DateData(new Date(123))],
                    [BooleanData.TRUE],
                    id
                );
                return false;
            } catch (e) {
                if (e !== ErrorType.IllegalArgumentError) {
                    throw e;
                }
            }

            return true;
        }),
        new UnitTest('testAppendAttendance', (id) => {
            const tableVals = UnitTester.getEmptyTables();

            try {
                appendAttendance([], [], [], id);
                return false;
            } catch (e) {
                if (e !== ErrorType.IllegalArgumentError) {
                    throw e;
                }
            }

            appendAttendance(
                [new DateData(new Date(12321))],
                [new IntListData([new IntData(1), new IntData(5)])],
                [new QuarterData(Quarter.SPRING, new IntData(100))],
                id
            );
            tableVals.attendance.push([
                '0',
                '12321',
                '1,5',
                '401'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            appendAttendance(
                [new DateData(new Date(1)), new DateData(new Date(800800))],
                [new IntListData([]), new IntListData([new IntData(0), new IntData(7), new IntData(25)])],
                [new QuarterData(Quarter.FALL, new IntData(111)), new QuarterData(Quarter.WINTER, new IntData(1))],
                id
            );
            tableVals.attendance.push([
                '1',
                '1',
                '',
                '447'
            ]);
            tableVals.attendance.push([
                '2',
                '800800',
                '0,7,25',
                '4'
            ]);
            if (!checkDatabaseValues(tableVals, id)) return false;

            try {
                appendAttendance(
                    [new DateData(new Date(12321)), new DateData(new Date(123))],
                    [new IntListData([new IntData(1), new IntData(5)])],
                    [new QuarterData(Quarter.SPRING, new IntData(100))],
                    id
                );
                return false;
            } catch (e) {
                if (e !== ErrorType.IllegalArgumentError) {
                    throw e;
                }
            }

            return true;
        }),
        //Update, Remove, Handler, Get, Form Actions
    ];

    /** Hides constructor */
    private constructor() { }

    private static getEmptyTables() {
        return {
            member: [[
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
            ]],
            income: [[
                'id',
                'date',
                'amount',
                'description',
                'paymentTypeId',
                'statementId'
            ]],
            expense: [[
                'id',
                'date',
                'amount',
                'description',
                'paymentTypeId',
                'recipientId',
                'statementId'
            ]],
            recipient: [[
                'id',
                'name'
            ]],
            paymentType: [[
                'id',
                'name'
            ]],
            statement: [[
                'id',
                'date',
                'confirmed'
            ]],
            attendance: [[
                'id',
                'date',
                'memberIds',
                'quarterId'
            ]],
            clubInfo: [[
                'memberFee',
                'officerFee',
                'daysUntilFeeRequired',
                'currentQuarterId'
            ]]
        };
    }

    private static initializeTables(id: string) {
        const sheetapp = SpreadsheetApp.openById(id);

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
            ])
            .setFrozenRows(1);
        sheetapp
            .insertSheet('Income')
            .appendRow(['id', 'date', 'amount', 'description', 'paymentTypeId', 'statementId'])
            .setFrozenRows(1);
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
            ])
            .setFrozenRows(1);
        sheetapp.insertSheet('Recipient').appendRow(['id', 'name']).setFrozenRows(1);
        sheetapp.insertSheet('PaymentType').appendRow(['id', 'name']).setFrozenRows(1);
        sheetapp
            .insertSheet('Statement')
            .appendRow(['id', 'date', 'confirmed'])
            .setFrozenRows(1);
        sheetapp
            .insertSheet('Attendance')
            .appendRow(['id', 'date', 'memberIds', 'quarterId'])
            .setFrozenRows(1);
        sheetapp
            .insertSheet('ClubInfo')
            .appendRow([
                'memberFee',
                'officerFee',
                'daysUntilFeeRequired',
                'currentQuarterId'
            ]);

        sheetapp.deleteSheet(sheetapp.getSheetByName('Sheet1'));
    }

    public static runTests() {
        const id = SpreadsheetApp.create('Test Database').getId().toString();

        this.initializeTables(id);

        this.tests.forEach(test => {
            clearAllData(id);
            try {
                if (test.test(id)) {
                    // @ts-ignore Unable to find proper console.log
                    console.log(test.name + ' - Pass');
                } else {
                    // @ts-ignore Unable to find proper console.log
                    console.log(test.name + ' - Failure');
                }
            } catch (e) {
                // @ts-ignore Unable to find proper console.log
                console.log(test.name + ' - Error: ' + e);
            }
        });

        // @ts-ignore 'Drive.Files' is possibly undefined
        Drive.Files.remove(id);
    }
}