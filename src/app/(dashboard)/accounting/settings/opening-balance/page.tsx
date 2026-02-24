'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Account {
    id: string;
    code: string;
    name: string;
    openingDebit: number;
    openingCredit: number;
    isPosting: boolean;
}

interface DetailItem {
    id?: string; // Optional for new items
    partnerId?: string;
    productId?: string;
    warehouseId?: string;
    bankAccountId?: string;
    fixedAssetId?: string;

    quantity: number;
    unitPrice: number;
    amount: number; // Converted amount

    debit: number;
    credit: number;
    note?: string;
}

interface ReferenceData {
    partners: { id: string, code: string, name: string }[];
    products: { id: string, code: string, name: string }[];
    warehouses: { id: string, code: string, name: string }[];
    bankAccounts: { id: string, code: string, name: string, bankName?: string, accountNumber?: string, currency?: string }[];
    fixedAssets: { id: string, code: string, name: string, originalPrice?: number }[];
}

// ─── Toast Component ─────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 22px', borderRadius: '12px',
            background: type === 'success'
                ? 'linear-gradient(135deg, #059669, #10B981)'
                : 'linear-gradient(135deg, #DC2626, #EF4444)',
            color: '#fff', fontWeight: 600, fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            animation: 'slideInToast 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
            <span style={{ fontSize: '18px' }}>{type === 'success' ? '✅' : '❌'}</span>
            {message}
            <style>{`
                @keyframes slideInToast {
                    from { transform: translateY(24px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

// ─── Input Components ────────────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid var(--border)', backgroundColor: 'var(--background)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

function StyledSearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const { style, ...rest } = props;
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ position: 'relative', width: '300px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>🔍</span>
            <input
                {...rest}
                style={{
                    ...inputBase,
                    paddingLeft: '36px',
                    borderColor: focused ? 'var(--border-focus)' : 'var(--border)',
                    boxShadow: focused ? '0 0 0 3px var(--primary-light)' : 'none',
                    ...style,
                }}
                onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
                onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            />
        </div>
    );
}

function TableInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const { style, ...rest } = props;
    const [focused, setFocused] = useState(false);
    return (
        <input
            {...rest}
            style={{
                width: '100%', padding: '8px 10px', borderRadius: '6px',
                border: `1px solid ${focused ? 'var(--primary)' : 'transparent'}`,
                backgroundColor: focused ? 'var(--background)' : 'transparent',
                color: 'var(--text-primary)', fontSize: '13px', textAlign: 'right',
                outline: 'none', transition: 'all 0.1s',
                ...style,
            }}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        />
    );
}

// ─── Modal Component ─────────────────────────────────────────────────────────
function DetailsModal({ account, onClose, onSave }: {
    account: Account, onClose: () => void, onSave: (details: DetailItem[]) => Promise<void>
}) {
    const [details, setDetails] = useState<DetailItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refData, setRefData] = useState<ReferenceData | null>(null);

    // Determine Mode
    const isInventory = account.code.startsWith('15'); // 152, 153, 156...
    const isBank = account.code.startsWith('112');
    const isFixedAsset = account.code.startsWith('211');
    const isPartner = ['131', '331', '141', '138', '338'].some(p => account.code.startsWith(p));
    // Default to strict partner/inventory check. 

    useEffect(() => {
        // Fetch existing details & ref data (partners/products)
        (async () => {
            try {
                const [detailsRes, partnersRes, productsRes, warehousesRes, banksRes, assetsRes] = await Promise.all([
                    fetch(`/api/opening-balances/${account.id}/details`),
                    isPartner ? fetch('/api/partners?isActive=true') : Promise.resolve(null),
                    isInventory ? fetch('/api/products?isActive=true') : Promise.resolve(null),
                    isInventory ? fetch('/api/warehouses?isActive=true') : Promise.resolve(null),
                    isBank ? fetch('/api/bank-accounts?isActive=true') : Promise.resolve(null),
                    isFixedAsset ? fetch('/api/fixed-assets?isActive=true') : Promise.resolve(null),
                ]);

                if (detailsRes.ok) {
                    const data = await detailsRes.json();
                    setDetails(Array.isArray(data) ? data : []);
                }

                const newRefData: ReferenceData = {
                    partners: partnersRes?.ok ? await partnersRes.json() : [],
                    products: productsRes?.ok ? await productsRes.json() : [],
                    warehouses: warehousesRes?.ok ? await warehousesRes.json() : [],
                    bankAccounts: banksRes?.ok ? await banksRes.json() : [],
                    fixedAssets: assetsRes?.ok ? await assetsRes.json() : [],
                };
                setRefData(newRefData);

            } catch (e) {
                console.error('Network error fetching details/refs:', e);
            } finally {
                setLoading(false);
            }
        })();
    }, [account.id, isPartner, isInventory, isBank, isFixedAsset]);

    const addRow = () => {
        setDetails([...details, {
            quantity: 0, unitPrice: 0, amount: 0, debit: 0, credit: 0
        }]);
    };

    const removeRow = (index: number) => {
        setDetails(details.filter((_, i) => i !== index));
    };

    const updateRow = (index: number, field: keyof DetailItem, value: any) => {
        const newDetails = [...details];
        newDetails[index] = { ...newDetails[index], [field]: value };

        // Auto-calc logic
        const row = newDetails[index];
        if (field === 'quantity' || field === 'unitPrice') {
            // For inventory: Amount = Qty * Price
            // If Asset (15x) -> Debit = Amount
            row.amount = Number(row.quantity) * Number(row.unitPrice);
            if (isInventory) {
                row.debit = row.amount;
            }
        }

        setDetails(newDetails);
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave(details);
        setSaving(false);
        onClose();
    };

    const totalDebit = details.reduce((sum, d) => sum + Number(d.debit || 0), 0);
    const totalCredit = details.reduce((sum, d) => sum + Number(d.credit || 0), 0);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9990,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                width: '900px', maxWidth: '95vw', height: '80vh',
                background: 'var(--surface)', borderRadius: '16px',
                display: 'flex', flexDirection: 'column',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                animation: 'slideUp 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📝 Chi tiết số dư: <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{account.code}</span>
                        </h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                            {account.name}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                            padding: '6px 12px', background: 'var(--background)', borderRadius: '6px',
                            border: '1px solid var(--border)', fontSize: '13px', fontWeight: 600
                        }}>
                            Tổng Nợ: <span style={{ color: '#059669' }}>{totalDebit.toLocaleString()}</span>
                        </div>
                        <div style={{
                            padding: '6px 12px', background: 'var(--background)', borderRadius: '6px',
                            border: '1px solid var(--border)', fontSize: '13px', fontWeight: 600
                        }}>
                            Tổng Có: <span style={{ color: '#2563EB' }}>{totalCredit.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>⏳ Đang tải...</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--surface-active)', fontSize: '12px', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>#</th>
                                    {isPartner && <th style={{ padding: '10px' }}>Đối tượng (Partner)</th>}
                                    {isBank && <th style={{ padding: '10px' }}>Tài khoản Ngân hàng</th>}
                                    {isFixedAsset && <th style={{ padding: '10px' }}>Tài sản cố định</th>}
                                    {isInventory && <th style={{ padding: '10px' }}>Vật tư (Product)</th>}
                                    {isInventory && <th style={{ padding: '10px' }}>Kho</th>}
                                    {(isInventory) && <th style={{ padding: '10px', textAlign: 'right' }}>SL</th>}
                                    {(isInventory) && <th style={{ padding: '10px', textAlign: 'right' }}>Đơn giá</th>}
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Nợ</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Có</th>
                                    <th style={{ padding: '10px', width: '40px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.map((row, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{idx + 1}</td>

                                        {isPartner && (
                                            <td style={{ padding: '10px' }}>
                                                {/* Placeholder for Partner Select */}
                                                <td style={{ padding: '10px' }}>
                                                    <select
                                                        value={row.partnerId || ''}
                                                        onChange={e => updateRow(idx, 'partnerId', e.target.value)}
                                                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
                                                    >
                                                        <option value="">-- Chọn đối tượng --</option>
                                                        {refData?.partners.map(p => (
                                                            <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </td>
                                        )}

                                        {isBank && (
                                            <td style={{ padding: '10px' }}>
                                                <select
                                                    value={row.bankAccountId || ''}
                                                    onChange={e => updateRow(idx, 'bankAccountId', e.target.value)}
                                                    style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
                                                >
                                                    <option value="">-- Chọn NH --</option>
                                                    {refData?.bankAccounts.map(b => (
                                                        <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber} ({b.currency})</option>
                                                    ))}
                                                </select>
                                            </td>
                                        )}

                                        {isFixedAsset && (
                                            <td style={{ padding: '10px' }}>
                                                <select
                                                    value={row.fixedAssetId || ''}
                                                    onChange={e => updateRow(idx, 'fixedAssetId', e.target.value)}
                                                    style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
                                                >
                                                    <option value="">-- Chọn TSCĐ --</option>
                                                    {refData?.fixedAssets.map(fa => (
                                                        <option key={fa.id} value={fa.id}>{fa.code} - {fa.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        )}

                                        {isInventory && (
                                            <>
                                                <td style={{ padding: '10px' }}>
                                                    <select
                                                        value={row.productId || ''}
                                                        onChange={e => updateRow(idx, 'productId', e.target.value)}
                                                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
                                                    >
                                                        <option value="">-- Chọn VT --</option>
                                                        {refData?.products.map(p => (
                                                            <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    <select
                                                        value={row.warehouseId || ''}
                                                        onChange={e => updateRow(idx, 'warehouseId', e.target.value)}
                                                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
                                                    >
                                                        <option value="">-- Chọn Kho --</option>
                                                        {refData?.warehouses.map(w => (
                                                            <option key={w.id} value={w.id}>{w.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </>
                                        )}

                                        {isInventory && (
                                            <>
                                                <td style={{ padding: '10px' }}>
                                                    <input type="number" value={row.quantity} onChange={e => updateRow(idx, 'quantity', e.target.value)} style={cellInput} />
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    <input type="number" value={row.unitPrice} onChange={e => updateRow(idx, 'unitPrice', e.target.value)} style={cellInput} />
                                                </td>
                                            </>
                                        )}

                                        <td style={{ padding: '10px' }}>
                                            <input type="number" value={row.debit} onChange={e => updateRow(idx, 'debit', e.target.value)} style={cellInput} />
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <input type="number" value={row.credit} onChange={e => updateRow(idx, 'credit', e.target.value)} style={cellInput} />
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <button onClick={() => removeRow(idx)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}>✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <button
                        onClick={addRow}
                        style={{
                            marginTop: '16px', border: '1px dashed var(--border)', background: 'none',
                            width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                            color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600
                        }}
                    >
                        + Thêm dòng
                    </button>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px', borderTop: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'flex-end', gap: '12px'
                }}>
                    <button onClick={onClose} style={{
                        padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)',
                        background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600
                    }}>
                        Hủy bỏ
                    </button>
                    <button onClick={handleSave} disabled={saving} style={{
                        padding: '10px 24px', borderRadius: '8px', border: 'none',
                        background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 700,
                        opacity: saving ? 0.7 : 1
                    }}>
                        {saving ? 'Đang lưu...' : 'Lưu & Đóng'}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}

const cellInput = {
    width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid var(--border)',
    background: 'var(--background)', color: 'var(--text-primary)', textAlign: 'right' as const
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Page Component ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function OpeningBalancePage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Detailed Modal State
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/opening-balances');
            if (res.ok) setAccounts(await res.json());
        } finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleChange = (id: string, field: 'openingDebit' | 'openingCredit', value: string) => {
        const numVal = value === '' ? 0 : parseFloat(value);
        if (isNaN(numVal)) return;
        setAccounts(prev => prev.map(a => a.id === id ? { ...a, [field]: numVal } : a));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = accounts.map(a => ({
                id: a.id,
                debit: a.openingDebit,
                credit: a.openingCredit
            }));

            const res = await fetch('/api/opening-balances', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ balances: payload })
            });

            if (res.ok) {
                setToast({ message: 'Dữ liệu đã được lưu thành công!', type: 'success' });
            } else {
                setToast({ message: 'Lỗi khi lưu dữ liệu', type: 'error' });
            }
        } catch {
            setToast({ message: 'Lỗi kết nối server', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDetails = async (details: DetailItem[]) => {
        if (!selectedAccount) return;

        try {
            const res = await fetch(`/api/opening-balances/${selectedAccount.id}/details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    details,
                    companyId: '...' // Should be handled by backend session ideally 
                })
            });

            if (res.ok) {
                setToast({ message: 'Đã lưu chi tiết!', type: 'success' });
                // Re-fetch parent accounts to update totals
                fetchData();
            } else {
                setToast({ message: 'Lỗi khi lưu chi tiết', type: 'error' });
            }
        } catch (e) {
            setToast({ message: 'Lỗi mạng', type: 'error' });
        }
    };

    // Helper: check if account supports details
    const supportsDetails = (code: string) => {
        // 131, 331, 141 (Advance), 138, 338, 15* (Inventory)
        return ['131', '331', '141', '138', '338', '112', '211'].some(p => code.startsWith(p)) || code.startsWith('15');
    };

    // Calculations
    const totalDebit = accounts.reduce((sum, a) => sum + (Number(a.openingDebit) || 0), 0);
    const totalCredit = accounts.reduce((sum, a) => sum + (Number(a.openingCredit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    const filtered = accounts.filter(a =>
        a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Render Loading
    if (isLoading && accounts.length === 0) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'spin 1.2s linear infinite' }}>⏳</div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                <div style={{ fontSize: '14px' }}>Đang tải dữ liệu...</div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* ═══ HEADER ═══ */}
            <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--surface)',
            }}>
                <div>
                    <h1 style={{
                        fontSize: '20px', fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: '2px', letterSpacing: '-0.3px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        💰 Số Dư Đầu Kỳ
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                        Thiết lập và cân đối số dư đầu kỳ cho các tài khoản
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Balance Indicator Widget */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: '10px', overflow: 'hidden',
                        height: '38px',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{
                            padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center',
                            background: 'rgba(16, 185, 129, 0.1)', color: '#059669',
                            fontSize: '13px', fontWeight: 600, borderRight: '1px solid var(--border)'
                        }}>
                            NỢ: {totalDebit.toLocaleString()}
                        </div>
                        <div style={{
                            padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center',
                            background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB',
                            fontSize: '13px', fontWeight: 600, borderRight: '1px solid var(--border)'
                        }}>
                            CÓ: {totalCredit.toLocaleString()}
                        </div>
                        <div style={{
                            padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', gap: '6px',
                            background: isBalanced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isBalanced ? '#059669' : '#DC2626',
                            fontSize: '12px', fontWeight: 700
                        }}>
                            {isBalanced ? '✅ Cân bằng' : '⚠️ Lệch: ' + Math.abs(totalDebit - totalCredit).toLocaleString()}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => window.open('/api/opening-balances/export', '_blank')}
                            style={{
                                background: 'var(--surface)', border: '1px solid var(--border)',
                                color: 'var(--text-primary)', padding: '0 16px', borderRadius: '10px',
                                fontWeight: 600, cursor: 'pointer', fontSize: '14px', height: '38px',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            📥 Excel
                        </button>

                        <button
                            onClick={() => document.getElementById('excel-upload')?.click()}
                            style={{
                                background: 'var(--surface)', border: '1px solid var(--border)',
                                color: 'var(--text-primary)', padding: '0 16px', borderRadius: '10px',
                                fontWeight: 600, cursor: 'pointer', fontSize: '14px', height: '38px',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            📤 Upload
                        </button>
                        <input
                            id="excel-upload"
                            type="file"
                            accept=".xlsx"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const formData = new FormData();
                                formData.append('file', file);

                                setIsSaving(true);
                                try {
                                    const res = await fetch('/api/opening-balances/import', {
                                        method: 'POST',
                                        body: formData
                                    });
                                    if (res.ok) {
                                        setToast({ message: 'Import thành công!', type: 'success' });
                                        fetchData(); // Reload data
                                    } else {
                                        setToast({ message: 'Lỗi khi import', type: 'error' });
                                    }
                                } catch (err) {
                                    setToast({ message: 'Lỗi mạng', type: 'error' });
                                } finally {
                                    setIsSaving(false);
                                    e.target.value = ''; // Reset
                                }
                            }}
                        />

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{
                                background: 'var(--btn-primary)', color: 'var(--btn-primary-text)',
                                border: 'none', padding: '0 24px', borderRadius: '10px',
                                fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer',
                                fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                                opacity: isSaving ? 0.7 : 1, transition: 'all 0.2s', height: '38px'
                            }}
                        >
                            {isSaving ? '⏳...' : '💾 Lưu'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ CONTENT ═══ */}
            <div style={{ flex: 1, padding: '24px', overflow: 'auto', background: 'var(--background)' }}>
                <div style={{
                    maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px'
                }}>

                    {/* Search Bar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <StyledSearchInput
                            placeholder="Tìm kiếm tài khoản (Tên, Mã)..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Table Card */}
                    <div style={{
                        background: 'var(--surface)',
                        borderRadius: '16px', border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-card)', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column',
                        minHeight: '600px'
                    }}>
                        <div style={{ overflow: 'auto', flex: 1 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--grid-header-bg)', position: 'sticky', top: 0, zIndex: 10 }}>
                                        <th style={thStyle}>Mã TK</th>
                                        <th style={{ ...thStyle, width: '40%' }}>Tên tài khoản</th>
                                        <th style={thStyle}>Chi tiết</th>
                                        <th style={{ ...thStyle, textAlign: 'right' }}>Dư Nợ Đầu Kỳ</th>
                                        <th style={{ ...thStyle, textAlign: 'right' }}>Dư Có Đầu Kỳ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                Không tìm thấy tài khoản nào.
                                            </td>
                                        </tr>
                                    ) : filtered.map((acc, idx) => {
                                        const hasDetailSupport = supportsDetails(acc.code);
                                        return (
                                            <tr key={acc.id} style={{
                                                borderBottom: '1px solid var(--border)',
                                                background: acc.isPosting ? 'transparent' : 'var(--surface-active)'
                                            }}>
                                                <td style={{ ...tdStyle, fontWeight: acc.isPosting ? 600 : 800 }}>
                                                    <span style={{
                                                        padding: '2px 6px', borderRadius: '4px',
                                                        background: acc.isPosting ? 'transparent' : 'var(--background)',
                                                        fontSize: '12px', fontFamily: 'monospace'
                                                    }}>
                                                        {acc.code}
                                                    </span>
                                                </td>
                                                <td style={{ ...tdStyle, fontWeight: acc.isPosting ? 500 : 700 }}>
                                                    {acc.name}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                    {/* Detail Button */}
                                                    {acc.isPosting && hasDetailSupport && (
                                                        <button
                                                            onClick={() => setSelectedAccount(acc)}
                                                            title="Nhập chi tiết"
                                                            style={{
                                                                background: 'var(--surface-active)', border: '1px solid var(--border)',
                                                                borderRadius: '6px', width: '28px', height: '28px',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                cursor: 'pointer', color: 'var(--text-primary)'
                                                            }}
                                                        >
                                                            ⋮
                                                        </button>
                                                    )}
                                                </td>
                                                <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                                                    {acc.isPosting ? (
                                                        <TableInput
                                                            type="number"
                                                            value={acc.openingDebit || ''}
                                                            onChange={e => handleChange(acc.id, 'openingDebit', e.target.value)}
                                                            onFocus={e => e.target.select()}
                                                            placeholder="0"
                                                            readOnly={hasDetailSupport} // Lock manual edit if details supported?
                                                            style={hasDetailSupport ? { background: 'var(--surface-hover)', cursor: 'not-allowed' } : {}}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>-</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                                                    {acc.isPosting ? (
                                                        <TableInput
                                                            type="number"
                                                            value={acc.openingCredit || ''}
                                                            onChange={e => handleChange(acc.id, 'openingCredit', e.target.value)}
                                                            onFocus={e => e.target.select()}
                                                            placeholder="0"
                                                            readOnly={hasDetailSupport}
                                                            style={hasDetailSupport ? { background: 'var(--surface-hover)', cursor: 'not-allowed' } : {}}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedAccount && (
                <DetailsModal
                    account={selectedAccount}
                    onClose={() => setSelectedAccount(null)}
                    onSave={handleSaveDetails}
                />
            )}

            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
    padding: '12px 16px', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px',
    textAlign: 'left', borderBottom: '1px solid var(--border)',
};

const tdStyle: React.CSSProperties = {
    padding: '10px 16px', fontSize: '13px', color: 'var(--text-primary)',
};
