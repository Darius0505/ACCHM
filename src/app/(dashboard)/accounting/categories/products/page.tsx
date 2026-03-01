'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ProductCategory {
    id: string;
    code: string;
    name: string;
    children?: ProductCategory[];
}

interface Product {
    id: string;
    code: string;
    name: string;
    nameEN?: string;
    type: string;
    unit?: string;
    productCategoryId?: string;
    category?: { id: string; code: string; name: string };
    purchasePrice?: number;
    salePrice?: number;
    taxRate?: number;
    isActive: boolean;
    // Accounting
    inventoryAccountId?: string;
    cogsAccountId?: string;
    revenueAccountId?: string;
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
    PRODUCT: { label: 'Thành phẩm', bg: 'rgba(59,130,246,0.12)', text: '#2563eb', icon: '📦' },
    MATERIAL: { label: 'Nguyên vật liệu', bg: 'rgba(16,185,129,0.12)', text: '#16a34a', icon: '🪵' },
    TOOL: { label: 'Công cụ dụng cụ', bg: 'rgba(245,158,11,0.12)', text: '#d97706', icon: '🛠️' },
    SERVICE: { label: 'Dịch vụ', bg: 'rgba(210,96,76,0.12)', text: '#D2604C', icon: '⚡' },
};

const HEADERS = ['STT', 'Mã VTHH', 'Tên VTHH', 'Loại', 'ĐVT', 'Nhóm', 'Giá mua', 'Giá bán', 'TK Kho', ''];

export default function ProductsPage() {
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Product | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [categories, setCategories] = useState<ProductCategory[]>([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('');

    const [formData, setFormData] = useState({
        code: '', name: '', nameEN: '', type: 'PRODUCT', unit: '',
        productCategoryId: '',
        purchasePrice: 0, salePrice: 0, taxRate: 0,
        inventoryAccountId: '', cogsAccountId: '', revenueAccountId: ''
    });

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/product-categories');
            if (res.ok) {
                const cats = await res.json();
                // Flatten for dropdown
                const flat: ProductCategory[] = [];
                const flatten = (list: any[]) => {
                    list.forEach(c => {
                        flat.push({ id: c.id, code: c.code, name: c.name });
                        if (c.children) flatten(c.children);
                    });
                };
                flatten(cats);
                setCategories(flat);
            }
        } catch { }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            if (filterCategory) params.set('categoryId', filterCategory);
            if (filterType) params.set('type', filterType);

            const res = await fetch(`/api/products?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const products: Product[] = await res.json();
            setData(products);
            setError(null);
        } catch {
            setError('Không thể tải dữ liệu');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filterCategory, filterType]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            if (filterCategory) params.set('categoryId', filterCategory);
            if (filterType) params.set('type', filterType);

            // Trigger download
            const res = await fetch(`/api/products/export?${params.toString()}`);
            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            const filename = `DS_VTHH_${new Date().toISOString().slice(0, 10)}.xlsx`;

            // Create link to download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (e) {
            alert('❌ Có lỗi khi xuất Excel');
        }
    };

    const handleDelete = async (item: Product) => {
        if (!confirm(`Bạn có chắc muốn xóa "${item.name}"?`)) return;
        try {
            const res = await fetch(`/api/products/${item.id}`, { method: 'DELETE' });
            if (!res.ok) {
                let errorMessage = `Lỗi xóa (HTTP ${res.status})`;
                try {
                    const err = await res.json();
                    if (err && err.error) errorMessage = err.error;
                } catch { }
                alert(`❌ ${errorMessage}`);
                return;
            }
            fetchData();
        } catch (e: any) {
            alert(`❌ Có lỗi xảy ra khi xóa: ${e?.message || 'Unknown error'}`);
        }
    };

    const handleEdit = (item: Product) => {
        setEditingItem(item);
        setFormData({
            code: item.code, name: item.name, nameEN: item.nameEN || '',
            type: item.type, unit: item.unit || '',
            productCategoryId: item.productCategoryId || '',
            purchasePrice: item.purchasePrice || 0,
            salePrice: item.salePrice || 0,
            taxRate: item.taxRate || 0,
            inventoryAccountId: item.inventoryAccountId || '',
            cogsAccountId: item.cogsAccountId || '',
            revenueAccountId: item.revenueAccountId || '',
        });
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setFormData({
            code: '', name: '', nameEN: '', type: 'PRODUCT', unit: '',
            productCategoryId: '',
            purchasePrice: 0, salePrice: 0, taxRate: 8,
            inventoryAccountId: '1561', cogsAccountId: '632', revenueAccountId: '511'
        });
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!formData.code || !formData.name) {
            alert('⚠️ Vui lòng nhập mã và tên sản phẩm');
            return;
        }
        try {
            const url = editingItem ? `/api/products/${editingItem.id}` : '/api/products';
            const method = editingItem ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                let errorMessage = `Lỗi (HTTP ${res.status})`;
                try {
                    const err = await res.json();
                    if (err && err.error) errorMessage = err.error;
                } catch { }
                alert(`❌ ${errorMessage}`);
                return;
            }
            setShowForm(false);
            fetchData();
        } catch (e: any) {
            alert(`❌ Có lỗi: ${e?.message || 'Unknown error'}`);
        }
    };

    // Auto-fill accounts based on type
    const handleTypeChange = (type: string) => {
        let inv = '', cogs = '632', rev = '511';
        if (type === 'PRODUCT') inv = '1561';
        else if (type === 'MATERIAL') inv = '152';
        else if (type === 'TOOL') inv = '153';
        else if (type === 'SERVICE') { inv = ''; cogs = '632'; rev = '5113'; } // Example logic

        setFormData(p => ({
            ...p, type,
            inventoryAccountId: inv, cogsAccountId: cogs, revenueAccountId: rev
        }));
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: 13, fontWeight: 500,
        marginBottom: 4, color: 'var(--text-secondary, #9ca3af)',
    };
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '8px 12px', borderRadius: 8,
        border: '1px solid var(--border-color, #374151)',
        background: 'var(--bg-secondary, #1e293b)',
        color: 'var(--text-primary, #e2e8f0)', fontSize: 14,
        outline: 'none',
    };

    // Helper for formatting currency
    const fmt = (n?: number) => n ? n.toLocaleString('vi-VN') : '0';

    return (
        <div style={{ padding: '24px 32px', maxWidth: 1600, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        📦 Danh mục Vật tư hàng hoá
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                        Quản lý sản phẩm, nguyên vật liệu, công cụ dụng cụ
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => fetchData()} style={{
                        padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                        border: '1px solid var(--border-color)', fontSize: 14,
                        background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                    }}>
                        🔄 Làm mới
                    </button>
                    <button onClick={handleExport} style={{
                        padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                        border: '1px solid var(--border-color)', fontSize: 14,
                        background: 'var(--bg-secondary)', color: '#10b981', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 6
                    }}>
                        📥 Xuất Excel
                    </button>
                    <button onClick={handleAdd} style={{
                        padding: '10px 24px', borderRadius: 8, cursor: 'pointer',
                        border: 'none', fontSize: 14, fontWeight: 600,
                        background: 'var(--btn-primary, var(--primary))', color: '#fff',
                    }}>
                        ＋ Thêm mới
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm mã, tên..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ ...inputStyle, width: 300 }}
                />

                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...inputStyle, width: 200 }}>
                    <option value="">-- Tất cả nhóm --</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                </select>

                <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inputStyle, width: 180 }}>
                    <option value="">-- Tất cả loại --</option>
                    {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                    ))}
                </select>

                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Tổng: <b>{data.length}</b> bản ghi
                </span>
            </div>

            {/* Table */}
            <div style={{
                border: '1px solid var(--border-color)', borderRadius: 12,
                overflow: 'auto', flex: 1,
                background: 'var(--bg-primary)',
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1200 }}>
                    <thead>
                        <tr style={{
                            background: 'var(--grid-header-bg, #1e293b)',
                            position: 'sticky', top: 0, zIndex: 2,
                        }}>
                            {HEADERS.map((h, i) => (
                                <th key={i} style={{
                                    padding: '12px 14px',
                                    textAlign: i === 0 ? 'center' : (i >= 6 && i <= 7) ? 'right' : 'left',
                                    fontSize: 13, fontWeight: 600,
                                    color: 'var(--text-primary, #e2e8f0)',
                                    whiteSpace: 'nowrap',
                                    borderBottom: '2px solid var(--border-color)',
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                                ⏳ Đang tải...
                            </td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                                📭 Không có dữ liệu
                            </td></tr>
                        ) : data.map((item, idx) => {
                            const isHovered = hoveredRow === item.id;
                            const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.PRODUCT;

                            return (
                                <tr key={item.id}
                                    onMouseEnter={() => setHoveredRow(item.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    style={{
                                        borderBottom: '1px solid var(--border-color)',
                                        background: isHovered ? 'var(--hover-bg, rgba(255,255,255,0.04))' : 'transparent',
                                        transition: 'background 0.15s',
                                        cursor: 'pointer'
                                    }}
                                    onDoubleClick={() => handleEdit(item)}
                                >
                                    <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
                                        {idx + 1}
                                    </td>
                                    <td style={{ padding: '10px 14px', fontWeight: 600, fontSize: 13, fontFamily: 'monospace', color: 'var(--primary-light, #60a5fa)' }}>
                                        {item.code}
                                    </td>
                                    <td style={{ padding: '10px 14px', fontWeight: 500, fontSize: 14 }}>
                                        {item.name}
                                        {item.nameEN && <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>{item.nameEN}</div>}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            padding: '2px 8px', borderRadius: 4,
                                            background: typeCfg.bg, color: typeCfg.text,
                                            fontSize: 12, fontWeight: 500
                                        }}>
                                            {typeCfg.icon} {typeCfg.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: 13 }}>
                                        {item.unit || '—'}
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
                                        {item.category ? item.category.name : '—'}
                                    </td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace' }}>
                                        {fmt(item.purchasePrice)}
                                    </td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>
                                        {fmt(item.salePrice)}
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: 13, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                        {item.inventoryAccountId || '—'}
                                    </td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                        <div style={{
                                            display: 'flex', gap: 4, justifyContent: 'center',
                                            opacity: isHovered ? 1 : 0, transition: 'opacity 0.15s',
                                        }}>
                                            <button title="Sửa" onClick={(e) => { e.stopPropagation(); handleEdit(item); }} style={{
                                                padding: '4px 8px', borderRadius: 6,
                                                border: '1px solid var(--border-color)',
                                                background: 'transparent', cursor: 'pointer',
                                                fontSize: 14, color: 'var(--text-secondary)',
                                            }}>✏️</button>
                                            <button title="Xóa" onClick={(e) => { e.stopPropagation(); handleDelete(item); }} style={{
                                                padding: '4px 8px', borderRadius: 6,
                                                border: '1px solid var(--border-color)',
                                                background: 'transparent', cursor: 'pointer',
                                                fontSize: 14, color: '#ef4444',
                                            }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                }} onClick={() => setShowForm(false)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'var(--bg-primary, #0f172a)', borderRadius: 16,
                        width: 800, maxHeight: '90vh', overflow: 'auto',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                    }}>
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                                {editingItem ? `✏️ Sửa VTHH` : '➕ Thêm Vật tư hàng hoá'}
                            </h2>
                            <button onClick={() => setShowForm(false)} style={{
                                background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
                                color: 'var(--text-secondary)', padding: '4px 8px',
                            }}>✕</button>
                        </div>

                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* General Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={labelStyle}>Tên VTHH *</label>
                                    <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                        placeholder="VD: Máy lạnh..." style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Mã VTHH *</label>
                                    <input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                        placeholder="VD: HH001" disabled={!!editingItem} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Tên tiếng Anh</label>
                                    <input value={formData.nameEN} onChange={e => setFormData(p => ({ ...p, nameEN: e.target.value }))}
                                        placeholder="English name" style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={labelStyle}>Loại VTHH *</label>
                                    <select value={formData.type} onChange={e => handleTypeChange(e.target.value)} style={inputStyle}>
                                        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                                            <option key={key} value={key}>{cfg.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Nhóm VTHH</label>
                                    <select value={formData.productCategoryId} onChange={e => setFormData(p => ({ ...p, productCategoryId: e.target.value }))} style={inputStyle}>
                                        <option value="">-- Chọn nhóm --</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Đơn vị tính</label>
                                    <input value={formData.unit} onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))}
                                        placeholder="Cái, Bộ, Kg..." style={inputStyle} />
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

                            {/* Pricing & Accounting */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={labelStyle}>Giá mua ngầm định</label>
                                    <input type="number" value={formData.purchasePrice} onChange={e => setFormData(p => ({ ...p, purchasePrice: Number(e.target.value) }))}
                                        style={{ ...inputStyle, textAlign: 'right' }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Giá bán ngầm định</label>
                                    <input type="number" value={formData.salePrice} onChange={e => setFormData(p => ({ ...p, salePrice: Number(e.target.value) }))}
                                        style={{ ...inputStyle, textAlign: 'right' }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Thuế suất GTGT (%)</label>
                                    <select value={formData.taxRate} onChange={e => setFormData(p => ({ ...p, taxRate: Number(e.target.value) }))} style={inputStyle}>
                                        <option value={0}>0%</option>
                                        <option value={5}>5%</option>
                                        <option value={8}>8%</option>
                                        <option value={10}>10%</option>
                                        <option value={-1}>KCT</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={labelStyle}>TK Kho</label>
                                    <input value={formData.inventoryAccountId} onChange={e => setFormData(p => ({ ...p, inventoryAccountId: e.target.value }))}
                                        placeholder="152, 156..." style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>TK Giá vốn</label>
                                    <input value={formData.cogsAccountId} onChange={e => setFormData(p => ({ ...p, cogsAccountId: e.target.value }))}
                                        placeholder="632..." style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>TK Doanh thu</label>
                                    <input value={formData.revenueAccountId} onChange={e => setFormData(p => ({ ...p, revenueAccountId: e.target.value }))}
                                        placeholder="511..." style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '16px 24px', borderTop: '1px solid var(--border-color)',
                            display: 'flex', justifyContent: 'flex-end', gap: 12,
                        }}>
                            <button onClick={() => setShowForm(false)} style={{
                                padding: '10px 24px', borderRadius: 8, cursor: 'pointer',
                                border: '1px solid var(--border-color)', fontSize: 14,
                                background: 'transparent', color: 'var(--text-primary)',
                            }}>Hủy</button>
                            <button onClick={handleSubmit} style={{
                                padding: '10px 24px', borderRadius: 8, cursor: 'pointer',
                                border: 'none', fontSize: 14, fontWeight: 600,
                                background: 'var(--btn-primary, var(--primary))', color: '#fff',
                            }}>
                                {editingItem ? '💾 Cập nhật' : '✅ Tạo mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
