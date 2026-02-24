'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Permission Context for client-side permission checks.
 * 
 * permissionMap format: Record<formCode, actions[]>
 * Example: { CASH_RECEIPT: ['VIEW', 'ADD', 'EDIT', 'DELETE'], USERS: ['VIEW'] }
 * Wildcard: { '*': ['*'] } = superadmin
 */

interface PermissionContextType {
    permissionMap: Record<string, string[]>;
    roles: string[];
    scope: { type: string; values?: string[] };
    isLoading: boolean;
    canAccess: (formCode: string, action?: string) => boolean;
    isAdmin: () => boolean;
}

const PermissionContext = createContext<PermissionContextType>({
    permissionMap: {},
    roles: [],
    scope: { type: 'OWN' },
    isLoading: true,
    canAccess: () => false,
    isAdmin: () => false,
});

export function PermissionProvider({ children }: { children: React.ReactNode }) {
    const [permissionMap, setPermissionMap] = useState<Record<string, string[]>>({});
    const [roles, setRoles] = useState<string[]>([]);
    const [scope, setScope] = useState<{ type: string; values?: string[] }>({ type: 'OWN' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchPermissions() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setPermissionMap(data.user.permissionMap || {});
                    setRoles(data.user.roles || []);
                    setScope(data.user.scope || { type: 'OWN' });
                }
            } catch (error) {
                console.error('Failed to fetch permissions:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPermissions();
    }, []);

    const isAdmin = () => {
        return roles.includes('ADMIN') || !!permissionMap['*'];
    };

    const canAccess = (formCode: string, action: string = 'VIEW') => {
        // Superadmin / wildcard
        if (permissionMap['*']) return true;
        if (roles.includes('ADMIN')) return true;

        // Check specific form
        const formActions = permissionMap[formCode];
        if (!formActions) return false;

        return formActions.includes(action) || formActions.includes('*');
    };

    return (
        <PermissionContext.Provider value={{ permissionMap, roles, scope, isLoading, canAccess, isAdmin }}>
            {children}
        </PermissionContext.Provider>
    );
}

export function usePermissions() {
    return useContext(PermissionContext);
}
