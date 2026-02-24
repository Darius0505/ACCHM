'use client';

/**
 * Cash Book Report Page (Sổ Quỹ Tiền Mặt)
 */

import { useState, useEffect } from 'react';

export default function CashBookPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [currency, setCurrency] = useState('VND');

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                companyId: 'DEFAULT_COMPANY_ID',
                fromDate,
                toDate,
                currency
            });
            const res = await fetch(`/api/cash-book?${params}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Cash Book (Sổ Quỹ Tiền Mặt)</h1>
            </div>

            {/* Process Flow */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <h2 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">Quy trình Quỹ Tiền Mặt</h2>
                <div className="flex items-center gap-8 overflow-x-auto pb-2">
                    {/* Step 1: Input Actions */}
                    <div className="flex flex-col gap-4">
                        <a
                            href="/cash-receipts/new"
                            className="flex items-center gap-3 p-4 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors w-64 group cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 group-hover:bg-white transition-colors">
                                📥
                            </div>
                            <div>
                                <div className="font-bold text-blue-900">Thu tiền</div>
                                <div className="text-xs text-blue-700">Lập phiếu thu tiền mặt</div>
                            </div>
                        </a>

                        <a
                            href="/cash-payments/new"
                            className="flex items-center gap-3 p-4 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors w-64 group cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 group-hover:bg-white transition-colors">
                                📤
                            </div>
                            <div>
                                <div className="font-bold text-orange-900">Chi tiền</div>
                                <div className="text-xs text-orange-700">Lập phiếu chi tiền mặt</div>
                            </div>
                        </a>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-300 transform scale-y-150">
                        ➡️
                    </div>

                    {/* Step 2: Cash Book (Current) */}
                    <div className="flex items-center gap-3 p-4 border-2 border-green-500 bg-green-50 rounded-lg w-64 shadow-md">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                            📒
                        </div>
                        <div>
                            <div className="font-bold text-green-900">Sổ Quỹ</div>
                            <div className="text-xs text-green-700">Theo dõi dòng tiền</div>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-300 transform scale-y-150">
                        ➡️
                    </div>

                    {/* Step 3: Reporting */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 p-3 border border-gray-200 bg-gray-50 rounded-lg w-56 opacity-75">
                            <span className="text-xl">📊</span>
                            <span className="text-sm font-medium text-gray-700">Báo cáo tồn quỹ</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 border border-gray-200 bg-gray-50 rounded-lg w-56 opacity-75">
                            <span className="text-xl">📈</span>
                            <span className="text-sm font-medium text-gray-700">Dự báo dòng tiền</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700">From Date</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="mt-1 block px-3 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">To Date</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="mt-1 block px-3 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="mt-1 block px-3 py-2 border rounded-md w-24"
                    >
                        <option value="VND">VND</option>
                        <option value="USD">USD</option>
                    </select>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    View Report
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">Loading...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doc #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receipt (Thu)</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payment (Chi)</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance (Tồn)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Opening Balance Row */}
                            {data?.openingBalance && (
                                <tr className="bg-gray-50 font-medium">
                                    <td colSpan={3} className="px-4 py-3 text-right">Opening Balance</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                    <td className="px-4 py-3 text-right">{new Intl.NumberFormat('vi-VN').format(data.openingBalance.balance)}</td>
                                </tr>
                            )}

                            {/* Transactions */}
                            {data?.entries?.map((row: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-500 text-sm">
                                        {new Date(row.date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-4 py-3 text-blue-600 font-medium text-sm">
                                        {row.refNumber}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 text-sm truncate max-w-xs">
                                        {row.description}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        {row.debit > 0 ? new Intl.NumberFormat('vi-VN').format(row.debit) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        {row.credit > 0 ? new Intl.NumberFormat('vi-VN').format(row.credit) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-bold">
                                        {new Intl.NumberFormat('vi-VN').format(row.balance)}
                                    </td>
                                </tr>
                            ))}

                            {/* Closing Balance */}
                            {data?.closingBalance && (
                                <tr className="bg-gray-100 font-bold">
                                    <td colSpan={3} className="px-4 py-3 text-right">Closing Balance</td>
                                    <td className="px-4 py-3 text-right">{new Intl.NumberFormat('vi-VN').format(data.totalDebit)}</td>
                                    <td className="px-4 py-3 text-right">{new Intl.NumberFormat('vi-VN').format(data.totalCredit)}</td>
                                    <td className="px-4 py-3 text-right">{new Intl.NumberFormat('vi-VN').format(data.closingBalance.balance)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
