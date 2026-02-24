'use client';

import { useState, useEffect } from 'react';
import CashPaymentForm from '@/components/cash/CashPaymentForm';

export default function ViewCashPaymentPage({ params }: { params: { id: string } }) {
    const [payment, setPayment] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/cash-payments/${params.id}`)
            .then(res => res.json())
            .then(setPayment)
            .catch(console.error);
    }, [params.id]);

    if (!payment) return <div className="p-6">Loading...</div>;

    const mode = payment.status === 'DRAFT' ? 'edit' : 'view';

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    {mode === 'edit' ? 'Sửa Phiếu Chi' : `Phiếu Chi: ${payment.paymentNumber}`}
                </h1>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${payment.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {payment.status}
                    </span>
                </div>
            </div>
            <CashPaymentForm mode={mode} initialData={payment} />
        </div>
    );
}
