import CashPaymentForm from '@/components/cash/CashPaymentForm';

export default function NewCashPaymentPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tạo Phiếu Chi Mới</h1>
            </div>
            <CashPaymentForm mode="create" />
        </div>
    );
}
