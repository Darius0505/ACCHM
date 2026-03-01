
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/fixed-assets
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // 1. Resolve Company (Simplified logic from bank-accounts)
        let companyId;
        // Ideally reuse a helper but for now implementing inline
        const company = await prisma.company.findFirst(); // Default to first company for now
        if (company) companyId = company.id;

        if (!companyId) return NextResponse.json([], { status: 200 });

        const assets = await prisma.fixedAsset.findMany({
            where: {
                companyId,
                isActive: true
            },
            select: {
                id: true,
                code: true,
                name: true,
                originalPrice: true
            },
            orderBy: { code: 'asc' }
        });

        return NextResponse.json(assets);
    } catch (error) {
        console.error('Error fetching fixed assets:', error);
        return NextResponse.json({ error: 'Failed to fetch fixed assets' }, { status: 500 });
    }
}
