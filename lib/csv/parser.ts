import Papa from 'papaparse';
import { ColumnSchema, ColumnType } from '@/types/csv';

export function parseCSV(csvContent: string) {
    const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false
    });

    return {
        headers: result.meta.fields || [],
        rows: result.data as Record<string, any>[]
    };
}

export function inferType(values: any[]): ColumnType {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    if (nonNullValues.length === 0) return 'string';

    // Check for number
    const isNumber = nonNullValues.every(v => !isNaN(Number(v)) && v !== '');
    if (isNumber) return 'number';

    // Check for date
    const isDate = nonNullValues.every(v => {
        const d = new Date(v);
        return !isNaN(d.getTime()) && v.includes('-');
    });
    if (isDate) return 'date';

    return 'string';
}

export function getSchema(headers: string[], rows: Record<string, any>[]): ColumnSchema[] {
    return headers.map(header => {
        const values = rows.slice(0, 100).map(row => row[header]); // Check first 100 rows
        const type = inferType(values);
        return { name: header, type };
    });
}

export function formatRows(rows: Record<string, any>[], schema: ColumnSchema[]) {
    return rows.map(row => {
        const formattedRow: Record<string, any> = { ...row };
        schema.forEach(col => {
            if (col.type === 'number') {
                formattedRow[col.name] = row[col.name] !== '' ? Number(row[col.name]) : null;
            } else if (col.type === 'date') {
                const d = new Date(row[col.name]);
                formattedRow[col.name] = !isNaN(d.getTime()) ? d.toISOString() : null;
            }
        });
        return formattedRow;
    });
}
