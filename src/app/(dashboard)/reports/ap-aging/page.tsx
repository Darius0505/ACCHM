'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface APAgingRow {
    code: string;
    partnerName: string;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
    total: number;
}

export default function APAgingPage() {
    const [loading, setLoading] = useState(true);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<{ summary: any; details: APAgingRow[] } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/ap-aging?date=${asOfDate}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error('Failed to load AP Aging', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [asOfDate]);

    const formatNumber = (n: number) => n.toLocaleString('vi-VN');

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Báo Cáo Tuổi Nợ Phải Trả</h1>
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Tính đến ngày:</label>
                    <input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} className="border p-2 rounded" />
                    <button onClick={fetchData} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Xem</button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : !data || data.details.length === 0 ? (
                <div className="bg-white rounded shadow p-8 text-center text-gray-500">Không có công nợ phải trả.</div>
            ) : (
                <div className="bg-white rounded shadow overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4">Nhà Cung Cấp</th>
                                <th className="text-right p-4">Tổng nợ</th>
                                <th className="text-right p-4 bg-green-50">Chưa đến hạn</th>
                                <th className="text-right p-4 bg-yellow-50">1-30 ngày</th>
                                <th className="text-right p-4 bg-orange-50">31-60 ngày</th>
                                <th className="text-right p-4 bg-red-50">61-90 ngày</th>
                                <th className="text-right p-4 bg-red-100">&gt;90 ngày</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.details.map((row, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="p-4"><span className="font-medium">{row.code}</span> - {row.partnerName}</td>
                                    <td className="p-4 text-right font-bold">{formatNumber(row.total)}</td>
                                    <td className="p-4 text-right bg-green-50">{formatNumber(row.current)}</td>
                                    <td className="p-4 text-right bg-yellow-50">{formatNumber(row.days30)}</td>
                                    <td className="p-4 text-right bg-orange-50">{formatNumber(row.days60)}</td>
                                    <td className="p-4 text-right bg-red-50">{formatNumber(row.days90)}</td>
                                    <td className="p-4 text-right bg-red-100 text-red-700 font-medium">{formatNumber(row.over90)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold border-t-2">
                            <tr>
                                <td className="p-4">TỔNG CỘNG</td>
                                <td className="p-4 text-right">{formatNumber(data.summary.total)}</td>
                                <td className="p-4 text-right bg-green-100">{formatNumber(data.summary.current)}</td>
                                <td className="p-4 text-right bg-yellow-100">{formatNumber(data.summary.days30)}</td>
                                <td className="p-4 text-right bg-orange-100">{formatNumber(data.summary.days60)}</td>
                                <td className="p-4 text-right bg-red-100">{formatNumber(data.summary.days90)}</td>
                                <td className="p-4 text-right bg-red-200 text-red-800">{formatNumber(data.summary.over90)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
}
