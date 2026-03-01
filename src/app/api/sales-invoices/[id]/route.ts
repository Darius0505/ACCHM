
import { NextRequest, NextResponse } from 'next/server';
import { getSalesInvoice } from '../../../../services/salesInvoice.service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const invoice = await getSalesInvoice(id);

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json(invoice);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
// PUT, DELETE typically follow same pattern
