
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';
import { getUserFromRequest } from '@/lib/auth';

// GET: List all journals
export async function GET(request: NextRequest) {
    const check = await requirePermission(request, 'accounting.settings', 'VIEW');
    if (check) return check;

    try {
        const { searchParams } = new URL(request.url);
        const { companyId } = getUserFromRequest(request);

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID not found' }, { status: 400 });
        }

        const journals = await prisma.journal.findMany({
            where: {
                companyId,
                isActive: true
            },
            orderBy: { code: 'asc' }
        });

        return NextResponse.json(journals);
    } catch (error) {
        console.error('Error fetching journals:', error);
        return NextResponse.json({ error: 'Failed to fetch journals' }, { status: 500 });
    }
}

// POST: Create new journal
export async function POST(request: NextRequest) {
    const check = await requirePermission(request, 'accounting.settings', 'EDIT');
    if (check) return check;

    try {
        const { companyId } = getUserFromRequest(request);
        if (!companyId) {
            return NextResponse.json({ error: 'Company ID not found' }, { status: 400 });
        }

        const body = await request.json();
        const { code, name, nameEN, type, prefix } = body;

        // Validation
        if (!code || !name || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existing = await prisma.journal.findFirst({
            where: {
                companyId,
                code
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Journal code already exists' }, { status: 400 });
        }

        const journal = await prisma.journal.create({
            data: {
                companyId,
                code,
                name,
                nameEN,
                type,
                prefix: prefix || code, // Default prefix to code if not provided
                isActive: true
            }
        });

        return NextResponse.json(journal);
    } catch (error) {
        console.error('Error creating journal:', error);
        return NextResponse.json({ error: 'Failed to create journal' }, { status: 500 });
    }
}
