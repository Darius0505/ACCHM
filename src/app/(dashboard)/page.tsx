'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

type Locale = 'vi' | 'en' | 'ja';

const translations = {
  vi: {
    welcome: 'Xin chào',
    selectModule: 'Chọn module để bắt đầu làm việc',
    accounting: 'Kế toán & Tài chính',
    accountingDesc: 'Sổ cái, bút toán, báo cáo tài chính',
    purchasing: 'Quản lý Mua hàng',
    purchasingDesc: 'Nhà cung cấp, đơn đặt hàng, thanh toán',
    inventory: 'Quản lý Kho',
    inventoryDesc: 'Nhập kho, xuất kho, tồn kho',
    sales: 'Bán hàng & CRM',
    salesDesc: 'Khách hàng, hóa đơn, thu tiền',
    hr: 'Nhân sự & Chấm công',
    hrDesc: 'Nhân viên, lương, chấm công',
    admin: 'Quản trị hệ thống',
    adminDesc: 'Người dùng, bảo mật, nhật ký',
    comingSoon: 'Sắp ra mắt',
    active: 'Đang hoạt động',
    version: 'Phiên bản',
    logout: 'Đăng xuất',
  },
  en: {
    welcome: 'Welcome',
    selectModule: 'Select a module to start working',
    accounting: 'Accounting & Finance',
    accountingDesc: 'General ledger, journal entries, financial reports',
    purchasing: 'Purchasing',
    purchasingDesc: 'Vendors, purchase orders, payments',
    inventory: 'Inventory Management',
    inventoryDesc: 'Stock in, stock out, inventory tracking',
    sales: 'Sales & CRM',
    salesDesc: 'Customers, invoices, receipts',
    hr: 'HR & Attendance',
    hrDesc: 'Employees, payroll, time tracking',
    admin: 'System Admin',
    adminDesc: 'Users, security, audit logs',
    comingSoon: 'Coming Soon',
    active: 'Active',
    version: 'Version',
    logout: 'Logout',
  },
  ja: {
    welcome: 'ようこそ',
    selectModule: 'モジュールを選択してください',
    accounting: '会計・財務',
    accountingDesc: '総勘定元帳、仕訳、財務報告',
    purchasing: '購買管理',
    purchasingDesc: '仕入先、発注、支払い',
    inventory: '在庫管理',
    inventoryDesc: '入庫、出庫、在庫追跡',
    sales: '営業・CRM',
    salesDesc: '顧客、請求書、入金',
    hr: '人事・勤怠',
    hrDesc: '従業員、給与、勤怠管理',
    admin: 'システム管理',
    adminDesc: 'ユーザー、セキュリティ、監査ログ',
    comingSoon: '近日公開',
    active: 'アクティブ',
    version: 'バージョン',
    logout: 'ログアウト',
  }
};

// Fire Element Colors
const colors = {
  primary: '#E57373',
  primaryDark: '#C62828',
  accent: '#FF8A65',
  amber: '#FFB74D',
  bgWarm: '#FFFAF5',
  text: '#3D3D3D',
  textSecondary: '#757575',
};

export default function Home() {
  const [locale, setLocale] = useState<Locale>('vi');
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);

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

  const modules = [
    {
      id: 1,
      icon: '💰',
      title: t.accounting,
      description: t.accountingDesc,
      href: '/accounting',
      gradient: 'linear-gradient(135deg, #E57373 0%, #C62828 100%)',
      status: 'active',
      subLinks: [
        { href: '/accounts', label: 'Chart of Accounts' },
        { href: '/journal-entries', label: 'Journal Entries' },
        { href: '/reports/income-statement', label: 'Income Statement' },
        { href: '/reports/balance-sheet', label: 'Balance Sheet' },
      ]
    },
    {
      id: 2,
      icon: '🛍️',
      title: t.purchasing,
      description: t.purchasingDesc,
      href: '/vendors',
      gradient: 'linear-gradient(135deg, #FF8A65 0%, #E64A19 100%)',
      status: 'active',
      subLinks: [
        { href: '/vendors', label: 'Vendors' },
        { href: '/purchase-invoices', label: 'Purchase Invoices' },
        { href: '/vendor-payments', label: 'Vendor Payments' },
        { href: '/reports/ap-aging', label: 'AP Aging Report' },
      ]
    },
    {
      id: 3,
      icon: '📦',
      title: t.inventory,
      description: t.inventoryDesc,
      href: '#',
      gradient: 'linear-gradient(135deg, #FFB74D 0%, #F57C00 100%)',
      status: 'coming',
      subLinks: []
    },
    {
      id: 4,
      icon: '🛒',
      title: t.sales,
      description: t.salesDesc,
      href: '/customers',
      gradient: 'linear-gradient(135deg, #F48FB1 0%, #C2185B 100%)',
      status: 'active',
      subLinks: [
        { href: '/customers', label: 'Customers' },
        { href: '/sales-invoices', label: 'Sales Invoices' },
        { href: '/customer-payments', label: 'Customer Payments' },
        { href: '/reports/ar-aging', label: 'AR Aging Report' },
      ]
    },
    {
      id: 5,
      icon: '👥',
      title: t.hr,
      description: t.hrDesc,
      href: '#',
      gradient: 'linear-gradient(135deg, #CE93D8 0%, #7B1FA2 100%)',
      status: 'coming',
      subLinks: []
    },
    {
      id: 6,
      icon: '⚙️',
      title: t.admin,
      description: t.adminDesc,
      href: '/users',
      gradient: 'linear-gradient(135deg, #90A4AE 0%, #455A64 100%)',
      status: 'active',
      subLinks: [
        { href: '/users', label: 'Users' },
        { href: '/audit-logs', label: 'Audit Logs' },
      ]
    },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bgWarm,
      padding: '0'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #F0E6E0',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src="/logo.png"
            alt="ACCHM"
            style={{ width: '48px', height: '48px', objectFit: 'contain' }}
          />
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: colors.primaryDark,
              margin: 0
            }}>
              ACCHM
            </h1>
            <p style={{ fontSize: '12px', color: colors.textSecondary, margin: 0 }}>
              Enterprise Resource Planning
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Language Switcher */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['vi', 'en', 'ja'] as Locale[]).map(lang => (
              <button
                key={lang}
                onClick={() => {
                  document.cookie = `locale=${lang};path=/;max-age=31536000`;
                  setLocale(lang);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: locale === lang ? colors.primary : '#F5F5F5',
                  color: locale === lang ? 'white' : colors.textSecondary,
                  transition: 'all 0.2s'
                }}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${colors.primary}`,
              background: 'white',
              color: colors.primary,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            {t.logout}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '48px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: '8px'
          }}>
            {t.welcome}, Admin! 👋
          </h2>
          <p style={{ fontSize: '18px', color: colors.textSecondary }}>
            {t.selectModule}
          </p>
        </div>

        {/* Module Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {modules.map((module) => (
            <div
              key={module.id}
              onMouseEnter={() => setHoveredModule(module.id)}
              onMouseLeave={() => setHoveredModule(null)}
              style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: hoveredModule === module.id
                  ? '0 12px 40px rgba(0,0,0,0.15)'
                  : '0 4px 20px rgba(0,0,0,0.06)',
                transform: hoveredModule === module.id ? 'translateY(-4px)' : 'none',
                transition: 'all 0.3s ease',
                cursor: module.status === 'coming' ? 'default' : 'pointer',
                opacity: module.status === 'coming' ? 0.7 : 1
              }}
            >
              {/* Module Header */}
              <div style={{
                background: module.gradient,
                padding: '24px',
                position: 'relative'
              }}>
                {/* Status Badge */}
                <span style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: module.status === 'active'
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(0,0,0,0.2)',
                  color: module.status === 'active'
                    ? colors.primaryDark
                    : 'white'
                }}>
                  {module.status === 'active' ? t.active : t.comingSoon}
                </span>

                <span style={{ fontSize: '48px' }}>{module.icon}</span>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginTop: '12px',
                  marginBottom: '4px'
                }}>
                  {module.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.85)',
                  margin: 0
                }}>
                  {module.description}
                </p>
              </div>

              {/* Sub Links */}
              {module.subLinks.length > 0 && (
                <div style={{ padding: '16px 20px' }}>
                  {module.subLinks.map((link, idx) => (
                    <Link
                      key={idx}
                      href={link.href}
                      style={{
                        display: 'block',
                        padding: '10px 14px',
                        marginBottom: '6px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        color: colors.text,
                        textDecoration: 'none',
                        background: '#FAFAFA',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#FFF0ED'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#FAFAFA'}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Coming Soon Placeholder */}
              {module.status === 'coming' && (
                <div style={{
                  padding: '24px 20px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '14px'
                }}>
                  🚧 {t.comingSoon}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '24px',
          borderTop: '1px solid #F0E6E0',
          color: colors.textSecondary,
          fontSize: '14px'
        }}>
          <p>
            ACCHM Enterprise © 2024 • {t.version} 1.0.0 •
            <Link
              href="/api/health"
              style={{
                color: colors.primary,
                textDecoration: 'none',
                marginLeft: '8px'
              }}
            >
              System Health
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
