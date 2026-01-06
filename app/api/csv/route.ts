import { NextRequest, NextResponse } from 'next/server';
import { readCSVFile, deletePath, renamePath } from '@/lib/fs';
import { parseCSV, getSchema, formatRows } from '@/lib/csv/parser';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');

    if (!path) {
        return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    try {
        const content = readCSVFile(path);
        const { headers, rows } = parseCSV(content);
        const schema = getSchema(headers as string[], rows);
        const formattedRows = formatRows(rows, schema);

        return NextResponse.json({
            columns: schema,
            rows: formattedRows,
            fileName: path.split('/').pop()
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');

    if (!path) {
        return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    try {
        deletePath(path);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { oldPath, newPath } = await req.json();

        if (!oldPath || !newPath) {
            return NextResponse.json({ error: 'oldPath and newPath are required' }, { status: 400 });
        }

        renamePath(oldPath, newPath);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
