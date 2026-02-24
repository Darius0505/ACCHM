
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/accounts
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

        // 2. Filters
        const type = searchParams.get('type');
        const code = searchParams.get('code');
        const isPosting = searchParams.get('isPosting');
        const search = searchParams.get('search');

        const where: any = {
            companyId,
            isActive: true
        };

        if (type) where.type = type; // e.g. ASSET
        if (code) where.code = { startsWith: code }; // e.g. 112
        if (isPosting === 'true') where.isPosting = true;
        if (isPosting === 'false') where.isPosting = false;

        if (search) {
            where.OR = [
                { code: { contains: search } },
                { name: { contains: search } }
            ];
        }

        const accounts = await prisma.account.findMany({
            where,
            orderBy: { code: 'asc' },
        });

        return NextResponse.json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }
}

// POST /api/accounts
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Resolve Company
        let companyId = body.companyId;
        if (!companyId || companyId === 'DEFAULT') {
            const company = await prisma.company.findFirst({ where: { code: 'DEFAULT' } });
            if (company) companyId = company.id;
        }

        if (!body.code || !body.name || !body.type) {
            return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        // Check duplicate
        const existing = await prisma.account.findUnique({
            where: {
                companyId_code: {
                    companyId,
                    code: body.code
                }
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Mã tài khoản đã tồn tại' }, { status: 400 });
        }

        const account = await prisma.account.create({
            data: {
                companyId,
                code: body.code,
                name: body.name,
                nameEN: body.nameEN || null,
                nameJP: body.nameJP || null,
                nameOther: body.nameOther || null,
                type: body.type,
                nature: body.nature || 'DEBIT', // Default
                isPosting: body.isPosting ?? true,
                parentId: body.parentId || null,
            },
        });
        return NextResponse.json(account);
    } catch (error) {
        console.error('Create account error:', error);
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
}
