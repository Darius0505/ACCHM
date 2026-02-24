
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Validated by XRAY
export async function GET(request: NextRequest) {
    try {
        const { companyId } = getUserFromRequest(request);
        if (!companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const journals = await prisma.journal.findMany({
            where: {
                companyId,
                isActive: true
            },
            orderBy: { code: 'asc' },
            select: {
                id: true,
                code: true,
                name: true,
                prefix: true,
                template: true,
                nextNumber: true,
                padding: true,
                type: true
            }
        });

        return NextResponse.json(journals);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
