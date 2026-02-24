'use client';

/**
 * Account Select Component
 * Searchable dropdown for selecting accounts
 */

import { useState, useEffect, useRef } from 'react';

interface Account {
    id: string;
    code: string;
    name: string;
    nameEN?: string;
}

interface AccountSelectProps {
    value: string;
    onChange: (accountId: string) => void;
    error?: boolean;
    companyId?: string;
}

export default function AccountSelect({ value, onChange, error, companyId = 'DEFAULT_COMPANY_ID' }: AccountSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load initial accounts or search
        const timer = setTimeout(() => {
            fetchAccounts(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        // If value changes externally, update selected account
        if (value && (!selectedAccount || selectedAccount.id !== value)) {
            // We might need to fetch the specific account if not in list
            // For now, assume it's loaded or handled by parent
            const found = accounts.find(a => a.id === value);
            if (found) setSelectedAccount(found);
        }
    }, [value, accounts]);

    useEffect(() => {
        // Click outside to close
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function fetchAccounts(searchTerm: string) {
        try {
            const params = new URLSearchParams({
                companyId,
                isPosting: 'true',
                ...(searchTerm && { search: searchTerm })
            });

            const res = await fetch(`/api/accounts?${params}`);
            const data = await res.json();
            setAccounts(data);

            // Update selected reference if found in new list
            if (value) {
                const found = data.find((a: Account) => a.id === value);
                if (found) setSelectedAccount(found);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    }

    return (
        <div className="relative" ref={wrapperRef}>
            <div
                className={`w-full px-3 py-2 border rounded-md bg-white cursor-pointer flex justify-between items-center ${error ? 'border-red-500' : 'border-gray-300'
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedAccount ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedAccount ? `${selectedAccount.code} - ${selectedAccount.name}` : 'Select account...'}
                </span>
                <span className="text-gray-400 text-xs">▼</span>
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 sticky top-0 bg-white border-b">
                        <input
                            type="text"
                            className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Search code or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {accounts.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 text-center">No accounts found</div>
                    ) : (
                        accounts.map((account) => (
                            <div
                                key={account.id}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${value === account.id ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                                    }`}
                                onClick={() => {
                                    onChange(account.id);
                                    setSelectedAccount(account);
                                    setIsOpen(false);
                                }}
                            >
                                <div className="font-medium">{account.code}</div>
                                <div className="text-xs text-gray-500 truncate">{account.name}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
