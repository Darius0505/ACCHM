'use client';

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { commonStyles as s, TABLE_COLUMNS } from '@/lib/pdf/styles';
import '@/lib/pdf/fonts';
import { VoucherReportLayout } from './VoucherReportLayout';
import { VOUCHER_CONFIGS } from '@/lib/pdf/types';
import type { CompanyInfo, AccountingDetailRow, SignatureNames } from '@/lib/pdf/types';

/**
 * Data interface for Cash Receipt Report (Phiếu Thu - Mẫu 01-TT)
 * Company info is now provided separately via CompanyInfo
 */
export interface CashReceiptReportData {
    receiptNumber: string;
    date: Date | string;
    payerName: string;
    payerAddress?: string;
    reason: string;
    amount: number;
    amountInWords: string;
    attachments?: string;
    details: AccountingDetailRow[];
}

/** Format currency in Vietnamese locale */
function formatCurrency(n: number): string {
    return new Intl.NumberFormat('vi-VN').format(n);
}

/**
 * Cash Receipt PDF Document - Mẫu 01-TT
 * Theo Thông tư 200/2014/TT-BTC
 */
export const CashReceiptReport: React.FC<{
    data: CashReceiptReportData;
    company: CompanyInfo;
    signatureNames?: SignatureNames;
    qrCodeDataUrl?: string;
}> = ({ data, company, signatureNames, qrCodeDataUrl }) => {
    const totalAmount = data.details.reduce((sum, d) => sum + (d.amount || 0), 0);

    return (
        <VoucherReportLayout
            company={company}
            config={VOUCHER_CONFIGS.CASH_RECEIPT}
            voucherNumber={data.receiptNumber}
            date={data.date}
            signatureNames={signatureNames}
            qrCodeDataUrl={qrCodeDataUrl}
        >
            {/* === BODY FIELDS === */}
            <View>
                <View style={s.fieldRow}>
                    <Text style={s.fieldLabel}>Họ và tên người nộp tiền:</Text>
                    <Text style={s.fieldValueBold}>{data.payerName}</Text>
                </View>
                <View style={s.fieldRow}>
                    <Text style={s.fieldLabel}>Địa chỉ:</Text>
                    <Text style={s.fieldValue}>{data.payerAddress || ''}</Text>
                </View>
                <View style={s.fieldRow}>
                    <Text style={s.fieldLabel}>Lý do nộp:</Text>
                    <Text style={s.fieldValue}>{data.reason}</Text>
                </View>
                <View style={s.fieldRow}>
                    <Text style={s.fieldLabel}>Số tiền:</Text>
                    <Text style={s.fieldValueBold}>{formatCurrency(data.amount)} VND</Text>
                </View>
                <View style={s.fieldRow}>
                    <Text style={s.fieldLabel}>Bằng chữ:</Text>
                    <Text style={{ ...s.fieldValue, fontStyle: 'italic' }}>{data.amountInWords}</Text>
                </View>
                <View style={s.fieldRow}>
                    <Text style={s.fieldLabel}>Kèm theo:</Text>
                    <Text style={s.fieldValue}>{data.attachments || ''}</Text>
                </View>
            </View>

            {/* === ACCOUNTING DETAIL TABLE === */}
            {data.details.length > 0 && (
                <View style={s.table}>
                    <View style={s.tableHeader}>
                        <Text style={{ ...s.tableCellHeader, width: TABLE_COLUMNS.description }}>Diễn giải</Text>
                        <Text style={{ ...s.tableCellHeader, width: TABLE_COLUMNS.debitAccount }}>TK Nợ</Text>
                        <Text style={{ ...s.tableCellHeader, width: TABLE_COLUMNS.creditAccount }}>TK Có</Text>
                        <Text style={{ ...s.tableCellHeaderLast, width: TABLE_COLUMNS.amount, textAlign: 'center' }}>Số tiền</Text>
                    </View>
                    {data.details.map((row, idx) => (
                        <View style={s.tableRow} key={idx}>
                            <Text style={{ ...s.tableCell, width: TABLE_COLUMNS.description }}>{row.description}</Text>
                            <Text style={{ ...s.tableCell, width: TABLE_COLUMNS.debitAccount, textAlign: 'center' }}>{row.debitAccount}</Text>
                            <Text style={{ ...s.tableCell, width: TABLE_COLUMNS.creditAccount, textAlign: 'center' }}>{row.creditAccount}</Text>
                            <Text style={{ ...s.tableCellLast, width: TABLE_COLUMNS.amount, textAlign: 'right' }}>{formatCurrency(row.amount)}</Text>
                        </View>
                    ))}
                    <View style={s.totalRow}>
                        <Text style={{ ...s.tableCell, flex: 1, fontWeight: 700, textAlign: 'right', paddingRight: 8 }}>Cộng</Text>
                        <Text style={{ ...s.tableCellLast, width: TABLE_COLUMNS.amount, textAlign: 'right', fontWeight: 700 }}>
                            {formatCurrency(totalAmount)}
                        </Text>
                    </View>
                </View>
            )}
        </VoucherReportLayout>
    );
};

export default CashReceiptReport;
