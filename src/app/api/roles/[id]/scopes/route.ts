import { NextRequest, NextResponse } from 'next/server';
import { rbacService } from '@/services/rbac.service';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';

// GET /api/roles/[id]/scopes — Get data scopes for a role
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'ROLES', 'VIEW');
    if (denied) return denied;

    try {
        const scopes = await prisma.roleDataScope.findMany({
            where: { roleId: params.id },
        });
        return NextResponse.json(scopes);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/roles/[id]/scopes — Update data scopes
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'ROLES', 'EDIT');
    if (denied) return denied;

    try {
        const { scopes } = await request.json();
        const updatedBy = request.headers.get('x-user-id') || undefined;

        await rbacService.updateRoleDataScopes(params.id, scopes || [], updatedBy);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
