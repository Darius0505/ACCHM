'use client';

/**
 * Bank Transaction Form
 * Form for creating/editing Bank Deposits and Withdrawals (Báo Có / Báo Nợ)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AccountSelect from '@/components/journal/AccountSelect';

interface BankTransactionFormProps {
    initialData?: any;
    mode: 'create' | 'edit' | 'view';
}

interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    currency: string;
}

export default function BankTransactionForm({ initialData, mode }: BankTransactionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Bank Accounts for Dropdown
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

    // Form State
    const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>(initialData?.type || 'DEPOSIT');
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [bankAccountId, setBankAccountId] = useState(initialData?.bankAccountId || '');
    const [partnerId, setPartnerId] = useState(initialData?.partnerId || '');
    const [amount, setAmount] = useState(initialData?.amount || 0);
    const [description, setDescription] = useState(initialData?.description || '');
    const [contraAccountId, setContraAccountId] = useState(initialData?.contraAccountId || '');

    const isReadOnly = mode === 'view';

    // Fetch Bank Accounts on Mount
    useEffect(() => {
        fetch('/api/bank-accounts')
            .then(res => res.json())
            .then(data => {
                setBankAccounts(data.items || []);
                // Set default if creating and accounts exist
                if (mode === 'create' && data.items?.length > 0 && !bankAccountId) {
                    setBankAccountId(data.items[0].id);
                }
            })
            .catch(console.error);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Submit Logic
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = mode === 'create'
                ? '/api/bank-transactions'
                : `/api/bank-transactions/${initialData.id}`;

            const method = mode === 'create' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: 'DEFAULT_COMPANY_ID',
                    type,
                    date,
                    bankAccountId,
                    partnerId: partnerId || null,
                    amount: Number(amount),
                    description,
                    contraAccountId
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save transaction');
            }

            router.push('/bank-transactions');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handlePost() {
        if (!initialData?.id) return;
        if (!confirm('Post this transaction? This will affect bank balance.')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/bank-transactions/${initialData.id}/post`, {
                method: 'POST'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
                    {error}
                </div>
            )}

            {/* Main Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">

                {/* Type Selector (Radio or Tabs) */}
                {!isReadOnly && (
                    <div className="mb-6 flex gap-4">
                        <label className={`cursor-pointer px-4 py-2 rounded-md border ${type === 'DEPOSIT' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white border-gray-300'}`}>
                            <input
                                type="radio"
                                name="type"
                                value="DEPOSIT"
                                checked={type === 'DEPOSIT'}
                                onChange={() => setType('DEPOSIT')}
                                className="hidden"
                            />
                            Bank Deposit (Báo Có)
                        </label>
                        <label className={`cursor-pointer px-4 py-2 rounded-md border ${type === 'WITHDRAWAL' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'bg-white border-gray-300'}`}>
                            <input
                                type="radio"
                                name="type"
                                value="WITHDRAWAL"
                                checked={type === 'WITHDRAWAL'}
                                onChange={() => setType('WITHDRAWAL')}
                                className="hidden"
                            />
                            Bank Withdrawal (Báo Nợ)
                        </label>
                    </div>
                )}
                {isReadOnly && (
                    <div className="mb-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${type === 'DEPOSIT' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {type === 'DEPOSIT' ? 'DEPOSIT (Báo Có)' : 'WITHDRAWAL (Báo Nợ)'}
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left Column: General Info */}
                    <div className="space-y-4">
                        {initialData?.transactionNumber && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Transaction Number</label>
                                <div className="mt-1 p-2 bg-gray-50 rounded border font-mono font-bold text-gray-800">
                                    {initialData.transactionNumber}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bank Account</label>
                            <select
                                required
                                disabled={isReadOnly}
                                value={bankAccountId}
                                onChange={(e) => setBankAccountId(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                            >
                                <option value="">-- Select Bank Account --</option>
                                {bankAccounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.bankName} - {acc.accountNumber} ({acc.currency})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="date"
                                required
                                disabled={isReadOnly}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Partner</label>
                            <input
                                type="text"
                                placeholder="Select Partner (TODO)"
                                value={partnerId}
                                disabled={isReadOnly}
                                onChange={(e) => setPartnerId(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                required
                                rows={3}
                                disabled={isReadOnly}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Right Column: Financial Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <div className="relative mt-1">
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    disabled={isReadOnly}
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className={`block w-full px-3 py-2 border rounded-md text-right font-mono font-bold text-lg disabled:bg-gray-50 ${type === 'DEPOSIT' ? 'text-blue-600' : 'text-red-600'
                                        }`}
                                />
                                <div className="absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none">
                                    {/* TODO: Dynamic Currency based on Bank Account */}
                                    <span className="text-gray-500 sm:text-sm">VND</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded border space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Accounting</h4>

                            <div className="p-2 bg-blue-50 rounded text-xs text-blue-800 mb-2">
                                Note: The Bank Account&apos;s GL Account is automatically used as the {type === 'DEPOSIT' ? 'Debit' : 'Credit'} side. Select the corresponding account below.
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">
                                    {type === 'DEPOSIT' ? 'Credit Account (Source/Income)' : 'Debit Account (Expense/Liability)'}
                                </label>
                                {isReadOnly ? (
                                    <div className="mt-1 text-sm font-mono">{contraAccountId}</div>
                                ) : (
                                    <AccountSelect
                                        value={contraAccountId}
                                        onChange={setContraAccountId}
                                        error={!contraAccountId}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Cancel
                </button>

                {!isReadOnly && (
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Transaction'}
                    </button>
                )}

                {mode === 'edit' && initialData?.status === 'DRAFT' && (
                    <button
                        type="button"
                        onClick={handlePost}
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                        Post Transaction
                    </button>
                )}
            </div>
        </form>
    );
}
