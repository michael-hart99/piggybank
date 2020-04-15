import { addExpense, addIncome, addMemberIOU, collectDues, confirmTransfer, nextQuarter, resolveMemberIOU, takeAttendance, transferFunds, updateContactSettings, updateMemberStatus } from '../forms/actions';
import { appendAttendance, appendExpense, appendIncome, appendMember, appendPaymentType, appendRecipient, appendStatement } from '../tables/append';
import { getAttendances, getClubInfo, getExpenses, getIncomes, getMemberIds, getMembers, getPaymentTypeIds, getPaymentTypes, getRecipientIds, getRecipients, getStatements } from '../tables/get';
import { removeAttendance, removeExpense, removeIncome, removeMember, removePaymentType, removeRecipient, removeStatement } from '../tables/remove';
import { updateAttendance, updateClubInfo, updateExpense, updateIncome, updateMember, updatePaymentType, updateRecipient, updateStatement } from '../tables/update';
import { BooleanData, DateData, ErrorType, IntData, IntListData, Quarter, QuarterData, StringData } from '../types';
import { menuAddAttendance, menuAddExpense, menuAddIncome, menuAddMember, menuAddPayType, menuAddRecipient, menuAddStatement, mergeMember, mergePaymentType, mergeRecipient, renameMember, renamePaymentType, renameRecipient } from '../views/handlers';
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
export function testUpdatePartOne() {
    UnitTester.runTests([
        new UnitTestSet('testUpdateMember', [
            new UnitTest('emptyUpdate', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateMember([], [], [], [], [], [], [], [], [], [], [], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('emptyUndefinedUpdate', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateMember([], undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateUnevenData', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateMember(
                        [new IntData(0), new IntData(1)],
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
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateMember(
                        [new IntData(0)],
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
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    updateMember(
                        [new IntData(50)],
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
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateOnePartialFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateMember(
                    [new IntData(10)],
                    [new StringData('abc')],
                    [new DateData(new Date(123))],
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    id
                );
                tableVals.member[11][1] = 'abc';
                tableVals.member[11][2] = '123';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateOneAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateMember(
                    [new IntData(10)],
                    [new StringData('abc')],
                    [new DateData(new Date(123))],
                    [new IntData(100)],
                    [new StringData('email@email.com')],
                    [new BooleanData(false)],
                    [new BooleanData(true)],
                    [new BooleanData(false)],
                    [new BooleanData(true)],
                    [new BooleanData(false)],
                    [new BooleanData(true)],
                    id
                );
                tableVals.member[11] = [
                    '10',
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
                ];

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateTwoPartialFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateMember(
                    [new IntData(10), new IntData(15)],
                    [new StringData('abc'), new StringData('xyz')],
                    [new DateData(new Date(123)), new DateData(new Date(789))],
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    id
                );

                tableVals.member[11][1] = 'abc';
                tableVals.member[11][2] = '123';

                tableVals.member[16][1] = 'xyz';
                tableVals.member[16][2] = '789';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateTwoAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateMember(
                    [new IntData(10), new IntData(15)],
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
                tableVals.member[11] = [
                    '10',
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
                ];
                tableVals.member[16] = [
                    '15',
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
                ];

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
        new UnitTestSet('testUpdateIncome', [
            new UnitTest('emptyUpdate', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateIncome([], [], [], [], [], [], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('emptyUndefinedUpdate', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateIncome([], undefined, undefined, undefined, undefined, undefined, id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateUnevenData', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateIncome(
                        [new IntData(0), new IntData(1)],
                        [new DateData(new Date(123456789))],
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
            new UnitTest('updateNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateIncome(
                        [new IntData(0)],
                        [new DateData(new Date(123456789))],
                        [new IntData(444)],
                        [new StringData('test')],
                        [new IntData(0)],
                        [new IntData(0)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    updateIncome(
                        [new IntData(400)],
                        [new DateData(new Date(123456789))],
                        [new IntData(444)],
                        [new StringData('test')],
                        [new IntData(0)],
                        [new IntData(0)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateOnePartialFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateIncome(
                    [new IntData(10)],
                    [new DateData(new Date(334455))],
                    [new IntData(0)],
                    undefined,
                    undefined,
                    undefined,
                    id
                );

                tableVals.income[11][1] = '334455';
                tableVals.income[11][2] = '0';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateOneAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateIncome(
                    [new IntData(10)],
                    [new DateData(new Date(334455))],
                    [new IntData(0)],
                    [new StringData('other test')],
                    [new IntData(1)],
                    [new IntData(0)],
                    id
                );
                tableVals.income[11] = [
                    '10',
                    '334455',
                    '0',
                    'other test',
                    '1',
                    '0'
                ];

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateTwoPartialFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateIncome(
                    [new IntData(10), new IntData(15)],
                    [new DateData(new Date(334455)), new DateData(new Date(111223))],
                    [new IntData(0), new IntData(1000000)],
                    undefined,
                    undefined,
                    undefined,
                    id
                );

                tableVals.income[11][1] = '334455';
                tableVals.income[11][2] = '0';

                tableVals.income[16][1] = '111223';
                tableVals.income[16][2] = '1000000';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateTwoAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateIncome(
                    [new IntData(10), new IntData(15)],
                    [new DateData(new Date(334455)), new DateData(new Date(111223))],
                    [new IntData(0), new IntData(1000000)],
                    [new StringData('other test'), new StringData('Large sum')],
                    [new IntData(1), new IntData(99)],
                    [new IntData(0), new IntData(77)],
                    id
                );
                tableVals.income[11] = [
                    '10',
                    '334455',
                    '0',
                    'other test',
                    '1',
                    '0'
                ];
                tableVals.income[16] = [
                    '15',
                    '111223',
                    '1000000',
                    'Large sum',
                    '99',
                    '77'
                ];

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
        new UnitTestSet('testUpdateExpense', [
            new UnitTest('emptyUpdate', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateExpense([], [], [], [], [], [], [], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('emptyUndefinedUpdate', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateExpense([], undefined, undefined, undefined, undefined, undefined, undefined, id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateUnevenData', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateExpense(
                        [new IntData(0), new IntData(1)],
                        [new DateData(new Date(123456789))],
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
            new UnitTest('updateNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateExpense(
                        [new IntData(0)],
                        [new DateData(new Date(123456789))],
                        [new IntData(444)],
                        [new StringData('test')],
                        [new IntData(0)],
                        [new IntData(0)],
                        [new IntData(0)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    updateExpense(
                        [new IntData(200)],
                        [new DateData(new Date(123456789))],
                        [new IntData(444)],
                        [new StringData('test')],
                        [new IntData(0)],
                        [new IntData(0)],
                        [new IntData(0)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateOnePartialFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateExpense(
                    [new IntData(10)],
                    [new DateData(new Date(334455))],
                    [new IntData(0)],
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    id
                );

                tableVals.expense[11][1] = '334455';
                tableVals.expense[11][2] = '0';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateOneAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateExpense(
                    [new IntData(10)],
                    [new DateData(new Date(334455))],
                    [new IntData(0)],
                    [new StringData('other test')],
                    [new IntData(1)],
                    [new IntData(0)],
                    [new IntData(0)],
                    id
                );
                tableVals.expense[11] = [
                    '10',
                    '334455',
                    '0',
                    'other test',
                    '1',
                    '0',
                    '0'
                ];

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateTwoPartialFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateExpense(
                    [new IntData(10), new IntData(15)],
                    [new DateData(new Date(334455)), new DateData(new Date(111223))],
                    [new IntData(0), new IntData(1000000)],
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    id
                );

                tableVals.expense[11][1] = '334455';
                tableVals.expense[11][2] = '0';

                tableVals.expense[16][1] = '111223';
                tableVals.expense[16][2] = '1000000';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateTwoAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateExpense(
                    [new IntData(10), new IntData(15)],
                    [new DateData(new Date(334455)), new DateData(new Date(111223))],
                    [new IntData(0), new IntData(1000000)],
                    [new StringData('other test'), new StringData('Large sum')],
                    [new IntData(1), new IntData(99)],
                    [new IntData(0), new IntData(77)],
                    [new IntData(0), new IntData(77)],
                    id
                );
                tableVals.expense[11] = [
                    '10',
                    '334455',
                    '0',
                    'other test',
                    '1',
                    '0',
                    '0'
                ];
                tableVals.expense[16] = [
                    '15',
                    '111223',
                    '1000000',
                    'Large sum',
                    '99',
                    '77',
                    '77'
                ];

                return checkDatabaseValues(tableVals, id);
            }),
        ])
    ]);
}
export function testUpdatePartTwo() {
    UnitTester.runTests([
        new UnitTestSet('testUpdateRecipient', [
            new UnitTest('emptyUpdate', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateRecipient([], [], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateUnevenData', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateRecipient(
                        [new IntData(0), new IntData(1)],
                        [new StringData('test')],
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
            new UnitTest('updateNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateRecipient(
                        [new IntData(0)],
                        [new StringData('test')],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    updateRecipient(
                        [new IntData(100)],
                        [new StringData('test')],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateOneAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateRecipient(
                    [new IntData(10)],
                    [new StringData('costco')],
                    id
                );

                tableVals.recipient[11][1] = 'costco';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateTwoAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateRecipient(
                    [new IntData(10), new IntData(15)],
                    [new StringData('costco'), new StringData('this is a recipient')],
                    id
                );

                tableVals.recipient[11][1] = 'costco';
                tableVals.recipient[16][1] = 'this is a recipient';

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
        new UnitTestSet('testUpdatePaymentType', [
            new UnitTest('emptyUpdate', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updatePaymentType([], [], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateUnevenData', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updatePaymentType(
                        [new IntData(0), new IntData(1)],
                        [new StringData('test')],
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
            new UnitTest('updateNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updatePaymentType(
                        [new IntData(0)],
                        [new StringData('test')],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    updatePaymentType(
                        [new IntData(10)],
                        [new StringData('test')],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateOneAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updatePaymentType(
                    [new IntData(1)],
                    [new StringData('xxxxx')],
                    id
                );

                tableVals.paymentType[2][1] = 'xxxxx';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateTwoAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updatePaymentType(
                    [new IntData(1), new IntData(6)],
                    [new StringData('xxxxx'), new StringData('yyy')],
                    id
                );

                tableVals.paymentType[2][1] = 'xxxxx';
                tableVals.paymentType[4][1] = 'yyy';

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
        new UnitTestSet('testUpdateStatement', [
            new UnitTest('emptyUpdate', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateStatement([], [], [], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('emptyUndefinedUpdate', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateStatement([], undefined, undefined, id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateUnevenData', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateStatement(
                        [new IntData(10), new IntData(15)],
                        [new DateData(new Date(40))],
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
            new UnitTest('updateNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateStatement(
                        [new IntData(0)],
                        [new DateData(new Date(40))],
                        [BooleanData.TRUE],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    updateStatement(
                        [new IntData(250)],
                        [new DateData(new Date(40))],
                        [BooleanData.TRUE],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateOnePartialFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateStatement(
                    [new IntData(10)],
                    [new DateData(new Date(40))],
                    undefined,
                    id
                );

                tableVals.statement[11][1] = '40';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateOneAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateStatement(
                    [new IntData(10)],
                    [new DateData(new Date(40))],
                    [BooleanData.TRUE],
                    id
                );
                tableVals.statement[11] = [
                    '10',
                    '40',
                    '1'
                ];

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateTwoPartialFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateStatement(
                    [new IntData(10), new IntData(15)],
                    [new DateData(new Date(40)), new DateData(new Date(222222))],
                    undefined,
                    id
                );

                tableVals.statement[11][1] = '40';

                tableVals.statement[16][1] = '222222';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateTwoAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateStatement(
                    [new IntData(10), new IntData(15)],
                    [new DateData(new Date(40)), new DateData(new Date(222222))],
                    [BooleanData.TRUE, BooleanData.FALSE],
                    id
                );
                tableVals.statement[11] = [
                    '10',
                    '40',
                    '1'
                ];
                tableVals.statement[16] = [
                    '15',
                    '222222',
                    '0'
                ];

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
        new UnitTestSet('testUpdateAttendance', [
            new UnitTest('emptyUpdate', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateAttendance([], [], [], [], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('emptyUndefinedUpdate', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateAttendance([], undefined, undefined, undefined, id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateUnevenData', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateAttendance(
                        [new IntData(10), new IntData(15)],
                        [new DateData(new Date(12321))],
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
            new UnitTest('updateNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    updateAttendance(
                        [new IntData(0)],
                        [new DateData(new Date(12321))],
                        [new IntListData([new IntData(1), new IntData(5)])],
                        [new QuarterData(Quarter.SPRING, new IntData(100))],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    updateAttendance(
                        [new IntData(100)],
                        [new DateData(new Date(12321))],
                        [new IntListData([new IntData(1), new IntData(5)])],
                        [new QuarterData(Quarter.SPRING, new IntData(100))],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateOnePartialFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateAttendance(
                    [new IntData(10)],
                    [new DateData(new Date(1))],
                    undefined,
                    undefined,
                    id
                );

                tableVals.attendance[11][1] = '1';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateOneAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateAttendance(
                    [new IntData(10)],
                    [new DateData(new Date(1))],
                    [new IntListData([])],
                    [new QuarterData(Quarter.FALL, new IntData(111))],
                    id
                );

                tableVals.attendance[11] = [
                    '10',
                    '1',
                    '',
                    '447'
                ];

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateTwoPartialFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateAttendance(
                    [new IntData(10), new IntData(15)],
                    [new DateData(new Date(1)), new DateData(new Date(800800))],
                    undefined,
                    undefined,
                    id
                );

                tableVals.attendance[11][1] = '1';
                tableVals.attendance[16][1] = '800800';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateTwoAllFields', (id: string) => {
                const tableVals = fillWithData(id);

                updateAttendance(
                    [new IntData(10), new IntData(15)],
                    [new DateData(new Date(1)), new DateData(new Date(800800))],
                    [new IntListData([]), new IntListData([new IntData(0), new IntData(7), new IntData(25)])],
                    [new QuarterData(Quarter.FALL, new IntData(111)), new QuarterData(Quarter.WINTER, new IntData(1))],
                    id
                );

                tableVals.attendance[11] = [
                    '10',
                    '1',
                    '',
                    '447'
                ];
                tableVals.attendance[16] = [
                    '15',
                    '800800',
                    '0,7,25',
                    '4'
                ];

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
        new UnitTestSet('testUpdateClubInfo', [
            new UnitTest('undefinedUpdateNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                updateClubInfo(undefined, undefined, undefined, undefined, id);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updatePartialNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                updateClubInfo(
                    new IntData(10),
                    undefined,
                    new IntData(4),
                    undefined,
                    id
                );

                tableVals.clubInfo[1][0] = '10';
                tableVals.clubInfo[1][2] = '4';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('updateAllNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                updateClubInfo(
                    new IntData(10),
                    new IntData(100),
                    new IntData(4),
                    new QuarterData(Quarter.SPRING, new IntData(1)),
                    id
                );

                tableVals.clubInfo[1][0] = '10';
                tableVals.clubInfo[1][1] = '100';
                tableVals.clubInfo[1][2] = '4';
                tableVals.clubInfo[1][3] = '5';

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
    ]);
}
export function testRemovePartOne() {
    UnitTester.runTests([
        new UnitTestSet('testRemoveMember', [
            new UnitTest('emptyRemove', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removeMember([], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removeMember(
                        [new IntData(0)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    removeMember(
                        [new IntData(50)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeOne', (id: string) => {
                const tableVals = fillWithData(id);

                removeMember(
                    [new IntData(10)],
                    id
                );
                tableVals.member.splice(11, 1);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeTwo', (id: string) => {
                const tableVals = fillWithData(id);

                removeMember(
                    [new IntData(10), new IntData(15)],
                    id
                );
                tableVals.member.splice(16, 1);
                tableVals.member.splice(11, 1);

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
        new UnitTestSet('testRemoveIncome', [
            new UnitTest('emptyRemove', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removeIncome([], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removeIncome(
                        [new IntData(0)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    removeIncome(
                        [new IntData(400)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeOne', (id: string) => {
                const tableVals = fillWithData(id);

                removeIncome(
                    [new IntData(10)],
                    id
                );
                tableVals.income.splice(11, 1);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeTwo', (id: string) => {
                const tableVals = fillWithData(id);

                removeIncome(
                    [new IntData(10), new IntData(15)],
                    id
                );
                tableVals.income.splice(16, 1);
                tableVals.income.splice(11, 1);

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
        new UnitTestSet('testRemoveExpense', [
            new UnitTest('emptyRemove', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removeExpense([], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removeExpense(
                        [new IntData(0)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    removeExpense(
                        [new IntData(200)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeOne', (id: string) => {
                const tableVals = fillWithData(id);

                removeExpense(
                    [new IntData(10)],
                    id
                );

                tableVals.expense.splice(11, 1);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeTwo', (id: string) => {
                const tableVals = fillWithData(id);

                removeExpense(
                    [new IntData(10), new IntData(15)],
                    id
                );
                tableVals.expense.splice(16, 1);
                tableVals.expense.splice(11, 1);

                return checkDatabaseValues(tableVals, id);
            }),
        ])
    ]);
}
export function testRemovePartTwo() {
    UnitTester.runTests([
        new UnitTestSet('testRemoveRecipient', [
            new UnitTest('emptyRemove', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removeRecipient([], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removeRecipient(
                        [new IntData(0)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    removeRecipient(
                        [new IntData(100)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeOne', (id: string) => {
                const tableVals = fillWithData(id);

                removeRecipient(
                    [new IntData(10)],
                    id
                );

                tableVals.recipient.splice(11, 1);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeTwo', (id: string) => {
                const tableVals = fillWithData(id);

                removeRecipient(
                    [new IntData(10), new IntData(15)],
                    id
                );

                tableVals.recipient.splice(16, 1);
                tableVals.recipient.splice(11, 1);

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
        new UnitTestSet('testRemovePaymentType', [
            new UnitTest('emptyRemove', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removePaymentType([], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removePaymentType(
                        [new IntData(0)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    removePaymentType(
                        [new IntData(10)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeOne', (id: string) => {
                const tableVals = fillWithData(id);

                removePaymentType(
                    [new IntData(1)],
                    id
                );

                tableVals.paymentType.splice(2, 1)

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeTwo', (id: string) => {
                const tableVals = fillWithData(id);

                removePaymentType(
                    [new IntData(1), new IntData(6)],
                    id
                );

                tableVals.paymentType.splice(4, 1)
                tableVals.paymentType.splice(2, 1)

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
        new UnitTestSet('testRemoveStatement', [
            new UnitTest('emptyRemove', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removeStatement([], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removeStatement(
                        [new IntData(0)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    removeStatement(
                        [new IntData(250)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeOne', (id: string) => {
                const tableVals = fillWithData(id);

                removeStatement(
                    [new IntData(10)],
                    id
                );

                tableVals.statement.splice(11, 1);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeTwo', (id: string) => {
                const tableVals = fillWithData(id);

                removeStatement(
                    [new IntData(10), new IntData(15)],
                    id
                );
                tableVals.statement.splice(16, 1);
                tableVals.statement.splice(11, 1);

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
        new UnitTestSet('testRemoveAttendance', [
            new UnitTest('emptyRemove', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removeAttendance([], id);
                    return false;
                } catch (e) {
                    if (e !== ErrorType.IllegalArgumentError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundEmpty', (id: string) => {
                const tableVals = getEmptyTableState();

                try {
                    removeAttendance(
                        [new IntData(0)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }
                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeNotFoundNonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                try {
                    removeAttendance(
                        [new IntData(100)],
                        id
                    );
                    return false;
                } catch (e) {
                    if (e !== ErrorType.NoMatchFoundError) {
                        throw e;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeOne', (id: string) => {
                const tableVals = fillWithData(id);

                removeAttendance(
                    [new IntData(10)],
                    id
                );

                tableVals.attendance.splice(11, 1);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('removeTwo', (id: string) => {
                const tableVals = fillWithData(id);

                removeAttendance(
                    [new IntData(10), new IntData(15)],
                    id
                );

                tableVals.attendance.splice(16, 1);
                tableVals.attendance.splice(11, 1);

                return checkDatabaseValues(tableVals, id);
            }),
        ]),
    ]);
}
export function testMenuHandlersPartOne() {
    UnitTester.runTests([
        new UnitTestSet('testAddMember', [
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                menuAddMember('joejoe', '1234', id, false);

                tableVals.member.push([
                    '45',
                    'joejoe',
                    '1234',
                    '0',
                    '',
                    '0',
                    '0',
                    '0',
                    '0',
                    '0',
                    '0',
                ]);

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testAddIncome', [
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                menuAddIncome('1234', '45.01', 'description', 'check', id, false);

                tableVals.income.push([
                    '373',
                    '1234',
                    '4501',
                    'description',
                    '1',
                    '-1',
                ]);

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testAddExpense', [
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                menuAddExpense('1234', '45', 'description', 'madewell', 'check', id, false);

                tableVals.expense.push([
                    '161',
                    '1234',
                    '4500',
                    'description',
                    '1',
                    '6',
                    '-1',
                ]);

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testAddRecipient', [
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                menuAddRecipient('asdf', id, false);

                tableVals.recipient.push([
                    '58',
                    'asdf',
                ]);

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testAddPayType', [
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                menuAddPayType('asdf', id, false);

                tableVals.paymentType.push([
                    '7',
                    'asdf',
                ]);

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testAddStatement', [
            new UnitTest('noIncomesNoExpenses', (id: string) => {
                const tableVals = fillWithData(id);

                menuAddStatement('123344', '', '', id, false);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('noIncomesSomeExpenses', (id: string) => {
                const tableVals = fillWithData(id);

                menuAddStatement('123344', '', '10\n44', id, false);

                tableVals.statement.push([
                    '223',
                    '123344',
                    '0'
                ]);

                tableVals.expense[11][6] = '223';
                tableVals.expense[45][6] = '223';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('someIncomesNoExpenses', (id: string) => {
                const tableVals = fillWithData(id);

                menuAddStatement('123344', '9\n39', '', id, false);

                tableVals.statement.push([
                    '223',
                    '123344',
                    '0'
                ]);

                tableVals.income[10][5] = '223';
                tableVals.income[40][5] = '223';

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('someIncomesSomeExpenses', (id: string) => {
                const tableVals = fillWithData(id);

                menuAddStatement('123344', '1\n3\n9', '22', id, false);

                tableVals.statement.push([
                    '223',
                    '123344',
                    '0'
                ]);

                tableVals.income[2][5] = '223';
                tableVals.income[4][5] = '223';
                tableVals.income[10][5] = '223';

                tableVals.expense[23][6] = '223';

                return checkDatabaseValues(tableVals, id);
            })
        ]),
    ]);
}
export function testMenuHandlersPartTwo() {
    UnitTester.runTests([
        new UnitTestSet('testAddAttendance', [
            new UnitTest('noMembers', (id: string) => {
                const tableVals = fillWithData(id);

                menuAddAttendance('123344', '', 'Summer', '2000', id, false);

                return checkDatabaseValues(tableVals, id);
            }),
            new UnitTest('someMembers', (id: string) => {
                const tableVals = fillWithData(id);

                menuAddAttendance('123344', '0,1,1,2,3,5', 'Summer', '2000', id, false);

                tableVals.attendance.push([
                    '50',
                    '123344',
                    '0,1,1,2,3,5',
                    '8002'
                ]);

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testRenameMember', [
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                renameMember('huey wilkins', 'joejoe', id, false);

                tableVals.member[11][1] = 'joejoe';

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testRenameRecipient', [
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                renameRecipient('madewell', 'asdf', id, false);

                tableVals.recipient[7][1] = 'asdf';

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testRenamePaymentType', [
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                renamePaymentType('venmo', 'asdf', id, false);

                tableVals.paymentType[3][1] = 'asdf';

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testMergeMember', [
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                mergeMember('tarik santos', 'chris freeman', id, false);
                const tarikId = '4';
                const chrisId = '8';

                tableVals.member.splice(5, 1);

                for (let i = 0; i < tableVals.attendance.length; ++i) {
                    const ids = tableVals.attendance[i][2].split(',');
                    if (ids.indexOf(tarikId) !== -1) {
                        ids.splice(ids.indexOf(tarikId), 1);

                        if (ids.indexOf(chrisId) === -1) {
                            ids.push(chrisId);
                            ids.sort();
                        }

                        tableVals.attendance[i][2] = ids.join(',');
                    }
                }

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testMergeRecipient', [
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                mergeRecipient('mercer\nmadewell', 'amazon', id, false);
                const madewellId = '6';
                const mercerId = '12';
                const amazonId = '1';

                tableVals.recipient.splice(13, 1);
                tableVals.recipient.splice(7, 1);

                for (let i = 0; i < tableVals.expense.length; ++i) {
                    if (tableVals.expense[i][5] === madewellId) {
                        tableVals.expense[i][5] = amazonId;
                    }
                    if (tableVals.expense[i][5] === mercerId) {
                        tableVals.expense[i][5] = amazonId;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        new UnitTestSet('testMergePaymentType', [
            new UnitTest('nonEmpty', (id: string) => {
                const tableVals = fillWithData(id);

                mergePaymentType('cash\nvenmo', 'debit', id, false);
                const cashId = '0';
                const venmoId = '4';
                const debitId = '6';

                tableVals.paymentType.splice(3, 1);
                tableVals.paymentType.splice(1, 1);

                for (let i = 0; i < tableVals.income.length; ++i) {
                    if (tableVals.income[i][4] === cashId) {
                        tableVals.income[i][4] = debitId;
                    }
                    if (tableVals.income[i][4] === venmoId) {
                        tableVals.income[i][4] = debitId;
                    }
                }
                for (let i = 0; i < tableVals.expense.length; ++i) {
                    if (tableVals.expense[i][4] === cashId) {
                        tableVals.expense[i][4] = debitId;
                    }
                    if (tableVals.expense[i][4] === venmoId) {
                        tableVals.expense[i][4] = debitId;
                    }
                }

                return checkDatabaseValues(tableVals, id);
            })
        ]),
        /*
        UNABLE TO TEST WITHOUT ABILITY TO CHECK IF EMAIL RECEIVED

        new UnitTestSet('testPollNotification', [
        ]),
        new UnitTestSet('testNotifyMembers', [
        ]),
        */
    ]);
}