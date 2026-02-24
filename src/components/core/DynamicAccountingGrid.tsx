import React, { useMemo } from 'react';
import AccountingGrid, { AccountingGridProps, AccountingGridColumn } from '../accounting/AccountingGrid';

export interface SysGridColumnMetadata {
    field: string;
    headerName: string;
    width?: number;
    flex?: number;
    type: 'text' | 'number' | 'currency' | 'select' | 'account' | 'lookup';
    align?: 'left' | 'center' | 'right';
    orderIndex: number;
    isReadOnly: boolean;
    isRequired: boolean;
    lookupApi?: string;
}

export interface DynamicAccountingGridProps<T extends { id: string }> extends Omit<AccountingGridProps<T>, 'columns'> {
    columnMetadata: SysGridColumnMetadata[];
    lookups?: {
        accounts?: any[];
        subjects?: any[];
        // extendable for other standard lookups
    };
}

export default function DynamicAccountingGrid<T extends { id: string }>({
    columnMetadata,
    lookups,
    ...rest
}: DynamicAccountingGridProps<T>) {

    const columns = useMemo(() => {
        // Sort by orderIndex to ensure correct column order based on metadata
        const sortedMeta = [...columnMetadata].sort((a, b) => a.orderIndex - b.orderIndex);

        return sortedMeta.map(meta => {
            const col: AccountingGridColumn<T> = {
                field: meta.field,
                headerName: meta.headerName,
                width: meta.width,
                flex: meta.flex,
                type: meta.type,
                align: meta.align,
                editable: !meta.isReadOnly,
            };

            // Inject standard lookups into cellEditorParams
            if (meta.type === 'account' && lookups?.accounts) {
                col.cellEditorParams = {
                    ...(col.cellEditorParams || {}),
                    accounts: lookups.accounts
                };
            }

            // Make Currency a dropdown
            if (meta.field === 'currency') {
                col.type = 'select';
                col.cellEditorParams = {
                    values: ['VND', 'USD', 'EUR']
                };
            }

            // Map Object ID to use the combobox editor populated with subjects
            if (meta.field === 'objectId' && lookups?.subjects) {
                // Reuse account editor structure for fast lookup
                col.type = 'subject';

                const mappedSubjects = lookups.subjects.map(s => ({
                    id: s.value,
                    code: s.code,
                    name: s.code ? `${s.code} - ${s.label}` : s.label
                }));

                col.cellEditorParams = {
                    subjects: mappedSubjects
                };

                col.cellRenderer = (params: any) => {
                    if (!params.value) return '';
                    const subj = mappedSubjects.find(s => s.id === params.value);
                    return subj ? subj.name : params.value;
                };
            }

            // Here we can extend logic to assign specific cell editors based on `meta.lookupApi` or `meta.type`
            // if Phase 2 requires it.

            return col;
        });
    }, [columnMetadata, lookups]);

    return <AccountingGrid columns={columns} {...rest} />;
}
