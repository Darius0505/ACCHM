'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

// Search data source
const searchItems = [
    // Navigation
    { id: 'nav-home', type: 'Nav', name: 'Bàn làm việc', href: '/', icon: '🖥️' },
    { id: 'nav-cash', type: 'Nav', name: 'Quỹ tiền mặt', href: '/cash', icon: '💰' },
    { id: 'nav-bank', type: 'Nav', name: 'Ngân hàng', href: '/bank', icon: '🏦' },
    { id: 'nav-sales', type: 'Nav', name: 'Bán hàng', href: '/sales', icon: '🛒' },
    { id: 'nav-purchases', type: 'Nav', name: 'Mua hàng', href: '/purchases', icon: '🛍️' },
    { id: 'nav-accounts', type: 'Nav', name: 'Hệ thống Tài khoản', href: '/accounts', icon: '🔢' },

    // Actions
    { id: 'act-add-acc', type: 'Action', name: 'Thêm tài khoản mới', href: '/accounts?action=add', icon: '➕' },
    { id: 'act-report', type: 'Action', name: 'Xem báo cáo tổng hợp', href: '/reports', icon: '📊' },
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [pageTitle, setPageTitle] = useState('');

    // Search State
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const title = pathname === '/' ? 'Bàn làm việc' : (pathname.split('/').pop()?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Dashboard');
        setPageTitle(title === 'Accounts' ? 'Hệ thống Tài khoản' : title);
    }, [pathname]);

    // Command K Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Filter items
    const filteredItems = searchItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (item: typeof searchItems[0]) => {
        router.push(item.href);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <>
            <header style={{
                height: '64px',
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                zIndex: 40,
                flexShrink: 0
            }}>
                {/* Left: Breadcrumbs */}
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                        {pageTitle}
                    </h1>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0' }}>
                        ACCHM <span style={{ margin: '0 4px' }}>/</span> {pageTitle}
                    </p>
                </div>

                {/* Center: Search Trigger */}
                <div style={{ flex: 1, maxWidth: '480px', margin: '0 32px' }}>
                    <div
                        onClick={() => setIsOpen(true)}
                        style={{ position: 'relative', cursor: 'pointer' }}
                    >
                        <input
                            type="text"
                            readOnly
                            placeholder="Tìm kiếm nhanh (Ctrl + K)..."
                            style={{
                                width: '100%',
                                padding: '10px 16px 10px 40px',
                                border: '1px solid #E5E7EB',
                                borderRadius: '12px',
                                backgroundColor: '#F9FAFB',
                                fontSize: '14px',
                                color: '#111827',
                                outline: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        />
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                            🔍
                        </div>
                        <div style={{
                            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                            color: '#9CA3AF', fontSize: '11px', border: '1px solid #E5E7EB', borderRadius: '4px', padding: '2px 6px', backgroundColor: '#fff'
                        }}>
                            ⌘K
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button style={{
                        padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', position: 'relative', fontSize: '18px'
                    }}>
                        🔔
                        <span style={{
                            position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px',
                            backgroundColor: '#C62828', borderRadius: '50%', border: '2px solid white'
                        }}></span>
                    </button>

                </div>
            </header>

            {/* Command Palette Modal */}
            {isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '100px'
                }}>
                    <div style={{
                        width: '100%', maxWidth: '600px', backgroundColor: 'white',
                        borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '20px', marginRight: '12px' }}>🔍</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Nhập tên chức năng hoặc tài khoản..."
                                style={{
                                    flex: 1, border: 'none', outline: 'none', fontSize: '16px', color: '#111827'
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && filteredItems.length > 0) {
                                        handleSelect(filteredItems[selectedIndex]);
                                    }
                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
                                    }
                                    if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setSelectedIndex(prev => Math.max(prev - 1, 0));
                                    }
                                }}
                            />
                            <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#9CA3AF' }}>ESC</button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
                            {filteredItems.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
                                    Không tìm thấy kết quả
                                </div>
                            ) : (
                                filteredItems.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelect(item)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        style={{
                                            padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            backgroundColor: idx === selectedIndex ? '#F3F4F6' : 'transparent',
                                            transition: 'background 0.1s'
                                        }}
                                    >
                                        <span style={{ fontSize: '20px' }}>{item.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{item.name}</div>
                                            <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.type}</div>
                                        </div>
                                        {idx === selectedIndex && (
                                            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>⏎</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
