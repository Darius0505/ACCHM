
'use client';

import React from 'react';
import { usePermissions } from './PermissionContext';

interface PermissionGuardProps {
    children: React.ReactNode;
    permission: string; // This maps to formCode like 'CASH_RECEIPT'
    action?: string;   // Default 'VIEW'
    fallback?: React.ReactNode;
}

export function PermissionGuard({
    children,
    permission,
    action = 'VIEW',
    fallback = null
}: PermissionGuardProps) {
    const { canAccess, isLoading } = usePermissions();

    if (isLoading) {
        return null; // or a spinner
    }

    if (!canAccess(permission, action)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
