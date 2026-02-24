"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { purchaseInvoiceService } from "@/services/purchaseInvoice.service";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PurchaseInvoiceDetail {
    id: string;
    number: string;
    vendor: { id: string; name: string; email?: string; address?: string };
    date: string; // ISO string
    dueDate: string; // ISO string
    postingDate?: string; // ISO string
    status: "DRAFT" | "POSTED";
    subtotal: number;
    taxTotal: number;
    totalAmount: number;
    lines: {
        id: string;
        description: string;
        account: { code: string; name: string };
        quantity: number;
        unitPrice: number;
        taxRate: number;
        taxAmount: number;
        amount: number;
    }[];
}

export default function PurchaseInvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [invoice, setInvoice] = useState<PurchaseInvoiceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        async function fetchInvoice() {
            try {
                const data = await purchaseInvoiceService.getOne(id);
                // Map service response to UI model if needed, strictly typing here for safety
                setInvoice(data as any);
            } catch (error) {
                console.error("Failed to fetch invoice:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchInvoice();
    }, [id]);

    const handlePost = async () => {
        if (!invoice) return;
        if (!confirm("Are you sure you want to post this invoice? This action cannot be undone.")) return;

        setPosting(true);
        try {
            await purchaseInvoiceService.post(invoice.id, 'current_user');
            alert("Invoice posted successfully!");
            // Refresh data
            const updated = await purchaseInvoiceService.getOne(id);
            setInvoice(updated as any);
        } catch (error) {
            console.error("Failed to post invoice:", error);
            alert("Failed to post invoice");
        } finally {
            setPosting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-text-secondary">Loading invoice...</div>;
    if (!invoice) return <div className="p-8 text-center text-text-secondary">Invoice not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header & Breadcrumbs */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <nav className="text-sm text-text-secondary mb-1">
                        <Link href="/purchase-invoices" className="hover:text-primary">Purchases</Link>
                        <span className="mx-2">/</span>
                        <Link href="/purchase-invoices" className="hover:text-primary">Invoices</Link>
                        <span className="mx-2">/</span>
                        <span className="text-text-primary font-medium">{invoice.number}</span>
                    </nav>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-text-primary">
                            Invoice {invoice.number}
                        </h1>
                        <Badge variant={invoice.status === 'POSTED' ? 'success' : 'warning'}>
                            {invoice.status}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {invoice.status === 'DRAFT' && (
                        <>
                            <Button variant="secondary" onClick={() => router.push(`/purchase-invoices/${id}/edit`)}>
                                Edit
                            </Button>
                            <Button variant="primary" onClick={handlePost} isLoading={posting}>
                                Post to GL
                            </Button>
                        </>
                    )}
                    <Button variant="secondary">Print</Button>
                    <Button variant="secondary">Download</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Left Column) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Invoice Summary Card */}
                    <Card>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">Vendor Info</h3>
                                <div className="text-text-primary font-medium">{invoice.vendor.name}</div>
                                <div className="text-sm text-text-secondary mt-1 max-w-xs">{invoice.vendor.address || 'No address'}</div>
                                <div className="text-sm text-text-secondary mt-1">{invoice.vendor.email}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-text-secondary mb-1 uppercase tracking-wider">Dates</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Issue Date:</span>
                                            <span className="font-medium">{new Date(invoice.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Due Date:</span>
                                            <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-text-secondary mb-1 uppercase tracking-wider">Amounts</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Subtotal:</span>
                                            <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Tax:</span>
                                            <span className="font-medium">${invoice.taxTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-border pt-2 mt-2">
                                            <span className="text-text-primary font-bold">Total:</span>
                                            <span className="text-primary font-bold text-lg">${invoice.totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Line Items Card */}
                    <Card padding="none" className="overflow-hidden">
                        <div className="p-4 border-b border-border bg-gray-50/50">
                            <h3 className="font-medium text-text-primary">Line Items</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#F9FAFB] text-text-secondary uppercase text-xs font-semibold border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3">Description</th>
                                        <th className="px-6 py-3">Account</th>
                                        <th className="px-6 py-3 text-right">Qty</th>
                                        <th className="px-6 py-3 text-right">Price</th>
                                        <th className="px-6 py-3 text-right">Tax</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {invoice.lines.map((line) => (
                                        <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-text-primary">{line.description}</td>
                                            <td className="px-6 py-4 text-text-secondary">
                                                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded mr-2">{line.account.code}</span>
                                                {line.account.name}
                                            </td>
                                            <td className="px-6 py-4 text-right tabular-nums">{line.quantity}</td>
                                            <td className="px-6 py-4 text-right tabular-nums">${line.unitPrice.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right tabular-nums text-text-secondary">
                                                <div>${line.taxAmount.toFixed(2)}</div>
                                                <div className="text-xs">({(line.taxRate * 100).toFixed(0)}%)</div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-text-primary tabular-nums">${line.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {invoice.lines.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-text-secondary italic">
                                                No line items found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Sidebar (Right Column) */}
                <div className="space-y-6">
                    {/* Timeline / Activity */}
                    <Card>
                        <h3 className="text-sm font-medium text-text-primary mb-4">Timeline & Activity</h3>
                        <div className="relative pl-4 border-l-2 border-border space-y-6">
                            {invoice.status === 'POSTED' && (
                                <div className="relative">
                                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-success border-2 border-white"></span>
                                    <div className="text-sm font-medium text-text-primary">Posted to GL</div>
                                    <div className="text-xs text-text-secondary mt-0.5">Oct 26, 2026 • 10:30 AM</div>
                                    <div className="text-xs text-text-tertiary mt-0.5">By System User</div>
                                </div>
                            )}
                            <div className="relative">
                                <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-white"></span>
                                <div className="text-sm font-medium text-text-primary">Invoice Created</div>
                                <div className="text-xs text-text-secondary mt-0.5">{new Date(invoice.date).toLocaleDateString()}</div>
                                <div className="text-xs text-text-tertiary mt-0.5">Initial Draft</div>
                            </div>
                        </div>
                    </Card>

                    {/* Attachments Placeholder */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-text-primary">Attachments</h3>
                            <button className="text-primary text-sm hover:underline font-medium">+ Add</button>
                        </div>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                            <svg className="w-8 h-8 text-text-tertiary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm text-text-secondary">Upload files</span>
                        </div>
                    </Card>

                    {/* Memo */}
                    <Card>
                        <h3 className="text-sm font-medium text-text-primary mb-2">Internal Memo</h3>
                        <textarea
                            className="w-full text-sm border-border rounded-md focus:border-primary focus:ring-primary"
                            rows={3}
                            placeholder="Add a note..."
                        ></textarea>
                        <div className="mt-2 flex justify-end">
                            <Button variant="ghost" size="sm">Save Note</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
