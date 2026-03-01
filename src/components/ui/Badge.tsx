import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'default';
    className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const variants = {
        success: 'bg-success-bg text-success-700 border-success-200',
        warning: 'bg-warning-bg text-warning-800 border-warning-200',
        danger: 'bg-danger-bg text-danger-700 border-danger-200',
        default: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    // Note: Tailwind v3 color palette might need specific shades (700, 800) to be safe, 
    // but since we defined base colors in config, we can also use opacity or specific hexes if needed.
    // For now, relying on Tailwind's default palette for shades if not explicitly overridden, 
    // or I should check if I defined shades. 
    // I only defined DEFAULT, bg. I should probably use specific text colors defined in config or standard tailwind colors.
    // Let's stick to standard tailwind class names for text shades which work if we didn't disable default colors.
    // My config "extend" keeps default colors.

    const finalVariantClass = {
        success: 'bg-success-bg text-green-800', // using green-800 for contrast
        warning: 'bg-warning-bg text-yellow-800',
        danger: 'bg-danger-bg text-red-800',
        default: 'bg-gray-100 text-gray-800',
    }[variant];

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${finalVariantClass} ${className}`}>
            {children}
        </span>
    );
}
