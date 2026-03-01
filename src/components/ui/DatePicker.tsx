'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
    value: string; // YYYY-MM-DD format
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function DatePicker({ value, onChange, placeholder = 'Chọn ngày...', disabled = false }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse value to Date
    const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;

    // Format for display
    useEffect(() => {
        if (selectedDate && isValid(selectedDate)) {
            setInputValue(format(selectedDate, 'dd/MM/yyyy'));
        } else {
            setInputValue('');
        }
    }, [value]);

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

    const handleDaySelect = (day: Date | undefined) => {
        if (day) {
            onChange(format(day, 'yyyy-MM-dd'));
            setIsOpen(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        // Try to parse dd/MM/yyyy
        const parsed = parse(val, 'dd/MM/yyyy', new Date());
        if (isValid(parsed)) {
            onChange(format(parsed, 'yyyy-MM-dd'));
        }
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => !disabled && setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        padding: '8px 32px 8px 10px',
                        fontSize: '13px',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        backgroundColor: disabled ? 'var(--surface-muted)' : 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        cursor: disabled ? 'not-allowed' : 'text'
                    }}
                />
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    style={{
                        position: 'absolute',
                        right: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        padding: '4px',
                        color: 'var(--text-muted)'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                </button>
            </div>


            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    zIndex: 9999,
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    minWidth: '280px'
                }}>
                    <style>{`
                        .rdp {
                            --rdp-cell-size: 36px;
                            --rdp-accent-color: var(--primary);
                            --rdp-background-color: var(--primary-soft);
                            margin: 0;
                            padding: 12px;
                            background: var(--surface) !important;
                        }
                        .rdp-months {
                            background: var(--surface) !important;
                        }
                        .rdp-month {
                            background: var(--surface) !important;
                        }
                        .rdp-month_caption {
                            padding: 0 0 12px 0;
                        }
                        .rdp-caption_label,
                        .rdp-month_caption {
                            font-size: 14px;
                            font-weight: 600;
                            color: var(--text-primary) !important;
                            text-transform: capitalize;
                        }
                        .rdp-button_previous,
                        .rdp-button_next,
                        .rdp-nav button {
                            color: var(--text-secondary) !important;
                            background: transparent !important;
                            border: 1px solid var(--border) !important;
                            border-radius: 4px;
                        }
                        .rdp-button_previous:hover,
                        .rdp-button_next:hover,
                        .rdp-nav button:hover {
                            background: var(--surface-hover) !important;
                        }
                        .rdp-weekday,
                        .rdp-head_cell {
                            font-size: 11px;
                            font-weight: 600;
                            color: var(--text-muted) !important;
                            text-transform: uppercase;
                        }
                        .rdp-day,
                        .rdp-day_button {
                            font-size: 13px;
                            color: var(--text-primary) !important;
                            border-radius: 4px;
                            background: transparent !important;
                        }
                        .rdp-day:hover:not(.rdp-selected) .rdp-day_button,
                        .rdp-day_button:hover {
                            background: var(--surface-hover) !important;
                        }
                        .rdp-selected .rdp-day_button,
                        .rdp-day_selected {
                            background: var(--primary) !important;
                            color: white !important;
                            font-weight: 600;
                        }
                        .rdp-today .rdp-day_button {
                            border: 1px solid var(--primary) !important;
                            font-weight: 600;
                        }
                        .rdp-outside .rdp-day_button,
                        .rdp-day_outside {
                            color: var(--text-muted) !important;
                            opacity: 0.5;
                        }
                        .rdp-chevron {
                            fill: var(--text-secondary) !important;
                        }
                    `}</style>
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDaySelect}
                        locale={vi}
                        showOutsideDays
                        fixedWeeks
                    />
                </div>
            )}
        </div>
    );
}
