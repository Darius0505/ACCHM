'use client';

/**
 * Bank Book Report Page (Sổ Tiền Gửi Ngân Hàng)
 */

import { useState, useEffect } from 'react';

interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    currency: string;
}

export default function BankBookPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [bankAccountId, setBankAccountId] = useState('');

    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

    // Fetch Bank Accounts initially
    useEffect(() => {
        fetch('/api/bank-accounts')
            .then(res => res.json())
            .then(resData => {
                setBankAccounts(resData.items || []);
                if (resData.items?.length > 0) {
                    setBankAccountId(resData.items[0].id);
                }
            })
            .catch(console.error);
    }, []);

    // Fetch Report Data whenever filters change (and we have a bank account selected)
    useEffect(() => {
        if (bankAccountId) {
            fetchData();
        }
    }, [bankAccountId]); // Fetch when bank account changes, or manually via button

    async function fetchData() {
        if (!bankAccountId) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                companyId: 'DEFAULT_COMPANY_ID',
                bankAccountId,
                fromDate,
                toDate
            });
            const res = await fetch(`/api/bank-book?${params}`);
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
                <h1 className="text-2xl font-bold text-gray-900">Bank Book (Sổ Tiền Gửi)</h1>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Bank Account</label>
                    <select
                        value={bankAccountId}
                        onChange={(e) => setBankAccountId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                    >
                        {bankAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                                {acc.bankName} - {acc.accountNumber} ({acc.currency})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">From Date</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">To Date</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                    />
                </div>

                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 h-[42px]"
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deposit (Gửi)</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Withdraw (Rút)</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance (Tồn)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Opening Balance Row */}
                            {data?.openingBalance && (
                                <tr className="bg-gray-50 font-medium">
                                    <td colSpan={4} className="px-4 py-3 text-right">Opening Balance</td>
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
                                    <td className="px-4 py-3 text-gray-900 text-sm truncate max-w-[150px]">
                                        {row.partnerName || '-'}
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
                                    <td colSpan={4} className="px-4 py-3 text-right">Closing Balance</td>
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
