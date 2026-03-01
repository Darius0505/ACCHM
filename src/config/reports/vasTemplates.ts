// VAS Report Templates - Pre-built configurations
// Following Thông tư 200/2014/TT-BTC

import { ReportTemplateConfig, ReportType, ReportCategory } from '@/types/reportTemplate';

// ============================================================================
// TEMPLATE DEFINITIONS
// ============================================================================

interface VASTemplateDefinition {
    code: string;
    name: string;
    nameEN: string;
    type: ReportType;
    category: ReportCategory;
    sortOrder: number;
    config: ReportTemplateConfig;
}

// ============================================================================
// B01-DN: BẢNG CÂN ĐỐI KẾ TOÁN (BALANCE SHEET)
// ============================================================================

const balanceSheetConfig: ReportTemplateConfig = {
    version: '1.0.0',
    dataSource: {
        endpoint: '/api/reports/balance-sheet',
        params: { asOfDate: null }
    },

    columns: [
        { field: 'vasCode', headerName: 'Mã số', width: 80, type: 'text', align: 'center', isBold: true },
        { field: 'name', headerName: 'CHỈ TIÊU', headerNameEN: 'Item', flex: 1, minWidth: 300, type: 'text' },
        { field: 'thisPeriod', headerName: 'Số cuối kỳ', headerNameEN: 'End of Period', width: 150, type: 'currency', align: 'right' },
        { field: 'prevPeriod', headerName: 'Số đầu năm', headerNameEN: 'Beginning of Year', width: 150, type: 'currency', align: 'right' },
    ],

    header: {
        showCompanyInfo: true,
        showLogo: true,
        title: 'BẢNG CÂN ĐỐI KẾ TOÁN',
        titleEN: 'BALANCE SHEET',
        vasCode: 'Mẫu số B01-DN',
        vasReference: '(Ban hành theo Thông tư số 200/2014/TT-BTC ngày 22/12/2014 của Bộ Tài chính)'
    },

    footer: {
        showSignatures: true,
        showDate: true,
        showPageNumbers: true
    },

    export: {
        fileName: 'BangCanDoiKeToan_B01DN',
        sheetName: 'B01-DN',
        paperSize: 'A4',
        orientation: 'portrait',
        margins: { top: 20, bottom: 20, left: 25, right: 15 },
        style: {
            headerBgColor: '#1E3A8A',
            headerFontColor: '#FFFFFF',
            alternatRowColor: '#F8FAFC',
            borderStyle: 'thin',
            fontSize: 11,
            fontFamily: 'Times New Roman'
        }
    },

    vas: {
        formCode: 'B01-DN',
        lineMapping: {
            // TÀI SẢN
            '100': 'A. TÀI SẢN NGẮN HẠN',
            '110': 'I. Tiền và các khoản tương đương tiền',
            '111': '1. Tiền',
            '112': '2. Các khoản tương đương tiền',
            '120': 'II. Đầu tư tài chính ngắn hạn',
            '130': 'III. Các khoản phải thu ngắn hạn',
            '131': '1. Phải thu ngắn hạn của khách hàng',
            '132': '2. Trả trước cho người bán ngắn hạn',
            '140': 'IV. Hàng tồn kho',
            '150': 'V. Tài sản ngắn hạn khác',
            '200': 'B. TÀI SẢN DÀI HẠN',
            '270': 'TỔNG CỘNG TÀI SẢN',
            // NGUỒN VỐN
            '300': 'C. NỢ PHẢI TRẢ',
            '310': 'I. Nợ ngắn hạn',
            '311': '1. Phải trả người bán ngắn hạn',
            '330': 'II. Nợ dài hạn',
            '400': 'D. VỐN CHỦ SỞ HỮU',
            '410': 'I. Vốn chủ sở hữu',
            '411': '1. Vốn góp của chủ sở hữu',
            '421': '2. Lợi nhuận sau thuế chưa phân phối',
            '440': 'TỔNG CỘNG NGUỒN VỐN'
        }
    }
};

// ============================================================================
// B02-DN: BÁO CÁO KẾT QUẢ HOẠT ĐỘNG KINH DOANH (INCOME STATEMENT)
// ============================================================================

const incomeStatementConfig: ReportTemplateConfig = {
    version: '1.0.0',
    dataSource: {
        endpoint: '/api/reports/income-statement',
        params: { fromDate: null, toDate: null }
    },

    columns: [
        { field: 'vasCode', headerName: 'Mã số', width: 80, type: 'text', align: 'center', isBold: true },
        { field: 'name', headerName: 'CHỈ TIÊU', headerNameEN: 'Item', flex: 1, minWidth: 350, type: 'text' },
        { field: 'thisPeriod', headerName: 'Kỳ này', headerNameEN: 'This Period', width: 150, type: 'currency', align: 'right' },
        { field: 'prevPeriod', headerName: 'Kỳ trước', headerNameEN: 'Previous Period', width: 150, type: 'currency', align: 'right' },
    ],

    header: {
        showCompanyInfo: true,
        showLogo: true,
        title: 'BÁO CÁO KẾT QUẢ HOẠT ĐỘNG KINH DOANH',
        titleEN: 'INCOME STATEMENT',
        vasCode: 'Mẫu số B02-DN',
        vasReference: '(Ban hành theo Thông tư số 200/2014/TT-BTC ngày 22/12/2014 của Bộ Tài chính)'
    },

    footer: {
        showSignatures: true,
        showDate: true,
        showPageNumbers: true
    },

    export: {
        fileName: 'BaoCaoKetQuaKinhDoanh_B02DN',
        sheetName: 'B02-DN',
        paperSize: 'A4',
        orientation: 'portrait',
        margins: { top: 20, bottom: 20, left: 25, right: 15 },
        style: {
            headerBgColor: '#1E3A8A',
            headerFontColor: '#FFFFFF',
            alternatRowColor: '#F8FAFC',
            borderStyle: 'thin',
            fontSize: 11,
            fontFamily: 'Times New Roman'
        }
    },

    vas: {
        formCode: 'B02-DN',
        lineMapping: {
            '01': '1. Doanh thu bán hàng và cung cấp dịch vụ',
            '02': '2. Các khoản giảm trừ doanh thu',
            '10': '3. Doanh thu thuần về BH & CCDV (10=01-02)',
            '11': '4. Giá vốn hàng bán',
            '20': '5. Lợi nhuận gộp về BH & CCDV (20=10-11)',
            '21': '6. Doanh thu hoạt động tài chính',
            '22': '7. Chi phí tài chính',
            '23': '  - Trong đó: Chi phí lãi vay',
            '25': '8. Chi phí bán hàng',
            '26': '9. Chi phí quản lý doanh nghiệp',
            '30': '10. LN thuần từ HĐKD (30=20+21-22-25-26)',
            '31': '11. Thu nhập khác',
            '32': '12. Chi phí khác',
            '40': '13. Lợi nhuận khác (40=31-32)',
            '50': '14. Tổng LN kế toán trước thuế (50=30+40)',
            '51': '15. Chi phí thuế TNDN hiện hành',
            '52': '16. Chi phí thuế TNDN hoãn lại',
            '60': '17. LN sau thuế TNDN (60=50-51-52)'
        }
    }
};

// ============================================================================
// TRIAL BALANCE - BẢNG CÂN ĐỐI SỐ PHÁT SINH
// ============================================================================

const trialBalanceConfig: ReportTemplateConfig = {
    version: '1.0.0',
    dataSource: {
        endpoint: '/api/reports/trial-balance',
        params: { fromDate: null, toDate: null }
    },

    columns: [
        { field: 'accountCode', headerName: 'Số TK', width: 100, type: 'text', align: 'center' },
        { field: 'accountName', headerName: 'Tên tài khoản', flex: 1, minWidth: 250, type: 'text' },
        { field: 'openingDebit', headerName: 'Nợ', width: 130, type: 'currency', align: 'right' },
        { field: 'openingCredit', headerName: 'Có', width: 130, type: 'currency', align: 'right' },
        { field: 'movementDebit', headerName: 'Nợ', width: 130, type: 'currency', align: 'right' },
        { field: 'movementCredit', headerName: 'Có', width: 130, type: 'currency', align: 'right' },
        { field: 'closingDebit', headerName: 'Nợ', width: 130, type: 'currency', align: 'right' },
        { field: 'closingCredit', headerName: 'Có', width: 130, type: 'currency', align: 'right' },
    ],

    header: {
        showCompanyInfo: true,
        showLogo: true,
        title: 'BẢNG CÂN ĐỐI SỐ PHÁT SINH',
        titleEN: 'TRIAL BALANCE'
    },

    footer: {
        showSignatures: true,
        showDate: true,
        showPageNumbers: true
    },

    summaryFields: [
        { field: 'openingDebit', aggregation: 'sum', label: 'Tổng cộng' },
        { field: 'openingCredit', aggregation: 'sum' },
        { field: 'movementDebit', aggregation: 'sum' },
        { field: 'movementCredit', aggregation: 'sum' },
        { field: 'closingDebit', aggregation: 'sum' },
        { field: 'closingCredit', aggregation: 'sum' },
    ],

    export: {
        fileName: 'BangCanDoiSoPhatSinh',
        sheetName: 'CDPS',
        paperSize: 'A4',
        orientation: 'landscape',
        margins: { top: 15, bottom: 15, left: 15, right: 15 },
        style: {
            headerBgColor: '#1E3A8A',
            headerFontColor: '#FFFFFF',
            alternatRowColor: '#F8FAFC',
            borderStyle: 'thin',
            fontSize: 10,
            fontFamily: 'Times New Roman'
        }
    }
};

// ============================================================================
// EXPORT ALL TEMPLATES
// ============================================================================

export const VAS_TEMPLATES: VASTemplateDefinition[] = [
    {
        code: 'B01-DN',
        name: 'Bảng cân đối kế toán',
        nameEN: 'Balance Sheet',
        type: 'BALANCE_SHEET',
        category: 'FINANCIAL',
        sortOrder: 1,
        config: balanceSheetConfig
    },
    {
        code: 'B02-DN',
        name: 'Báo cáo kết quả hoạt động kinh doanh',
        nameEN: 'Income Statement',
        type: 'INCOME_STATEMENT',
        category: 'FINANCIAL',
        sortOrder: 2,
        config: incomeStatementConfig
    },
    {
        code: 'TRIAL-BALANCE',
        name: 'Bảng cân đối số phát sinh',
        nameEN: 'Trial Balance',
        type: 'TRIAL_BALANCE',
        category: 'FINANCIAL',
        sortOrder: 3,
        config: trialBalanceConfig
    }
];

// Helper to get template by code
export const getVASTemplate = (code: string): VASTemplateDefinition | undefined => {
    return VAS_TEMPLATES.find(t => t.code === code);
};

// Helper to get templates by category
export const getVASTemplatesByCategory = (category: ReportCategory): VASTemplateDefinition[] => {
    return VAS_TEMPLATES.filter(t => t.category === category);
};
