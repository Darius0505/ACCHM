/**
 * Post Journal Entry API Route
 * POST /api/journal-entries/[id]/post - Post a draft entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { postJournalEntry } from '@/services/journalEntry.service';

interface RouteParams {
    params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const body = await request.json().catch(() => ({}));

        // TODO: Get userId from auth session
        const userId = body.userId || 'system';

        const entry = await postJournalEntry(params.id, userId);

        return NextResponse.json(entry);

    } catch (error: any) {
        console.error('Error posting journal entry:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to post journal entry' },
            { status: 400 }
        );
    }
}
