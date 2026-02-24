'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '../auth/PermissionContext';

// Major Modules (Apps)
const apps = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', href: '/dashboard', activePrefix: '/dashboard' },
    { id: 'office', name: 'Văn phòng', icon: '🏢', href: '/office', activePrefix: '/office' },
    { id: 'crm', name: 'CRM', icon: '🤝', href: '/crm', activePrefix: '/crm' },
    { id: 'sales', name: 'Bán hàng', icon: '🛒', href: '/sales', activePrefix: '/sales' },
    { id: 'purchases', name: 'Mua hàng', icon: '🛍️', href: '/purchases', activePrefix: '/purchases' },
    { id: 'inventory', name: 'Kho', icon: '📦', href: '/inventory', activePrefix: '/inventory' },
    { id: 'manufacturing', name: 'Sản xuất', icon: '🏭', href: '/manufacturing', activePrefix: '/manufacturing' },
    { id: 'accounting', name: 'Kế toán', icon: '💰', href: '/accounts', activePrefix: ['/accounts', '/cash', '/bank', '/general', '/tax'] },
    { id: 'hrm', name: 'Nhân sự', icon: '👥', href: '/hrm', activePrefix: '/hrm' },
    { id: 'settings', name: 'Thiết lập chung', icon: '⚙️', href: '/settings', activePrefix: '/settings' },
];

export default function AppRail() {
    const pathname = usePathname();
    const { canAccess, isAdmin } = usePermissions();

    const checkActive = (prefix: string | string[]) => {
        if (Array.isArray(prefix)) {
            return prefix.some(p => pathname.startsWith(p));
        }
        return pathname === prefix || pathname.startsWith(prefix + '/');
    };

    // Helper to check if an App Module should be visible
    const isAppVisible = (appId: string) => {
        if (isAdmin()) return true;
        // Map App ID to required permission or check if any child form is accessible
        // Simple mapping for now:
        switch (appId) {
            case 'accounting': return true; // Always visible for now, or check specific forms
            case 'settings': return true; // Settings usually has some public items
            case 'purchases': return canAccess('PURCHASE_INVOICE', 'VIEW'); // Example check
            case 'sales': return canAccess('SALES_INVOICE', 'VIEW');
            // Add more module-level checks
            default: return true;
        }
    };

    const visibleApps = apps.filter(app => isAppVisible(app.id));

    return (
        <div style={{
            width: '64px',
            height: '100vh',
            backgroundColor: '#2A0A0A', // Deep Merlot (Fire-compatible dark)
            borderRight: '1px solid #1F2937',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 0',
            zIndex: 60,
            flexShrink: 0
        }}>
            {/* Main Logo / Home */}
            <Link href="/" style={{ marginBottom: '24px', textDecoration: 'none' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #E57373 0%, #C62828 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', color: 'white',
                    boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
                    cursor: 'pointer'
                }}>
                    <img src="/logo.png" alt="ACCHM" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                </div>
            </Link>

            {/* App Icons */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
                {visibleApps.map((app) => {
                    const isActive = checkActive(app.activePrefix);
                    return (
                        <div key={app.id} className="group" style={{ position: 'relative' }}>
                            <Link
                                href={app.href}
                                style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '20px',
                                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                    color: isActive ? '#E57373' : '#BCAAA4',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    position: 'relative'
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = '#1F2937';
                                        e.currentTarget.style.color = '#F3F4F6';
                                    }
                                    const tooltip = document.getElementById(`tooltip-${app.id}`);
                                    if (tooltip) tooltip.style.opacity = '1';
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#BCAAA4';
                                    }
                                    const tooltip = document.getElementById(`tooltip-${app.id}`);
                                    if (tooltip) tooltip.style.opacity = '0';
                                }}
                            >
                                {app.icon}
                                {isActive && <div style={{
                                    position: 'absolute', left: 0, top: '10px', bottom: '10px', width: '3px',
                                    backgroundColor: '#C62828', borderTopRightRadius: '4px', borderBottomRightRadius: '4px'
                                }}></div>}
                            </Link>

                            {/* Hover Tooltip */}
                            <div
                                id={`tooltip-${app.id}`}
                                style={{
                                    position: 'absolute', left: '56px', top: '50%', transform: 'translateY(-50%)',
                                    backgroundColor: '#374151', color: 'white', padding: '6px 12px', borderRadius: '6px',
                                    fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                                    opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    zIndex: 100
                                }}
                            >
                                {app.name}
                                <div style={{
                                    position: 'absolute', left: '-4px', top: '50%', transform: 'translateY(-50%) rotate(45deg)',
                                    width: '8px', height: '8px', backgroundColor: '#374151'
                                }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto' }}>

                <Link href="/login" style={{ textDecoration: 'none' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #E57373 0%, #C62828 100%)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                    }} title="Đăng xuất">
                        TB
                    </div>
                </Link>
            </div>
        </div>
    );
}
