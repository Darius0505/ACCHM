
import { NextRequest, NextResponse } from 'next/server';
import { getPartnerContacts } from '@/services/partner.service';

/**
 * GET /api/partners/[id]/contacts
 * Get contacts for a specific partner
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contacts = await getPartnerContacts(params.id);
        return NextResponse.json(contacts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
