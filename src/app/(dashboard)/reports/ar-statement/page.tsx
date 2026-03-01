'use client';

import { useState } from 'react';

export default function CustomerStatementPage() {
    const [partnerId, setPartnerId] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [partners, setPartners] = useState<any[]>([]);
    const [statement, setStatement] = useState<any>(null);

    // Fetch partners on mount
    useState(() => {
        fetch('/api/customers')
            .then(res => res.json())
            .then(data => setPartners(data.items || []))
            .catch(console.error);
    });

    const fetchStatement = async () => {
        if (!partnerId) {
            alert('Vui lòng chọn khách hàng');
            return;
        }
        setLoading(true);
        try {
            // NOTE: Backend for customer statement may need to be implemented
            // For now, we'll show a placeholder or call a hypothetical endpoint
            const res = await fetch(`/api/customers/${partnerId}/statement?from=${fromDate}&to=${toDate}`);
            if (!res.ok) {
                setStatement({ error: 'Tính năng đang phát triển' });
                return;
            }
            const json = await res.json();
            setStatement(json);
        } catch (err) {
            console.error('Failed to load statement', err);
            setStatement({ error: 'Có lỗi xảy ra' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Sổ Chi Tiết Công Nợ Khách Hàng</h1>

            <div className="bg-white rounded shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1">Khách hàng</label>
                        <select
                            value={partnerId}
                            onChange={e => setPartnerId(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">-- Chọn khách hàng --</option>
                            {partners.map(p => (
                                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Từ ngày</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Đến ngày</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={e => setToDate(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <button
                            onClick={fetchStatement}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Đang tải...' : 'Xem sổ'}
                        </button>
                    </div>
                </div>
            </div>

            {statement?.error ? (
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded text-center text-yellow-800">
                    {statement.error}
                </div>
            ) : statement ? (
                <div className="bg-white rounded shadow overflow-x-auto">
                    {/* Statement table would go here */}
                    <div className="p-8 text-center text-gray-500">
                        Dữ liệu sổ chi tiết sẽ hiển thị ở đây.
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded p-8 text-center text-gray-500">
                    Chọn khách hàng và khoảng thời gian để xem sổ chi tiết công nợ.
                </div>
            )}
        </div>
    );
}
