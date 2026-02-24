'use client';

/**
 * Entry Lines Component
 * Editable table for journal entry lines
 */

import { useState, useEffect } from 'react';
import AccountSelect from './AccountSelect';

export interface EntryLine {
    id?: string; // For existing lines
    tempId: string; // For keying (stable across edits)
    accountId: string;
    description: string;
    debit: number;
    credit: number;
    partnerId?: string;
}

interface EntryLinesProps {
    lines: EntryLine[];
    onChange: (lines: EntryLine[]) => void;
    readOnly?: boolean;
}

export default function EntryLines({ lines, onChange, readOnly = false }: EntryLinesProps) {

    function updateLine(index: number, field: keyof EntryLine, value: any) {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], [field]: value };

        // Auto-balance logic (optional UX enhancement)
        // If setting debit, clear credit and vice versa
        if (field === 'debit' && value > 0) newLines[index].credit = 0;
        if (field === 'credit' && value > 0) newLines[index].debit = 0;

        onChange(newLines);
    }

    function addLine() {
        onChange([
            ...lines,
            {
                tempId: Math.random().toString(36).substr(2, 9),
                accountId: '',
                description: '',
                debit: 0,
                credit: 0
            }
        ]);
    }

    function removeLine(index: number) {
        if (lines.length <= 2) return; // Min 2 lines
        const newLines = [...lines];
        newLines.splice(index, 1);
        onChange(newLines);
    }

    // Calculate totals
    const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    const difference = totalDebit - totalCredit;
    const isBalanced = Math.abs(difference) < 1;

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-10">#</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-64">Account</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-32">Debit</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-32">Credit</th>
                            {!readOnly && <th className="px-4 py-2 w-10"></th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {lines.map((line, index) => (
                            <tr key={line.tempId}>
                                <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                                <td className="px-4 py-2">
                                    {readOnly ? (
                                        <span className="text-sm">{line.accountId}</span> // TODO: Show code/name if possible
                                    ) : (
                                        <AccountSelect
                                            value={line.accountId}
                                            onChange={(id) => updateLine(index, 'accountId', id)}
                                            error={!line.accountId && lines.length > 0} // visual hint
                                        />
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    {readOnly ? (
                                        <span className="text-sm">{line.description}</span>
                                    ) : (
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                            value={line.description}
                                            onChange={(e) => updateLine(index, 'description', e.target.value)}
                                        />
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    {readOnly ? (
                                        <div className="text-right text-sm">{line.debit ? line.debit.toLocaleString('vi-VN') : ''}</div>
                                    ) : (
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:ring-1 focus:ring-blue-500"
                                            value={line.debit || ''}
                                            onChange={(e) => updateLine(index, 'debit', parseFloat(e.target.value) || 0)}
                                        />
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    {readOnly ? (
                                        <div className="text-right text-sm">{line.credit ? line.credit.toLocaleString('vi-VN') : ''}</div>
                                    ) : (
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:ring-1 focus:ring-blue-500"
                                            value={line.credit || ''}
                                            onChange={(e) => updateLine(index, 'credit', parseFloat(e.target.value) || 0)}
                                        />
                                    )}
                                </td>
                                {!readOnly && (
                                    <td className="px-4 py-2 text-center">
                                        <button
                                            onClick={() => removeLine(index)}
                                            className="text-red-500 hover:text-red-700"
                                            tabIndex={-1}
                                        >
                                            ×
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}

                        {/* Totals Row */}
                        <tr className="bg-gray-50 font-bold">
                            <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                            <td className="px-4 py-2 text-right border-t border-gray-300">
                                {totalDebit.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-4 py-2 text-right border-t border-gray-300">
                                {totalCredit.toLocaleString('vi-VN')}
                            </td>
                            {!readOnly && <td></td>}
                        </tr>

                        {/* Balance Check Row */}
                        {!isBalanced && (
                            <tr className="bg-red-50 text-red-600">
                                <td colSpan={3} className="px-4 py-2 text-right font-medium">Difference:</td>
                                <td colSpan={2} className="px-4 py-2 text-center font-bold">
                                    {Math.abs(difference).toLocaleString('vi-VN')}
                                </td>
                                <td></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {!readOnly && (
                <button
                    type="button"
                    onClick={addLine}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                    + Add Line
                </button>
            )}
        </div>
    );
}
