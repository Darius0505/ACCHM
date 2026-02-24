'use client';

import { useState, useEffect } from 'react';
import EntryForm from '@/components/journal/EntryForm';

export default function ViewJournalEntryPage({ params }: { params: { id: string } }) {
    const [entry, setEntry] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchEntry() {
            try {
                const res = await fetch(`/api/journal-entries/${params.id}`);
                if (!res.ok) throw new Error('Failed to fetch entry');
                const data = await res.json();
                setEntry(data);
            } catch (err) {
                setError('Could not load journal entry');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchEntry();
    }, [params.id]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!entry) return <div className="p-6">Entry not found</div>;

    const mode = entry.status === 'POSTED' || entry.status === 'CANCELLED' ? 'view' : 'edit';
    const title = mode === 'view' ? `View Journal Entry: ${entry.entryNumber}` : 'Edit Journal Entry';

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${entry.status === 'POSTED' ? 'bg-green-100 text-green-800' :
                            entry.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                        }`}>
                        {entry.status}
                    </span>
                </div>
            </div>

            <EntryForm mode={mode} initialData={entry} />
        </div>
    );
}
