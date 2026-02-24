'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

type Locale = 'vi' | 'en' | 'ja';

const translations = {
    vi: {
        title: 'Kế toán & Tài chính',
        subtitle: 'Quản lý sổ sách kế toán doanh nghiệp',
        backHome: '← Quay lại trang chủ',
        sections: {
            ledger: 'Sổ cái tổng hợp',
            ledgerDesc: 'Hệ thống tài khoản và bút toán',
            cashBank: 'Tiền mặt & Ngân hàng',
            cashBankDesc: 'Thu chi tiền mặt, giao dịch ngân hàng',
            reports: 'Báo cáo tài chính',
            reportsDesc: 'Bảng cân đối, kết quả kinh doanh',
        },
        links: {
            accounts: 'Hệ thống tài khoản',
            journal: 'Sổ nhật ký chung',
            trialBalance: 'Bảng cân đối thử',
            cashReceipts: 'Phiếu thu',
            cashPayments: 'Phiếu chi',
            bankTrans: 'Giao dịch ngân hàng',
            bankBook: 'Sổ quỹ ngân hàng',
            income: 'Báo cáo KQKD',
            balance: 'Bảng CĐKT',
            glReport: 'Sổ cái chi tiết',
        }
    },
    en: {
        title: 'Accounting & Finance',
        subtitle: 'Enterprise accounting management system',
        backHome: '← Back to Home',
        sections: {
            ledger: 'General Ledger',
            ledgerDesc: 'Chart of accounts and journal entries',
            cashBank: 'Cash & Bank',
            cashBankDesc: 'Cash receipts, payments, bank transactions',
            reports: 'Financial Reports',
            reportsDesc: 'Balance sheet, income statement',
        },
        links: {
            accounts: 'Chart of Accounts',
            journal: 'Journal Entries',
            trialBalance: 'Trial Balance',
            cashReceipts: 'Cash Receipts',
            cashPayments: 'Cash Payments',
            bankTrans: 'Bank Transactions',
            bankBook: 'Bank Book',
            income: 'Income Statement',
            balance: 'Balance Sheet',
            glReport: 'General Ledger Report',
        }
    },
    ja: {
        title: '会計・財務',
        subtitle: '企業会計管理システム',
        backHome: '← ホームに戻る',
        sections: {
            ledger: '総勘定元帳',
            ledgerDesc: '勘定科目と仕訳',
            cashBank: '現金・銀行',
            cashBankDesc: '入金、出金、銀行取引',
            reports: '財務報告',
            reportsDesc: '貸借対照表、損益計算書',
        },
        links: {
            accounts: '勘定科目',
            journal: '仕訳帳',
            trialBalance: '試算表',
            cashReceipts: '入金伝票',
            cashPayments: '出金伝票',
            bankTrans: '銀行取引',
            bankBook: '銀行帳簿',
            income: '損益計算書',
            balance: '貸借対照表',
            glReport: '総勘定元帳',
        }
    }
};

const colors = {
    primary: '#E57373',
    primaryDark: '#C62828',
    accent: '#FF8A65',
    bgWarm: '#FFFAF5',
    text: '#3D3D3D',
    textSecondary: '#757575',
};

export default function AccountingPage() {
    const [locale, setLocale] = useState<Locale>('vi');

    useEffect(() => {
        const cookieLocale = document.cookie
            .split('; ')
            .find(row => row.startsWith('locale='))
            ?.split('=')[1] as Locale;
        if (cookieLocale && translations[cookieLocale]) {
            setLocale(cookieLocale);
        }
    }, []);

    const t = translations[locale];

    const sections = [
        {
            icon: '📒',
            title: t.sections.ledger,
            description: t.sections.ledgerDesc,
            gradient: 'linear-gradient(135deg, #E57373 0%, #C62828 100%)',
            links: [
                { href: '/accounts', label: t.links.accounts, icon: '📊' },
                { href: '/journal-entries', label: t.links.journal, icon: '📝' },
                { href: '/reports/trial-balance', label: t.links.trialBalance, icon: '⚖️' },
            ]
        },
        {
            icon: '💵',
            title: t.sections.cashBank,
            description: t.sections.cashBankDesc,
            gradient: 'linear-gradient(135deg, #81C784 0%, #388E3C 100%)',
            links: [
                { href: '/cash-receipts', label: t.links.cashReceipts, icon: '📥' },
                { href: '/cash-payments', label: t.links.cashPayments, icon: '📤' },
                { href: '/bank-transactions', label: t.links.bankTrans, icon: '🏦' },
                { href: '/bank-book', label: t.links.bankBook, icon: '📖' },
            ]
        },
        {
            icon: '📈',
            title: t.sections.reports,
            description: t.sections.reportsDesc,
            gradient: 'linear-gradient(135deg, #64B5F6 0%, #1976D2 100%)',
            links: [
                { href: '/reports/income-statement', label: t.links.income, icon: '💹' },
                { href: '/reports/balance-sheet', label: t.links.balance, icon: '📋' },
                { href: '/reports/general-ledger', label: t.links.glReport, icon: '📚' },
            ]
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: colors.bgWarm }}>
            {/* Header */}
            <header style={{
                background: 'linear-gradient(135deg, #E57373 0%, #C62828 100%)',
                padding: '32px',
                color: 'white'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Link
                        href="/"
                        style={{
                            color: 'rgba(255,255,255,0.8)',
                            textDecoration: 'none',
                            fontSize: '14px',
                            display: 'inline-block',
                            marginBottom: '16px'
                        }}
                    >
                        {t.backHome}
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '48px' }}>💰</span>
                        <div>
                            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                                {t.title}
                            </h1>
                            <p style={{ fontSize: '16px', opacity: 0.9, margin: '4px 0 0' }}>
                                {t.subtitle}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '24px'
                }}>
                    {sections.map((section, idx) => (
                        <div
                            key={idx}
                            style={{
                                background: 'white',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                            }}
                        >
                            {/* Section Header */}
                            <div style={{
                                background: section.gradient,
                                padding: '24px',
                                color: 'white'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '32px' }}>{section.icon}</span>
                                    <div>
                                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                                            {section.title}
                                        </h3>
                                        <p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0' }}>
                                            {section.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Links */}
                            <div style={{ padding: '16px' }}>
                                {section.links.map((link, linkIdx) => (
                                    <Link
                                        key={linkIdx}
                                        href={link.href}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '14px 16px',
                                            marginBottom: '8px',
                                            borderRadius: '12px',
                                            background: '#FAFAFA',
                                            color: colors.text,
                                            textDecoration: 'none',
                                            fontSize: '15px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = '#FFF0ED';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = '#FAFAFA';
                                            e.currentTarget.style.transform = 'none';
                                        }}
                                    >
                                        <span style={{ fontSize: '20px' }}>{link.icon}</span>
                                        <span style={{ fontWeight: 500 }}>{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Stats */}
                <div style={{
                    marginTop: '32px',
                    padding: '24px',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: colors.text,
                        marginBottom: '16px'
                    }}>
                        📊 Thống kê nhanh
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px'
                    }}>
                        {[
                            { label: 'Tài khoản', value: '45', color: '#E57373' },
                            { label: 'Bút toán', value: '128', color: '#81C784' },
                            { label: 'Phiếu thu', value: '32', color: '#64B5F6' },
                            { label: 'Phiếu chi', value: '28', color: '#FFB74D' },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '20px',
                                    background: '#FAFAFA',
                                    borderRadius: '12px',
                                    borderLeft: `4px solid ${stat.color}`
                                }}
                            >
                                <p style={{
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    color: stat.color,
                                    margin: 0
                                }}>
                                    {stat.value}
                                </p>
                                <p style={{
                                    fontSize: '14px',
                                    color: colors.textSecondary,
                                    margin: '4px 0 0'
                                }}>
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
