import { NextRequest, NextResponse } from 'next/server';
import { postVendorPayment } from '../../../../../services/vendorPayment.service';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const postedBy = 'admin';

        const payment = await postVendorPayment(id, postedBy);
        return NextResponse.json({ success: true, payment });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
