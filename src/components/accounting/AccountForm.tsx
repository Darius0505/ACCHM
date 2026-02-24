
'use client'

import React, { useState, useEffect } from 'react'

type Account = {
    code: string
    name: string
    nameEn?: string | null
    nameJa?: string | null
    nameKo?: string | null
    type: string
    nature: string
    isPosting: boolean
    parentId: string | null
}

interface AccountFormProps {
    account?: Account | null
    parentAccounts: Account[]
    onSave: (data: Account) => void
    onCancel: () => void
}

const ACCOUNT_TYPES = [
    { value: 'ASSET', label: 'Tài sản' },
    { value: 'LIABILITY', label: 'Nợ phải trả' },
    { value: 'EQUITY', label: 'Vốn chủ sở hữu' },
    { value: 'REVENUE', label: 'Doanh thu' },
    { value: 'EXPENSE', label: 'Chi phí' },
]

const ACCOUNT_NATURES = [
    { value: 'DEBIT', label: 'Dư Nợ' },
    { value: 'CREDIT', label: 'Dư Có' },
    { value: 'BOTH', label: 'Lưỡng tính' },
]

export default function AccountForm({ account, parentAccounts, onSave, onCancel }: AccountFormProps) {
    const [formData, setFormData] = useState<Account>({
        code: '',
        name: '',
        nameEn: '',
        nameJa: '',
        nameKo: '',
        type: 'ASSET',
        nature: 'DEBIT',
        isPosting: true,
        parentId: null,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (account) {
            setFormData(account)
        }
    }, [account])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const url = account ? `/api/accounts/${account.code}` : '/api/accounts'
            const method = account ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to save')
            }

            onSave(formData)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">
                        {account ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}
                    </h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Số hiệu *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    disabled={!!account}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tài khoản cha</label>
                                <select
                                    value={formData.parentId || ''}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">-- Không có --</option>
                                    {parentAccounts
                                        .filter(p => p.code !== formData.code)
                                        .map((p) => (
                                            <option key={p.code} value={p.code}>
                                                {p.code} - {p.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên tiếng Việt *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">English Name</label>
                                <input
                                    type="text"
                                    value={formData.nameEn || ''}
                                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">日本語名</label>
                                <input
                                    type="text"
                                    value={formData.nameJa || ''}
                                    onChange={(e) => setFormData({ ...formData, nameJa: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">한국어 이름</label>
                                <input
                                    type="text"
                                    value={formData.nameKo || ''}
                                    onChange={(e) => setFormData({ ...formData, nameKo: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Loại tài khoản</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {ACCOUNT_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tính chất</label>
                                <select
                                    value={formData.nature}
                                    onChange={(e) => setFormData({ ...formData, nature: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {ACCOUNT_NATURES.map((n) => (
                                        <option key={n.value} value={n.value}>{n.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPosting}
                                        onChange={(e) => setFormData({ ...formData, isPosting: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Tài khoản chi tiết</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
