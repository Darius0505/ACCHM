'use client';

import { useTabs } from './TabContext';

export default function TabBar() {
    const { tabs, activeTabId, switchTab, closeTab, togglePin } = useTabs();

    // Sort tabs: Pinned first, then others
    const sortedTabs = [...tabs].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0; // Keep original order otherwise
    });

    return (
        <div style={{
            height: '36px',
            backgroundColor: '#F1F5F9', // Chrome-like tab bar bg
            display: 'flex',
            alignItems: 'flex-end',
            padding: '4px 8px 0',
            borderBottom: '1px solid #E2E8F0',
            gap: '4px',
            overflowX: 'auto'
        }} className="no-scrollbar">
            {sortedTabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                    <div
                        key={tab.id}
                        onClick={() => switchTab(tab.id)}
                        className="group"
                        style={{
                            height: '32px',
                            padding: '0 12px 0 10px',
                            backgroundColor: isActive ? '#FFFFFF' : '#E2E8F0',
                            borderRadius: '8px 8px 0 0',
                            borderTop: isActive ? '2px solid #C62828' : '1px solid transparent',
                            borderLeft: isActive ? '1px solid #E2E8F0' : '1px solid transparent',
                            borderRight: isActive ? '1px solid #E2E8F0' : '1px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            minWidth: '120px',
                            maxWidth: '200px',
                            position: 'relative',
                            userSelect: 'none',
                            color: isActive ? '#1E293B' : '#64748B',
                            fontSize: '12px',
                            fontWeight: isActive ? 600 : 500,
                            boxShadow: isActive ? '0 1px 0 #FFF' : 'none', // Mask bottom border
                            transform: isActive ? 'translateY(1px)' : 'none'
                        }}
                    >
                        {tab.icon && <span>{tab.icon}</span>}

                        <span style={{
                            flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                            {tab.title}
                        </span>

                        {/* Pin Action */}
                        <div
                            onClick={(e) => { e.stopPropagation(); togglePin(tab.id); }}
                            className={`opacity-0 group-hover:opacity-100 ${tab.pinned ? 'opacity-100' : ''}`}
                            style={{
                                cursor: 'pointer', fontSize: '12px',
                                transform: tab.pinned ? 'rotate(0deg)' : 'rotate(45deg)',
                                padding: '2px',
                                transition: 'all 0.2s',
                                color: tab.pinned ? '#C62828' : '#94A3B8'
                            }}
                            title={tab.pinned ? "Unpin" : "Pin"}
                        >
                            📌
                        </div>

                        {tab.closable !== false && (
                            <div
                                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                style={{
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', fontSize: '14px', marginLeft: tab.pinned ? '4px' : 'auto'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#CBD5E1'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                ×
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
