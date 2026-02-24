
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { requirePermission } from '@/lib/rbac.middleware';

export async function GET(request: NextRequest) {
    const check = await requirePermission(request, 'accounting.settings.view');
    if (check) return check;

    try {
        const workbook = new ExcelJS.Workbook();

        // 1. Sheet "Accounts"
        const sheetAccounts = workbook.addWorksheet('Accounts');
        sheetAccounts.columns = [
            { header: 'Account Code', key: 'code', width: 15 },
            { header: 'Account Name', key: 'name', width: 30 },
            { header: 'Opening Debit', key: 'debit', width: 15 },
            { header: 'Opening Credit', key: 'credit', width: 15 },
        ];

        const accounts = await prisma.account.findMany({
            orderBy: { code: 'asc' },
            select: { code: true, name: true, openingDebit: true, openingCredit: true }
        });

        accounts.forEach(acc => {
            sheetAccounts.addRow({
                code: acc.code,
                name: acc.name,
                debit: Number(acc.openingDebit) || 0,
                credit: Number(acc.openingCredit) || 0
            });
        });

        // 2. Sheet "Details"
        const sheetDetails = workbook.addWorksheet('Details');
        sheetDetails.columns = [
            { header: 'Account Code', key: 'accountCode', width: 15 },
            { header: 'Partner Code', key: 'partnerCode', width: 15 },
            { header: 'Product Code', key: 'productCode', width: 15 },
            { header: 'Warehouse Code', key: 'warehouseCode', width: 15 },
            { header: 'Quantity', key: 'quantity', width: 12 },
            { header: 'Unit Price', key: 'unitPrice', width: 15 },
            { header: 'Debit Amount', key: 'debit', width: 15 },
            { header: 'Credit Amount', key: 'credit', width: 15 },
            { header: 'Note', key: 'note', width: 30 },
        ];

        const details = await prisma.openingBalanceDetail.findMany({
            include: {
                account: { select: { code: true } },
                partner: { select: { code: true } },
                product: { select: { code: true } },
                warehouse: { select: { code: true } },
            },
            orderBy: { account: { code: 'asc' } }
        });

        details.forEach(row => {
            sheetDetails.addRow({
                accountCode: row.account.code,
                partnerCode: row.partner?.code || '',
                productCode: row.product?.code || '',
                warehouseCode: row.warehouse?.code || '',
                quantity: Number(row.quantity) || 0,
                unitPrice: Number(row.unitPrice) || 0,
                debit: Number(row.debit) || 0,
                credit: Number(row.credit) || 0,
                note: row.note || ''
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="opening_balances.xlsx"'
            }
        });

    } catch (error) {
        console.error('Export Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
