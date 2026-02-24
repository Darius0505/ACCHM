
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/bank-accounts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // 1. Resolve Company
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

        const accounts = await prisma.bankAccount.findMany({
            where: {
                companyId,
                isActive: true
            },
            include: {
                partner: { select: { id: true, code: true, name: true } },
                account: { select: { id: true, code: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(accounts);
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        return NextResponse.json({ error: 'Failed to fetch bank accounts' }, { status: 500 });
    }
}

// POST /api/bank-accounts
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { companyId: queryCompanyId, code, name, bankName, accountNumber, branch, currency, accountId, partnerId } = body;

        // 1. Resolve Company
        let companyId = queryCompanyId;
        if (!companyId || companyId === 'DEFAULT') {
            const company = await prisma.company.findFirst({ where: { code: 'DEFAULT' } });
            if (company) companyId = company.id;
        }

        if (!code || !name || !bankName || !accountNumber || !accountId) { // Basic required fields
            return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        // Validate partner if provided
        if (partnerId) {
            const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
            if (!partner) return NextResponse.json({ error: 'Đối tượng ngân hàng không tồn tại' }, { status: 400 });
        }

        // Validate GL account
        const glAccount = await prisma.account.findUnique({ where: { id: accountId } });
        if (!glAccount) return NextResponse.json({ error: 'Tài khoản kế toán không tồn tại' }, { status: 400 });


        const newAccount = await prisma.bankAccount.create({
            data: {
                companyId,
                code,
                name,
                bankName,
                accountNumber,
                branch,
                currency: currency || 'VND',
                accountId,
                partnerId: partnerId || null,
            }
        });

        return NextResponse.json(newAccount);

    } catch (error: any) {
        console.error('Error creating bank account:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Mã tài khoản ngân hàng đã tồn tại' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create bank account' }, { status: 500 });
    }
}
