/**
 * Skeleton Loader Component
 * Used for loading states in list pages and cards
 */

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rectangular' | 'circular';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
    const baseClass = 'animate-pulse bg-gray-200 rounded';

    const variantClass = {
        text: 'h-4 rounded',
        rectangular: 'rounded-md',
        circular: 'rounded-full',
    }[variant];

    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return <div className={`${baseClass} ${variantClass} ${className}`} style={style} />;
}

/**
 * Table Skeleton - for list pages
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="animate-pulse space-y-3">
            {/* Header */}
            <div className="flex gap-4 pb-3 border-b">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 py-2">
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Card Skeleton - for detail pages
 */
export function CardSkeleton() {
    return (
        <div className="animate-pulse bg-white rounded-lg p-6 shadow-sm border space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-3 mt-4">
                <Skeleton className="h-10 w-24" variant="rectangular" />
                <Skeleton className="h-10 w-24" variant="rectangular" />
            </div>
        </div>
    );
}
