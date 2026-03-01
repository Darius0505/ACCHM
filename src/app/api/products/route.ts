// Products API - GET and POST
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        let companyCode = searchParams.get('companyId');

        const categoryId = searchParams.get('categoryId');
        const type = searchParams.get('type');
        const search = searchParams.get('search');

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

        const where: any = {
            companyId,
            isActive: true,
        };

        if (categoryId) where.productCategoryId = categoryId;
        if (type) where.type = type;
        if (search) {
            where.OR = [
                { code: { contains: search } },
                { name: { contains: search } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                category: {
                    select: { id: true, code: true, name: true }
                }
            },
            orderBy: [{ type: 'asc' }, { code: 'asc' }],
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST /api/products
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            code, name, nameEN, type, unit,
            productCategoryId,
            purchasePrice, salePrice, taxRate,
            inventoryAccountId, cogsAccountId, revenueAccountId
        } = body;

        if (!code || !name) {
            return NextResponse.json({ error: 'Mã và tên sản phẩm là bắt buộc' }, { status: 400 });
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

        const existing = await prisma.product.findUnique({
            where: { companyId_code: { companyId, code } }
        });
        if (existing) {
            return NextResponse.json({ error: `Mã sản phẩm '${code}' đã tồn tại` }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                companyId,
                code,
                name,
                nameEN: nameEN || null,
                type: type || 'PRODUCT',
                unit: unit || null,
                productCategoryId: productCategoryId || null,
                purchasePrice: purchasePrice || 0,
                salePrice: salePrice || 0,
                taxRate: taxRate || 0,
                inventoryAccountId: inventoryAccountId || null,
                cogsAccountId: cogsAccountId || null,
                revenueAccountId: revenueAccountId || null,
            },
            include: {
                category: { select: { id: true, code: true, name: true } }
            }
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
