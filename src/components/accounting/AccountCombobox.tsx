
import React, { useState, useEffect, useRef } from 'react';

export interface AccountOption {
    code: string;
    name: string;
}

interface AccountComboboxProps {
    value: string;
    onChange: (value: string) => void;
    accounts: AccountOption[];
    placeholder?: string;
    className?: string; // For passing style overrides
    style?: React.CSSProperties;
}

export default function AccountCombobox({ value, onChange, accounts, placeholder, className, style }: AccountComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    // Sync internal state with external value
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    const filteredAccounts = accounts.filter(acc =>
        acc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm(value);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [wrapperRef, value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { // Allow space/arrow/enter to open
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => Math.min(prev + 1, filteredAccounts.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredAccounts[highlightedIndex]) {
                    selectAccount(filteredAccounts[highlightedIndex]);
                    // Explicitly blur or move focus? For now just close.
                    // inputRef.current?.blur(); 
                }
                break;
            case 'Tab':
                // Allow default tab behavior but select if something is highlighted and valid?
                // Or just let it tab out.
                setIsOpen(false);
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchTerm(value);
                break;
        }
    };

    const selectAccount = (acc: AccountOption) => {
        onChange(acc.code);
        setSearchTerm(acc.code);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                    setHighlightedIndex(0);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                style={{
                    ...style,
                    width: '100%',
                    height: '100%',
                    padding: '0 8px',
                    margin: 0,
                    outline: 'none',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontWeight: 'bold', // Make account code bold
                    color: 'inherit'
                }}
                className={className}
            />

            {isOpen && filteredAccounts.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '400px', // Wider to show full account name comfortably
                    maxHeight: '300px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 9999, // Ensure it's above everything
                    borderRadius: '4px',
                    marginTop: '2px'
                }}>
                    <div style={{
                        padding: '8px',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: 'var(--surface-header)'
                    }}>
                        <span style={{ display: 'inline-block', width: '80px' }}>SỐ TK</span>
                        <span>TÊN TÀI KHOẢN</span>
                    </div>
                    {filteredAccounts.map((acc, index) => (
                        <div
                            key={acc.code}
                            onClick={() => selectAccount(acc)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                backgroundColor: index === highlightedIndex ? 'var(--surface-hover)' : 'transparent',
                                borderBottom: '1px solid var(--border)',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            <span style={{ fontWeight: 700, color: 'var(--primary)', width: '80px', flexShrink: 0 }}>{acc.code}</span>
                            <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{acc.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
