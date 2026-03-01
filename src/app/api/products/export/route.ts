
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // 1. Resolve Company
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

        // 2. Build Filter
        const categoryId = searchParams.get('categoryId');
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        const where: any = {
            companyId,
            isActive: true,
        };

        if (categoryId) where.productCategoryId = categoryId;
        if (type) where.type = type;
        if (search) {
            where.OR = [
                { code: { contains: search } },
                { name: { contains: search } },
            ];
        }

        // 3. Fetch Data
        const products = await prisma.product.findMany({
            where,
            include: {
                category: { select: { name: true } }
            },
            orderBy: [{ type: 'asc' }, { code: 'asc' }],
        });

        // 4. Generate Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh sách Vật tư Hàng hóa');

        // Columns
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 6 },
            { header: 'Mã VTHH', key: 'code', width: 15 },
            { header: 'Tên Vật tư Hàng hóa', key: 'name', width: 35 },
            { header: 'ĐVT', key: 'unit', width: 8 },
            { header: 'Loại', key: 'type', width: 15 },
            { header: 'Danh mục', key: 'category', width: 20 },
            { header: 'Giá mua', key: 'purchasePrice', width: 15 },
            { header: 'Giá bán', key: 'salePrice', width: 15 },
            { header: 'Thuế suất', key: 'taxRate', width: 10 },
            { header: 'TK Kho', key: 'inventoryAccount', width: 10 },
            { header: 'TK Giá vốn', key: 'cogsAccount', width: 10 },
            { header: 'TK Doanh thu', key: 'revenueAccount', width: 12 },
        ];

        // Style Header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).height = 25;

        // Add Data
        const typeMap: Record<string, string> = {
            'PRODUCT': 'Thành phẩm',
            'MATERIAL': 'Nguyên vật liệu',
            'TOOL': 'Công cụ dụng cụ',
            'SERVICE': 'Dịch vụ'
        };

        products.forEach((p, index) => {
            worksheet.addRow({
                stt: index + 1,
                code: p.code,
                name: p.name,
                unit: p.unit,
                type: typeMap[p.type] || p.type,
                category: p.category?.name || '',
                purchasePrice: Number(p.purchasePrice),
                salePrice: Number(p.salePrice),
                taxRate: Number(p.taxRate),
                inventoryAccount: p.inventoryAccountId,
                cogsAccount: p.cogsAccountId,
                revenueAccount: p.revenueAccountId,
            });
        });

        // Format Currency Columns (G, H) -> PurchasePrice, SalePrice
        worksheet.getColumn('purchasePrice').numFmt = '#,##0';
        worksheet.getColumn('salePrice').numFmt = '#,##0';
        worksheet.getColumn('taxRate').numFmt = '0"%"';

        // Buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Response
        const filename = `DS_VTHH_${new Date().toISOString().slice(0, 10)}.xlsx`;

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
