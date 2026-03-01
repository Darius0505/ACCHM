import EntryForm from '@/components/journal/EntryForm';

export default function CreateJournalEntryPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">New Journal Entry</h1>
            </div>

            <EntryForm mode="create" />
        </div>
    );
}
