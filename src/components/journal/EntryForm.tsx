'use client';

/**
 * Journal Entry Form
 * Shared form logic for creating and editing journal entries
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EntryLines, { EntryLine } from './EntryLines';

interface EntryFormProps {
    initialData?: any;
    mode: 'create' | 'edit' | 'view';
}

export default function EntryForm({ initialData, mode }: EntryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [postingDate, setPostingDate] = useState(initialData?.postingDate ? new Date(initialData.postingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [reference, setReference] = useState(initialData?.reference || '');
    const [description, setDescription] = useState(initialData?.description || '');

    // Initialize lines with at least 2 empty lines if creating
    const [lines, setLines] = useState<EntryLine[]>(
        initialData?.lines?.map((l: any) => ({
            ...l,
            tempId: Math.random().toString(36).substr(2, 9), // add tempId for UI key
            debit: Number(l.debit),
            credit: Number(l.credit)
        })) || [
            { tempId: '1', accountId: '', description: '', debit: 0, credit: 0 },
            { tempId: '2', accountId: '', description: '', debit: 0, credit: 0 }
        ]
    );

    // TODO: Fetch journals to select from
    // default to General Journal for now
    const [journalId, setJournalId] = useState(initialData?.journalId || 'DEFAULT_GJ_ID');

    const isReadOnly = mode === 'view';

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Pre-validation
        const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
        const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 1) {
            setError('Entry is not balanced');
            setLoading(false);
            return;
        }

        try {
            const url = mode === 'create'
                ? '/api/journal-entries'
                : `/api/journal-entries/${initialData.id}`;

            const method = mode === 'create' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    journalId, // hardcoded for now or from select
                    date,
                    postingDate,
                    reference,
                    description,
                    lines: lines.map(({ tempId, ...rest }) => rest) // remove tempId
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save entry');
            }

            router.push('/journal-entries');
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handlePost() {
        if (!initialData?.id) return;
        if (!confirm('Are you sure you want to post this entry? It cannot be edited afterwards.')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/journal-entries/${initialData.id}/post`, {
                method: 'POST'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Header Fields */}
            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Journal</label>
                            {isReadOnly ? (
                                <div className="mt-1 p-2 bg-gray-50 rounded border">{initialData?.journal?.name || 'General Journal'}</div>
                            ) : (
                                <input
                                    type="text"
                                    value="General Journal" // Placeholder
                                    disabled
                                    className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            {isReadOnly ? (
                                <div className="mt-1 p-2 bg-gray-50 rounded border">{description}</div>
                            ) : (
                                <textarea
                                    required
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                {isReadOnly ? (
                                    <div className="mt-1 p-2 bg-gray-50 rounded border">{date}</div>
                                ) : (
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={(e) => {
                                            setDate(e.target.value);
                                            setPostingDate(e.target.value); // Sync by default
                                        }}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Posting Date</label>
                                {isReadOnly ? (
                                    <div className="mt-1 p-2 bg-gray-50 rounded border">{postingDate}</div>
                                ) : (
                                    <input
                                        type="date"
                                        required
                                        value={postingDate}
                                        onChange={(e) => setPostingDate(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Reference</label>
                            {isReadOnly ? (
                                <div className="mt-1 p-2 bg-gray-50 rounded border">{reference || '-'}</div>
                            ) : (
                                <input
                                    type="text"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}
                        </div>

                        {/* Entry Number Display (View Mode) */}
                        {initialData?.entryNumber && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Entry Number</label>
                                <div className="mt-1 p-2 bg-gray-50 rounded border font-mono font-medium">
                                    {initialData.entryNumber}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lines */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Lines</h3>
                <EntryLines lines={lines} onChange={setLines} readOnly={isReadOnly} />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Cancel
                </button>

                {!isReadOnly && (
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Draft'}
                    </button>
                )}

                {mode === 'edit' && initialData?.status === 'DRAFT' && (
                    <button
                        type="button"
                        onClick={handlePost}
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                        Post Entry
                    </button>
                )}
            </div>
        </form>
    );
}
