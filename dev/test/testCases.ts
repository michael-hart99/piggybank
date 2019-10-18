import { addExpense, addIncome, addMemberIOU, collectDues, confirmTransfer, nextQuarter, resolveMemberIOU, takeAttendance, transferFunds, updateContactSettings, updateMemberStatus } from '../forms/actions';
import { appendAttendance, appendExpense, appendIncome, appendMember, appendPaymentType, appendRecipient, appendStatement } from '../tables/append';
import { getAttendances, getClubInfo, getExpenses, getIncomes, getMemberIds, getMembers, getPaymentTypeIds, getPaymentTypes, getRecipientIds, getRecipients, getStatements } from '../tables/get';
import { BooleanData, DateData, ErrorType, IntData, IntListData, Quarter, QuarterData, StringData } from '../types';
import { arraysEqual, checkDatabaseValues, checkTableValues, fillWithData, getEmptyTableState, UnitTest, UnitTester, UnitTestSet } from './unitTester';

export function testAppendPartOne() {
    UnitTester.runTests([
        new UnitTestSet('testAppendMember', [
            new UnitTest('appendZero', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    appendMember([], [], [], [], [], [], [], [], [], [], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendUnevenData', (id: string) => {
                const tableVals = getEmptyTableState();

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
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

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

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

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
                    '0',
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
                    '1',
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

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

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
                    '45',
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

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

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
                    '45',
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
                    '46',
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

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testAppendIncome', [
            new UnitTest('appendZero', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    appendIncome([], [], [], [], [], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendUnevenData', (id: string) => {
                const tableVals = getEmptyTableState();

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
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

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
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                appendIncome(
                    [new DateData(new Date(334455)), new DateData(new Date(111223))],
                    [new IntData(0), new IntData(1000000)],
                    [new StringData('other test'), new StringData('Large sum')],
                    [new IntData(1), new IntData(99)],
                    [new IntData(0), new IntData(77)],
                    id
                );
                tableVals.income.push([
                    '0',
                    '334455',
                    '0',
                    'other test',
                    '1',
                    '0'
                ]);
                tableVals.income.push([
                    '1',
                    '111223',
                    '1000000',
                    'Large sum',
                    '99',
                    '77'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                appendIncome(
                    [new DateData(new Date(123456789))],
                    [new IntData(444)],
                    [new StringData('test')],
                    [new IntData(0)],
                    [new IntData(0)],
                    id
                );
                tableVals.income.push([
                    '373',
                    '123456789',
                    '444',
                    'test',
                    '0',
                    '0'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                appendIncome(
                    [new DateData(new Date(334455)), new DateData(new Date(111223))],
                    [new IntData(0), new IntData(1000000)],
                    [new StringData('other test'), new StringData('Large sum')],
                    [new IntData(1), new IntData(99)],
                    [new IntData(0), new IntData(77)],
                    id
                );
                tableVals.income.push([
                    '373',
                    '334455',
                    '0',
                    'other test',
                    '1',
                    '0'
                ]);
                tableVals.income.push([
                    '374',
                    '111223',
                    '1000000',
                    'Large sum',
                    '99',
                    '77'
                ]);
                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testAppendExpense', [
            new UnitTest('appendZero', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    appendExpense([], [], [], [], [], [], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendUnevenData', (id: string) => {
                const tableVals = getEmptyTableState();

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
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

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
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

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
                    '0',
                    '334455',
                    '0',
                    'other test',
                    '1',
                    '21',
                    '0'
                ]);
                tableVals.expense.push([
                    '1',
                    '111223',
                    '1000000',
                    'Large sum',
                    '99',
                    '12',
                    '77'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

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
                    '161',
                    '123456789',
                    '444',
                    'test',
                    '0',
                    '0',
                    '0'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

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
                    '161',
                    '334455',
                    '0',
                    'other test',
                    '1',
                    '21',
                    '0'
                ]);
                tableVals.expense.push([
                    '162',
                    '111223',
                    '1000000',
                    'Large sum',
                    '99',
                    '12',
                    '77'
                ]);
                return checkDatabaseValues(tableVals, id);
            })
        ])
    ]);
}
export function testAppendPartTwo() {
    UnitTester.runTests([
        new UnitTestSet('testAppendRecipient', [
            new UnitTest('appendZero', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    appendRecipient([], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                appendRecipient(
                    [new StringData('Recipient 1')],
                    id
                );
                tableVals.recipient.push([
                    '0',
                    'Recipient 1'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                appendRecipient(
                    [new StringData('costco'), new StringData('this is a recipient')],
                    id
                );
                tableVals.recipient.push([
                    '0',
                    'costco'
                ]);
                tableVals.recipient.push([
                    '1',
                    'this is a recipient'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                appendRecipient(
                    [new StringData('Recipient 1')],
                    id
                );
                tableVals.recipient.push([
                    '58',
                    'Recipient 1'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                appendRecipient(
                    [new StringData('costco'), new StringData('this is a recipient')],
                    id
                );
                tableVals.recipient.push([
                    '58',
                    'costco'
                ]);
                tableVals.recipient.push([
                    '59',
                    'this is a recipient'
                ]);
                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testAppendPaymentType', [
            new UnitTest('appendZero', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    appendPaymentType([], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                appendPaymentType(
                    [new StringData('Pay type 1')],
                    id
                );
                tableVals.paymentType.push([
                    '0',
                    'Pay type 1'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                appendPaymentType(
                    [new StringData('cash'), new StringData('asdfasdf')],
                    id
                );
                tableVals.paymentType.push([
                    '0',
                    'cash'
                ]);
                tableVals.paymentType.push([
                    '1',
                    'asdfasdf'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                appendPaymentType(
                    [new StringData('Pay type 1')],
                    id
                );
                tableVals.paymentType.push([
                    '7',
                    'Pay type 1'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                appendPaymentType(
                    [new StringData('cash'), new StringData('asdfasdf')],
                    id
                );
                tableVals.paymentType.push([
                    '7',
                    'cash'
                ]);
                tableVals.paymentType.push([
                    '8',
                    'asdfasdf'
                ]);
                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testAppendStatement', [
            new UnitTest('appendZero', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    appendStatement([], [], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendUnevenData', (id: string) => {
                const tableVals = getEmptyTableState();

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
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

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
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                appendStatement(
                    [new DateData(new Date(40)), new DateData(new Date(222222))],
                    [BooleanData.TRUE, BooleanData.FALSE],
                    id
                );
                tableVals.statement.push([
                    '0',
                    '40',
                    '1'
                ]);
                tableVals.statement.push([
                    '1',
                    '222222',
                    '0'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                appendStatement(
                    [new DateData(new Date(11111))],
                    [BooleanData.TRUE],
                    id
                );
                tableVals.statement.push([
                    '223',
                    '11111',
                    '1'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                appendStatement(
                    [new DateData(new Date(40)), new DateData(new Date(222222))],
                    [BooleanData.TRUE, BooleanData.FALSE],
                    id
                );
                tableVals.statement.push([
                    '223',
                    '40',
                    '1'
                ]);
                tableVals.statement.push([
                    '224',
                    '222222',
                    '0'
                ]);
                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testAppendAttendance', [
            new UnitTest('appendZero', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    appendAttendance([], [], [], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendUnevenData', (id: string) => {
                const tableVals = getEmptyTableState();

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

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

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
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                appendAttendance(
                    [new DateData(new Date(1)), new DateData(new Date(800800))],
                    [new IntListData([]), new IntListData([new IntData(0), new IntData(7), new IntData(25)])],
                    [new QuarterData(Quarter.FALL, new IntData(111)), new QuarterData(Quarter.WINTER, new IntData(1))],
                    id
                );
                tableVals.attendance.push([
                    '0',
                    '1',
                    '',
                    '447'
                ]);
                tableVals.attendance.push([
                    '1',
                    '800800',
                    '0,7,25',
                    '4'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendOneToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                appendAttendance(
                    [new DateData(new Date(12321))],
                    [new IntListData([new IntData(1), new IntData(5)])],
                    [new QuarterData(Quarter.SPRING, new IntData(100))],
                    id
                );
                tableVals.attendance.push([
                    '50',
                    '12321',
                    '1,5',
                    '401'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('appendTwoToNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                appendAttendance(
                    [new DateData(new Date(1)), new DateData(new Date(800800))],
                    [new IntListData([]), new IntListData([new IntData(0), new IntData(7), new IntData(25)])],
                    [new QuarterData(Quarter.FALL, new IntData(111)), new QuarterData(Quarter.WINTER, new IntData(1))],
                    id
                );
                tableVals.attendance.push([
                    '50',
                    '1',
                    '',
                    '447'
                ]);
                tableVals.attendance.push([
                    '51',
                    '800800',
                    '0,7,25',
                    '4'
                ]);
                return checkDatabaseValues(tableVals, id);
            }),
        ])
    ]);
}
export function testGet() {
    UnitTester.runTests([
        new UnitTestSet('testGetMembers', [
            new UnitTest('empty', (id: string) => {
                const tableVals = getEmptyTableState();

                tableVals.member = tableVals.member.slice(0, 1).concat(
                    getMembers(id).map(entry => entry.toArray())
                );

                return checkTableValues('Member', tableVals.member, id);
            }),
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id)

                tableVals.member = tableVals.member.slice(0, 1).concat(
                    getMembers(id).map(entry => entry.toArray())
                );

                return checkTableValues('Member', tableVals.member, id);
            })
        ]),
        new UnitTestSet('testGetIncome', [
            new UnitTest('empty', (id: string) => {
                const tableVals = getEmptyTableState();

                tableVals.income = tableVals.income.slice(0, 1).concat(
                    getIncomes(id).map(entry => entry.toArray())
                );

                return checkTableValues('Income', tableVals.income, id);
            }),
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id)

                tableVals.income = tableVals.income.slice(0, 1).concat(
                    getIncomes(id).map(entry => entry.toArray())
                );

                return checkTableValues('Income', tableVals.income, id);
            })
        ]),
        new UnitTestSet('testGetExpense', [
            new UnitTest('empty', (id: string) => {
                const tableVals = getEmptyTableState();

                tableVals.expense = tableVals.expense.slice(0, 1).concat(
                    getExpenses(id).map(entry => entry.toArray())
                );

                return checkTableValues('Expense', tableVals.expense, id);
            }),
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id)

                tableVals.expense = tableVals.expense.slice(0, 1).concat(
                    getExpenses(id).map(entry => entry.toArray())
                );

                return checkTableValues('Expense', tableVals.expense, id);
            })
        ]),
        new UnitTestSet('testGetRecipient', [
            new UnitTest('empty', (id: string) => {
                const tableVals = getEmptyTableState();

                tableVals.recipient = tableVals.recipient.slice(0, 1).concat(
                    getRecipients(id).map(entry => entry.toArray())
                );

                return checkTableValues('Recipient', tableVals.recipient, id);
            }),
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id)

                tableVals.recipient = tableVals.recipient.slice(0, 1).concat(
                    getRecipients(id).map(entry => entry.toArray())
                );

                return checkTableValues('Recipient', tableVals.recipient, id);
            })
        ]),
        new UnitTestSet('testGetPaymentType', [
            new UnitTest('empty', (id: string) => {
                const tableVals = getEmptyTableState();

                tableVals.paymentType = tableVals.paymentType.slice(0, 1).concat(
                    getPaymentTypes(id).map(entry => entry.toArray())
                );

                return checkTableValues('PaymentType', tableVals.paymentType, id);
            }),
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id)

                tableVals.paymentType = tableVals.paymentType.slice(0, 1).concat(
                    getPaymentTypes(id).map(entry => entry.toArray())
                );

                return checkTableValues('PaymentType', tableVals.paymentType, id);
            })
        ]),
        new UnitTestSet('testGetStatement', [
            new UnitTest('empty', (id: string) => {
                const tableVals = getEmptyTableState();

                tableVals.statement = tableVals.statement.slice(0, 1).concat(
                    getStatements(id).map(entry => entry.toArray())
                );

                return checkTableValues('Statement', tableVals.statement, id);
            }),
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id)

                tableVals.statement = tableVals.statement.slice(0, 1).concat(
                    getStatements(id).map(entry => entry.toArray())
                );

                return checkTableValues('Statement', tableVals.statement, id);
            })
        ]),
        new UnitTestSet('testGetAttendance', [
            new UnitTest('empty', (id: string) => {
                const tableVals = getEmptyTableState();

                tableVals.attendance = tableVals.attendance.slice(0, 1).concat(
                    getAttendances(id).map(entry => entry.toArray())
                );

                return checkTableValues('Attendance', tableVals.attendance, id);
            }),
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id)

                tableVals.attendance = tableVals.attendance.slice(0, 1).concat(
                    getAttendances(id).map(entry => entry.toArray())
                );

                return checkTableValues('Attendance', tableVals.attendance, id);
            })
        ]),
        new UnitTestSet('testGetClubInfo', [
            new UnitTest('empty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    getClubInfo(id);
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }

                return checkTableValues('ClubInfo', tableVals.clubInfo, id);
            }),
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id)

                tableVals.clubInfo = tableVals.clubInfo.slice(0, 1).concat(
                    [getClubInfo(id).toArray()]
                );

                return checkTableValues('ClubInfo', tableVals.clubInfo, id);
            })
        ]),
        new UnitTestSet('testGetMemberIds', [
            new UnitTest('emptyParam', (id: string) => {
                try {
                    getMemberIds([], id);
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }

                return true;
            }),
            new UnitTest('emptyNoMatch', (id: string) => {
                try {
                    getMemberIds([new StringData('missing boy')], id);
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return true;
            }),
            new UnitTest('nonEmptyMatch', (id: string) => {
                fillWithData(id);

                const ids = getMemberIds([
                    new StringData('malachi keenan'),
                    new StringData('huey wilkins'),
                    new StringData('chris freeman'),
                    new StringData('shannen bryan'),
                    new StringData('ava-mae wicks'),
                ], id);

                return arraysEqual(['1', '10', '8', '9', '3'], ids.map(n => n.toString()));
            }),
            new UnitTest('nonEmptyNoMatch', (id: string) => {
                fillWithData(id);

                try {
                    getMemberIds([new StringData('malachi keenan'), new StringData('another missing boy')], id);
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return true;
            })
        ]),
        new UnitTestSet('testGetRecipientIds', [
            new UnitTest('emptyParam', (id: string) => {
                try {
                    getRecipientIds([], id);
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }

                return true;
            }),
            new UnitTest('emptyNoMatch', (id: string) => {
                try {
                    getRecipientIds([new StringData('missing value')], id);
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return true;
            }),
            new UnitTest('nonEmptyMatch', (id: string) => {
                fillWithData(id);

                const ids = getRecipientIds([
                    new StringData('amazon'),
                    new StringData('costco'),
                    new StringData('microsoft'),
                    new StringData('mercer'),
                    new StringData('madewell')
                ], id);

                return arraysEqual(['1', '0', '14', '12', '6'], ids.map(n => n.toString()));
            }),
            new UnitTest('nonEmptyNoMatch', (id: string) => {
                fillWithData(id);

                try {
                    getRecipientIds([new StringData('costco'), new StringData('another missing value')], id);
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return true;
            })
        ]),
        new UnitTestSet('testGetPaymentTypeIds', [
            new UnitTest('emptyParam', (id: string) => {
                try {
                    getPaymentTypeIds([], id);
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }

                return true;
            }),
            new UnitTest('emptyNoMatch', (id: string) => {
                try {
                    getPaymentTypeIds([new StringData('missing value')], id);
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return true;
            }),
            new UnitTest('nonEmptyMatch', (id: string) => {
                fillWithData(id);

                const ids = getPaymentTypeIds([
                    new StringData('debit'),
                    new StringData('venmo'),
                    new StringData('cash'),
                    new StringData('check')
                ], id);

                return arraysEqual(['6', '4', '0', '1'], ids.map(n => n.toString()));
            }),
            new UnitTest('nonEmptyNoMatch', (id: string) => {
                fillWithData(id);

                try {
                    getPaymentTypeIds([new StringData('debit'), new StringData('another missing value')], id);
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return true;
            })
        ]),
    ]);
}
export function testFormActionsPartOne() {
    UnitTester.runTests([
        new UnitTestSet('addExpense', [
            new UnitTest('newRecipientAndPayType', (id: string) => {
                const tableVals = getEmptyTableState();

                addExpense('1.16', 'this is a description', ' A New Recipient ', 'a payment type   ', id);
                const expenses = getExpenses(id);
                const expenseDate = expenses[expenses.length - 1].date;
                if (!expenseDate) throw ErrorType.AssertionError;

                tableVals.expense.push(['0', expenseDate.toString(), '116', 'this is a description', '0', '0', '-1']);
                tableVals.recipient.push(['0', 'a new recipient']);
                tableVals.paymentType.push(['0', 'a payment type']);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('newRecipient', (id: string) => {
                const tableVals = fillWithData(id);

                addExpense('10.99', 'A Description', 'A New Recipient', 'Venmo', id);
                const expenses = getExpenses(id);
                const expenseDate = expenses[expenses.length - 1].date;
                if (!expenseDate) throw ErrorType.AssertionError;

                tableVals.expense.push(['161', expenseDate.toString(), '1099', 'A Description', '4', '58', '-1']);
                tableVals.recipient.push(['58', 'a new recipient']);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('newPayType', (id: string) => {
                const tableVals = fillWithData(id);

                addExpense('69.69', 'New Shoes', 'Trader Joes', 'new paytype', id);
                const expenses = getExpenses(id);
                const expenseDate = expenses[expenses.length - 1].date;
                if (!expenseDate) throw ErrorType.AssertionError;

                tableVals.expense.push(['161', expenseDate.toString(), '6969', 'New Shoes', '7', '57', '-1']);
                tableVals.paymentType.push(['7', 'new paytype']);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('existingPayTypeAndRecipient', (id: string) => {
                const tableVals = fillWithData(id);

                addExpense('100', 'Bought things', '  Menchie\'s  ', 'cash   ', id);
                const expenses = getExpenses(id);
                const expenseDate = expenses[expenses.length - 1].date;
                if (!expenseDate) throw ErrorType.AssertionError;

                tableVals.expense.push(['161', expenseDate.toString(), '10000', 'Bought things', '0', '11', '-1']);

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('addIncome', [
            new UnitTest('newPayType', (id: string) => {
                const tableVals = fillWithData(id);

                addIncome('69.69', 'New Shoes', 'new paytype', id);
                const incomes = getIncomes(id);
                const incomeDate = incomes[incomes.length - 1].date;
                if (!incomeDate) throw ErrorType.AssertionError;

                tableVals.income.push(['373', incomeDate.toString(), '6969', 'New Shoes', '7', '-1']);
                tableVals.paymentType.push(['7', 'new paytype']);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('existingPayType', (id: string) => {
                const tableVals = fillWithData(id);

                addIncome('100', 'Bought things', 'cash   ', id);
                const incomes = getIncomes(id);
                const incomeDate = incomes[incomes.length - 1].date;
                if (!incomeDate) throw ErrorType.AssertionError;

                tableVals.income.push(['373', incomeDate.toString(), '10000', 'Bought things', '0', '-1']);

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('addMemberIOU', [
            new UnitTest('single', (id: string) => {
                const tableVals = fillWithData(id);

                addMemberIOU(['Orson Vang: -$14.20'], '14.20', 'A couple of ding dongs', id);
                tableVals.member[6][3] = '1420';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('double', (id: string) => {
                const tableVals = fillWithData(id);

                addMemberIOU(['Desiree Rudd: $40.00', 'Vikram Townsend: $0.00'], '67', 'More things to do', id);
                tableVals.member[27][3] = '6700';
                tableVals.member[33][3] = '6700';

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('collectDues', [
            new UnitTest('single', (id: string) => {
                const tableVals = fillWithData(id);

                collectDues(['Malachi Keenan: $500.00'], 'cash', id);
                const incomes = getIncomes(id);
                const incomeDate = incomes[incomes.length - 1].date;
                if (!incomeDate) throw ErrorType.AssertionError;

                tableVals.member[2][8] = '1';
                tableVals.income.push(['373', incomeDate.toString(), '50000', 'Malachi Keenan, dues for Spring 2019', '0', '-1']);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('double', (id: string) => {
                const tableVals = fillWithData(id);

                collectDues(['Skyla Robbins: $2.00', 'Huey Wilkins: $500.00'], 'Venmo', id);
                const incomes = getIncomes(id);
                const incomeDate = incomes[incomes.length - 1].date;
                if (!incomeDate) throw ErrorType.AssertionError;

                tableVals.member[40][8] = '1';
                tableVals.member[11][8] = '1';
                tableVals.income.push(['373', incomeDate.toString(), '200', 'Skyla Robbins, dues for Spring 2019', '4', '-1']);
                tableVals.income.push(['374', incomeDate.toString(), '50000', 'Huey Wilkins, dues for Spring 2019', '4', '-1']);

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('confirmTransfer', [
            new UnitTest('single', (id: string) => {
                const tableVals = fillWithData(id);

                confirmTransfer(['Jul 21, 2019, $20.00 Cash [10]'], id);
                tableVals.statement[11][2] = '1';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('double', (id: string) => {
                const tableVals = fillWithData(id);

                confirmTransfer(['Jan 10, 2019, $14.14 Cash [15]', 'Aug 01, 2019, $20.00 Cash [10]'], id);
                tableVals.statement[16][2] = '1';
                tableVals.statement[11][2] = '1';

                return checkDatabaseValues(tableVals, id);
            })
        ]),
    ]);
}
export function testFormActionsPartTwo() {
    UnitTester.runTests([
        new UnitTestSet('nextQuarter', [
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                nextQuarter(id);
                tableVals.clubInfo[1][3] = '8078';
                tableVals.member.slice(1).forEach(row => row[8] = '0');

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('resolveMemberIOU', [
            new UnitTest('single', (id: string) => {
                const tableVals = fillWithData(id);

                resolveMemberIOU(['Tarik Santos: $44.00'], '99', 'Hot cheetos', 'Debit', id);
                const incomes = getIncomes(id);
                const incomeDate = incomes[incomes.length - 1].date;
                if (!incomeDate) throw ErrorType.AssertionError;

                tableVals.member[5][3] = '-9900';
                tableVals.income.push(['373', incomeDate.toString(), '9900', 'Tarik Santos Hot cheetos (debt)', '6', '-1']);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('double', (id: string) => {
                const tableVals = fillWithData(id);

                resolveMemberIOU(['Esha Ritter: $500.00', 'Jayden-james Short: $44.44'], '2.50', 'New bananas', 'Cash', id);
                const incomes = getIncomes(id);
                const incomeDate = incomes[incomes.length - 1].date;
                if (!incomeDate) throw ErrorType.AssertionError;

                tableVals.member[41][3] = '-250';
                tableVals.member[43][3] = '-250';
                tableVals.income.push(['373', incomeDate.toString(), '250', 'Esha Ritter New bananas (debt)', '0', '-1']);
                tableVals.income.push(['374', incomeDate.toString(), '250', 'Jayden-james Short New bananas (debt)', '0', '-1']);

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('takeAttendance', [
            new UnitTest('blank', (id: string) => {
                const tableVals = getEmptyTableState();

                takeAttendance(undefined, undefined, id);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('noNewNames', (id: string) => {
                const tableVals = fillWithData(id);

                takeAttendance(['elvis vinson', 'esme frame'], undefined, id);
                const attendance = getAttendances(id);
                const attendanceDate = attendance[attendance.length - 1].date;
                if (!attendanceDate) throw ErrorType.AssertionError;

                tableVals.attendance.push(['50', attendanceDate.toString(), '16,17', '8077']);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('onlyNewNames', (id: string) => {
                const tableVals = fillWithData(id);

                takeAttendance(undefined, ' Porko Rosso', id);
                const attendance = getAttendances(id);
                const attendanceDate = attendance[attendance.length - 1].date;
                if (!attendanceDate) throw ErrorType.AssertionError;
                const members = getMembers(id);
                const memberDate = members[members.length - 1].dateJoined;
                if (!memberDate) throw ErrorType.AssertionError;

                tableVals.member.push(['45', 'porko rosso', memberDate.toString(), '0', '', '0', '1', '0', '0', '0', '0']);
                tableVals.attendance.push(['50', attendanceDate.toString(), '45', '8077']);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('newAndOldNames', (id: string) => {
                const tableVals = fillWithData(id);

                takeAttendance(['elvis vinson'], ' Mark rubio\n  \n\n sir Fetchd  \n', id);
                const attendance = getAttendances(id);
                const attendanceDate = attendance[attendance.length - 1].date;
                if (!attendanceDate) throw ErrorType.AssertionError;
                const members = getMembers(id);
                const membersDate = members[members.length - 1].dateJoined;
                if (!membersDate) throw ErrorType.AssertionError;

                tableVals.member.push(['45', 'mark rubio', membersDate.toString(), '0', '', '0', '1', '0', '0', '0', '0']);
                tableVals.member.push(['46', 'sir fetchd', membersDate.toString(), '0', '', '0', '1', '0', '0', '0', '0']);
                tableVals.attendance.push(['50', attendanceDate.toString(), '17,45,46', '8077']);

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('transferFunds', [
            new UnitTest('blank', (id: string) => {
                const tableVals = fillWithData(id);

                transferFunds(undefined, undefined, id);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('onlyIncome', (id: string) => {
                const tableVals = fillWithData(id);

                transferFunds(['$22.22 Cash [0]'], undefined, id);
                const statements = getStatements(id);
                const statementDate = statements[statements.length - 1].date;
                if (!statementDate) throw ErrorType.AssertionError;

                tableVals.statement.push(['223', statementDate.toString(), '0']);
                tableVals.income[1][5] = '223';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('onlyExpense', (id: string) => {
                const tableVals = fillWithData(id);

                transferFunds(undefined, ['-$30.00 Venmo [5]', '-$100.99 Cash [10]'], id);
                const statements = getStatements(id);
                const statementDate = statements[statements.length - 1].date;
                if (!statementDate) throw ErrorType.AssertionError;

                tableVals.statement.push(['223', statementDate.toString(), '0']);
                tableVals.expense[6][6] = '223';
                tableVals.expense[11][6] = '223';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('bothIncomeAndExpense', (id: string) => {
                const tableVals = fillWithData(id);

                transferFunds(['$10.00 Venmo [0]', '$0.99 Cash [20]'], ['-$30.00 Venmo [5]'], id);
                const statements = getStatements(id);
                const statementDate = statements[statements.length - 1].date;
                if (!statementDate) throw ErrorType.AssertionError;

                tableVals.statement.push(['223', statementDate.toString(), '0']);
                tableVals.income[1][5] = '223';
                tableVals.income[21][5] = '223';
                tableVals.expense[6][6] = '223';

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('updateContactSettings', [
            new UnitTest('phone', (id: string) => {
                const tableVals = fillWithData(id);

                updateContactSettings('Carina Mckee', undefined, '2456667898', 'Verizon', 'No', 'Yes', id);
                tableVals.member[13][4] = '2456667898@vtext.com';
                tableVals.member[13][9] = '0';
                tableVals.member[13][10] = '1';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('email', (id: string) => {
                const tableVals = fillWithData(id);

                updateContactSettings('kaci mcdermott', 'myemail@email.mail', undefined, undefined, undefined, undefined, id);
                tableVals.member[31][4] = 'myemail@email.mail';

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('updateMemberStatus', [
            new UnitTest('single', (id: string) => {
                const tableVals = fillWithData(id);

                updateMemberStatus(['Ava-Mae Wicks'], 'Yes', undefined, 'Yes', id);
                tableVals.member[4][5] = '1';
                tableVals.member[4][7] = '1';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('double', (id: string) => {
                const tableVals = fillWithData(id);

                updateMemberStatus(['elvis vinson', 'imaad oneal'], undefined, 'Yes', undefined, id);
                tableVals.member[18][6] = '1';
                tableVals.member[19][6] = '1';

                return checkDatabaseValues(tableVals, id);
            })
        ])
    ]);
}
export function testUpdate() {
    UnitTester.runTests([
        new UnitTestSet('', [
            new UnitTest('', (id: string) => {
                const tableVals = getEmptyTableState();
                return checkDatabaseValues(tableVals, id);
            })
        ])
    ]);
}
export function testRemove() {
    UnitTester.runTests([
        new UnitTestSet('', [
            new UnitTest('', (id: string) => {
                const tableVals = getEmptyTableState();
                return checkDatabaseValues(tableVals, id);
            })
        ])
    ]);
}
export function testMenuHandlers() {
    UnitTester.runTests([
        new UnitTestSet('', [
            new UnitTest('', (id: string) => {
                const tableVals = getEmptyTableState();
                return checkDatabaseValues(tableVals, id);
            })
        ])
    ]);
}