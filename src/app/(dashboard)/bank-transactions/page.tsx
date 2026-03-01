'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import BankTransactionForm from '@/components/bank/BankTransactionForm';
import { ThemeToggleIcon } from '@/components/ThemeProvider';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface BankTransaction {
    id: string;
    transactionNumber: string;
    date: string;
    amount: number;
    partnerName: string;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    status: 'DRAFT' | 'POSTED';
}

export default function BankTransactionsPage() {
    // --- State ---
    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Default filter: Current Month
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]);

    // Initial Setup
    useEffect(() => {
        fetchTransactions();
    }, []);

    // Re-fetch when filters change
    useEffect(() => {
        fetchTransactions();
    }, [fromDate, toDate]);

    const fetchTransactions = async () => {
        const companyId = 'DEFAULT_COMPANY_ID';
        try {
            const params = new URLSearchParams();
            params.set('companyId', companyId);
            params.set('page', '1');
            params.set('limit', '50');
            if (searchTerm) params.set('search', searchTerm);
            if (fromDate) params.set('startDate', fromDate);
            if (toDate) params.set('endDate', toDate);

            const res = await fetch(`/api/bank-transactions?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.items.map((item: any) => ({
                    id: item.id,
                    transactionNumber: item.transactionNumber,
                    date: item.date,
                    partnerName: item.partner?.name || item.partnerName || '---',
                    amount: item.amount,
                    type: item.type,
                    status: item.status
                })));
            } else {
                console.error('Failed to fetch', await res.text());
            }
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        }
    };

    const handleNew = () => {
        setSelectedId(null);
    };

    const handleSelect = (t: BankTransaction) => {
        setSelectedId(t.id);
    };

    const handleFormSuccess = (action?: 'save' | 'delete', data?: any) => {
        fetchTransactions();
        if (action === 'delete' || action === ('new' as any)) {
            setSelectedId(null);
        } else if (action === 'save' && data?.id) {
            setSelectedId(data.id);
        }
    };

    const filtered = transactions.filter(t =>
        t.partnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inputStyle = {
        backgroundColor: 'var(--background)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        height: '32px',
        padding: '0 8px',
        borderRadius: '4px',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box' as const
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>

            {/* MAIN LAYOUT */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* SIDEBAR */}
                <aside style={{
                    width: sidebarOpen ? '240px' : '0px',
                    transition: 'width 0.2s',
                    backgroundColor: 'var(--surface)',
                    borderRight: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Từ ngày</label>
                                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ ...inputStyle, fontSize: '11px', padding: '4px' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Đến ngày</label>
                                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ ...inputStyle, fontSize: '11px', padding: '4px' }} />
                            </div>
                        </div>
                        <div style={{ position: 'relative', marginBottom: '8px' }}>
                            <svg style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm..."
                                style={{ ...inputStyle, paddingLeft: '32px' }}
                            />
                        </div>

                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filtered.map(t => (
                            <div key={t.id} onClick={() => handleSelect(t)} style={{
                                padding: '12px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                                backgroundColor: selectedId === t.id ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                                borderLeft: selectedId === t.id ? '2px solid var(--primary)' : '2px solid transparent'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.transactionNumber}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{format(new Date(t.date), 'dd/MM/yyyy')}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    {t.type === 'DEPOSIT' ?
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: 'var(--success)', backgroundColor: 'var(--success-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                                            <ArrowDownCircle size={10} /> THU
                                        </div> :
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: 'var(--danger)', backgroundColor: 'var(--danger-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                                            <ArrowUpCircle size={10} /> CHI
                                        </div>
                                    }
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.partnerName}</div>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(t.amount)} đ</div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                                Không có giao dịch nào
                            </div>
                        )}
                    </div>
                </aside>

                {/* TOGGLE SIDEBAR BUTTON */}
                {!sidebarOpen && (
                    <div style={{ width: '40px', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'start', justifyContent: 'center', paddingTop: '10px' }}>
                        <button onClick={() => setSidebarOpen(true)} style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                )}


                {/* FORM AREA */}
                <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                    <BankTransactionForm
                        key={selectedId || 'new'}
                        id={selectedId}
                        onSuccess={handleFormSuccess}
                        onCancel={() => setSidebarOpen(!sidebarOpen)}
                    />
                </main>
            </div>
        </div>
    );
}
