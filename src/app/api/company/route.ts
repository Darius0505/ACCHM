
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/company
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        let companyCode = searchParams.get('companyId'); // Historically we use companyId param for code sometimes, need to standardise

        let company;

        // Try to find by ID or Code or Default
        if (companyCode && companyCode.match(/^[0-9a-f-]{36}$/i)) {
            company = await prisma.company.findUnique({ where: { id: companyCode } });
        } else if (companyCode) {
            company = await prisma.company.findFirst({ where: { code: companyCode } });
        }

        if (!company) {
            // Fallback to first company (Single tenant assumption for now)
            company = await prisma.company.findFirst();
        }

        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error('Error fetching company:', error);
        return NextResponse.json({ error: 'Failed to fetch company info' }, { status: 500 });
    }
}

// POST /api/company
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, name, taxCode, address, phone, email } = body;

        if (!code || !name) {
            return NextResponse.json({ error: 'Code and Name are required' }, { status: 400 });
        }

        const company = await prisma.company.create({
            data: {
                code,
                name,
                taxCode: taxCode || null,
                address: address || null,
                phone: phone || null,
                email: email || null,
                // Defaults
                currency: 'VND',
                fiscalYearStart: 1,
                accountingStandard: 'VAS',
            }
        });

        return NextResponse.json(company, { status: 201 });
    } catch (error: any) {
        console.error('Error creating company:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Company code already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
    }
}

// PUT /api/company
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, code, name, nameEN, nameJP, nameOther, address, taxCode, phone, email, fax, website, logo, directorName, chiefAccountantName, establishedDate, currency, fiscalYearStart, accountingStandard } = body;

        if (!id) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        const data: any = {};
        if (code) data.code = code;
        if (name) data.name = name;
        if (nameEN !== undefined) data.nameEN = nameEN;
        if (nameJP !== undefined) data.nameJP = nameJP;
        if (nameOther !== undefined) data.nameOther = nameOther;
        if (address !== undefined) data.address = address;
        if (taxCode !== undefined) data.taxCode = taxCode;
        if (phone !== undefined) data.phone = phone;
        if (email !== undefined) data.email = email;
        if (fax !== undefined) data.fax = fax;
        if (website !== undefined) data.website = website;
        if (logo !== undefined) data.logo = logo;
        if (directorName !== undefined) data.directorName = directorName;
        if (chiefAccountantName !== undefined) data.chiefAccountantName = chiefAccountantName;
        if (establishedDate !== undefined) data.establishedDate = establishedDate ? new Date(establishedDate) : null;

        if (currency) data.currency = currency;
        if (fiscalYearStart) data.fiscalYearStart = parseInt(fiscalYearStart.toString());
        if (accountingStandard) data.accountingStandard = accountingStandard;

        const updated = await prisma.company.update({
            where: { id },
            data
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating company:', error);
        return NextResponse.json({ error: 'Failed to update company info' }, { status: 500 });
    }
}
