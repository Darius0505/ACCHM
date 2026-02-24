import { StyleSheet } from '@react-pdf/renderer';
import { FONT_FAMILY } from './fonts';

/**
 * Shared PDF Styles for Vietnamese Accounting Vouchers
 * Based on Thông tư 200/2014/TT-BTC
 */
export const commonStyles = StyleSheet.create({
    page: {
        fontFamily: FONT_FAMILY,
        fontSize: 10,
        padding: '15mm 20mm',
        color: '#000',
    },

    // --- Header Row 1: Company (left) + Form Code (right) ---
    headerRow1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '55%',
    },
    headerLeftLogo: {
        width: 26,
        height: 26,
        marginRight: 8,
        objectFit: 'contain' as const,
    },
    headerLeftText: {
        flex: 1,
    },
    companyName: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    companyAddress: {
        fontSize: 8,
        marginTop: 2,
        color: '#333',
    },
    headerRight: {
        width: '40%',
        alignItems: 'flex-end',
    },
    formCode: {
        fontSize: 8,
        textAlign: 'right' as const,
    },
    formCodeBold: {
        fontSize: 9,
        fontWeight: 700,
        textAlign: 'right' as const,
        marginBottom: 2,
    },

    // --- Header Row 2: Voucher Title (centered) ---
    headerRow2: {
        alignItems: 'center',
        marginBottom: 14,
    },
    voucherTitle: {
        fontSize: 18,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    voucherDate: {
        fontSize: 9,
        fontStyle: 'italic',
    },
    voucherNumber: {
        fontSize: 9,
        marginTop: 2,
    },

    // --- Body Fields ---
    fieldRow: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-end',
    },
    fieldLabel: {
        width: 150,
        fontSize: 10,
        flexShrink: 0,
    },
    fieldValue: {
        flex: 1,
        fontSize: 10,
        borderBottom: '0.5pt dotted #999',
        paddingBottom: 1,
    },
    fieldValueBold: {
        flex: 1,
        fontSize: 10,
        fontWeight: 700,
        borderBottom: '0.5pt dotted #999',
        paddingBottom: 1,
    },

    // --- Accounting Table ---
    table: {
        marginTop: 12,
        marginBottom: 12,
    },
    tableHeader: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderColor: '#333',
        backgroundColor: '#f5f5f5',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderLeftWidth: 0.5,
        borderRightWidth: 0.5,
        borderColor: '#333',
    },
    tableCell: {
        padding: '3 4',
        fontSize: 9,
        borderRightWidth: 0.5,
        borderColor: '#333',
    },
    tableCellLast: {
        padding: '3 4',
        fontSize: 9,
    },
    tableCellHeader: {
        padding: '4 4',
        fontSize: 9,
        fontWeight: 700,
        borderRightWidth: 0.5,
        borderColor: '#333',
        textAlign: 'center',
    },
    tableCellHeaderLast: {
        padding: '4 4',
        fontSize: 9,
        fontWeight: 700,
        textAlign: 'center',
    },
    totalRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderLeftWidth: 0.5,
        borderRightWidth: 0.5,
        borderColor: '#333',
        backgroundColor: '#fafafa',
    },

    // --- Footer Signatures ---
    signatureBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    signatureItem: {
        alignItems: 'center',
        width: '18%',
    },
    signatureTitle: {
        fontSize: 9,
        fontWeight: 700,
        marginBottom: 2,
    },
    signatureHint: {
        fontSize: 8,
        fontStyle: 'italic',
        color: '#555',
    },
    signatureSpace: {
        height: 50,
    },
    signatureName: {
        fontSize: 9,
        fontWeight: 700,
    },

    // --- Confirmation line ---
    confirmationLine: {
        marginTop: 8,
        fontSize: 8,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

/**
 * Column widths for accounting detail table (percentage-based)
 */
export const TABLE_COLUMNS = {
    description: '40%',
    debitAccount: '15%',
    creditAccount: '15%',
    amount: '30%',
};
