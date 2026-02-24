// Report Template System - Type Definitions
// ACCHM ERP

// ============================================================================
// REPORT TYPES (matching Prisma schema comments)
// ============================================================================

export type ReportType =
    | 'BALANCE_SHEET'       // Bảng cân đối kế toán (B01-DN)
    | 'INCOME_STATEMENT'    // Báo cáo kết quả HĐKD (B02-DN)
    | 'TRIAL_BALANCE'       // Bảng cân đối số phát sinh
    | 'GENERAL_LEDGER'      // Sổ cái
    | 'ACCOUNT_DETAIL'      // Sổ chi tiết tài khoản
    | 'AR_AGING'            // Báo cáo tuổi nợ phải thu
    | 'AP_AGING'            // Báo cáo tuổi nợ phải trả
    | 'AR_STATEMENT'        // Bảng kê công nợ khách hàng
    | 'AP_STATEMENT'        // Bảng kê công nợ nhà cung cấp
    | 'CASH_BOOK'           // Sổ quỹ tiền mặt
    | 'BANK_BOOK'           // Sổ tiền gửi ngân hàng
    | 'CUSTOM';             // Mẫu tự định nghĩa

export type ReportCategory = 'FINANCIAL' | 'AR' | 'AP' | 'INVENTORY' | 'CUSTOM';

// ============================================================================
// COLUMN DEFINITIONS
// ============================================================================

export type ColumnType =
    | 'text'
    | 'number'
    | 'currency'
    | 'date'
    | 'percentage'
    | 'checkbox';

export type ColumnAlignment = 'left' | 'center' | 'right';

export interface ReportColumn {
    field: string;               // Data field name
    headerName: string;          // Vietnamese header
    headerNameEN?: string;       // English header
    width?: number;              // Column width in pixels
    minWidth?: number;
    flex?: number;               // Flex grow
    type: ColumnType;
    align?: ColumnAlignment;
    format?: string;             // e.g. "#,##0" for numbers
    formula?: string;            // Excel formula template
    vasCode?: string;            // VAS mapping code (Mã số)
    indent?: number;             // Indent level for hierarchical reports
    isBold?: boolean;            // Bold text
    isItalic?: boolean;
    isTotal?: boolean;           // Is a total/subtotal row
    hidden?: boolean;            // Hide in viewer but include in export
}

// ============================================================================
// GROUPING & AGGREGATION
// ============================================================================

export interface GroupConfig {
    field: string;
    headerTemplate?: string;     // e.g. "Nhóm: {value}"
    showSubtotal?: boolean;
    subtotalFields?: string[];   // Fields to subtotal
}

export interface SummaryField {
    field: string;
    aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
    label?: string;
}

// ============================================================================
// HEADER & FOOTER
// ============================================================================

export interface ReportHeader {
    showCompanyInfo?: boolean;   // Company name, address, tax code
    showLogo?: boolean;
    title: string;
    titleEN?: string;
    subtitle?: string;           // e.g. date range
    vasCode?: string;            // VAS form code: B01-DN
    vasReference?: string;       // e.g. "Ban hành theo TT200/2014/TT-BTC"
}

export interface ReportFooter {
    showSignatures?: boolean;    // Người lập, Kế toán trưởng, Giám đốc
    showDate?: boolean;
    showPageNumbers?: boolean;
    customText?: string;
}

// ============================================================================
// EXPORT OPTIONS
// ============================================================================

export interface ExcelStyleOptions {
    headerBgColor?: string;      // Header background color
    headerFontColor?: string;
    alternatRowColor?: string;   // Zebra stripes
    borderStyle?: 'thin' | 'medium' | 'thick';
    fontSize?: number;
    fontFamily?: string;
}

export interface ExportOptions {
    fileName?: string;           // Default filename
    sheetName?: string;          // Excel sheet name
    paperSize?: 'A4' | 'A3' | 'Letter';
    orientation?: 'portrait' | 'landscape';
    margins?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    style?: ExcelStyleOptions;
}

// ============================================================================
// TEMPLATE CONFIG (stored as JSON in database)
// ============================================================================

export interface ReportTemplateConfig {
    version: string;             // Config version for migration
    dataSource: {
        endpoint?: string;         // API endpoint
        serviceFn?: string;        // Service function name
        params?: Record<string, unknown>; // Default parameters
    };

    columns: ReportColumn[];

    groupBy?: GroupConfig[];
    summaryFields?: SummaryField[];

    header: ReportHeader;
    footer?: ReportFooter;

    export: ExportOptions;

    // VAS-specific configurations
    vas?: {
        formCode: string;          // B01-DN, B02-DN
        lineMapping?: Record<string, string>; // Field to VAS line mapping
    };
}

// ============================================================================
// FRONTEND TEMPLATE TYPE (with parsed config)
// ============================================================================

export interface ReportTemplate {
    id: string;
    companyId: string;
    code: string;
    name: string;
    nameEN?: string;
    type: ReportType;
    category: ReportCategory;
    config: ReportTemplateConfig;
    isSystem: boolean;
    isActive: boolean;
    sortOrder: number;
}
