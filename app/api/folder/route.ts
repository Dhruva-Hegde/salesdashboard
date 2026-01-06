import { NextRequest, NextResponse } from 'next/server';
import { createFolder } from '@/lib/fs';

export async function POST(req: NextRequest) {
    try {
        const { path } = await req.json();

        if (!path) {
            return NextResponse.json({ error: 'Path is required' }, { status: 400 });
        }

        createFolder(path);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
