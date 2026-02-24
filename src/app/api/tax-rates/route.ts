
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tax-rates
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

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

        const items = await prisma.taxRate.findMany({
            where: {
                companyId,
                isActive: true
            },
            include: {
                taxGroup: true // Include group name
            },
            orderBy: [{ taxGroup: { code: 'asc' } }, { rate: 'asc' }]
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching tax rates:', error);
        return NextResponse.json({ error: 'Failed to fetch tax rates' }, { status: 500 });
    }
}

// POST /api/tax-rates
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { companyId: queryCompanyId, taxGroupId, code, name, rate } = body;

        // Resolve Company
        let companyId = queryCompanyId;
        if (!companyId || companyId === 'DEFAULT') {
            const company = await prisma.company.findFirst({ where: { code: 'DEFAULT' } });
            if (company) companyId = company.id;
        }

        if (!code || !name || !taxGroupId || rate === undefined) {
            return NextResponse.json({ error: 'Thông tin bắt buộc chưa đầy đủ' }, { status: 400 });
        }

        const item = await prisma.taxRate.create({
            data: {
                companyId,
                taxGroupId,
                code: code.toUpperCase(),
                name,
                rate: rate,
                isActive: true
            }
        });

        return NextResponse.json(item);
    } catch (error: any) {
        console.error('Error creating tax rate:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Mã thuế suất đã tồn tại' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create tax rate' }, { status: 500 });
    }
}
