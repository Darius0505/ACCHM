
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { companyId } = getUserFromRequest(request);
        if (!companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id } = params;

        // Validation
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const updated = await prisma.journal.update({
            where: { id },
            data: {
                prefix: body.prefix,
                template: body.template,
                nextNumber: body.nextNumber, // User can reset number
                padding: body.padding,
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
