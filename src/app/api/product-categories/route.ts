// Product Categories API - GET (list) and POST (create)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/product-categories
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        let companyCode = searchParams.get('companyId');

        let companyId = companyCode;

        // If no companyId specific, default to 'DEFAULT' or the first company found
        if (!companyCode || companyCode === 'null' || companyCode === 'undefined') {
            companyCode = 'DEFAULT';
        }

        // If companyCode is not a UUID, look it up
        if (companyCode && !companyCode.match(/^[0-9a-f-]{36}$/i)) {
            let company = await prisma.company.findFirst({ where: { code: companyCode } });

            // Fallback to ANY company if DEFAULT not found (for dev convenience)
            if (!company) {
                company = await prisma.company.findFirst();
            }

            if (!company) {
                return NextResponse.json({ error: 'Company not found' }, { status: 404 });
            }
            companyId = company.id;
        }

        const categories = await prisma.productCategory.findMany({
            where: { companyId, isActive: true },
            orderBy: { code: 'asc' },
            include: {
                _count: { select: { products: true } }
            }
        });

        // Build hierarchy
        const categoryMap = new Map();
        categories.forEach(c => categoryMap.set(c.id, { ...c, children: [] }));

        const rootCategories: any[] = [];
        categoryMap.forEach(c => {
            if (c.parentId && categoryMap.has(c.parentId) && c.parentId !== c.id) {
                categoryMap.get(c.parentId).children.push(c);
            } else {
                rootCategories.push(c);
            }
        });

        return NextResponse.json(rootCategories);
    } catch (error) {
        console.error('Error fetching product categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST /api/product-categories
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, name, description, parentId } = body;

        if (!code || !name) {
            return NextResponse.json({ error: 'Mã và tên danh mục là bắt buộc' }, { status: 400 });
        }

        let companyCode = body.companyId;
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

        const existing = await prisma.productCategory.findUnique({
            where: { companyId_code: { companyId, code } }
        });
        if (existing) {
            return NextResponse.json({ error: `Mã danh mục '${code}' đã tồn tại` }, { status: 400 });
        }

        const category = await prisma.productCategory.create({
            data: {
                companyId,
                code,
                name,
                description: description || null,
                parentId: parentId || null,
            }
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating product category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
