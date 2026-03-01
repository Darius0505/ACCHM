
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';
import { getUserFromRequest } from '@/lib/auth';

// PUT: Update journal
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const check = await requirePermission(request, 'accounting.settings', 'EDIT');
    if (check) return check;

    try {
        const { companyId } = getUserFromRequest(request);
        const { id } = params;
        const body = await request.json();
        const { name, nameEN, type, prefix } = body;

        // Ensure journal belongs to company
        const existing = await prisma.journal.findFirst({
            where: { id, companyId }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
        }

        const updated = await prisma.journal.update({
            where: { id },
            data: {
                name,
                nameEN,
                type,
                prefix
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating journal:', error);
        return NextResponse.json({ error: 'Failed to update journal' }, { status: 500 });
    }
}

// DELETE: Soft delete journal
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const check = await requirePermission(request, 'accounting.settings', 'DELETE');
    if (check) return check;

    try {
        const { companyId } = getUserFromRequest(request);
        const { id } = params;

        const existing = await prisma.journal.findFirst({
            where: { id, companyId }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
        }

        // Check if used in transactions (optional but good practice)
        // const usageCount = await prisma.journalEntry.count({ where: { journalId: id } });
        // if (usageCount > 0) return NextResponse.json({ error: 'Cannot delete used journal' }, { status: 400 });

        await prisma.journal.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting journal:', error);
        return NextResponse.json({ error: 'Failed to delete journal' }, { status: 500 });
    }
}
