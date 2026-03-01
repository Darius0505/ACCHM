// Partner Types API
// GET: List with hierarchy, POST: Create
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/partner-types?companyId=xxx&nature=CUSTOMER
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        let companyId = searchParams.get('companyId');
        const nature = searchParams.get('nature');
        const flat = searchParams.get('flat') === 'true';

        // Support both UUID and company code
        if (companyId && companyId.length < 36) {
            const company = await prisma.company.findUnique({ where: { code: companyId } });
            if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
            companyId = company.id;
        }

        if (!companyId) {
            // Fallback: get first company
            const company = await prisma.company.findFirst();
            if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });
            companyId = company.id;
        }

        const where: any = {
            companyId,
            isActive: true,
        };

        if (nature) where.nature = nature;

        // Flat list (for dropdowns)
        if (flat) {
            const types = await prisma.partnerType.findMany({
                where,
                orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
            });
            return NextResponse.json(types);
        }

        // Hierarchical (parent + children)
        const types = await prisma.partnerType.findMany({
            where: { ...where, parentId: null },
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                },
                _count: { select: { partners: true } },
            },
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json(types);
    } catch (error) {
        console.error('Error fetching partner types:', error);
        return NextResponse.json({ error: 'Failed to fetch partner types' }, { status: 500 });
    }
}

// POST /api/partner-types
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        let { companyId } = body;
        const { code, name, nameEN, nature, description, parentId, sortOrder } = body;

        // Resolve companyId from code if needed
        if (companyId && companyId.length < 36) {
            const company = await prisma.company.findUnique({ where: { code: companyId } });
            if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
            companyId = company.id;
        }
        if (!companyId) {
            const company = await prisma.company.findFirst();
            if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });
            companyId = company.id;
        }

        if (!code || !name || !nature) {
            return NextResponse.json({ error: 'Missing required fields: code, name, nature' }, { status: 400 });
        }

        // Check duplicate
        const existing = await prisma.partnerType.findUnique({
            where: { companyId_code: { companyId, code } }
        });
        if (existing) {
            return NextResponse.json({ error: `Code '${code}' đã tồn tại` }, { status: 409 });
        }

        const partnerType = await prisma.partnerType.create({
            data: {
                companyId,
                code,
                name,
                nameEN,
                nature,
                description,
                parentId: parentId || null,
                sortOrder: sortOrder || 0,
                isSystem: false,
                isActive: true,
            }
        });

        return NextResponse.json(partnerType, { status: 201 });
    } catch (error) {
        console.error('Error creating partner type:', error);
        return NextResponse.json({ error: 'Failed to create partner type' }, { status: 500 });
    }
}
