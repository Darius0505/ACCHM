
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/currencies
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

        const currencies = await prisma.currency.findMany({
            where: {
                companyId,
                isActive: true
            },
            orderBy: [{ isDefault: 'desc' }, { code: 'asc' }]
        });

        return NextResponse.json(currencies);
    } catch (error) {
        console.error('Error fetching currencies:', error);
        return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 });
    }
}

// POST /api/currencies
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { companyId: queryCompanyId, code, name, nameEN, symbol, exchangeRate, isDefault } = body;

        // Resolve Company
        let companyId = queryCompanyId;
        if (!companyId || companyId === 'DEFAULT') {
            const company = await prisma.company.findFirst({ where: { code: 'DEFAULT' } });
            if (company) companyId = company.id;
        }

        if (!code || !name) {
            return NextResponse.json({ error: 'Mã và tên loại tiền là bắt buộc' }, { status: 400 });
        }

        // Handle Default Currency Logic
        if (isDefault) {
            await prisma.currency.updateMany({
                where: { companyId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const currency = await prisma.currency.create({
            data: {
                companyId,
                code: code.toUpperCase(),
                name,
                nameEN,
                symbol,
                exchangeRate: exchangeRate || 1,
                isDefault: isDefault || false
            }
        });

        return NextResponse.json(currency);
    } catch (error: any) {
        console.error('Error creating currency:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Mã loại tiền đã tồn tại' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 });
    }
}
