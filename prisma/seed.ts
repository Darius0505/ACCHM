// @ts-nocheck
/**
 * Prisma Seed Script for ACCHM ERP
 * Seeds initial data for Chart of Accounts (TT200)
 * Version: 1.1.0 (Simplified - No AID)
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface AccountSeed {
    code: string;
    name: string;
    nameEN?: string;
    nameJP?: string;
    nameOther?: string;
    type: string;
    nature: string;
    level: number;
    isPosting: boolean;
    children?: AccountSeed[];
}

async function seedCompany() {
    console.log('🏢 Seeding default company...');

    const company = await prisma.company.upsert({
        where: { code: 'DEFAULT' },
        update: {},
        create: {
            code: 'DEFAULT',
            name: 'Công ty TNHH Demo',
            nameEN: 'Demo Company Ltd.',
            nameJP: 'デモ株式会社',
            taxCode: '0123456789',
            address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
            phone: '028-12345678',
            email: 'info@demo.com.vn',
            currency: 'VND',
            fiscalYearStart: 1,
            accountingStandard: 'TT200'
        }
    });

    console.log(`✅ Company created: ${company.name}`);
    return company;
}

async function seedFiscalYear(companyId: string) {
    console.log('📅 Seeding fiscal year 2026...');

    const fiscalYear = await prisma.fiscalYear.upsert({
        where: {
            companyId_year: {
                companyId,
                year: 2026
            }
        },
        update: {},
        create: {
            companyId,
            name: 'Năm tài chính 2026',
            nameEN: 'Fiscal Year 2026',
            nameJP: '2026年度',
            year: 2026,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31'),
            status: 'OPEN'
        }
    });

    console.log(`✅ Fiscal year created: ${fiscalYear.name}`);

    // Create 12 accounting periods
    console.log('📅 Seeding accounting periods...');

    const monthNames = [
        'Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04',
        'Tháng 05', 'Tháng 06', 'Tháng 07', 'Tháng 08',
        'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const monthNamesEN = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];

    for (let month = 1; month <= 12; month++) {
        const startDate = new Date(2026, month - 1, 1);
        const endDate = new Date(2026, month, 0);

        await prisma.accountingPeriod.upsert({
            where: {
                fiscalYearId_periodNumber: {
                    fiscalYearId: fiscalYear.id,
                    periodNumber: month
                }
            },
            update: {},
            create: {
                fiscalYearId: fiscalYear.id,
                name: `${monthNames[month - 1]}/2026`,
                nameEN: `${monthNamesEN[month - 1]} 2026`,
                periodNumber: month,
                startDate,
                endDate,
                status: 'OPEN'
            }
        });
    }

    console.log('✅ 12 accounting periods created');
    return fiscalYear;
}

async function seedAccounts(companyId: string) {
    console.log('📊 Seeding Chart of Accounts (TT200)...');

    const seedFile = path.join(__dirname, 'seeds', 'accounts-tt200.json');
    const accountsData: AccountSeed[] = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));

    let accountCount = 0;

    async function insertAccount(account: AccountSeed, parentId: string | null = null): Promise<void> {
        const existingAccount = await prisma.account.findUnique({
            where: {
                companyId_code: {
                    companyId,
                    code: account.code
                }
            }
        });

        if (!existingAccount) {
            const createdAccount = await prisma.account.create({
                data: {
                    companyId,
                    code: account.code,
                    name: account.name,
                    nameEN: account.nameEN,
                    nameJP: account.nameJP,
                    nameOther: account.nameOther,
                    type: account.type,
                    nature: account.nature,
                    level: account.level,
                    isPosting: account.isPosting,
                    isActive: true,
                    parentId
                }
            });

            accountCount++;

            if (account.children && account.children.length > 0) {
                for (const child of account.children) {
                    await insertAccount(child, createdAccount.id);
                }
            }
        }
    }

    for (const account of accountsData) {
        await insertAccount(account, null);
    }

    console.log(`✅ ${accountCount} accounts created`);
}

async function seedJournals(companyId: string) {
    console.log('📓 Seeding default journals...');

    const journals = [
        { code: 'GJ', name: 'Nhật ký chung', nameEN: 'General Journal', nameJP: '仕訳帳', type: 'GENERAL', prefix: 'GJ' },
        { code: 'CR', name: 'Nhật ký thu tiền mặt', nameEN: 'Cash Receipts Journal', nameJP: '現金受入帳', type: 'CASH', prefix: 'PT' },
        { code: 'CP', name: 'Nhật ký chi tiền mặt', nameEN: 'Cash Payments Journal', nameJP: '現金支払帳', type: 'CASH', prefix: 'PC' },
        { code: 'BR', name: 'Nhật ký thu tiền ngân hàng', nameEN: 'Bank Receipts Journal', nameJP: '銀行受入帳', type: 'BANK', prefix: 'BC' },
        { code: 'BP', name: 'Nhật ký chi tiền ngân hàng', nameEN: 'Bank Payments Journal', nameJP: '銀行支払帳', type: 'BANK', prefix: 'BN' },
        { code: 'SJ', name: 'Nhật ký bán hàng', nameEN: 'Sales Journal', nameJP: '売上帳', type: 'SALES', prefix: 'HD' },
        { code: 'PJ', name: 'Nhật ký mua hàng', nameEN: 'Purchases Journal', nameJP: '仕入帳', type: 'PURCHASE', prefix: 'HDM' }
    ];

    for (const journal of journals) {
        await prisma.journal.upsert({
            where: {
                companyId_code: { companyId, code: journal.code }
            },
            update: {},
            create: {
                companyId,
                code: journal.code,
                name: journal.name,
                nameEN: journal.nameEN,
                nameJP: journal.nameJP,
                type: journal.type,
                prefix: journal.prefix,
                nextNumber: 1,
                isActive: true
            }
        });
    }

    console.log(`✅ ${journals.length} journals created`);
}

async function seedPartnerTypes(companyId: string) {
    console.log('👥 Seeding partner types...');

    const types = [
        {
            code: 'NH',
            name: 'Ngân hàng',
            nameEN: 'Bank',
            nameJP: '銀行',
            nature: 'BANK',
            description: 'Tài khoản ngân hàng, đối tác ngân hàng',
            isSystem: true,
            sortOrder: 1,
            children: [
                { code: 'NH_ND', name: 'Ngân hàng nội địa', nameEN: 'Domestic Bank', nature: 'BANK', description: 'Ngân hàng trong nước', sortOrder: 1 },
                { code: 'NH_NN', name: 'Ngân hàng nước ngoài', nameEN: 'Foreign Bank', nature: 'BANK', description: 'Ngân hàng quốc tế', sortOrder: 2 },
            ]
        },
        {
            code: 'KH',
            name: 'Khách hàng',
            nameEN: 'Customer',
            nameJP: '顧客',
            nature: 'CUSTOMER',
            description: 'Đối tượng mua hàng hóa, dịch vụ',
            isSystem: true,
            sortOrder: 2,
            children: [
                { code: 'KH_ND', name: 'Khách hàng nội địa', nameEN: 'Domestic Customer', nature: 'CUSTOMER', description: 'Khách hàng trong nước', sortOrder: 1 },
                { code: 'KH_XK', name: 'Khách hàng xuất khẩu', nameEN: 'Export Customer', nature: 'CUSTOMER', description: 'Khách hàng nước ngoài', sortOrder: 2 },
            ]
        },
        {
            code: 'NCC',
            name: 'Nhà cung cấp',
            nameEN: 'Vendor',
            nameJP: '仕入先',
            nature: 'VENDOR',
            description: 'Đối tượng cung cấp hàng hóa, dịch vụ',
            isSystem: true,
            sortOrder: 3,
            children: [
                { code: 'NCC_HH', name: 'NCC hàng hóa', nameEN: 'Goods Vendor', nature: 'VENDOR', description: 'Nhà cung cấp hàng hóa', sortOrder: 1 },
                { code: 'NCC_DV', name: 'NCC dịch vụ', nameEN: 'Service Vendor', nature: 'VENDOR', description: 'Nhà cung cấp dịch vụ', sortOrder: 2 },
            ]
        },
        {
            code: 'NV',
            name: 'Nhân viên',
            nameEN: 'Employee',
            nameJP: '従業員',
            nature: 'EMPLOYEE',
            description: 'Nhân viên trong công ty',
            isSystem: true,
            sortOrder: 4,
            children: []
        },
        {
            code: 'KHAC',
            name: 'Khác',
            nameEN: 'Other',
            nameJP: 'その他',
            nature: 'OTHER',
            description: 'Các đối tượng khác',
            isSystem: true,
            sortOrder: 5,
            children: []
        }
    ];

    let count = 0;
    for (const type of types) {
        const parent = await prisma.partnerType.upsert({
            where: { companyId_code: { companyId, code: type.code } },
            update: { sortOrder: type.sortOrder },
            create: {
                companyId,
                code: type.code,
                name: type.name,
                nameEN: type.nameEN,
                nameJP: type.nameJP,
                nature: type.nature,
                description: type.description,
                isSystem: type.isSystem,
                sortOrder: type.sortOrder,
            }
        });
        count++;

        for (const child of type.children) {
            await prisma.partnerType.upsert({
                where: { companyId_code: { companyId, code: child.code } },
                update: {},
                create: {
                    companyId,
                    code: child.code,
                    name: child.name,
                    nameEN: child.nameEN,
                    nature: child.nature,
                    description: child.description,
                    parentId: parent.id,
                    isSystem: false,
                    sortOrder: child.sortOrder,
                }
            });
            count++;
        }
    }

    console.log(`✅ ${count} partner types created`);
}


async function seedPartners(companyId: string) {
    console.log('🧑‍💼 Seeding partners...');

    // Get partner types for reference
    const partnerTypes = await prisma.partnerType.findMany({
        where: { companyId },
    });
    const getTypeId = (code: string) => partnerTypes.find(t => t.code === code)?.id || null;

    const partners = [
        // BANK
        { code: 'NH_VCB', name: 'Ngân hàng Vietcombank', nameEN: 'Vietcombank', type: 'BANK', partnerTypeCode: 'NH_ND', taxCode: '0100112437', address: '198 Trần Quang Khải, Q. Hoàn Kiếm, Hà Nội', phone: '024 38240510', email: 'info@vietcombank.com.vn', contactPerson: 'Phòng KHDN' },
        { code: 'NH_TCB', name: 'Ngân hàng Techcombank', nameEN: 'Techcombank', type: 'BANK', partnerTypeCode: 'NH_ND', taxCode: '0100230800', address: '191 Bà Triệu, Q. Hai Bà Trưng, Hà Nội', phone: '024 39446368', email: 'info@techcombank.com.vn', contactPerson: 'Phòng GD' },
        { code: 'NH_BIDV', name: 'Ngân hàng BIDV', nameEN: 'BIDV', type: 'BANK', partnerTypeCode: 'NH_ND', taxCode: '0100150619', address: '35 Hàng Vôi, Q. Hoàn Kiếm, Hà Nội', phone: '024 22200588', email: 'info@bidv.com.vn', contactPerson: 'Phòng KHDN' },

        // CUSTOMER
        { code: 'KH001', name: 'Công ty TNHH Thương mại ABC', nameEN: 'ABC Trading Co., Ltd', type: 'CUSTOMER', partnerTypeCode: 'KH', taxCode: '0312345678', address: '123 Nguyễn Huệ, Q1, TP.HCM', phone: '028 38001234', email: 'contact@abc.com.vn', contactPerson: 'Nguyễn Văn Minh' },
        { code: 'KH002', name: 'Công ty CP XNK Đông Nam Á', nameEN: 'SEA Export Import JSC', type: 'CUSTOMER', partnerTypeCode: 'KH', taxCode: '0301234567', address: '456 Lê Lợi, Q1, TP.HCM', phone: '028 39001234', email: 'info@seaexport.vn', contactPerson: 'Trần Thị Hoa' },
        { code: 'KH003', name: 'Công ty TNHH Sản xuất Minh Phát', nameEN: 'Minh Phat Manufacturing', type: 'CUSTOMER', partnerTypeCode: 'KH', taxCode: '3600123456', address: '789 CMT8, Q3, TP.HCM', phone: '028 35001234', email: 'order@minhphat.vn', contactPerson: 'Lê Hoàng Long' },

        // VENDOR
        { code: 'NCC001', name: 'Công ty TNHH Vật tư Hùng Vương', nameEN: 'Hung Vuong Materials', type: 'VENDOR', partnerTypeCode: 'NCC', taxCode: '0309876543', address: '321 Hai Bà Trưng, Q3, TP.HCM', phone: '028 38123456', email: 'sales@hungvuong.vn', contactPerson: 'Phạm Đức Hải' },
        { code: 'NCC002', name: 'Công ty CP Thiết bị Toàn Cầu', nameEN: 'Global Equipment JSC', type: 'VENDOR', partnerTypeCode: 'NCC', taxCode: '0108765432', address: '654 Hoàng Diệu, Q4, TP.HCM', phone: '028 36123456', email: 'info@globalequip.vn', contactPerson: 'Đỗ Minh Tâm' },
        { code: 'NCC003', name: 'Công ty TNHH DV Vận tải Phú Gia', nameEN: 'Phu Gia Logistics', type: 'VENDOR', partnerTypeCode: 'NCC', taxCode: '0311111222', address: '147 Phan Đăng Lưu, Q. Bình Thạnh', phone: '028 37123456', email: 'logistics@phugia.vn', contactPerson: 'Vũ Thị Lan' },

        // EMPLOYEE
        { code: 'NV001', name: 'Nguyễn Thành Đạt', nameEN: 'Nguyen Thanh Dat', type: 'EMPLOYEE', partnerTypeCode: 'NV', address: 'Q. Tân Bình, TP.HCM', phone: '0901234567', email: 'dat.nguyen@company.com', contactPerson: '' },
        { code: 'NV002', name: 'Lê Thị Thanh Hà', nameEN: 'Le Thi Thanh Ha', type: 'EMPLOYEE', partnerTypeCode: 'NV', address: 'Q. Gò Vấp, TP.HCM', phone: '0912345678', email: 'ha.le@company.com', contactPerson: '' },
        { code: 'NV003', name: 'Trần Minh Quân', nameEN: 'Tran Minh Quan', type: 'EMPLOYEE', partnerTypeCode: 'NV', address: 'Q7, TP.HCM', phone: '0923456789', email: 'quan.tran@company.com', contactPerson: '' },

        // OTHER
        { code: 'DT001', name: 'Cục Thuế TP.HCM', nameEN: 'HCMC Tax Department', type: 'OTHER', partnerTypeCode: 'KHAC', address: '63 Lý Tự Trọng, Q1, TP.HCM', phone: '028 38291471', email: 'cucthuehcm@gdt.gov.vn', contactPerson: '' },
        { code: 'DT002', name: 'BHXH TP.HCM', nameEN: 'HCMC Social Insurance', type: 'OTHER', partnerTypeCode: 'KHAC', address: '89 Pasteur, Q1, TP.HCM', phone: '028 38231449', email: 'bhxh.hcm@vss.gov.vn', contactPerson: '' },
    ];

    let count = 0;
    for (const p of partners) {
        const partnerTypeId = getTypeId(p.partnerTypeCode);
        await prisma.partner.upsert({
            where: { companyId_code: { companyId, code: p.code } },
            update: {},
            create: {
                companyId,
                code: p.code,
                name: p.name,
                nameEN: p.nameEN || null,
                type: p.type,
                partnerTypeId,
                taxCode: p.taxCode || null,
                address: p.address || null,
                phone: p.phone || null,
                email: p.email || null,
                contactPerson: p.contactPerson || null,
                paymentTermDays: 30,
            }
        });
        count++;
    }

    console.log(`✅ ${count} partners created`);
}

async function seedProductCategories(companyId: string) {
    console.log('📦 Seeding product categories...');

    const categories = [
        // Level 1
        { code: 'TP', name: 'Thành phẩm', description: 'Sản phẩm do công ty sản xuất' },
        { code: 'HH', name: 'Hàng hóa', description: 'Hàng hóa mua về để bán' },
        { code: 'NVL', name: 'Nguyên vật liệu', description: 'Vật tư dùng cho sản xuất' },
        { code: 'CCDC', name: 'Công cụ dụng cụ', description: 'Phân bổ dần vào chi phí' },
        { code: 'DV', name: 'Dịch vụ', description: 'Dịch vụ cung cấp hoặc mua vào' },

        // Level 2 - TP
        { code: 'TP-NT', name: 'Nội thất', parent: 'TP' },
        { code: 'TP-may-mac', name: 'May mặc', parent: 'TP' },

        // Level 2 - HH
        { code: 'HH-DT', name: 'Điện tử - Điện lạnh', parent: 'HH' },
        { code: 'HH-GD', name: 'Gia dụng', parent: 'HH' },
        { code: 'HH-VP', name: 'Văn phòng phẩm', parent: 'HH' },

        // Level 2 - NVL
        { code: 'NVL-GO', name: 'Gỗ các loại', parent: 'NVL' },
        { code: 'NVL-KL', name: 'Kim loại - Phụ kiện', parent: 'NVL' },
        { code: 'NVL-DA', name: 'Da - Vải', parent: 'NVL' },
    ];

    let count = 0;
    // Insert parent info map
    const codeIdMap: Record<string, string> = {};

    // First pass: Roots (no parent)
    for (const c of categories.filter(x => !x.parent)) {
        const res = await prisma.productCategory.upsert({
            where: { companyId_code: { companyId, code: c.code } },
            update: {},
            create: { companyId, code: c.code, name: c.name, description: c.description }
        });
        codeIdMap[c.code] = res.id;
        count++;
    }

    // Second pass: Children
    for (const c of categories.filter(x => x.parent)) {
        const parentId = codeIdMap[c.parent!];
        if (parentId) {
            const res = await prisma.productCategory.upsert({
                where: { companyId_code: { companyId, code: c.code } },
                update: {},
                create: { companyId, code: c.code, name: c.name, description: c.description, parentId }
            });
            codeIdMap[c.code] = res.id;
            count++;
        }
    }
    console.log(`✅ ${count} product categories created`);
}

async function seedProducts(companyId: string) {
    console.log('📦 Seeding products...');

    // Get categories to link
    const cats = await prisma.productCategory.findMany({ where: { companyId } });
    const getCatId = (code: string) => cats.find(c => c.code === code)?.id;

    const products = [
        // TP - NT
        { code: 'SOFA-01', name: 'Sofa da cao cấp Italia', type: 'PRODUCT', unit: 'Cái', cat: 'TP-NT', price: 25000000 },
        { code: 'BAN-01', name: 'Bàn ăn gỗ sồi 6 ghế', type: 'PRODUCT', unit: 'Bộ', cat: 'TP-NT', price: 12500000 },
        { code: 'GIUONG-01', name: 'Giường ngủ thông minh 1.8m', type: 'PRODUCT', unit: 'Cái', cat: 'TP-NT', price: 8900000 },

        // TP - May mac
        { code: 'AO-01', name: 'Áo sơ mi nam cao cấp', type: 'PRODUCT', unit: 'Cái', cat: 'TP-may-mac', price: 450000 },
        { code: 'QUAN-01', name: 'Quần tây nam công sở', type: 'PRODUCT', unit: 'Cái', cat: 'TP-may-mac', price: 550000 },

        // HH - Dien tu
        { code: 'LAP-DELL', name: 'Laptop Dell XPS 13', type: 'PRODUCT', unit: 'Cái', cat: 'HH-DT', price: 32000000, buyPrice: 28000000 },
        { code: 'ML-DK', name: 'Máy lạnh Daikin Inverter 1.5HP', type: 'PRODUCT', unit: 'Bộ', cat: 'HH-DT', price: 11500000, buyPrice: 9500000 },
        { code: 'TL-SS', name: 'Tủ lạnh Samsung Side-by-Side', type: 'PRODUCT', unit: 'Cái', cat: 'HH-DT', price: 24200000, buyPrice: 19000000 },

        // HH - Gia dung
        { code: 'NOI-01', name: 'Bộ nồi inox 304 5 món', type: 'PRODUCT', unit: 'Bộ', cat: 'HH-GD', price: 2500000, buyPrice: 1800000 },
        { code: 'CHAO-01', name: 'Chảo chống dính size 28', type: 'PRODUCT', unit: 'Cái', cat: 'HH-GD', price: 450000, buyPrice: 280000 },

        // HH - VP
        { code: 'GIAY-A4', name: 'Giấy in A4 Double A', type: 'PRODUCT', unit: 'Ram', cat: 'HH-VP', price: 85000, buyPrice: 65000 },
        { code: 'BUT-BI', name: 'Bút bi Thiên Long (Hộp)', type: 'PRODUCT', unit: 'Hộp', cat: 'HH-VP', price: 50000, buyPrice: 35000 },

        // NVL
        { code: 'GO-SOI', name: 'Gỗ sồi nhập khẩu Mỹ', type: 'MATERIAL', unit: 'm3', cat: 'NVL-GO', buyPrice: 18000000 },
        { code: 'GO-THONG', name: 'Gỗ thông Pallet', type: 'MATERIAL', unit: 'm3', cat: 'NVL-GO', buyPrice: 4500000 },
        { code: 'THEP-01', name: 'Thép tấm 5mm', type: 'MATERIAL', unit: 'kg', cat: 'NVL-KL', buyPrice: 25000 },
        { code: 'DA-BO', name: 'Da bò thuộc nguyên tấm', type: 'MATERIAL', unit: 'sf', cat: 'NVL-DA', buyPrice: 85000 },

        // CCDC
        { code: 'MAY-KHOAN', name: 'Máy khoan cầm tay Bosch', type: 'TOOL', unit: 'Cái', cat: 'CCDC', buyPrice: 1850000 },
        { code: 'MAY-MAI', name: 'Máy mài góc Makita', type: 'TOOL', unit: 'Cái', cat: 'CCDC', buyPrice: 1200000 },

        // DV
        { code: 'DV-VC', name: 'Dịch vụ vận chuyển nội thành', type: 'SERVICE', unit: 'Chuyến', cat: 'DV', salePrice: 500000 },
        { code: 'DV-LD', name: 'Dịch vụ lắp đặt & bảo trì', type: 'SERVICE', unit: 'Giờ', cat: 'DV', salePrice: 200000 },
    ];

    let count = 0;
    for (const p of products) {
        await prisma.product.upsert({
            where: { companyId_code: { companyId, code: p.code } },
            update: {},
            create: {
                companyId,
                code: p.code,
                name: p.name,
                type: p.type,
                unit: p.unit,
                productCategoryId: getCatId(p.cat),
                purchasePrice: p.buyPrice || 0,
                salePrice: p.price || p.salePrice || 0,
                taxRate: 8, // Default 8%
                inventoryAccountId: p.type === 'PRODUCT' ? '1561' : p.type === 'MATERIAL' ? '152' : p.type === 'TOOL' ? '153' : null,
                cogsAccountId: '632',
                revenueAccountId: '511',
            }
        });
        count++;
    }
    console.log(`✅ ${count} products created`);
}

async function seedAdminUser(companyId: string) {
    console.log('👤 Seeding roles and admin user...');

    // 1. Create Default Roles manually (upsert with null issues)
    let adminRole = await prisma.role.findFirst({
        where: { name: 'ADMIN', companyId: null }
    });

    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: {
                code: 'ADMIN',
                name: 'ADMIN',
                description: 'System Administrator - Full Access',
                companyId: null
            }
        });
    }

    let userRole = await prisma.role.findFirst({
        where: { name: 'USER', companyId: null }
    });

    if (!userRole) {
        userRole = await prisma.role.create({
            data: {
                code: 'USER',
                name: 'USER',
                description: 'Standard User',
                companyId: null
            }
        });
    }

    const additionalRoles = [
        { code: 'ACCOUNTANT', name: 'Kế toán', description: 'Kế toán viên - Quản lý chứng từ' },
        { code: 'WAREHOUSE', name: 'Thủ kho', description: 'Thủ kho - Quản lý nhập xuất tồn' },
        { code: 'SALES', name: 'Bán hàng', description: 'Nhân viên kinh doanh - Quản lý đơn hàng' },
        { code: 'PURCHASING', name: 'Thu mua', description: 'Nhân viên thu mua - Quản lý đơn mua' }
    ];

    for (const r of additionalRoles) {
        const exists = await prisma.role.findFirst({ where: { code: r.code, companyId: null } });
        if (!exists) {
            await prisma.role.create({
                data: {
                    code: r.code,
                    name: r.name,
                    description: r.description,
                    companyId: null
                }
            });
            console.log(`✅ Role created: ${r.name}`);
        }
    }

    // 2. Create Admin User
    const passwordHash = await import('bcryptjs').then(m => m.hash('admin123', 10));

    const user = await prisma.user.upsert({
        where: { email: 'admin@demo.com.vn' },
        update: {},
        create: {
            companyId,
            code: 'ADMIN_01',
            email: 'admin@demo.com.vn',
            name: 'Administrator',
            password: passwordHash,
            isActive: true,
            roles: {
                create: { roleId: adminRole.id, assignedBy: 'SYSTEM' }
            }
        }
    });


    // Ensure role assignment if user existed but role didn't
    const existingRole = await prisma.userRole.findUnique({
        where: { userId_roleId: { userId: user.id, roleId: adminRole.id } }
    });

    if (!existingRole) {
        await prisma.userRole.create({
            data: { userId: user.id, roleId: adminRole.id, assignedBy: 'SYSTEM' }
        });
    }

    console.log(`✅ Admin user created: ${user.email} with Role: ADMIN`);
    return user;
}

async function seedWarehouses(companyId: string) {
    console.log('🏭 Seeding warehouses...');

    const warehouses = [
        { code: 'KHO-TONG', name: 'Kho Tổng', address: 'Khu công nghiệp Tân Bình' },
        { code: 'KHO-HH', name: 'Kho Hàng hóa', address: 'Khu A', parent: 'KHO-TONG' },
        { code: 'KHO-NVL', name: 'Kho Nguyên vật liệu', address: 'Khu B', parent: 'KHO-TONG' },
        { code: 'KHO-CC', name: 'Kho Công cụ dụng cụ', address: 'Khu C', parent: 'KHO-TONG' },
        { code: 'KHO-TP', name: 'Kho Thành phẩm', address: 'Khu D', parent: 'KHO-TONG' },
    ];

    let count = 0;
    const codeIdMap: Record<string, string> = {};

    // 1. Roots
    for (const w of warehouses.filter(x => !x.parent)) {
        const res = await prisma.warehouse.upsert({
            where: { companyId_code: { companyId, code: w.code } },
            update: {},
            create: { companyId, code: w.code, name: w.name, address: w.address }
        });
        codeIdMap[w.code] = res.id;
        count++;
    }

    // 2. Children
    for (const w of warehouses.filter(x => x.parent)) {
        const parentId = codeIdMap[w.parent!];
        if (parentId) {
            const res = await prisma.warehouse.upsert({
                where: { companyId_code: { companyId, code: w.code } },
                update: {},
                create: { companyId, code: w.code, name: w.name, address: w.address, parentId }
            });
            codeIdMap[w.code] = res.id;
            count++;
        }
    }

    console.log(`✅ ${count} warehouses created`);
}


async function seedBankAccounts(companyId: string) {
    console.log('🏦 Seeding bank accounts...');

    // 1. Get Partners
    const vcb = await prisma.partner.findUnique({ where: { companyId_code: { companyId, code: 'NH_VCB' } } });
    const tcb = await prisma.partner.findUnique({ where: { companyId_code: { companyId, code: 'NH_TCB' } } });
    const bidv = await prisma.partner.findUnique({ where: { companyId_code: { companyId, code: 'NH_BIDV' } } });

    // 2. Get GL Account 1121
    const acc1121 = await prisma.account.findUnique({ where: { companyId_code: { companyId, code: '1121' } } });

    if (!acc1121) {
        console.log('⚠️ Account 1121 not found, skipping bank accounts.');
        return;
    }

    const banks = [
        {
            code: 'VCB-HCM', name: 'TK Thanh toán VCB HCM', bankName: 'Vietcombank',
            accountNumber: '0071001234567', branch: 'CN TP.HCM', currency: 'VND',
            partnerId: vcb?.id
        },
        {
            code: 'TCB-SGD', name: 'TK Techcombank SGD', bankName: 'Techcombank',
            accountNumber: '19034567890001', branch: 'Sở Giao Dịch', currency: 'VND',
            partnerId: tcb?.id
        },
        {
            code: 'BIDV-HT', name: 'TK BIDV Hà Thành USD', bankName: 'BIDV',
            accountNumber: '123456789 (USD)', branch: 'CN Hà Thành', currency: 'USD',
            partnerId: bidv?.id
        },
    ];

    let count = 0;
    for (const b of banks) {
        if (!b.partnerId) continue;
        await prisma.bankAccount.upsert({
            where: { companyId_code: { companyId, code: b.code } },
            update: {},
            create: {
                companyId,
                code: b.code,
                name: b.name,
                bankName: b.bankName,
                accountNumber: b.accountNumber,
                branch: b.branch,
                currency: b.currency,
                accountId: acc1121.id,
                partnerId: b.partnerId,
                isActive: true
            }
        });
        count++;
    }
    console.log(`✅ ${count} bank accounts created`);
}

async function seedCurrencies(companyId: string) {
    console.log('💱 Seeding currencies...');

    const currencies = [
        { code: 'VND', name: 'Đồng Việt Nam', symbol: '₫', exchangeRate: 1, isDefault: true },
        { code: 'USD', name: 'Đô la Mỹ', symbol: '$', exchangeRate: 25300, isDefault: false },
        { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 27500, isDefault: false },
        { code: 'JPY', name: 'Yên Nhật', symbol: '¥', exchangeRate: 165, isDefault: false },
    ];

    let count = 0;
    for (const c of currencies) {
        await prisma.currency.upsert({
            where: { companyId_code: { companyId, code: c.code } },
            update: {},
            create: {
                companyId,
                code: c.code,
                name: c.name,
                symbol: c.symbol,
                exchangeRate: c.exchangeRate,
                isDefault: c.isDefault
            }
        });
        count++;
    }
    console.log(`✅ ${count} currencies created`);
}

async function seedTaxGroups(companyId: string) {
    console.log('🏷️ Seeding tax groups...');
    const groups = [
        { code: 'GTGT', name: 'Thuế Giá trị gia tăng (VAT)' },
        { code: 'NK', name: 'Thuế Nhập khẩu' },
        { code: 'TTDB', name: 'Thuế Tiêu thụ đặc biệt' },
    ];
    for (const g of groups) {
        await prisma.taxGroup.upsert({
            where: { companyId_code: { companyId, code: g.code } },
            update: {},
            create: { companyId, code: g.code, name: g.name }
        });
    }
}

async function seedTaxRates(companyId: string) {
    console.log('📊 Seeding tax rates...');
    const gtgtGroup = await prisma.taxGroup.findUnique({
        where: { companyId_code: { companyId, code: 'GTGT' } }
    });

    if (gtgtGroup) {
        const rates = [
            { code: 'VAT10', name: 'Thuế GTGT 10%', rate: 10 },
            { code: 'VAT08', name: 'Thuế GTGT 8%', rate: 8 },
            { code: 'VAT05', name: 'Thuế GTGT 5%', rate: 5 },
            { code: 'VAT00', name: 'Thuế GTGT 0%', rate: 0 },
            { code: 'KKK', name: 'Không kê khai', rate: -1 }, // Special flag? Or just handle logic later
            { code: 'KCT', name: 'Không chịu thuế', rate: -2 },
        ];

        for (const r of rates) {
            await prisma.taxRate.upsert({
                where: { companyId_code: { companyId, code: r.code } },
                update: {},
                create: {
                    companyId,
                    taxGroupId: gtgtGroup.id,
                    code: r.code,
                    name: r.name,
                    rate: r.rate
                }
            });
        }
    }
}

async function seedPermissions(companyId: string) {
    console.log('🔒 Seeding modules, forms and permissions...');

    const modules = [
        {
            code: 'SYSTEM', name: 'Hệ thống', icon: '⚙️', order: 1,
            forms: [
                { code: 'USERS', name: 'Người dùng', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'RESET_PASSWORD'] },
                { code: 'ROLES', name: 'Vai trò & Phân quyền', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'] },
                { code: 'COMPANY', name: 'Thông tin công ty', actions: ['VIEW', 'EDIT'] },
                { code: 'BRANCHES', name: 'Chi nhánh', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'] },
                { code: 'DEPARTMENTS', name: 'Phòng ban', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'] },
            ]
        },
        {
            code: 'CATALOG', name: 'Danh mục', icon: '📁', order: 2,
            forms: [
                { code: 'PRODUCTS', name: 'Hàng hóa & Dịch vụ', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'IMPORT', 'EXPORT'] },
                { code: 'CUSTOMERS', name: 'Khách hàng', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'IMPORT', 'EXPORT'] },
                { code: 'VENDORS', name: 'Nhà cung cấp', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'IMPORT', 'EXPORT'] },
                { code: 'ACCOUNTS', name: 'Hệ thống tài khoản', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'] },
            ]
        },
        {
            code: 'ACCOUNTING', name: 'Kế toán', icon: 'calculator', order: 3,
            forms: [
                { code: 'CASH', name: 'Tiền mặt (Thu/Chi)', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'POST', 'UNPOST', 'PRINT'] },
                { code: 'BANK', name: 'Tiền gửi (Báo Có/Nợ)', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'POST', 'UNPOST', 'PRINT'] },
                { code: 'JOURNAL', name: 'Chứng từ chung', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'POST', 'UNPOST', 'PRINT'] },
            ]
        },
        {
            code: 'SALES', name: 'Bán hàng', icon: 'shopping-cart', order: 4,
            forms: [
                { code: 'QUOTATION', name: 'Báo giá', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'PRINT', 'SEND_EMAIL'] },
                { code: 'ORDER', name: 'Đơn đặt hàng', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'PRINT', 'APPROVE'] },
                { code: 'INVOICE', name: 'Hóa đơn bán hàng', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'POST', 'UNPOST', 'PRINT'] },
            ]
        },
        {
            code: 'PURCHASING', name: 'Mua hàng', icon: 'shopping-bag', order: 5,
            forms: [
                { code: 'PO', name: 'Đơn mua hàng', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'PRINT', 'APPROVE'] },
                { code: 'BILL', name: 'Hóa đơn mua hàng', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'POST', 'UNPOST'] },
            ]
        },
        {
            code: 'INVENTORY', name: 'Kho', icon: 'box', order: 6,
            forms: [
                { code: 'INBOUND', name: 'Nhập kho', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'POST', 'UNPOST', 'PRINT'] },
                { code: 'OUTBOUND', name: 'Xuất kho', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'POST', 'UNPOST', 'PRINT'] },
                { code: 'TRANSFER', name: 'Chuyển kho', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'POST', 'UNPOST', 'PRINT'] },
                { code: 'CHECK', name: 'Kiểm kê kho', actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'POST', 'UNPOST', 'PRINT'] },
            ]
        }
    ];

    let permCount = 0;

    for (const m of modules) {
        // Create/Update Module
        const module = await prisma.module.upsert({
            where: { code: m.code },
            update: { name: m.name, icon: m.icon, order: m.order },
            create: { code: m.code, name: m.name, icon: m.icon, order: m.order }
        });

        if (m.forms) {
            for (let i = 0; i < m.forms.length; i++) {
                const f = m.forms[i];
                // Create/Update Form
                const form = await prisma.form.upsert({
                    where: { code: f.code },
                    update: { name: f.name, order: i + 1, moduleId: module.id },
                    create: { code: f.code, name: f.name, order: i + 1, moduleId: module.id }
                });

                // Create Permissions
                for (const action of f.actions) {
                    await prisma.permission.upsert({
                        where: { formId_action: { formId: form.id, action } },
                        update: {},
                        create: { formId: form.id, action, description: `${action} ${f.name}` }
                    });
                    permCount++;
                }
            }
        }
    }

    console.log(`✅ Permissions seeded: ${permCount} permissions across ${modules.length} modules`);

    // Assign ALL permissions to ADMIN role
    const adminRole = await prisma.role.findFirst({ where: { code: 'ADMIN' } });
    if (adminRole) {
        const allPerms = await prisma.permission.findMany();
        let assignedCount = 0;

        // We can't use createMany with skipDuplicates easily here without a unique constraint on ID (which is UUID)
        // But RolePermission has @@id([roleId, permissionId]).
        // createMany is supported for this.

        // SQL Server doesn't support skipDuplicates in createMany in some versions/configs
        // So we use individual creates
        for (const perm of allPerms) {
            try {
                await prisma.rolePermission.create({
                    data: { roleId: adminRole.id, permissionId: perm.id }
                });
                assignedCount++;
            } catch (e) {
                // Ignore duplicate key errors
            }
        }

        console.log(`✅ Assigned ${assignedCount} permissions to ADMIN role`);
    }
}

async function seedOrganization(companyId: string) {
    console.log('🏢 Seeding organization structure...');

    // 1. Create Head Office Branch
    const branch = await prisma.branch.upsert({
        where: { companyId_code: { companyId, code: 'HO' } },
        update: {},
        create: {
            companyId,
            code: 'HO',
            name: 'Hội sở chính',
            address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
            phone: '028-12345678',
            isActive: true
        }
    });

    console.log(`✅ Branch created: ${branch.name}`);

    // 2. Create Departments
    const departments = [
        { code: 'NS', name: 'Phòng Nhân sự' },
        { code: 'KT', name: 'Phòng Kế toán' },
        { code: 'TM', name: 'Phòng Thu mua' },
        { code: 'KD', name: 'Phòng Kinh doanh' },
        { code: 'KHO', name: 'Kho vận' },
        { code: 'SX', name: 'Phòng Sản xuất' }
    ];

    for (const d of departments) {
        await prisma.department.upsert({
            where: { companyId_code: { companyId, code: d.code } },
            update: { name: d.name, branchId: branch.id },
            create: {
                companyId,
                code: d.code,
                name: d.name,
                branchId: branch.id,
                isActive: true
            }
        });
    }

    console.log(`✅ ${departments.length} departments created`);
    return branch;
}

async function seedTestUsers(companyId: string) {
    console.log('👥 Seeding test users...');

    // Get Roles
    const roles = await prisma.role.findMany({ where: { companyId: null } });
    const getRole = (code: string) => roles.find(r => r.code === code);

    // Get Departments
    const depts = await prisma.department.findMany({ where: { companyId } });
    const getDept = (code: string) => depts.find(d => d.code === code);

    // Password
    const passwordHash = await import('bcryptjs').then(m => m.hash('user123', 10));

    const users = [
        { code: 'HR01', name: 'Nguyễn Văn A (HR)', email: 'hr@demo.com.vn', dept: 'NS', role: 'USER' },
        { code: 'ACC01', name: 'Trần Thị B (Kế toán 1)', email: 'acc1@demo.com.vn', dept: 'KT', role: 'ACCOUNTANT' },
        { code: 'ACC02', name: 'Lê Văn C (Kế toán 2)', email: 'acc2@demo.com.vn', dept: 'KT', role: 'ACCOUNTANT' },
        { code: 'PUR01', name: 'Phạm Thị D (Thu mua)', email: 'pur@demo.com.vn', dept: 'TM', role: 'PURCHASING' },
        { code: 'SALE01', name: 'Hoàng Văn E (Sale 1)', email: 'sale1@demo.com.vn', dept: 'KD', role: 'SALES' },
        { code: 'SALE02', name: 'Vũ Thị F (Sale 2)', email: 'sale2@demo.com.vn', dept: 'KD', role: 'SALES' },
        { code: 'WH01', name: 'Đặng Văn G (Kho)', email: 'wh@demo.com.vn', dept: 'KHO', role: 'WAREHOUSE' },
        { code: 'PROD01', name: 'Bùi Văn H (Sản xuất)', email: 'prod@demo.com.vn', dept: 'SX', role: 'USER' },
        { code: 'DIR01', name: 'Ngô Văn I (Giám đốc)', email: 'dir@demo.com.vn', dept: 'NS', role: 'ADMIN' },
        { code: 'SYS01', name: 'Admin Backup', email: 'admin2@demo.com.vn', dept: 'NS', role: 'ADMIN' },
    ];

    for (const u of users) {
        const dept = getDept(u.dept);
        const role = getRole(u.role);

        if (!dept || !role) {
            console.warn(`Skipping user ${u.code}: Dept or Role not found`);
            continue;
        }

        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {
                name: u.name,
                departmentId: dept.id,
            },
            create: {
                companyId,
                code: u.code,
                email: u.email,
                name: u.name,
                password: passwordHash,
                departmentId: dept.id,
                isActive: true
            }
        });

        // Assign Role
        await prisma.userRole.upsert({
            where: { userId_roleId: { userId: user.id, roleId: role.id } },
            update: {},
            create: { userId: user.id, roleId: role.id, assignedBy: 'SYSTEM' }
        });
    }

    console.log(`✅ ${users.length} test users created`);
}

async function main() {
    console.log('🌱 Starting seed...');
    console.log('─'.repeat(50));

    try {
        const company = await seedCompany();
        await seedFiscalYear(company.id);
        await seedAccounts(company.id);
        await seedJournals(company.id);
        await seedPartnerTypes(company.id);
        await seedPartners(company.id);
        await seedWarehouses(company.id);
        await seedProductCategories(company.id);
        await seedProducts(company.id);
        await seedBankAccounts(company.id);
        await seedCurrencies(company.id);
        await seedTaxGroups(company.id);
        await seedTaxRates(company.id);
        await seedAdminUser(company.id);

        await seedOrganization(company.id);
        await seedTestUsers(company.id);

        await seedPermissions(company.id);

        console.log('─'.repeat(50));
        console.log('🎉 Seed completed successfully!');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
