
import { NextRequest, NextResponse } from 'next/server';
import { postCustomerPayment } from '../../../../../services/customerPayment.service';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const postedBy = 'admin';

        const payment = await postCustomerPayment(id, postedBy);
        return NextResponse.json({ success: true, payment });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
