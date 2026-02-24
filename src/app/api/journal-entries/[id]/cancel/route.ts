/**
 * Cancel Journal Entry API Route
 * POST /api/journal-entries/[id]/cancel - Cancel a posted entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { cancelJournalEntry } from '@/services/journalEntry.service';

interface RouteParams {
    params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const body = await request.json().catch(() => ({}));

        // TODO: Get userId from auth session
        const userId = body.userId || 'system';

        const entry = await cancelJournalEntry(params.id, userId);

        return NextResponse.json(entry);

    } catch (error: any) {
        console.error('Error cancelling journal entry:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to cancel journal entry' },
            { status: 400 }
        );
    }
}
