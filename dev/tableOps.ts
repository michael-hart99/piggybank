import { Color, Data, Entry, ErrorType, IntData, SortSpecObj } from './types';

export const HEADER_LEN = 1;
export const GAS_OFFSET = 1;

function getNextId(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    const sheetLength = sheet.getLastRow() - HEADER_LEN;
    if (sheetLength === 0) return 0;

    const id = parseInt(
        sheet.getRange(sheetLength + HEADER_LEN, 1).getValue().toString(), 10
    );
    if (isNaN(id)) {
        throw ErrorType.IllegalArgumentError;
    }

    return id + 1;
}
export function append(sheet: GoogleAppsScript.Spreadsheet.Sheet, entries: Entry[]) {
    if (entries.length === 0) {
        throw ErrorType.IllegalArgumentError;
    }

    const sheetLength = sheet.getLastRow() - HEADER_LEN;
    const firstEntryLength = entries[0].length();
    let curId = getNextId(sheet);

    const ids: IntData[] = [];
    const rows: string[][] = [];
    let i = 0;
    for (const entry of entries) {
        const row = entry.toArray();
        // Verify that all fields except id are filled and that all have the
        // same number of fields as the first entry
        if (entry.id || row.length !== firstEntryLength - 1) {
            throw ErrorType.IllegalArgumentError;
        }
        row.unshift((curId + i).toString());
        ids.push(new IntData(curId + i));
        rows.push(row);
        ++i;
    }

    sheet
        .getRange(
            sheetLength + HEADER_LEN + GAS_OFFSET,
            1,
            rows.length,
            firstEntryLength
        )
        .setValues(rows);

    orderBy(sheet, ['id'], true);

    return ids;
}
export function update(sheet: GoogleAppsScript.Spreadsheet.Sheet, entries: Entry[]) {
    if (entries.length === 0) {
        throw ErrorType.IllegalArgumentError;
    }

    const ids = entries.map(entry => {
        if (!entry.id) {
            throw ErrorType.IllegalArgumentError;
        }
        return entry.id;
    });
    const indices = getIndicesFromIds(sheet, ids);

    const numCols = sheet.getLastColumn();
    for (let i = 0; i < entries.length; ++i) {
        const rowArray = entries[i].toArray();
        if (entries[i].length() !== rowArray.length) {
            throw ErrorType.IllegalArgumentError;
        }
        sheet
            .getRange(indices[i] + HEADER_LEN + GAS_OFFSET, 1, 1, numCols)
            .setValues([rowArray]);
    }
}
export function remove(sheet: GoogleAppsScript.Spreadsheet.Sheet, entries: Entry[]) {
    if (entries.length === 0) {
        throw ErrorType.IllegalArgumentError;
    }

    const ids = entries.map(entry => {
        if (!entry.id) {
            throw ErrorType.IllegalArgumentError;
        }
        return entry.id;
    });
    const indices = getIndicesFromIds(sheet, ids);

    for (let i = 0; i < indices.length; ++i) {
        sheet.deleteRow(indices[i] + HEADER_LEN + GAS_OFFSET - i);
    }
}

export function clearData(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    const numRows = sheet.getLastRow() - 1;
    const numCols = sheet.getLastColumn();

    if (numRows > 0 && numCols > 0) {
        sheet.getRange(HEADER_LEN + GAS_OFFSET, 0 + GAS_OFFSET, numRows, numCols)
            .clear();
    }
}
export function setData(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    data: string[][],
    numFormat?: string[][],
    backColor?: string[][],
    breakLineNums?: number[]
) {
    clearData(sheet);

    if (data.length <= 0 || data[0].length <= 0) return;

    const range = sheet.getRange(HEADER_LEN + GAS_OFFSET, 0 + GAS_OFFSET, data.length, data[0].length);

    range.setValues(data);

    if (numFormat) {
        if (numFormat.length !== data.length || numFormat[0].length !== data[0].length) {
            throw ErrorType.AssertionError;
        }
        range.setNumberFormats(numFormat);
    }
    if (backColor) {
        if (backColor.length !== data.length || backColor[0].length !== data[0].length) {
            throw ErrorType.AssertionError;
        }
        range.setBackgrounds(backColor);
    }
    if (breakLineNums) {
        for (const lineNum of breakLineNums) {
            sheet.getRange(lineNum + HEADER_LEN + GAS_OFFSET, 0 + GAS_OFFSET, 1, data[0].length)
                .setBorder(true, false, false, false, false, false, Color.BLACK, SpreadsheetApp.BorderStyle.SOLID_THICK);
        }
    }
}

function getFieldIndices(sheetHeader: string[], fields: string[]): number[] {
    const output = fields.map(v => {
        const i = sheetHeader.indexOf(v);
        if (i === -1) throw ErrorType.FieldNotFoundError;
        return i;
    });
    return output;
}
export function getIndicesFromIds(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    ids: IntData[]
) {
    if (ids.length === 0) {
        return [];
    }
    const tableIds = select(sheet, 'id');
    if (tableIds.length === 0) throw ErrorType.NoMatchFoundError;

    const indices = [];

    let startIndex = 0;
    for (const id of ids) {
        let i = startIndex;
        let foundMatch = false;
        do {
            if (tableIds[i].toString() === id.toString()) {
                foundMatch = true;
                indices.push(i);
                startIndex = i;
                break;
            }
            i = (i + 1) % tableIds.length;
        } while (i !== startIndex);
        if (!foundMatch) {
            throw ErrorType.NoMatchFoundError;
        }
    }

    return indices;
}
/**
 *
 * @param sheet The sheet being searched for matching entries
 * @param valColumns The n columns to match to (order matters)
 * @param vals A list of column data, where each row has n Data values
 */
export function getIdsFromVals(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    valColumns: string[],
    vals: Data[][]
) {
    if (vals.length === 0) {
        return [];
    }
    if (valColumns.length === 0 || valColumns.length !== vals[0].length) {
        throw ErrorType.IllegalArgumentError;
    }

    const tableVals = selectMulti(sheet, ['id'].concat(valColumns));
    if (tableVals.length === 0) throw ErrorType.NoMatchFoundError;

    const ids: IntData[] = [];
    let startIndex = 0;
    for (let val_i = 0; val_i < vals.length; ++val_i) {
        let table_i = startIndex;
        let foundMatch = false;
        do {
            // See if all fields match table's entry
            foundMatch = true;
            for (let j = 0; j < vals[val_i].length; ++j) {
                if (
                    tableVals[table_i][j + 1].toString() !==
                    vals[val_i][j].toString()
                ) {
                    foundMatch = false;
                    break;
                }
            }
            if (foundMatch) {
                ids.push(IntData.create(tableVals[table_i][0].toString()));
                startIndex = table_i;
                break;
            }
            table_i = (table_i + 1) % tableVals.length
        }
        while (table_i !== startIndex);
        if (!foundMatch) {
            throw ErrorType.NoMatchFoundError;
        }
    }

    return ids;
}

export function select(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    field: string
) {
    const sheetVals = sheet.getDataRange().getValues();

    const i = sheetVals[0].indexOf(field);

    // Remove header
    sheetVals.shift();

    return sheetVals.map(row => row[i]);
}
export function selectMulti(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    fields: string[]
) {
    const sheetVals = sheet.getDataRange().getValues();

    const indicies = getFieldIndices(
        sheetVals[0].map(val => val.toString()),
        fields
    );

    // Remove header
    sheetVals.shift();

    return sheetVals.map(row => indicies.map(index => row[index]));
}
export function selectAll(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    const sheetVals = sheet.getDataRange().getValues();

    // Remove header
    sheetVals.shift();

    return sheetVals;
}

export function orderBy(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    fields: string[],
    asc: boolean | boolean[] = true
) {
    if (asc instanceof Array && asc.length !== fields.length) {
        throw ErrorType.IllegalArgumentError;
    }
    const sheetHeader = sheet
        .getRange(1, 1, 1, sheet.getLastColumn())
        .getValues()[0];

    const indicies = getFieldIndices(
        sheetHeader.map(val => val.toString()),
        fields
    );

    let sortSpec: SortSpecObj[];
    if (!(asc instanceof Array)) {
        sortSpec = indicies.map(index => {
            return { column: index + GAS_OFFSET, ascending: asc };
        });
    } else {
        sortSpec = indicies.map((index, i) => {
            return { column: index + GAS_OFFSET, ascending: asc[i] };
        });
    }

    if (sheet.getLastRow() > 1) {
        sheet
            .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
            .sort(sortSpec);
    }
}
