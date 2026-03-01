'use client';

/**
 * Trial Balance Page
 * View balances of all accounts at a specific date
 */

import { useState, useEffect } from 'react';

interface TBRow {
    code: string;
    name: string;
    debit: number;
    credit: number;
    level: number;
}

interface TBResult {
    rows: TBRow[];
    totalDebit: number;
    totalCredit: number;
}

export default function TrialBalancePage() {
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<TBResult | null>(null);
    const [loading, setLoading] = useState(false);

    // TODO: Get from context/auth
    const companyId = 'DEFAULT_COMPANY_ID';

    useEffect(() => {
        fetchReport();
    }, [asOfDate]);

    async function fetchReport() {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                companyId,
                asOfDate
            });

            const res = await fetch(`/api/trial-balance?${params}`);
            const result = await res.json();

            if (res.ok) {
                setData(result);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatNumber(num: number) {
        if (!num) return '-';
        return new Intl.NumberFormat('vi-VN').format(num);
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Trial Balance</h1>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">As of:</label>
                    <input
                        type="date"
                        value={asOfDate}
                        onChange={(e) => setAsOfDate(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">Loading...</div>
                ) : data ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Account</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase w-48">Debit</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase w-48">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.rows.map((row) => (
                                <tr key={row.code} className={`hover:bg-gray-50 ${row.level === 1 ? 'font-bold bg-gray-50' : ''}`}>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                                        <span style={{ paddingLeft: `${(row.level - 1) * 1}rem` }}>
                                            {row.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-2 text-sm text-gray-900">
                                        {row.name}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-right font-mono">
                                        {formatNumber(row.debit)}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-right font-mono">
                                        {formatNumber(row.credit)}
                                    </td>
                                </tr>
                            ))}

                            {/* Totals */}
                            <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                <td colSpan={2} className="px-6 py-4 text-center">TOTAL</td>
                                <td className="px-6 py-4 text-right text-sm">{formatNumber(data.totalDebit)}</td>
                                <td className="px-6 py-4 text-right text-sm">{formatNumber(data.totalCredit)}</td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-gray-500">No data available</div>
                )}
            </div>
        </div>
    );
}
