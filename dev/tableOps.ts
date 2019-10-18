import { Color, Data, Entry, ErrorType, IntData, SortSpecObj } from './types';

/** The length of the header on each sheet */
export const HEADER_LEN = 1;
/** The offset when accessing a sheet (zero-indexed vs one-indexed) */
export const GAS_OFFSET = 1;

/**
 * Given the header for a sheet and field names, will return the indecies of
 * those field names within the header.
 * Ex: header = ['id', 'name', 'date']
 *     field = ['date', 'id']
 *     Returns: [2, 0]
 * 
 * @param sheetHeader The header of a sheet, containing field names
 * @param fields The field names that will be searched for in the header
 * 
 * @throws NoMatchFoundError if a field name is not in the header
 */
function getFieldIndices(sheetHeader: string[], fields: string[]): number[] {
    const output = fields.map(v => {
        const i = sheetHeader.indexOf(v);
        if (i === -1) throw ErrorType.NoMatchFoundError;
        return i;
    });
    return output;
}
/**
 * Returns the bottom id in the sheet incremented by one. This would be the
 * next id if an entry is appended. Returns 0 if sheet's length is 0.
 * 
 * @param sheet The sheet to open
 * 
 * @throws IllegalArgumentError if sheet does not have an IntData "id" field
 */
function getNextId(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    const sheetLength = sheet.getLastRow() - HEADER_LEN;
    if (sheetLength === 0) return 0;

    const sheetHeader = sheet.getRange(
        GAS_OFFSET,
        GAS_OFFSET,
        1,
        sheet.getLastColumn()
    ).getValues()[0].map(row => row.toString());

    let idIndex: number;
    try {
        idIndex = getFieldIndices(sheetHeader, ['id'])[0];
    } catch (e) {
        if (e === ErrorType.NoMatchFoundError) {
            throw ErrorType.IllegalArgumentError;
        } else {
            throw e;
        }
    }

    const id = IntData.create(sheet.getRange(
        sheetLength + HEADER_LEN,
        GAS_OFFSET + idIndex)
        .getValue().toString());

    return id.getValue() + 1;
}

/**
 * Gets the indices of the given sheet's rows that have matching ids to those
 * given.
 * 
 * @param sheet The sheet to open
 * @param ids The ids to get the indices of
 * 
 * @throws NoMatchFoundError if a matching id can't be found.
 * @throws IllegalArgumentError if sheet doesn't have an id field
 */
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

    for (let id_i = 0; id_i < ids.length; ++id_i) {
        for (let table_i = 0; table_i < tableIds.length; ++table_i) {
            if (tableIds[table_i].toString() === ids[id_i].toString()) {
                indices.push(table_i);
                break;
            }
        }
        if (indices.length !== id_i + 1) {
            throw ErrorType.NoMatchFoundError;
        }
    }

    return indices;
}
/**
 * Returns the ids of the matching rows of the given sheet. Matching rows are
 * found by comparing the fields in the sheet to values in each row of vals.
 * 
 * @param sheet The sheet being searched for matching entries
 * @param fields The n fields to match to (order matters)
 * @param vals A list of column data, where each row has n Data values
 * 
 * @throws IllegalArgumentError if fields has length 0 ||
 *                                 fields is not the same length as each entry of vals
 * @throws NoMatchFoundError if no matching rows were found
 */
export function getIdsFromFields(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    fields: string[],
    vals: Data[][]
) {
    if (vals.length === 0) {
        return [];
    }
    if (fields.length === 0 || fields.length !== vals[0].length) {
        throw ErrorType.IllegalArgumentError;
    }

    const tableVals = selectMulti(sheet, ['id'].concat(fields));
    if (tableVals.length === 0) throw ErrorType.NoMatchFoundError;

    const ids: IntData[] = [];
    for (let val_i = 0; val_i < vals.length; ++val_i) {
        for (let table_i = 0; table_i < tableVals.length; ++table_i) {
            let foundMatch = true;
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
                break;
            }
        }

        if (ids.length !== val_i + 1) {
            throw ErrorType.NoMatchFoundError;
        }
    }

    return ids;
}

/**
 * Appends the given entries to the bottom of the given sheet, generating the
 * ids for the new entries. Orders the sheet afterwards by id, descending
 * 
 * @param sheet The sheet to be edited
 * @param entries The entries to append
 * 
 * @throws IllegalArgumentError if sheet does not have an IntData "id" field ||
 *                                 entries's length is 0 ||
 *                                 entries's id is initialized ||
 *                                 entries have differing number of fields
 */
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
/**
 * Updates entries in the given sheet to have values corresponding to the
 * contents of the given entries. Finds corresponding entries by matching
 * to the id field.
 * 
 * @param sheet The sheet to be edited
 * @param entries The entries to update
 * 
 * @throws IllegalArgumentError if sheet does not have an IntData "id" field ||
 *                                 entries's length is 0 ||
 *                                 an entry in entries does not have an id ||
 *                                 entries have differing number of fields
 * @throws NoMatchFoundError if a given id is not found in the given sheet
 */
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
/**
 * Removes entries in the given sheet that have ids matching those given in
 * entries.
 * 
 * @param sheet The sheet to be edited
 * @param entries The entries to remove from the sheet
 * 
 * @throws IllegalArgumentError if sheet does not have an IntData "id" field ||
 *                                 entries's length is 0 ||
 *                                 an entry in entries does not have an id
 * @throws NoMatchFound if a given id is not in the given sheet
 */
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
    indices.sort((a, b) => b - a);

    for (let i = 0; i < indices.length; ++i) {
        sheet.deleteRow(indices[i] + HEADER_LEN + GAS_OFFSET);
    }
}

/**
 * Clears the given sheet of all values except the header.
 * 
 * @param sheet The sheet to clear
 */
export function clearData(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    const numRows = sheet.getLastRow() - 1;
    const numCols = sheet.getLastColumn();

    if (numRows > 0 && numCols > 0) {
        sheet.getRange(HEADER_LEN + GAS_OFFSET, 0 + GAS_OFFSET, numRows, numCols)
            .clear();
    }
}
/**
 * Sets the values and formatting of a given sheet.
 * 
 * @param sheet The sheet to edit
 * @param data The values to fill the sheet with
 * @param numFormat The number formats to set in each cell of the sheet
 * @param backColor The background colors to set in each cell of the sheet
 * @param breakLineNums The indices of each row to add a thick border above
 * 
 * @throws IllegalArgumentError if data, numFormat, and backColor are not the
 *                                 same dimensions
 */
export function setData(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    data: string[][],
    numFormat?: string[][],
    backColor?: string[][],
    breakLineNums?: number[]
) {
    clearData(sheet);

    if (data.length <= 0 || data[0].length <= 0) {
        return;
    }

    const range = sheet.getRange(HEADER_LEN + GAS_OFFSET, 0 + GAS_OFFSET, data.length, data[0].length);

    range.setValues(data);

    if (numFormat) {
        if (numFormat.length !== data.length || numFormat[0].length !== data[0].length) {
            throw ErrorType.IllegalArgumentError;
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

/**
 * Returns values from the given sheet that are in the given column/field.
 * 
 * @param sheet The sheet to open
 * @param field The field to retrieve
 * 
 * @throws IllegalArgumentError if the field is not found
 */
export function select(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    field: string
) {
    const sheetVals = sheet.getDataRange().getValues();

    const i = sheetVals[0].indexOf(field);
    if (i === -1) {
        throw ErrorType.IllegalArgumentError;
    }

    // Remove header
    sheetVals.shift();

    return sheetVals.map(row => row[i]);
}
/**
 * Returns values from the given sheet that are in the given columns/fields.
 * 
 * @param sheet The sheet to open
 * @param field The fields to retrieve
 * 
 * @throws IllegalArgumentError if a field is not found
 */
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
/**
 * Returns all of the contents of the sheet except for the header.
 * 
 * @param sheet The sheet to open
 */
export function selectAll(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    const sheetVals = sheet.getDataRange().getValues();

    // Remove header
    sheetVals.shift();

    return sheetVals;
}

/**
 * Orders the given sheet using the values of the given columns.
 * 
 * @param sheet The sheet to order
 * @param fields The fields to order using
 * @param asc Controls whether the sheet is ordered ascending or descending,
 *            if this is an array it must match the length of fields and will
 *            correspond to whether each field is ascending or descending
 * 
 * @throws IllegalArgumentError if a field is not found
 */
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
