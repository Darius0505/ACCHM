/**
 * Journal Entry by ID API Routes
 * GET /api/journal-entries/[id] - Get single entry
 * PUT /api/journal-entries/[id] - Update draft entry
 * DELETE /api/journal-entries/[id] - Delete draft entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/services/journalEntry.service';

interface RouteParams {
    params: { id: string };
}

// GET - Get single entry
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const entry = await getJournalEntry(params.id);

        if (!entry) {
            return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
        }

        return NextResponse.json(entry);

    } catch (error) {
        console.error('Error getting journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to get journal entry' },
            { status: 500 }
        );
    }
}

// PUT - Update draft entry
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const body = await request.json();

        const entry = await updateJournalEntry(params.id, {
            date: body.date ? new Date(body.date) : undefined,
            postingDate: body.postingDate ? new Date(body.postingDate) : undefined,
            reference: body.reference,
            description: body.description,
            descriptionEN: body.descriptionEN,
            descriptionJP: body.descriptionJP,
            lines: body.lines
        });

        return NextResponse.json(entry);

    } catch (error: any) {
        console.error('Error updating journal entry:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update journal entry' },
            { status: 400 }
        );
    }
}

// DELETE - Delete draft entry
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await deleteJournalEntry(params.id);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error deleting journal entry:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete journal entry' },
            { status: 400 }
        );
    }
}
