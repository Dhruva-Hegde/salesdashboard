import { NextResponse } from 'next/server';
import { getFileTree } from '@/lib/fs';

export async function GET() {
    try {
        const tree = getFileTree();
        return NextResponse.json({ tree });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
