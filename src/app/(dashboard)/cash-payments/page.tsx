'use client';

/**
 * Cash Payments - V4.2 Implementation (Ported from Cash Receipts)
 * Updates:
 * - Voucher Header: Added Currency & Exchange Rate fields
 * - General Header: Added Attachment Picker (Clip Icon)
 * - Grid: Added Order (Stt), Currency, Object Code, Object Name columns
 * - Inherits V4.1 inline styles for layout stability
 * - V4.3: Added Subject Type filtering
 */

import { useState, useEffect, useRef, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { format } from 'date-fns';
import { numberToWordsVND } from '@/lib/numberToWords';
// Removed: ThemeToggleIcon
import AccountingGrid, { AccountingGridColumn } from '@/components/accounting/AccountingGrid';
import { DatePicker } from '@/components/ui/DatePicker';
import { ComboboxSelect, ComboboxOption } from '@/components/ui/ComboboxSelect';
import { Button } from '@/components/ui/Button';
import { useReactToPrint } from 'react-to-print';
import { CashPaymentPrintTemplate } from '@/components/print/CashPaymentPrintTemplate';
import { ScanSearch } from 'lucide-react';
import SubjectSelectorModal from '@/components/cash/SubjectSelectorModal';

// --- Interfaces ---
interface PartnerContact {
    id: string;
    partnerId: string;
    name: string;
    phone?: string;
    email?: string;
    position?: string;
    isDefault: boolean;
}

interface PaymentDetail {
    id: string;
    description: string;
    currency: string;
    debitAccount: string;
    creditAccount: string;
    amount: number;
    objectId: string;
    objectName: string;
}

interface CashPayment {
    id: string;
    paymentNumber: string;
    date: string;
    amount: number;
    payeeName: string;
    status: 'DRAFT' | 'POSTED';
}

interface FormData {
    id?: string;
    companyId?: string; // Added for API consistency
    paymentNumber: string;
    date: string;
    postedDate: string;
    currency: string;
    exchangeRate: number;

    // General Info
    payeeName: string; // Auto-filled from Contact or Manual
    payeeAddress: string;
    subjectType: string;
    subjectId: string;
    subjectName: string;
    reason: string;

    // Contact Info
    contactId?: string; // Selected Contact ID

    employeeName: string;
    attachments: string;
    inheritFromOrder: boolean;
    inheritFromContract: boolean;

    details: PaymentDetail[];
    status: 'DRAFT' | 'POSTED';
}

const defaultDetail: PaymentDetail = {
    id: 'temp-1',
    description: '',
    currency: 'VND',
    debitAccount: '331', // Default Debit for Payment (Payable)
    creditAccount: '1111', // Default Credit for Payment (Cash)
    amount: 0,
    objectId: '',
    objectName: ''
};

const emptyForm: FormData = {
    paymentNumber: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    postedDate: format(new Date(), 'yyyy-MM-dd'),
    currency: 'VND',
    exchangeRate: 1,
    payeeName: '',
    payeeAddress: '',
    subjectType: 'NCC', // Default to Supplier
    subjectId: '',
    subjectName: '',
    contactId: '',
    reason: 'Chi tiền mua hàng',
    employeeName: '',
    attachments: '0 chứng từ gốc',
    inheritFromOrder: false,
    inheritFromContract: false,
    details: [{ ...defaultDetail }],
    status: 'DRAFT'
};

export default function CashPaymentsPage() {
    // --- State ---
    // --- State ---
    const [payments, setPayments] = useState<CashPayment[]>([]);
    const [form, setForm] = useState<FormData>(emptyForm);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isNewMode, setIsNewMode] = useState(true);
    const [saved, setSaved] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

    // Contact State
    const [contacts, setContacts] = useState<PartnerContact[]>([]);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);

    const handleSubjectSelect = async (subject: any, type: any) => {
        // Reset contacts first
        setContacts([]);
        setIsLoadingContacts(true);

        try {
            // Fetch contacts for selected partner
            const res = await fetch(`/api/partners/${subject.id}/contacts`);
            if (res.ok) {
                const data = await res.json();
                setContacts(data);

                // Auto-select default contact if exists
                const defaultContact = data.find((c: PartnerContact) => c.isDefault);

                setForm(f => ({
                    ...f,
                    subjectType: type.id || type.value || type,
                    subjectId: subject.id,
                    subjectName: subject.name,
                    payeeAddress: subject.address || f.payeeAddress,
                    reason: f.reason || `Chi tiền cho ${subject.name}`,

                    // Auto-fill logic
                    contactId: defaultContact?.id || '',
                    payeeName: defaultContact?.name || subject.name // Fallback to Subject Name if no contact
                }));
            } else {
                // Fallback if fetch fails or no contacts
                setForm(f => ({
                    ...f,
                    subjectType: type.id || type.value || type,
                    subjectId: subject.id,
                    subjectName: subject.name,
                    payeeName: subject.name,
                    payeeAddress: subject.address || f.payeeAddress,
                    reason: f.reason || `Chi tiền cho ${subject.name}`,
                    contactId: ''
                }));
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setIsLoadingContacts(false);
        }
    };

    // Handle Contact Selection Change
    const handleContactChange = (contactId: string) => {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
            setForm(f => ({
                ...f,
                contactId: contact.id,
                payeeName: contact.name,
                // Optional: Update address/phone if contact has specific info
            }));
        }
    };

    const payeeRef = useRef<HTMLInputElement>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Phieu_Chi_${form.paymentNumber}`,
    });

    const totalAmount = form.details.reduce((sum, d) => sum + (d.amount || 0), 0);
    const amountInWords = numberToWordsVND(totalAmount);

    // --- Load Data ---
    useEffect(() => {
        fetchPayments();
    }, []);

    // Keyboard Shortcuts
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // F3: Mở tìm kiếm đối tượng
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

    // REAL API
    const fetchPayments = async () => {
        try {
            const res = await fetch('/api/cash-payments?companyId=COMP001'); // TODO: Dynamic CompanyID
            if (res.ok) {
                const data = await res.json();
                setPayments(data.items);

                // Auto-select first if exists
                if (data.items.length > 0 && !selectedId) {
                    handleSelect(data.items[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch payments', error);
        }
    };

    const handleNew = () => {
        setIsNewMode(true);
        setSelectedId(null);
        setForm({
            ...emptyForm,
            paymentNumber: `PC${String(payments.length + 1).padStart(5, '0')}` // Simple client-side gen, server will override
        });
        setContacts([]); // Clear contacts
        setTimeout(() => payeeRef.current?.focus(), 100);
    };

    const handleSelect = async (p: CashPayment) => {
        setIsNewMode(false);
        setSelectedId(p.id);

        // Fetch full details
        // For now, assuming list returns basic info. Ideally fetch single by ID.
        // We will mock the details fetch or use the mapped list item for now.
        // TODO: Call GET /api/cash-payments/[id] for full details including Contact info

        setForm({
            ...emptyForm,
            id: p.id,
            paymentNumber: p.paymentNumber,
            date: format(new Date(p.date), 'yyyy-MM-dd'),
            postedDate: format(new Date(p.date), 'yyyy-MM-dd'),
            payeeName: p.payeeName,
            // subjectName: p.payeeName, // This is loose mapping, should be from partner relation
            // amount: p.amount,

            // To properly edit, we need the real details from DB.
            // Temporarily mapping a single line for visualization if details missing
            details: [
                { ...defaultDetail, amount: p.amount, description: `Chi tiền ${p.payeeName}` }
            ],
            status: p.status
        });
    };

    const handleSave = async () => {
        if (!form.companyId) form.companyId = 'COMP001'; // Fallback

        try {
            setSaved(true);
            const res = await fetch('/api/cash-payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: 'COMP001',
                    date: form.date,
                    partnerId: form.subjectId || undefined,
                    payeeName: form.payeeName,
                    amount: totalAmount,
                    description: form.reason || form.details[0]?.description,
                    debitAccountId: form.details[0]?.debitAccount || '331',
                    creditAccountId: form.details[0]?.creditAccount || '111',
                    details: form.details.map(d => ({
                        description: d.description,
                        debitAccountId: d.debitAccount,
                        creditAccountId: d.creditAccount,
                        amount: d.amount,
                        originalCurrency: d.currency,
                        // partnerId: form.subjectId // Can map per line if needed
                    }))
                })
            });

            if (res.ok) {
                alert('Đã lưu thành công!');
                fetchPayments(); // Refresh list
                handleNew(); // Reset form
            } else {
                const err = await res.json();
                alert(`Lỗi: ${err.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi kết nối');
        } finally {
            setSaved(false);
        }
    };

    // Mock Subject Types (Static)
    const SUBJECT_TYPES: ComboboxOption[] = [
        { value: 'NCC', label: 'Nhà cung cấp' },
        { value: 'KH', label: 'Khách hàng' },
        { value: 'NV', label: 'Nhân viên' },
        { value: 'KHAC', label: 'Khác' },
    ];

    // --- Grid Operations ---
    const addRow = () => {
        setForm(prev => ({
            ...prev,
            details: [...prev.details, {
                ...defaultDetail,
                id: crypto.randomUUID(),
                description: prev.reason,
                objectName: prev.subjectName
            }]
        }));
    };

    const filtered = payments.filter(p =>
        p.payeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.paymentNumber.includes(searchTerm)
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
        minWidth: '100px',
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
                        <h1 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>PHIẾU CHI TIỀN MẶT</h1>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>Cash Payment Voucher</p>
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
                        <button onClick={handlePrint} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
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
                    width: sidebarOpen ? '240px' : '0px',
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
                        {filtered.map(p => (
                            <div key={p.id} onClick={() => handleSelect(p)} style={{
                                padding: '12px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                                backgroundColor: selectedId === p.id ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                                borderLeft: selectedId === p.id ? '2px solid var(--primary)' : '2px solid transparent'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{p.paymentNumber}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{format(new Date(p.date), 'dd/MM/yyyy')}</span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.payeeName}</div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(p.amount)} đ</div>
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
                                    <label style={{ ...labelStyle, minWidth: '90px' }}>Loại đối tượng</label>
                                    <ComboboxSelect
                                        options={SUBJECT_TYPES}
                                        value={form.subjectType}
                                        onChange={(val) => {
                                            setForm(f => ({
                                                ...f,
                                                subjectType: val,
                                                subjectId: '',
                                                subjectName: '',
                                                payeeName: '',
                                                contactId: ''
                                            }));
                                            setContacts([]);
                                        }}
                                        placeholder="Chọn loại..."
                                    />
                                </div>

                                <div style={rowStyle}>
                                    <label style={{ ...labelStyle, minWidth: '90px' }}>Đối tượng</label>
                                    <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
                                        <div style={{ flex: 1 }}>
                                            {/* Read-only input triggered by Modal */}
                                            <div
                                                onClick={() => setIsSubjectModalOpen(true)}
                                                style={{
                                                    ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                    color: form.subjectName ? 'var(--text-primary)' : 'var(--text-muted)'
                                                }}
                                            >
                                                {form.subjectName || "Chọn đối tượng (F3)..."}
                                            </div>
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

                                {/* CONTACT DROPDOWN (NEW) */}
                                {contacts.length > 0 && (
                                    <div style={rowStyle}>
                                        <label style={{ ...labelStyle, minWidth: '90px' }}>Người liên hệ</label>
                                        <ComboboxSelect
                                            options={contacts.map(c => ({ value: c.id, label: c.name }))}
                                            value={form.contactId || ''}
                                            onChange={handleContactChange}
                                            placeholder="Chọn người liên hệ..."
                                        />
                                    </div>
                                )}

                                <div style={rowStyle}>
                                    <label style={{ ...labelStyle, minWidth: '90px' }}>Người nhận</label>
                                    <input value={form.payeeName} onChange={e => setForm(f => ({ ...f, payeeName: e.target.value }))} style={inputStyle} />
                                </div>

                                <div style={rowStyle}>
                                    <label style={{ ...labelStyle, minWidth: '90px' }}>Địa chỉ</label>
                                    <input value={form.payeeAddress} onChange={e => setForm(f => ({ ...f, payeeAddress: e.target.value }))} style={inputStyle} placeholder="Địa chỉ..." />
                                </div>

                                <div style={rowStyle}>
                                    <label style={{ ...labelStyle, minWidth: '90px' }}>Lý do chi</label>
                                    <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} style={inputStyle} placeholder="Lý do chi tiền..." />
                                </div>

                                <div style={rowStyle}>
                                    <label style={{ ...labelStyle, minWidth: '90px' }}>Kèm theo</label>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input value={form.attachments} onChange={e => setForm(f => ({ ...f, attachments: e.target.value }))} style={{ ...inputStyle, maxWidth: '200px' }} placeholder="0 chứng từ gốc" />
                                        <button title="Đính kèm" style={{
                                            padding: '6px', border: '1px solid var(--border)', borderRadius: '4px',
                                            backgroundColor: 'var(--surface-hover)', cursor: 'pointer'
                                        }}>
                                            <svg style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                        </button>
                                    </div>
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
                                    <label style={labelStyle}>Số phiếu</label>
                                    <input value={form.paymentNumber} onChange={e => setForm(f => ({ ...f, paymentNumber: e.target.value }))} style={{ ...inputStyle, fontWeight: 'bold', color: 'var(--primary)', textAlign: 'left' }} />
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

                                <div style={{ borderTop: '1px dashed var(--border)', marginTop: '8px', paddingTop: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                        <input type="checkbox" checked={form.inheritFromOrder} onChange={e => setForm(f => ({ ...f, inheritFromOrder: e.target.checked }))} style={{ marginRight: '8px' }} />
                                        Từ đơn hàng mua
                                    </label>
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
                                        { field: 'debitAccount', headerName: 'TK Nợ', width: 100, type: 'text', align: 'center' },
                                        { field: 'creditAccount', headerName: 'TK Có', width: 100, type: 'text', align: 'center' },
                                        { field: 'currency', headerName: 'Tiền tệ', width: 90, type: 'select', align: 'center', cellEditorParams: { values: ['VND', 'USD'] } },
                                        { field: 'amount', headerName: 'Số tiền', width: 140, type: 'currency', align: 'right' },
                                        { field: 'objectId', headerName: 'Mã ĐT', width: 100, type: 'text' },
                                        { field: 'objectName', headerName: 'Tên Đối tượng', flex: 1, minWidth: 200, type: 'text' },
                                    ] as AccountingGridColumn<PaymentDetail>[]}
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

                {/* Hidden Print Template */}
                <div style={{ position: 'absolute', top: 0, left: '-10000px' }}>
                    <CashPaymentPrintTemplate
                        ref={componentRef}
                        data={{
                            companyName: 'CÔNG TY TNHH ABC', // TODO: Get from settings
                            companyAddress: '123 Đường ABC, Quận XYZ, TP.HCM',
                            paymentNumber: form.paymentNumber,
                            date: new Date(form.date),
                            payeeName: form.payeeName,
                            payeeAddress: form.payeeAddress,
                            reason: form.reason,
                            amount: totalAmount,
                            amountInWords: amountInWords,
                            attachments: form.attachments,
                            details: form.details.map(d => ({
                                description: d.description,
                                debitAccount: d.debitAccount,
                                creditAccount: d.creditAccount,
                                amount: d.amount || 0
                            }))
                        }}
                    />
                </div>
            </div>
            <SubjectSelectorModal
                isOpen={isSubjectModalOpen}
                onClose={() => setIsSubjectModalOpen(false)}
                onSelect={handleSubjectSelect}
            />
        </div>
    );
}
