
'use client'

import React, { useState } from 'react'

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

interface AccountListProps {
    initialAccounts: Account[]
    locale?: string
    onEdit?: (account: Account) => void
    onDelete?: (code: string) => void
}

export default function AccountList({ initialAccounts, locale = 'vi', onEdit, onDelete }: AccountListProps) {
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

    const getAccountName = (account: Account) => {
        switch (locale) {
            case 'en': return account.nameEn || account.name
            case 'ja': return account.nameJa || account.name
            case 'ko': return account.nameKo || account.name
            default: return account.name
        }
    }

    const toggleExpand = (code: string) => {
        const newExpanded = new Set(expandedNodes)
        if (newExpanded.has(code)) {
            newExpanded.delete(code)
        } else {
            newExpanded.add(code)
        }
        setExpandedNodes(newExpanded)
    }

    const hasChildren = (code: string) => accounts.some(a => a.parentId === code)

    const handleDelete = async (code: string) => {
        if (!confirm('Bạn có chắc muốn xóa tài khoản này?')) return

        try {
            const res = await fetch(`/api/accounts/${code}`, { method: 'DELETE' })
            if (!res.ok) {
                const data = await res.json()
                alert(data.error || 'Không thể xóa')
                return
            }
            setAccounts(accounts.filter(a => a.code !== code))
            onDelete?.(code)
        } catch (err) {
            alert('Lỗi khi xóa tài khoản')
        }
    }

    const renderTree = (parentId: string | null = null, level = 0): React.ReactNode => {
        const nodes = accounts.filter(a => a.parentId === parentId)
        if (nodes.length === 0) return null

        return nodes.map(account => {
            const isExpanded = expandedNodes.has(account.code)
            const hasChild = hasChildren(account.code)

            return (
                <React.Fragment key={account.code}>
                    <tr className="hover:bg-gray-50 border-b">
                        <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ paddingLeft: `${level * 24 + 16}px` }}>
                            <div className="flex items-center">
                                {hasChild ? (
                                    <button
                                        onClick={() => toggleExpand(account.code)}
                                        className="mr-2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700"
                                    >
                                        {isExpanded ? '▼' : '▶'}
                                    </button>
                                ) : (
                                    <span className="mr-2 w-5"></span>
                                )}
                                <span className="font-medium text-gray-900">{account.code}</span>
                            </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {getAccountName(account)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {account.type}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${account.isPosting ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {account.isPosting ? 'Chi tiết' : 'Tổng hợp'}
                            </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEdit?.(account)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(account.code)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Xóa
                                </button>
                            </div>
                        </td>
                    </tr>
                    {hasChild && isExpanded && renderTree(account.code, level + 1)}
                </React.Fragment>
            )
        })
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số hiệu
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tên tài khoản
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Loại
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tính chất
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {renderTree(null)}
                </tbody>
            </table>
            {accounts.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    Chưa có dữ liệu tài khoản.
                </div>
            )}
        </div>
    )
}
