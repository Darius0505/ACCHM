import BankTransactionForm from '@/components/bank/BankTransactionForm';

export default function NewBankTransactionPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">New Bank Transaction</h1>
            </div>
            <BankTransactionForm mode="create" />
        </div>
    );
}
