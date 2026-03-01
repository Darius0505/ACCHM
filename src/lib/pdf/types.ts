/**
 * Shared PDF Report Types
 * Used by all voucher/report PDF generators
 */

/** Company information fetched from /api/company */
export interface CompanyInfo {
    id: string;
    name: string;
    address: string;
    taxCode?: string;
    phone?: string;
    email?: string;
    fax?: string;
    website?: string;
    logo?: string;
    directorName?: string;
    chiefAccountantName?: string;
}

/** Voucher types per TT200/2014 */
export type VoucherType = 'CASH_RECEIPT' | 'CASH_PAYMENT' | 'BANK_RECEIPT' | 'BANK_PAYMENT' | 'JOURNAL';

/** Configuration for each voucher type */
export interface VoucherConfig {
    title: string;
    formCode: string;
    /** Signature labels from left to right */
    signatures: { title: string; hint: string }[];
    /** Optional confirmation line at the bottom */
    confirmationLine?: string;
}

/**
 * Maps signature position titles to actual names.
 * Keys match the `title` of each signature in VoucherConfig.signatures.
 * Example: { 'Giám đốc': 'Nguyễn Văn A', 'Thủ quỹ': 'Trần B' }
 */
export type SignatureNames = Record<string, string>;

/** Predefined voucher configurations */
export const VOUCHER_CONFIGS: Record<VoucherType, VoucherConfig> = {
    CASH_RECEIPT: {
        title: 'PHIẾU THU',
        formCode: 'Mẫu số 01-TT',
        signatures: [
            { title: 'Giám đốc', hint: '(Ký, họ tên, đóng dấu)' },
            { title: 'Kế toán trưởng', hint: '(Ký, họ tên)' },
            { title: 'Người lập phiếu', hint: '(Ký, họ tên)' },
            { title: 'Người nộp tiền', hint: '(Ký, họ tên)' },
            { title: 'Thủ quỹ', hint: '(Ký, họ tên)' },
        ],
        confirmationLine: '(Đã nhận đủ số tiền (viết bằng chữ): ...........................................................................)',
    },
    CASH_PAYMENT: {
        title: 'PHIẾU CHI',
        formCode: 'Mẫu số 02-TT',
        signatures: [
            { title: 'Giám đốc', hint: '(Ký, họ tên, đóng dấu)' },
            { title: 'Kế toán trưởng', hint: '(Ký, họ tên)' },
            { title: 'Người lập phiếu', hint: '(Ký, họ tên)' },
            { title: 'Người nhận tiền', hint: '(Ký, họ tên)' },
            { title: 'Thủ quỹ', hint: '(Ký, họ tên)' },
        ],
        confirmationLine: '(Đã nhận đủ số tiền (viết bằng chữ): ...........................................................................)',
    },
    BANK_RECEIPT: {
        title: 'GIẤY BÁO CÓ',
        formCode: 'Mẫu số 01-TT/NH',
        signatures: [
            { title: 'Giám đốc', hint: '(Ký, họ tên, đóng dấu)' },
            { title: 'Kế toán trưởng', hint: '(Ký, họ tên)' },
            { title: 'Người lập phiếu', hint: '(Ký, họ tên)' },
        ],
    },
    BANK_PAYMENT: {
        title: 'GIẤY BÁO NỢ',
        formCode: 'Mẫu số 02-TT/NH',
        signatures: [
            { title: 'Giám đốc', hint: '(Ký, họ tên, đóng dấu)' },
            { title: 'Kế toán trưởng', hint: '(Ký, họ tên)' },
            { title: 'Người lập phiếu', hint: '(Ký, họ tên)' },
        ],
    },
    JOURNAL: {
        title: 'CHỨNG TỪ GHI SỔ',
        formCode: 'Mẫu số 02-TT',
        signatures: [
            { title: 'Người lập', hint: '(Ký, họ tên)' },
            { title: 'Kế toán trưởng', hint: '(Ký, họ tên)' },
            { title: 'Giám đốc', hint: '(Ký, họ tên, đóng dấu)' },
        ],
    },
};

/** Common accounting detail row */
export interface AccountingDetailRow {
    description: string;
    debitAccount: string;
    creditAccount: string;
    amount: number;
}
