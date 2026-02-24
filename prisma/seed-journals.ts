
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Standard Accounting Vouchers (Journals)...');

    const company = await prisma.company.findFirst();
    if (!company) {
        console.error('❌ No company found. Please run seed-test-data.ts first.');
        return;
    }

    const journals = [
        { code: 'PT', name: 'Phiếu Thu', nameEN: 'Cash Receipt', type: 'CASH', prefix: 'PT' },
        { code: 'PC', name: 'Phiếu Chi', nameEN: 'Cash Payment', type: 'CASH', prefix: 'PC' },
        { code: 'BC', name: 'Báo Có (Thu Tiền Gửi)', nameEN: 'Bank Credit', type: 'BANK', prefix: 'BC' },
        { code: 'BN', name: 'Báo Nợ (Chi Tiền Gửi)', nameEN: 'Bank Debit', type: 'BANK', prefix: 'BN' },
        { code: 'PKT', name: 'Phiếu Kế Toán', nameEN: 'General Journal', type: 'GENERAL', prefix: 'PKT' },
        { code: 'HDBH', name: 'Hóa Đơn Bán Hàng', nameEN: 'Sales Invoice', type: 'SALES', prefix: 'HDBH' },
        { code: 'HDMH', name: 'Hóa Đơn Mua Hàng', nameEN: 'Purchase Invoice', type: 'PURCHASE', prefix: 'HDMH' },
        { code: 'PNK', name: 'Phiếu Nhập Kho', nameEN: 'Inventory Receipt', type: 'INVENTORY', prefix: 'PNK' },
        { code: 'PXK', name: 'Phiếu Xuất Kho', nameEN: 'Inventory Issue', type: 'INVENTORY', prefix: 'PXK' },
    ];

    for (const j of journals) {
        const journal = await prisma.journal.upsert({
            where: { companyId_code: { companyId: company.id, code: j.code } },
            update: {
                name: j.name,
                nameEN: j.nameEN,
                type: j.type,
                prefix: j.prefix
            },
            create: {
                companyId: company.id,
                code: j.code,
                name: j.name,
                nameEN: j.nameEN,
                type: j.type,
                prefix: j.prefix,
                isActive: true
            }
        });
        console.log(`✅ Ensure Journal: ${j.name} (${j.code})`);
    }

    console.log('🏁 Seeding Journals complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
