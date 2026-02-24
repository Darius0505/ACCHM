'use client';

import React, { useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import AccountGridEditor from './AccountGridEditor';
import SubjectGridEditor from './SubjectGridEditor';
import {
    ColDef,
    GridReadyEvent,
    CellEditingStoppedEvent,
    GridApi,
    ModuleRegistry,
    AllCommunityModule,
    themeAlpine
} from 'ag-grid-community';

// Register AG Grid Community modules (required for v31+)
ModuleRegistry.registerModules([AllCommunityModule]);

// AG Grid Community CSS (Removed to fix V35 conflict)
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';

export interface AccountingGridColumn<T = any> {
    field: keyof T | string;
    headerName: string;
    width?: number;
    minWidth?: number;
    flex?: number;
    type?: 'text' | 'number' | 'currency' | 'select' | 'account' | 'subject' | 'lookup';
    align?: 'left' | 'center' | 'right';
    editable?: boolean;
    pinned?: 'left' | 'right' | null;
    filter?: boolean | 'agTextColumnFilter' | 'agNumberColumnFilter' | 'agSetColumnFilter';
    sortable?: boolean;
    cellRenderer?: React.FC<any>;
    cellEditor?: string;
    cellEditorParams?: any;
    valueFormatter?: (params: any) => string;
    valueGetter?: (params: any) => any;
    valueSetter?: (params: any) => boolean;
}

export interface AccountingGridProps<T extends { id: string }> {
    data: T[];
    columns: AccountingGridColumn<T>[];
    onDataChange?: (data: T[]) => void;
    onRowAdd?: () => void;
    onRowDelete?: (index: number) => void;
    height?: string | number;
    showRowNumbers?: boolean;
    showDeleteButton?: boolean;
    stickyHeader?: boolean;
    darkMode?: boolean;
}

// Custom CSS for dark mode styling
const darkModeStyles = `
.ag-theme-alpine-dark-custom {
    --ag-background-color: var(--surface);
    --ag-header-background-color: var(--surface-active);
    --ag-odd-row-background-color: var(--surface);
    --ag-row-hover-color: var(--surface-hover);
    --ag-selected-row-background-color: var(--primary-soft);
    --ag-border-color: var(--border);
    --ag-header-foreground-color: var(--text-primary);
    --ag-foreground-color: var(--text-primary);
    --ag-secondary-foreground-color: var(--text-muted);
    --ag-input-focus-border-color: var(--primary);
    --ag-range-selection-border-color: var(--primary);
    --ag-header-height: 40px;
    --ag-row-height: 44px;
    --ag-font-size: 13px;
    --ag-font-family: inherit;
}

.ag-theme-alpine-dark-custom .ag-header-cell {
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.ag-theme-alpine-dark-custom .ag-cell {
    display: flex;
    align-items: center;
}

.ag-theme-alpine-dark-custom .ag-cell-inline-editing {
    border-color: var(--primary) !important;
}
`;

export function AccountingGrid<T extends { id: string }>({
    data,
    columns,
    onDataChange,
    height = '400px',
    showRowNumbers = true,
    showDeleteButton = true,
    darkMode = true,
}: AccountingGridProps<T>) {
    const gridRef = useRef<AgGridReact<T>>(null);

    // Add dark mode styles to document head
    React.useEffect(() => {
        const styleId = 'ag-grid-dark-custom-styles';
        if (!document.getElementById(styleId)) {
            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = darkModeStyles;
            document.head.appendChild(styleEl);
        }
    }, []);

    // Transform columns to AG Grid format
    const columnDefs = useMemo<ColDef<T>[]>(() => {
        const defs: ColDef<T>[] = [];

        // Row number column
        if (showRowNumbers) {
            defs.push({
                headerName: '#',
                width: 50,
                pinned: 'left',
                lockPosition: true,
                suppressMovable: true,
                sortable: false,
                filter: false,
                editable: false,
                cellStyle: { textAlign: 'center', color: 'var(--text-muted)' },
                valueGetter: (params) => params.node?.rowIndex != null ? params.node.rowIndex + 1 : '',
            });
        }

        // User-defined columns
        columns.forEach((col) => {
            const def: ColDef<T> = {
                field: col.field as any,
                headerName: col.headerName,
                width: col.width,
                minWidth: col.minWidth || 80,
                flex: col.flex,
                editable: col.editable !== false,
                sortable: col.sortable !== false,
                filter: col.filter !== false,
                pinned: col.pinned,
                headerClass: 'ag-header-cell-center',
                cellStyle: {
                    textAlign: col.align || 'left',
                    justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start',
                },
            };

            // Type-specific configuration
            if (col.type === 'number' || col.type === 'currency') {
                def.filter = 'agNumberColumnFilter';
                def.cellStyle = {
                    ...def.cellStyle,
                    textAlign: 'right',
                    justifyContent: 'flex-end',
                    fontWeight: col.type === 'currency' ? 600 : 'normal',
                };
                if (col.type === 'currency') {
                    def.valueFormatter = (params) => {
                        if (params.value == null) return '';
                        return new Intl.NumberFormat('vi-VN').format(params.value);
                    };
                }
            }

            if (col.type === 'select') {
                def.cellEditor = 'agSelectCellEditor';
                def.cellEditorParams = col.cellEditorParams;
            }

            if (col.type === 'account') {
                def.cellEditor = AccountGridEditor;
                def.cellEditorParams = {
                    ...col.cellEditorParams,
                };
            }

            if (col.type === 'subject') {
                def.cellEditor = SubjectGridEditor;
                def.cellEditorParams = {
                    ...col.cellEditorParams,
                };
            }

            // Custom overrides
            if (col.valueFormatter) def.valueFormatter = col.valueFormatter;
            if (col.valueGetter) def.valueGetter = col.valueGetter;
            if (col.valueSetter) def.valueSetter = col.valueSetter;
            if (col.cellRenderer) def.cellRenderer = col.cellRenderer;

            defs.push(def);
        });

        // Delete button column
        if (showDeleteButton) {
            defs.push({
                headerName: '',
                width: 50,
                sortable: false,
                filter: false,
                editable: false,
                pinned: 'right',
                cellRenderer: (params: any) => (
                    <button
                        onClick={() => {
                            const newData = [...data];
                            newData.splice(params.rowIndex, 1);
                            onDataChange?.(newData);
                        }}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: '4px',
                        }}
                        title="Xóa dòng"
                    >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                ),
            });
        }

        return defs;
    }, [columns, showRowNumbers, showDeleteButton, data, onDataChange]);

    // Handle cell editing
    const onCellEditingStopped = useCallback((event: CellEditingStoppedEvent<T>) => {
        if (event.newValue !== event.oldValue && onDataChange) {
            const newData = [...data];
            const field = event.colDef.field as keyof T;
            if (field && event.rowIndex !== undefined && event.rowIndex !== null) {
                // Coerce number/currency column values to actual numbers
                const colConfig = columns.find(c => c.field === field);
                let value = event.newValue;
                if (colConfig && (colConfig.type === 'number' || colConfig.type === 'currency')) {
                    value = Number(value) || 0;
                }
                (newData[event.rowIndex as number] as any)[field] = value;
                onDataChange(newData);
            }
        }
    }, [data, columns, onDataChange]);

    const defaultColDef = useMemo<ColDef>(() => ({
        resizable: true,
        suppressMenu: false,
    }), []);

    return (
        <div style={{ height, width: '100%' }}>
            <AgGridReact<T>
                theme={themeAlpine}
                ref={gridRef}
                rowData={data}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onCellEditingStopped={onCellEditingStopped}
                animateRows={true}
                suppressRowClickSelection={true}
                getRowId={(params) => params.data.id}
                stopEditingWhenCellsLoseFocus={true}
                enterNavigatesVertically={true}
                enterNavigatesVerticallyAfterEdit={true}
            />
        </div>
    );
}

export default AccountingGrid;
