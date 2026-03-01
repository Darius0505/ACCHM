
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to build hierarchy
function buildHierarchy(items: any[]) {
    const map = new Map();
    const roots: any[] = [];

    // First pass: map items
    items.forEach(item => {
        map.set(item.id, { ...item, children: [] });
    });

    // Second pass: link to parents
    items.forEach(item => {
        if (item.parentId && map.has(item.parentId) && item.parentId !== item.id) {
            map.get(item.parentId).children.push(map.get(item.id));
        } else {
            roots.push(map.get(item.id));
        }
    });

    return roots;
}

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

        const warehouses = await prisma.warehouse.findMany({
            where: {
                companyId: companyId || undefined, // undefined to avoid weird Prisma errors if null
                isActive: true
            },
            orderBy: [{ code: 'asc' }]
        });

        const hierarchy = buildHierarchy(warehouses);
        return NextResponse.json(hierarchy);
    } catch (error) {
        console.error('Error fetching warehouses:', error);
        return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, name, address, description, parentId, companyId: reqCompanyId } = body;

        let companyCode = reqCompanyId;
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

        // Validate duplicates
        const existing = await prisma.warehouse.findFirst({
            where: {
                companyId,
                code,
                isActive: true
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Mã kho đã tồn tại' }, { status: 400 });
        }

        const newWarehouse = await prisma.warehouse.create({
            data: {
                companyId,
                code,
                name,
                address,
                description,
                parentId: parentId || null
            }
        });

        return NextResponse.json(newWarehouse, { status: 201 });
    } catch (error) {
        console.error('Error creating warehouse:', error);
        return NextResponse.json({ error: 'Failed to create warehouse' }, { status: 500 });
    }
}
