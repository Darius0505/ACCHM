"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface IncomeStatementData {
    revenue: { total: number; details: any[] };
    cogs: { total: number; details: any[] };
    grossProfit: number;
    expenses: { total: number; details: any[] };
    netIncome: number;
}

export default function IncomeStatementPage() {
    const [startDate, setStartDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    );
    const [report, setReport] = useState<IncomeStatementData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/income-statement?startDate=${startDate}&endDate=${endDate}`);
            if (!res.ok) throw new Error("Failed to fetch report");
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error(error);
            alert("Failed to load Income Statement");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Income Statement</h1>
                    <p className="text-sm text-text-secondary mt-1">Profit & Loss Report</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                    />
                    <span className="text-text-secondary">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                    />
                    <Button onClick={fetchReport} isLoading={loading}>Run Report</Button>
                </div>
            </div>

            {!report && !loading && (
                <Card className="text-center py-12">
                    <p className="text-text-secondary">Select a date range and click &quot;Run Report&quot; to generate.</p>
                </Card>
            )}

            {report && (
                <div className="space-y-6">
                    {/* Revenue Section */}
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border pb-2">Revenue</h3>
                        <div className="space-y-2">
                            {report.revenue.details.map((item: any) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-text-secondary">{item.code} - {item.name}</span>
                                    <span className="font-medium text-text-primary">{formatCurrency(item.balance)}</span>
                                </div>
                            ))}
                            {report.revenue.details.length === 0 && <div className="text-text-tertiary text-sm italic">No revenue recorded</div>}
                        </div>
                        <div className="flex justify-between mt-4 pt-3 border-t border-border font-bold">
                            <span>Total Revenue</span>
                            <span>{formatCurrency(report.revenue.total)}</span>
                        </div>
                    </Card>

                    {/* COGS Section */}
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border pb-2">Cost of Goods Sold</h3>
                        <div className="space-y-2">
                            {report.cogs.details.map((item: any) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-text-secondary">{item.code} - {item.name}</span>
                                    <span className="font-medium text-text-primary">{formatCurrency(item.balance)}</span>
                                </div>
                            ))}
                            {report.cogs.details.length === 0 && <div className="text-text-tertiary text-sm italic">No COGS recorded</div>}
                        </div>
                        <div className="flex justify-between mt-4 pt-3 border-t border-border font-bold">
                            <span>Total COGS</span>
                            <span>{formatCurrency(report.cogs.total)}</span>
                        </div>
                    </Card>

                    {/* Gross Profit */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex justify-between items-center">
                        <span className="font-bold text-primary text-lg">Gross Profit</span>
                        <span className="font-bold text-primary text-xl">{formatCurrency(report.grossProfit)}</span>
                    </div>

                    {/* Expenses Section */}
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border pb-2">Operating Expenses</h3>
                        <div className="space-y-2">
                            {report.expenses.details.map((item: any) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-text-secondary">{item.code} - {item.name}</span>
                                    <span className="font-medium text-text-primary">{formatCurrency(item.balance)}</span>
                                </div>
                            ))}
                            {report.expenses.details.length === 0 && <div className="text-text-tertiary text-sm italic">No expenses recorded</div>}
                        </div>
                        <div className="flex justify-between mt-4 pt-3 border-t border-border font-bold">
                            <span>Total Expenses</span>
                            <span>{formatCurrency(report.expenses.total)}</span>
                        </div>
                    </Card>

                    {/* Net Income */}
                    <div className="bg-surface border-2 border-primary rounded-lg p-6 flex justify-between items-center shadow-lg">
                        <span className="font-extrabold text-2xl text-text-primary">Net Income</span>
                        <span className={`font-extrabold text-2xl ${report.netIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                            {formatCurrency(report.netIncome)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
