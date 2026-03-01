
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding test data for Opening Balances...');

    // 1. Ensure Company
    let company = await prisma.company.findFirst();
    if (!company) {
        company = await prisma.company.create({
            data: {
                code: 'TEST_COMPANY',
                name: 'Test Company Ltd.',
                address: '123 Test St',
                taxCode: '123456789',
                email: 'test@example.com',
                phone: '0123456789',
            }
        });
        console.log('✅ Created Company:', company.name);
    } else {
        console.log('ℹ️ Using existing Company:', company.name);
    }

    // 2. Ensure GL Accounts (112, 153, 211)
    const accountCodes = [
        { code: '1121', name: 'Tiền gửi ngân hàng VND' },
        { code: '1531', name: 'Công cụ, dụng cụ' },
        { code: '2111', name: 'Tài sản cố định hữu hình' }
    ];

    for (const acc of accountCodes) {
        const existing = await prisma.account.findFirst({ where: { companyId: company.id, code: acc.code } });
        if (!existing) {
            await prisma.account.create({
                data: {
                    companyId: company.id,
                    code: acc.code,
                    name: acc.name,
                    type: 'ASSET',
                    nature: 'DEBIT',
                    isPosting: true
                }
            });
            console.log(`✅ Created Account: ${acc.code}`);
        } else {
            if (!existing.isPosting) {
                await prisma.account.update({
                    where: { id: existing.id },
                    data: { isPosting: true }
                });
                console.log(`✅ Updated Account ${acc.code} to isPosting=true`);
            } else {
                console.log(`ℹ️ Account ${acc.code} exists.`);
            }
        }
    }

    // 3. Create Bank Account
    const existingBank = await prisma.bankAccount.findFirst({ where: { companyId: company.id, code: 'VCB_001' } });
    if (!existingBank) {
        await prisma.bankAccount.create({
            data: {
                companyId: company.id,
                code: 'VCB_001',
                name: 'VCB Main Account',
                bankName: 'Vietcombank',
                accountNumber: '999888777',
                currency: 'VND',
                accountId: (await prisma.account.findFirst({ where: { code: '1121' } }))!.id
            }
        });
        console.log('✅ Created Bank Account: VCB_001');
    } else {
        console.log('ℹ️ Bank Account VCB_001 exists.');
    }

    // 4. Create Fixed Asset
    const existingAsset = await prisma.fixedAsset.findFirst({ where: { companyId: company.id, code: 'FA_001' } });
    if (!existingAsset) {
        await prisma.fixedAsset.create({
            data: {
                companyId: company.id,
                code: 'FA_001',
                name: 'MacBook Pro M3',
                originalPrice: 50000000,
                costAccountId: (await prisma.account.findFirst({ where: { code: '2111' } }))!.id,
                isActive: true
            }
        });
        console.log('✅ Created Fixed Asset: FA_001');
    } else {
        console.log('ℹ️ Fixed Asset FA_001 exists.');
    }

    // 5. Create Product (Tool)
    const existingTool = await prisma.product.findFirst({ where: { companyId: company.id, code: 'TOOL_001' } });
    if (!existingTool) {
        await prisma.product.create({
            data: {
                companyId: company.id,
                code: 'TOOL_001',
                name: 'Drill Set',
                type: 'TOOL',
                unit: 'Set',
                isActive: true
            }
        });
        console.log('✅ Created Tool Product: TOOL_001');
    } else {
        console.log('ℹ️ Tool Product TOOL_001 exists.');
    }

    // 5b. Create Warehouse
    let warehouse = await prisma.warehouse.findFirst({ where: { companyId: company.id } });
    if (!warehouse) {
        warehouse = await prisma.warehouse.create({
            data: {
                companyId: company.id,
                code: 'WH_MAIN',
                name: 'Main Warehouse'
            }
        });
        console.log('✅ Created Warehouse: WH_MAIN');
    } else {
        console.log('ℹ️ Warehouse exists.');
    }

    console.log('6. Seeding Opening Balance Details...');

    // 6a. Bank Account Opening Balance
    const acc1121 = await prisma.account.findFirst({ where: { companyId: company.id, code: '1121' } });
    const bankAcct = await prisma.bankAccount.findFirst({ where: { companyId: company.id, code: 'VCB_001' } });

    if (acc1121 && bankAcct) {
        // Check if exists
        const existingDetail = await prisma.openingBalanceDetail.findFirst({
            where: { accountId: acc1121.id, bankAccountId: bankAcct.id }
        });

        if (!existingDetail) {
            await prisma.openingBalanceDetail.create({
                data: {
                    companyId: company.id,
                    accountId: acc1121.id,
                    bankAccountId: bankAcct.id,
                    amount: 500000000,
                    debit: 500000000,
                    credit: 0,
                    note: 'Initial Bank Balance'
                }
            });
            // Update parent account
            await prisma.account.update({
                where: { id: acc1121.id },
                data: { openingDebit: 500000000 }
            });
            console.log('✅ Created Opening Balance for Bank 1121');
        } else {
            console.log('ℹ️ Opening Balance for Bank 1121 exists.');
        }
    }

    // 6b. Fixed Asset Opening Balance
    const acc2111 = await prisma.account.findFirst({ where: { companyId: company.id, code: '2111' } });
    const fixedAsset = await prisma.fixedAsset.findFirst({ where: { companyId: company.id, code: 'FA_001' } });

    if (acc2111 && fixedAsset) {
        const existingDetail = await prisma.openingBalanceDetail.findFirst({
            where: { accountId: acc2111.id, fixedAssetId: fixedAsset.id }
        });

        if (!existingDetail) {
            await prisma.openingBalanceDetail.create({
                data: {
                    companyId: company.id,
                    accountId: acc2111.id,
                    fixedAssetId: fixedAsset.id,
                    amount: 50000000,
                    debit: 50000000,
                    credit: 0,
                    note: 'Initial Fixed Asset Value'
                }
            });
            // Update parent account
            await prisma.account.update({
                where: { id: acc2111.id },
                data: { openingDebit: 50000000 }
            });
            console.log('✅ Created Opening Balance for Fixed Asset 2111');
        } else {
            console.log('ℹ️ Opening Balance for Fixed Asset 2111 exists.');
        }
    }

    // 6c. Tool Product Opening Balance
    const acc1531 = await prisma.account.findFirst({ where: { companyId: company.id, code: '1531' } });
    const toolProduct = await prisma.product.findFirst({ where: { companyId: company.id, code: 'TOOL_001' } });

    // Ensure warehouse logic if needed, but for now just product
    // Note: Schema requires warehouseId only if we want to track by warehouse
    // Let's assume we put it in KHO-CC (Tools) or KHO-TONG
    let whMain = await prisma.warehouse.findFirst({ where: { companyId: company.id, code: 'KHO-CC' } });
    if (!whMain) {
        whMain = await prisma.warehouse.findFirst({ where: { companyId: company.id } });
    }

    if (acc1531 && toolProduct && whMain) {
        const existingDetail = await prisma.openingBalanceDetail.findFirst({
            where: { accountId: acc1531.id, productId: toolProduct.id }
        });

        if (!existingDetail) {
            await prisma.openingBalanceDetail.create({
                data: {
                    companyId: company.id,
                    accountId: acc1531.id,
                    productId: toolProduct.id,
                    warehouseId: whMain.id,
                    quantity: 10,
                    unitPrice: 500000,
                    amount: 5000000,
                    debit: 5000000,
                    credit: 0,
                    note: 'Initial Tools Stock'
                }
            });
            // Update parent account
            await prisma.account.update({
                where: { id: acc1531.id },
                data: { openingDebit: 5000000 }
            });
            console.log('✅ Created Opening Balance for Tools 1531');
        } else {
            console.log('ℹ️ Opening Balance for Tools 1531 exists.');
        }
    }

    console.log('🏁 Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
