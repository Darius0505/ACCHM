'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

type Account = {
    code: string
    name: string
    nameEn?: string | null
    nameJa?: string | null
    type: string
    nature: string
    isPosting: boolean
    parentId: string | null
}

type Locale = 'vi' | 'en' | 'ja';

const translations = {
    vi: {
        title: 'Hệ thống Tài khoản',
        subtitle: 'Quản lý hệ thống tài khoản kế toán theo chuẩn Việt Nam',
        backToAccounting: '← Quay lại Kế toán',
        addAccount: '+ Thêm tài khoản',
        addChild: 'Thêm TK con',
        edit: 'Sửa',
        delete: 'Xóa',
        save: 'Lưu',
        cancel: 'Hủy',
        code: 'Mã TK',
        name: 'Tên tài khoản',
        type: 'Loại',
        nature: 'Tính chất',
        posting: 'Chi tiết',
        summary: 'Tổng hợp',
        expandAll: 'Mở tất cả',
        collapseAll: 'Thu gọn',
        searchPlaceholder: 'Tìm kiếm tài khoản...',
        confirmDelete: 'Bạn có chắc muốn xóa tài khoản này?',
        types: {
            ASSET: 'Tài sản',
            LIABILITY: 'Nợ phải trả',
            EQUITY: 'Vốn CSH',
            REVENUE: 'Doanh thu',
            EXPENSE: 'Chi phí'
        }
    },
    en: {
        title: 'Chart of Accounts',
        subtitle: 'Manage accounting system following Vietnamese standards',
        backToAccounting: '← Back to Accounting',
        addAccount: '+ Add Account',
        addChild: 'Add Child',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
        code: 'Code',
        name: 'Account Name',
        type: 'Type',
        nature: 'Nature',
        posting: 'Posting',
        summary: 'Summary',
        expandAll: 'Expand All',
        collapseAll: 'Collapse All',
        searchPlaceholder: 'Search accounts...',
        confirmDelete: 'Are you sure you want to delete this account?',
        types: {
            ASSET: 'Asset',
            LIABILITY: 'Liability',
            EQUITY: 'Equity',
            REVENUE: 'Revenue',
            EXPENSE: 'Expense'
        }
    },
    ja: {
        title: '勘定科目',
        subtitle: 'ベトナム基準に基づく会計システムの管理',
        backToAccounting: '← 会計に戻る',
        addAccount: '+ 勘定追加',
        addChild: '子追加',
        edit: '編集',
        delete: '削除',
        save: '保存',
        cancel: 'キャンセル',
        code: 'コード',
        name: '勘定科目名',
        type: '種類',
        nature: '性質',
        posting: '明細',
        summary: '集計',
        expandAll: 'すべて展開',
        collapseAll: 'すべて折りたたむ',
        searchPlaceholder: '勘定科目を検索...',
        confirmDelete: 'この勘定科目を削除してもよろしいですか？',
        types: {
            ASSET: '資産',
            LIABILITY: '負債',
            EQUITY: '資本',
            REVENUE: '収益',
            EXPENSE: '費用'
        }
    }
};

const colors = {
    primary: '#E57373',
    primaryDark: '#C62828',
    accent: '#FF8A65',
    bgWarm: '#FFFAF5',
    text: '#3D3D3D',
    textSecondary: '#757575',
};

const typeColors: Record<string, { bg: string, text: string, icon: string }> = {
    ASSET: { bg: '#E3F2FD', text: '#1565C0', icon: '🏦' },
    LIABILITY: { bg: '#FCE4EC', text: '#C2185B', icon: '📋' },
    EQUITY: { bg: '#E8F5E9', text: '#2E7D32', icon: '💰' },
    REVENUE: { bg: '#FFF3E0', text: '#E65100', icon: '📈' },
    EXPENSE: { bg: '#FFEBEE', text: '#C62828', icon: '📉' },
};

interface TreeNode extends Account {
    children: TreeNode[];
    level: number;
}

function buildTree(accounts: Account[]): TreeNode[] {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Create nodes
    accounts.forEach(acc => {
        map.set(acc.code, { ...acc, children: [], level: 0 });
    });

    // Build tree
    accounts.forEach(acc => {
        const node = map.get(acc.code)!;
        if (acc.parentId && map.has(acc.parentId)) {
            const parent = map.get(acc.parentId)!;
            node.level = parent.level + 1;
            parent.children.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

export default function AccountsClientPage({ initialAccounts }: { initialAccounts: Account[] }) {
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
    const [locale, setLocale] = useState<Locale>('vi')
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
    const [searchTerm, setSearchTerm] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingAccount, setEditingAccount] = useState<Account | null>(null)
    const [parentCode, setParentCode] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        nameEn: '',
        nameJa: '',
        nameKo: '',
        type: 'ASSET',
        nature: 'POSTING',
        isPosting: true,
        parentId: null as string | null
    })
    const [groupByType, setGroupByType] = useState(true)

    useEffect(() => {
        const cookieLocale = document.cookie
            .split('; ')
            .find(row => row.startsWith('locale='))
            ?.split('=')[1] as Locale;
        if (cookieLocale && translations[cookieLocale]) {
            setLocale(cookieLocale);
        }
        // Expand first level by default
        const roots = buildTree(accounts);
        setExpandedNodes(new Set(roots.map(r => r.code)));
    }, []);

    const t = translations[locale];
    const tree = buildTree(accounts);

    const toggleExpand = (code: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(code)) {
            newExpanded.delete(code);
        } else {
            newExpanded.add(code);
        }
        setExpandedNodes(newExpanded);
    };

    const expandAll = () => {
        setExpandedNodes(new Set(accounts.filter(a => !a.isPosting).map(a => a.code)));
    };

    const collapseAll = () => {
        setExpandedNodes(new Set());
    };

    const refreshAccounts = async () => {
        const res = await fetch('/api/accounts');
        const data = await res.json();
        setAccounts(data);
    };

    const handleAddRoot = () => {
        setEditingAccount(null);
        setParentCode(null);
        setFormData({
            code: '',
            name: '',
            nameEn: '',
            nameJa: '',
            nameKo: '',
            type: 'ASSET',
            nature: 'SUMMARY',
            isPosting: false,
            parentId: null
        });
        setShowForm(true);
    };

    const handleAddChild = (parent: Account) => {
        setEditingAccount(null);
        setParentCode(parent.code);
        setFormData({
            code: parent.code,
            name: '',
            nameEn: '',
            nameJa: '',
            nameKo: '',
            type: parent.type,
            nature: 'POSTING',
            isPosting: true,
            parentId: parent.code
        });
        setShowForm(true);
    };

    const handleEdit = (account: Account) => {
        setEditingAccount(account);
        setParentCode(account.parentId);
        setFormData({
            code: account.code,
            name: account.name,
            nameEn: account.nameEn || '',
            nameJa: account.nameJa || '',
            nameKo: '',
            type: account.type,
            nature: account.nature,
            isPosting: account.isPosting,
            parentId: account.parentId
        });
        setShowForm(true);
    };

    const handleDelete = async (code: string) => {
        if (!window.confirm(t.confirmDelete)) return;

        await fetch(`/api/accounts/${code}`, { method: 'DELETE' });
        await refreshAccounts();
    };

    const handleSave = async () => {
        try {
            const method = editingAccount ? 'PUT' : 'POST';
            const url = editingAccount ? `/api/accounts/${editingAccount.code}` : '/api/accounts';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            setShowForm(false);
            setEditingAccount(null);
            await refreshAccounts();
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const filteredTree = searchTerm
        ? accounts.filter(a =>
            a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : null;

    const renderTreeNode = (node: TreeNode) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expandedNodes.has(node.code);
        const typeStyle = typeColors[node.type] || typeColors.ASSET;

        return (
            <div key={node.code}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        paddingLeft: `${20 + node.level * 24}px`,
                        borderBottom: '1px solid #F0E6E0',
                        background: node.level === 0 ? '#FAFAFA' : 'white',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#FFF8F5'}
                    onMouseOut={(e) => e.currentTarget.style.background = node.level === 0 ? '#FAFAFA' : 'white'}
                >
                    {/* Expand/Collapse */}
                    <button
                        onClick={() => toggleExpand(node.code)}
                        style={{
                            width: '24px',
                            height: '24px',
                            marginRight: '8px',
                            background: 'none',
                            border: 'none',
                            cursor: hasChildren ? 'pointer' : 'default',
                            fontSize: '14px',
                            color: hasChildren ? colors.text : 'transparent'
                        }}
                    >
                        {hasChildren ? (isExpanded ? '▼' : '▶') : '•'}
                    </button>

                    {/* Icon */}
                    <span style={{ fontSize: '18px', marginRight: '10px' }}>{typeStyle.icon}</span>

                    {/* Code */}
                    <span style={{
                        fontWeight: 600,
                        color: colors.primaryDark,
                        minWidth: '60px',
                        marginRight: '12px'
                    }}>
                        {node.code}
                    </span>

                    {/* Name */}
                    <span style={{
                        flex: 1,
                        color: colors.text,
                        fontWeight: node.level === 0 ? 600 : 400
                    }}>
                        {locale === 'en' && node.nameEn ? node.nameEn : node.name}
                    </span>

                    {/* Type Badge */}
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: typeStyle.bg,
                        color: typeStyle.text,
                        marginRight: '8px'
                    }}>
                        {t.types[node.type as keyof typeof t.types] || node.type}
                    </span>

                    {/* Nature Badge */}
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        background: node.isPosting ? '#E8F5E9' : '#FFF3E0',
                        color: node.isPosting ? '#2E7D32' : '#E65100',
                        marginRight: '16px'
                    }}>
                        {node.isPosting ? t.posting : t.summary}
                    </span>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {!node.isPosting && (
                            <button
                                onClick={() => handleAddChild(node)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: `1px solid ${colors.accent}`,
                                    background: 'white',
                                    color: colors.accent,
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                {t.addChild}
                            </button>
                        )}
                        <button
                            onClick={() => handleEdit(node)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #90A4AE',
                                background: 'white',
                                color: '#455A64',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            {t.edit}
                        </button>
                        <button
                            onClick={() => handleDelete(node.code)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #EF5350',
                                background: 'white',
                                color: '#EF5350',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            {t.delete}
                        </button>
                    </div>
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div>
                        {node.children.sort((a, b) => a.code.localeCompare(b.code)).map(child => renderTreeNode(child))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: colors.bgWarm }}>
            {/* Header */}
            <header style={{
                background: 'linear-gradient(135deg, #E57373 0%, #C62828 100%)',
                padding: '24px 32px',
                color: 'white'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <Link
                        href="/accounting"
                        style={{
                            color: 'rgba(255,255,255,0.8)',
                            textDecoration: 'none',
                            fontSize: '14px'
                        }}
                    >
                        {t.backToAccounting}
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
                                📊 {t.title}
                            </h1>
                            <p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0' }}>
                                {t.subtitle}
                            </p>
                        </div>

                        {/* Language + Add Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {(['vi', 'en', 'ja'] as Locale[]).map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => {
                                            document.cookie = `locale=${lang};path=/;max-age=31536000`;
                                            setLocale(lang);
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '16px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            background: locale === lang ? 'white' : 'rgba(255,255,255,0.2)',
                                            color: locale === lang ? colors.primaryDark : 'white'
                                        }}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleAddRoot}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'white',
                                    color: colors.primaryDark,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {t.addAccount}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Toolbar */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '16px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
            }}>
                {/* Search */}
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        maxWidth: '400px',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        fontSize: '14px'
                    }}
                />

                {/* Expand/Collapse */}
                <button
                    onClick={expandAll}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #E0E0E0',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '13px'
                    }}
                >
                    {t.expandAll}
                </button>
                <button
                    onClick={collapseAll}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #E0E0E0',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '13px'
                    }}
                >
                    {t.collapseAll}
                </button>

                {/* Group by Type */}
                <button
                    onClick={() => setGroupByType(!groupByType)}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: groupByType ? `2px solid ${colors.primary}` : '1px solid #E0E0E0',
                        background: groupByType ? '#FFF0ED' : 'white',
                        color: groupByType ? colors.primaryDark : colors.text,
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: groupByType ? 600 : 400
                    }}
                >
                    📁 {locale === 'vi' ? 'Nhóm theo loại' : locale === 'en' ? 'Group by Type' : 'タイプ別'}
                </button>
            </div>

            {/* Tree View */}
            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px 32px' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    {/* Search Results or Tree */}
                    {filteredTree ? (
                        filteredTree.map(acc => (
                            <div
                                key={acc.code}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    borderBottom: '1px solid #F0E6E0'
                                }}
                            >
                                <span style={{
                                    fontWeight: 600,
                                    color: colors.primaryDark,
                                    minWidth: '60px',
                                    marginRight: '12px'
                                }}>
                                    {acc.code}
                                </span>
                                <span style={{ flex: 1, color: colors.text }}>{acc.name}</span>
                                <button
                                    onClick={() => handleEdit(acc)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #90A4AE',
                                        background: 'white',
                                        color: '#455A64',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        marginRight: '6px'
                                    }}
                                >
                                    {t.edit}
                                </button>
                            </div>
                        ))
                    ) : (
                        tree.sort((a, b) => a.code.localeCompare(b.code)).map(node => renderTreeNode(node))
                    )}
                </div>
            </main>

            {/* Form Modal */}
            {showForm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                    }}>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            marginBottom: '24px',
                            color: colors.text
                        }}>
                            {editingAccount ? t.edit : t.addAccount}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Code */}
                            <div>
                                <label style={{ fontSize: '14px', fontWeight: 500, color: colors.text }}>
                                    {t.code}
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    disabled={!!editingAccount}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #E0E0E0',
                                        marginTop: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            {/* Name Vietnamese */}
                            <div>
                                <label style={{ fontSize: '14px', fontWeight: 500, color: colors.text }}>
                                    🇻🇳 {t.name} (Tiếng Việt)
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #E0E0E0',
                                        marginTop: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            {/* Name English */}
                            <div>
                                <label style={{ fontSize: '14px', fontWeight: 500, color: colors.text }}>
                                    🇺🇸 Name (English)
                                </label>
                                <input
                                    type="text"
                                    value={formData.nameEn}
                                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                    placeholder="Account name in English"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #E0E0E0',
                                        marginTop: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            {/* Name Japanese */}
                            <div>
                                <label style={{ fontSize: '14px', fontWeight: 500, color: colors.text }}>
                                    🇯🇵 名前 (日本語)
                                </label>
                                <input
                                    type="text"
                                    value={formData.nameJa}
                                    onChange={(e) => setFormData({ ...formData, nameJa: e.target.value })}
                                    placeholder="勘定科目名"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #E0E0E0',
                                        marginTop: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            {/* Name Korean */}
                            <div>
                                <label style={{ fontSize: '14px', fontWeight: 500, color: colors.text }}>
                                    🇰🇷 이름 (한국어)
                                </label>
                                <input
                                    type="text"
                                    value={formData.nameKo}
                                    onChange={(e) => setFormData({ ...formData, nameKo: e.target.value })}
                                    placeholder="계정과목명"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #E0E0E0',
                                        marginTop: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label style={{ fontSize: '14px', fontWeight: 500, color: colors.text }}>
                                    {t.type}
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #E0E0E0',
                                        marginTop: '6px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="ASSET">{t.types.ASSET}</option>
                                    <option value="LIABILITY">{t.types.LIABILITY}</option>
                                    <option value="EQUITY">{t.types.EQUITY}</option>
                                    <option value="REVENUE">{t.types.REVENUE}</option>
                                    <option value="EXPENSE">{t.types.EXPENSE}</option>
                                </select>
                            </div>

                            {/* Is Posting */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isPosting}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        isPosting: e.target.checked,
                                        nature: e.target.checked ? 'POSTING' : 'SUMMARY'
                                    })}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <label style={{ fontSize: '14px', color: colors.text }}>
                                    {t.posting} (chi tiết)
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                            <button
                                onClick={() => setShowForm(false)}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    border: '1px solid #E0E0E0',
                                    background: 'white',
                                    color: colors.text,
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleSave}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: colors.primaryDark,
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}
                            >
                                {t.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
