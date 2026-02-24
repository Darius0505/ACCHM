'use client';

import { useState, useEffect } from 'react';
import BankTransactionForm from '@/components/bank/BankTransactionForm';

export default function ViewBankTransactionPage({ params }: { params: { id: string } }) {
    const [transaction, setTransaction] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/bank-transactions/${params.id}`)
            .then(res => res.json())
            .then(setTransaction)
            .catch(console.error);
    }, [params.id]);

    if (!transaction) return <div className="p-6">Loading...</div>;

    const mode = transaction.status === 'DRAFT' ? 'edit' : 'view';

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    {mode === 'edit' ? 'Edit Transaction' : `View Transaction: ${transaction.transactionNumber}`}
                </h1>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${transaction.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {transaction.status}
                    </span>
                </div>
            </div>
            <BankTransactionForm mode={mode} initialData={transaction} />
        </div>
    );
}
