import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const journalCode = searchParams.get('journalCode');

        if (!journalCode) {
            return NextResponse.json({ error: "Missing journalCode" }, { status: 400 });
        }

        // Simple auth for dev/testing. Should get companyId from session.
        const company = await prisma.company.findFirst();
        if (!company) {
            return NextResponse.json({ error: "No company found" }, { status: 400 });
        }

        const journal = await prisma.journal.findFirst({
            where: {
                companyId: company.id,
                code: journalCode,
                isActive: true
            },
            include: {
                gridColumns: {
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });

        if (!journal) {
            return NextResponse.json({ error: "Journal not found" }, { status: 404 });
        }

        return NextResponse.json({
            journal: {
                id: journal.id,
                code: journal.code,
                name: journal.name,
                type: journal.type,
                prefix: journal.prefix
            },
            columns: journal.gridColumns,
        });

    } catch (error: any) {
        console.error("Voucher Config API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
