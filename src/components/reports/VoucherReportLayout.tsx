'use client';

import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { commonStyles as s } from '@/lib/pdf/styles';
import '@/lib/pdf/fonts';
import type { CompanyInfo, VoucherConfig, SignatureNames } from '@/lib/pdf/types';

interface VoucherReportLayoutProps {
    /** Company information (from useCompanyInfo hook) */
    company: CompanyInfo;
    /** Voucher configuration (title, formCode, signatures) */
    config: VoucherConfig;
    /** Voucher number */
    voucherNumber: string;
    /** Voucher date */
    date: Date | string;
    /** Signer names mapped by signature title, e.g. { 'Giám đốc': 'Nguyễn Văn A' } */
    signatureNames?: SignatureNames;
    /** Optional base64 data URL for a QR Code */
    qrCodeDataUrl?: string;
    /** The body content of the voucher (fields + table) */
    children: React.ReactNode;
}

/** Format date parts for Vietnamese date display */
function formatDateParts(d: Date | string) {
    const date = typeof d === 'string' ? new Date(d) : d;
    return {
        day: String(date.getDate()).padStart(2, '0'),
        month: String(date.getMonth() + 1).padStart(2, '0'),
        year: String(date.getFullYear()),
    };
}

/**
 * VoucherReportLayout - Shared PDF layout for all Vietnamese accounting vouchers.
 * 
 * Layout structure:
 *   Row 1: [Logo + Company Name + Address]  ............  [Mẫu số XX-TT]
 *   Row 2 (centered): PHIẾU THU / Ngày...tháng...năm... / Số: XXX
 *   Body: (provided by children)
 *   Signatures: title, hint, space, signer name
 */
export const VoucherReportLayout: React.FC<VoucherReportLayoutProps> = ({
    company,
    config,
    voucherNumber,
    date,
    signatureNames = {},
    qrCodeDataUrl,
    children,
}) => {
    const { day, month, year } = formatDateParts(date);

    return (
        <Document title={`${config.title}_${voucherNumber}`} author={company.name}>
            <Page size="A4" style={s.page}>

                {/* === ROW 1: Company Info (left) + Form Code (right) === */}
                <View style={s.headerRow1}>
                    {/* Left: Logo + Company */}
                    <View style={s.headerLeft}>
                        {company.logo && (
                            <Image
                                src={company.logo}
                                style={s.headerLeftLogo}
                            />
                        )}
                        <View style={s.headerLeftText}>
                            <Text style={s.companyName}>{company.name}</Text>
                            <Text style={s.companyAddress}>{company.address}</Text>
                        </View>
                    </View>

                    <View style={{ ...s.headerRight, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                        {qrCodeDataUrl && (
                            <Image
                                src={qrCodeDataUrl}
                                style={{ width: 40, height: 40, marginRight: 8 }}
                            />
                        )}
                    </View>
                </View>

                {/* === ROW 2: Centered Title + Date + Number === */}
                <View style={s.headerRow2}>
                    <Text style={s.voucherTitle}>{config.title}</Text>
                    <Text style={s.voucherDate}>
                        Ngày {day} tháng {month} năm {year}
                    </Text>
                    <Text style={s.voucherNumber}>
                        Số: <Text style={{ fontWeight: 700 }}>{voucherNumber}</Text>
                    </Text>
                </View>

                {/* === BODY (provided by each report) === */}
                {children}

                {/* === SIGNATURE BLOCK === */}
                <View style={s.signatureBlock}>
                    {config.signatures.map((sig, idx) => (
                        <View style={s.signatureItem} key={idx}>
                            <Text style={s.signatureTitle}>{sig.title}</Text>
                            <Text style={s.signatureHint}>{sig.hint}</Text>
                            <View style={s.signatureSpace} />
                            {signatureNames[sig.title] && signatureNames[sig.title].trim() !== '' && signatureNames[sig.title] !== '---' && (
                                <Text style={s.signatureName}>{signatureNames[sig.title]}</Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* Confirmation line */}
                {config.confirmationLine && (
                    <Text style={s.confirmationLine}>{config.confirmationLine}</Text>
                )}

            </Page>
        </Document>
    );
};

export default VoucherReportLayout;
