import { NextRequest, NextResponse } from 'next/server';
import { postPurchaseInvoice } from '../../../../../services/purchaseInvoice.service';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const postedBy = 'admin';

        const invoice = await postPurchaseInvoice(id, postedBy);
        return NextResponse.json({ success: true, invoice });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
