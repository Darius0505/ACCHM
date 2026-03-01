// Report Templates API
// GET: List templates, POST: Create template

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VAS_TEMPLATES } from '@/config/reports/vasTemplates';

// GET /api/report-templates
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('companyId');
        const type = searchParams.get('type');
        const category = searchParams.get('category');
        const includeSystem = searchParams.get('includeSystem') !== 'false';

        if (!companyId) {
            return NextResponse.json(
                { error: 'companyId is required' },
                { status: 400 }
            );
        }

        // Get custom templates from database
        // Note: Using 'as any' because ReportTemplate table may not exist until migration
        let dbTemplates: { id: string; config: string; code: string; name: string; type: string; category: string; isActive: boolean; sortOrder: number;[key: string]: unknown }[] = [];
        try {
            dbTemplates = await (prisma as any).reportTemplate.findMany({
                where: {
                    companyId,
                    ...(type && { type }),
                    ...(category && { category }),
                    isActive: true
                },
                orderBy: { sortOrder: 'asc' }
            });
        } catch {
            // Table might not exist yet - that's OK, just return VAS templates
            console.log('ReportTemplate table not yet migrated');
        }

        // Parse config JSON for each template  
        const templates = dbTemplates.map((t: { config: string;[key: string]: unknown }) => ({
            ...t,
            config: JSON.parse(t.config)
        }));

        // Include VAS templates if requested
        if (includeSystem) {
            const vasTemplates = VAS_TEMPLATES
                .filter(t => !type || t.type === type)
                .filter(t => !category || t.category === category)
                .map(t => ({
                    id: `vas-${t.code}`,
                    companyId,
                    code: t.code,
                    name: t.name,
                    nameEN: t.nameEN,
                    type: t.type,
                    category: t.category,
                    config: t.config,
                    isSystem: true,
                    isActive: true,
                    sortOrder: t.sortOrder,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }));

            return NextResponse.json([...vasTemplates, ...templates]);
        }

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
        );
    }
}

// POST /api/report-templates
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { companyId, code, name, nameEN, type, category, config, sortOrder } = body;

        if (!companyId || !code || !name || !type || !category || !config) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check for duplicate code
        const existing = await (prisma as any).reportTemplate.findUnique({
            where: { companyId_code: { companyId, code } }
        });

        if (existing) {
            return NextResponse.json(
                { error: `Template with code '${code}' already exists` },
                { status: 409 }
            );
        }

        const template = await (prisma as any).reportTemplate.create({
            data: {
                companyId,
                code,
                name,
                nameEN,
                type,
                category,
                config: JSON.stringify(config),
                sortOrder: sortOrder || 0,
                isSystem: false,
                isActive: true
            }
        });

        return NextResponse.json({
            ...template,
            config: JSON.parse(template.config as string)
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json(
            { error: 'Failed to create template' },
            { status: 500 }
        );
    }
}
