'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { appMenus } from './Sidebar';

interface Tab {
    id: string;
    title: string;
    path: string;
    icon?: string;
    closable?: boolean;
    pinned?: boolean;
}

interface TabContextType {
    tabs: Tab[];
    activeTabId: string;
    openTab: (tab: Tab) => void;
    closeTab: (id: string) => void;
    switchTab: (id: string) => void;
    togglePin: (id: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    // Default dashboard tab is now closable and not strictly forced if user wants to close it.
    // However, keeping one tab might be good UX. Let's make it pinning-capable.
    // User request: "không mặc định trên content" -> potentially means it shouldn't auto-open or stick if not wanted.
    // Changing initial state to empty or just Dashboard as a normal tab.
    const [tabs, setTabs] = useState<Tab[]>([{ id: 'dashboard', title: 'Bàn làm việc', path: '/', icon: '🖥️', closable: true, pinned: false }]);
    const [activeTabId, setActiveTabId] = useState('dashboard');

    useEffect(() => {
        if (!pathname) return;

        setTabs(prevTabs => {
            const existingTab = prevTabs.find(t => t.path === pathname || (pathname.startsWith(t.path) && t.path !== '/'));
            if (existingTab) {
                setActiveTabId(currentActive => {
                    if (currentActive !== existingTab.id) return existingTab.id;
                    return currentActive;
                });
                return prevTabs;
            }

            let title = 'Dashboard';
            let icon = '📄';

            if (pathname === '/') {
                title = 'Bàn làm việc';
                icon = '🖥️';
            } else if (pathname === '/po' || pathname === '/cap-nhat-mua-hang') {
                title = 'Cập nhật mua hàng';
                icon = '🛒';
            } else {
                let found = false;
                for (const app in appMenus) {
                    for (const group of appMenus[app]) {
                        // Exact match
                        const exactItem = group.items.find(i => i.href === pathname);
                        if (exactItem) {
                            title = exactItem.name;
                            icon = exactItem.icon;
                            found = true;
                            break;
                        }
                        // Prefix match for details pages
                        const prefixItem = group.items.find(i => pathname.startsWith(i.href) && i.href !== '/');
                        if (prefixItem) {
                            title = prefixItem.name;
                            icon = prefixItem.icon;
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
            }

            const newTab: Tab = {
                id: pathname,
                title,
                path: pathname,
                icon,
                closable: true,
                pinned: false
            };

            setActiveTabId(newTab.id);
            return [...prevTabs, newTab];
        });
    }, [pathname]);

    const openTab = (tab: Tab) => {
        const existing = tabs.find(t => t.id === tab.id);
        if (!existing) {
            setTabs(prev => [...prev, { ...tab, closable: tab.closable ?? true, pinned: false }]);
        }
        setActiveTabId(tab.id);
        router.push(tab.path);
    };

    const closeTab = (id: string) => {
        const newTabs = tabs.filter(t => t.id !== id);
        // If we close the last tab, what happens? Maybe redirect to home but no tab?
        // Or keep empty? Let's allow empty for now or redirect to /
        if (newTabs.length === 0) {
            router.push('/');
        }

        setTabs(newTabs);

        if (activeTabId === id && newTabs.length > 0) {
            // Try to go to latest visited or just the last one
            const uniqueTabs = [...newTabs]; // Assuming order is insertion order
            const lastTab = uniqueTabs[uniqueTabs.length - 1];
            setActiveTabId(lastTab.id);
            router.push(lastTab.path);
        }
    };

    const switchTab = (id: string) => {
        const tab = tabs.find(t => t.id === id);
        if (tab) {
            setActiveTabId(id);
            router.push(tab.path);
        }
    };

    const togglePin = (id: string) => {
        setTabs(prev => prev.map(t =>
            t.id === id ? { ...t, pinned: !t.pinned } : t
        ));
    };

    return (
        <TabContext.Provider value={{ tabs, activeTabId, openTab, closeTab, switchTab, togglePin }}>
            {children}
        </TabContext.Provider>
    );
}

export function useTabs() {
    const context = useContext(TabContext);
    if (context === undefined) {
        throw new Error('useTabs must be used within a TabProvider');
    }
    return context;
}
