'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Command } from 'cmdk';

export interface ComboboxOption {
    value: string;
    label: string;
    code?: string; // Added optional code
    [key: string]: any; // Allow other props
    description?: string;
}

interface ComboboxSelectProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
}

export function ComboboxSelect({
    options,
    value,
    onChange,
    placeholder = 'Chọn...',
    searchPlaceholder = 'Tìm kiếm...',
    emptyMessage = 'Không tìm thấy kết quả',
    disabled = false
}: ComboboxSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                style={{
                    width: '100%',
                    padding: '8px 32px 8px 10px',
                    fontSize: '13px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: disabled ? 'var(--surface-muted)' : 'var(--input-bg)',
                    color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
                    textAlign: 'left',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    position: 'relative'
                }}
            >
                {selectedOption ? selectedOption.label : placeholder}
                <svg
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
                        transition: 'transform 0.2s',
                        width: '16px',
                        height: '16px',
                        color: 'var(--text-muted)'
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    zIndex: 9999,
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    overflow: 'hidden'
                }}>
                    <style>{`
                        [cmdk-root] {
                            background: var(--surface);
                        }
                        [cmdk-input] {
                            width: 100%;
                            padding: 12px 14px;
                            font-size: 13px;
                            border: none;
                            border-bottom: 1px solid var(--border);
                            background: transparent;
                            color: var(--text-primary);
                            outline: none;
                        }
                        [cmdk-input]::placeholder {
                            color: var(--text-muted);
                        }
                        [cmdk-list] {
                            max-height: 250px;
                            overflow-y: auto;
                            padding: 6px;
                        }
                        [cmdk-item] {
                            padding: 10px 12px;
                            font-size: 13px;
                            color: var(--text-primary);
                            border-radius: 6px;
                            cursor: pointer;
                            display: flex;
                            flex-direction: column;
                            gap: 2px;
                        }
                        [cmdk-item][data-selected="true"],
                        [cmdk-item]:hover {
                            background: #EF444411;
                            color: #EF4444;
                        }
                        [cmdk-item][data-selected="true"] .item-desc,
                        [cmdk-item]:hover .item-desc {
                            color: #EF4444;
                            opacity: 0.8;
                        }
                        [cmdk-empty] {
                            padding: 24px;
                            text-align: center;
                            font-size: 13px;
                            color: var(--text-muted);
                        }
                        .item-desc {
                            font-size: 11px;
                            color: var(--text-muted);
                        }
                        .item-check {
                            margin-left: auto;
                        }
                    `}</style>
                    <Command>
                        <Command.Input
                            placeholder={searchPlaceholder}
                            value={search}
                            onValueChange={setSearch}
                            autoFocus
                        />
                        <Command.List>
                            <Command.Empty>{emptyMessage}</Command.Empty>
                            {options.map(option => (
                                <Command.Item
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                        <div style={{ flex: 1 }}>
                                            <div>{option.label}</div>
                                            {option.description && (
                                                <div className="item-desc">{option.description}</div>
                                            )}
                                        </div>
                                        {value === option.value && (
                                            <svg className="item-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                </Command.Item>
                            ))}
                        </Command.List>
                    </Command>
                </div>
            )}
        </div>
    );
}
