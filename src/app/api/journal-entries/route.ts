/**
 * Journal Entries API Routes
 * GET /api/journal-entries - List entries
 * POST /api/journal-entries - Create new entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { createJournalEntry, listJournalEntries } from '@/services/journalEntry.service';
import { getDataFilter } from '@/lib/dataFilter';

// GET - List journal entries
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const companyId = searchParams.get('companyId');
        if (!companyId) {
            return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
        }

        const filters = {
            companyId,
            journalId: searchParams.get('journalId') || undefined,
            status: searchParams.get('status') || undefined,
            startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
            endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
            search: searchParams.get('search') || undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '20'),
            dataFilter: getDataFilter(request)
        };

        const result = await listJournalEntries(filters);
        return NextResponse.json(result);

    } catch (error) {
        console.error('Error listing journal entries:', error);
        return NextResponse.json(
            { error: 'Failed to list journal entries' },
            { status: 500 }
        );
    }
}

// POST - Create new journal entry
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.journalId || !body.date || !body.description || !body.lines) {
            return NextResponse.json(
                { error: 'Missing required fields: journalId, date, description, lines' },
                { status: 400 }
            );
        }

        if (!Array.isArray(body.lines) || body.lines.length < 2) {
            return NextResponse.json(
                { error: 'At least 2 lines are required' },
                { status: 400 }
            );
        }

        // TODO: Get createdBy from auth session
        const createdBy = body.createdBy || 'system';

        const entry = await createJournalEntry({
            journalId: body.journalId,
            date: new Date(body.date),
            postingDate: body.postingDate ? new Date(body.postingDate) : undefined,
            reference: body.reference,
            description: body.description,
            descriptionEN: body.descriptionEN,
            descriptionJP: body.descriptionJP,
            lines: body.lines,
            createdBy
        });

        return NextResponse.json(entry, { status: 201 });

    } catch (error: any) {
        console.error('Error creating journal entry:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create journal entry' },
            { status: 400 }
        );
    }
}
