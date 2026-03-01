'use client';

import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { commonStyles as s } from '@/lib/pdf/styles';
import '@/lib/pdf/fonts';
import type { CompanyInfo, VoucherConfig, SignatureNames } from '@/lib/pdf/types';

interface VoucherHalfPageProps {
    company: CompanyInfo;
    config: VoucherConfig;
    voucherNumber: string;
    date: Date | string;
    signatureNames?: SignatureNames;
    qrCodeDataUrl?: string;
    children?: React.ReactNode;
    lienName?: string;
}

function formatDateParts(d: Date | string) {
    const date = typeof d === 'string' ? new Date(d) : d;
    return {
        day: String(date.getDate()).padStart(2, '0'),
        month: String(date.getMonth() + 1).padStart(2, '0'),
        year: String(date.getFullYear()),
    };
}

export const VoucherHalfPageContent: React.FC<VoucherHalfPageProps> = ({
    company,
    config,
    voucherNumber,
    date,
    signatureNames = {},
    qrCodeDataUrl,
    children,
    lienName,
}) => {
    const { day, month, year } = formatDateParts(date);

    return (
        <View style={{ flex: 1, padding: '10mm 20mm' }}>
            {/* ROW 1 */}
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

                {/* Right: Lien Name & QR Code */}
                <View style={{ ...s.headerRight, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {lienName && (
                        <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#666', marginRight: qrCodeDataUrl ? 8 : 0 }}>
                            {lienName}
                        </Text>
                    )}
                    {qrCodeDataUrl && (
                        <Image
                            src={qrCodeDataUrl}
                            style={{ width: 40, height: 40 }}
                        />
                    )}
                </View>
            </View>

            {/* ROW 2: Centered Title + Date + Number */}
            <View style={{ ...s.headerRow2, marginBottom: 8 }}>
                <Text style={s.voucherTitle}>{config.title}</Text>
                <Text style={s.voucherDate}>
                    Ngày {day} tháng {month} năm {year}
                </Text>
                <Text style={s.voucherNumber}>
                    Số: <Text style={{ fontWeight: 700 }}>{voucherNumber}</Text>
                </Text>
            </View>

            {/* BODY (provided by each report) */}
            {children}

            {/* SIGNATURE BLOCK */}
            <View style={{ ...s.signatureBlock, marginTop: 16 }}>
                {config.signatures.map((sig, idx) => (
                    <View style={s.signatureItem} key={idx}>
                        <Text style={s.signatureTitle}>{sig.title}</Text>
                        <Text style={s.signatureHint}>{sig.hint}</Text>
                        <View style={{ height: 40 }} />
                        {signatureNames[sig.title] && signatureNames[sig.title].trim() !== '' && signatureNames[sig.title] !== '---' && (
                            <Text style={s.signatureName}>{signatureNames[sig.title]}</Text>
                        )}
                    </View>
                ))}
            </View>

            {/* Confirmation line */}
            {config.confirmationLine && (
                <Text style={{ ...s.confirmationLine, marginTop: 4 }}>{config.confirmationLine}</Text>
            )}
        </View>
    );
};
