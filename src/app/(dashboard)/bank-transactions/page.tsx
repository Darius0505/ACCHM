'use client';

/**
 * Bank Transactions - V1.0 Implementation (Ported from Cash Payments V4.2)
 * Features:
 * - Split Layout: List (Left) + Form (Right)
 * - Transaction Type Toggle: Deposit (Thu) / Withdrawal (Chi)
 * - Bank Account Selector
 * - Integration with SubjectSelectorModal
 * - Premium MISA-style UI
 */

import { useState, useEffect, useRef, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { format } from 'date-fns';
import { numberToWordsVND } from '@/lib/numberToWords';
import { ThemeToggleIcon } from '@/components/ThemeProvider';
import AccountingGrid, { AccountingGridColumn } from '@/components/accounting/AccountingGrid';
import { DatePicker } from '@/components/ui/DatePicker';
import { ComboboxSelect, ComboboxOption } from '@/components/ui/ComboboxSelect';
import { Button } from '@/components/ui/Button';
import { ScanSearch, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import SubjectSelectorModal from '@/components/cash/SubjectSelectorModal';

// Mock Subject Types
const MOCK_SUBJECT_TYPES: ComboboxOption[] = [
    { value: 'NCC', label: 'Nhà cung cấp' },
    { value: 'KH', label: 'Khách hàng' },
    { value: 'NV', label: 'Nhân viên' },
    { value: 'KHAC', label: 'Khác' },
];

// Mock subjects
const MOCK_SUBJECTS: (ComboboxOption & { type: string })[] = [
    { value: 'NCC001', label: 'Công ty Cung ứng 1', description: 'Nhà cung cấp - MST: 111', type: 'NCC' },
    { value: 'KH001', label: 'Nguyễn Văn A', description: 'Khách hàng - 0901234567', type: 'KH' },
    { value: 'NV001', label: 'Lê Văn C', description: 'Nhân viên - Phòng Kế toán', type: 'NV' },
];

// Mock Bank Accounts
const MOCK_BANK_ACCOUNTS: ComboboxOption[] = [
    { value: 'VCB', label: 'Vietcombank - 0011001234567', description: 'VND - CN Sở Giao Dịch' },
    { value: 'ACB', label: 'ACB - 12345678', description: 'VND - CN Hà Nội' },
    { value: 'TCB', label: 'Techcombank - 190333444555', description: 'USD - CN Hội sở' },
];

const MOCK_ACCOUNTS = [
    { code: '1111', name: 'Tiền mặt Việt Nam' },
    { code: '1121', name: 'Tiền gửi ngân hàng VND' },
    { code: '131', name: 'Phải thu của khách hàng' },
    { code: '331', name: 'Phải trả cho người bán' },
    { code: '5111', name: 'Doanh thu bán hàng' },
    { code: '642', name: 'Chi phí quản lý' },
    { code: '811', name: 'Chi phí khác' },
];

// --- Interfaces ---
interface TransactionDetail {
    id: string;
    description: string;
    currency: string;
    debitAccount: string;
    creditAccount: string;
    amount: number;
    objectId: string;
    objectName: string;
}

interface BankTransaction {
    id: string;
    refNumber: string; // Số chứng từ
    date: string;
    amount: number;
    subjectName: string; // Người nộp/nhận
    type: 'DEPOSIT' | 'WITHDRAWAL';
    status: 'DRAFT' | 'POSTED';
}

interface FormData {
    id?: string;
    refNumber: string;
    date: string;
    postedDate: string;
    currency: string;
    exchangeRate: number;
    type: 'DEPOSIT' | 'WITHDRAWAL'; // Thu (Báo Có) / Chi (Báo Nợ)
    bankAccount: string; // Tài khoản ngân hàng

    // General Info
    subjectName: string; // Tên đối tượng (Người nộp/nhận)
    subjectAddress: string;
    subjectType: string;
    subjectId: string;
    reason: string;
    employeeName: string;
    attachments: string;
    inheritFromOrder: boolean;
    inheritFromContract: boolean;

    details: TransactionDetail[];
    status: 'DRAFT' | 'POSTED';
}

const defaultDetail: TransactionDetail = {
    id: 'temp-1',
    description: '',
    currency: 'VND',
    debitAccount: '',
    creditAccount: '',
    amount: 0,
    objectId: '',
    objectName: ''
};

const emptyForm: FormData = {
    refNumber: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    postedDate: format(new Date(), 'yyyy-MM-dd'),
    currency: 'VND',
    exchangeRate: 1,
    type: 'DEPOSIT', // Default to Deposit (Thu)
    bankAccount: '',
    subjectName: '',
    subjectAddress: '',
    subjectType: 'KH',
    subjectId: '',
    reason: 'Thu tiền bán hàng qua ngân hàng',
    employeeName: '',
    attachments: '0 chứng từ gốc',
    inheritFromOrder: false,
    inheritFromContract: false,
    details: [{ ...defaultDetail, debitAccount: '1121', creditAccount: '131' }], // Default logic for Deposit
    status: 'DRAFT'
};

export default function BankTransactionsPage() {
    // --- State ---
    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const [form, setForm] = useState<FormData>(emptyForm);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isNewMode, setIsNewMode] = useState(true);
    const [saved, setSaved] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

    // Update defaults when Type changes
    useEffect(() => {
        if (isNewMode) {
            setForm(f => {
                const isDeposit = f.type === 'DEPOSIT';
                return {
                    ...f,
                    refNumber: isDeposit ? `BN${String(transactions.length + 1).padStart(5, '0')}` : `BC${String(transactions.length + 1).padStart(5, '0')}`, // BN=Báo Nợ (Chi), BC=Báo Có (Thu) - wait, naming convention:
                    // Usually: 
                    // Deposit (Thu) -> Báo Có (Credit Advice) -> Client creates "Thu tiền gửi"
                    // Withdrawal (Chi) -> Báo Nợ (Debit Advice) -> Client creates "Chi tiền gửi"
                    // Let's use PTNH (Phieu Thu Ngan Hang) / PCNH (Phieu Chi Ngan Hang) or generic.
                    // Let's stick to BC (Báo Có - Thu) / BN (Báo Nợ - Chi) for simplicity in this context.
                    reason: isDeposit ? 'Thu tiền bán hàng...' : 'Chi tiền mua hàng...',
                    details: f.details.map(d => ({
                        ...d,
                        debitAccount: isDeposit ? '1121' : '331',
                        creditAccount: isDeposit ? '131' : '1121'
                    }))
                };
            });
        }
    }, [form.type, isNewMode, transactions.length]);


    const handleSubjectSelect = (subject: any, type: any) => {
        setForm(f => ({
            ...f,
            subjectType: type.id || type.value || type,
            subjectId: subject.id,
            subjectName: subject.name,
            subjectAddress: subject.address || f.subjectAddress,
            reason: f.reason || (f.type === 'DEPOSIT' ? `Thu tiền của ${subject.name}` : `Chi tiền cho ${subject.name}`)
        }));
    };

    const subjectRef = useRef<HTMLInputElement>(null);

    const totalAmount = form.details.reduce((sum, d) => sum + (d.amount || 0), 0);
    const amountInWords = numberToWordsVND(totalAmount);

    // --- Load Data ---
    useEffect(() => {
        fetchTransactions();
    }, []);

    // Keyboard Shortcuts
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'F3') {
                e.preventDefault();
                setIsSubjectModalOpen(true);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Sync Posted Date
    useEffect(() => {
        if (isNewMode) {
            setForm(prev => ({ ...prev, postedDate: prev.date }));
        }
    }, [form.date, isNewMode]);

    // Mock API
    const fetchTransactions = async () => {
        const mock: BankTransaction[] = [
            { id: '1', refNumber: 'BC00001', date: '2023-10-25', subjectName: 'Nguyễn Văn A', amount: 50000000, type: 'DEPOSIT', status: 'POSTED' },
            { id: '2', refNumber: 'BN00001', date: '2023-10-26', subjectName: 'Công ty Cung ứng 1', amount: 12000000, type: 'WITHDRAWAL', status: 'DRAFT' },
        ];
        setTransactions(mock);
    };

    const handleNew = () => {
        setIsNewMode(true);
        setSelectedId(null);
        setForm({
            ...emptyForm,
            refNumber: `BC${String(transactions.length + 1).padStart(5, '0')}`
        });
        setTimeout(() => subjectRef.current?.focus(), 100);
    };

    const handleSelect = (t: BankTransaction) => {
        setIsNewMode(false);
        setSelectedId(t.id);
        setForm({
            ...emptyForm,
            id: t.id,
            refNumber: t.refNumber,
            date: t.date,
            postedDate: t.date,
            subjectName: t.subjectName,
            type: t.type,
            details: [
                { ...defaultDetail, amount: t.amount, description: `${t.type === 'DEPOSIT' ? 'Thu' : 'Chi'} tiền ${t.subjectName}` }
            ],
            status: t.status
        });
    };

    const handleSave = async () => {
        setSaved(true);
        await new Promise(r => setTimeout(r, 500));
        alert('Đã lưu (Mock)!');
        setSaved(false);
    };

    const addRow = () => {
        setForm(prev => ({
            ...prev,
            details: [...prev.details, {
                ...defaultDetail,
                id: crypto.randomUUID(),
                description: prev.reason,
                objectName: prev.subjectName,
                // Inherit logic from type
                debitAccount: prev.type === 'DEPOSIT' ? '1121' : '331',
                creditAccount: prev.type === 'DEPOSIT' ? '131' : '1121'
            }]
        }));
    };

    const filtered = transactions.filter(t =>
        t.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.refNumber.includes(searchTerm)
    );

    // --- Inline Styles ---
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

    const labelStyle = {
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        minWidth: '110px', // Slightly wider for bank labels
        textAlign: 'left' as const,
        marginRight: '12px',
        whiteSpace: 'nowrap' as const,
        letterSpacing: '0.02em'
    };

    const rowStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>

            {/* TOOLBAR */}
            <header style={{
                height: '48px', flexShrink: 0, backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <div>
                        <h1 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>GIAO DỊCH NGÂN HÀNG</h1>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>Bank Transactions</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-hover)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border)' }}>
                        <button onClick={handleNew} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <svg style={{ width: '20px', height: '20px', color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            <span style={{ fontSize: '9px', fontWeight: 500 }}>Thêm mới</span>
                        </button>
                        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }}></div>
                        <button onClick={handleSave} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <svg style={{ width: '16px', height: '16px', color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                            <span style={{ fontSize: '9px', fontWeight: 500 }}>Lưu</span>
                        </button>
                        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }}></div>
                        <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <svg style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            <span style={{ fontSize: '9px', fontWeight: 500 }}>In</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN LAYOUT */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* SIDEBAR */}
                <aside style={{
                    width: sidebarOpen ? '250px' : '0px',
                    transition: 'width 0.2s',
                    backgroundColor: 'var(--surface)',
                    borderRight: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ position: 'relative' }}>
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
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.refNumber}</span>
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
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subjectName}</div>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(t.amount)} đ</div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* WORKSPACE */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: 'var(--background)' }}>
                    <div style={{
                        maxWidth: '1200px', margin: '0 auto', backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column', minHeight: '600px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>

                        {/* FORM HEADER */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '0', borderBottom: '1px solid var(--border)'
                        }}>

                            {/* LEFT COLUMN: General Info */}
                            <div style={{
                                padding: '20px 24px', borderRight: '1px solid var(--border)',
                                display: 'flex', flexDirection: 'column', gap: '10px'
                            }}>
                                <h3 style={{
                                    fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Thông tin chung
                                </h3>

                                <div style={rowStyle}>
                                    <label style={{ ...labelStyle }}>Loại giao dịch</label>
                                    <div style={{ display: 'flex', gap: '1px', backgroundColor: 'var(--border)', padding: '1px', borderRadius: '4px' }}>
                                        <button
                                            onClick={() => setForm(f => ({ ...f, type: 'DEPOSIT' }))}
                                            style={{
                                                padding: '4px 12px', borderRadius: '3px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none',
                                                backgroundColor: form.type === 'DEPOSIT' ? 'var(--surface)' : 'transparent',
                                                color: form.type === 'DEPOSIT' ? 'var(--success)' : 'var(--text-muted)',
                                                boxShadow: form.type === 'DEPOSIT' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                                display: 'flex', alignItems: 'center', gap: '4px'
                                            }}
                                        >
                                            <ArrowDownCircle size={12} /> Báo Có (Thu)
                                        </button>
                                        <button
                                            onClick={() => setForm(f => ({ ...f, type: 'WITHDRAWAL' }))}
                                            style={{
                                                padding: '4px 12px', borderRadius: '3px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none',
                                                backgroundColor: form.type === 'WITHDRAWAL' ? 'var(--surface)' : 'transparent',
                                                color: form.type === 'WITHDRAWAL' ? 'var(--danger)' : 'var(--text-muted)',
                                                boxShadow: form.type === 'WITHDRAWAL' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                                display: 'flex', alignItems: 'center', gap: '4px'
                                            }}
                                        >
                                            <ArrowUpCircle size={12} /> Báo Nợ (Chi)
                                        </button>
                                    </div>
                                </div>

                                <div style={rowStyle}>
                                    <label style={{ ...labelStyle }}>Tài khoản NH</label>
                                    <ComboboxSelect
                                        options={MOCK_BANK_ACCOUNTS}
                                        value={form.bankAccount}
                                        onChange={(val) => setForm(f => ({ ...f, bankAccount: val }))}
                                        placeholder="Chọn tài khoản ngân hàng..."
                                    />
                                </div>

                                <div style={{ borderTop: '1px dashed var(--border)', margin: '4px 0 8px 0' }}></div>

                                <div style={rowStyle}>
                                    <label style={labelStyle}>Loại đối tượng</label>
                                    <ComboboxSelect
                                        options={MOCK_SUBJECT_TYPES}
                                        value={form.subjectType}
                                        onChange={(val) => {
                                            setForm(f => ({
                                                ...f,
                                                subjectType: val,
                                                subjectId: '',
                                                subjectName: ''
                                            }));
                                        }}
                                        placeholder="Chọn loại..."
                                    />
                                </div>

                                <div style={rowStyle}>
                                    <label style={labelStyle}>Đối tượng</label>
                                    <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
                                        <div style={{ flex: 1 }}>
                                            <ComboboxSelect
                                                options={MOCK_SUBJECTS.filter(s => s.type === form.subjectType)}
                                                value={form.subjectId || ''}
                                                onChange={(val) => {
                                                    const subject = MOCK_SUBJECTS.find(s => s.value === val);
                                                    setForm(f => ({
                                                        ...f,
                                                        subjectId: val,
                                                        subjectName: subject?.label || '',
                                                    }));
                                                }}
                                                placeholder="Chọn đối tượng..."
                                                emptyMessage={form.subjectType ? "Không tìm thấy" : "Chọn loại trước"}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            style={{
                                                height: '32px', width: '32px', padding: 0,
                                                border: '1px solid #EF444433', backgroundColor: '#EF444411', color: '#EF4444',
                                                borderRadius: '6px'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsSubjectModalOpen(true);
                                            }}
                                            title="Chọn đối tượng (F3)"
                                        >
                                            <ScanSearch className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div style={rowStyle}>
                                    <label style={labelStyle}>{form.type === 'DEPOSIT' ? 'Người nộp' : 'Người nhận'}</label>
                                    <input value={form.subjectName} onChange={e => setForm(f => ({ ...f, subjectName: e.target.value }))} style={inputStyle} />
                                </div>

                                <div style={rowStyle}>
                                    <label style={labelStyle}>Lý do</label>
                                    <input
                                        value={form.reason}
                                        onChange={e => {
                                            const newReason = e.target.value;
                                            setForm(f => ({
                                                ...f,
                                                reason: newReason,
                                                details: f.details.map(d => ({ ...d, description: newReason }))
                                            }));
                                        }}
                                        style={inputStyle} placeholder="Diễn giải lý do..."
                                    />
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Voucher Info */}
                            <div style={{
                                padding: '20px 24px', backgroundColor: 'rgba(var(--text-primary-rgb), 0.02)',
                                display: 'flex', flexDirection: 'column', gap: '12px'
                            }}>
                                <h3 style={{
                                    fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Chứng từ
                                </h3>

                                <div style={rowStyle}>
                                    <label style={labelStyle}>Số chứng từ</label>
                                    <input value={form.refNumber} onChange={e => setForm(f => ({ ...f, refNumber: e.target.value }))} style={{ ...inputStyle, fontWeight: 'bold', color: 'var(--primary)', textAlign: 'left' }} />
                                </div>
                                <div style={rowStyle}>
                                    <label style={labelStyle}>Ngày chứng từ</label>
                                    <DatePicker value={form.date} onChange={(val) => setForm(f => ({ ...f, date: val }))} />
                                </div>
                                <div style={rowStyle}>
                                    <label style={labelStyle}>Ngày hạch toán</label>
                                    <DatePicker value={form.postedDate} onChange={(val) => setForm(f => ({ ...f, postedDate: val }))} />
                                </div>
                                <div style={{ ...rowStyle, gap: '8px' }}>
                                    <label style={labelStyle}>Loại tiền</label>
                                    <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
                                        <select
                                            value={form.currency}
                                            onChange={e => setForm(f => ({ ...f, currency: e.target.value, exchangeRate: e.target.value === 'VND' ? 1 : f.exchangeRate }))}
                                            style={{ ...inputStyle, width: '70px', padding: '0 4px' }}
                                        >
                                            <option value="VND">VND</option>
                                            <option value="USD">USD</option>
                                        </select>
                                        <input
                                            type="number"
                                            value={form.exchangeRate}
                                            onChange={e => setForm(f => ({ ...f, exchangeRate: Number(e.target.value) }))}
                                            disabled={form.currency === 'VND'}
                                            style={{ ...inputStyle, textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* GRID */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ height: '350px' }}>
                                <AccountingGrid
                                    data={form.details}
                                    columns={[
                                        { field: 'description', headerName: 'Diễn giải', width: 280, type: 'text' },
                                        { field: 'debitAccount', headerName: 'TK Nợ', width: 100, type: 'account', align: 'center', cellEditorParams: { accounts: MOCK_ACCOUNTS } },
                                        { field: 'creditAccount', headerName: 'TK Có', width: 100, type: 'account', align: 'center', cellEditorParams: { accounts: MOCK_ACCOUNTS } },
                                        { field: 'amount', headerName: 'Số tiền', width: 140, type: 'currency', align: 'right' },
                                        { field: 'objectId', headerName: 'Mã ĐT', width: 100, type: 'text' },
                                        { field: 'objectName', headerName: 'Tên Đối tượng', flex: 1, minWidth: 200, type: 'text' },
                                    ] as AccountingGridColumn<TransactionDetail>[]}
                                    onDataChange={(newData) => setForm(f => ({ ...f, details: newData }))}
                                    height="100%"
                                />
                            </div>

                            <div onClick={addRow} style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: 'var(--primary)', borderBottom: '1px solid var(--border)', display: 'inline-block' }}>
                                + Thêm dòng mới
                            </div>

                            {/* Summary Footer */}
                            <div style={{
                                display: 'flex', height: '50px', alignItems: 'center',
                                backgroundColor: 'var(--surface-header)', borderTop: '2px solid var(--border)',
                                padding: '0 16px'
                            }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Cộng:</span>
                                    <span style={{ fontSize: '12px', fontStyle: 'italic', fontWeight: 500, color: 'var(--text-secondary)' }}>{amountInWords} đồng</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tổng:</span>
                                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--primary)' }}>
                                        {new Intl.NumberFormat('vi-VN').format(totalAmount)} VND
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
            <SubjectSelectorModal
                isOpen={isSubjectModalOpen}
                onClose={() => setIsSubjectModalOpen(false)}
                onSelect={handleSubjectSelect}
            />
        </div>
    );
}
