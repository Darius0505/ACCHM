'use client';

import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { commonStyles as s, TABLE_COLUMNS } from '@/lib/pdf/styles';
import { FONT_FAMILY } from '@/lib/pdf/fonts';
import { VoucherHalfPageContent } from './VoucherReport2LienLayout';
import { VOUCHER_CONFIGS } from '@/lib/pdf/types';
import type { CompanyInfo, SignatureNames } from '@/lib/pdf/types';
import type { CashPaymentReportData } from './CashPaymentReport';

/** Format currency in Vietnamese locale */
function formatCurrency(n: number): string {
    return new Intl.NumberFormat('vi-VN').format(n);
}

export const CashPaymentReport2Lien: React.FC<{
    data: CashPaymentReportData;
    company: CompanyInfo;
    signatureNames?: SignatureNames;
    qrCodeDataUrl?: string;
}> = ({ data, company, signatureNames, qrCodeDataUrl }) => {
    const totalAmount = data.details.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Create a function returning JSX so we can instantiate it twice safely
    const renderBodyContent = () => (
        <View>
            <View>
                <View style={s.fieldRow}>
                    <Text style={s.fieldLabel}>Họ và tên người nhận tiền:</Text>
                    <Text style={s.fieldValueBold}>{data.payeeName}</Text>
                </View>
                <View style={s.fieldRow}>
                    <Text style={s.fieldLabel}>Địa chỉ:</Text>
                    <Text style={s.fieldValue}>{data.payeeAddress || ''}</Text>
                </View>
                <View style={s.fieldRow}>
                    <Text style={s.fieldLabel}>Lý do chi:</Text>
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
        </View>
    );

    return (
        <Document title={`${VOUCHER_CONFIGS.CASH_PAYMENT.title}_${data.paymentNumber}`} author={company.name}>
            <Page size="A4" style={{ fontFamily: FONT_FAMILY, fontSize: 10, color: '#000', padding: 0 }}>
                {/* Liên 1 */}
                <View style={{ height: '50%', borderBottomWidth: 1, borderBottomStyle: 'dashed', borderBottomColor: '#999', position: 'relative' }}>
                    <VoucherHalfPageContent
                        company={company}
                        config={VOUCHER_CONFIGS.CASH_PAYMENT}
                        voucherNumber={data.paymentNumber}
                        date={data.date}
                        signatureNames={signatureNames}
                        qrCodeDataUrl={qrCodeDataUrl}
                        lienName="Liên 1"
                    >
                        {renderBodyContent()}
                    </VoucherHalfPageContent>
                </View>

                {/* Liên 2 */}
                <View style={{ height: '50%', position: 'relative' }}>
                    <VoucherHalfPageContent
                        company={company}
                        config={VOUCHER_CONFIGS.CASH_PAYMENT}
                        voucherNumber={data.paymentNumber}
                        date={data.date}
                        signatureNames={signatureNames}
                        qrCodeDataUrl={qrCodeDataUrl}
                        lienName="Liên 2"
                    >
                        {renderBodyContent()}
                    </VoucherHalfPageContent>
                </View>
            </Page>
        </Document>
    );
};

export default CashPaymentReport2Lien;
