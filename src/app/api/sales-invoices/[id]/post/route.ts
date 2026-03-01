
import { NextRequest, NextResponse } from 'next/server';
import { postSalesInvoice } from '../../../../../services/salesInvoice.service';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        // const session = await getSession();
        const postedBy = 'admin'; // session.user.email

        const invoice = await postSalesInvoice(id, postedBy);
        return NextResponse.json({ success: true, invoice });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
