'use client';

/**
 * Journal Entry List Page
 * /journal-entries - List all journal entries with filters
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JournalEntry {
    id: string;
    entryNumber: string;
    date: string;
    description: string;
    totalDebit: number;
    totalCredit: number;
    status: string;
    journal: {
        code: string;
        name: string;
    };
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function JournalEntriesPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        page: 1
    });

    // TODO: Get from context/auth
    const companyId = 'DEFAULT_COMPANY_ID';

    useEffect(() => {
        fetchEntries();
    }, [filters]);

    async function fetchEntries() {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                companyId,
                page: String(filters.page),
                limit: '20',
                ...(filters.status && { status: filters.status }),
                ...(filters.search && { search: filters.search })
            });

            const res = await fetch(`/api/journal-entries?${params}`);
            const data = await res.json();

            setEntries(data.entries || []);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatNumber(num: number) {
        return new Intl.NumberFormat('vi-VN').format(num);
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('vi-VN');
    }

    function getStatusBadge(status: string) {
        const styles: Record<string, string> = {
            DRAFT: 'bg-yellow-100 text-yellow-800',
            POSTED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
                <Link
                    href="/journal-entries/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + New Entry
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="flex gap-4 flex-wrap">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={filters.search}
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="POSTED">Posted</option>
                        <option value="CANCELLED">Cancelled</option>
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
                        <p>No journal entries found</p>
                        <Link href="/journal-entries/new" className="mt-2 text-blue-600 hover:underline">
                            Create your first entry
                        </Link>
                    </div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/journal-entries/${entry.id}`} className="text-blue-600 hover:underline font-medium">
                                                {entry.entryNumber}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {formatDate(entry.date)}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-gray-900">
                                            {entry.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                                            {formatNumber(Number(entry.totalDebit))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {getStatusBadge(entry.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Link
                                                href={`/journal-entries/${entry.id}`}
                                                className="text-gray-600 hover:text-blue-600"
                                            >
                                                View
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
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                                        disabled={pagination.page <= 1}
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                    >
                                        Next
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
