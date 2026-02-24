"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ExportButton from "@/components/reports/ExportButton";

interface BalanceSheetData {
    assets: { total: number; details: any[] };
    liabilities: { total: number; details: any[] };
    equity: { total: number; details: any[]; calculatedRetainedEarnings: number };
    totalLiabilitiesAndEquity: number;
}

export default function BalanceSheetPage() {
    const [asOfDate, setAsOfDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [report, setReport] = useState<BalanceSheetData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/balance-sheet?asOfDate=${asOfDate}`);
            if (!res.ok) throw new Error("Failed to fetch report");
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error(error);
            alert("Failed to load Balance Sheet");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
        if (format === 'excel') {
            try {
                const res = await fetch(`/api/reports/balance-sheet/export?asOfDate=${asOfDate}&format=excel`);
                if (!res.ok) throw new Error("Failed to export");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `BangCanDoiKeToan_${asOfDate}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Export error:', error);
                alert('Lỗi khi xuất file Excel');
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Bảng Cân Đối Kế Toán</h1>
                    <p className="text-sm text-text-secondary mt-1">Mẫu số B01-DN theo Thông tư 200/2014/TT-BTC</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">Tại ngày:</span>
                    <input
                        type="date"
                        value={asOfDate}
                        onChange={(e) => setAsOfDate(e.target.value)}
                        className="border border-border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                    />
                    <Button onClick={fetchReport} isLoading={loading}>Xem báo cáo</Button>
                    <ExportButton onExport={handleExport} disabled={!report} />
                </div>
            </div>

            {!report && !loading && (
                <Card className="text-center py-12">
                    <p className="text-text-secondary">Select a date and click &quot;Run Report&quot; to generate.</p>
                </Card>
            )}

            {report && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Assets Column */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-text-primary border-b-2 border-primary pb-2">Assets</h2>
                        <Card>
                            <div className="space-y-3">
                                {report.assets.details.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-text-primary">{item.name}</span>
                                            <span className="text-xs text-text-secondary">{item.code}</span>
                                        </div>
                                        <span className="font-medium text-text-primary">{formatCurrency(item.balance)}</span>
                                    </div>
                                ))}
                                {report.assets.details.length === 0 && <div className="text-text-tertiary text-sm italic">No assets recorded</div>}
                            </div>
                            <div className="flex justify-between mt-6 pt-4 border-t border-border font-bold text-lg">
                                <span>Total Assets</span>
                                <span>{formatCurrency(report.assets.total)}</span>
                            </div>
                        </Card>
                    </div>

                    {/* Liabilities & Equity Column */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-text-primary border-b-2 border-primary pb-2">Liabilities & Equity</h2>

                        {/* Liabilities */}
                        <Card>
                            <h3 className="text-lg font-semibold text-text-primary mb-4">Liabilities</h3>
                            <div className="space-y-3">
                                {report.liabilities.details.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-text-primary">{item.name}</span>
                                            <span className="text-xs text-text-secondary">{item.code}</span>
                                        </div>
                                        <span className="font-medium text-text-primary">{formatCurrency(item.balance)}</span>
                                    </div>
                                ))}
                                {report.liabilities.details.length === 0 && <div className="text-text-tertiary text-sm italic">No liabilities recorded</div>}
                            </div>
                            <div className="flex justify-between mt-4 pt-2 border-t border-border font-semibold">
                                <span>Total Liabilities</span>
                                <span>{formatCurrency(report.liabilities.total)}</span>
                            </div>
                        </Card>

                        {/* Equity */}
                        <Card>
                            <h3 className="text-lg font-semibold text-text-primary mb-4">Equity</h3>
                            <div className="space-y-3">
                                {report.equity.details.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-text-primary">{item.name}</span>
                                            <span className="text-xs text-text-secondary">{item.code}</span>
                                        </div>
                                        <span className="font-medium text-text-primary">{formatCurrency(item.balance)}</span>
                                    </div>
                                ))}

                                {/* Calculated Retained Earnings */}
                                <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-text-primary">Retained Earnings (YTD)</span>
                                        <span className="text-xs text-text-secondary">Calculated</span>
                                    </div>
                                    <span className={`font-medium ${report.equity.calculatedRetainedEarnings >= 0 ? 'text-text-primary' : 'text-danger'}`}>
                                        {formatCurrency(report.equity.calculatedRetainedEarnings)}
                                    </span>
                                </div>

                            </div>
                            <div className="flex justify-between mt-4 pt-2 border-t border-border font-semibold">
                                <span>Total Equity</span>
                                <span>{formatCurrency(report.equity.total + report.equity.calculatedRetainedEarnings)}</span>
                            </div>
                        </Card>

                        {/* Total L+E */}
                        <div className="bg-surface border border-primary/30 rounded-lg p-6 flex justify-between items-center shadow-md">
                            <span className="font-bold text-lg text-text-primary">Total Liabilities & Equity</span>
                            <span className="font-bold text-lg text-primary">{formatCurrency(report.totalLiabilitiesAndEquity)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
