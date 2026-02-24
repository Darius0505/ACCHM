import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';

// GET /api/branches — List all branches
export async function GET(request: NextRequest) {
    // Requires BRANCHES:VIEW or just a general view permission? 
    // Usually branches are dropdown data, so maybe just authentication or minimal permission.
    // Let's enforce BRANCHES:VIEW if it exists, or just ensure authenticated.
    // Given the seed didn't explicitly create 'BRANCHES' module, we might check 'SYSTEM' view or similar.
    // Actually, seed created 'SYSTEM' -> 'BRANCHES' form (code BRANCHES).
    const denied = await requirePermission(request, 'BRANCHES', 'VIEW');
    if (denied) return denied;

    try {
        const branches = await prisma.branch.findMany({
            include: {
                _count: { select: { users: true, departments: true } },
            },
            orderBy: { code: 'asc' },
        });

        return NextResponse.json(branches.map(b => ({
            ...b,
            userCount: b._count.users,
            departmentCount: b._count.departments,
            _count: undefined,
        })));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/branches — Create branch
export async function POST(request: NextRequest) {
    const denied = await requirePermission(request, 'BRANCHES', 'ADD');
    if (denied) return denied;

    try {
        const body = await request.json();
        const { code, name, address, phone } = body;
        let { companyId } = body;

        // If companyId is not in body, try to get from header (set by middleware)
        if (!companyId) {
            companyId = request.headers.get('x-company-id');
        }

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        if (!code || !name) {
            return NextResponse.json({ error: 'Mã và tên chi nhánh là bắt buộc' }, { status: 400 });
        }

        const branch = await prisma.branch.create({
            data: {
                code: code.toUpperCase(),
                name,
                address: address || null,
                phone: phone || null,
                companyId: companyId,
            },
        });

        return NextResponse.json(branch, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Mã chi nhánh đã tồn tại' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
