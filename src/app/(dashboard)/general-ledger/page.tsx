'use client';

/**
 * General Ledger Page
 * View GL entries for a specific account and period
 */

import { useState, useEffect } from 'react';
import AccountSelect from '@/components/journal/AccountSelect';

interface GLEntry {
    date: string;
    entryNumber: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    journalEntryId: string;
}

interface GLResult {
    openingBalance: number;
    entries: GLEntry[];
    closingBalance: number;
    totalDebit: number;
    totalCredit: number;
}

export default function GeneralLedgerPage() {
    const [filters, setFilters] = useState({
        accountId: '',
        startDate: new Date().toISOString().slice(0, 8) + '01', // First day of current month
        endDate: new Date().toISOString().split('T')[0]         // Today
    });

    const [data, setData] = useState<GLResult | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (filters.accountId && filters.startDate && filters.endDate) {
            fetchLedger();
        }
    }, [filters]);

    async function fetchLedger() {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const res = await fetch(`/api/general-ledger?${params}`);
            const result = await res.json();

            if (res.ok) {
                setData(result);
            }
        } catch (error) {
            console.error('Error fetching ledger:', error);
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

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">General Ledger</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                    <AccountSelect
                        value={filters.accountId}
                        onChange={(id) => setFilters(f => ({ ...f, accountId: id }))}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
            </div>

            {/* Report */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {!filters.accountId ? (
                    <div className="p-8 text-center text-gray-500">
                        Please select an account to view ledger
                    </div>
                ) : loading ? (
                    <div className="p-8 text-center">Loading...</div>
                ) : data ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Opening Balance */}
                            <tr className="bg-gray-50 font-medium">
                                <td colSpan={3} className="px-6 py-4 text-right">Opening Balance:</td>
                                <td className="px-6 py-4 text-right">-</td>
                                <td className="px-6 py-4 text-right">-</td>
                                <td className="px-6 py-4 text-right">{formatNumber(data.openingBalance)}</td>
                            </tr>

                            {/* Entries */}
                            {data.entries.map((entry) => (
                                <tr key={entry.entryNumber} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(entry.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                        {entry.entryNumber}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">
                                        {entry.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                                        {entry.debit ? formatNumber(entry.debit) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                                        {entry.credit ? formatNumber(entry.credit) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-medium">
                                        {formatNumber(entry.balance)}
                                    </td>
                                </tr>
                            ))}

                            {/* Closing Balance */}
                            <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                <td colSpan={3} className="px-6 py-4 text-right">Closing Balance:</td>
                                <td className="px-6 py-4 text-right text-sm">{formatNumber(data.totalDebit)}</td>
                                <td className="px-6 py-4 text-right text-sm">{formatNumber(data.totalCredit)}</td>
                                <td className="px-6 py-4 text-right text-sm">{formatNumber(data.closingBalance)}</td>
                            </tr>
                        </tbody>
                    </table>
                ) : null}
            </div>
        </div>
    );
}
