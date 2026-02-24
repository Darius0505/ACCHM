'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { Command } from 'cmdk';

export interface SubjectOption {
    id: string;
    code: string;
    name: string;
}

const PortalDropdown = ({ position, subjects, onSelect, searchTerm, selectedIndex }: any) => {
    // Portal content
    const content = (
        <div
            id="subject-grid-editor-portal"
            style={{
                position: 'absolute',
                top: position.top + 4,
                left: position.left,
                width: Math.max(position.width, 350), // Min width for readability
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            <style>{`
                [cmdk-root] { background: var(--surface); display: flex; flex-direction: column; }
                [cmdk-list] { max-height: 250px; overflow-y: auto; padding: 4px; }
                [cmdk-item] { 
                    padding: 8px 12px; font-size: 13px; color: var(--text-primary); 
                    border-radius: 4px; cursor: pointer; display: flex; gap: 8px;
                    scroll-margin-top: 45px;
                }
                [cmdk-item][data-selected="true"], [cmdk-item]:hover { 
                    background: var(--surface-hover); color: var(--primary); 
                }
                .acc-code { font-weight: 700; width: 60px; flex-shrink: 0; }
                .acc-name { opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            `}</style>
            <Command shouldFilter={false}>
                <Command.List>
                    <Command.Empty style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                        Không tìm thấy đối tượng
                    </Command.Empty>
                    {subjects.map((subj: SubjectOption) => (
                        <Command.Item
                            key={subj.id}
                            value={subj.id}
                            onSelect={() => onSelect(subj.id)}
                        >
                            <span className="acc-code">{subj.code || '...'}</span>
                            <span className="acc-name">{subj.name}</span>
                        </Command.Item>
                    ))}
                </Command.List>
            </Command>
        </div>
    );

    return createPortal(content, document.body);
};


// Refined Editor that wraps Input in Command to connect them?
// Actually, separating Input from List (via Portal) breaks the natural Command context if not careful.
// To fix keyboard nav, we should try to keep them in one Command context if possible, 
// OR proxy keys.
// Since we need Portal for clipping, we can't easily wrap both in one DOM tree in correct position.
// Proxying keys is the standard solution for Portalled Comboboxes.

const SubjectGridEditor = forwardRef((params: any, ref) => {
    const [value, setValueState] = useState(params.value || '');
    const valueRef = useRef(params.value || ''); // Track value synchronously
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const subjects: SubjectOption[] = params.subjects || params.colDef.cellEditorParams?.subjects || [];

    // Helper to update both state and ref
    const setValue = (newValue: string) => {
        setValueState(newValue);
        valueRef.current = newValue;
    };

    // Filter subjects here for the separate list
    const filteredSubjects = subjects.filter(subj =>
        (subj.code && subj.code.toLowerCase().includes(value.toLowerCase())) ||
        subj.name.toLowerCase().includes(value.toLowerCase())
    );

    // Current highlighted index logic
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    useImperativeHandle(ref, () => ({
        getValue: () => valueRef.current,
        isPopup: () => false
    }));

    useLayoutEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom,
                left: rect.left,
                width: rect.width
            });
        }
    }, []);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 10);
    }, []);

    useEffect(() => {
        // Reset highlight on filter change
        setHighlightedIndex(0);
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.min(prev + 1, filteredSubjects.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();

            const selected = filteredSubjects[highlightedIndex];
            // If selected exists, use it. Otherwise use what user typed.
            const codeToSave = selected ? selected.id : value;

            setValue(codeToSave);

            if (params.node && params.column) {
                params.node.setDataValue(params.column.colId, codeToSave);
            }

            // Explicitly pass false to indicate NOT cancelling
            params.stopEditing(false);

        } else if (e.key === 'Tab') {
            e.preventDefault();
            e.stopPropagation();

            const selected = filteredSubjects[highlightedIndex];
            const codeToSave = selected ? selected.id : value;

            setValue(codeToSave);

            if (params.node && params.column) {
                params.node.setDataValue(params.column.colId, codeToSave);
            }

            setTimeout(() => {
                const api = params.api;
                api ? api.stopEditing(false) : params.stopEditing();
                if (!e.shiftKey) {
                    api ? api.tabToNextCell() : null;
                } else {
                    api ? api.tabToPreviousCell() : null;
                }
            }, 0);
        } else if (e.key === 'Escape') {
            params.stopEditing(true);
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const portal = document.getElementById('account-grid-editor-portal');
            if (containerRef.current && !containerRef.current.contains(e.target as Node) && (!portal || !portal.contains(e.target as Node))) {
                params.stopEditing();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [params]);

    const PortalList = () => (
        createPortal(
            <div
                id="account-grid-editor-portal"
                style={{
                    position: 'fixed',
                    top: position.top + 4,
                    left: position.left,
                    width: Math.max(position.width, 350),
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 99999,
                    maxHeight: '250px',
                    overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', padding: '4px'
                }}
            >
                {filteredSubjects.length === 0 ? (
                    <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                        Không tìm thấy đối tượng
                    </div>
                ) : (
                    filteredSubjects.map((acc: any, idx: number) => (
                        <div
                            key={acc.id}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent focus loss
                                e.stopPropagation();
                                setValue(acc.id);
                                // Force update grid data to ensure persistence
                                if (params.node && params.column) {
                                    params.node.setDataValue(params.column.colId, acc.id);
                                }
                                params.stopEditing();
                            }}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            style={{
                                padding: '8px 12px', fontSize: '13px',
                                borderRadius: '4px', cursor: 'pointer', display: 'flex', gap: '8px',
                                backgroundColor: idx === highlightedIndex ? 'var(--surface-hover)' : 'transparent',
                                color: idx === highlightedIndex ? 'var(--primary)' : 'var(--text-primary)'
                            }}
                        >
                            <span style={{ fontWeight: 700, width: '60px', flexShrink: 0 }}>{acc.code}</span>
                            <span style={{ opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{acc.name}</span>
                        </div>
                    ))
                )}
            </div>,
            document.body
        )
    );

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                    width: '100%', height: '100%', border: 'none', outline: 'none',
                    padding: '0 12px', background: 'transparent',
                    fontSize: '13px', fontFamily: 'inherit', fontWeight: 500
                }}
            />
            {<PortalList />}
        </div>
    );
});

SubjectGridEditor.displayName = 'SubjectGridEditor';
export default SubjectGridEditor;
