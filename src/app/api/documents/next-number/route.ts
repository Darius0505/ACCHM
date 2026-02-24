
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { previewEntryNumber } from '@/services/numberSequence.service';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type'); // CASH_RECEIPT, CASH_PAYMENT, etc.
        const { companyId: authCompanyId } = getUserFromRequest(request);
        const companyId = authCompanyId || searchParams.get('companyId');
        const dateStr = searchParams.get('date');
        const date = dateStr ? new Date(dateStr) : new Date();

        if (!type) {
            return NextResponse.json({ error: 'Type is required' }, { status: 400 });
        }

        let journalType = '';
        switch (type) {
            case 'CASH_RECEIPT':
                journalType = 'CASH'; // Logic: Cash Receipt uses CASH journal
                break;
            case 'CASH_PAYMENT':
                journalType = 'CASH'; // Logic: Cash Payment also uses CASH? Or maybe separate?
                // Wait, typically CR and CP might have different journals or same journal type but different codes.
                // Let's assume for now we look for a Journal with type 'CASH' and maybe filter further if needed.
                // Actually, existing logic in `createCashReceipt` just finds ANY 'CASH' journal.
                // We should probably be more specific if we have multiple.
                // For now, let's match `createCashReceipt` logic: findFirst({ type: 'CASH' })
                break;
            default:
                journalType = type;
        }

        // Find the Journal
        // NOTE: This logic mimics createCashReceipt. If we have multiple CASH journals, this might be ambiguous.
        // But for MVP/Current state, it's fine.
        const journal = await prisma.journal.findFirst({
            where: {
                companyId,
                type: journalType,
                isActive: true
            },
            orderBy: { code: 'asc' }
        });

        if (!journal) {
            return NextResponse.json({ error: `Not found active journal for type ${type}` }, { status: 404 });
        }

        const nextNumber = await previewEntryNumber({
            journalId: journal.id,
            date
        });

        return NextResponse.json({ nextNumber });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
