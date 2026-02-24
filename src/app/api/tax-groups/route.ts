
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tax-groups
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Resolve company logic (reuse from other APIs)
        let companyCode = searchParams.get('companyId');
        let companyId = companyCode;

        if (!companyCode || companyCode === 'null' || companyCode === 'undefined') {
            companyCode = 'DEFAULT';
        }

        if (companyCode && !companyCode.match(/^[0-9a-f-]{36}$/i)) {
            let company = await prisma.company.findFirst({ where: { code: companyCode } });
            if (!company) {
                company = await prisma.company.findFirst();
            }
            if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
            companyId = company.id;
        }

        const items = await prisma.taxGroup.findMany({
            where: {
                companyId,
                isActive: true
            },
            orderBy: { code: 'asc' }
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching tax groups:', error);
        return NextResponse.json({ error: 'Failed to fetch tax groups' }, { status: 500 });
    }
}

// POST /api/tax-groups
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { companyId: queryCompanyId, code, name, description } = body;

        // Resolve Company
        let companyId = queryCompanyId;
        if (!companyId || companyId === 'DEFAULT') {
            const company = await prisma.company.findFirst({ where: { code: 'DEFAULT' } });
            if (company) companyId = company.id;
        }

        if (!code || !name) {
            return NextResponse.json({ error: 'Mã và tên nhóm thuế là bắt buộc' }, { status: 400 });
        }

        const item = await prisma.taxGroup.create({
            data: {
                companyId,
                code: code.toUpperCase(),
                name,
                description,
                isActive: true
            }
        });

        return NextResponse.json(item);
    } catch (error: any) {
        console.error('Error creating tax group:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Mã nhóm thuế đã tồn tại' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create tax group' }, { status: 500 });
    }
}
