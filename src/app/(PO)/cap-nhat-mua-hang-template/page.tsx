'use client';

/**
 * Cập nhật mua hàng
 * /cap-nhat-mua-hang - List purchase entries with filters
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PurchaseEntry {
    id: string;
    documentNo: string;
    date: string;
    supplier: string;
    totalAmount: number;
    status: string;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function CapNhatMuaHangPage() {
    const [entries, setEntries] = useState<PurchaseEntry[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        page: 1
    });

    useEffect(() => {
        // Simulate fetch for layout
        setLoading(true);
        setTimeout(() => {
            setEntries([]);
            setLoading(false);
        }, 500);
    }, [filters]);

    function formatNumber(num: number) {
        return new Intl.NumberFormat('vi-VN').format(num);
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('vi-VN');
    }

    function getStatusBadge(status: string) {
        const styles: Record<string, string> = {
            DRAFT: 'bg-yellow-100 text-yellow-800',
            COMPLETED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {status || 'Unknown'}
            </span>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Cập nhật mua hàng</h1>
                <Link
                    href="/cap-nhat-mua-hang/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Thêm mới
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="flex gap-4 flex-wrap">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={filters.search}
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="DRAFT">Nháp</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <p>Không tìm thấy dữ liệu</p>
                        <Link href="/cap-nhat-mua-hang/new" className="mt-2 text-blue-600 hover:underline">
                            Tạo phiếu mới
                        </Link>
                    </div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số chứng từ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà cung cấp</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/cap-nhat-mua-hang/${entry.id}`} className="text-blue-600 hover:underline font-medium">
                                                {entry.documentNo}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {formatDate(entry.date)}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-gray-900">
                                            {entry.supplier}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                                            {formatNumber(Number(entry.totalAmount))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {getStatusBadge(entry.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Link
                                                href={`/cap-nhat-mua-hang/${entry.id}`}
                                                className="text-gray-600 hover:text-blue-600"
                                            >
                                                Xem
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="px-6 py-4 border-t flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                    Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trên {pagination.total}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                                        disabled={pagination.page <= 1}
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                    >
                                        Trước
                                    </button>
                                    <button
                                        onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
