'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useTabs } from './TabContext';
import { usePermissions } from '../auth/PermissionContext';

// Menu Definitions per App
export const appMenus: Record<string, { title?: string, items: { name: string, icon: string, href: string }[] }[]> = {
    dashboard: [
        {
            title: 'TỔNG QUAN', items: [
                { name: 'Bàn làm việc', icon: '🖥️', href: '/' },
                { name: 'Lịch làm việc', icon: '📅', href: '/calendar' },
                { name: 'To-do List', icon: '✅', href: '/tasks' },
            ]
        }
    ],
    accounting: [
        {
            title: 'TỔNG QUAN', items: [
                { name: 'Dashboard KT', icon: '📊', href: '/accounts/dashboard' },
            ]
        },
        {
            title: 'QUỸ TIỀN MẶT', items: [
                { name: 'Quy trình', icon: '⚡', href: '/cash-process' },
                { name: 'Thu tiền mặt', icon: '📥', href: '/cash-receipts' },
                { name: 'Chi tiền mặt', icon: '📤', href: '/cash-payments' },
                { name: 'Sổ quỹ', icon: '📒', href: '/cash-book' },
            ]
        },
        {
            title: 'NGÂN HÀNG', items: [
                { name: 'Giao dịch NH', icon: '🏦', href: '/bank-transactions' },
                { name: 'Sổ tiền gửi', icon: '💳', href: '/bank-book' },
            ]
        },
        {
            title: 'NGHIỆP VỤ', items: [
                { name: 'Tổng hợp', icon: '📒', href: '/general' },
                { name: 'Thuế', icon: '⚖️', href: '/tax' },
                { name: 'Kho', icon: '📦', href: '/inventory' },
                { name: 'Tài sản', icon: '🏢', href: '/assets' },
                { name: 'Công cụ', icon: '🛠️', href: '/tools' },
            ]
        },
        {
            title: 'DANH MỤC', items: [
                { name: 'Hệ thống TK', icon: '🔢', href: '/accounts/chart' },
                { name: 'Loại đối tượng', icon: '📇', href: '/accounting/categories/subject-types' },
                { name: 'Đối tượng', icon: '👥', href: '/accounting/categories/subjects' },
                { name: 'Công cụ dụng cụ', icon: '🛠️', href: '/accounting/categories/tools' },
                { name: 'Tài sản cố định', icon: '🏢', href: '/accounting/categories/fixed-assets' },
                { name: 'Tài khoản ngân hàng', icon: '🏦', href: '/accounting/categories/bank-accounts' },
                { name: 'Loại tiền', icon: '💱', href: '/accounting/categories/currencies' },
                { name: 'Nhóm thuế', icon: '🏷️', href: '/accounting/categories/tax-groups' },
                { name: 'Thuế suất', icon: '📊', href: '/accounting/categories/tax-rates' },
                { name: 'Kho', icon: '🏭', href: '/accounting/categories/warehouses' },
                { name: 'Loại VTHH', icon: '🗂️', href: '/accounting/categories/product-categories' },
                { name: 'Vật tư hàng hóa', icon: '📦', href: '/accounting/categories/products' },
                { name: 'Đối tượng THCP', icon: '🎯', href: '/accounting/categories/cost-centers' },
                { name: 'Khoản mục CP', icon: '📑', href: '/accounting/categories/cost-items' },
                { name: 'Tài khoản NH', icon: '🏦', href: '/accounting/categories/bank-accounts' },
            ]
        },
        {
            title: 'THIẾT LẬP KẾ TOÁN', items: [
                { name: 'Kỳ kế toán', icon: '📅', href: '/accounting/settings/periods' },
                { name: 'Khác', icon: '⚙️', href: '/accounting/settings/other' },
                { name: 'Đóng sổ', icon: '🔚', href: '/accounting/settings/closing' },
                { name: 'Chứng từ KT', icon: '🧾', href: '/accounting/settings/vouchers' },
                { name: 'Số dư đầu', icon: '💰', href: '/accounting/settings/opening-balance' },
            ]
        }
    ],
    purchases: [
        {
            title: 'MUA HÀNG', items: [
                { name: 'Tổng quan', icon: '📊', href: '/purchases' },
                { name: 'Đơn mua hàng', icon: '🛒', href: '/purchases/orders' },
                { name: 'Chứng từ mua', icon: '🧾', href: '/purchases/invoices' },
                { name: 'Trả lại hàng', icon: '↩️', href: '/purchases/returns' },
            ]
        },
        {
            title: 'ĐỐI TƯỢNG', items: [
                { name: 'Nhà cung cấp', icon: '🏢', href: '/purchases/vendors' },
                { name: 'Hợp đồng', icon: '📝', href: '/purchases/contracts' },
            ]
        },
        {
            title: 'BÁO CÁO', items: [
                { name: 'Công nợ', icon: '📉', href: '/purchases/reports/debt' },
                { name: 'Phân tích mua', icon: '📈', href: '/purchases/reports/analysis' },
            ]
        }
    ],
    sales: [
        {
            title: 'BÁN HÀNG', items: [
                { name: 'Tổng quan', icon: '📊', href: '/sales' },
                { name: 'Báo giá', icon: '🔖', href: '/sales/quotes' },
                { name: 'Đơn đặt hàng', icon: '🛒', href: '/sales/orders' },
                { name: 'Hóa đơn bán', icon: '🧾', href: '/sales/invoices' },
            ]
        },
        {
            title: 'ĐỐI TƯỢNG', items: [
                { name: 'Khách hàng', icon: '👥', href: '/sales/customers' },
                { name: 'Bảng giá', icon: '💲', href: '/sales/price-lists' },
            ]
        }
    ],
    office: [
        {
            title: 'VĂN PHÒNG', items: [
                { name: 'Tổng quan', icon: '📊', href: '/office' },
                { name: 'Văn bản', icon: '📄', href: '/office/documents' },
                { name: 'Thông báo', icon: '📢', href: '/office/announcements' },
            ]
        }
    ],
    crm: [
        {
            title: 'CRM', items: [
                { name: 'Tổng quan', icon: '📊', href: '/crm' },
                { name: 'Khách hàng', icon: '👥', href: '/crm/leads' },
                { name: 'Cơ hội', icon: '💰', href: '/crm/deals' },
            ]
        }
    ],
    inventory: [
        {
            title: 'KHO', items: [
                { name: 'Tổng quan', icon: '📊', href: '/inventory' },
                { name: 'Nhập kho', icon: '📥', href: '/inventory/inbound' },
                { name: 'Xuất kho', icon: '📤', href: '/inventory/outbound' },
                { name: 'Tồn kho', icon: '📦', href: '/inventory/stock' },
            ]
        }
    ],
    manufacturing: [
        {
            title: 'SẢN XUẤT', items: [
                { name: 'Tổng quan', icon: '📊', href: '/manufacturing' },
                { name: 'Lệnh sản xuất', icon: '🏭', href: '/manufacturing/orders' },
                { name: 'Định mức (BOM)', icon: '📝', href: '/manufacturing/bom' },
            ]
        }
    ],
    hrm: [
        {
            title: 'NHÂN SỰ', items: [
                { name: 'Tổng quan', icon: '📊', href: '/hrm' },
                { name: 'Nhân viên', icon: '👥', href: '/hrm/employees' },
                { name: 'Chấm công', icon: '🕒', href: '/hrm/timekeeping' },
                { name: 'Tính lương', icon: '💵', href: '/hrm/payroll' },
            ]
        }
    ],
    settings: [
        {
            title: 'THIẾT LẬP', items: [
                { name: 'Thông tin công ty', icon: '🏢', href: '/settings/company' },
                { name: 'Chi nhánh', icon: '🏢', href: '/settings/branches' },
                { name: 'Phòng ban', icon: '🚪', href: '/settings/departments' },
                { name: 'Người dùng', icon: '👤', href: '/settings/users' },
                { name: 'Phân quyền', icon: '🔒', href: '/settings/roles' },
            ]
        }
    ],
    po: [
        {
            title: 'PO', items: [
                { name: 'Cập nhật mua hàng', icon: '🛒', href: '/cap-nhat-mua-hang' },
            ]
        }
    ]
};

export default function Sidebar() {
    const pathname = usePathname();
    const { openTab } = useTabs();
    const { canAccess, isAdmin } = usePermissions();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const getFormCode = (href: string): string | null => {
        if (href.startsWith('/cash-receipts')) return 'CASH_RECEIPT';
        if (href.startsWith('/cash-payments')) return 'CASH_PAYMENT';
        if (href.startsWith('/bank-transactions')) return 'BANK_TRANSACTION';
        if (href.startsWith('/purchases/invoices')) return 'PURCHASE_INVOICE';
        if (href.startsWith('/sales/invoices')) return 'SALES_INVOICE';
        if (href.startsWith('/accounting/categories/products')) return 'PRODUCT';
        if (href.startsWith('/settings/users')) return 'USERS';
        if (href.startsWith('/settings/roles')) return 'ROLES';
        return null;
    };

    // State for collapsible groups (default all expanded, or logic based on user preference)
    // Using a set to track expanded titles. Defaulting some key ones to expanded might be nice, 
    // but let's start with them Expanded by default for better UX, or Collapsed?
    // User request: "khi tích thì bung ra" -> implies Collapsed by default.
    // However, hiding "TỔNG QUAN" (Overivew) by default is bad.
    // Let's default "TỔNG QUAN", "TIỀN", "NGHIỆP VỤ" to Expanded, others Collapsed.
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'TỔNG QUAN': true,
        'TIỀN': true,
        'QUỸ TIỀN MẶT': true,
        'NGHIỆP VỤ': true,
        'DANH MỤC': false,
        'THIẾT LẬP KẾ TOÁN': true,
        'THIẾT LẬP': true, // Keep for other modules like Settings app
        'MUA HÀNG': true,
        'BÁN HÀNG': true,
        'ĐỐI TƯỢNG': true,
        'BÁO CÁO': false,
        'PO': true
    });

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    // Determine current App based on pathname
    const currentApp = useMemo(() => {
        if (pathname.startsWith('/office')) return 'office';
        if (pathname.startsWith('/crm')) return 'crm';
        if (pathname.startsWith('/sales')) return 'sales';
        if (pathname.startsWith('/purchases')) return 'purchases';
        if (pathname.startsWith('/inventory')) return 'inventory';
        if (pathname.startsWith('/manufacturing')) return 'manufacturing';
        if (pathname.startsWith('/accounting') || pathname.startsWith('/cash') || pathname.startsWith('/bank') || pathname.startsWith('/tax') || pathname.startsWith('/general')) return 'accounting';
        if (pathname.startsWith('/hrm')) return 'hrm';
        if (pathname.startsWith('/settings')) return 'settings';
        if (pathname.startsWith('/cap-nhat-mua-hang')) return 'po';
        return 'dashboard'; // Default
    }, [pathname]);

    // FILTER MENU ITEMS BASED ON PERMISSIONS
    // FILTER MENU ITEMS BASED ON PERMISSIONS
    const menuItems = useMemo(() => {
        const rawMenus = appMenus[currentApp] || appMenus['dashboard'];
        if (isAdmin()) return rawMenus;

        return rawMenus.map(group => {
            const filteredItems = group.items.filter(item => {
                const formCode = getFormCode(item.href);
                if (!formCode) return true; // Visible if no specific mapping
                return canAccess(formCode, 'VIEW');
            });
            return { ...group, items: filteredItems };
        }).filter(group => group.items.length > 0);
    }, [currentApp, canAccess, isAdmin]);

    // Styles
    const sidebarStyle = {
        width: isCollapsed ? '70px' : '230px', // Slightly narrower context sidebar
        minWidth: isCollapsed ? '70px' : '230px',
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column' as const,
        transition: 'width 0.3s ease',
        zIndex: 50,
        // boxShadow: '1px 0 10px rgba(0,0,0,0.02)'
    };

    return (
        <aside style={sidebarStyle}>
            {/* Header: Module Name */}
            <div style={{
                height: '64px', borderBottom: '1px solid #F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: isCollapsed ? '0 22px' : '0 20px',
            }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {!isCollapsed ? (currentApp === 'accounting' ? 'KẾ TOÁN' : currentApp === 'purchases' ? 'MUA HÀNG' : currentApp === 'sales' ? 'BÁN HÀNG' : currentApp === 'office' ? 'VĂN PHÒNG' : currentApp === 'crm' ? 'CRM' : currentApp === 'inventory' ? 'KHO' : currentApp === 'manufacturing' ? 'SẢN XUẤT' : currentApp === 'hrm' ? 'NHÂN SỰ' : currentApp === 'settings' ? 'THIẾT LẬP' : currentApp === 'po' ? 'PO' : 'DASHBOARD') : ''}
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', fontSize: '18px' }}
                >
                    {isCollapsed ? '»' : '«'}
                </button>
            </div>

            {/* Navigation */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
                {isCollapsed ? (
                    // Icons only (Collapsed view - no groups, just flattened list or simplified)
                    // When collapsed, listing all items without groups is cleaner but long.
                    // For now keeping simple flat list.
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        {menuItems.flatMap(g => g.items).map((item) => (
                            <div
                                key={item.href}
                                onClick={() => openTab({ id: item.href, title: item.name, path: item.href, icon: item.icon })}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '18px', margin: '0 auto',
                                    backgroundColor: (pathname === item.href) ? '#FFEBEE' : 'transparent',
                                    color: (pathname === item.href) ? '#C62828' : '#6B7280',
                                    cursor: 'pointer'
                                }}
                                title={item.name}
                            >
                                {item.icon}
                            </div>
                        ))}
                    </div>
                ) : (
                    // Full menu with Collapsible Groups
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {menuItems.map((group, idx) => {
                            const isExpanded = group.title ? expandedGroups[group.title] : true;

                            return (
                                <div key={idx} style={{ marginBottom: '8px' }}>
                                    {group.title && (
                                        <div
                                            onClick={() => group.title && toggleGroup(group.title)}
                                            style={{
                                                fontSize: '11px', fontWeight: 700, color: '#9CA3AF',
                                                marginBottom: '6px', padding: '6px 12px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                cursor: 'pointer', userSelect: 'none',
                                                borderRadius: '6px'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <span>{group.title}</span>
                                            <span style={{ fontSize: '10px', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                                        </div>
                                    )}

                                    {/* Items Container */}
                                    {(isExpanded || !group.title) && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: group.title ? '0' : '0' }}>
                                            {group.items.map((item) => {
                                                const isActive = pathname === item.href;
                                                return (
                                                    <div
                                                        key={item.href}
                                                        onClick={() => openTab({ id: item.href, title: item.name, path: item.href, icon: item.icon })}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', padding: '8px 12px',
                                                            borderRadius: '6px',
                                                            backgroundColor: isActive ? '#FFEBEE' : 'transparent',
                                                            color: isActive ? '#C62828' : '#4B5563',
                                                            fontWeight: isActive ? 600 : 500,
                                                            fontSize: '13px',
                                                            transition: 'all 0.2s',
                                                            cursor: 'pointer'
                                                        }}
                                                        onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                                                        onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                    >
                                                        <span style={{ marginRight: '10px', fontSize: '16px' }}>{item.icon}</span>
                                                        <span style={{ flex: 1 }}>{item.name}</span>
                                                        {isActive && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#C62828' }}></span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </aside>
    );
}
